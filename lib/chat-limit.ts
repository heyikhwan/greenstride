import { redis } from "./redis";

/**
 * Pembatas pesan asisten chat di Upstash Redis, untuk menahan biaya OpenAI dan penyalahgunaan.
 * Dicek berjenjang, dan pesan yang ditolak di satu tahap tidak menghitung tahap berikutnya:
 * 1. Per perangkat (hash IP + User-Agent): PER_DEVICE pesan per WINDOW_SECONDS.
 * 2. Per IP (hash IP saja, agar ganti User-Agent tidak membuka kuota baru): PER_IP pesan per WINDOW_SECONDS.
 *    Dibuat longgar karena banyak karyawan bisa keluar lewat satu IP kantor.
 * 3. Seluruh situs: DAILY_TOTAL pesan per hari WIB. Hanya pesan yang lolos 1 dan 2 yang dihitung,
 *    jadi satu perangkat yang sudah ditahan tidak bisa menghabiskan kuota semua orang.
 * IP tidak disimpan, hanya hash-nya. Tanpa Redis (dev lokal) semua pesan diizinkan.
 */
const PER_DEVICE = 20;
const PER_IP = 120;
const WINDOW_SECONDS = 10 * 60;
const DAILY_TOTAL = 5000;
const DAY_TTL_SECONDS = 2 * 24 * 60 * 60;

export type LimitResult = "ok" | "device" | "daily";

/** Naikkan penghitung dan pasang umurnya dalam satu transaksi. NX: umur hanya dipasang bila belum ada, jadi jendela tidak bergeser. */
async function hit(key: string, ttl: number): Promise<number> {
  const [count] = await redis!.multi().incr(key).expire(key, ttl, "NX").exec<[number, 0 | 1]>();
  return count;
}

export async function takeChatQuota(ids: { device: string; ip: string }, day: string): Promise<LimitResult> {
  if (!redis) return "ok";
  if ((await hit(`chat:dev:${ids.device}`, WINDOW_SECONDS)) > PER_DEVICE) return "device";
  if ((await hit(`chat:ip:${ids.ip}`, WINDOW_SECONDS)) > PER_IP) return "device";
  if ((await hit(`chat:day:${day}`, DAY_TTL_SECONDS)) > DAILY_TOTAL) return "daily";
  return "ok";
}
