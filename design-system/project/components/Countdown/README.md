# Countdown

Status lomba, dihitung dari jam perangkat. Sebelum mulai: hitung mundur hari, jam, menit, detik. Saat berjalan: "Hari ke X dari 28" dengan bar periode `lime` (motif garis rute, titik di posisi hari ini) dan sisa waktu sampai ditutup, karena peserta yang sedang berlomba butuh tahu posisinya, bukan detik. Setelah selesai: "Lomba sudah selesai". Tampil di hero di atas `band`.

Konsumen memberi `start` dan `end` (ISO dengan zona +07:00), `rangeLabel`, dan `endLabel` ("20 Desember, 23.59 WIB"). Saat dirender di server, isi `idleLabel` agar HTML statis tetap bermakna. `now` hanya untuk pratinjau.
