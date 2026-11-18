import { createHash } from "node:crypto";
import OpenAI from "openai";
import { takeChatQuota } from "@/lib/chat-limit";
import { DEFAULT_MODEL, INSTRUCTIONS } from "@/lib/chat-prompt";
import { CHAT_MAX_CHARS, CHAT_MAX_MESSAGES, type ChatMessage } from "@/lib/chat-shared";

export const runtime = "nodejs";

const NO_STORE = { "Cache-Control": "no-store" };
const client = process.env.OPENAI_API_KEY ? new OpenAI() : null;
const MODEL = process.env.OPENAI_MODEL || DEFAULT_MODEL;

/** Tanggal hari ini di WIB, format YYYY-MM-DD. */
const todayWib = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date());

const fail = (error: string, status: number) => Response.json({ error }, { status, headers: NO_STORE });

/** Riwayat dari klien: role hanya user/assistant, isi string tidak kosong, dibatasi panjangnya, pesan terakhir dari user. */
function parseMessages(body: unknown): ChatMessage[] | null {
  const list = (body as { messages?: unknown } | null)?.messages;
  if (!Array.isArray(list) || list.length === 0 || list.length > CHAT_MAX_MESSAGES) return null;
  const out: ChatMessage[] = [];
  for (const m of list) {
    const role = (m as ChatMessage)?.role;
    const content = (m as ChatMessage)?.content;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    const text = content.trim();
    // Jawaban asisten boleh lebih panjang dari pesan pengguna; tetap dibatasi agar riwayat tidak dipakai menyelundupkan teks panjang.
    if (!text || text.length > (role === "user" ? CHAT_MAX_CHARS : CHAT_MAX_CHARS * 4)) return null;
    out.push({ role, content: text });
  }
  return out.at(-1)?.role === "user" ? out : null;
}

export async function POST(request: Request) {
  if (!client) return fail("unavailable", 503);

  let messages: ChatMessage[] | null = null;
  try {
    messages = parseMessages(await request.json());
  } catch {}
  if (!messages) return fail("invalid", 400);

  const ua = request.headers.get("user-agent") ?? "";
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "";
  const day = todayWib();
  const fingerprint = createHash("sha256").update(`${ip}|${ua}|${day}`).digest("hex").slice(0, 32);
  try {
    const quota = await takeChatQuota(fingerprint, day);
    if (quota !== "ok") return fail(quota === "device" ? "rate_limited" : "daily_limit", 429);
  } catch {
    // Redis gagal: lanjut tanpa pembatas daripada mematikan asisten.
  }

  let stream: Awaited<ReturnType<typeof startStream>>;
  try {
    stream = await startStream(messages, fingerprint);
  } catch {
    return fail("upstream", 502);
  }

  // Teks jawaban dialirkan apa adanya. Bila putus di tengah, klien menerima penanda \u0000 lalu menampilkan pesan gagal.
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "response.output_text.delta") controller.enqueue(encoder.encode(event.delta));
          else if (event.type === "error" || event.type === "response.failed") throw new Error("upstream");
        }
      } catch {
        controller.enqueue(encoder.encode("\u0000"));
      } finally {
        controller.close();
      }
    },
    cancel() {
      stream.controller.abort();
    },
  });
  return new Response(body, { headers: { ...NO_STORE, "Content-Type": "text/plain; charset=utf-8", "X-Content-Type-Options": "nosniff" } });
}

function startStream(messages: ChatMessage[], fingerprint: string) {
  return client!.responses.create({
    model: MODEL,
    instructions: INSTRUCTIONS,
    input: messages.map((m) => ({ role: m.role, content: m.content })),
    stream: true,
    store: false,
    max_output_tokens: 1200,
    reasoning: { effort: "low" },
    text: { verbosity: "low" },
    prompt_cache_key: "greenstride-chat",
    safety_identifier: fingerprint,
  });
}
