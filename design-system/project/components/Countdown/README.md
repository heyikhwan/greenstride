# Countdown

Status lomba dan sisa waktu, dihitung dari jam perangkat. Sebelum mulai: "Lomba dimulai dalam"; saat berjalan: "Lomba berlangsung, sisa waktu"; setelahnya: "Lomba sudah selesai". Tampil di hero di atas `band`.

Konsumen memberi `start` dan `end` (ISO dengan zona +07:00) serta `rangeLabel`. Saat dirender di server, isi `idleLabel` agar HTML statis tetap bermakna.
