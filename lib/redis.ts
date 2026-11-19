import { Redis } from "@upstash/redis";

/**
 * Klien Upstash Redis bersama (hanya di server): penghitung pengunjung (lib/visits.ts) dan batas pesan chat (lib/chat-limit.ts).
 * Integrasi Upstash di Vercel mengisi KV_REST_API_URL dan KV_REST_API_TOKEN; nama UPSTASH_* juga diterima.
 * Tanpa env var itu nilainya null, dan setiap pemakai harus tetap berjalan tanpanya.
 */
const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis = url && token ? new Redis({ url, token }) : null;

/**
 * Klien yang sama untuk dipakai saat merender halaman ISR (lib/peserta.ts). Klien bawaan Upstash mengirim fetch `cache: "no-store"`,
 * yang membuat Next.js merender halaman di setiap permintaan. Dengan "default" halaman tetap statis dan dibuat ulang sesuai `revalidate`.
 */
export const redisForPages = url && token ? new Redis({ url, token, cache: "default" }) : null;
