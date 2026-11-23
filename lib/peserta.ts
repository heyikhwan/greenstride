import { createHash } from "node:crypto";
import { readColumns, sheetsConfigured, sheetTitles, type SheetRows } from "./google-sheets";
import { redis as redisLive, redisForPages as redis } from "./redis";
import { teamsReady, type EntitySummary, type Member, type PesertaResult, type PesertaStats, type Snapshot, type StatusCode, type Team, type Totals } from "./peserta-shared";

/**
 * Data status peserta untuk halaman /peserta/ dan ringkasan di halaman utama (hanya di server).
 *
 * Satu sumber: spreadsheet Rekap 99VR panitia (PESERTA_SHEET_ID), di-share ke service account (lihat lib/google-sheets.ts).
 * Yang dibaca adalah sheet per entitas (PTPN III, PTPN IV, ...): satu baris per orang, kolom Status diisi 99 Virtual Race.
 * Sheet induk "PTPN GREENSTRIDE 2026" tidak dibaca: isinya data mentah tanpa Status dan belum memuat semua peserta.
 * Tim = Nama Grup di satu sheet entitas. Baris satu tim boleh terpisah (pengganti ditambahkan di bawah), tetap digabung.
 *
 * Pola perubahan yang dicatat panitia di sheet:
 * - Cancel: Status berisi "CANCEL" (CANCEL, CANCELED, cancelled). Baris tidak dihitung dan tidak masuk indeks pencarian.
 * - Pindah tim: baris lama diberi Status CANCELED dan catatan "Pindah Tim ke X", baris baru di tim X dengan catatan "Pindah Tim dari Y".
 *   Catatan "Pindah Tim ke" saja (tanpa CANCEL) juga dianggap baris lama. Bila keduanya masih aktif, baris yang lebih bawah dipakai.
 * - Pengganti: baris baru di tim yang sama ("Pengganti Kamal"); selama Status kosong anggota itu berstatus "wait".
 * - Ganti nama tim: Nama Grup sudah ditulis dengan nama baru, catatan "Pergantian nama tim" tidak perlu diproses.
 * Warna sel dan coretan tidak dipakai: tidak konsisten (ada baris DONE yang berwarna merah atau dicoret).
 *
 * Ketua tim: baris dengan catatan Keterangan kedua berisi "Ketua" (mis. "Ketua Telah masuk grup WAG"), atau baris pertama tim.
 *
 * NIK, email, dan nomor HP tidak pernah masuk ke Snapshot, jadi tidak pernah sampai ke browser.
 * Ketiganya hanya dipakai untuk indeks pencarian di Redis (LOOKUP_KEY): kuncinya hash SHA-256, nilainya id tim dan urutan anggota.
 * app/api/peserta/cari mencocokkan isian pengunjung yang persis sama (findByContact), lalu hanya mengembalikan id tim.
 * Snapshot terakhir yang berhasil disimpan di Redis; bila Google gagal, halaman memakai snapshot itu.
 */

const SHEET_ID = process.env.PESERTA_SHEET_ID || process.env.PESERTA_99VR_SHEET_ID || "1cIYeuXoFhxNbFzlPPefdk5NDlQZ00wNNJ_42Z7khHn8";
const SNAPSHOT_KEY = "peserta:snapshot:v1";
const LOOKUP_KEY = "peserta:lookup:v1";

/** Sheet yang bukan daftar per entitas: daftar induk dan rekap angka. Sheet lain tanpa kolom wajib (mis. "Sheet38") ikut terlewati. */
const SKIP = new Set(["PTPN GREENSTRIDE 2026", "Recap Peserta", "List DONE"]);
const HEADERS = ["Nama", "Email", "No Handphone", "Nama Grup", "Entitas", "NIK SAP", "Status", "Feedback", "Keterangan", "Keterangan#2", "Alasan Tidak Valid", "UNIT KERJA SAP"] as const;
const REQUIRED = ["Nama", "Nama Grup", "Status"] as const;

