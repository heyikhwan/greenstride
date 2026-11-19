import { createHash } from "node:crypto";
import { readColumns, sheetsConfigured, sheetTitles, type SheetRows } from "./google-sheets";
import { redis as redisLive, redisForPages as redis } from "./redis";
import { teamsReady, type EntitySummary, type Member, type PesertaResult, type PesertaStats, type Snapshot, type StatusCode, type Team, type Totals } from "./peserta-shared";

/**
 * Data status peserta untuk halaman /peserta/ dan ringkasan di halaman utama (hanya di server).
 *
 * Dua sumber, keduanya Google Sheet panitia yang di-share ke service account (lihat lib/google-sheets.ts):
 * - Rekap 99VR (PESERTA_99VR_SHEET_ID): satu sheet per entitas, satu baris per orang, kolom Status diisi 99 Virtual Race.
 * - Analisis tim (PESERTA_TIM_SHEET_ID), sheet "Daftar Peserta": tim unik dari formulir (submit terakhir per tim) dengan asal dan unit.
 * Satu rujukan: daftar tim dan anggota hanya dari formulir (Daftar Peserta), jadi jumlahnya sama dengan dashboard panitia. Rekap 99VR hanya mengisi status akun.
 * Keduanya digabung per orang lewat NIK SAP, cadangannya nama + nama tim. Orang yang ada di formulir tapi belum ada di sheet 99VR tetap tampil, berstatus "wait".
 * Orang yang hanya ada di 99VR tidak ditampilkan; data ganda atau yang hilang dirapikan di sheet panitia, bukan di sini.
 * Entitas yang tampil adalah 11 sheet entitas di Rekap 99VR (ENTITY_ORDER); anak perusahaan dan KSO ikut sheet tempat anggotanya tercatat.
 *
 * NIK, email, dan nomor HP tidak pernah masuk ke Snapshot, jadi tidak pernah sampai ke browser.
 * Ketiganya hanya dipakai untuk indeks pencarian di Redis (LOOKUP_KEY): kuncinya hash SHA-256, nilainya id tim dan urutan anggota.
 * app/api/peserta/cari mencocokkan isian pengunjung yang persis sama (findByContact), lalu hanya mengembalikan id tim.
 * Snapshot terakhir yang berhasil disimpan di Redis; bila Google gagal, halaman memakai snapshot itu.
 */

const VR_SHEET_ID = process.env.PESERTA_99VR_SHEET_ID || "1cIYeuXoFhxNbFzlPPefdk5NDlQZ00wNNJ_42Z7khHn8";
const TIM_SHEET_ID = process.env.PESERTA_TIM_SHEET_ID || "1HqkRwXIEVyQmbLTbz26prRmyShubNqmzm3lK0ZiUqoM";
const SNAPSHOT_KEY = "peserta:snapshot:v1";
const LOOKUP_KEY = "peserta:lookup:v1";

/** Sheet di Rekap 99VR yang bukan daftar per entitas: daftar induk dan rekap angka. */
const VR_SKIP = new Set(["PTPN GREENSTRIDE 2026", "Recap Peserta", "List DONE"]);
const VR_HEADERS = ["Nama", "Email", "No Handphone", "Nama Grup", "Entitas", "NIK SAP", "Status", "Feedback", "Keterangan#2", "Alasan Tidak Valid"] as const;
const VR_REQUIRED = ["Nama", "Nama Grup", "Status"] as const;
const TIM_HEADERS = ["Nama Tim", "Entitas", "Asal", "Divisi/Bagian/Unit", "Peran", "Nama", "NIK SAP", "Email", "No HP"] as const;

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

/** Nama entitas resmi di formulir ke sheet entitas Rekap 99VR. Dipakai bila tak satu pun anggota tim tercatat di sheet 99VR. */
const ENTITY_GROUP: Record<string, string> = {
  "PT Perkebunan Nusantara I": "PTPN I",
  "PT Perkebunan Nusantara III": "PTPN III",
  "PT Perkebunan Nusantara IV": "PTPN IV",
  "PT Sinergi Gula Nusantara": "PT SGN",
  "PT Riset Perkebunan Nusantara": "PT RPN",
  "PT Industri Karet Nusantara": "PT IKN",
  "PT Bio Industri Nusantara": "PT BIN",
  "PT Kawasan Industri Nusantara": "KINRA",
  "PT LPP Agro Nusantara": "PT LPP",
  "PT Sri Pamela Medika Nusantara": "PT SPMN",
  "PT Kharisma Pemasaran Bersama Nusantara": "PT KPBN",
};
const GROUP_ENTITY: Record<string, string> = Object.fromEntries(Object.entries(ENTITY_GROUP).map(([e, g]) => [g, e]));
/**
 * Anak perusahaan dan KSO yang timnya belum tercatat di sheet 99VR mana pun. Tim yang sudah tercatat selalu ikut sheet 99VR-nya.
 * KSODSMTU: unitnya PKS Sei Meranti (kode 1PSM, sama dengan unit PTPN IV Regional 1); KSO lain (KSODJABA, KSODATIM) juga ada di sheet PTPN IV.
 * PT Nusalima Medika: RS Tandun, anak perusahaan PalmCo (PTPN IV).
 */
