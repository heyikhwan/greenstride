"use client";
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { ChatAvatar, Icon } from "./ds";
import { BOT, CHAT_MAX_CHARS, CHAT_MAX_MESSAGES, anchorLabel, linkKind, type ChatMessage } from "@/lib/chat-shared";
import { EVENT } from "@/lib/event";

/* ───────── Asisten chat
   Peluncur di kanan bawah (maskot + balon bicara) membuka panel (lembar layar penuh di ponsel). Pertanyaan dikirim ke app/api/chat,
   jawaban mengalir sebagai teks dan dirender dengan subset markdown aman (tebal, daftar, tautan yang dikenal).
   Halaman lain bisa membuka panel lewat window.dispatchEvent(new CustomEvent("gs-chat:open", { detail: { q } })).

   Perkenalan: sekali per sesi tab, maskot muncul, melompat kecil, dan balonnya "mengetik" agar pengunjung paham ini
   tempat bertanya. data-intro di peluncur: tanpa atribut (belum siap, tersembunyi), "play" (sekitar 3 detik), "done" (diam).
   Dilewati bila prefers-reduced-motion. */

const STORE_KEY = "gs-chat";
const INTRO_KEY = "gs-chat-intro";
const INTRO_DELAY_MS = 1200;
const INTRO_MS = 3300;
const SUGGESTIONS = ["Apa syarat tim jadi finisher?", "Bagaimana cara menghubungkan Strava?", "Apakah harus lari 24 km setiap hari?", "Apa saja hadiahnya?"];
const MOBILE_MQ = "(max-width: 640px)";

type Problem = "upstream" | "rate_limited" | "daily_limit" | "unavailable" | "invalid" | "network";
type Status = "idle" | "waiting" | "streaming";

const PROBLEM_TEXT: Record<Problem, string> = {
  upstream: "Maaf, jawabanku terputus. Coba kirim ulang.",
  network: "Koneksi terputus sebelum jawabanku sampai. Periksa sinyal, lalu kirim ulang.",
  rate_limited: "Pertanyaanmu banyak sekali dalam waktu singkat. Tunggu sekitar 10 menit, lalu tanya lagi.",
  daily_limit: "Aku sudah menjawab sangat banyak pertanyaan hari ini. Cari jawabanmu di FAQ atau hubungi Help Desk dulu, ya.",
  unavailable: `${BOT.name} sedang tidak aktif. Jawaban lengkap tetap ada di FAQ, dan kendala bisa dilaporkan ke Help Desk.`,
  invalid: "Pesan itu tidak bisa kukirim. Coba tulis ulang pertanyaanmu lebih singkat.",
};

