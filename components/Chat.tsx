"use client";
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useId, useMemo, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode, type Ref } from "react";
import { ChatAvatar, Icon } from "./ds";
import { BOT, CHAT_MAX_CHARS, CHAT_MAX_MESSAGES, anchorLabel, linkKind, type ChatMessage } from "@/lib/chat-shared";
import { EVENT } from "@/lib/event";
import { FAQ } from "@/lib/faq";

/* ───────── Asisten chat
   Peluncur di kanan bawah (maskot + balon bicara) membuka panel (lembar layar penuh di ponsel). Pertanyaan dikirim ke app/api/chat,
   jawaban mengalir sebagai teks dan dirender dengan subset markdown aman (tebal, daftar, tautan yang dikenal).
   Halaman lain bisa membuka panel lewat window.dispatchEvent(new CustomEvent("gs-chat:open", { detail: { q } })).

   Perkenalan: sekali per sesi tab, maskot muncul, melompat kecil, dan balonnya "mengetik" agar pengunjung paham ini
   tempat bertanya. data-intro di peluncur: tanpa atribut (belum siap, tersembunyi), "play" (sekitar 3 detik), "done" (diam).
   Dilewati bila prefers-reduced-motion.

   Alur: di perangkat sentuh panel dibuka tanpa memunculkan keyboard (fokus ke judul) agar chip contoh terlihat.
   Log mengikuti jawaban sampai pertanyaan tiba di atas log, lalu berhenti agar jawaban panjang dibaca dari awal. Jawaban bisa dihentikan.
   Setelah jawaban, muncul dua pertanyaan lanjutan dari kategori FAQ yang ditautkan jawaban itu. Bila panel ditutup
   saat jawaban masih ditulis, balon peluncur berganti "Jawaban siap". */

const STORE_KEY = "gs-chat";
const INTRO_KEY = "gs-chat-intro";
const INTRO_DELAY_MS = 1200;
const INTRO_MS = 3300;
const SUGGESTIONS = ["Apa syarat tim jadi finisher?", "Bagaimana cara menghubungkan Strava?", "Apakah harus lari 24 km setiap hari?", "Apa saja hadiahnya?"];
const MOBILE_MQ = "(max-width: 640px)";
const TOUCH_MQ = "(pointer: coarse)";
const STOP = "stop";

