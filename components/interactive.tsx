"use client";
/* eslint-disable @next/next/no-img-element */

import { createElement, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { Icon, Illustration } from "./ds";
import { APP_STEPS, EVENT, SCHEDULE, rupiah } from "@/lib/event";
import { THEME_KEY, VISITOR_KEY } from "@/lib/site";

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

const DAY = 864e5;
const RACE_START = Date.parse(EVENT.raceStart);
const RACE_END = Date.parse(EVENT.raceEnd);
/** null saat prerender, 0 sebelum lomba, 1..raceDays selama lomba, raceDays + 1 setelah lomba. */
function raceDay(now: number) {
  if (!now) return null;
  if (now < RACE_START) return 0;
  if (now > RACE_END) return EVENT.raceDays + 1;
  return Math.min(EVENT.raceDays, Math.floor((now - RACE_START) / DAY) + 1);
}

/* ───────── gambar sekali saat terlihat
   HTML awal memuat grafik utuh (data-draw="static"). Setelah hidrasi grafik disiapkan ("wait")
   lalu digambar sekali saat masuk layar ("on"). Tanpa IntersectionObserver atau dengan
   prefers-reduced-motion, grafik tetap utuh tanpa gerak. */
type Draw = "static" | "wait" | "on";
export function useDraw<T extends Element>() {
  const ref = useRef<T>(null);
  const [draw, setDraw] = useState<Draw>("static");
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = requestAnimationFrame(() => setDraw("wait"));
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        cancelAnimationFrame(frame);
        setDraw("wait");
        frame = requestAnimationFrame(() => (frame = requestAnimationFrame(() => setDraw("on"))));
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);
  return [ref, draw] as const;
}

/** Pembungkus useDraw untuk markup dari server: kata kunci judul (garis lime) dan baris aturan harian (RuleGraphic). */
export function Drawn({ as = "div", className, children }: { as?: "div" | "ul" | "em"; className?: string; children: ReactNode }) {
  const [ref, draw] = useDraw<HTMLElement>();
  return createElement(as, { ref, className, "data-draw": draw }, children);
}

const pad = (n: number) => String(n).padStart(2, "0");
const fmt = (n: number) => n.toLocaleString("id-ID", { maximumFractionDigits: 1 });
const idx = (i: number) => ({ "--i": i }) as CSSProperties;