/** Entitas yang ditampilkan: sheet entitas di Rekap 99VR, dengan urutan yang sama. */
export const ENTITY_ORDER = ["PTPN III", "PTPN IV", "PTPN I", "PT SGN", "PT RPN", "PT IKN", "PT BIN", "KINRA", "PT LPP", "PT SPMN", "PT KPBN"] as const;

/* ───────── Normalisasi */

const squash = (s: string) => s.replace(/\s+/g, " ").trim();
const key = (s: string) => squash(s).toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N} ]/gu, "").replace(/ /g, "");
const nikKey = (s: string) => {
  const k = s.toUpperCase().replace(/\s+/g, "");
  // Isian seperti "PKWT", "-", atau kosong tidak bisa dipakai sebagai kunci.
  return /\d{4,}/.test(k) ? k : "";
};

/** Nama entitas resmi: "(Persero)" dibuang agar variasi penulisan bergabung. */
const entityName = (s: string) => squash(s.replace(/\(\s*persero\s*\)/gi, ""));

/** Nama resmi entitas utama per sheet. Isian kolom Entitas yang sama dengan ini bukan anak perusahaan. */
const SHEET_ENTITY: Record<string, string> = {
  "PTPN I": "PT Perkebunan Nusantara I",
  "PTPN III": "PT Perkebunan Nusantara III",
  "PTPN IV": "PT Perkebunan Nusantara IV",
  "PT SGN": "PT Sinergi Gula Nusantara",
  "PT RPN": "PT Riset Perkebunan Nusantara",
  "PT IKN": "PT Industri Karet Nusantara",
  "PT BIN": "PT Bio Industri Nusantara",
  KINRA: "PT Kawasan Industri Nusantara",
  "PT LPP": "PT LPP Agro Nusantara",
  "PT SPMN": "PT Sri Pamela Medika Nusantara",
  "PT KPBN": "PT Kharisma Pemasaran Bersama Nusantara",
};

const ROMAN: Record<string, number> = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8 };

/**
 * Kolom Entitas berisi campuran entitas dan asal: "HO PTPN IV", "PTPN IV Regional 1", "Pabrik Gula", "KSO Tebu", "PT Agro Sinergi Nusantara".
 * area: kelompok asal untuk filter (Head Office, Regional N, Pabrik Gula, KSO, Anak Perusahaan). sub: nama anak perusahaan atau KSO.
 */
function placeOf(sheet: string, raw: string): { area: string; sub: string } {
  const s = entityName(raw);
  const reg = s.match(/Regional\s*(\d+|[IVX]+)\b/i);
  if (reg) return { area: `Regional ${ROMAN[reg[1].toUpperCase()] ?? reg[1]}`, sub: /^KSO/i.test(s) ? s.replace(/\s*-?\s*Regional.*$/i, "") : "" };
  if (/^HO\b|head office/i.test(s)) return { area: "Head Office", sub: "" };
  if (/pabrik gula/i.test(s)) return { area: "Pabrik Gula", sub: "" };
  if (/^KSO/i.test(s)) return { area: "KSO", sub: /^KSO$/i.test(s) ? "" : s };
  if (/^PT\s/i.test(s) && !/PTPN|Perkebunan Nusantara/i.test(s) && s.toLowerCase() !== (SHEET_ENTITY[sheet] ?? "").toLowerCase()) return { area: "Anak Perusahaan", sub: s };
  return { area: "", sub: "" };
}

/* ───────── Indeks pencarian NIK, email, nomor HP (hanya di server) */

const emailKey = (s: string) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim()) ? s.trim().toLowerCase() : "");
/** Nomor HP tanpa awalan 0, 62, atau +62, hanya angka. Minimal 9 digit agar tidak tertukar dengan NIK. */
const phoneKey = (s: string) => {
  const d = s.replace(/\D/g, "").replace(/^(62|0)+/, "");
  return d.length >= 9 && d.length <= 13 ? d : "";
};
const hashKey = (kind: "n" | "e" | "p", v: string) => createHash("sha256").update(`${kind}:${v}`).digest("hex").slice(0, 24);

