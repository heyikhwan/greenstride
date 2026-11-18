"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Callout, ChatAvatar, Icon } from "./ds";
import { BOT } from "@/lib/chat-shared";
import { FAQ, FAQ_CATEGORIES, type FaqCategoryId } from "@/lib/faq";
import { EVENT } from "@/lib/event";

const QUICK = ["24 km", "Strava", "Submit", "PKWT", "Pace", "Medali"];

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^\w\s:,.]/g, " ");

const INDEX = FAQ.map((item) => ({
  item,
  text: norm([item.q, ...item.a, ...(item.list ?? []), item.note ?? "", item.tags ?? ""].join(" ")),
}));

function Hit({ text, words }: { text: string; words: string[] }) {
  const safe = words.filter((w) => w.length > 1).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!safe.length) return <>{text}</>;
  const parts = text.split(new RegExp(`(${safe.join("|")})`, "gi"));
  return <>{parts.map((p, i) => (i % 2 ? <mark key={i} className="gs-mark">{p}</mark> : p))}</>;
}

export default function Faq() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<FaqCategoryId | "semua">("umum");
  const [open, setOpen] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const words = useMemo(() => norm(query).split(/\s+/).filter(Boolean), [query]);
  const searching = words.length > 0;
  const results = useMemo(
    () =>
      searching
        ? INDEX.filter(({ text }) => words.every((w) => text.includes(w))).map((r) => r.item)
        : cat === "semua"
          ? FAQ
          : FAQ.filter((f) => f.cat === cat),
    [words, searching, cat],
  );
  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const f of FAQ) m[f.cat] = (m[f.cat] ?? 0) + 1;
    return m;
  }, []);

  // Tautan #id membuka jawabannya; tombol "/" memfokuskan pencarian.
  useEffect(() => {
    const fromHash = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      const item = FAQ.find((f) => f.id === id);
      if (!item) return;
      setQuery("");
      setCat(item.cat);
      setOpen(id);
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "center" }));
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      e.preventDefault();
      inputRef.current?.focus();
      inputRef.current?.scrollIntoView({ block: "center" });
    };
    fromHash();
    addEventListener("hashchange", fromHash);
    addEventListener("keydown", onKey);
    return () => {
      removeEventListener("hashchange", fromHash);
      removeEventListener("keydown", onKey);
    };
  }, []);

  const heading = searching
    ? `Hasil untuk “${query.trim()}”`
    : cat === "semua"
      ? "Semua pertanyaan"
      : FAQ_CATEGORIES.find((c) => c.id === cat)?.label;

  return (
    <div className="faq-center">
      <aside className="faq-center__side">
        <div className="gs-search">
          <div className="gs-search__field">
            <Icon name="search" size={20} className="gs-search__icon" />
            <input
              id="faq-q"
              ref={inputRef}
              type="search"
              value={query}
              placeholder="Strava, pace, medali..."
              autoComplete="off"
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(null);
              }}
            />
            <span className="gs-search__end">
              {query ? (
                <button type="button" className="gs-search__clear" aria-label="Hapus pencarian" onClick={() => setQuery("")}>
                  <Icon name="close" size={16} />
                </button>
              ) : (
                <kbd className="gs-search__kbd" aria-hidden="true">
                  /
                </kbd>
              )}
            </span>
          </div>
        </div>

        <div className="faq-center__topics" role="group" aria-label="Topik">
          {[...FAQ_CATEGORIES, { id: "semua" as const, label: "Semua", icon: "document" }].map((c) => (
            <button
              key={c.id}
              type="button"
              className="gs-chip"
              aria-pressed={!searching && cat === c.id}
              onClick={() => {
                setCat(c.id);
                setQuery("");
                setOpen(null);
              }}
            >
              <Icon name={c.icon} size={18} />
              <span>{c.label}</span>
              <span className="gs-chip__count">{c.id === "semua" ? FAQ.length : counts[c.id]}</span>
            </button>
          ))}
        </div>

        <div className="faq-center__quick" role="group" aria-label="Sering dicari">
          {QUICK.map((k) => (
            <button key={k} type="button" className="gs-chip gs-chip--quiet" onClick={() => setQuery(k)}>
              {k}
            </button>
          ))}
        </div>

        <div className="faq-center__ask">
          <ChatAvatar size={36} />
          <p>Tidak ketemu? Tanya {BOT.name} dengan kalimatmu sendiri.</p>
          <button type="button" className="gs-btn gs-btn--secondary gs-btn--sm" onClick={() => window.dispatchEvent(new CustomEvent("gs-chat:open", { detail: { q: query } }))}>
            <span>Tanya {BOT.name}</span>
          </button>
        </div>
      </aside>

      <div className="faq-center__main">
        <div className="faq-center__bar">
          <h3>{heading}</h3>
          <p aria-live="polite">{results.length} pertanyaan</p>
        </div>

        {/* Dipasang ulang saat topik berganti atau pencarian dimulai, jadi daftar baru masuk berurutan dan terlihat sudah berganti. Mengetik tidak memasang ulang. */}
        <div className="faq-center__list" key={searching ? "cari" : cat}>
        {results.map((f, i) => {
          const isOpen = open === f.id || (searching && results.length <= 2);
          return (
            <div key={f.id} id={f.id} className={`gs-faq${isOpen ? " gs-faq--open" : ""}`} style={{ "--i": Math.min(i, 6) } as CSSProperties}>
              <button
                type="button"
                className="gs-faq__q"
                aria-expanded={isOpen}
                aria-controls={`${f.id}-panel`}
                onClick={() => setOpen(isOpen ? null : f.id)}
              >
                <span>
                  <Hit text={f.q} words={words} />
                </span>
                <span className="gs-faq__toggle" aria-hidden="true">
                  <Icon name="chevron-down" size={18} />
                </span>
              </button>
              <div className="gs-faq__panel" id={`${f.id}-panel`} inert={!isOpen}>
                <div className="gs-faq__inner">
                  <div className="gs-faq__body">
                    {f.a.map((p, i) => (
                      <p key={i}>
                        <Hit text={p} words={words} />
                      </p>
                    ))}
                    {f.list && (
                      <ul>
                        {f.list.map((li) => (
                          <li key={li}>
                            <Hit text={li} words={words} />
                          </li>
                        ))}
                      </ul>
                    )}
                    {f.note && (
                      <Callout tone="attention" title="Perlu diperhatikan">
                        {f.note}
                      </Callout>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        </div>

        {results.length === 0 && (
          <div className="faq-empty">
            <span className="faq-empty__icon">
              <Icon name="search" size={28} />
            </span>
            <h4>Belum ada jawaban untuk “{query.trim()}”</h4>
            <p>Coba kata yang lebih pendek, tanyakan ke {BOT.name} dengan kalimatmu sendiri, atau hubungi Help Desk.</p>
            <div className="faq-empty__actions">
              <button
                type="button"
                className="gs-btn gs-btn--primary gs-btn--sm"
                onClick={() => window.dispatchEvent(new CustomEvent("gs-chat:open", { detail: { q: query } }))}
              >
                <ChatAvatar size={22} className="gs-avatar--inline" />
                <span>Tanya {BOT.name}</span>
              </button>
              <button
                type="button"
                className="gs-btn gs-btn--secondary gs-btn--sm"
                onClick={() => {
                  setQuery("");
                  setCat("semua");
                  inputRef.current?.focus();
                }}
              >
                <span>Lihat semua pertanyaan</span>
              </button>
              <a className="gs-btn gs-btn--ghost gs-btn--sm" href={EVENT.helpdeskUrl} target="_blank" rel="noopener noreferrer">
                <Icon name="lifebuoy" size={18} />
                <span>Buka Help Desk</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
