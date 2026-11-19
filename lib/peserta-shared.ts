/** Tipe dan label status peserta yang dipakai server (lib/peserta.ts) dan browser (components/PesertaBrowser.tsx). */

/**
 * ok: akun 99 Virtual Race terhubung (DONE). app: belum daftar di aplikasi (NOT FOUND).
 * fix: data perlu diperbaiki panitia (DUPLICATE, tanpa email, alasan tidak valid). wait: belum diproses 99VR.
 */
export type StatusCode = "ok" | "app" | "fix" | "wait";
export type Member = { name: string; status: StatusCode; lead?: true };
export type Team = {
  id: string;
  name: string;
  entity: string;
  entityShort: string;
  origin: string;
  unit: string;
  members: Member[];
  /** Ketua sudah (true) atau belum (false) masuk grup WhatsApp panitia; null bila tidak dicatat. */
  leadInGroup: boolean | null;
  /** Waktu pengecekan 99VR terakhir untuk tim ini (ISO), dari kolom Feedback "Last process". */
  checkedAt: string | null;
};
export type Totals = Record<StatusCode, number> & { teams: number; people: number };
export type EntitySummary = { name: string; short: string; teams: number; people: number; ok: number };
export type Snapshot = { updatedAt: string; totals: Totals; entities: EntitySummary[]; teams: Team[] };
export type PesertaResult = { data: Snapshot | null; source: "live" | "cache" | "none" };
/** Angka gabungan tanpa nama orang atau tim, untuk asisten chat (lib/chat-prompt.ts). ready: tim yang semua anggotanya terhubung. */
export type PesertaStats = { updatedAt: string; totals: Totals; ready: number; entities: EntitySummary[] };

/** Urutan tampil: yang perlu tindakan peserta dulu. */
export const STATUS_ORDER: StatusCode[] = ["app", "fix", "wait", "ok"];

/** label: nama status. todo: satu kalimat langkah untuk anggota berstatus ini, tampil di kartu tim yang dibuka. */
export const STATUS: Record<StatusCode, { label: string; icon: string; todo: string }> = {
  ok: { label: "Akun terhubung", icon: "check", todo: "Akun sudah terhubung ke event. Berikutnya hubungkan Strava." },
  app: { label: "Belum daftar aplikasi", icon: "phone", todo: "Daftar di 99 Virtual Race dengan email yang sama dengan formulir pendaftaran tim." },
  fix: { label: "Data perlu diperbaiki", icon: "lifebuoy", todo: "Laporkan ke Help Desk dengan nama lengkap dan nama tim." },
  wait: { label: "Sedang diproses", icon: "clock", todo: "Sudah tercatat di formulir. Pastikan akun dibuat dengan email yang sama, lalu cek lagi nanti." },
};

/** Ringkasan untuk bagian Peserta di halaman utama. Hanya jumlah yang ikut; angka yang belum terhubung tinggal di /peserta/. */
export type PesertaSummary = { teams: number; people: number };

/** Tim yang semua anggotanya sudah terhubung (status ok). Tim kurang dari 5 orang tetap dihitung bila semua anggotanya terhubung. */
export const teamsReady = (teams: Team[]) => teams.filter((t) => t.members.length > 0 && t.members.every((m) => m.status === "ok")).length;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

/** ISO ke "19 Nov, 12.00 WIB". Dihitung manual (UTC+7) agar hasil server dan browser sama persis. */
export function fmtWib(iso: string | null | undefined): string {
  if (!iso) return "";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  const d = new Date(t + 7 * 3600 * 1000);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}, ${hh}.${mm} WIB`;
}

/** Angka dengan pemisah ribuan titik, tanpa Intl agar sama di server dan browser. */
export const num = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