type Msg = ChatMessage & { stopped?: boolean };
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

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/** Dua pertanyaan lanjutan: FAQ lain dari kategori FAQ pertama yang ditautkan jawaban, atau contoh awal bila tidak ada. */
function followUps(messages: Msg[]): string[] {
  const last = messages.at(-1);
  if (last?.role !== "assistant") return [];
  const asked = new Set(messages.filter((m) => m.role === "user").map((m) => norm(m.content)));
  const linked = [...last.content.matchAll(/\]\(#([a-z0-9-]+)\)/g)].map((m) => FAQ.find((f) => f.id === m[1])).find(Boolean);
  const pool = linked ? FAQ.filter((f) => f.cat === linked.cat && f.id !== linked.id).map((f) => f.q) : SUGGESTIONS;
  return pool.filter((q) => !asked.has(norm(q))).slice(0, 2);
}

export default function Chat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [problem, setProblem] = useState<Problem | null>(null);
  const [unread, setUnread] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const lastAskedRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const loadedRef = useRef(false);
  const openRef = useRef(false);
  const typeOnOpenRef = useRef(false);
  const followRef = useRef(false);
  const titleId = useId();
  const inputId = useId();
  const busy = status !== "idle";

  // Riwayat percakapan bertahan selama tab terbuka; dibaca saat panel pertama kali dibuka.
  // typing: pengguna akan langsung mengetik (dibuka dari FAQ dengan kata pencarian), jadi kolom tanya difokuskan juga di ponsel.
  const show = useCallback((typing = false) => {
    if (!loadedRef.current) {
      loadedRef.current = true;
      try {
        const saved: unknown = JSON.parse(sessionStorage.getItem(STORE_KEY) ?? "null");
        if (Array.isArray(saved)) setMessages(saved.filter((m): m is Msg => (m?.role === "user" || m?.role === "assistant") && typeof m.content === "string" && m.content !== ""));
      } catch {}
    }
    typeOnOpenRef.current = typing;
    setUnread(false);
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

  // Dibuka dari bagian lain halaman (FAQ), dengan pertanyaan terisi.
  useEffect(() => {
    const onOpen = (e: Event) => {
      const q = (e as CustomEvent<{ q?: string }>).detail?.q?.trim();
      if (q) setDraft(q.slice(0, CHAT_MAX_CHARS));
      show(Boolean(q));
    };
    addEventListener("gs-chat:open", onOpen);
    return () => removeEventListener("gs-chat:open", onOpen);
  }, [show]);

  // Fokus saat panel dibuka: desktop ke kolom tanya; perangkat sentuh ke judul agar keyboard tidak menutupi sapaan dan chip.
  useEffect(() => {
    openRef.current = open;
    if (!open) return;
    requestAnimationFrame(() => {
      const log = logRef.current;
      if (log) log.scrollTop = log.scrollHeight;
      if (typeOnOpenRef.current || !matchMedia(TOUCH_MQ).matches) inputRef.current?.focus();
      else titleRef.current?.focus();
    });
  }, [open]);

  // Ponsel: panel mengikuti viewport yang terlihat, jadi header dan kolom tanya tetap tampak saat keyboard muncul (terutama iOS).
  useEffect(() => {
    const vv = window.visualViewport;
    const root = rootRef.current;
    if (!open || !vv || !root || !matchMedia(MOBILE_MQ).matches) return;
    const sync = () => {
      root.style.setProperty("--chat-vh", `${vv.height}px`);
      root.style.setProperty("--chat-top", `${vv.offsetTop}px`);
    };
    sync();
    vv.addEventListener("resize", sync);
    vv.addEventListener("scroll", sync);
    return () => {
      vv.removeEventListener("resize", sync);
      vv.removeEventListener("scroll", sync);
      root.style.removeProperty("--chat-vh");
      root.style.removeProperty("--chat-top");
    };
  }, [open]);

  // Gulir: setelah bertanya, log mengikuti jawaban yang tumbuh sampai pertanyaan itu tiba di atas log, lalu berhenti,
  // jadi jawaban panjang dibaca dari awal. Gulir manual (roda, sentuh, tombol) menghentikan pengikutan.
  useEffect(() => {
    const log = logRef.current;
    const asked = lastAskedRef.current;
    if (!followRef.current || !log || !asked) return;
    const gap = asked.getBoundingClientRect().top - log.getBoundingClientRect().top - 12;
    if (gap <= 0) {
      followRef.current = false;
      return;
    }
    const before = log.scrollTop;
    log.scrollTop = before + gap;
    if (log.scrollTop - before >= gap - 1) followRef.current = false;
  }, [messages, status]);
  // Indikator menunggu, galat, dan chip lanjutan ikut terlihat hanya bila pembaca sudah di dekat dasar log.
  useEffect(() => {
    const log = logRef.current;
    if (log && log.scrollHeight - log.scrollTop - log.clientHeight < 160) log.scrollTop = log.scrollHeight;
  }, [status, problem]);

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

  const ask = async (history: Msg[]) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setProblem(null);
    setStatus("waiting");
    // Jawaban panjang dipotong saat dikirim ulang sebagai riwayat; server menolak riwayat yang terlalu panjang.
    const payload = history.slice(-CHAT_MAX_MESSAGES).map((m) => ({ role: m.role, content: m.role === "assistant" ? m.content.slice(0, CHAT_MAX_CHARS * 4) : m.content }));
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
      if (!openRef.current) setUnread(true);
    } catch (err) {
      if (ctrl.signal.aborted) {
        // Dihentikan pengguna: simpan yang sudah tertulis, atau kembalikan pertanyaannya ke kolom tanya bila belum ada jawaban.
        if (ctrl.signal.reason === STOP) {
          if (answer.trim()) setMessages([...history, { role: "assistant", content: answer, stopped: true }]);
          else {
            setMessages(history.slice(0, -1));
            setDraft(history.at(-1)?.content ?? "");
          }
          setStatus("idle");
        }
        return;
      }
      // Jawaban yang putus di tengah dibuang agar tidak terbaca seperti jawaban lengkap.
      setMessages(history);
      setProblem(err instanceof TypeError ? "network" : "upstream");
      setStatus("idle");
    }
  };

  // Fokus tetap di panel setelah chip yang diketuk hilang; di perangkat sentuh ke judul agar keyboard tidak muncul.
  const keepFocus = () => (matchMedia(TOUCH_MQ).matches ? titleRef.current : inputRef.current)?.focus();

  const send = (text: string) => {
    const q = text.trim().slice(0, CHAT_MAX_CHARS);
    if (!q || busy) return;
    const history: Msg[] = [...messages, { role: "user", content: q }];
    followRef.current = true;
    setMessages(history);
    setDraft("");
    void ask(history);
  };

  const stopFollow = () => {
    followRef.current = false;
  };

  const sendChip = (q: string) => {
    send(q);
    keepFocus();
  };

  const stop = () => {
    abortRef.current?.abort(STOP);
    inputRef.current?.focus();
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
  const next = useMemo(() => (busy || problem ? [] : followUps(messages)), [busy, problem, messages]);
  const lastAsked = messages.findLastIndex((m) => m.role === "user");

  return (
    <div className="gs-chat" data-open={open} ref={rootRef}>
      <button
        ref={launcherRef}
        type="button"
        className="gs-chat__launcher"
        data-unread={unread}
        aria-expanded={open}
        aria-controls="gs-chat-panel"
        aria-label={`Tanya ${BOT.name}, ${BOT.role}${unread ? ", jawaban baru siap" : ""}`}
        onClick={() => show()}
      >
        <span className="gs-chat__say" aria-hidden="true">
          <span className="gs-chat__say-dots">
            <i />
            <i />
            <i />
          </span>
          <span className="gs-chat__say-text">{unread ? "Jawaban siap" : `Tanya ${BOT.name}`}</span>
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
            <h2 id={titleId} ref={titleRef} tabIndex={-1}>
              {BOT.name}
            </h2>
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

        <div
          className="gs-chat__log"
          ref={logRef}
          role="log"
          aria-live="polite"
          aria-busy={status === "streaming"}
          onWheel={stopFollow}
          onTouchMove={stopFollow}
          onKeyDown={(e) => {
            if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(e.key)) stopFollow();
          }}
        >
          <div className="gs-chat__hello">
            <span className="gs-mascot gs-chat__hello-fig" aria-hidden="true">
              <span className="gs-mascot__fig">
                <img src={BOT.bust} alt="" width={78} height={78} decoding="async" />
              </span>
            </span>
            <div className="gs-chat__bubble">
              <span className="gs-chat__sr">{BOT.name}: </span>
              <p>
                Halo, aku {BOT.name}. Tanya apa saja soal {EVENT.name}: aturan lari, aplikasi, jadwal, atau hadiah. Aku menjawab dari isi situs ini dan tidak bisa melihat atau mengubah data pendaftaranmu.
              </p>
            </div>
          </div>
          {messages.length === 0 && !busy && <Chips label="Contoh pertanyaan" items={SUGGESTIONS} onPick={sendChip} />}
          {messages.map((m, i) =>
            m.content ? (
              <Bubble key={i} from={m.role} ref={i === lastAsked ? lastAskedRef : undefined}>
                {m.role === "assistant" ? <Answer text={m.content} onAnchor={onAnchor} /> : <p>{m.content}</p>}
                {m.stopped && <p className="gs-chat__stopped">Dihentikan</p>}
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
              <span className="gs-chat__wait" aria-hidden="true">
                Sebentar, aku cek dulu.
              </span>
              <span className="gs-chat__sr">{BOT.name} sedang menulis jawaban</span>
            </Bubble>
          )}
          {next.length > 0 && <Chips label="Pertanyaan lain" items={next} onPick={sendChip} caption />}
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
            {/* key berbeda: tombol kirim dibuat ulang, bukan tombol berhenti yang berganti type. Bila sama, klik pada tombol berhenti
                ikut mengirim formulir karena state sudah berganti sebelum aksi bawaan klik selesai. */}
            {busy ? (
              <button key="stop" type="button" className="gs-chat__send gs-chat__send--stop" onClick={stop} aria-label="Hentikan jawaban">
                <span className="gs-chat__stop-icon" aria-hidden="true" />
              </button>
            ) : (
              <button key="send" type="submit" className="gs-chat__send" disabled={!draft.trim()} aria-label="Kirim pertanyaan">
                <Icon name="arrow-right" size={20} />
              </button>
            )}
          </div>
          <p className="gs-chat__note">{BOT.name} bisa keliru. Untuk hal penting, cocokkan dengan FAQ atau tanya Help Desk.</p>
        </form>
      </section>
    </div>
  );
}

function Chips({ label, items, onPick, caption = false }: { label: string; items: string[]; onPick: (q: string) => void; caption?: boolean }) {
  const id = useId();
  return (
    <div className="gs-chat__suggest" role="group" aria-label={caption ? undefined : label} aria-labelledby={caption ? id : undefined}>
      {caption && (
        <p className="gs-chat__suggest-label" id={id}>
          {label}
        </p>
      )}
      {items.map((q) => (
        <button key={q} type="button" className="gs-chip gs-chip--quiet" onClick={() => onPick(q)}>
          {q}
        </button>
      ))}
    </div>
  );
}

function Bubble({ from, children, ref }: { from: ChatMessage["role"]; children: ReactNode; ref?: Ref<HTMLDivElement> }) {
  return (
    <div className={`gs-chat__msg gs-chat__msg--${from}`} ref={ref}>
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
