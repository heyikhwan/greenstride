/* @ds-bundle: {"format":4,"namespace":"GreenStride","components":[{"name":"Button"},{"name":"Icon"},{"name":"SectionHeader"},{"name":"Pillar"},{"name":"FactTile"},{"name":"Countdown"},{"name":"KmSplitter"},{"name":"ScheduleItem"},{"name":"RewardCard"},{"name":"AppSteps"},{"name":"AppCard"},{"name":"Chip"},{"name":"SearchField"},{"name":"FaqItem"},{"name":"Callout"},{"name":"DocumentCard"},{"name":"Navbar"}]} */
(function () {
  "use strict";
  var React = window.React;
  var h = React.createElement;
  var useState = React.useState, useEffect = React.useEffect, useSyncExternalStore = React.useSyncExternalStore;

  var ICONS = {"run": "<circle cx=\"15.5\" cy=\"4.5\" r=\"2\"/><path d=\"M8 21l3.2-5.6 3.3 2.6V21\"/><path d=\"M6 11.5l3-3.2h4.2l2.3 3.4 3 .8\"/><path d=\"M11.2 15.4l1.6-6.9\"/><path d=\"M5 15.5h3.2l1.3-2.3\"/>", "team": "<circle cx=\"9\" cy=\"8\" r=\"3.2\"/><path d=\"M3 20c.5-3.6 2.9-5.6 6-5.6s5.5 2 6 5.6\"/><circle cx=\"17.2\" cy=\"9\" r=\"2.4\"/><path d=\"M16 14.6c2.6-.3 4.6 1.3 5 4.4\"/>", "route": "<circle cx=\"6\" cy=\"18\" r=\"2.2\"/><circle cx=\"18\" cy=\"6\" r=\"2.2\"/><path d=\"M8.2 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.8\"/>", "calendar": "<rect x=\"3.5\" y=\"5\" width=\"17\" height=\"15.5\" rx=\"3\"/><path d=\"M3.5 10h17M8 3v4M16 3v4\"/><path d=\"M8 14h2M14 14h2M8 17h2\"/>", "clock": "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"M12 7.5V12l3 2\"/>", "upload": "<path d=\"M12 15V4m0 0L7.5 8.5M12 4l4.5 4.5\"/><path d=\"M4 14.5v3.5A2 2 0 0 0 6 20h12a2 2 0 0 0 2-2v-3.5\"/>", "medal": "<circle cx=\"12\" cy=\"15\" r=\"5\"/><path d=\"M8.6 3h-3l3.7 7.4M15.4 3h3l-3.7 7.4M9.5 3l2.5 5 2.5-5\"/><path d=\"M12 13v4\"/>", "trophy": "<path d=\"M8 4h8v5a4 4 0 0 1-8 0V4z\"/><path d=\"M8 6H4.5v1.5A3.5 3.5 0 0 0 8 11M16 6h3.5v1.5A3.5 3.5 0 0 1 16 11\"/><path d=\"M12 13v4M8.5 20.5h7M10 17h4l.5 3.5h-5z\"/>", "phone": "<rect x=\"6.5\" y=\"2.5\" width=\"11\" height=\"19\" rx=\"2.6\"/><path d=\"M10.5 18.5h3\"/>", "gps": "<circle cx=\"12\" cy=\"12\" r=\"6\"/><circle cx=\"12\" cy=\"12\" r=\"2\"/><path d=\"M12 2.5V6M12 18v3.5M2.5 12H6M18 12h3.5\"/>", "shield-check": "<path d=\"M12 3l7.5 3v5.5c0 4.6-3.2 8-7.5 9.5-4.3-1.5-7.5-4.9-7.5-9.5V6z\"/><path d=\"M8.8 12.2l2.2 2.2 4.4-4.6\"/>", "lifebuoy": "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><circle cx=\"12\" cy=\"12\" r=\"3.5\"/><path d=\"M6 6l3.5 3.5M14.5 14.5L18 18M18 6l-3.5 3.5M9.5 14.5L6 18\"/>", "document": "<path d=\"M6 3h8l4.5 4.5V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z\"/><path d=\"M13.5 3v5h5M8 13h8M8 16.5h5\"/>", "download": "<path d=\"M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5\"/><path d=\"M4.5 19.5h15\"/>", "search": "<circle cx=\"11\" cy=\"11\" r=\"6.5\"/><path d=\"M20 20l-4.2-4.2\"/>", "arrow-right": "<path d=\"M4.5 12h14M13 6.5l5.5 5.5-5.5 5.5\"/>", "chevron-down": "<path d=\"M6 9.5l6 6 6-6\"/>", "alert": "<path d=\"M12 4l9 15.5H3z\"/><path d=\"M12 10v4M12 17.2v.3\"/>", "heart-pulse": "<path d=\"M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z\"/><path d=\"M4.8 12h3.4l1.6-2.6 2.4 5 1.6-2.4h5.4\"/>", "flag": "<path d=\"M5 21V4\"/><path d=\"M5 4.5h11.5l-2 4 2 4H5\"/>", "check": "<path d=\"M5 12.5l4.5 4.5L19 7.5\"/>", "close": "<path d=\"M6 6l12 12M18 6L6 18\"/>", "info": "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"M12 11v5.5M12 7.6v.4\"/>", "ban": "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"M6 6l12 12\"/>"};

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

  function Countdown(props) {
    var live = useNow();
    var now = props.now != null ? props.now : live;
    var start = Date.parse(props.start), end = Date.parse(props.end);
    var target, status;
    if (!now) { status = props.idleLabel || "Periode lomba"; target = null; }
    else if (now < start) { status = "Lomba dimulai dalam"; target = start; }
    else if (now <= end) { status = "Lomba berlangsung, sisa waktu"; target = end; }
    else { status = "Lomba sudah selesai"; target = null; }
    var left = target ? Math.max(0, target - now) : 0;
    var d = Math.floor(left / 864e5), hh = Math.floor(left / 36e5) % 24, mm = Math.floor(left / 6e4) % 60, ss = Math.floor(left / 1e3) % 60;
    var units = [[d, "Hari"], [hh, "Jam"], [mm, "Menit"], [ss, "Detik"]];
    return h("div", { className: "gs-countdown", role: "timer", "aria-live": "off" },
      h("span", { className: "gs-countdown__status" }, h("span", { className: "gs-countdown__dot", "aria-hidden": "true" }), status),
      target ? h("div", { className: "gs-countdown__units" }, units.map(function (u, i) {
        return h("div", { key: i, className: "gs-countdown__unit" },
          h("span", { className: "gs-countdown__num" }, i === 0 ? u[0] : pad(u[0])),
          h("span", { className: "gs-countdown__cap" }, u[1]));
      })) : null,
      h("div", { className: "gs-countdown__range" }, props.rangeLabel ? h("strong", null, props.rangeLabel) : null, props.rangeNote ? " · " + props.rangeNote : null)
    );
  }

  function fmt(n) { return n.toLocaleString("id-ID", { maximumFractionDigits: 1, minimumFractionDigits: n % 1 ? 1 : 0 }); }

  function KmSplitter(props) {
    var target = props.target || 300, days = props.days || 28, dailyMax = props.dailyMax || 24, memberMin = props.memberMin || 60;
    var options = props.options || [5, 4, 3, 2];
    var s = useState(options[0]); var n = s[0], setN = s[1];
    var per = target / n, perDay = per / days;
    return h("div", { className: "gs-split" },
      h("p", { className: "gs-split__q", id: "gs-split-q" }, props.question || "Berapa orang di timmu?"),
      h("div", { className: "gs-seg", role: "group", "aria-labelledby": "gs-split-q" }, options.map(function (o) {
        return h("button", { key: o, type: "button", "aria-pressed": o === n, onClick: function () { setN(o); } }, o + " orang");
      })),
      h("div", { className: "gs-split__out", "aria-live": "polite" },
        h("div", null, h("div", { className: "gs-split__num" }, fmt(per), h("small", null, "km")), h("div", { className: "gs-split__cap" }, "per orang selama " + days + " hari")),
        h("div", null, h("div", { className: "gs-split__num" }, fmt(Math.round(perDay * 10) / 10), h("small", null, "km")), h("div", { className: "gs-split__cap" }, "rata-rata per orang per hari"))
      ),
      h("div", { className: "gs-split__meter" },
        h("div", { className: "gs-split__track", role: "img", "aria-label": "Rata-rata " + fmt(Math.round(perDay * 10) / 10) + " km dari batas " + dailyMax + " km per hari" },
          h("span", { className: "gs-split__fill", style: { width: Math.min(100, perDay / dailyMax * 100) + "%" } })),
        h("div", { className: "gs-split__scale" }, h("span", null, "0 km"), h("span", null, "Batas harian " + dailyMax + " km"))
      ),
      props.footnote !== false ? h(Callout, { tone: "info", title: "Syarat finisher" }, "Total tim minimal " + target + " km dan setiap anggota minimal " + memberMin + " km.") : null
    );
  }

  function ScheduleItem(props) {
    var status = props.status || "next";
    return h("li", { className: cx("gs-sched", "gs-sched--" + status) },
      h("span", { className: "gs-sched__dot", "aria-hidden": "true" }, status === "done" ? h(Icon, { name: "check", size: 14, strokeWidth: 3 }) : null),
      h("div", null,
        h("div", { className: "gs-sched__date" }, props.date, status === "now" ? h("span", { className: "gs-sched__badge" }, "Sekarang") : null),
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

  /* Langkah aplikasi: daftar langkah di kiri, layar ponsel di kanan berganti saat langkah dipilih. */
  function AppSteps(props) {
    var steps = props.steps || [];
    var s = useState(0); var active = s[0], setActive = s[1];
    function onKey(e) {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      e.preventDefault();
      var next = (active + (e.key === "ArrowDown" ? 1 : steps.length - 1)) % steps.length;
      setActive(next);
      var el = document.getElementById("gs-step-" + next); if (el) el.focus();
    }
    return h("div", { className: "gs-steps" },
      h("ol", { className: "gs-steps__list", role: "tablist", "aria-orientation": "vertical", onKeyDown: onKey }, steps.map(function (st, i) {
        return h("li", { key: i },
          h("button", { id: "gs-step-" + i, type: "button", role: "tab", className: "gs-step", "aria-selected": i === active, tabIndex: i === active ? 0 : -1, onClick: function () { setActive(i); } },
            h("span", { className: "gs-step__num" }, i + 1),
            h("span", null, h("h3", { className: "gs-step__title" }, st.title), h("p", { className: "gs-step__body" }, st.body)),
            h("span", { className: "gs-step__bar", "aria-hidden": "true" }, h("i", { key: active }))
          ));
      })),
      h("div", { className: "gs-phone", role: "tabpanel" },
        h("div", { className: "gs-phone__screen" }, steps.map(function (st, i) {
          return h("img", { key: i, src: st.image, alt: i === active ? st.alt : "", className: i === active ? "is-on" : null, loading: "lazy" });
        }))
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
        props.size ? h("div", { className: "gs-doc__meta" }, props.size) : null
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
    KmSplitter: KmSplitter, ScheduleItem: ScheduleItem, RewardCard: RewardCard, AppSteps: AppSteps, AppCard: AppCard,
    Chip: Chip, SearchField: SearchField, FaqItem: FaqItem, Callout: Callout, DocumentCard: DocumentCard, Navbar: Navbar,
    iconNames: Object.keys(ICONS)
  });
})();
