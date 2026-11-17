"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { Callout, Icon } from "./ds";
import { APP_STEPS, EVENT, SCHEDULE } from "@/lib/event";

/* ───────── jam bersama: satu interval untuk semua komponen yang membaca waktu */
let subs: (() => void)[] = [];
let timer: ReturnType<typeof setInterval> | null = null;
function subscribe(fn: () => void) {
  subs.push(fn);
  if (!timer) timer = setInterval(() => subs.forEach((f) => f()), 1000);
  return () => {
    subs = subs.filter((f) => f !== fn);
    if (!subs.length && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}
const nowSecond = () => Math.floor(Date.now() / 1000) * 1000;
/** Waktu sekarang per detik; 0 saat prerender agar HTML statis tetap stabil. */
export function useNow() {
  return useSyncExternalStore(subscribe, nowSecond, () => 0);
}

const pad = (n: number) => String(n).padStart(2, "0");

export function Countdown() {
  const now = useNow();
  const start = Date.parse(EVENT.raceStart);
  const end = Date.parse(EVENT.raceEnd);
  let status = "Periode lomba";
  let target: number | null = null;
  if (now && now < start) {
    status = "Lomba dimulai dalam";
    target = start;
  } else if (now && now <= end) {
    status = "Lomba berlangsung, sisa waktu";
    target = end;
  } else if (now) status = "Lomba sudah selesai";
  const left = target ? Math.max(0, target - now) : 0;
  const units: [number, string][] = [
    [Math.floor(left / 864e5), "Hari"],
    [Math.floor(left / 36e5) % 24, "Jam"],
    [Math.floor(left / 6e4) % 60, "Menit"],
    [Math.floor(left / 1e3) % 60, "Detik"],
  ];
  return (
    <div className="gs-countdown" role="timer" aria-live="off">
      <span className="gs-countdown__status">
        <span className="gs-countdown__dot" aria-hidden="true" />
        {status}
      </span>
      <div className="gs-countdown__units" aria-hidden={!target}>
        {units.map(([v, cap], i) => (
          <div key={cap} className="gs-countdown__unit">
            <span className="gs-countdown__num">{target ? (i === 0 ? v : pad(v)) : "–"}</span>
            <span className="gs-countdown__cap">{cap}</span>
          </div>
        ))}
      </div>
      <div className="gs-countdown__range">
        <strong>{EVENT.raceRangeLabel}</strong> · {EVENT.raceDays} hari
      </div>
    </div>
  );
}

const fmt = (n: number) => n.toLocaleString("id-ID", { maximumFractionDigits: 1 });

export function KmSplitter() {
  const [n, setN] = useState(5);
  const per = EVENT.teamTargetKm / n;
  const perDay = Math.round((per / EVENT.raceDays) * 10) / 10;
  return (
    <div className="gs-split">
      <p className="gs-split__q" id="split-q">
        Berapa orang di timmu?
      </p>
      <div className="gs-seg" role="group" aria-labelledby="split-q">
        {[5, 4, 3, 2].map((o) => (
          <button key={o} type="button" aria-pressed={o === n} onClick={() => setN(o)}>
            {o} orang
          </button>
        ))}
      </div>
      <div className="gs-split__out" aria-live="polite">
        <div>
          <div className="gs-split__num">
            {fmt(per)}
            <small>km</small>
          </div>
          <div className="gs-split__cap">per orang selama {EVENT.raceDays} hari</div>
        </div>
        <div>
          <div className="gs-split__num">
            {fmt(perDay)}
            <small>km</small>
          </div>
          <div className="gs-split__cap">rata-rata per orang per hari</div>
        </div>
      </div>
      <div className="gs-split__meter">
        <div className="gs-split__track" role="img" aria-label={`Rata-rata ${fmt(perDay)} km dari batas ${EVENT.dailyMaxKm} km per hari`}>
          <span className="gs-split__fill" style={{ width: `${Math.min(100, (perDay / EVENT.dailyMaxKm) * 100)}%` }} />
        </div>
        <div className="gs-split__scale">
          <span>0 km</span>
          <span>Batas harian {EVENT.dailyMaxKm} km</span>
        </div>
      </div>
      <Callout tone="info" title="Syarat finisher">
        Total tim minimal {EVENT.teamTargetKm} km dan setiap anggota minimal {EVENT.memberMinKm} km.
      </Callout>
    </div>
  );
}

export function AppSteps() {
  const [active, setActive] = useState(0);
  const onKey = (e: KeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const next = (active + (e.key === "ArrowDown" ? 1 : APP_STEPS.length - 1)) % APP_STEPS.length;
    setActive(next);
    document.getElementById(`step-${next}`)?.focus();
  };
  return (
    <div className="gs-steps">
      <ol className="gs-steps__list" role="tablist" aria-orientation="vertical" onKeyDown={onKey}>
        {APP_STEPS.map((st, i) => (
          <li key={st.title}>
            <button
              id={`step-${i}`}
              type="button"
              role="tab"
              className="gs-step"
              aria-selected={i === active}
              aria-controls="step-panel"
              tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)}
            >
              <span className="gs-step__num">{i + 1}</span>
              <span>
                <h3 className="gs-step__title">{st.title}</h3>
                <p className="gs-step__body">{st.body}</p>
              </span>
              <span className="gs-step__bar" aria-hidden="true">
                <i key={active} />
              </span>
            </button>
          </li>
        ))}
      </ol>
      <div className="gs-phone" role="tabpanel" id="step-panel" aria-labelledby={`step-${active}`}>
        <div className="gs-phone__screen">
          {APP_STEPS.map((st, i) => (
            <img key={st.image} src={st.image} alt={i === active ? st.alt : ""} className={i === active ? "is-on" : undefined} width={600} height={1298} loading="lazy" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function Schedule() {
  const now = useNow();
  const raw = SCHEDULE.map((s): "done" | "now" | "next" | "tba" => {
    if (!s.from && !s.to) return "tba";
    if (!now) return "next";
    if (now > (s.to ? Date.parse(s.to) : Infinity)) return "done";
    return now >= (s.from ? Date.parse(s.from) : -Infinity) ? "now" : "next";
  });
  // Hanya tahap pertama yang sedang berjalan yang ditandai "Sekarang".
  const firstNow = raw.indexOf("now");
  const statuses = raw.map((st, i) => (st === "now" && i !== firstNow ? "next" : st));
  return (
    <ol className="gs-schedule">
      {SCHEDULE.map((s, i) => {
        const status = statuses[i];
        return (
          <li key={s.title} className={`gs-sched gs-sched--${status}`}>
            <span className="gs-sched__dot" aria-hidden="true">
              {status === "done" && <Icon name="check" size={14} strokeWidth={3} />}
            </span>
            <div>
              <div className="gs-sched__date">
                {s.date}
                {status === "now" && <span className="gs-sched__badge">Sekarang</span>}
              </div>
              <h3 className="gs-sched__title">{s.title}</h3>
              <p className="gs-sched__body">{s.body}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

const NAV = [
  { href: "#ringkasan", label: "Ringkasan" },
  { href: "#cara-ikut", label: "Cara ikut" },
  { href: "#jadwal", label: "Jadwal" },
  { href: "#hadiah", label: "Hadiah" },
  { href: "#faq", label: "FAQ" },
  { href: "#unduhan", label: "Unduhan" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [current, setCurrent] = useState("");
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setCurrent("#" + e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    NAV.forEach((n) => {
      const el = document.querySelector(n.href);
      if (el) io.observe(el);
    });
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);
  return (
    <header className={`gs-nav gs-on-band${scrolled ? " gs-nav--scrolled" : ""}`}>
      <div className="gs-nav__bar">
        <a className="gs-nav__logos" href="#top" aria-label="Planters Club, PTPN GreenStride 2026, ke atas">
          <span className="gs-nav__logo">
            <img src="/img/logo-planters-club-horizontal-white.png" alt="Planters Club" width={124} height={44} />
          </span>
        </a>
        <nav className="gs-nav__links" aria-label="Utama">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} aria-current={current === n.href ? "true" : undefined}>
              {n.label}
            </a>
          ))}
        </nav>
        <a className="gs-btn gs-btn--lime gs-btn--sm gs-nav__cta" href={EVENT.helpdeskUrl} target="_blank" rel="noopener noreferrer">
          <Icon name="lifebuoy" size={18} />
          <span>Help Desk</span>
        </a>
        <button type="button" className="gs-nav__toggle" aria-expanded={open} aria-controls="nav-sheet" aria-label={open ? "Tutup menu" : "Buka menu"} onClick={() => setOpen(!open)}>
          <Icon name={open ? "close" : "chevron-down"} size={20} />
        </button>
      </div>
      <div className="gs-nav__sheet" id="nav-sheet" data-open={open ? "true" : "false"}>
        {NAV.map((n) => (
          <a key={n.href} href={n.href} onClick={() => setOpen(false)}>
            {n.label}
          </a>
        ))}
        <a className="gs-btn gs-btn--lime" href={EVENT.helpdeskUrl} target="_blank" rel="noopener noreferrer">
          <Icon name="lifebuoy" size={18} />
          <span>Buka Help Desk</span>
        </a>
      </div>
    </header>
  );
}