export default function Chat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [problem, setProblem] = useState<Problem | null>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const loadedRef = useRef(false);
  const titleId = useId();
  const inputId = useId();
  const busy = status !== "idle";

  // Riwayat percakapan bertahan selama tab terbuka; dibaca saat panel pertama kali dibuka.
  const show = useCallback(() => {
    if (!loadedRef.current) {
      loadedRef.current = true;
      try {
        const saved: unknown = JSON.parse(sessionStorage.getItem(STORE_KEY) ?? "null");
        if (Array.isArray(saved)) setMessages(saved.filter((m): m is ChatMessage => (m?.role === "user" || m?.role === "assistant") && typeof m.content === "string" && m.content !== ""));
      } catch {}
    }
    setOpen(true);
  }, []);
  useEffect(() => {
    if (!loadedRef.current || status !== "idle") return;
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages, status]);

  const close = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => launcherRef.current?.focus());
  }, []);

  // Dibuka dari bagian lain halaman (FAQ tanpa hasil), dengan pertanyaan terisi.
  useEffect(() => {
    const onOpen = (e: Event) => {
      const q = (e as CustomEvent<{ q?: string }>).detail?.q?.trim();
      if (q) setDraft(q.slice(0, CHAT_MAX_CHARS));
      show();
    };
    addEventListener("gs-chat:open", onOpen);
    return () => removeEventListener("gs-chat:open", onOpen);
  }, [show]);

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  // Gulir ke pesan terbaru saat pesan bertambah atau jawaban mengalir.
  useEffect(() => {
    const log = logRef.current;
    if (log && open) log.scrollTop = log.scrollHeight;
  }, [messages, status, problem, open]);

  useEffect(() => () => abortRef.current?.abort(), []);

  // Perkenalan peluncur. Atribut diatur langsung di DOM (bukan state) agar tidak memicu render ulang.
  useEffect(() => {
    const el = launcherRef.current;
    if (!el) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(INTRO_KEY) === "1";
    } catch {}
    if (seen || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.dataset.intro = "done";
      return;
    }
    const timers = [
      setTimeout(() => (el.dataset.intro = "play"), INTRO_DELAY_MS),
      setTimeout(() => {
        el.dataset.intro = "done";
        try {
          sessionStorage.setItem(INTRO_KEY, "1");
        } catch {}
      }, INTRO_DELAY_MS + INTRO_MS),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const ask = async (history: ChatMessage[]) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setProblem(null);
    setStatus("waiting");
    // Jawaban panjang dipotong saat dikirim ulang sebagai riwayat; server menolak riwayat yang terlalu panjang.
    const payload = history.slice(-CHAT_MAX_MESSAGES).map((m) => ({
      role: m.role,
      content: m.role === "assistant" ? m.content.slice(0, CHAT_MAX_CHARS * 4) : m.content,
    }));
    let answer = "";
    try {
      const res = await fetch("/api/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payload }),
        signal: ctrl.signal,
        cache: "no-store",
      });
      if (!res.ok || !res.body) {
        const code = ((await res.json().catch(() => null)) as { error?: string } | null)?.error;
        setProblem(code && code in PROBLEM_TEXT ? (code as Problem) : "upstream");
        setStatus("idle");
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      setMessages([...history, { role: "assistant", content: "" }]);
      setStatus("streaming");
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        if (answer.includes("\u0000")) throw new Error("upstream");
        setMessages([...history, { role: "assistant", content: answer }]);
      }
      if (!answer.trim()) throw new Error("upstream");
      setStatus("idle");
    } catch (err) {
      if (ctrl.signal.aborted) return;
      // Jawaban yang putus di tengah dibuang agar tidak terbaca seperti jawaban lengkap.
      setMessages(history);
      setProblem(err instanceof TypeError ? "network" : "upstream");
      setStatus("idle");
    }
  };

  const send = (text: string) => {
    const q = text.trim().slice(0, CHAT_MAX_CHARS);
    if (!q || busy) return;
    const history: ChatMessage[] = [...messages, { role: "user", content: q }];
    setMessages(history);
    setDraft("");
    void ask(history);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(draft);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send(draft);
    }
  };

  const restart = () => {
    abortRef.current?.abort();
    setMessages([]);
    setProblem(null);
    setStatus("idle");
    setDraft("");
    inputRef.current?.focus();
  };

  const retry = () => {
    if (messages.at(-1)?.role === "user") void ask(messages);
  };

  // Tautan ke bagian halaman: di ponsel panel menutupi halaman, jadi panel ditutup agar tujuannya terlihat.
  const onAnchor = () => {
    if (window.matchMedia(MOBILE_MQ).matches) setOpen(false);
  };

  const canRetry = (problem === "upstream" || problem === "network") && messages.at(-1)?.role === "user";
  const left = CHAT_MAX_CHARS - draft.length;

  return (
    <div className="gs-chat" data-open={open}>
      <button ref={launcherRef} type="button" className="gs-chat__launcher" aria-expanded={open} aria-controls="gs-chat-panel" aria-label={`Tanya ${BOT.name}, ${BOT.role}`} onClick={show}>
        <span className="gs-chat__say" aria-hidden="true">
          <span className="gs-chat__say-dots">
            <i />
            <i />
            <i />
          </span>
          <span className="gs-chat__say-text">Tanya {BOT.name}</span>
        </span>
        <span className="gs-mascot gs-chat__mascot" aria-hidden="true">
          <span className="gs-mascot__fig">
            <img src={BOT.bust} alt="" width={88} height={88} decoding="async" />
          </span>
          <span className="gs-chat__sparks">
            <i />
            <i />
            <i />
          </span>
        </span>
      </button>

      <section
        id="gs-chat-panel"
        className="gs-chat__panel"
        role="dialog"
        aria-labelledby={titleId}
        hidden={!open}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.stopPropagation();
            close();
          }
        }}
      >
        <header className="gs-chat__head gs-on-band">
          <ChatAvatar size={44} />
          <div className="gs-chat__who">
            <h2 id={titleId}>{BOT.name}</h2>
            <p>{BOT.role}</p>
          </div>
          {messages.length > 0 && (
            <button type="button" className="gs-chat__restart" onClick={restart}>
              Mulai ulang
            </button>
          )}
          <button type="button" className="gs-chat__close" onClick={close} aria-label={`Tutup ${BOT.name}`}>
            <Icon name="close" size={20} />
          </button>
        </header>

        <div className="gs-chat__log" ref={logRef} role="log" aria-live="polite" aria-busy={status === "streaming"}>
          <div className="gs-chat__hello">
            <span className="gs-mascot gs-chat__hello-fig" aria-hidden="true">
              <span className="gs-mascot__fig">
                <img src={BOT.bust} alt="" width={78} height={78} decoding="async" />
              </span>
            </span>
            <div className="gs-chat__bubble">
              <span className="gs-chat__sr">{BOT.name}: </span>
              <p>
                Halo, aku {BOT.name}. Tanya apa saja soal {EVENT.name}: aturan lari, aplikasi, jadwal, atau hadiah. Aku jawab dari isi situs ini.
              </p>
            </div>
          </div>
          {messages.length === 0 && !busy && (
            <div className="gs-chat__suggest" role="group" aria-label="Contoh pertanyaan">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="gs-chip gs-chip--quiet"
                  onClick={() => {
                    send(s);
                    // Chip hilang setelah dikirim; fokus pindah ke kolom tanya agar Escape dan Tab tetap di panel.
                    inputRef.current?.focus();
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          {messages.map((m, i) =>
            m.content ? (
              <Bubble key={i} from={m.role}>
                {m.role === "assistant" ? <Answer text={m.content} onAnchor={onAnchor} /> : <p>{m.content}</p>}
              </Bubble>
            ) : null,
          )}
          {status === "waiting" && (
            <Bubble from="assistant">
              <span className="gs-chat__typing" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span className="gs-chat__sr">{BOT.name} sedang menulis jawaban</span>
            </Bubble>
          )}
          {problem && (
            <div className={`gs-chat__problem${problem === "unavailable" ? " gs-chat__problem--off" : ""}`}>
              <Icon name={problem === "unavailable" ? "info" : "alert"} size={20} />
              <div>
                <p>{PROBLEM_TEXT[problem]}</p>
                <div className="gs-chat__problem-actions">
                  {canRetry ? (
                    <button type="button" className="gs-btn gs-btn--secondary gs-btn--sm" onClick={retry}>
                      <span>Kirim ulang</span>
                    </button>
                  ) : (
                    <a className="gs-btn gs-btn--secondary gs-btn--sm" href="#faq" onClick={onAnchor}>
                      <span>Buka FAQ</span>
                    </a>
                  )}
                  <a className="gs-btn gs-btn--ghost gs-btn--sm" href={EVENT.helpdeskUrl} target="_blank" rel="noopener noreferrer">
                    <Icon name="lifebuoy" size={18} />
                    <span>Buka Help Desk</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        <form className="gs-chat__form" onSubmit={onSubmit}>
          <label className="gs-chat__label" htmlFor={inputId}>
            Tulis pertanyaanmu
            {left <= 100 && (
              <span className="gs-chat__count" aria-live="polite">
                Sisa {left} karakter
              </span>
            )}
          </label>
          <div className="gs-chat__field">
            <textarea
              id={inputId}
              ref={inputRef}
              rows={1}
              value={draft}
              maxLength={CHAT_MAX_CHARS}
              placeholder="Misalnya: tim 4 orang boleh?"
              enterKeyHint="send"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <button type="submit" className="gs-chat__send" disabled={!draft.trim() || busy} aria-label="Kirim pertanyaan">
              <Icon name="arrow-right" size={20} />
            </button>
          </div>
          <p className="gs-chat__note">{BOT.name} bisa keliru. Untuk hal penting, cocokkan dengan FAQ atau tanya Help Desk.</p>
        </form>
      </section>
    </div>
  );
}

function Bubble({ from, children }: { from: ChatMessage["role"]; children: ReactNode }) {
  return (
    <div className={`gs-chat__msg gs-chat__msg--${from}`}>
      {from === "assistant" && <ChatAvatar size={28} className="gs-chat__msg-avatar" />}
      <div className="gs-chat__bubble">
        {from === "assistant" ? <span className="gs-chat__sr">{BOT.name}: </span> : <span className="gs-chat__sr">Kamu: </span>}
        {children}
      </div>
    </div>
  );
}

/* ───────── Jawaban: subset markdown aman
   Paragraf, daftar bernomor dan berbutir, **tebal**, [teks](tautan) dan URL polos. Tautan hanya aktif bila dikenal
   (anchor halaman, id FAQ, URL resmi di lib/event.ts); selain itu tampil sebagai teks biasa. Tidak ada HTML mentah. */
const INLINE = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)|(https?:\/\/[^\s)]+[^\s).,;:])/g;

function Inline({ text, onAnchor }: { text: string; onAnchor: () => void }) {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(INLINE)) {
    const at = m.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    if (m[1]) out.push(<strong key={at}>{m[1]}</strong>);
    else {
      const label = m[2] ?? m[4];
      const href = m[3] ?? m[4];
      const kind = linkKind(href);
      if (kind === "anchor")
        out.push(
          <a key={at} href={href} onClick={onAnchor}>
            {anchorLabel(href) ?? label}
          </a>,
        );
      else if (kind === "external")
        out.push(
          <a key={at} href={href} target="_blank" rel="noopener noreferrer">
            {m[4] ? (href === EVENT.helpdeskUrl ? "Help Desk GreenStride" : new URL(href).hostname) : label}
          </a>,
        );
      else if (kind === "file")
        out.push(
          <a key={at} href={href} download>
            {label}
          </a>,
        );
      else out.push(label);
    }
    last = at + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}

function Answer({ text, onAnchor }: { text: string; onAnchor: () => void }) {
  const clean = text.replace(/\s*—\s*/g, ", ");
  const blocks: { kind: "p" | "ol" | "ul"; items: string[] }[] = [];
  for (const raw of clean.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const ol = line.match(/^\d+[.)]\s+(.*)$/);
    const ul = line.match(/^[-*•]\s+(.*)$/);
    const kind = ol ? "ol" : ul ? "ul" : "p";
    const body = ol?.[1] ?? ul?.[1] ?? line.replace(/^#+\s*/, "");
    const prev = blocks.at(-1);
    if (kind !== "p" && prev?.kind === kind) prev.items.push(body);
    else blocks.push({ kind, items: [body] });
  }
  return (
    <>
      {blocks.map((b, i) => {
        if (b.kind === "p")
          return (
            <p key={i}>
              <Inline text={b.items[0]} onAnchor={onAnchor} />
            </p>
          );
        const List = b.kind;
        return (
          <List key={i}>
            {b.items.map((it, j) => (
              <li key={j}>
                <Inline text={it} onAnchor={onAnchor} />
              </li>
            ))}
          </List>
        );
      })}
    </>
  );
}