const EXTRA_GROUP: Record<string, string> = { KSODSMTU: "PTPN IV", "PT Nusalima Medika": "PTPN IV" };

/** Kolom Entitas di sheet 99VR berisi campuran entitas dan asal, misalnya "HO PTPN IV" atau "PTPN IV Regional 1". */
function vrPlace(sheet: string, raw: string): { entity: string; origin: string } {
  const own = /^PT\s/i.test(raw) && !/PTPN/i.test(raw) ? entityName(raw) : "";
  const entity = own || GROUP_ENTITY[sheet] || entityName(raw) || sheet;
  const origin = /^HO\b|head office/i.test(raw) ? "Head Office" : (raw.match(/Regional\s*\d+/i)?.[0].replace(/\s+/, " ") ?? "");
  return { entity, origin };
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

type VrRow = { sheet: string; name: string; group: string; entity: string; origin: string; nik: string; keys: string[]; status: StatusCode; checkedAt: string | null; leadInGroup: boolean | null };
type DraftMember = Member & { order: number; matched: boolean; keys: string[]; sheet?: string };
type Draft = Omit<Team, "id" | "members" | "entityShort"> & { members: DraftMember[] };
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
export function buildSnapshot(vrSheets: SheetRows[], timRows: Record<string, string>[], now = new Date()): { snapshot: Snapshot; lookup: Lookup } {
  // Baris 99VR. Baris catatan ("diisi oleh ...") dan baris tanpa nama dilewati; orang yang sama di dua sheet dihitung sekali.
  const vr: VrRow[] = [];
  const seen = new Set<string>();
  for (const sheet of vrSheets) {
    for (const r of sheet.rows) {
      const name = squash(r["Nama"] ?? "");
      const group = squash(r["Nama Grup"] ?? "");
      if (!name || !group || /diisi oleh/i.test(name)) continue;
      const nik = nikKey(r["NIK SAP"] ?? "");
      const id = nik || `${key(name)}|${key(group)}`;
      if (seen.has(id)) continue;
      seen.add(id);
      const place = vrPlace(sheet.title, squash(r["Entitas"] ?? ""));
      vr.push({
        sheet: sheet.title,
        name,
        group,
        ...place,
        nik,
        keys: contactKeys(r["NIK SAP"] ?? "", r["Email"] ?? "", r["No Handphone"] ?? ""),
        status: statusOf(r["Status"] ?? "", r["Alasan Tidak Valid"] ?? ""),
        checkedAt: parseChecked(r["Feedback"] ?? ""),
        leadInGroup: leadNote(r["Keterangan#2"] ?? ""),
      });
    }
  }
  const byNik = new Map<string, VrRow[]>();
  const byName = new Map<string, VrRow>();
  for (const r of vr) {
    if (r.nik) byNik.set(r.nik, [...(byNik.get(r.nik) ?? []), r]);
    byName.set(`${key(r.name)}|${key(r.group)}`, r);
  }
  const used = new Set<VrRow>();
  const find = (nik: string, name: string, team: string) => {
    const tk = key(team);
    const candidates = (nik && byNik.get(nik)) || [];
    const hit = candidates.find((r) => !used.has(r) && key(r.group) === tk) ?? candidates.find((r) => !used.has(r)) ?? byName.get(`${key(name)}|${tk}`);
    return hit && !used.has(hit) ? hit : undefined;
  };

  // Tim dari formulir (sheet Daftar Peserta), urutan anggota: ketua lalu anggota 1, 2, ...
  const drafts = new Map<string, Draft>();
  const draftByGroup = new Map<string, Draft[]>();
  const draftFor = (teamKey: string, init: () => Omit<Draft, "members" | "leadInGroup" | "checkedAt">) => {
    let d = drafts.get(teamKey);
    if (!d) {
      d = { ...init(), members: [], leadInGroup: null, checkedAt: null };
      drafts.set(teamKey, d);
      const g = key(d.name);
      draftByGroup.set(g, [...(draftByGroup.get(g) ?? []), d]);
    }
    return d;
  };
  // Grup 99VR ke tim tempat anggotanya dipasangkan. Dipakai bila nama grup di 99VR adalah nama tim versi submit lama.
  const vrGroupTeams = new Map<string, Map<Draft, number>>();
  const applyVr = (d: Draft, m: DraftMember, r: VrRow) => {
    used.add(r);
    const g = `${r.sheet}|${key(r.group)}`;
    const tally = vrGroupTeams.get(g) ?? vrGroupTeams.set(g, new Map()).get(g)!;
    tally.set(d, (tally.get(d) ?? 0) + 1);
    m.matched = true;
    m.status = r.status;
    m.sheet = r.sheet;
    m.keys.push(...r.keys);
    d.checkedAt = later(d.checkedAt, r.checkedAt);
    if (r.leadInGroup !== null && (m.lead || d.leadInGroup === null)) d.leadInGroup = r.leadInGroup;
  };
  const addMember = (d: Draft, name: string, lead: boolean, order: number, r: VrRow | undefined, keys: string[] = []) => {
    const m: DraftMember = { name, status: "wait", ...(lead ? { lead: true as const } : {}), order, matched: false, keys: [...keys] };
    d.members.push(m);
    if (r) applyVr(d, m, r);
  };

  for (const row of timRows) {
    const name = squash(row["Nama"] ?? "");
    const team = squash(row["Nama Tim"] ?? "");
    if (!name || !team) continue;
    const entity = entityName(row["Entitas"] ?? "");
    const origin = squash(row["Asal"] ?? "");
    const d = draftFor(`${key(team)}|${key(entity)}|${key(origin)}`, () => ({ name: team, entity, origin, unit: squash(row["Divisi/Bagian/Unit"] ?? "") }));
    const role = squash(row["Peran"] ?? "");
    const lead = /ketua/i.test(role);
    const order = lead ? 0 : Number(role.match(/\d+/)?.[0] ?? 9);
    addMember(d, name, lead, order, find(nikKey(row["NIK SAP"] ?? ""), name, team), contactKeys(row["NIK SAP"] ?? "", row["Email"] ?? "", row["No HP"] ?? ""));
  }

  // Orang di sheet 99VR yang belum cocok lewat NIK atau nama persis: salah ketik NIK atau nama, atau nama grup 99VR masih nama tim lama.
  // Hanya dipasangkan ke anggota formulir yang namanya mirip. Baris 99VR tanpa pasangan di formulir tidak ditampilkan:
  // daftar tim dan anggota mengikuti formulir saja, sama dengan dashboard panitia; 99VR hanya mengisi status akun.
  for (const r of vr) {
    if (used.has(r)) continue;
    const same = draftByGroup.get(key(r.group)) ?? [];
    // Nama grup 99VR berbeda dari formulir (mis. "DPMO Think Tank" lalu direvisi jadi "Think Tank"): ikut tim tempat anggota grup yang sama sudah dipasangkan.
    const siblings = [...(vrGroupTeams.get(`${r.sheet}|${key(r.group)}`) ?? [])].sort((a, b) => b[1] - a[1])[0]?.[0];
    const existing = same.find((t) => t.entity === r.entity) ?? (same.length === 1 ? same[0] : undefined) ?? siblings;
    const m = existing?.members.find((x) => !x.matched && similarName(x.name, r.name));
    if (existing && m) applyVr(existing, m, r);
  }

  // Entitas tim = sheet 99VR tempat anggotanya paling banyak tercatat; bila belum ada yang tercatat, dari nama entitas di formulir.
  const groupOf = (d: Draft) => {
    const count = new Map<string, number>();
    for (const m of d.members) if (m.sheet) count.set(m.sheet, (count.get(m.sheet) ?? 0) + 1);
    const top = [...count.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    return top ?? ENTITY_GROUP[d.entity] ?? EXTRA_GROUP[d.entity] ?? d.entity;
  };

  const ids = new Set<string>();
  const lookup: Record<string, string[]> = {};
  const teams: Team[] = [...drafts.values()]
    .map((d) => {
      const group = groupOf(d);
      let id = slug(`${d.name} ${group}`);
      for (let n = 2; ids.has(id); n++) id = slug(`${d.name} ${group} ${n}`);
      ids.add(id);
      const sorted = [...d.members].sort((a, b) => a.order - b.order);
      sorted.forEach((m, i) => {
        for (const k of new Set(m.keys)) (lookup[k] ??= []).push(`${id}:${i}`);
      });
      // Anak perusahaan atau KSO di bawah sheet entitas tetap disebut di keterangan tim.
      // Entitas utama di formulir yang berbeda dari sheet 99VR-nya tidak disebut, agar tidak terbaca seperti dua entitas.
      const sub = d.entity && d.entity !== GROUP_ENTITY[group] && !ENTITY_GROUP[d.entity] ? d.entity.replace(/^PT\s+/, "") : "";
      return {
        id,
        name: d.name,
        entity: group,
        entityShort: group,
        origin: [sub, d.origin].filter(Boolean).join(" · "),
        area: d.origin,
        unit: d.unit,
        leadInGroup: d.leadInGroup,
        checkedAt: d.checkedAt,
        members: sorted.map((m): Member => ({ name: m.name, status: m.status, ...(m.lead ? { lead: true } : {}) })),
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
  const titles = (await sheetTitles(VR_SHEET_ID)).filter((t) => !VR_SKIP.has(t));
  const [vrSheets, [tim]] = await Promise.all([readColumns(VR_SHEET_ID, titles, VR_HEADERS, VR_REQUIRED), readColumns(TIM_SHEET_ID, ["Daftar Peserta"], TIM_HEADERS, ["Nama Tim", "Nama"])]);
  if (!vrSheets.length) throw new Error("Tidak ada sheet entitas yang terbaca di Rekap 99VR");
  if (!tim) throw new Error('Sheet "Daftar Peserta" tidak terbaca');
  const built = buildSnapshot(vrSheets, tim.rows);
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
