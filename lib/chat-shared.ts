import { APPS, DOCUMENTS, EVENT, SOCIALS } from "./event";
import { FAQ } from "./faq";

/** Konstanta asisten chat yang dipakai server (app/api/chat) dan widget (components/Chat.tsx). */

/**
 * Nama dan gambar asisten. Gambar: maskot berseragam GreenStride (visor berlogo GreenStride, lengan berlogo Planters Club),
 * transparan. `profile` untuk foto profil (header, pesan, tombol FAQ): kepala keluar dari atas cakram, kotaknya 1 : 1,25.
 * `bust` untuk peluncur dan sapaan pembuka.
 */
export const BOT = {
  name: "Rani",
  role: "Asisten GreenStride",
  profile: "/img/asisten/rani-profil.webp",
  bust: "/img/asisten/rani-dada.webp",
  /** Versi 180px untuk layar biasa; maskot tampil paling lebar 88px. */
  bustSrcSet: "/img/asisten/rani-dada-180.webp 180w, /img/asisten/rani-dada.webp 320w",
} as const;

/** Batas satu pesan dan panjang riwayat yang dikirim ke server. Server menolak di atas ini. */
export const CHAT_MAX_CHARS = 500;
export const CHAT_MAX_MESSAGES = 12;

export type ChatMessage = { role: "user" | "assistant"; content: string };

/** Bagian halaman yang boleh ditautkan asisten, dengan isinya. `link` adalah label tautan yang selalu dipakai widget untuk bagian itu. */
export const PAGE_SECTIONS = [
  { href: "#tentang", label: "Tentang", link: "Lihat aturan event", about: "jarak minimal tim, batas harian, aktivitas yang dihitung dan tidak, cek pace" },
  { href: "#panduan", label: "Panduan", link: "Lihat panduan aplikasi", about: "lima langkah menyiapkan 99 Virtual Race dan Strava, tautan unduh aplikasi" },
  { href: "/peserta/", label: "Status peserta", link: "Cek status peserta", about: "halaman terpisah: cari nama atau tim, lihat apakah akun 99 Virtual Race tiap anggota sudah terhubung (akun terhubung, belum daftar aplikasi, data perlu diperbaiki, sedang diproses), rekap per entitas" },
  { href: "#batas-harian", label: "Batas 24 km", link: "Lihat batas 24 km", about: "24 km batas harian bukan target, kalkulator porsi km per anggota" },
  { href: "#jadwal", label: "Jadwal", link: "Lihat jadwal", about: "kalender 28 hari dan linimasa tahapan acara" },
  { href: "#hadiah", label: "Penghargaan", link: "Lihat penghargaan", about: "medali, jersey, uang tunai, MVP" },
  { href: "#faq", label: "FAQ", link: "Buka FAQ", about: "semua tanya jawab, bisa dicari" },
  { href: "#unduhan", label: "Unduhan", link: "Lihat unduhan", about: "guidebook dan panduan bergambar dalam PDF" },
] as const;

/** Label tetap untuk tautan ke bagian halaman (label bagian) atau FAQ (pertanyaannya), agar label dari model tidak pernah salah tujuan. */
export const anchorLabel = (href: string) => PAGE_SECTIONS.find((s) => s.href === href)?.link ?? FAQ.find((f) => `#${f.id}` === href)?.q;

/** Tautan yang boleh tampil sebagai link di jawaban: anchor halaman, id FAQ, dan URL resmi di lib/event.ts. Selain itu tampil sebagai teks. */
const ANCHORS = new Set<string>([...PAGE_SECTIONS.map((s) => s.href), ...FAQ.map((f) => `#${f.id}`)]);
const URLS = new Set<string>([EVENT.helpdeskUrl, ...APPS.flatMap((a) => [a.appStore, a.playStore]), ...DOCUMENTS.map((d) => d.href), ...SOCIALS.map((s) => s.href)]);

/** Judul dokumen untuk alamat berkas di DOCUMENTS (dipakai widget untuk merekomendasikan, bukan mengunduh). */
export const documentTitle = (href: string) => DOCUMENTS.find((d) => d.href === href)?.title;

export function linkKind(href: string): "anchor" | "external" | "file" | null {
  if (ANCHORS.has(href)) return "anchor";
  if (!URLS.has(href)) return null;
  return href.startsWith("/") ? "file" : "external";
}
