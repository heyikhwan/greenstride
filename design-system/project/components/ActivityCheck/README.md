# ActivityCheck

Alat cek aktivitas: peserta mengisi jarak (km, koma desimal) dan moving time (jam, menit, detik) dari Strava. Hasil langsung: pace `stat`, kecepatan, gauge rentang pace (zona `leaf-soft` 5:00 sampai 15:00, penanda `leaf` atau `danger`), lalu putusan dengan ikon dan judul: "Masuk rentang pace" (`leaf-soft`) atau "Terlalu cepat/lambat, tidak dihitung" (`danger-soft`). Jarak di atas 24 km diberi tahu hanya 24 km yang dihitung.

`wide` untuk panel selebar kontainer: di atas 860 px isian dan catatan di kiri, hasil di kanan dipisah garis, jadi panel tidak lebih tinggi dari isinya. Tanpa `wide`, semua bertumpuk.

Tiga keadaan: kosong (gauge zona pace, kalimat "sekitar 4 sampai 12 km/jam", dan tombol "Coba contoh: 5 km, 40 menit" yang mengisi kolom), salah isi (pesan dengan ikon `alert`), hasil. Catatan di bawah selalu menyebut bahwa hasil akhir mengikuti verifikasi panitia.