/* ───────── Countdown: hitung mundur sebelum lomba, hari ke-X selama lomba */
export function Countdown() {
  const now = useNow();
  const day = raceDay(now);
  const running = day !== null && day >= 1 && day <= EVENT.raceDays;
  const finished = day === EVENT.raceDays + 1;

  if (running || finished) {
    const left = Math.max(0, RACE_END - now);
    const daysLeft = Math.floor(left / DAY);
    const hoursLeft = Math.floor(left / 36e5) % 24;
    return (
      <div className="gs-countdown" role="timer" aria-live="off">
        <span className="gs-countdown__status">
          <span className="gs-countdown__dot" aria-hidden="true" />
          {finished ? "Lomba sudah selesai" : "Lomba berlangsung"}
        </span>
        {running && (
          <div className="gs-countdown__day">
            Hari ke <strong>{day}</strong> <span>dari {EVENT.raceDays}</span>
          </div>
        )}
        <div className="gs-countdown__track" role="img" aria-label={finished ? "Periode lomba selesai" : `Hari ke-${day} dari ${EVENT.raceDays}`}>
          <span className="gs-countdown__fill" style={{ width: `${finished ? 100 : ((day as number) / EVENT.raceDays) * 100}%` }} />
        </div>
        <div className="gs-countdown__range">
          {finished ? (
            <>Panitia melakukan verifikasi final.</>
          ) : (
            <>
              Ditutup <strong>20 Desember, 23.59 WIB</strong> · sisa {daysLeft} hari {hoursLeft} jam
            </>
          )}
        </div>
      </div>
    );
  }

  const left = day === 0 ? Math.max(0, RACE_START - now) : 0;
  const units: [number, string][] = [
    [Math.floor(left / DAY), "Hari"],
    [Math.floor(left / 36e5) % 24, "Jam"],
    [Math.floor(left / 6e4) % 60, "Menit"],
    [Math.floor(left / 1e3) % 60, "Detik"],
  ];
  return (
    <div className="gs-countdown" role="timer" aria-live="off">
      <span className="gs-countdown__status">
        <span className="gs-countdown__dot" aria-hidden="true" />
        {day === 0 ? "Menuju Start" : "Periode lomba"}
      </span>
      <div className="gs-countdown__units" aria-hidden={day !== 0}>
        {units.map(([v, cap], i) => (
          <div key={cap} className="gs-countdown__unit">
            {/* Hari, jam dan menit meluncur masuk saat angkanya berganti; detik tidak, agar tidak ada gerak tiap detik. */}
            <span key={i === 3 ? "s" : v} className="gs-countdown__num">
              {day === 0 ? (i === 0 ? v : pad(v)) : "–"}
            </span>
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

/* ───────── TeamBar: 300 km dibagi rata ke anggota tim, bagian minimal 60 km ditandai */
export function TeamBar({ members = EVENT.teamMax }: { members?: number }) {
  const [ref, draw] = useDraw<HTMLDivElement>();
  const per = EVENT.teamTargetKm / members;
  const minShare = Math.min(1, EVENT.memberMinKm / per);
  const slots = Array.from({ length: EVENT.teamMax }, (_, i) => i);
  return (
    <div className="gs-teambar" ref={ref} data-draw={draw}>
      <div
        className="gs-teambar__track"
        role="img"
        aria-label={`${EVENT.teamTargetKm} km dibagi ${members} anggota: ${fmt(per)} km per orang, minimal ${EVENT.memberMinKm} km per orang`}
      >
        {slots.map((i) => (
          <span key={i} className="gs-teambar__seg" data-on={i < members} style={idx(i)}>
            <span className="gs-teambar__min" style={{ width: `${minShare * 100}%` }} />
          </span>
        ))}
      </div>
      <div className="gs-teambar__labels" aria-hidden="true">
        {slots.map((i) => (
          <span key={i} data-on={i < members}>
            <Icon name="run" size={14} />
            {fmt(per)} km
          </span>
        ))}
      </div>
      <div className="gs-teambar__legend">
        <span>
          <i className="gs-teambar__key" aria-hidden="true" />
          Minimal {EVENT.memberMinKm} km per anggota
        </span>
        {minShare < 1 && (
          <span>
            <i className="gs-teambar__key gs-teambar__key--extra" aria-hidden="true" />
            Sisa porsi agar tim mencapai {EVENT.teamTargetKm} km
          </span>
        )}
      </div>
    </div>
  );
}

/* ───────── KmSplitter: porsi per orang dan rata-rata harian dibanding batas 24 km */
export function KmSplitter() {
  const [n, setN] = useState<number>(EVENT.teamMax);
  const per = EVENT.teamTargetKm / n;
  const perDay = Math.round((per / EVENT.raceDays) * 10) / 10;
  const pos = Math.max(3, Math.min(97, (perDay / EVENT.dailyMaxKm) * 100));
  return (
    <div className="gs-split">
      <p className="gs-split__q" id="split-q">
        Simulasi sederhananya, apabila:
      </p>
      <div className="gs-seg" role="group" aria-labelledby="split-q">
        {[5, 4, 3, 2].map((o) => (
          <button key={o} type="button" aria-pressed={o === n} onClick={() => setN(o)}>
            {o} orang
          </button>
        ))}
      </div>
      <TeamBar members={n} />
      <div className="gs-split__out" aria-live="polite">
        <div>
          <div className="gs-split__num" key={per}>
            {fmt(per)}
            <small>km</small>
          </div>
          <div className="gs-split__cap">per orang selama {EVENT.raceDays} hari</div>
        </div>
        <div>
          <div className="gs-split__num" key={perDay}>
            {fmt(perDay)}
            <small>km</small>
          </div>
          <div className="gs-split__cap">rata-rata per orang per hari</div>
        </div>
      </div>
      <div className="gs-road">
        <div className="gs-road__track" role="img" aria-label={`Rata-rata ${fmt(perDay)} km dari batas ${EVENT.dailyMaxKm} km per hari`}>
          <span className="gs-road__done" style={{ width: `${pos}%` }} />
          <span className="gs-road__runner" style={{ left: `${pos}%` }}>
            <Icon name="run" size={18} />
          </span>
        </div>
        <div className="gs-split__scale">
          <span>0 km</span>
          <span>Batas harian {EVENT.dailyMaxKm} km</span>
        </div>
      </div>
    </div>
  );
}

/* ───────── Garis rute dari konten 24 KM: garis terang berkelok dengan titik ujung lime, tergambar sekali saat terlihat */
export function KmRoute({ className = "km__route" }: { className?: string }) {
  const [ref, draw] = useDraw<SVGSVGElement>();
  return (
    <svg ref={ref} data-draw={draw} className={`gs-route ${className}`} viewBox="0 0 400 130" aria-hidden="true">
      <path d="M18 112c70 2 104-6 132-30s22-52 62-54 58 30 104 18 52-26 66-28" pathLength={1} />
      <circle cx="18" cy="112" r="9" />
      <circle cx="382" cy="18" r="9" />
    </svg>
  );
}

/* ───────── TeamRoute: 300 km sebagai rute lima ruas, satu ruas 60 km per anggota (motif garis rute) */
const TR_X = [30, 138, 246, 354, 462, 570];
const TR_Y = (i: number) => (i % 2 ? 36 : 96);
const TR_PATH = TR_X.slice(1).reduce((d, x, i) => `${d} C${TR_X[i] + 54} ${TR_Y(i)} ${x - 54} ${TR_Y(i + 1)} ${x} ${TR_Y(i + 1)}`, `M${TR_X[0]} ${TR_Y(0)}`);
const pct = (v: number, of: number) => `${(v / of) * 100}%`;

export function TeamRoute() {
  const [ref, draw] = useDraw<HTMLDivElement>();
  const n = EVENT.teamMax;
  const per = EVENT.teamTargetKm / n;
  return (
    <div className="gs-teamroute" ref={ref} data-draw={draw}>
      <div
        className="gs-teamroute__map"
        role="img"
        aria-label={`${EVENT.teamTargetKm} km dari ${n} anggota, setiap anggota minimal ${EVENT.memberMinKm} km`}
      >
        <svg viewBox="0 0 600 132" aria-hidden="true">
          <path className="gs-teamroute__base" d={TR_PATH} />
          <path className="gs-teamroute__a" d={TR_PATH} pathLength={n} />
          <path className="gs-teamroute__b" d={TR_PATH} pathLength={n} />
          {TR_X.map((x, i) => (
            <circle key={x} className={i === n ? "gs-teamroute__finish" : "gs-teamroute__stop"} cx={x} cy={TR_Y(i)} r={i === n ? 12 : 7} />
          ))}
        </svg>
        {TR_X.slice(0, -1).map((x, i) => (
          <span key={x} className="gs-teamroute__runner" style={{ left: pct(x + 54, 600), top: pct(66, 132), ...idx(i) }} aria-hidden="true">
            {i + 1}
          </span>
        ))}
        {TR_X.map((x, i) => (
          <span
            key={x}
            className={`gs-teamroute__km gs-teamroute__km--${i % 2 ? "up" : "down"}${i === n ? " gs-teamroute__km--end" : ""}`}
            style={{ left: pct(x, 600), top: pct(TR_Y(i), 132), ...idx(i) }}
            aria-hidden="true"
          >
            {i === 0 ? "Mulai" : i === n ? `${EVENT.teamTargetKm} km` : fmt(per * i)}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ───────── Cek aktivitas: pace dari jarak dan moving time, dibanding aturan lomba */
const toSec = (p: string) => {
  const [m, s] = p.split(":").map(Number);
  return m * 60 + s;
};
const PACE_FAST = toSec(EVENT.paceFast);
const PACE_SLOW = toSec(EVENT.paceSlow);
const GAUGE_MIN = 3 * 60;
const GAUGE_MAX = 18 * 60;
const fmtPace = (sec: number) => {
  const t = Math.round(sec);
  return `${Math.floor(t / 60)}:${pad(t % 60)}`;
};
const gaugePos = (sec: number) => Math.max(0, Math.min(100, ((sec - GAUGE_MIN) / (GAUGE_MAX - GAUGE_MIN)) * 100));
const numOrNull = (v: string) => (v.trim() === "" ? 0 : /^\d+$/.test(v.trim()) ? Number(v) : NaN);

function PaceGauge({ pace, verdict }: { pace?: number; verdict?: "ok" | "fast" | "slow" }) {
  return (
    <div
      className="gs-gauge"
      role="img"
      aria-label={`${pace ? `Pace ${fmtPace(pace)} menit/km. ` : ""}Rentang yang dihitung ${EVENT.paceFast} sampai ${EVENT.paceSlow} menit/km.`}
    >
      <div className="gs-gauge__track">
        <span className="gs-gauge__ok" style={{ left: `${gaugePos(PACE_FAST)}%`, right: `${100 - gaugePos(PACE_SLOW)}%` }}>
          {!pace && <em>Zona dihitung</em>}
        </span>
        {pace && <span className={`gs-gauge__mark gs-gauge__mark--${verdict}`} style={{ left: `${gaugePos(pace)}%` }} />}
      </div>
      <div className="gs-gauge__ticks" aria-hidden="true">
        <span style={{ left: `${gaugePos(PACE_FAST)}%` }}>{EVENT.paceFast}</span>
        <span style={{ left: `${gaugePos(PACE_SLOW)}%` }}>{EVENT.paceSlow}</span>
      </div>
      <div className="gs-gauge__ends" aria-hidden="true">
        <span>Lebih cepat</span>
        <span>Lebih lambat</span>
      </div>
    </div>
  );
}

export function ActivityCheck({ wide = false }: { wide?: boolean }) {
  const [km, setKm] = useState("");
  const [hh, setHh] = useState("");
  const [mm, setMm] = useState("");
  const [ss, setSs] = useState("");

  const dist = /^\d+([.,]\d+)?$/.test(km.trim()) ? Number(km.trim().replace(",", ".")) : NaN;
  const [h, m, s] = [numOrNull(hh), numOrNull(mm), numOrNull(ss)];
  const secs = h * 3600 + m * 60 + s;
  const touched = [km, hh, mm, ss].some((v) => v.trim() !== "");

  let error = "";
  if (touched) {
    if (!(dist > 0)) error = "Isi jarak dalam km, misalnya 3,2.";
    else if ([h, m, s].some(Number.isNaN)) error = "Moving time diisi dengan angka bulat.";
    else if (!(secs > 0)) error = "Isi moving time dari Strava.";
  }
  const ready = touched && !error;
  const pace = ready ? secs / dist : 0;
  const speed = ready ? dist / (secs / 3600) : 0;
  const verdict = !ready ? null : pace < PACE_FAST ? "fast" : pace > PACE_SLOW ? "slow" : "ok";
  const counted = Math.min(dist, EVENT.dailyMaxKm);

  const field = (id: string, label: string, value: string, set: (v: string) => void, mode: "decimal" | "numeric", placeholder: string) => (
    <div className="gs-check__field">
      <label htmlFor={id}>{label}</label>
      <input id={id} type="text" inputMode={mode} autoComplete="off" placeholder={placeholder} value={value} onChange={(e) => set(e.target.value)} />
    </div>
  );

  return (
    <div className={`gs-check${wide ? " gs-check--wide" : ""}`} id="cek-aktivitas">
      <div className="gs-check__head">
        <h3>Cek aktivitasmu</h3>
        <p>Isi jarak dan moving time dari Strava, lihat apakah aktivitasmu dihitung.</p>
      </div>
      <div className="gs-check__inputs">
        {field("chk-km", "Jarak (km)", km, setKm, "decimal", "3,2")}
        <fieldset className="gs-check__time">
          <legend>Moving time</legend>
          <div className="gs-check__time-row">
            {field("chk-h", "Jam", hh, setHh, "numeric", "0")}
            {field("chk-m", "Menit", mm, setMm, "numeric", "38")}
            {field("chk-s", "Detik", ss, setSs, "numeric", "20")}
          </div>
        </fieldset>
      </div>

      <div className="gs-check__out" aria-live="polite">
        {!touched && (
          <>
            <PaceGauge />
            <div className="gs-check__empty">
              <p>
                <Icon name="clock" size={20} />
                Pace yang dihitung sekitar 4 sampai 12 km/jam: jalan cepat sampai lari.
              </p>
              <button
                type="button"
                className="gs-btn gs-btn--secondary gs-btn--sm"
                onClick={() => {
                  setKm("5");
                  setHh("");
                  setMm("40");
                  setSs("");
                }}
              >
                <span>Coba contoh: 5 km, 40 menit</span>
              </button>
            </div>
          </>
        )}
        {error && (
          <p className="gs-check__error" key={error}>
            <Icon name="alert" size={20} />
            {error}
          </p>
        )}
        {verdict && (
          <>
            <div className="gs-check__pace">
              <span className="gs-check__num">
                {fmtPace(pace)}
                <small>menit/km</small>
              </span>
              <span className="gs-check__speed">{fmt(speed)} km/jam</span>
            </div>
            <PaceGauge pace={pace} verdict={verdict} />
            <div key={verdict} className={`gs-check__verdict gs-check__verdict--${verdict}`}>
              <Icon name={verdict === "ok" ? "check" : "ban"} size={22} strokeWidth={2.5} />
              <div>
                {verdict === "ok" && (
                  <>
                    <strong>Masuk rentang pace</strong>
                    {fmt(counted)} km bisa dihitung untuk timmu.
                    {dist > EVENT.dailyMaxKm && ` Jarak di atas ${EVENT.dailyMaxKm} km dalam sehari tidak menambah jarak tim.`}
                  </>
                )}
                {verdict === "fast" && (
                  <>
                    <strong>Terlalu cepat, tidak dihitung</strong>
                    Pace di bawah {EVENT.paceFast} menit/km. Bila kamu tidak secepat itu, kemungkinan GPS melompat atau aktivitas terekam saat berkendara.
                  </>
                )}
                {verdict === "slow" && (
                  <>
                    <strong>Terlalu lambat, tidak dihitung</strong>
                    Pace di atas {EVENT.paceSlow} menit/km. Pastikan yang diisi moving time, bukan elapsed time.
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      <p className="gs-check__note">
        Perkiraan dari aturan pace dan batas {EVENT.dailyMaxKm} km per hari. Hasil akhir mengikuti verifikasi panitia.
      </p>
    </div>
  );
}

/* ───────── Kalender 28 hari: empat minggu penuh Senin sampai Minggu */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const [CAL_Y, CAL_M, CAL_D] = EVENT.raceStart.slice(0, 10).split("-").map(Number);
const CAL_BASE = Date.UTC(CAL_Y, CAL_M - 1, CAL_D);
const CAL_DAYS = Array.from({ length: EVENT.raceDays }, (_, i) => {
  const d = new Date(CAL_BASE + i * DAY);
  return { i, date: d.getUTCDate(), month: d.getUTCMonth() };
});

export function RaceCalendar() {
  const now = useNow();
  const day = raceDay(now);
  const [ref, draw] = useDraw<HTMLDivElement>();
  const last = EVENT.raceDays - 1;
  const status = (i: number) => (day === null ? "next" : i + 1 < day ? "done" : i + 1 === day ? "today" : "next");
  const weeks = Array.from({ length: EVENT.raceDays / 7 }, (_, w) => CAL_DAYS.slice(w * 7, w * 7 + 7));
  const perWeek = EVENT.teamTargetKm / weeks.length;
  const perDay = Math.round((EVENT.teamTargetKm / EVENT.raceDays) * 10) / 10;
  const running = day !== null && day >= 1 && day <= EVENT.raceDays;
  const curWeek = running ? Math.ceil((day as number) / 7) - 1 : -1;
  let status_line = `Dimulai Senin ${CAL_DAYS[0].date} ${MONTHS[CAL_DAYS[0].month]}, ditutup Minggu ${CAL_DAYS[last].date} ${MONTHS[CAL_DAYS[last].month]}.`;
  if (day === 0) status_line = `Mulai dalam ${Math.ceil((RACE_START - now) / DAY)} hari. ${status_line}`;
  if (running) status_line = `Hari ke-${day} dari ${EVENT.raceDays}, sisa ${EVENT.raceDays - (day as number)} hari setelah hari ini.`;
  if (day === EVENT.raceDays + 1) status_line = "Lomba selesai. Panitia melakukan verifikasi final.";
  return (
    <figure className="gs-cal" ref={ref} data-draw={draw}>
      <div className="gs-cal__top">
        <h3 className="gs-cal__title">Rencana {weeks.length} minggu</h3>
        <span className="gs-cal__range">
          {CAL_DAYS[0].date} {MONTHS[CAL_DAYS[0].month]} – {CAL_DAYS[last].date} {MONTHS[CAL_DAYS[last].month]} 2026
        </span>
      </div>
      <div className="gs-cal__grid" aria-hidden="true">
        <span className="gs-cal__wk gs-cal__head" />
        {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((d) => (
          <span key={d} className="gs-cal__dow">
            {d}
          </span>
        ))}
        <span className="gs-cal__goal gs-cal__head">Target tim</span>
        {weeks.map((wk, w) => (
          <div key={w} className={`gs-cal__row${w === curWeek ? " is-current" : ""}`}>
            <span className="gs-cal__wk">Mg {w + 1}</span>
            {wk.map((c) => {
              const st = status(c.i);
              const edge = c.i === 0 ? "start" : c.i === last ? "finish" : "";
              return (
                <span key={c.i} className={`gs-cal__day gs-cal__day--${st}${edge ? ` gs-cal__day--${edge}` : ""}`} style={idx(c.i)}>
                  {edge ? <small>{edge === "start" ? "Mulai" : "Finis"}</small> : c.date === 1 ? <small>{MONTHS[c.month]}</small> : null}
                  {c.date}
                </span>
              );
            })}
            <span className="gs-cal__goal" style={idx(w)}>
              <i style={{ width: `${((w + 1) / weeks.length) * 100}%` }} />
              <b>{fmt(perWeek * (w + 1))}</b> km
            </span>
          </div>
        ))}
      </div>
      <div className="gs-cal__legend" aria-hidden="true">
        <span>
          <i className="is-edge" /> Mulai dan finis
        </span>
        {running && (
          <>
            <span>
              <i /> Sudah lewat
            </span>
            <span>
              <i className="is-today" /> Hari ini
            </span>
          </>
        )}
      </div>
      <figcaption className="gs-cal__caption">
        <Icon name="route" size={18} />
        <span>
          <strong>
            Kejar {fmt(perWeek)} km per minggu, atau sekitar {fmt(perDay)} km per hari untuk satu tim.
          </strong>{" "}
          {status_line}
        </span>
      </figcaption>
    </figure>
  );
}

/* ───────── Tangga penghargaan */
const LADDER = [
  { illo: "medal", who: "Semua tim finisher", title: "Medali dan e-certificate", body: `Tim mencapai minimal ${EVENT.teamTargetKm} km dan tiap anggota minimal ${EVENT.memberMinKm} km.` },
  { illo: "jersey", who: `${EVENT.topTeamsInvited} tim terbaik`, title: "Finisher jersey dan undangan offline race di Jakarta", body: `Lari bersama tim-tim terbaik PTPN Group, ${EVENT.offlineRaceLabel}.` },
  { illo: "trophy", who: `${EVENT.prizes.length} tim terbaik`, title: "Uang tunai", body: null },
] as const;

export function RewardLadder() {
  const [ref, draw] = useDraw<HTMLDivElement>();
  return (
    <div className="gs-ladder" ref={ref} data-draw={draw}>
      <ol className="gs-ladder__steps">
        {LADDER.map((r, i) => (
          <li key={r.who} className={`gs-ladder__step${i === LADDER.length - 1 ? " gs-ladder__step--top" : ""}`} style={idx(i)}>
            <Illustration name={r.illo} />
            <span className="gs-ladder__who">{r.who}</span>
            <h3 className="gs-ladder__title">{r.title}</h3>
            {r.body ? (
              <p className="gs-ladder__body">{r.body}</p>
            ) : (
              <dl className="gs-ladder__prizes">
                {EVENT.prizes.map((p) => (
                  <div key={p.rank}>
                    <dt>{p.rank}</dt>
                    <dd>{rupiah(p.amount)}</dd>
                  </div>
                ))}
              </dl>
            )}
          </li>
        ))}
      </ol>
      <div className="gs-ladder__mvp">
        <span className="gs-ladder__mvp-disc">
          <Icon name="run" size={26} />
        </span>
        <div>
          <span className="gs-ladder__who">{EVENT.mvpCount} orang peraih MVP</span>
          <h3 className="gs-ladder__title">Total {rupiah(EVENT.mvpPrize * EVENT.mvpCount)} dan undangan ke Jakarta</h3>
          <p className="gs-ladder__body">Masing-masing {rupiah(EVENT.mvpPrize)} untuk {EVENT.mvpCount} orang.</p>
        </div>
      </div>
    </div>
  );
}

/* ───────── Langkah aplikasi
   Desktop: daftar langkah di kiri; langkah yang dibuka menampilkan rincian layarnya, ponsel menempel di kanan.
   Ponsel: tab nomor di atas, layar di tengah, keterangan layar dan tombol geser di bawah. */
export function AppSteps() {
  const [pos, setPos] = useState({ step: 0, shot: 0 });
  const { step, shot } = pos;
  const cur = APP_STEPS[step];
  const shots = cur.shots;
  const atStart = step === 0 && shot === 0;
  const atEnd = step === APP_STEPS.length - 1 && shot === shots.length - 1;
  const lastShot = shot === shots.length - 1;
  const next = () => setPos(lastShot ? { step: step + 1, shot: 0 } : { step, shot: shot + 1 });
  const prev = () => setPos(shot > 0 ? { step, shot: shot - 1 } : { step: step - 1, shot: APP_STEPS[step - 1].shots.length - 1 });
  // Geser layar ponsel: kiri untuk maju, kanan untuk mundur. Hanya sentuh dan pena; tetikus memakai tombol.
  const swipeFrom = useRef<{ x: number; y: number } | null>(null);
  const onSwipeEnd = (e: ReactPointerEvent) => {
    const from = swipeFrom.current;
    swipeFrom.current = null;
    if (!from) return;
    const dx = e.clientX - from.x;
    const dy = e.clientY - from.y;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    if (dx < 0 && !atEnd) next();
    else if (dx > 0 && !atStart) prev();
  };
  return (
    <div className="gs-steps">
      <ol className="gs-steps__list" aria-label="Langkah menyiapkan aplikasi">
        {APP_STEPS.map((st, i) => {
          const on = i === step;
          return (
            <li key={st.title} className={`gs-steps__item${on ? " is-on" : ""}`}>
              <button type="button" className="gs-step" aria-expanded={on} aria-controls={`step-shots-${i}`} onClick={() => setPos({ step: i, shot: 0 })}>
                <span className="gs-step__num">{i + 1}</span>
                <span className="gs-step__text">
                  <span className="gs-step__title">{st.title}</span>
                  {!on && <span className="gs-step__body">{st.body}</span>}
                </span>
              </button>
              <ol className="gs-substeps" id={`step-shots-${i}`} aria-label={`Rincian ${st.title}`} hidden={!on}>
                {st.shots.map((s, j) => (
                  <li key={s.image}>
                    <button type="button" className="gs-substep" aria-current={on && j === shot ? "step" : undefined} onClick={() => setPos({ step: i, shot: j })}>
                      <span className="gs-substep__num">{j + 1}</span>
                      <span>{s.text}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </li>
          );
        })}
      </ol>
      <div className="gs-steps__panel">
        <div className="gs-phone">
          <div
            className="gs-phone__screen"
            onPointerDown={(e) => {
              if (e.pointerType !== "mouse") swipeFrom.current = { x: e.clientX, y: e.clientY };
            }}
            onPointerUp={onSwipeEnd}
            onPointerCancel={() => (swipeFrom.current = null)}
          >
            {/* Hanya layar langkah yang terbuka yang dipasang, jadi 24 gambar tidak diunduh sekaligus. */}
            {shots.map((s, j) => (
              <img
                key={s.image}
                src={s.image}
                alt={j === shot ? s.alt : ""}
                aria-hidden={j === shot ? undefined : true}
                className={j === shot ? "is-on" : undefined}
                width={720}
                height={1558}
                loading="lazy"
                decoding="async"
              />
            ))}
          </div>
        </div>
        <div className="gs-steps__caption" aria-live="polite">
          <div className="gs-steps__say" key={`${step}-${shot}`}>
            <span className="gs-steps__count">
              Langkah {step + 1} dari {APP_STEPS.length}
            </span>
            <p className="gs-steps__title">{cur.title}</p>
            <p className="gs-steps__body">{shots[shot].text}</p>
          </div>
        </div>
        {/* Tombol tetap terpasang saat layar berganti, jadi fokus papan ketik tidak hilang. */}
        <div className="gs-pager">
          <button type="button" className="gs-btn gs-btn--secondary gs-btn--sm gs-pager__prev" onClick={prev} disabled={atStart} aria-label="Layar sebelumnya">
            <span className="gs-pager__flip">
              <Icon name="arrow-right" size={18} />
            </span>
          </button>
          <span className="gs-pager__count">
            Layar {shot + 1} dari {shots.length}
          </span>
          <button type="button" className="gs-btn gs-btn--secondary gs-btn--sm" onClick={next} disabled={atEnd}>
            <span>{lastShot && !atEnd ? `Langkah ${step + 2}` : "Berikutnya"}</span>
            <Icon name="arrow-right" size={18} className="gs-btn__arrow" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function Schedule() {
  const now = useNow();
  const [ref, draw] = useDraw<HTMLOListElement>();
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
    <ol className="gs-schedule" ref={ref} data-draw={draw}>
      {SCHEDULE.map((s, i) => {
        const status = statuses[i];
        return (
          <li key={s.title} className={`gs-sched gs-sched--${status}`} style={idx(i)}>
            <span className="gs-sched__chip" aria-hidden="true">
              {s.chip.pre && <small>{s.chip.pre}</small>}
              {s.chip.day ? <b className={s.chip.day.length > 2 ? "is-long" : undefined}>{s.chip.day}</b> : <Icon name="flag" size={22} />}
              <small>{s.chip.month}</small>
              {status === "done" && (
                <span className="gs-sched__done">
                  <Icon name="check" size={12} strokeWidth={3.5} />
                </span>
              )}
            </span>
            <div className="gs-sched__card">
              <div className="gs-sched__date">
                {s.date}
                {status === "now" && <span className="gs-sched__badge">Sekarang</span>}
                {status === "done" && <span className="gs-sched__past">Selesai</span>}
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

/* Muncul setelah kira-kira satu layar digulir, karena sebelum itu header dan logo #top masih dekat.
   Tetap tautan biasa ke #top: gulir halus dan scroll-padding sudah diatur di CSS, fokus ikut pindah ke atas. */
export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let frame = 0;
    const check = () => {
      frame = 0;
      setShow(window.scrollY > window.innerHeight * 0.9);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <a className="gs-totop" href="#top" data-show={show ? "true" : "false"} aria-label="Kembali ke atas" title="Kembali ke atas">
      <svg className="gs-totop__ring" viewBox="0 0 52 52" aria-hidden="true">
        <circle className="gs-totop__track" cx="26" cy="26" r="24.5" pathLength={100} />
        <circle className="gs-totop__fill" cx="26" cy="26" r="24.5" pathLength={100} />
      </svg>
      <Icon name="arrow-right" size={22} />
    </a>
  );
}

/* ───────── jumlah pengunjung (app/api/visits, Upstash Redis)
   Browser yang belum punya penanda VISITOR_KEY mengirim POST dan dihitung; sesudahnya cukup GET.
   Server tetap menolak hitungan kedua dari perangkat yang sama di hari yang sama. Bila penghitung
   belum dikonfigurasi, gagal, atau masih 0, kartu ini tidak tampil. Saat pertama terlihat, angka naik dari 0
   dan garis lime di bawahnya tergambar (useDraw); dengan prefers-reduced-motion angka langsung tampil utuh. */
const visitorFormat = new Intl.NumberFormat("id-ID");
const COUNT_UP_MS = 900;

export function VisitCount() {
  const [visitors, setVisitors] = useState<number | "loading" | null>("loading");
  const [ref, draw] = useDraw<HTMLDivElement>();
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (draw !== "on" || typeof visitors !== "number") return;
    let frame = 0;
    const start = performance.now();
    const step = () => {
      const p = Math.min(1, (performance.now() - start) / COUNT_UP_MS);
      setShown(Math.round(visitors * (1 - (1 - p) ** 3)));
      if (p < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    // Bila frame animasi tertahan (tab di latar belakang, browser hemat daya), angka akhir tetap tampil.
    const done = setTimeout(() => {
      cancelAnimationFrame(frame);
      setShown(visitors);
    }, COUNT_UP_MS + 200);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(done);
    };
  }, [draw, visitors]);
  useEffect(() => {
    const ctrl = new AbortController();
    let counted = true;
    try {
      counted = localStorage.getItem(VISITOR_KEY) === "1";
    } catch {}
    const isNew = !counted && !navigator.webdriver;
    fetch("/api/visits/", { method: isNew ? "POST" : "GET", signal: ctrl.signal, cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<{ visitors: number }>) : Promise.reject(r.status)))
      .then(({ visitors }) => {
        if (isNew) {
          try {
            localStorage.setItem(VISITOR_KEY, "1");
          } catch {}
        }
        setVisitors(visitors > 0 ? visitors : null);
      })
      .catch(() => {
        if (!ctrl.signal.aborted) setVisitors(null);
      });
    return () => ctrl.abort();
  }, []);
  if (visitors === null) return null;
  const loading = visitors === "loading";
  return (
    <div className="footer__visits" ref={ref} aria-busy={loading}>
      <span className="footer__visits-disc">
        <Icon name="team" size={24} />
      </span>
      <div className="footer__visits-body">
        <h3>Pengunjung situs</h3>
        {loading ? (
          <p className="footer__visits-value footer__visits-value--wait">Menghitung…</p>
        ) : (
          <p className="footer__visits-value">
            {/* Pembaca layar langsung mendapat angka akhir, bukan angka yang sedang naik. */}
            <strong className="gs-keyline" data-draw={draw} aria-hidden="true">
              {visitorFormat.format(draw === "static" ? visitors : shown)}
            </strong>
            <span className="footer__visits-sr">{visitorFormat.format(visitors)}</span> orang
          </p>
        )}
        {/* Saat memuat, catatan tetap memakan tempat (tidak terlihat) agar tinggi kartu tidak berubah. */}
        <p className="footer__visits-note" aria-hidden={loading} data-wait={loading || undefined}>
          Termasuk kamu, ajak rekan setimmu membaca juga.
        </p>
      </div>
    </div>
  );
}

/* ───────── tema terang/gelap
   Tanpa pilihan, halaman mengikuti tema perangkat (tokens.css). Pilihan disimpan di localStorage dan dipasang
   skrip di <head> (app/layout.tsx) sebelum cat pertama. Ikon dipilih CSS menurut tema yang berlaku, jadi HTML
   statis sudah benar sebelum hidrasi; state di sini hanya untuk nama tombol. */
const DARK_MQ = "(prefers-color-scheme: dark)";
function subscribeTheme(fn: () => void) {
  const mq = window.matchMedia(DARK_MQ);
  mq.addEventListener("change", fn);
  const mo = new MutationObserver(fn);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => {
    mq.removeEventListener("change", fn);
    mo.disconnect();
  };
}
function isDark() {
  const t = document.documentElement.getAttribute("data-theme");
  return t ? t === "dark" : window.matchMedia(DARK_MQ).matches;
}

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribeTheme, isDark, () => null);
  // Strict Mode di dev memasang ulang <html> tanpa atribut dari skrip; pasang lagi sebelum cat. Di produksi tidak mengubah apa pun.
  useLayoutEffect(() => {
    try {
      const t = localStorage.getItem(THEME_KEY);
      if (t === "light" || t === "dark") document.documentElement.setAttribute("data-theme", t);
    } catch {}
  }, []);
  const toggle = () => {
    const next = isDark() ? "light" : "dark";
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {}
    const apply = () => document.documentElement.setAttribute("data-theme", next);
    // Seluruh warna halaman berganti sekaligus; pudar silang singkat membuatnya tidak terasa seperti kedipan.
    if (typeof document.startViewTransition === "function" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) document.startViewTransition(apply);
    else apply();
  };
  const label = dark === null ? "Ganti tema terang atau gelap" : dark ? "Pakai tema terang" : "Pakai tema gelap";
  return (
    <button type="button" className="gs-nav__theme" onClick={toggle} aria-label={label} title={label}>
      <Icon name="moon" size={20} className="gs-nav__theme-moon" />
      <Icon name="sun" size={20} className="gs-nav__theme-sun" />
    </button>
  );
}

const NAV = [
  { href: "#tentang", label: "Tentang" },
  { href: "#panduan", label: "Panduan" },
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
            <img
              src="/img/logo-planters-club-horizontal-white-248.webp"
              srcSet="/img/logo-planters-club-horizontal-white-248.webp 248w, /img/logo-planters-club-horizontal-white.webp 372w"
              sizes="(max-width: 960px) 101px, 124px"
              alt="Planters Club"
              width={124}
              height={44}
            />
          </span>
        </a>
        <nav className="gs-nav__links" aria-label="Utama">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} aria-current={current === n.href ? "true" : undefined}>
              {n.label}
            </a>
          ))}
        </nav>
        <ThemeToggle />
        <a className="gs-btn gs-btn--lime gs-btn--sm gs-nav__cta" href={EVENT.helpdeskUrl} target="_blank" rel="noopener noreferrer">
          <Icon name="lifebuoy" size={18} />
          <span>Help Desk</span>
        </a>
        <button type="button" className="gs-nav__toggle" aria-expanded={open} aria-controls="nav-sheet" aria-label={open ? "Tutup menu" : "Buka menu"} onClick={() => setOpen(!open)}>
          <Icon key={open ? "close" : "open"} name={open ? "close" : "chevron-down"} size={20} />
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

