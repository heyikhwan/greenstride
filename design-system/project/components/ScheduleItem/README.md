# ScheduleItem

Satu tahap linimasa di dalam `<ol class="gs-schedule">`. Kiri: chip tanggal 72 px (`pre` kecil seperti "s.d." atau nama hari, `day` besar miring, `month`), disambung garis antar chip. Kanan: tanggal lengkap, judul, satu kalimat.

Status: `done` (chip `leaf-soft` dengan centang dan label "Selesai", garis `leaf`), `now` (chip `sun` dengan cincin, isi menjadi kartu `surface-raised` dengan label "Sekarang"), `next`, `tba` (chip putus-putus berikon `flag`, tanpa `day`; tanggal ditulis "Diumumkan panitia"). Konsumen menghitung status dari tanggal; hanya satu `now` per halaman.
