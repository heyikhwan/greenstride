/* @ds-bundle: {"format":4,"namespace":"GreenStride","components":[{"name":"Button"},{"name":"Icon"},{"name":"SectionHeader"},{"name":"Pillar"},{"name":"FactTile"},{"name":"Countdown"},{"name":"KmSplitter"},{"name":"TeamBar"},{"name":"TeamRoute"},{"name":"RuleGraphic"},{"name":"Route"},{"name":"ActivityCheck"},{"name":"RaceCalendar"},{"name":"RewardLadder"},{"name":"Illustration"},{"name":"ScheduleItem"},{"name":"RewardCard"},{"name":"AppSteps"},{"name":"AppCard"},{"name":"Chip"},{"name":"SearchField"},{"name":"FaqItem"},{"name":"Callout"},{"name":"DocumentCard"},{"name":"Navbar"}]} */
(function () {
  "use strict";
  var React = window.React;
  var h = React.createElement;
  var useState = React.useState, useEffect = React.useEffect, useRef = React.useRef, useSyncExternalStore = React.useSyncExternalStore;

  var ICONS = __ICONS__;

  function cx() {
    var out = [];
    for (var i = 0; i < arguments.length; i++) if (arguments[i]) out.push(arguments[i]);
    return out.join(" ");
  }

  /* Ikon garis 24px dari set GreenStride; warna mengikuti teks (currentColor). */
  function Icon(props) {
    var size = props.size || 20;
    var body = ICONS[props.name];
    if (!body) return null;
    return h("svg", {
      className: cx("gs-icon", props.className), width: size, height: size, viewBox: "0 0 24 24", fill: "none",
      stroke: "currentColor", strokeWidth: props.strokeWidth || 2, strokeLinecap: "round", strokeLinejoin: "round",
      "aria-hidden": props.label ? undefined : "true", role: props.label ? "img" : undefined, "aria-label": props.label,
      dangerouslySetInnerHTML: { __html: body }
    });
  }

  function Button(props) {
    var variant = props.variant || "primary";
    var cls = cx("gs-btn", "gs-btn--" + variant, props.size && props.size !== "md" ? "gs-btn--" + props.size : null, props.className);
    var kids = [
      props.icon ? h(Icon, { key: "i", name: props.icon, size: 18 }) : null,
      h("span", { key: "t" }, props.children),
      props.arrow ? h(Icon, { key: "a", name: "arrow-right", size: 18, className: "gs-btn__arrow" }) : null
    ];
    if (props.href) {
      return h("a", { className: cls, href: props.href, target: props.external ? "_blank" : undefined, rel: props.external ? "noopener noreferrer" : undefined, "aria-disabled": props.disabled ? "true" : undefined }, kids);
    }
    return h("button", { type: props.type || "button", className: cls, onClick: props.onClick, disabled: props.disabled }, kids);
  }

  function SectionHeader(props) {
    return h("div", { className: cx("gs-section-head", props.align === "center" ? "gs-section-head--center" : null) },
      props.eyebrow ? h("span", { className: "gs-eyebrow" }, props.eyebrow) : null,
      h(props.as || "h2", null, props.title),
      props.lead ? h("p", null, props.lead) : null
    );
  }

  function Pillar(props) {
    return h("span", { className: "gs-pillar" },
      h("span", { className: "gs-pillar__disc" }, h(Icon, { name: props.icon, size: 22 })),
      h("span", null, props.children)
    );
  }

  function FactTile(props) {
    return h("div", { className: "gs-fact" },
      h("span", { className: "gs-fact__icon" }, h(Icon, { name: props.icon, size: 22 })),
      h("span", { className: "gs-fact__value" }, props.value, props.unit ? h("small", null, props.unit) : null),
      h("span", { className: "gs-fact__label" }, props.label),
      props.note ? h("span", { className: "gs-fact__note" }, props.note) : null
    );
  }

  /* Jam bersama: satu interval untuk semua komponen yang membaca waktu. */
  var clockSubs = [], clockTimer = null;
  function subscribeClock(fn) {
    clockSubs.push(fn);
    if (!clockTimer) clockTimer = setInterval(function () { clockSubs.forEach(function (f) { f(); }); }, 1000);
    return function () {
      clockSubs = clockSubs.filter(function (f) { return f !== fn; });
      if (!clockSubs.length) { clearInterval(clockTimer); clockTimer = null; }
    };
  }
  function nowSecond() { return Math.floor(Date.now() / 1000) * 1000; }
  function useNow() {
    return useSyncExternalStore ? useSyncExternalStore(subscribeClock, nowSecond, function () { return 0; }) : Date.now();
  }

  function pad(n) { return n < 10 ? "0" + n : String(n); }
  var DAY = 864e5;
  /* null tanpa waktu, 0 sebelum lomba, 1..days selama lomba, days + 1 setelah lomba. */
  function raceDay(now, start, end, days) {
    if (!now) return null;
    if (now < start) return 0;
    if (now > end) return days + 1;
    return Math.min(days, Math.floor((now - start) / DAY) + 1);
  }

  /* Gambar sekali saat terlihat: "static" (utuh), "wait" (siap), "on" (digambar). Reduced motion tetap utuh. */
  function useDraw() {
    var ref = useRef(null);
    var s = useState("static"); var draw = s[0], setDraw = s[1];
    useEffect(function () {
      var el = ref.current;
      if (!el || typeof IntersectionObserver === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      var frame = requestAnimationFrame(function () { setDraw("wait"); });
      var io = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        io.disconnect(); cancelAnimationFrame(frame); setDraw("wait");
        frame = requestAnimationFrame(function () { frame = requestAnimationFrame(function () { setDraw("on"); }); });
      }, { threshold: 0.3 });
      io.observe(el);
      return function () { io.disconnect(); cancelAnimationFrame(frame); };
    }, []);
    return [ref, draw];
  }

  /* Sebelum lomba: hitung mundur. Selama lomba: hari ke-X dari N dengan bar periode. Sesudah: selesai. */
  function Countdown(props) {
    var live = useNow();
    var now = props.now != null ? props.now : live;
    var start = Date.parse(props.start), end = Date.parse(props.end);
    var days = props.days || Math.round((end - start) / DAY);
    var day = raceDay(now, start, end, days);
    var running = day !== null && day >= 1 && day <= days, finished = day === days + 1;
    if (running || finished) {
      var rest = Math.max(0, end - now);
      return h("div", { className: "gs-countdown", role: "timer", "aria-live": "off" },
        h("span", { className: "gs-countdown__status" }, h("span", { className: "gs-countdown__dot", "aria-hidden": "true" }), finished ? "Lomba sudah selesai" : "Lomba berlangsung"),
        running ? h("div", { className: "gs-countdown__day" }, "Hari ke ", h("strong", null, day), " ", h("span", null, "dari " + days)) : null,
        h("div", { className: "gs-countdown__track", role: "img", "aria-label": finished ? "Periode lomba selesai" : "Hari ke-" + day + " dari " + days },
          h("span", { className: "gs-countdown__fill", style: { width: (finished ? 100 : day / days * 100) + "%" } })),
        h("div", { className: "gs-countdown__range" }, finished ? "Panitia melakukan verifikasi final." :
          [props.endLabel ? h("strong", { key: "e" }, "Ditutup " + props.endLabel) : null, " · sisa " + Math.floor(rest / DAY) + " hari " + (Math.floor(rest / 36e5) % 24) + " jam"])
      );
    }
    var left = day === 0 ? Math.max(0, start - now) : 0;
    var units = [[Math.floor(left / DAY), "Hari"], [Math.floor(left / 36e5) % 24, "Jam"], [Math.floor(left / 6e4) % 60, "Menit"], [Math.floor(left / 1e3) % 60, "Detik"]];
    return h("div", { className: "gs-countdown", role: "timer", "aria-live": "off" },
      h("span", { className: "gs-countdown__status" }, h("span", { className: "gs-countdown__dot", "aria-hidden": "true" }), day === 0 ? "Lomba dimulai dalam" : (props.idleLabel || "Periode lomba")),
      h("div", { className: "gs-countdown__units", "aria-hidden": day !== 0 }, units.map(function (u, i) {
        return h("div", { key: i, className: "gs-countdown__unit" },
          h("span", { className: "gs-countdown__num" }, day === 0 ? (i === 0 ? u[0] : pad(u[0])) : "–"),
          h("span", { className: "gs-countdown__cap" }, u[1]));
      })),
      h("div", { className: "gs-countdown__range" }, props.rangeLabel ? h("strong", null, props.rangeLabel) : null, props.rangeNote ? " · " + props.rangeNote : null)
    );
  }

  function fmt(n) { return n.toLocaleString("id-ID", { maximumFractionDigits: 1 }); }

  /* Target tim dibagi rata ke anggota; bagian minimal per anggota ditandai leaf, sisa porsi lime. */
  function TeamBar(props) {
    var target = props.target || 300, memberMin = props.memberMin || 60, max = props.max || 5, members = props.members || max;
    var d = useDraw();
    var per = target / members, minShare = Math.min(1, memberMin / per);
    var slots = []; for (var i = 0; i < max; i++) slots.push(i);
    return h("div", { className: "gs-teambar", ref: d[0], "data-draw": d[1] },
      h("div", { className: "gs-teambar__track", role: "img", "aria-label": target + " km dibagi " + members + " anggota: " + fmt(per) + " km per orang, minimal " + memberMin + " km per orang" },
        slots.map(function (i) {
          return h("span", { key: i, className: "gs-teambar__seg", "data-on": String(i < members), style: { "--i": i } },
            h("span", { className: "gs-teambar__min", style: { width: minShare * 100 + "%" } }));
        })),
      h("div", { className: "gs-teambar__labels", "aria-hidden": "true" }, slots.map(function (i) {
        return h("span", { key: i, "data-on": String(i < members) }, h(Icon, { name: "run", size: 14 }), fmt(per) + " km");
      })),
      h("div", { className: "gs-teambar__legend" },
        h("span", null, h("i", { className: "gs-teambar__key", "aria-hidden": "true" }), "Minimal " + memberMin + " km per anggota"),
        minShare < 1 ? h("span", null, h("i", { className: "gs-teambar__key gs-teambar__key--extra", "aria-hidden": "true" }), "Sisa porsi agar tim mencapai " + target + " km") : null)
    );
  }

  /* Garis rute dari konten 24 KM: garis terang berkelok dengan titik ujung lime. Warna garis mengikuti teks. */
  function Route(props) {
    var d = useDraw();
    return h("svg", { ref: d[0], "data-draw": d[1], className: cx("gs-route", props.className), viewBox: "0 0 400 130", "aria-hidden": "true", style: props.style },
      h("path", { d: "M18 112c70 2 104-6 132-30s22-52 62-54 58 30 104 18 52-26 66-28", pathLength: 1 }),
      h("circle", { cx: 18, cy: 112, r: 9 }), h("circle", { cx: 382, cy: 18, r: 9 }));
  }

  /* Target tim sebagai rute lima ruas di atas band: satu ruas satu anggota, angka kumulatif di tiap titik. */
  var TR_X = [30, 138, 246, 354, 462, 570];
  function trY(i) { return i % 2 ? 36 : 96; }
  var TR_PATH = TR_X.slice(1).reduce(function (d, x, i) { return d + " C" + (TR_X[i] + 54) + " " + trY(i) + " " + (x - 54) + " " + trY(i + 1) + " " + x + " " + trY(i + 1); }, "M" + TR_X[0] + " " + trY(0));
  function TeamRoute(props) {
    var target = props.target || 300, n = 5, memberMin = props.memberMin || 60, per = target / n;
    var d = useDraw();
    function pc(v, of) { return (v / of * 100) + "%"; }
    return h("div", { className: "gs-teamroute", ref: d[0], "data-draw": d[1] },
      h("div", { className: "gs-teamroute__map", role: "img", "aria-label": target + " km dari " + n + " anggota, setiap anggota minimal " + memberMin + " km" },
        h("svg", { viewBox: "0 0 600 132", "aria-hidden": "true" },
          h("path", { className: "gs-teamroute__base", d: TR_PATH }),
          h("path", { className: "gs-teamroute__a", d: TR_PATH, pathLength: n }),
          h("path", { className: "gs-teamroute__b", d: TR_PATH, pathLength: n }),
          TR_X.map(function (x, i) { return h("circle", { key: x, className: i === n ? "gs-teamroute__finish" : "gs-teamroute__stop", cx: x, cy: trY(i), r: i === n ? 12 : 7 }); })),
        TR_X.slice(0, -1).map(function (x, i) {
          return h("span", { key: "r" + x, className: "gs-teamroute__runner", "aria-hidden": "true", style: { left: pc(x + 54, 600), top: pc(66, 132), "--i": i } }, i + 1);
        }),
        TR_X.map(function (x, i) {
          return h("span", { key: "k" + x, "aria-hidden": "true", className: cx("gs-teamroute__km", "gs-teamroute__km--" + (i % 2 ? "up" : "down"), i === n ? "gs-teamroute__km--end" : null), style: { left: pc(x, 600), top: pc(trY(i), 132), "--i": i } },
            i === 0 ? "Mulai" : i === n ? target + " km" : fmt(per * i));
        })),
      props.note !== false ? h("p", { className: "gs-teamroute__note" }, h("span", { className: "gs-teamroute__disc", "aria-hidden": "true" }, "1"),
        "Satu ruas = satu anggota, minimal " + memberMin + " km. Semua anggota boleh berlari di hari yang sama; jarak tim adalah jumlah jarak semuanya.") : null
    );
  }

  /* Grafik kecil aturan harian: limit (rambu batas), submit (dua token unggah), deadline (jam 23.59). */
  function RuleGraphic(props) {
    var kids, n = props.name;
    if (n === "limit") kids = [h("circle", { key: 1, className: "gs-rulegfx__sign", cx: 32, cy: 32, r: 27 }), h("text", { key: 2, x: 32, y: 33 }, props.value)];
    else if (n === "submit") kids = [h("circle", { key: 1, className: "gs-rulegfx__token gs-rulegfx__token--a", cx: 24, cy: 38, r: 18 }), h("path", { key: 2, className: "gs-rulegfx__arrow", d: "M24 46V30m-6 6 6-6 6 6" }),
      h("circle", { key: 3, className: "gs-rulegfx__token gs-rulegfx__token--b", cx: 41, cy: 26, r: 18 }), h("path", { key: 4, className: "gs-rulegfx__arrow gs-rulegfx__arrow--b", d: "M41 34V18m-6 6 6-6 6 6" })];
    else {
      kids = [h("circle", { key: "f", className: "gs-rulegfx__face", cx: 32, cy: 32, r: 28 })];
      for (var i = 0; i < 12; i++) { var a = i * Math.PI / 6; kids.push(h("line", { key: "t" + i, className: i === 0 ? "gs-rulegfx__tick gs-rulegfx__tick--12" : "gs-rulegfx__tick", x1: 32 + 22 * Math.sin(a), y1: 32 - 22 * Math.cos(a), x2: 32 + 26 * Math.sin(a), y2: 32 - 26 * Math.cos(a) })); }
      kids.push(h("line", { key: "h", className: "gs-rulegfx__hand", x1: 32, y1: 32, x2: 31.9, y2: 18 }), h("line", { key: "m", className: "gs-rulegfx__hand gs-rulegfx__hand--min", x1: 32, y1: 32, x2: 29.7, y2: 10.4 }), h("circle", { key: "p", className: "gs-rulegfx__pin", cx: 32, cy: 32, r: 3.5 }));
    }
    return h("svg", { className: cx("gs-rulegfx", "gs-rulegfx--" + n), width: 64, height: 64, viewBox: "0 0 64 64", "aria-hidden": "true" }, kids);
  }

  function KmSplitter(props) {
    var target = props.target || 300, days = props.days || 28, dailyMax = props.dailyMax || 24, memberMin = props.memberMin || 60;
    var options = props.options || [5, 4, 3, 2];
    var s = useState(options[0]); var n = s[0], setN = s[1];
    var per = target / n, perDay = Math.round(per / days * 10) / 10;
    var pos = Math.max(3, Math.min(97, perDay / dailyMax * 100));
    return h("div", { className: "gs-split" },
      h("p", { className: "gs-split__q", id: "gs-split-q" }, props.question || "Berapa orang di timmu?"),
      h("div", { className: "gs-seg", role: "group", "aria-labelledby": "gs-split-q" }, options.map(function (o) {
        return h("button", { key: o, type: "button", "aria-pressed": o === n, onClick: function () { setN(o); } }, o + " orang");
      })),
      h(TeamBar, { target: target, memberMin: memberMin, max: Math.max.apply(null, options), members: n }),
      h("div", { className: "gs-split__out", "aria-live": "polite" },
        h("div", null, h("div", { className: "gs-split__num" }, fmt(per), h("small", null, "km")), h("div", { className: "gs-split__cap" }, "per orang selama " + days + " hari")),
        h("div", null, h("div", { className: "gs-split__num" }, fmt(perDay), h("small", null, "km")), h("div", { className: "gs-split__cap" }, "rata-rata per orang per hari"))
      ),
      h("div", { className: "gs-road" },
        h("div", { className: "gs-road__track", role: "img", "aria-label": "Rata-rata " + fmt(perDay) + " km dari batas " + dailyMax + " km per hari" },
          h("span", { className: "gs-road__done", style: { width: pos + "%" } }),
          h("span", { className: "gs-road__runner", style: { left: pos + "%" } }, h(Icon, { name: "run", size: 18 }))),
        h("div", { className: "gs-split__scale" }, h("span", null, "0 km"), h("span", null, "Batas harian " + dailyMax + " km"))
      )
    );
  }

  /* Cek aktivitas: pace dari jarak dan moving time dibanding rentang pace dan batas harian. */
  function toSec(p) { var a = p.split(":").map(Number); return a[0] * 60 + a[1]; }
  function fmtPace(sec) { var t = Math.round(sec); return Math.floor(t / 60) + ":" + pad(t % 60); }
  function numOrNaN(v) { v = v.trim(); return v === "" ? 0 : /^\d+$/.test(v) ? Number(v) : NaN; }
  function PaceGauge(p) {
    return h("div", { className: "gs-gauge", role: "img", "aria-label": (p.pace ? "Pace " + fmtPace(p.pace) + " menit/km. " : "") + "Rentang yang dihitung " + p.paceFast + " sampai " + p.paceSlow + " menit/km." },
      h("div", { className: "gs-gauge__track" },
        h("span", { className: "gs-gauge__ok", style: { left: p.gpos(p.fast) + "%", right: 100 - p.gpos(p.slow) + "%" } }, p.pace ? null : h("em", null, "Zona dihitung")),
        p.pace ? h("span", { className: "gs-gauge__mark gs-gauge__mark--" + p.verdict, style: { left: p.gpos(p.pace) + "%" } }) : null),
      h("div", { className: "gs-gauge__ticks", "aria-hidden": "true" }, h("span", { style: { left: p.gpos(p.fast) + "%" } }, p.paceFast), h("span", { style: { left: p.gpos(p.slow) + "%" } }, p.paceSlow)),
      h("div", { className: "gs-gauge__ends", "aria-hidden": "true" }, h("span", null, "Lebih cepat"), h("span", null, "Lebih lambat")));
  }

  function ActivityCheck(props) {
    var paceFast = props.paceFast || "5:00", paceSlow = props.paceSlow || "15:00", dailyMax = props.dailyMax || 24;
    var FAST = toSec(paceFast), SLOW = toSec(paceSlow), GMIN = 180, GMAX = 1080;
    function gpos(x) { return Math.max(0, Math.min(100, (x - GMIN) / (GMAX - GMIN) * 100)); }
    var k = useState(""), hh = useState(""), mm = useState(""), ss = useState("");
    var dist = /^\d+([.,]\d+)?$/.test(k[0].trim()) ? Number(k[0].trim().replace(",", ".")) : NaN;
    var t = [numOrNaN(hh[0]), numOrNaN(mm[0]), numOrNaN(ss[0])];
    var secs = t[0] * 3600 + t[1] * 60 + t[2];
    var touched = [k[0], hh[0], mm[0], ss[0]].some(function (v) { return v.trim() !== ""; });
    var error = "";
    if (touched) {
      if (!(dist > 0)) error = "Isi jarak dalam km, misalnya 3,2.";
      else if (t.some(isNaN)) error = "Moving time diisi dengan angka bulat.";
      else if (!(secs > 0)) error = "Isi moving time dari Strava.";
    }
    var ready = touched && !error, pace = ready ? secs / dist : 0, speed = ready ? dist / (secs / 3600) : 0;
    var verdict = !ready ? null : pace < FAST ? "fast" : pace > SLOW ? "slow" : "ok";
    function field(id, label, st, mode, ph) {
      return h("div", { className: "gs-check__field" }, h("label", { htmlFor: id }, label),
        h("input", { id: id, type: "text", inputMode: mode, autoComplete: "off", placeholder: ph, value: st[0], onChange: function (e) { st[1](e.target.value); } }));
    }
    var msg = verdict === "ok" ? [h("strong", { key: "s" }, "Masuk rentang pace"), fmt(Math.min(dist, dailyMax)) + " km bisa dihitung untuk timmu." + (dist > dailyMax ? " Jarak di atas " + dailyMax + " km dalam sehari tidak menambah jarak tim." : "")]
      : verdict === "fast" ? [h("strong", { key: "s" }, "Terlalu cepat, tidak dihitung"), "Pace di bawah " + paceFast + " menit/km. Bila kamu tidak secepat itu, kemungkinan GPS melompat atau aktivitas terekam saat berkendara."]
      : [h("strong", { key: "s" }, "Terlalu lambat, tidak dihitung"), "Pace di atas " + paceSlow + " menit/km. Pastikan yang diisi moving time, bukan elapsed time."];
    return h("div", { className: cx("gs-check", props.wide ? "gs-check--wide" : null), id: props.id },
      h("div", { className: "gs-check__head" }, h("h3", null, props.title || "Cek aktivitasmu"), h("p", null, "Isi jarak dan moving time dari Strava, lihat apakah aktivitasmu dihitung.")),
      h("div", { className: "gs-check__inputs" },
        field("gs-chk-km", "Jarak (km)", k, "decimal", "3,2"),
        h("fieldset", { className: "gs-check__time" }, h("legend", null, "Moving time"),
          h("div", { className: "gs-check__time-row" }, field("gs-chk-h", "Jam", hh, "numeric", "0"), field("gs-chk-m", "Menit", mm, "numeric", "38"), field("gs-chk-s", "Detik", ss, "numeric", "20")))),
      h("div", { className: "gs-check__out", "aria-live": "polite" },
        !touched ? [h(PaceGauge, { key: "g", paceFast: paceFast, paceSlow: paceSlow, fast: FAST, slow: SLOW, gpos: gpos }),
          h("div", { key: "e", className: "gs-check__empty" },
            h("p", null, h(Icon, { name: "clock", size: 20 }), "Pace yang dihitung sekitar 4 sampai 12 km/jam: jalan cepat sampai lari."),
            h("button", { type: "button", className: "gs-btn gs-btn--secondary gs-btn--sm", onClick: function () { k[1]("5"); hh[1](""); mm[1]("40"); ss[1](""); } }, h("span", null, "Coba contoh: 5 km, 40 menit")))] : null,
        error ? h("p", { className: "gs-check__error" }, h(Icon, { name: "alert", size: 20 }), error) : null,
        verdict ? [
          h("div", { key: "p", className: "gs-check__pace" }, h("span", { className: "gs-check__num" }, fmtPace(pace), h("small", null, "menit/km")), h("span", { className: "gs-check__speed" }, fmt(speed) + " km/jam")),
          h(PaceGauge, { key: "g", pace: pace, verdict: verdict, paceFast: paceFast, paceSlow: paceSlow, fast: FAST, slow: SLOW, gpos: gpos }),
          h("div", { key: "v", className: "gs-check__verdict gs-check__verdict--" + verdict }, h(Icon, { name: verdict === "ok" ? "check" : "ban", size: 22, strokeWidth: 2.5 }), h("div", null, msg))
        ] : null),
      h("p", { className: "gs-check__note" }, "Perkiraan dari aturan pace dan batas " + dailyMax + " km per hari. Hasil akhir mengikuti verifikasi panitia.")
    );
  }

  /* Kalender periode lomba: minggu Senin sampai Minggu, hari lewat leaf, hari ini sun. */
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  function RaceCalendar(props) {
    var live = useNow();
    var now = props.now != null ? props.now : live;
    var start = Date.parse(props.start), end = Date.parse(props.end);
    var days = props.days || 28, target = props.target || 300;
    var day = raceDay(now, start, end, days);
    var d = useDraw();
    var ymd = props.start.slice(0, 10).split("-").map(Number), base = Date.UTC(ymd[0], ymd[1] - 1, ymd[2]);
    var cells = []; for (var i = 0; i < days; i++) { var dt = new Date(base + i * DAY); cells.push({ i: i, date: dt.getUTCDate(), month: dt.getUTCMonth() }); }
    var last = days - 1, nW = days / 7, perWeek = target / nW, perDay = Math.round(target / days * 10) / 10;
    var running = day !== null && day >= 1 && day <= days, curWeek = running ? Math.ceil(day / 7) - 1 : -1;
    function st(i) { return day === null ? "next" : i + 1 < day ? "done" : i + 1 === day ? "today" : "next"; }
    var line = "Dimulai Senin " + cells[0].date + " " + MONTHS[cells[0].month] + ", ditutup Minggu " + cells[last].date + " " + MONTHS[cells[last].month] + ".";
    if (day === 0) line = "Mulai dalam " + Math.ceil((start - now) / DAY) + " hari. " + line;
    if (running) line = "Hari ke-" + day + " dari " + days + ", sisa " + (days - day) + " hari setelah hari ini.";
    if (day === days + 1) line = "Lomba selesai. Panitia melakukan verifikasi final.";
    var grid = [h("span", { key: "wh", className: "gs-cal__wk gs-cal__head" })];
    ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].forEach(function (x) { grid.push(h("span", { key: x, className: "gs-cal__dow" }, x)); });
    grid.push(h("span", { key: "gh", className: "gs-cal__goal gs-cal__head" }, "Target tim"));
    for (var w = 0; w < nW; w++) {
      grid.push(h("div", { key: "w" + w, className: cx("gs-cal__row", w === curWeek ? "is-current" : null) },
        h("span", { className: "gs-cal__wk" }, "Mg " + (w + 1)),
        cells.slice(w * 7, w * 7 + 7).map(function (c) {
          var edge = c.i === 0 ? "start" : c.i === last ? "finish" : "";
          return h("span", { key: c.i, className: cx("gs-cal__day", "gs-cal__day--" + st(c.i), edge ? "gs-cal__day--" + edge : null), style: { "--i": c.i } },
            edge ? h("small", null, edge === "start" ? "Mulai" : "Finis") : c.date === 1 ? h("small", null, MONTHS[c.month]) : null, c.date);
        }),
        h("span", { className: "gs-cal__goal", style: { "--i": w } }, h("i", { style: { width: (w + 1) / nW * 100 + "%" } }), h("b", null, fmt(perWeek * (w + 1))), " km")));
    }
    return h("figure", { className: "gs-cal", ref: d[0], "data-draw": d[1] },
      h("div", { className: "gs-cal__top" }, h("h3", { className: "gs-cal__title" }, "Rencana " + nW + " minggu"),
        h("span", { className: "gs-cal__range" }, cells[0].date + " " + MONTHS[cells[0].month] + " – " + cells[last].date + " " + MONTHS[cells[last].month] + " " + new Date(base).getUTCFullYear())),
      h("div", { className: "gs-cal__grid", "aria-hidden": "true" }, grid),
      h("div", { className: "gs-cal__legend", "aria-hidden": "true" },
        h("span", null, h("i", { className: "is-edge" }), "Mulai dan finis"),
        running ? [h("span", { key: 1 }, h("i"), "Sudah lewat"), h("span", { key: 2 }, h("i", { className: "is-today" }), "Hari ini")] : null),
      h("figcaption", { className: "gs-cal__caption" }, h(Icon, { name: "route", size: 18 }),
        h("span", null, h("strong", null, "Kejar " + fmt(perWeek) + " km per minggu, atau sekitar " + fmt(perDay) + " km per hari untuk satu tim."), " " + line))
    );
  }

  /* Ilustrasi penghargaan bergaya set ikon. Ilustrasi, bukan foto medali atau jersey resmi. */
  function Illustration(props) {
    var size = props.size || 88, n = props.name, kids;
    if (n === "medal") kids = [h("path", { key: 1, className: "gs-illo__soft", d: "M28 6h14l12 30H40z" }), h("path", { key: 2, className: "gs-illo__soft", d: "M68 6H54L42 36h14z" }),
      h("circle", { key: 3, className: "gs-illo__fill", cx: 48, cy: 62, r: 24 }), h("circle", { key: 4, cx: 48, cy: 62, r: 16 }), h("path", { key: 5, d: "M40 63l6 6 11-13" })];
    else if (n === "jersey") kids = [h("path", { key: 1, className: "gs-illo__soft", d: "M35 12 22 17 8 31l10 11 8-6v48h44V36l8 6 10-11-14-14-13-5c-2 6-7 10-13 10s-11-4-13-10z" }),
      h("path", { key: 2, className: "gs-illo__fill", stroke: "none", d: "M27 66 69 46v12L27 78z" }), h("path", { key: 3, d: "M26 36v48h44V36" })];
    else kids = [h("path", { key: 1, d: "M30 22H19v6c0 8 5 13 12 13M66 22h11v6c0 8-5 13-12 13" }), h("path", { key: 2, className: "gs-illo__fill", d: "M30 12h36v22c0 11-8 20-18 20s-18-9-18-20z" }),
      h("path", { key: 3, d: "M44 54v10h8V54" }), h("rect", { key: 4, className: "gs-illo__soft", x: 32, y: 64, width: 32, height: 9, rx: 2 }), h("rect", { key: 5, className: "gs-illo__soft", x: 26, y: 73, width: 44, height: 11, rx: 2 })];
    return h("svg", { className: "gs-illo", width: size, height: size, viewBox: "0 0 96 96", fill: "none", stroke: "currentColor", strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" }, kids);
  }

  /* Tangga penghargaan: anak tangga naik dari yang paling banyak penerimanya; anak tangga terakhir di band. MVP jalur terpisah. */
  function RewardLadder(props) {
    var d = useDraw();
    var steps = props.steps || [];
    return h("div", { className: "gs-ladder", ref: d[0], "data-draw": d[1] },
      h("ol", { className: "gs-ladder__steps" }, steps.map(function (r, i) {
        return h("li", { key: i, className: cx("gs-ladder__step", i === steps.length - 1 ? "gs-ladder__step--top" : null), style: { "--i": i } },
          h(Illustration, { name: r.illustration }),
          h("span", { className: "gs-ladder__who" }, r.who), h("h3", { className: "gs-ladder__title" }, r.title), r.body ? h("p", { className: "gs-ladder__body" }, r.body) : null);
      })),
      props.side ? h("div", { className: "gs-ladder__mvp" },
        h("span", { className: "gs-ladder__mvp-disc" }, h(Icon, { name: props.side.icon || "run", size: 26 })),
        h("div", null, h("span", { className: "gs-ladder__who" }, props.side.who), h("h3", { className: "gs-ladder__title" }, props.side.title), props.side.body ? h("p", { className: "gs-ladder__body" }, props.side.body) : null)) : null
    );
  }

  /* Satu tahap linimasa: chip tanggal (pre kecil, day besar, month), garis penyambung, tahap "now" menjadi kartu. */
  function ScheduleItem(props) {
    var status = props.status || "next", chip = props.chip || {};
    return h("li", { className: cx("gs-sched", "gs-sched--" + status) },
      h("span", { className: "gs-sched__chip", "aria-hidden": "true" },
        chip.pre ? h("small", null, chip.pre) : null,
        chip.day ? h("b", { className: chip.day.length > 2 ? "is-long" : null }, chip.day) : h(Icon, { name: "flag", size: 22 }),
        chip.month ? h("small", null, chip.month) : null,
        status === "done" ? h("span", { className: "gs-sched__done" }, h(Icon, { name: "check", size: 12, strokeWidth: 3.5 })) : null),
      h("div", { className: "gs-sched__card" },
        h("div", { className: "gs-sched__date" }, props.date,
          status === "now" ? h("span", { className: "gs-sched__badge" }, "Sekarang") : null,
          status === "done" ? h("span", { className: "gs-sched__past" }, "Selesai") : null),
        h("h3", { className: "gs-sched__title" }, props.title),
        props.children ? h("p", { className: "gs-sched__body" }, props.children) : null
      )
    );
  }

  function RewardCard(props) {
    return h("article", { className: cx("gs-reward", props.feature ? "gs-reward--feature" : null) },
      h("span", { className: "gs-reward__icon" }, h(Icon, { name: props.icon || "medal", size: 24 })),
      h("span", { className: "gs-reward__who" }, props.who),
      h("h3", { className: "gs-reward__title" }, props.title),
      props.children ? h("p", { className: "gs-reward__body" }, props.children) : null
    );
  }

  /* Langkah aplikasi: daftar di kiri dan ponsel di kanan. Di ponsel: tab nomor, layar, lalu keterangan langkah aktif. */
  function AppSteps(props) {
    var steps = props.steps || [];
    var s = useState(0); var active = s[0], setActive = s[1];
    function go(i, focus) { setActive(i); if (focus) { var el = document.getElementById("gs-step-" + i); if (el) el.focus(); } }
    function onKey(e) {
      var fwd = e.key === "ArrowDown" || e.key === "ArrowRight", back = e.key === "ArrowUp" || e.key === "ArrowLeft";
      if (!fwd && !back) return;
      e.preventDefault();
      go((active + (fwd ? 1 : steps.length - 1)) % steps.length, true);
    }
    var cur = steps[active] || {};
    return h("div", { className: "gs-steps" },
      h("ol", { className: "gs-steps__list", role: "tablist", "aria-label": props.label || "Langkah", onKeyDown: onKey }, steps.map(function (st, i) {
        return h("li", { key: i },
          h("button", { id: "gs-step-" + i, type: "button", role: "tab", className: "gs-step", "aria-selected": i === active, "aria-controls": "gs-step-panel", tabIndex: i === active ? 0 : -1, onClick: function () { setActive(i); } },
            h("span", { className: "gs-step__num" }, i + 1),
            h("span", { className: "gs-step__text" }, h("span", { className: "gs-step__title" }, st.title), h("span", { className: "gs-step__body" }, st.body)),
            h("span", { className: "gs-step__bar", "aria-hidden": "true" }, h("i", { key: active }))
          ));
      })),
      h("div", { className: "gs-steps__panel", role: "tabpanel", id: "gs-step-panel", "aria-labelledby": "gs-step-" + active },
        h("div", { className: "gs-phone" },
          h("div", { className: "gs-phone__screen" }, steps.map(function (st, i) {
            return h("img", { key: i, src: st.image, alt: i === active ? st.alt : "", className: i === active ? "is-on" : null, loading: "lazy" });
          }))),
        h("div", { className: "gs-steps__caption" },
          h("span", { className: "gs-steps__count" }, "Langkah " + (active + 1) + " dari " + steps.length),
          h("p", { className: "gs-steps__title" }, cur.title), h("p", { className: "gs-steps__body" }, cur.body),
          active < steps.length - 1 ? h("button", { type: "button", className: "gs-btn gs-btn--secondary gs-btn--sm", onClick: function () { go(active + 1); } }, h("span", null, "Langkah " + (active + 2))) : null)
      )
    );
  }

  function AppCard(props) {
    return h("div", { className: "gs-app" },
      h("img", { className: "gs-app__icon", src: props.icon, alt: "" }),
      h("div", null, h("h3", { className: "gs-app__name" }, props.name), h("p", { className: "gs-app__role" }, props.role)),
      h("div", { className: "gs-app__stores" },
        props.appStore ? h("a", { className: "gs-store", href: props.appStore, target: "_blank", rel: "noopener noreferrer" }, h("img", { src: props.appStoreBadge, alt: props.name + " di App Store" })) : null,
        props.playStore ? h("a", { className: "gs-store", href: props.playStore, target: "_blank", rel: "noopener noreferrer" }, h("img", { src: props.playStoreBadge, alt: props.name + " di Google Play" })) : null
      )
    );
  }

  function Chip(props) {
    return h("button", { type: "button", className: cx("gs-chip", props.quiet ? "gs-chip--quiet" : null), "aria-pressed": props.quiet ? undefined : !!props.pressed, onClick: props.onClick },
      props.icon ? h(Icon, { name: props.icon, size: 18 }) : null,
      h("span", null, props.children),
      props.count != null ? h("span", { className: "gs-chip__count" }, props.count) : null
    );
  }

  function SearchField(props) {
    var id = props.id || "gs-search";
    return h("div", { className: "gs-search" },
      props.label ? h("label", { className: "gs-search__label", htmlFor: id }, props.label) : null,
      h("div", { className: "gs-search__field" },
        h(Icon, { name: "search", size: 20, className: "gs-search__icon" }),
        h("input", { id: id, type: "search", value: props.value, placeholder: props.placeholder, autoComplete: "off", "aria-label": props.label ? undefined : props.placeholder,
          onChange: function (e) { props.onChange && props.onChange(e.target.value); } }),
        h("span", { className: "gs-search__end" },
          props.value ? h("button", { type: "button", className: "gs-search__clear", "aria-label": "Hapus pencarian", onClick: function () { props.onChange && props.onChange(""); } }, h(Icon, { name: "close", size: 16 }))
            : h("kbd", { className: "gs-search__kbd", "aria-hidden": "true" }, "/"))
      )
    );
  }

  function FaqItem(props) {
    var s = useState(!!props.defaultOpen); var open = props.open != null ? props.open : s[0];
    var setOpen = function (v) { if (props.onToggle) props.onToggle(v); else s[1](v); };
    var pid = (props.id || "faq") + "-panel";
    return h("div", { className: cx("gs-faq", open ? "gs-faq--open" : null), id: props.id },
      h("button", { type: "button", className: "gs-faq__q", "aria-expanded": open, "aria-controls": pid, onClick: function () { setOpen(!open); } },
        h("span", null, props.question),
        h("span", { className: "gs-faq__toggle", "aria-hidden": "true" }, h(Icon, { name: "chevron-down", size: 18 }))
      ),
      h("div", { className: "gs-faq__panel", id: pid, role: "region", "aria-hidden": !open },
        h("div", { className: "gs-faq__inner" }, h("div", { className: "gs-faq__body" }, props.children))
      )
    );
  }

  var CALLOUT_ICON = { attention: "alert", info: "info", rule: "ban" };
  function Callout(props) {
    var tone = props.tone || "attention";
    return h("div", { className: cx("gs-callout", "gs-callout--" + tone), role: tone === "rule" ? "note" : undefined },
      h(Icon, { name: props.icon || CALLOUT_ICON[tone], size: 20, className: "gs-callout__icon" }),
      h("div", null, props.title ? h("strong", { className: "gs-callout__title" }, props.title) : null, props.children)
    );
  }

  function DocumentCard(props) {
    return h("a", { className: "gs-doc", href: props.href, download: props.download || true },
      h("span", { className: "gs-doc__icon" }, h(Icon, { name: "document", size: 26 }), h("span", { className: "gs-doc__type" }, props.type || "PDF")),
      h("span", null,
        h("h3", { className: "gs-doc__title" }, props.title),
        h("p", { className: "gs-doc__desc" }, props.description),
        props.size ? h("span", { className: "gs-doc__meta" }, props.size, props.note ? h("span", { className: "gs-doc__note" }, props.note) : null) : null
      ),
      h("span", { className: "gs-doc__go", "aria-hidden": "true" }, h(Icon, { name: "download", size: 20 }))
    );
  }

  function Navbar(props) {
    var s = useState(false); var open = s[0], setOpen = s[1];
    var sc = useState(false); var scrolled = sc[0], setScrolled = sc[1];
    useEffect(function () {
      function onScroll() { setScrolled(window.scrollY > 8); }
      onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
      return function () { window.removeEventListener("scroll", onScroll); };
    }, []);
    var links = props.links || [];
    return h("header", { className: cx("gs-nav gs-on-band", scrolled ? "gs-nav--scrolled" : null) },
      h("div", { className: "gs-nav__bar" },
        h("a", { className: "gs-nav__logos", href: props.homeHref || "#top", "aria-label": props.homeLabel || "Beranda" },
          (props.logos || []).map(function (l, i) {
            return h("span", { key: i, className: "gs-nav__logo" }, h("img", { src: l.src, alt: l.alt }));
          })),
        h("nav", { className: "gs-nav__links", "aria-label": "Utama" }, links.map(function (l) {
          return h("a", { key: l.href, href: l.href, "aria-current": l.current ? "true" : undefined }, l.label);
        })),
        props.cta ? h(Button, { variant: "lime", className: "gs-nav__cta", href: props.cta.href, size: "sm", external: props.cta.external }, props.cta.label) : null,
        h("button", { type: "button", className: "gs-nav__toggle", "aria-expanded": open, "aria-label": open ? "Tutup menu" : "Buka menu", onClick: function () { setOpen(!open); } },
          h(Icon, { name: open ? "close" : "chevron-down", size: 20 }))
      ),
      h("div", { className: "gs-nav__sheet", "data-open": open ? "true" : "false" },
        links.map(function (l) { return h("a", { key: l.href, href: l.href, onClick: function () { setOpen(false); } }, l.label); }),
        props.cta ? h(Button, { variant: "lime", href: props.cta.href, external: props.cta.external }, props.cta.label) : null
      )
    );
  }

  window.GreenStride = Object.assign(window.GreenStride || {}, {
    Icon: Icon, Button: Button, SectionHeader: SectionHeader, Pillar: Pillar, FactTile: FactTile, Countdown: Countdown,
    KmSplitter: KmSplitter, TeamBar: TeamBar, TeamRoute: TeamRoute, RuleGraphic: RuleGraphic, Route: Route, ActivityCheck: ActivityCheck, RaceCalendar: RaceCalendar, RewardLadder: RewardLadder, Illustration: Illustration, ScheduleItem: ScheduleItem, RewardCard: RewardCard, AppSteps: AppSteps, AppCard: AppCard,
    Chip: Chip, SearchField: SearchField, FaqItem: FaqItem, Callout: Callout, DocumentCard: DocumentCard, Navbar: Navbar,
    iconNames: Object.keys(ICONS)
  });
})();
