import { createHash } from "node:crypto";
import { findByContact, queryKeys } from "@/lib/peserta";
import { redis } from "@/lib/redis";

/**
 * Cari tim lewat NIK, email, atau nomor HP yang ditulis lengkap (dipakai components/PesertaBrowser.tsx).
 * Hanya cocok persis, tidak ada pencarian sebagian, jadi daftar NIK atau nomor tidak bisa ditebak dari awalan.
 * Balasan hanya "idTim:urutanAnggota"; NIK, email, dan nomor HP tidak pernah dikirim balik.
 * Dibatasi PER_IP permintaan per WINDOW_SECONDS per IP (hash) agar tidak dipakai menebak data satu per satu.
 */
export const runtime = "nodejs";

const PER_IP = 30;
const WINDOW_SECONDS = 10 * 60;
const NO_STORE = { "Cache-Control": "no-store" };

const hash = (s: string) => createHash("sha256").update(s).digest("hex").slice(0, 32);

async function allowed(ip: string) {
  if (!redis) return true;
  const key = `peserta:cari:${hash(ip)}`;
  const [count] = await redis.multi().incr(key).expire(key, WINDOW_SECONDS, "NX").exec<[number, 0 | 1]>();
  return count <= PER_IP;
}

export async function GET(request: Request) {
  const q = (new URL(request.url).searchParams.get("q") ?? "").slice(0, 80);
  if (!queryKeys(q).length) return Response.json({ matches: [] }, { headers: NO_STORE });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "";
  try {
    if (!(await allowed(ip))) return Response.json({ error: "rate_limited" }, { status: 429, headers: NO_STORE });
    return Response.json({ matches: await findByContact(q) }, { headers: NO_STORE });
  } catch (e) {
    console.error("[peserta/cari]", e instanceof Error ? e.message : e);
    return Response.json({ error: "unavailable" }, { status: 503, headers: NO_STORE });
  }
}
