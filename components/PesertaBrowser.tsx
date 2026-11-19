"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Icon } from "./ds";
import { EVENT } from "@/lib/event";
import { STATUS, STATUS_ORDER, num, type EntitySummary, type StatusCode, type Team } from "@/lib/peserta-shared";

/** Jumlah tim per halaman daftar; tombol di bawah menambah sebanyak ini. */
const PAGE = 20;
/** Hasil pencarian sebanyak ini atau kurang langsung terbuka. */
const AUTO_OPEN = 3;

type Filter = "semua" | "belum" | "terhubung";

/** Isian yang mungkin NIK, email, atau nomor HP: dicari di server (app/api/peserta/cari), harus ditulis lengkap. */
const isContact = (q: string) => q.includes("@") || /\d{4,}/.test(q.replace(/[\s.\-+]/g, ""));
type Contact = { q: string; matches: string[]; error?: "limited" | "fail" };

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s]/gu, " ");

function Hit({ text, words }: { text: string; words: string[] }) {
  const safe = words.filter((w) => w.length > 1).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!safe.length) return <>{text}</>;
  const parts = text.split(new RegExp(`(${safe.join("|")})`, "gi"));
  return <>{parts.map((p, i) => (i % 2 ? <mark key={i} className="gs-mark">{p}</mark> : p))}</>;
}

/** Asal tim (Head Office, Regional 1, ...); tim tanpa asal dikelompokkan sebagai "Lainnya". */
const OTHER = "Lainnya";
const areaOf = (t: Team) => t.area || OTHER;
const slugOf = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
/** Head Office dulu, lalu Regional 1, 2, ... berurutan angka, lalu sisanya menurut abjad; Lainnya paling akhir. */
const areaRank = (a: string) => (a === "Head Office" ? 0 : a === OTHER ? 2 : 1);
const byArea = (a: string, b: string) => areaRank(a) - areaRank(b) || a.localeCompare(b, "id", { numeric: true });

const ready = (t: Team) => t.members.filter((m) => m.status === "ok").length;

/** Satu ruas per anggota, diwarnai menurut status: bahasa yang sama dengan TeamBar di halaman utama. */
function Segments({ team }: { team: Team }) {
  return (
    <span className="pteam__segs" aria-hidden="true">
      {team.members.map((m, i) => (
        <i key={i} className={`pteam__seg pteam__seg--${m.status}`} />
      ))}
    </span>
  );
}

export function StatusPill({ status }: { status: StatusCode }) {
  return (
    <span className={`pstatus pstatus--${status}`}>
      <Icon name={STATUS[status].icon} size={16} strokeWidth={2.4} />
      {STATUS[status].label}
    </span>
  );
}