/** Kunci hash untuk satu orang dari isian NIK, email, dan nomor HP di sheet. */
function contactKeys(nik: string, email: string, phone: string): string[] {
  const out: string[] = [];
  const n = nikKey(nik);
  const e = emailKey(email);
  const p = phoneKey(phone);
  if (n) out.push(hashKey("n", n));
  if (e) out.push(hashKey("e", e));
  if (p) out.push(hashKey("p", p));
  return out;
}

/** Kunci hash yang mungkin untuk isian pengunjung: email, NIK, atau nomor HP. Kosong bila isian tidak berbentuk salah satunya. */
export function queryKeys(q: string): string[] {
  const t = q.trim();
  if (t.includes("@")) {
    const e = emailKey(t);
    return e ? [hashKey("e", e)] : [];
  }
  const out: string[] = [];
  const n = nikKey(t);
  if (n) out.push(hashKey("n", n));
  const p = phoneKey(t);
  if (p) out.push(hashKey("p", p));
  return out;
}

export function statusOf(status: string, reason: string): StatusCode {
  const s = status.toUpperCase();
  if (s.startsWith("DONE")) return "ok";
  if (reason || s.includes("DUPLICATE") || s.includes("TIDAK ADA EMAIL")) return "fix";
  if (s.includes("NOT FOUND")) return "app";
  return s ? "fix" : "wait";
}

/** Baris yang sudah tidak berlaku: dibatalkan, atau orangnya pindah ke tim lain. */
export const removedRow = (status: string, notes: string) => /cancel/i.test(status) || /pindah\s+(tim\s+|grup\s+)?ke\b/i.test(notes);

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** "Last process: 19Nov26, 12:00" (WIB) ke ISO. */
export function parseChecked(feedback: string): string | null {
  const m = feedback.match(/(\d{1,2})\s*([A-Za-z]{3})\s*(\d{2,4}),?\s*(\d{1,2})[:.](\d{2})/);
  if (!m) return null;
  const month = MONTHS.indexOf(m[2].toLowerCase());
  if (month < 0) return null;
  const year = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
  return new Date(Date.UTC(year, month, Number(m[1]), Number(m[4]) - 7, Number(m[5]))).toISOString();
}

const leadNote = (note: string): boolean | null => (/belum/i.test(note) ? false : /telah|sudah/i.test(note) ? true : null);

/* ───────── Penggabungan */

type Row = { sheet: string; name: string; group: string; place: string; nik: string; keys: string[]; status: StatusCode; checkedAt: string | null; note: string; unit: string };
/** Indeks pencarian: kunci hash ke daftar "idTim:urutanAnggota" dipisah koma. */
export type Lookup = Record<string, string>;

const later = (a: string | null, b: string | null) => (!a ? b : !b ? a : a > b ? a : b);

/** Gelar dan singkatan yang tidak membedakan orang. */
const TITLES = new Set(["st", "se", "sp", "sh", "mm", "mt", "msi", "skom", "ssi", "spd", "ir", "dr", "drs", "amd", "mba", "msc", "ak", "spt", "stp", "sm", "mh"]);
const nameTokens = (s: string) =>
  squash(s)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L} ]/gu, " ")
    .split(" ")
    .filter((w) => w.length > 2 && !TITLES.has(w));

/** Dua penulisan nama yang kemungkinan orang yang sama: satu memuat yang lain, atau berbagi minimal dua kata. */
function similarName(a: string, b: string) {
  const ka = nameTokens(a).join("");
  const kb = nameTokens(b).join("");
  if (!ka || !kb) return false;
  if (ka.includes(kb) || kb.includes(ka)) return true;
  const ta = new Set(nameTokens(a));
  return nameTokens(b).filter((w) => ta.has(w)).length >= 2;
}

