import { createHash } from "node:crypto";
import { getVisitors, recordVisitor } from "@/lib/visits";

const BOT_UA = /bot|crawl|spider|slurp|preview|headless|lighthouse|facebookexternalhit|curl|wget|python|httpclient/i;
const NO_STORE = { "Cache-Control": "no-store" };

/** Tanggal hari ini di WIB, format YYYY-MM-DD. */
const todayWib = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date());

function reply(visitors: number | null) {
  if (visitors === null) return Response.json({ error: "counter not configured" }, { status: 503, headers: NO_STORE });
  return Response.json({ visitors }, { headers: NO_STORE });
}

export async function GET() {
  try {
    return reply(await getVisitors());
  } catch {
    return Response.json({ error: "counter unavailable" }, { status: 502, headers: NO_STORE });
  }
}

/** Mencatat pengunjung baru. IP tidak disimpan: yang masuk ke Redis hanya hash IP + User-Agent + tanggal. */
export async function POST(request: Request) {
  const ua = request.headers.get("user-agent") ?? "";
  try {
    if (!ua || BOT_UA.test(ua)) return reply(await getVisitors());
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "";
    const day = todayWib();
    const fingerprint = createHash("sha256").update(`${ip}|${ua}|${day}`).digest("hex").slice(0, 32);
    return reply(await recordVisitor(fingerprint, day));
  } catch {
    return Response.json({ error: "counter unavailable" }, { status: 502, headers: NO_STORE });
  }
}
