import { redis } from "./redis";

/**
 * Penghitung pengunjung unik di Upstash Redis (hanya dipakai di server, lewat app/api/visits).
 * Tanpa Redis (lihat lib/redis.ts), semua fungsi mengembalikan null dan VisitCount tidak tampil.
 */

const VISITORS_KEY = "visits:unique";
/** Satu perangkat (hash IP + User-Agent) hanya bisa menambah angka sekali per hari, kuncinya dihapus setelah 2 hari. */
const SEEN_TTL_SECONDS = 2 * 24 * 60 * 60;

export async function getVisitors(): Promise<number | null> {
  if (!redis) return null;
  return Number((await redis.get<number>(VISITORS_KEY)) ?? 0);
}

/** Menambah 1 bila perangkat ini belum tercatat hari ini, lalu mengembalikan jumlah terbaru. */
export async function recordVisitor(fingerprint: string, day: string): Promise<number | null> {
  if (!redis) return null;
  const fresh = await redis.set(`visits:seen:${day}:${fingerprint}`, 1, { nx: true, ex: SEEN_TTL_SECONDS });
  if (fresh) return redis.incr(VISITORS_KEY);
  return getVisitors();
}
