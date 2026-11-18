import { redis } from "./redis";

/**
 * Pembatas pesan asisten chat di Upstash Redis, untuk menahan biaya OpenAI dan penyalahgunaan.
 * Per perangkat (hash IP + User-Agent, IP tidak disimpan): PER_DEVICE pesan per WINDOW_SECONDS.
 * Seluruh situs: DAILY_TOTAL pesan per hari WIB. Tanpa Redis (dev lokal) semua pesan diizinkan.
 */
const PER_DEVICE = 20;
const WINDOW_SECONDS = 10 * 60;
const DAILY_TOTAL = 5000;

export type LimitResult = "ok" | "device" | "daily";

export async function takeChatQuota(fingerprint: string, day: string): Promise<LimitResult> {
  if (!redis) return "ok";
  const deviceKey = `chat:dev:${fingerprint}`;
  const dayKey = `chat:day:${day}`;
  const [device, total] = await Promise.all([redis.incr(deviceKey), redis.incr(dayKey)]);
  // Kunci baru diberi umur; kunci lama tetap memakai umur yang sudah berjalan.
  await Promise.all([device === 1 ? redis.expire(deviceKey, WINDOW_SECONDS) : null, total === 1 ? redis.expire(dayKey, 2 * 24 * 60 * 60) : null]);
  if (device > PER_DEVICE) return "device";
  if (total > DAILY_TOTAL) return "daily";
  return "ok";
}