export default function PesertaBrowser({ teams, entities }: { teams: Team[]; entities: EntitySummary[] }) {
  const [query, setQuery] = useState("");
  const [entity, setEntity] = useState("semua");
  const [area, setArea] = useState("semua");
  const [filter, setFilter] = useState<Filter>("semua");
  const [limit, setLimit] = useState(PAGE);
  const [open, setOpen] = useState<Map<string, boolean>>(() => new Map());
  const inputRef = useRef<HTMLInputElement>(null);

  // Isian dari alamat halaman: ?q= (kata pencarian), ?entitas= (nama singkat entitas), ?asal= (asal dalam entitas), ?status=belum|terhubung.
  // Dibaca saat dibuka, saat tombol kembali/maju, dan saat baris rekap entitas diklik (event "peserta:filter").
  useEffect(() => {
    const byShort = new Map(entities.map((e) => [e.short.toLowerCase(), e.name]));
    const fromUrl = () => {
      const p = new URLSearchParams(location.search);
      setQuery((p.get("q") ?? "").slice(0, 80));
      const ent = byShort.get((p.get("entitas") ?? "").toLowerCase()) ?? "semua";
      setEntity(ent);
      const asal = p.get("asal") ?? "";
      const match = ent === "semua" || !asal ? undefined : teams.find((t) => t.entity === ent && slugOf(areaOf(t)) === asal);
      setArea(match ? areaOf(match) : "semua");
      const st = p.get("status");
      setFilter(st === "belum" || st === "terhubung" ? st : "semua");
      setLimit(PAGE);
      setOpen(new Map());
    };
    const onFilter = (e: Event) => {
      const name = (e as CustomEvent<{ entity: string }>).detail.entity;
      setEntity(entities.some((x) => x.name === name) ? name : "semua");
      setArea("semua");
      setQuery("");
      setLimit(PAGE);
      setOpen(new Map());
    };
    fromUrl();
    addEventListener("popstate", fromUrl);
    addEventListener("peserta:filter", onFilter);
    return () => {
      removeEventListener("popstate", fromUrl);
      removeEventListener("peserta:filter", onFilter);
    };
  }, [entities, teams]);
  // Pilihan disimpan di alamat halaman agar ketua atau koordinator unit bisa membagikan tautannya. Tidak menambah riwayat.
  useEffect(() => {
    const t = setTimeout(() => {
      const url = new URL(location.href);
      const set = (k: string, v: string | null) => (v ? url.searchParams.set(k, v) : url.searchParams.delete(k));
      set("q", query.trim() || null);
      set("entitas", entity === "semua" ? null : (entities.find((e) => e.name === entity)?.short ?? null));
      set("asal", area === "semua" ? null : slugOf(area));
      set("status", filter === "semua" ? null : filter);
      history.replaceState(history.state, "", url);
    }, 400);
    return () => clearTimeout(t);
  }, [query, entity, area, filter, entities]);

  /** Asal di entitas terpilih beserta jumlah timnya. Pilihan asal hanya tampil bila entitasnya punya lebih dari satu asal. */
  const areas = useMemo(() => {
    if (entity === "semua") return [];
    const m = new Map<string, number>();
    for (const t of teams) if (t.entity === entity) m.set(areaOf(t), (m.get(areaOf(t)) ?? 0) + 1);
    return [...m].sort(([a], [b]) => byArea(a, b));
  }, [teams, entity]);
  const inScope = useCallback((t: Team) => (entity === "semua" || t.entity === entity) && (area === "semua" || areaOf(t) === area), [entity, area]);

  const index = useMemo(
    () =>
      teams.map((t) => ({
        team: t,
        head: norm([t.name, t.entityShort, t.entity, t.origin, t.unit].join(" ")),
        names: t.members.map((m) => norm(m.name)),
      })),
    [teams],
  );

  const words = useMemo(() => norm(query).split(/\s+/).filter(Boolean), [query]);
  const searching = words.length > 0;

  // NIK, email, nomor HP: server hanya membalas id tim dan urutan anggota yang cocok persis.
  const contactQ = isContact(query) ? query.trim() : "";
  const [contact, setContact] = useState<Contact>({ q: "", matches: [] });
  useEffect(() => {
    if (!contactQ) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/peserta/cari/?q=${encodeURIComponent(contactQ)}`, { signal: ctrl.signal, cache: "no-store" });
        const body = (await res.json().catch(() => ({}))) as { matches?: string[] };
        setContact({ q: contactQ, matches: res.ok ? (body.matches ?? []) : [], error: res.ok ? undefined : res.status === 429 ? "limited" : "fail" });
      } catch {
        if (!ctrl.signal.aborted) setContact({ q: contactQ, matches: [], error: "fail" });
      }
    }, 450);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [contactQ]);
  const contactPending = Boolean(contactQ) && contact.q !== contactQ;
  const contactError = contactQ && contact.q === contactQ ? contact.error : undefined;
  /** id tim ke urutan anggota yang cocok dengan NIK, email, atau nomor HP. */
  const contactHits = useMemo(() => {
    const m = new Map<string, Set<number>>();
    if (!contactQ || contact.q !== contactQ) return m;
    for (const v of contact.matches) {
      const [id, i] = v.split(":");
      m.set(id, (m.get(id) ?? new Set()).add(Number(i)));
    }
    return m;
  }, [contact, contactQ]);

  const base = useMemo(
    () =>
      index.filter(({ team }) => {
        if (!inScope(team)) return false;
        const all = ready(team) === team.members.length;
        return filter === "semua" || (filter === "terhubung" ? all : !all);
      }),
    [index, inScope, filter],
  );

  const results = useMemo(() => {
    if (!searching) return base.map((r) => r.team);
    const byContact: Team[] = [];
    const byTeam: Team[] = [];
    const byMember: Team[] = [];
    for (const r of base) {
      if (contactHits.has(r.team.id)) {
        byContact.push(r.team);
        continue;
      }
      const text = `${r.head} ${r.names.join(" ")}`;
      if (!words.every((w) => text.includes(w))) continue;
      (words.every((w) => r.head.includes(w)) ? byTeam : byMember).push(r.team);
    }
    // Cocok lewat NIK, email, atau nomor HP paling atas; lalu nama tim; lalu tim yang cocok karena nama anggotanya.
    return [...byContact, ...byTeam, ...byMember];
  }, [base, words, searching, contactHits]);

  const counts = useMemo(() => {
    const all = index.filter(({ team }) => inScope(team));
    const terhubung = all.filter(({ team }) => ready(team) === team.members.length).length;
    return { semua: all.length, terhubung, belum: all.length - terhubung };
  }, [index, inScope]);

  const shown = results.slice(0, limit);
  // Kartu yang dibuka atau ditutup sendiri oleh pengunjung; selain itu ikut aturan buka otomatis.
  const autoOpen = searching && results.length <= AUTO_OPEN;
  const isOpen = (id: string) => open.get(id) ?? autoOpen;
  const toggle = (id: string) => setOpen((prev) => new Map(prev).set(id, !isOpen(id)));

  const reset = () => {
    setLimit(PAGE);
    setOpen(new Map());
  };

  const filters: { id: Filter; label: string }[] = [
    { id: "semua", label: "Semua tim" },
    { id: "belum", label: "Ada yang belum terhubung" },
    { id: "terhubung", label: "Semua anggota terhubung" },
  ];

  return (
    <div className="pfind">
      <div className="pfind__side">
        <h2 className="pfind__title" id="cari-h">
          Cari tim atau nama
        </h2>
        <div className="gs-search">
          <label className="gs-search__label" htmlFor="peserta-q">
            Nama, nama tim, NIK, email, atau nomor HP
          </label>
          <div className="gs-search__field">
            <Icon name="search" size={20} className="gs-search__icon" />
            <input
              id="peserta-q"
              ref={inputRef}
              type="search"
              value={query}
              placeholder="Contoh: runners"
              autoComplete="off"
              enterKeyHint="search"
              onChange={(e) => {
                setQuery(e.target.value);
                reset();
              }}
            />
            {query && (
              <span className="gs-search__end">
                <button
                  type="button"
                  className="gs-search__clear"
                  aria-label="Hapus pencarian"
                  onClick={() => {
                    setQuery("");
                    reset();
                    inputRef.current?.focus();
                  }}
                >
                  <Icon name="close" size={16} />
                </button>
              </span>
            )}
          </div>
        </div>

        <div className="pfind__field">
          <label className="gs-search__label" htmlFor="peserta-entitas">
            Entitas
          </label>
          <div className="pfind__select-wrap">
            <select
              id="peserta-entitas"
              className="pfind__select"
              value={entity}
              onChange={(e) => {
                setEntity(e.target.value);
                setArea("semua");
                reset();
              }}
            >
              <option value="semua">Semua entitas</option>
              {entities.map((e) => (
                <option key={e.name} value={e.name}>
                  {e.short} ({e.teams} tim)
                </option>
              ))}
            </select>
            <Icon name="chevron-down" size={18} />
          </div>
        </div>

        {areas.length > 1 && (
          <div className="pfind__field">
            <label className="gs-search__label" htmlFor="peserta-asal">
              Asal di {entities.find((e) => e.name === entity)?.short ?? entity}
            </label>
            <div className="pfind__select-wrap">
              <select
                id="peserta-asal"
                className="pfind__select"
                value={area}
                onChange={(e) => {
                  setArea(e.target.value);
                  reset();
                }}
              >
                <option value="semua">Semua asal</option>
                {areas.map(([a, n]) => (
                  <option key={a} value={a}>
                    {a} ({n} tim)
                  </option>
                ))}
              </select>
              <Icon name="chevron-down" size={18} />
            </div>
          </div>
        )}

        <div className="pfind__filters" role="group" aria-label="Status akun anggota tim">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              className="gs-chip"
              aria-pressed={filter === f.id}
              onClick={() => {
                setFilter(f.id);
                reset();
              }}
            >
              <span>{f.label}</span>
              <span className="gs-chip__count">{num(counts[f.id])}</span>
            </button>
          ))}
        </div>

      </div>

      <div className="pfind__main">
        <div className="faq-center__bar">
          <h3>{searching ? `Hasil untuk “${query.trim()}”` : filter === "belum" ? "Tim dengan anggota belum terhubung" : filter === "terhubung" ? "Tim yang semua anggotanya terhubung" : "Semua tim"}</h3>
          <p aria-live="polite">{contactPending && !results.length ? "Mencari..." : `${num(results.length)} tim`}</p>
        </div>

        {results.length > 0 ? (
          <div className="pfind__list" key={`${searching ? "cari" : "daftar"}-${entity}-${area}-${filter}`}>
            {shown.map((t, i) => {
              const o = isOpen(t.id);
              const ok = ready(t);
              const todo = STATUS_ORDER.filter((st) => st !== "ok" && t.members.some((m) => m.status === st));
              // Saat mencari nama orang, anggota yang cocok langsung terlihat di kartu yang masih tertutup.
              const hits = contactHits.get(t.id);
              const found = searching && !o ? t.members.filter((m, j) => hits?.has(j) || words.every((w) => norm(m.name).includes(w))) : [];
              const meta = [t.entityShort, t.origin, t.unit].filter(Boolean).join(" · ");
              return (
                <article key={t.id} className={`gs-faq pteam${o ? " gs-faq--open" : ""}`} style={{ "--i": Math.min(i, 6) } as CSSProperties}>
                  <h4 className="pteam__h">
                    <button type="button" className="gs-faq__q pteam__q" aria-expanded={o} aria-controls={`${t.id}-panel`} onClick={() => toggle(t.id)}>
                      <span className="pteam__title">
                        <span className="pteam__name">
                          <Hit text={t.name} words={words} />
                        </span>
                        {meta && <span className="pteam__meta">{meta}</span>}
                        {found.length > 0 && (
                          <span className="pteam__found">
                            {found.slice(0, 3).map((m, j) => (
                              <span key={j}>
                                <span className="pteam__found-name">
                                  <Hit text={m.name} words={words} />
                                </span>
                                <StatusPill status={m.status} />
                              </span>
                            ))}
                          </span>
                        )}
                      </span>
                      <span className="pteam__sum">
                        <Segments team={t} />
                        <span className={`pteam__count${ok === t.members.length ? " pteam__count--all" : ""}`}>
                          {ok}/{t.members.length} terhubung
                        </span>
                      </span>
                      <span className="gs-faq__toggle" aria-hidden="true">
                        <Icon name="chevron-down" size={18} />
                      </span>
                    </button>
                  </h4>
                  <div className="gs-faq__panel" id={`${t.id}-panel`} inert={!o}>
                    <div className="gs-faq__inner">
                      <div className="pteam__body">
                        <ul className="pteam__members">
                          {t.members.map((m, j) => (
                            <li key={j} className={hits?.has(j) ? "pteam__hit" : undefined}>
                              <span className="pteam__who">
                                <Hit text={m.name} words={words} />
                                {m.lead && <small>Ketua</small>}
                              </span>
                              <StatusPill status={m.status} />
                            </li>
                          ))}
                        </ul>
                        {t.members.length < EVENT.teamMax && <p className="pteam__note">Tim ini terdaftar dengan {t.members.length} orang.</p>}
                        {todo.length > 0 && (
                          <div className="pteam__todo">
                            <h5>Yang perlu dilakukan</h5>
                            <ul>
                              {todo.map((st) => (
                                <li key={st}>
                                  <strong>{STATUS[st].label}:</strong> {STATUS[st].todo}
                                </li>
                              ))}
                            </ul>
                            <a className="pteam__help" href="#arti-status">
                              Penjelasan lengkap tiap status
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : contactPending ? (
          <p className="pfind__wait" role="status">
            Mencari NIK, email, atau nomor HP...
          </p>
        ) : (
          <div className="faq-empty">
            <span className="faq-empty__icon">
              <Icon name="search" size={28} />
            </span>
            <h4>{searching ? `Belum ada tim atau nama yang cocok dengan “${query.trim()}”` : "Tidak ada tim untuk pilihan ini"}</h4>
            <p>
              {contactError === "limited"
                ? "Terlalu banyak pencarian NIK, email, atau nomor HP dari jaringan ini. Coba lagi beberapa menit lagi, atau cari dengan nama."
                : contactError === "fail"
                  ? "Pencarian NIK, email, atau nomor HP sedang tidak bisa dipakai. Cari dengan nama atau nama tim dulu."
                  : contactQ
                    ? "NIK, email, dan nomor HP harus ditulis lengkap, sama seperti di formulir pendaftaran. Bisa juga cari dengan nama atau nama tim. Tetap tidak ada? Laporkan ke Help Desk."
                    : "Tulis nama seperti di formulir pendaftaran, coba sebagian nama saja, atau pilih Semua entitas. Namamu tetap tidak ada? Laporkan ke Help Desk."}
            </p>
            <div className="faq-empty__actions">
              <button
                type="button"
                className="gs-btn gs-btn--secondary gs-btn--sm"
                onClick={() => {
                  setQuery("");
                  setEntity("semua");
                  setFilter("semua");
                  reset();
                  inputRef.current?.focus();
                }}
              >
                <span>Tampilkan semua tim</span>
              </button>
              <a className="gs-btn gs-btn--ghost gs-btn--sm" href={EVENT.helpdeskUrl} target="_blank" rel="noopener noreferrer">
                <Icon name="lifebuoy" size={18} />
                <span>Buka Help Desk</span>
              </a>
            </div>
          </div>
        )}

        {results.length > limit && (
          <div className="pfind__more">
            <button type="button" className="gs-btn gs-btn--secondary" onClick={() => setLimit((n) => n + PAGE)}>
              <span>Tampilkan {Math.min(PAGE, results.length - limit)} tim lagi</span>
            </button>
            <p>
              {num(shown.length)} dari {num(results.length)} tim
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
