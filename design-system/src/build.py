"""Membangun berkas sistem desain GreenStride 2026 di design-system/project/.

Menulis bundle.js (dari bundle.template.js + ikon), index.d.ts, README dan preview tiap
komponen, README grup aset, sampul, dan indeks design-system.json.
Jalankan: python -I design-system/src/build.py
"""
import json, os, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, "project")
SRC = os.path.join(ROOT, "src")


def w(rel, text):
    path = os.path.join(P, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(text)


# ───────── unggahan (id dari penyimpanan aset artifact)
BLOBS = {
    "Icons": {
        "alert.svg": ("746082cee032516d3bba8c226439c8c6", 252), "arrow-right.svg": ("1a6594d5062c98e3fb6535429ae13b9b", 233),
        "calendar.svg": ("675e79f84718f00848162b0ea2a5b5b8", 322), "check.svg": ("07287cb5a31c3233a97496060d47c1b3", 222),
        "chevron-down.svg": ("787ad2747430735e6c446ffbc1d4216c", 214), "clock.svg": ("69ca86ff98a4205e8925a79ef4a2e035", 255),
        "close.svg": ("a895e22ab4ad73b18ae9e624288050ca", 220), "document.svg": ("f48383a3540c09a533fcca4cf6c1ed7b", 309),
        "download.svg": ("3f8b9da50e58740676e42f11131a1f6c", 265), "flag.svg": ("95c749c04ceb484b304c938c518fe687", 247),
        "gps.svg": ("0a0dcc0b8382b35dd6b52ec4ef622c99", 316), "heart-pulse.svg": ("6157f80c9bad29f67c2c87c02ef96511", 345),
        "lifebuoy.svg": ("9ac8cd7cbef7fa2e0c0e5ac7275439e7", 338), "medal.svg": ("d495382dff0a39a0f8e1e62642628673", 318),
        "phone.svg": ("3232f1e36656f0b8fa6986837abda857", 273), "route.svg": ("94a044545faddc9f40f0752d90c9ecfa", 324),
        "run.svg": ("7568a99ac7d016b6949bde2150eb6719", 387), "search.svg": ("85625a93523841d8c4993856b4079057", 256),
        "shield-check.svg": ("76b8641225e7748f371803c84e42086d", 305), "team.svg": ("1f59d12a9f529d0cc85cbc325eee242e", 366),
        "trophy.svg": ("189c08b212fb35d5794a7147eff6daaf", 363), "upload.svg": ("763e6f195e73fa14af849780f3c4092f", 299),
        "info.svg": ("122a76ac8a02536f2d6bf9e3bee7ff5e", 261), "ban.svg": ("13c78b25514d2253569ab51e2f75c40e", 251),
    },
    "Logos": {
        "logo-planters-club-horizontal.png": ("3c64c7dd2d99f20e98648dfac8e87307", 34787), "logo-planters-club-horizontal-white.png": ("4f14e61395fc0a6573a45dfe749fbc63", 25278), "logo-planters-club-mark.png": ("b768f626c3c22acc1b1408a9b3db2b1f", 14316),
        "logo-danantara.png": ("da7b296bfe5e41124aed2c44d74a08ca", 87830), "logo-danantara-white.png": ("c45ad310d9490f9ee909f06c6c8ed466", 23708),
        "logo-ptpn-holding.png": ("bb5b7beb50f12c0362cebf15b0bf426a", 35428), "logo-ptpn-white.png": ("6546e4133134d5af0acf355a7e80e37a", 28596),
        "logo-holding-only.png": ("7ce6b1e12e127b6de7ebd4aaa4d65e4d", 19100), "logo-planters-club.png": ("19138a90142bb9256988a6725774c768", 149932),
        "logo-planters-club-white.png": ("bf2cb3d7458a3464cdf9dc580b39f015", 17535), "logo-greenstride-white.png": ("43351617112e5f7a54e300b9d905e098", 24299),
    },
    "Images": {
        "hero-runners.webp": ("6765ecb352125631b8d53b42a41a5222", 110110), "photo-langkah-pelari.webp": ("114c7cee350b98e85e1d661be63930ed", 130672),
        "pelari-greenstride.webp": ("322a89086e060b9ea34419bdc556b115", 62100), "key-visual.webp": ("8b4a68d719af1699dc3088adcd65005c", 183560),
        "app-daftar.webp": ("d1e65fff9d8d4736d42397c7358dcddf", 24838), "app-hubungkan.webp": ("3b6c7619da2382bedc597a4d90fa0cf6", 318802),
        "app-rekam.webp": ("8201f812cd1c8bc4de8645084fa966db", 19620), "app-simpan.webp": ("2d0b305040c8fda261bd7dd5bdc597ad", 30192),
        "app-ranking.webp": ("5e430151f101338aa8ad1d3df03b9681", 57166), "app-ebib.webp": ("c46fd0acdb97bda18793388651614174", 25712),
        "badge-app-store.png": ("b09f63ce9980f0e1f36c6f15a5610450", 32067), "badge-google-play.png": ("fdfc76569ba0da75c75a420049e9dd53", 29340),
        "icon-99-virtual-race.png": ("7633b1b2f61834c1fc158d4465b99cb4", 37645), "icon-strava.png": ("1bb1836cb8a4255224c43a9446bf00f6", 31099),
    },
}
MIME = {"svg": "image/svg+xml", "png": "image/png", "webp": "image/webp"}


def blob(group, name):
    return "/_blob/" + BLOBS[group][name][0]


# ───────── bundle.js
icons = json.load(open(os.path.join(ROOT, "icon-paths.json"), encoding="utf-8"))
tpl = open(os.path.join(SRC, "bundle.template.js"), encoding="utf-8").read()
bundle = tpl.replace("__ICONS__", json.dumps(icons, ensure_ascii=True))
assert "</script" not in bundle.lower() and "<!--" not in bundle
w("components/bundle.js", bundle)

# ───────── index.d.ts
w("components/index.d.ts", """// GreenStride 2026: tipe komponen (dokumentasi).
import type { ReactNode } from "react";

export type IconName = "alert" | "arrow-right" | "calendar" | "check" | "chevron-down" | "clock" | "close" | "info" | "ban" | "document" | "download" | "flag" | "gps" | "heart-pulse" | "lifebuoy" | "medal" | "moon" | "phone" | "route" | "run" | "search" | "shield-check" | "sun" | "team" | "trophy" | "upload";

export interface IconProps { name: IconName; size?: number; strokeWidth?: number; label?: string; className?: string }
export interface ButtonProps { variant?: "primary" | "secondary" | "ghost" | "lime" | "on-band"; size?: "sm" | "md" | "lg"; icon?: IconName; arrow?: boolean; href?: string; external?: boolean; type?: "button" | "submit"; disabled?: boolean; onClick?: () => void; className?: string; children: ReactNode }
export interface SectionHeaderProps { eyebrow?: string; title: ReactNode; lead?: ReactNode; align?: "start" | "center"; as?: "h1" | "h2" | "h3" }
export interface PillarProps { icon: IconName; children: ReactNode }
export interface FactTileProps { icon: IconName; value: string | number; unit?: string; label: string; note?: string }
export interface CountdownProps { start: string; end: string; days?: number; rangeLabel?: string; rangeNote?: string; endLabel?: string; idleLabel?: string; now?: number }
export interface KmSplitterProps { target?: number; days?: number; dailyMax?: number; memberMin?: number; options?: number[]; question?: string }
export interface TeamBarProps { target?: number; memberMin?: number; max?: number; members?: number }
export interface RouteProps { className?: string; style?: Record<string, string | number> }
export interface ActivityCheckProps { id?: string; wide?: boolean; title?: string; paceFast?: string; paceSlow?: string; dailyMax?: number }
export interface RaceCalendarProps { start: string; end: string; days?: number; target?: number; now?: number }
export interface TeamRouteProps { target?: number; memberMin?: number; note?: boolean }
export interface RuleGraphicProps { name: "limit" | "submit" | "deadline"; value?: number }
export interface IllustrationProps { name: "medal" | "jersey" | "trophy"; size?: number }
export interface RewardStep { illustration: "medal" | "jersey" | "trophy"; who: string; title: string; body?: string }
export interface RewardLadderProps { steps: RewardStep[]; side?: { icon?: IconName; who: string; title: string; body?: string } }
export interface ScheduleItemProps { date: string; title: string; status?: "done" | "now" | "next" | "tba"; chip?: { pre?: string; day?: string; month?: string }; children?: ReactNode }
export interface RewardCardProps { icon?: IconName; who: string; title: string; feature?: boolean; children?: ReactNode }
export interface AppStep { title: string; body: string; image: string; alt: string }
export interface AppStepsProps { steps: AppStep[]; label?: string }
export interface AppCardProps { name: string; role: string; icon: string; appStore?: string; playStore?: string; appStoreBadge: string; playStoreBadge: string }
export interface ChipProps { icon?: IconName; count?: number; pressed?: boolean; quiet?: boolean; onClick?: () => void; children: ReactNode }
export interface SearchFieldProps { id?: string; label?: string; placeholder?: string; value: string; onChange: (value: string) => void }
export interface FaqItemProps { id?: string; question: ReactNode; defaultOpen?: boolean; open?: boolean; onToggle?: (open: boolean) => void; children: ReactNode }
export interface CalloutProps { tone?: "attention" | "info" | "rule"; title?: string; icon?: IconName; children: ReactNode }
export interface DocumentCardProps { title: string; description: string; href: string; size?: string; note?: string; type?: string; download?: string | boolean }
export interface NavLink { href: string; label: string; current?: boolean }
export interface NavbarProps { logos: { src: string; alt: string }[]; links: NavLink[]; cta?: { href: string; label: string; external?: boolean }; homeHref?: string; homeLabel?: string; theme?: boolean }
""")

# ───────── komponen: README + preview
HEAD = '<!doctype html>\n<html>\n<head><meta charset="utf-8"><title>{t}</title><style>body{{margin:0;background:var(--{bg});}} .pv{{padding:24px;}}</style></head>\n<body>\n<div id="root" class="gs pv{extra}"></div>\n<script>\n  var G = window.GreenStride, h = React.createElement;\n  ReactDOM.createRoot(document.getElementById("root")).render({body});\n</script>\n</body>\n</html>\n'


def comp(name, group, height, readme, body, bg="surface", extra=""):
    w(f"components/{name}/README.md", f"# {name}\n\n{readme.strip()}\n")
    w(f"components/{name}/preview.html", f'<!-- @dsCard group="{group}" height={height} -->\n' + HEAD.format(t=name, body=body.strip(), bg=bg, extra=extra))


comp("Button", "Aksi", 150, """
Tombol untuk semua aksi; satu `primary` per layar. Konsumen memberi label (kata kerja + benda) dan `href` atau `onClick`.

- `primary`: aksi utama di atas surface (`leaf` / `on-leaf`).
- `secondary`: aksi kedua di sebelah primary.
- `ghost`: aksi kecil di dalam kartu.
- `lime`: aksi utama di atas `band` (hero, pita bantuan).
- `on-band`: aksi kedua di atas `band`.
- `arrow` menambah panah yang bergeser saat disorot; pakai hanya untuk tombol yang membawa ke bagian atau halaman lain.
- `external` membuka tab baru (Help Desk, toko aplikasi).

Jangan: lebih dari dua tombol berdampingan, label "Klik di sini", tombol tanpa tujuan.
""", """
h("div", { style: { display: "grid", gap: 16 } },
  h("div", { style: { display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" } },
    h(G.Button, { arrow: true }, "Cari jawaban"),
    h(G.Button, { variant: "secondary", icon: "phone" }, "Unduh aplikasi"),
    h(G.Button, { variant: "ghost", icon: "download" }, "Unduh PDF")),
  h("div", { className: "gs-on-band", style: { display: "flex", flexWrap: "wrap", gap: 12, padding: 20, borderRadius: 14, background: "var(--band)" } },
    h(G.Button, { variant: "lime", arrow: true, size: "lg" }, "Buka Help Desk"),
    h(G.Button, { variant: "on-band" }, "Lihat aturan")))
""")

comp("Icon", "Dasar", 200, """
Set ikon garis 24 px, tebal 2 px, ujung bulat, warna mengikuti teks (`currentColor`). Konsumen memberi `name`; beri `label` hanya bila ikon berdiri tanpa teks.

Makna tetap: `run` aktivitas, `team` tim, `route` jarak, `calendar` jadwal, `clock` waktu dan pace, `upload` submit, `shield-check` verifikasi, `medal` finisher, `trophy` juara, `phone` aplikasi, `gps` GPS, `lifebuoy` bantuan, `document` dan `download` dokumen, `alert` perhatian, `info` keterangan, `ban` tidak dihitung, `heart-pulse` kesehatan, `flag` mulai, `moon` dan `sun` tombol tema (ikon tema tujuan).

Jangan memakai satu ikon untuk dua makna, atau ikon tanpa teks untuk aksi penting.
""", """
h("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(92px, 1fr))", gap: 12 } },
  G.iconNames.map(function (n) {
    return h("div", { key: n, style: { display: "grid", justifyItems: "center", gap: 8, padding: "14px 6px", borderRadius: 14, background: "var(--surface-raised)", border: "1px solid var(--line)", color: "var(--band)" } },
      h("span", { style: { color: "var(--leaf)" } }, h(G.Icon, { name: n, size: 28 })),
      h("span", { style: { fontSize: 12, color: "var(--ink-muted)" } }, n));
  }))
""")

comp("SectionHeader", "Konten", 190, """
Pembuka setiap bagian: eyebrow (opsional, satu per bagian), judul `heading-1`, kalimat pembuka `lead`. Konsumen memberi `title` (boleh berisi `<em>` untuk satu kata kunci berwarna `leaf`).

Di atas `band`, bungkus dengan `.gs-on-band`: judul menjadi `band-ink`, kata kunci `lime`.
""", """
h("div", { style: { display: "grid", gap: 32 } },
  h(G.SectionHeader, { eyebrow: "Cara ikut", title: h(React.Fragment, null, "Lima langkah sebelum ", h("em", null, "lari pertama")), lead: "Siapkan dua aplikasi, hubungkan, lalu setiap lari otomatis tercatat untuk timmu." }))
""")

comp("Pillar", "Konten", 110, """
Tiga pilar kampanye dari key visual: Move Together (`run`), Live Better (`heart-pulse`), Grow Stronger (`team`). Ikon di lingkaran penuh, label kapital. Tampil sekali, di hero.
""", """
h("div", { style: { display: "grid", gap: 20 } },
  h("div", { style: { display: "flex", flexWrap: "wrap", gap: 24 } },
    h(G.Pillar, { icon: "run" }, "Move together"), h(G.Pillar, { icon: "heart-pulse" }, "Live better"), h(G.Pillar, { icon: "team" }, "Grow stronger")),
  h("div", { className: "gs-on-band", style: { display: "flex", flexWrap: "wrap", gap: 24, padding: 20, borderRadius: 14, background: "var(--band)" } },
    h(G.Pillar, { icon: "run" }, "Move together"), h(G.Pillar, { icon: "heart-pulse" }, "Live better"), h(G.Pillar, { icon: "team" }, "Grow stronger")))
""")

comp("FactTile", "Konten", 230, """
Satu aturan inti dalam satu angka: ikon, nilai `stat`, satuan, label, catatan opsional. Pakai dalam grid 3 kolom (2 di ponsel) untuk ringkasan aturan; maksimal enam.

Konsumen memberi angka yang pasti saja. Jangan memakai FactTile untuk statistik pemasaran.
""", """
h("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 } },
  h(G.FactTile, { icon: "team", value: 5, unit: "orang", label: "Maksimal per tim", note: "Maksimal 2 tim per unit" }),
  h(G.FactTile, { icon: "route", value: 300, unit: "km", label: "Target tim", note: "Minimal 60 km per anggota" }),
  h(G.FactTile, { icon: "clock", value: "24", unit: "km", label: "Batas per hari", note: "Batas, bukan target" }))
""")

comp("Countdown", "Interaktif", 420, """
Status lomba, dihitung dari jam perangkat. Sebelum mulai: hitung mundur hari, jam, menit, detik. Saat berjalan: "Hari ke X dari 28" dengan bar periode `lime` (motif garis rute, titik di posisi hari ini) dan sisa waktu sampai ditutup, karena peserta yang sedang berlomba butuh tahu posisinya, bukan detik. Setelah selesai: "Lomba sudah selesai". Tampil di hero di atas `band`.

Konsumen memberi `start` dan `end` (ISO dengan zona +07:00), `rangeLabel`, dan `endLabel` ("20 Desember, 23.59 WIB"). Saat dirender di server, isi `idleLabel` agar HTML statis tetap bermakna. `now` hanya untuk pratinjau.
""", """
h("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, maxWidth: 860 } },
  h("div", { style: { padding: 20, borderRadius: 24, background: "var(--band)" } },
    h(G.Countdown, { start: "2026-11-23T00:00:00+07:00", end: "2026-12-20T23:59:59+07:00", rangeLabel: "23 November – 20 Desember 2026", rangeNote: "28 hari", now: Date.parse("2026-11-20T09:30:00+07:00") })),
  h("div", { style: { padding: 20, borderRadius: 24, background: "var(--band)" } },
    h(G.Countdown, { start: "2026-11-23T00:00:00+07:00", end: "2026-12-20T23:59:59+07:00", endLabel: "20 Desember, 23.59 WIB", now: Date.parse("2026-11-28T10:00:00+07:00") })))
""")

comp("KmSplitter", "Interaktif", 560, """
Kalkulator porsi: peserta memilih jumlah anggota tim (5, 4, 3, 2). `TeamBar` membelah ulang 300 km menjadi porsi tiap anggota (pegas), angka menunjukkan km per orang dan rata-rata per hari, dan jalan 0 sampai 24 km menempatkan penanda pelari di rata-rata harian. Menjawab salah paham "harus lari 24 km sehari".

Konsumen memberi `target` (300), `days` (28), `dailyMax` (24), `memberMin` (60). Letakkan di samping panel pernyataan 24 km.
""", """
h("div", { style: { maxWidth: 560 } }, h(G.KmSplitter, { target: 300, days: 28, dailyMax: 24, memberMin: 60 }))
""")

comp("TeamBar", "Grafik", 200, """
Grafik target tim: satu bar 300 km yang dibagi rata ke anggota. Bagian minimal tiap anggota (60 km) berwarna `leaf`, sisa porsi `lime`, label km di bawah tiap segmen dan legenda di bawahnya. Segmen terisi berurutan sekali saat pertama terlihat; saat `members` berubah, segmen membelah ulang dengan pegas.

Konsumen memberi `target`, `memberMin`, `max` (jumlah anggota terbanyak, 5) dan `members`. Dipakai di klaster "Target tim" (5 orang, statis) dan di dalam KmSplitter.
""", """
h("div", { style: { display: "grid", gap: 28, maxWidth: 560 } },
  h(G.TeamBar, { target: 300, memberMin: 60, max: 5, members: 5 }),
  h(G.TeamBar, { target: 300, memberMin: 60, max: 5, members: 3 }))
""")

comp("TeamRoute", "Grafik", 300, """
Grafik target tim di klaster "Target tim" (kartu `band`): 300 km digambar sebagai rute berkelok lima ruas, satu ruas satu anggota. Ruas berselang `lime` dan `lime` redup, titik tiap 60 km, titik `lime` besar di finis, nomor anggota di tengah tiap ruas, jarak kumulatif (Mulai, 60, 120, 180, 240, 300 km) di atas atau bawah titik. Satu kalimat di bawah menegaskan bahwa jarak tim adalah jumlah, bukan estafet. Rute tergambar dari kiri sekali saat terlihat.

Konsumen memberi `target` dan `memberMin`. Hanya di atas `band`.
""", """
h("div", { className: "gs-on-band", style: { padding: 24, borderRadius: 24, background: "linear-gradient(125deg, var(--band), var(--band-end))", color: "var(--band-ink)", maxWidth: 640 } },
  h(G.TeamRoute, { target: 300, memberMin: 60 }))
""")

comp("RuleGraphic", "Grafik", 140, """
Grafik 64 px untuk baris aturan harian: `limit` (rambu batas: lingkaran tepi `danger`, angka di tengah, karena 24 km adalah batas, bukan target), `submit` (dua token unggah `leaf-soft` dan `lime`), `deadline` (jam dengan jarum di 23.59, angka 12 bertanda `danger`, pin `sun`). Hiasan; angka dan kalimat di sebelahnya yang membawa informasi.
""", """
h("div", { style: { display: "flex", gap: 32, padding: 16, borderRadius: 24, background: "var(--surface-tint)", width: "max-content" } },
  h(G.RuleGraphic, { name: "limit", value: 24 }), h(G.RuleGraphic, { name: "submit" }), h(G.RuleGraphic, { name: "deadline" }))
""")

comp("Route", "Grafik", 200, """
Motif identitas dari konten 24 KM: garis berkelok tebal 6 px dengan titik ujung `lime`. Warna garis mengikuti teks, jadi di atas `band` atau panel foto menjadi `band-ink`. Tergambar sekali saat pertama terlihat (garis lalu titik akhir, 600 ms).

Dipakai di panel pernyataan 24 km. Hiasan saja (`aria-hidden`); jangan dipakai sebagai latar berulang.
""", """
h("div", { className: "gs-on-band", style: { padding: 24, borderRadius: 24, background: "var(--band)", color: "var(--band-ink)", maxWidth: 480 } },
  h(G.Route, { style: { width: "100%", height: "auto" } }))
""")

comp("ActivityCheck", "Interaktif", 380, """
Alat cek aktivitas: peserta mengisi jarak (km, koma desimal) dan moving time (jam, menit, detik) dari Strava. Hasil langsung: pace `stat`, kecepatan, gauge rentang pace (zona `leaf-soft` 5:00 sampai 15:00, penanda `leaf` atau `danger`), lalu putusan dengan ikon dan judul: "Masuk rentang pace" (`leaf-soft`) atau "Terlalu cepat/lambat, tidak dihitung" (`danger-soft`). Jarak di atas 24 km diberi tahu hanya 24 km yang dihitung.

`wide` untuk panel selebar kontainer: di atas 860 px isian dan catatan di kiri, hasil di kanan dipisah garis, jadi panel tidak lebih tinggi dari isinya. Tanpa `wide`, semua bertumpuk.

Tiga keadaan: kosong (gauge zona pace, kalimat "sekitar 4 sampai 12 km/jam", dan tombol "Coba contoh: 5 km, 40 menit" yang mengisi kolom), salah isi (pesan dengan ikon `alert`), hasil. Catatan di bawah selalu menyebut bahwa hasil akhir mengikuti verifikasi panitia.
""", """
h(G.ActivityCheck, { wide: true, paceFast: "5:00", paceSlow: "15:00", dailyMax: 24 })
""")

comp("RaceCalendar", "Grafik", 520, """
"Rencana 4 minggu" dalam kartu `surface-raised`: 28 hari dalam empat baris Senin sampai Minggu (23 November jatuh pada Senin, 20 Desember pada Minggu), label minggu di kiri, dan target kumulatif tim di kanan (75, 150, 225, 300 km) dengan bar `leaf` yang memanjang. Hari pertama dan terakhir `lime` berlabel "Mulai" dan "Finis", hari yang lewat `leaf`, hari ini `sun` dengan cincin. Keterangan di bawah memberi ritme yang perlu dikejar (75 km per minggu, sekitar 10,7 km per hari untuk satu tim) dan status hari ini dalam kata-kata, agar status tidak hanya lewat warna. Hari yang lewat dan bar target terisi berurutan sekali saat terlihat. Di bawah 520 px kolom minggu disembunyikan.

Konsumen memberi `start`, `end`, `days`, `target`. `now` hanya untuk pratinjau. Di Jadwal, berdampingan dengan linimasa dan ikut lengket saat digulir.
""", """
h("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 32, maxWidth: 900 } },
  h(G.RaceCalendar, { start: "2026-11-23T00:00:00+07:00", end: "2026-12-20T23:59:59+07:00", days: 28, target: 300 }),
  h(G.RaceCalendar, { start: "2026-11-23T00:00:00+07:00", end: "2026-12-20T23:59:59+07:00", days: 28, target: 300, now: Date.parse("2026-11-28T10:00:00+07:00") }))
""", bg="surface-tint")

comp("RewardLadder", "Konten", 620, """
Tingkat penghargaan sebagai anak tangga yang naik dari kiri ke kanan: dari yang diterima paling banyak tim (semua finisher) ke yang paling sedikit (6 tim juara). Metafora langkah sesuai nama acara. Anak tangga teratas memakai `band` dan sudut daun. Jalur individu (MVP) tampil sebagai pita `surface-tint` di bawahnya. Di ponsel anak tangga bertumpuk dengan geser kanan bertahap. Anak tangga naik berurutan sekali saat terlihat.

Tiap anak tangga memakai `Illustration` (`medal`, `jersey`, `trophy`): ilustrasi garis 2,5 px seperti set ikon dengan isian `lime` dan `leaf-soft`. Ini ilustrasi, bukan foto medali atau jersey resmi; ganti dengan foto panitia bila tersedia. Jangan menulis nominal yang belum diumumkan.
""", """
h(G.RewardLadder, {
  steps: [
    { illustration: "medal", who: "Semua tim finisher", title: "Medali dan e-certificate", body: "Tim mencapai 300 km dan tiap anggota minimal 60 km." },
    { illustration: "jersey", who: "50 tim terbaik", title: "Finisher jersey dan undangan offline race di Jakarta", body: "Tanggal diumumkan panitia." },
    { illustration: "trophy", who: "6 tim terbaik", title: "Uang tunai", body: "Juara I, II, III dan Harapan I, II, III." }
  ],
  side: { icon: "run", who: "10 peraih MVP · jalur individu", title: "Uang tunai dan undangan ke Jakarta", body: "Anggota tim dengan jarak terjauh, tetap diundang meski timnya di luar 50 besar." }
})
""")

comp("ScheduleItem", "Konten", 520, """
Satu tahap linimasa di dalam `<ol class="gs-schedule">`. Kiri: chip tanggal 72 px (`pre` kecil seperti "s.d." atau nama hari, `day` besar miring, `month`), disambung garis antar chip. Kanan: tanggal lengkap, judul, satu kalimat.

Status: `done` (chip `leaf-soft` dengan centang dan label "Selesai", garis `leaf`), `now` (chip `sun` dengan cincin, isi menjadi kartu `surface-raised` dengan label "Sekarang"), `next`, `tba` (chip putus-putus berikon `flag`, tanpa `day`; tanggal ditulis "Diumumkan panitia"). Konsumen menghitung status dari tanggal; hanya satu `now` per halaman.
""", """
h("ol", { className: "gs-schedule", style: { maxWidth: 600 } },
  h(G.ScheduleItem, { status: "done", chip: { day: "19–20", month: "Nov" }, date: "19 – 20 November 2026", title: "Verifikasi data peserta" }, "Panitia memeriksa data peserta dan tim yang sudah terdaftar."),
  h(G.ScheduleItem, { status: "done", chip: { pre: "Jum", day: "20", month: "Nov" }, date: "Jumat, 20 November 2026", title: "Technical meeting" }, "Penjelasan teknis lomba untuk peserta."),
  h(G.ScheduleItem, { status: "now", chip: { pre: "23 Nov", day: "28", month: "hari" }, date: "23 November – 20 Desember 2026", title: "Virtual running/walking race" }, "Lari atau jalan di luar ruangan, rekam di Strava."),
  h(G.ScheduleItem, { status: "next", chip: { pre: "Jakarta", day: "Jan", month: "2027" }, date: "Januari 2027", title: "Offline race di Jakarta" }, "Untuk 50 tim terbaik dan 10 peraih MVP."))
""", bg="surface-tint")

comp("RewardCard", "Konten", 300, """
Satu penghargaan dalam kartu, untuk konteks di luar halaman utama (halaman utama memakai `RewardLadder`). Siapa yang mendapat (`who`), apa (`title`), keterangan. Tingkat tertinggi yang paling diinginkan (undangan offline race) memakai `feature`: latar `band` dengan sudut daun. Satu `feature` per grid.

Jangan menulis nominal yang belum diumumkan.
""", """
h("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 } },
  h(G.RewardCard, { feature: true, icon: "flag", who: "50 tim terbaik", title: "Jersey dan undangan offline race" }, "Lari bersama di Jakarta, tanggal diumumkan panitia."),
  h(G.RewardCard, { icon: "medal", who: "Semua tim finisher", title: "Medali dan e-certificate" }, "Tim mencapai 300 km dan tiap anggota 60 km."),
  h(G.RewardCard, { icon: "trophy", who: "6 tim terbaik", title: "Uang tunai" }, "Juara I, II, III dan Harapan I, II, III."))
""")

steps = [
    ("Unduh dan daftar 99 Virtual Race", "Daftar dengan email yang sama dengan formulir tim.", "app-daftar.webp", "Formulir pendaftaran akun 99 Virtual Race"),
    ("Hubungkan Strava", "Pilih Submit, lalu Strava Connect, dan izinkan semua pilihan.", "app-hubungkan.webp", "Halaman Submit dengan pilihan Strava Connect"),
    ("Rekam di Strava", "Tunggu GPS Acquired, lalu tekan Start.", "app-rekam.webp", "Layar rekam Strava"),
    ("Simpan untuk Everyone", "Ubah Who can view menjadi Everyone, lalu Save Activity.", "app-simpan.webp", "Layar simpan aktivitas Strava"),
    ("Pantau peringkat", "Buka Ranking, lalu Group Leaderboard.", "app-ranking.webp", "Papan peringkat tim di 99 Virtual Race"),
]
steps_js = ",\n    ".join(
    "{ title: %s, body: %s, image: %s, alt: %s }" % (json.dumps(t), json.dumps(b), json.dumps(blob("Images", f)), json.dumps(a)) for t, b, f, a in steps)
comp("AppSteps", "Interaktif", 620, """
Panduan aplikasi: daftar langkah di kiri, layar ponsel di kanan berganti saat langkah dipilih (klik, ketuk, atau tombol panah). Langkah aktif bertepi, bernomor `leaf`, dengan bar progres `lime`. Di bawah 760 px, daftar menjadi baris tab nomor 1 sampai 5 yang disambung garis, layar ponsel di bawahnya, lalu keterangan langkah aktif dengan tombol ke langkah berikutnya, sehingga layar yang berganti selalu terlihat.

Konsumen memberi `steps` (judul, satu kalimat, tangkapan layar asli, alt). Tiga sampai lima langkah. Tidak berganti sendiri.
""", "h(G.AppSteps, { steps: [\n    " + steps_js + "\n  ] })")

comp("AppCard", "Interaktif", 210, """
Satu aplikasi resmi dengan ikon, perannya, dan badge toko resmi yang menaut ke halaman unduh. Dua kartu berdampingan: 99 Virtual Race lalu Strava.

Konsumen memberi URL toko resmi dan file badge resmi; jangan menggambar ulang badge.
""", """
h("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 } },
  h(G.AppCard, { name: "99 Virtual Race", role: "Aplikasi resmi lomba: eBIB, submit, peringkat", icon: "%s", appStore: "https://apps.apple.com/id/app/99-virtual-race/id6686407581", playStore: "https://play.google.com/store/apps/details?id=id.app99virtualrace.mobile", appStoreBadge: "%s", playStoreBadge: "%s" }),
  h(G.AppCard, { name: "Strava", role: "Merekam lari dan jalan dengan GPS", icon: "%s", appStore: "https://apps.apple.com/us/app/strava-run-bike-walk/id426826309", playStore: "https://play.google.com/store/apps/details?id=com.strava&hl=id", appStoreBadge: "%s", playStoreBadge: "%s" }))
""" % (blob("Images", "icon-99-virtual-race.png"), blob("Images", "badge-app-store.png"), blob("Images", "badge-google-play.png"),
       blob("Images", "icon-strava.png"), blob("Images", "badge-app-store.png"), blob("Images", "badge-google-play.png")))

comp("Chip", "Interaktif", 130, """
Penyaring topik FAQ (`pressed` saat aktif, dengan ikon topik dan jumlah) dan kata kunci cepat (`quiet`, tanpa status). Target sentuh 44 px; di ponsel baris chip boleh digulir ke samping.
""", """
h("div", { style: { display: "grid", gap: 16 } },
  h("div", { style: { display: "flex", flexWrap: "wrap", gap: 8 } },
    h(G.Chip, { icon: "flag", count: 6, pressed: true }, "Tentang lomba"),
    h(G.Chip, { icon: "team", count: 11 }, "Tim"),
    h(G.Chip, { icon: "phone", count: 9 }, "Aplikasi"),
    h(G.Chip, { icon: "medal", count: 8 }, "Hadiah")),
  h("div", { style: { display: "flex", flexWrap: "wrap", gap: 8 } },
    h(G.Chip, { quiet: true }, "24 km"), h(G.Chip, { quiet: true }, "Strava"), h(G.Chip, { quiet: true }, "PKWT")))
""")

comp("SearchField", "Interaktif", 150, """
Kolom pencarian FAQ: ikon, petunjuk tombol `/`, tombol hapus saat terisi, cincin `leaf-soft` saat fokus. Konsumen mengelola `value` dan `onChange`, memfilter jawaban, dan menandai kata cocok dengan `<mark class="gs-mark">`.

Hasil kosong selalu menawarkan jalan keluar: lihat semua pertanyaan, atau buka Help Desk.
""", """
(function Demo() {
  function D() { var s = React.useState("strava"); return h("div", { style: { maxWidth: 640 } }, h(G.SearchField, { label: "Cari jawaban", placeholder: "Misalnya: Strava, pace, medali", value: s[0], onChange: s[1] })); }
  return h(D);
})()
""")

comp("FaqItem", "Interaktif", 380, """
Satu pertanyaan dan jawaban yang bisa dibuka. Pertanyaan dalam kata-kata peserta; jawaban dibuka dengan kepastian ("Ya.", "Tidak.", "Boleh.") dan maksimal tiga kalimat atau daftar pendek. Boleh berisi satu `Callout`.

Konsumen memberi `id` (untuk tautan langsung `#id`), `question`, dan isi. Terkontrol (`open`, `onToggle`) atau mandiri (`defaultOpen`).
""", """
h("div", { style: { maxWidth: 720 } },
  h(G.FaqItem, { id: "kurang-dari-lima", question: "Bolehkah tim kurang dari 5 orang?", defaultOpen: true },
    h("p", null, h("strong", null, "Boleh."), " Target tim tetap 300 km dan setiap anggota minimal 60 km."),
    h("ul", null, h("li", null, "4 orang: 75 km per orang"), h("li", null, "3 orang: 100 km per orang"))),
  h(G.FaqItem, { id: "treadmill", question: "Apakah treadmill dihitung?" }, h("p", null, h("strong", null, "Tidak."), " Hanya lari atau jalan di luar ruangan.")),
  h(G.FaqItem, { id: "kode", question: "Perlu kode undangan?" }, h("p", null, h("strong", null, "Tidak."), " Panitia mendaftarkan timmu lewat sistem.")))
""")

comp("Callout", "Konten", 260, """
Kotak penegasan di dalam jawaban atau bagian. Tiga nada:

- `attention` (`sun-soft`): hal yang mudah terlewat ("Simpan aktivitas untuk Everyone").
- `info` (`ocean-soft`): keterangan netral ("Syarat finisher").
- `rule` (`danger-soft`): aturan yang membatalkan aktivitas ("Kecurangan membatalkan kepesertaan").

Satu callout per kartu atau jawaban. Selalu dengan judul pendek.
""", """
h("div", { style: { display: "grid", gap: 12, maxWidth: 640 } },
  h(G.Callout, { tone: "attention", title: "Perlu diperhatikan" }, "Ubah Who can view menjadi Everyone sebelum Save Activity."),
  h(G.Callout, { tone: "info", title: "Syarat finisher" }, "Total tim minimal 300 km dan setiap anggota minimal 60 km."),
  h(G.Callout, { tone: "rule", title: "Tidak dihitung" }, "Treadmill, bersepeda, dan aktivitas dengan pace di luar 5:00 – 15:00 menit/km."))
""")

comp("DocumentCard", "Konten", 300, """
Satu dokumen yang bisa diunduh: ikon berkas dengan jenis, judul, satu kalimat isi, ukuran berkas. Seluruh kartu adalah tautan unduh. Tiga kartu bertumpuk atau berdampingan.

Konsumen memberi `href` ke berkas di situs dan ukuran yang benar. Berkas di atas 10 MB diberi `note` "Sebaiknya unduh lewat Wi-Fi", karena peserta sering membuka situs di kebun dengan sinyal lemah.
""", """
h("div", { style: { display: "grid", gap: 12, maxWidth: 640 } },
  h(G.DocumentCard, { title: "Guidebook GreenStride 2026", description: "Ketentuan teknis, mekanisme lomba, dan penghargaan.", size: "PDF · 2,2 MB", href: "#" }),
  h(G.DocumentCard, { title: "Virtual Running", description: "Rencana acara, tahapan, dan kriteria penilaian.", size: "PDF · 7,5 MB", href: "#" }),
  h(G.DocumentCard, { title: "User Journey 99 Virtual Race", description: "Panduan bergambar dari daftar akun sampai peringkat.", size: "PDF · 42 MB", note: "Sebaiknya unduh lewat Wi-Fi", href: "#" }))
""")

comp("Navbar", "Navigasi", 300, """
Header lengket berlatar `band` (hijau hutan) di kedua tema, menyambung ke hero: hanya logo Planters Club horizontal putih (penyelenggara) di kiri, tanpa pelat; tinggi 44 px, 36 px di ponsel. Danantara dan PTPN tidak tampil di header; tempatnya di footer. Tautan bagian `band-ink` di kanan dengan garis bawah `lime` yang tergambar saat disorot, satu tombol `lime`. Bayangan muncul setelah halaman digulir. Di bawah 960 px (agar tautan, tombol tema, dan Help Desk tidak menabrak logo) berubah menjadi tombol menu yang membuka lembar tautan.

Tombol tema (`ThemeToggle`, bulat 44 px seperti tombol menu) selalu tampil di header, di sebelah kiri tombol `lime` atau tombol menu. Ikonnya menunjukkan tema tujuan: bulan saat terang, matahari saat gelap. Tanpa pilihan, tema mengikuti perangkat. Pilihan disimpan di `localStorage` dengan kunci `gs-theme`; konsumen memasangnya sebagai `data-theme` pada `<html>` lewat skrip kecil di `<head>` agar halaman tidak berkedip. `theme: false` menyembunyikan tombol.

Konsumen memberi `logos` (satu entri: `logo-planters-club-horizontal-white.png`), `links` (anchor ke bagian yang benar-benar ada), dan `cta`.
""", """
h(G.Navbar, {
  logos: [{ src: "%s", alt: "Planters Club" }],
  links: [{ href: "#ringkasan", label: "Ringkasan", current: true }, { href: "#cara-ikut", label: "Cara ikut" }, { href: "#jadwal", label: "Jadwal" }, { href: "#faq", label: "FAQ" }, { href: "#unduhan", label: "Unduhan" }],
  cta: { href: "https://99virtualrace.com/HDPTPN", label: "Help Desk", external: true }
})
""" % (blob("Logos", "logo-planters-club-horizontal-white.png"),), extra=" pvnav")
# Navbar mengisi lebar tanpa padding
p = os.path.join(P, "components/Navbar/preview.html")
t = open(p, encoding="utf-8").read().replace(".pv{padding:24px;}", ".pv{padding:24px;} .pvnav{padding:0;}")
open(p, "w", encoding="utf-8", newline="\n").write(t)

# ───────── README grup aset
w("assets/Icons/README.md", "Ikon garis 24 px, tebal 2 px, bertinta `band` (#0B3D24) untuk diunduh. Di situs, pakai komponen `Icon` agar warna mengikuti teks. Digambar mengikuti gaya lencana di key visual; ganti bila tersedia file resmi.\n")
w("assets/Logos/README.md", "Logo resmi. Planters Club adalah penyelenggara dan logo utama: `logo-planters-club-horizontal-white.png` untuk header (berlatar `band`, sendirian, tanpa pelat); `logo-planters-club-horizontal.png` untuk footer dan gambar bagikan; `logo-planters-club.png` (tumpuk) bila ruang tinggi; `logo-planters-club-mark.png` (ikon saja) untuk favicon dan ruang sangat sempit. Danantara (`logo-danantara.png`) dan PTPN (`logo-ptpn-holding.png`) adalah logo induk: hanya di footer dan gambar bagikan, selalu sesudah Planters Club, dipisah garis, lebih kecil. Semua logo memakai warna asli; di atas `band`, taruh di pelat terang `band-ink`. Versi `-white` lain tidak dipakai. `logo-greenstride-white.png` adalah logotype acara, hanya di atas `band`. `logo-holding-only.png` untuk ruang sempit. Jangan mengubah warna atau proporsi.\n")
w("assets/Images/README.md", "Foto acara, tangkapan layar aplikasi 99 Virtual Race dan Strava (tampilkan di dalam bingkai ponsel AppSteps), badge toko resmi, dan ikon aplikasi resmi. `key-visual.webp` hanya rujukan gaya: memuat tanggal lama, jangan ditampilkan utuh.\n")

# ───────── sampul
w("components/Cover/preview.html", """<!-- @dsCard height=300 -->
<!doctype html>
<html>
<head><meta charset="utf-8"><title>Sampul</title>
<style>
  html, body { margin: 0; height: 300px; background: var(--surface); overflow: hidden; }
  .cv { position: relative; width: 960px; height: 300px; }
  .cv svg { position: absolute; left: 0; top: 0; }
  .cv__text { position: absolute; left: 40px; bottom: 36px; width: 420px; }
  .cv__name { margin: 0; font: italic 800 64px/0.95 var(--font-display); letter-spacing: -0.02em; color: var(--ink); }
  .cv__tag { margin: 14px 0 0; font: 400 14px/1.4 var(--font-text); color: var(--ink-muted); }
  .band { fill: var(--band); } .bandend { fill: var(--band-end); } .leaf { fill: var(--leaf); } .lime { fill: var(--lime); } .sun { fill: var(--sun); }
  [data-theme="dark"] .band { fill: var(--band-raised); }
</style></head>
<body>
<div class="cv">
  <!--
    blocks: band 260x300 dan band-end 100x300 (pita hutan ke biru dari key visual), leaf 200x150 dan 128x80, lime 160x120 dan 120x80, sun 40x40
    arrangement: satu slab tinggi band dengan band-end di tepi kanan, daun leaf di kolom tengah, daun lime menempel di slab, sun sebagai satelit
    pattern: motif daun dari key visual (row "literal motif"): daun dibentuk dari radius-leaf 40px dan radius-sm 8px pada sudut berseberangan
    scales: sisi dari space-10 128, space-9 96, space-7 48; sudut radius-leaf 40, radius-sm 8
  -->
  <svg width="960" height="300" viewBox="0 0 960 300" aria-hidden="true">
    <path class="leaf" d="M540 0 H700 V110 A40 40 0 0 1 660 150 H508 A8 8 0 0 1 500 142 V40 A40 40 0 0 1 540 0 Z" />
    <rect class="band" x="700" y="0" width="260" height="300" />
    <rect class="bandend" x="860" y="0" width="100" height="300" />
    <path class="lime" d="M748 40 H860 A8 8 0 0 1 868 48 V120 A40 40 0 0 1 828 160 H716 A8 8 0 0 1 708 152 V80 A40 40 0 0 1 748 40 Z" />
    <path class="lime" d="M780 196 H852 A8 8 0 0 1 860 204 V236 A40 40 0 0 1 820 276 H748 A8 8 0 0 1 740 268 V236 A40 40 0 0 1 780 196 Z" opacity="0.55" />
    <path class="leaf" d="M572 182 H652 A8 8 0 0 1 660 190 V222 A40 40 0 0 1 620 262 H540 A8 8 0 0 1 532 254 V222 A40 40 0 0 1 572 182 Z" />
    <rect class="sun" x="896" y="236" width="40" height="40" rx="20" />
  </svg>
  <div class="cv__text">
    <p class="cv__name">GreenStride<br>2026</p>
    <p class="cv__tag">Sistem desain untuk peserta PTPN GreenStride 2026.</p>
  </div>
</div>
</body>
</html>
""")

# ───────── indeks
now = datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
groups = ["Logos", "Images", "Icons"]
tiles = {"Logos": "l", "Images": "m", "Icons": "xs"}
asset_groups = {}
for g in groups:
    names = list(BLOBS[g].keys())
    asset_groups[g] = {"name": g, "tile": tiles[g], "order": names,
                       "files": {n: {"name": n, "blob": BLOBS[g][n][0], "size": BLOBS[g][n][1], "type": MIME[n.rsplit(".", 1)[1]]} for n in names}}
index = {
    "v": 3, "layout": "files", "createdOnFiles": {"v": 1, "at": "2026-11-17T04:00:06Z"},  # penanda: tetap seperti saat dibuat
    "title": "GreenStride 2026", "namespace": "GreenStride",
    "libraries": [{"name": "react", "version": "18"}, {"name": "react-dom", "version": "18"}],
    "sections": {}, "groups": groups, "assetGroups": asset_groups, "blobs": {},
    "docs": {"readme": "project/README.md", "sections": []},
    "lastChange": {"by": "Claude", "at": now, "via": "Claude Code", "note": "Tombol tema terang/gelap (ThemeToggle) di Navbar, ikon sun dan moon."},
}
w("design-system.json", json.dumps(index, indent=2, ensure_ascii=False) + "\n")

files = []
for dp, _, fs in os.walk(P):
    for f in fs:
        rel = os.path.relpath(os.path.join(dp, f), P).replace(os.sep, "/")
        if rel.startswith("assets/") and not rel.endswith("README.md"):
            continue
        files.append("project/" + rel)
print(json.dumps(sorted(files)))