/** Isian yang paling sering muncul, selain kosong dan #N/A. */
function mostCommon(values: string[]): string {
  const count = new Map<string, number>();
  for (const v of values) if (v && !/^#N\/?A$/i.test(v)) count.set(v, (count.get(v) ?? 0) + 1);
  return [...count.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
}

function slug(s: string) {
  return (
    s
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "tim"
  );
}

/** Bagian murni (tanpa jaringan), dipakai juga untuk uji dengan salinan data. */
export function buildSnapshot(sheets: SheetRows[], now = new Date()): { snapshot: Snapshot; lookup: Lookup } {
  // Baris aktif. Baris catatan ("diisi oleh ..."), tanpa nama atau tim, dibatalkan, atau pindah ke tim lain dilewati.
  const rows: (Row | null)[] = [];
  const byNik = new Map<string, number[]>();
  const byName = new Map<string, number>();
  for (const sheet of sheets) {
    for (const r of sheet.rows) {
      const name = squash(r["Nama"] ?? "");
      const group = squash(r["Nama Grup"] ?? "");
      if (!name || !group || /diisi oleh/i.test(name)) continue;
      const notes = [r["Keterangan"], r["Keterangan#2"], r["Alasan Tidak Valid"]].join(" ");
      if (removedRow(r["Status"] ?? "", notes)) continue;
      const nik = nikKey(r["NIK SAP"] ?? "");
      const row: Row = {
        sheet: sheet.title,
        name,
        group,
        place: squash(r["Entitas"] ?? ""),
        nik,
        keys: contactKeys(r["NIK SAP"] ?? "", r["Email"] ?? "", r["No Handphone"] ?? ""),
        status: statusOf(r["Status"] ?? "", r["Alasan Tidak Valid"] ?? ""),
        checkedAt: parseChecked(r["Feedback"] ?? ""),
        note: squash(r["Keterangan#2"] ?? ""),
        unit: squash(r["UNIT KERJA SAP"] ?? ""),
      };
      // Orang yang sama tercatat dua kali (NIK sama dan nama mirip, atau nama dan tim sama): baris yang lebih bawah lebih baru.
      // NIK sama dengan nama berbeda adalah salah ketik NIK, keduanya tetap dihitung.
      const sameName = `${sheet.title}|${key(name)}|${key(group)}`;
      const prev = [...(nik ? (byNik.get(nik) ?? []) : []), byName.get(sameName) ?? -1].find((i) => i >= 0 && rows[i] && similarName(rows[i]!.name, name));
      if (prev !== undefined) rows[prev] = null;
      const i = rows.push(row) - 1;
      if (nik) byNik.set(nik, [...(byNik.get(nik) ?? []), i]);
      byName.set(sameName, i);
    }
  }

  // Tim = Nama Grup per sheet entitas, anggota menurut urutan baris.
  const groups = new Map<string, Row[]>();
  for (const r of rows) {
    if (!r) continue;
    const g = `${r.sheet}|${key(r.group)}`;
    groups.set(g, [...(groups.get(g) ?? []), r]);
  }

  const ids = new Set<string>();
  const lookup: Record<string, string[]> = {};
  const teams: Team[] = [...groups.values()]
    .map((members) => {
      const { sheet, group: name } = members[0];
      const lead = members.find((m) => /ketua/i.test(m.note)) ?? members[0];
      const sorted = [lead, ...members.filter((m) => m !== lead)];
      let id = slug(`${name} ${sheet}`);
      for (let n = 2; ids.has(id); n++) id = slug(`${name} ${sheet} ${n}`);
      ids.add(id);
      sorted.forEach((m, i) => {
        for (const k of new Set(m.keys)) (lookup[k] ??= []).push(`${id}:${i}`);
      });
      const { area, sub } = placeOf(sheet, mostCommon(members.map((m) => m.place)));
      const leadInGroup = leadNote(lead.note) ?? members.map((m) => leadNote(m.note)).find((v) => v !== null) ?? null;
      return {
        id,
        name,
        entity: sheet,
        entityShort: sheet,
        // Anak perusahaan atau KSO di bawah sheet entitas tetap disebut; label kelompoknya tidak diulang.
        origin: sub ? (area === "Anak Perusahaan" || area === "KSO" ? sub : `${sub} · ${area}`).replace(/^PT\s+/, "") : area,
        area,
        unit: mostCommon(members.map((m) => m.unit)),
        leadInGroup,
        checkedAt: members.reduce<string | null>((a, m) => later(a, m.checkedAt), null),
        members: sorted.map((m): Member => ({ name: m.name, status: m.status, ...(m === lead ? { lead: true } : {}) })),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "id", { sensitivity: "base" }));

  const totals: Totals = { teams: teams.length, people: 0, ok: 0, app: 0, fix: 0, wait: 0 };
  const ent = new Map<string, EntitySummary>();
  for (const t of teams) {
    const e = ent.get(t.entity) ?? { name: t.entity, short: t.entity, teams: 0, people: 0, ok: 0 };
    e.teams++;
    for (const m of t.members) {
      totals.people++;
      totals[m.status]++;
      e.people++;
      if (m.status === "ok") e.ok++;
    }
    ent.set(t.entity, e);
  }
  const rank = (name: string) => {
    const i = (ENTITY_ORDER as readonly string[]).indexOf(name);
    return i < 0 ? ENTITY_ORDER.length : i;
  };
  const entities = [...ent.values()].sort((a, b) => rank(a.name) - rank(b.name) || a.name.localeCompare(b.name, "id"));

  return {
    snapshot: { updatedAt: now.toISOString(), totals, entities, teams },
    lookup: Object.fromEntries(Object.entries(lookup).map(([k, v]) => [k, v.join(",")])),
  };
}

/* ───────── Pemuatan */

async function fetchLive(): Promise<{ snapshot: Snapshot; lookup: Lookup }> {
  const titles = (await sheetTitles(SHEET_ID)).filter((t) => !SKIP.has(t));
  const sheets = await readColumns(SHEET_ID, titles, HEADERS, REQUIRED);
  if (!sheets.length) throw new Error("Tidak ada sheet entitas yang terbaca di Rekap 99VR");
  const built = buildSnapshot(sheets);
  if (!built.snapshot.teams.length) throw new Error("Data peserta kosong");
  return built;
}

async function readCache(): Promise<Snapshot | null> {
  if (!redis) return null;
  try {
    return await redis.get<Snapshot>(SNAPSHOT_KEY);
  } catch {
    return null;
  }
}

/** Data terbaru dari Google bila bisa, snapshot terakhir dari Redis bila tidak, atau null. Tidak pernah melempar galat, jadi build tidak gagal karena sheet. */
export async function getPeserta(): Promise<PesertaResult> {
  // Pratinjau lokal tanpa service account (tidak berlaku di Vercel): PESERTA_FIXTURE berisi path berkas JSON berbentuk Snapshot,
  // PESERTA_FIXTURE_SOURCE=cache untuk melihat tampilan data cadangan. Jangan simpan berkas berisi nama asli di repo.
  if (process.env.PESERTA_FIXTURE && !process.env.VERCEL) {
    const { readFile } = await import("node:fs/promises");
    const data = JSON.parse(await readFile(process.env.PESERTA_FIXTURE, "utf8")) as Snapshot;
    return { data, source: process.env.PESERTA_FIXTURE_SOURCE === "cache" ? "cache" : "live" };
  }
  if (sheetsConfigured()) {
    try {
      const { snapshot: data, lookup } = await fetchLive();
      if (redis) {
        // Indeks ditulis ke kunci sementara lalu diganti sekaligus, jadi pencarian tidak pernah membaca indeks setengah jadi.
        const tmp = `${LOOKUP_KEY}:tmp`;
        await redis
          .multi()
          .set(SNAPSHOT_KEY, data)
          .del(tmp)
          .hset(tmp, Object.keys(lookup).length ? lookup : { _: "" })
          .rename(tmp, LOOKUP_KEY)
          .exec()
          .catch((e: unknown) => console.error("[peserta] gagal menyimpan ke Redis:", e instanceof Error ? e.message : e));
      }
      return { data, source: "live" };
    } catch (e) {
      console.error("[peserta] gagal membaca Google Sheets:", e instanceof Error ? e.message : e);
    }
  }
  const cached = await readCache();
  return cached ? { data: cached, source: "cache" } : { data: null, source: "none" };
}

const statsOf = (s: Snapshot): PesertaStats => ({ updatedAt: s.updatedAt, totals: s.totals, ready: teamsReady(s.teams), entities: s.entities });

/* ───────── Asisten chat */

const CHAT_TTL = 5 * 60_000;
let chatCache: { at: number; data: Snapshot } | null = null;

/**
 * Snapshot terakhir di Redis (yang sama dengan halaman /peserta/), disimpan di memori instance paling lama 5 menit supaya chat
 * tidak membaca seluruh daftar tim di setiap pesan. Klien Redis biasa (tanpa cache Next.js) karena dipanggil dari route API.
 */
async function chatSnapshot(): Promise<Snapshot | null> {
  if (process.env.PESERTA_FIXTURE && !process.env.VERCEL) return (await getPeserta()).data;
  if (chatCache && Date.now() - chatCache.at < CHAT_TTL) return chatCache.data;
  if (!redisLive) return null;
  try {
    const data = await redisLive.get<Snapshot>(SNAPSHOT_KEY);
    if (data) chatCache = { at: Date.now(), data };
    return data ?? chatCache?.data ?? null;
  } catch {
    return chatCache?.data ?? null;
  }
}

const normText = (s: string) =>
  ` ${s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()} `;

/** Tim yang namanya ditulis utuh di teks (tanpa beda huruf besar dan tanda baca), paling banyak 3, nama terpanjang dulu. */
function teamsIn(teams: Team[], text: string): Team[] {
  const t = normText(text);
  const hits = teams.map((team) => ({ team, key: normText(team.name) })).filter(({ key }) => key.trim().length >= 3 && t.includes(key));
  hits.sort((a, b) => b.key.length - a.key.length);
  // "Solid" tidak ikut bila yang ditulis "1GS2 Solid" dan tim itu juga ada.
  const kept = hits.filter((h, i) => !hits.slice(0, i).some((longer) => longer.key !== h.key && longer.key.includes(h.key)));
  return kept.slice(0, 3).map((h) => h.team);
}

export type ChatPeserta = { stats: PesertaStats; teams: Team[] };

/**
 * Data peserta untuk satu pesan chat: angka gabungan, ditambah tim yang namanya disebut di pesan terakhir pengguna
 * (atau pesan sebelumnya, untuk pertanyaan lanjutan seperti "siapa yang belum?"). Isinya sama dengan yang tampil di /peserta/;
 * email, nomor HP, dan NIK tidak pernah ikut. Null bila data belum ada. Tidak pernah melempar galat.
 */
export async function pesertaForChat(userTexts: string[]): Promise<ChatPeserta | null> {
  const data = await chatSnapshot();
  if (!data) return null;
  let teams: Team[] = [];
  for (const text of userTexts.slice(-3).reverse()) {
    teams = teamsIn(data.teams, text);
    if (teams.length) break;
  }
  return { stats: statsOf(data), teams };
}

/**
 * Cari tim lewat NIK, email, atau nomor HP yang ditulis lengkap. Mengembalikan "idTim:urutanAnggota" saja, tidak pernah data kontak.
 * Memakai klien Redis biasa (tanpa cache Next.js) karena dipanggil dari route API per permintaan.
 */
export async function findByContact(q: string): Promise<string[]> {
  const keys = queryKeys(q);
  if (!keys.length || !redisLive) return [];
  const values = await redisLive.hmget<Record<string, string>>(LOOKUP_KEY, ...keys);
  if (!values) return [];
  return [...new Set(Object.values(values).flatMap((v) => (v ? String(v).split(",") : [])))];
}
