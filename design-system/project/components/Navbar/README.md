# Navbar

Header lengket berlatar `band` (hijau hutan) di kedua tema, menyambung ke hero: hanya logo Planters Club horizontal putih (penyelenggara) di kiri, tanpa pelat; tinggi 44 px, 36 px di ponsel. Danantara dan PTPN tidak tampil di header; tempatnya di footer. Tautan bagian `band-ink` di kanan dengan garis bawah `lime` yang tergambar saat disorot, satu tombol `lime`. Bayangan muncul setelah halaman digulir. Di bawah 960 px (agar tautan, tombol tema, dan Help Desk tidak menabrak logo) berubah menjadi tombol menu yang membuka lembar tautan.

Tombol tema (`ThemeToggle`, bulat 44 px seperti tombol menu) selalu tampil di header, di sebelah kiri tombol `lime` atau tombol menu. Ikonnya menunjukkan tema tujuan: bulan saat terang, matahari saat gelap. Tanpa pilihan, tema mengikuti perangkat. Pilihan disimpan di `localStorage` dengan kunci `gs-theme`; konsumen memasangnya sebagai `data-theme` pada `<html>` lewat skrip kecil di `<head>` agar halaman tidak berkedip. `theme: false` menyembunyikan tombol.

Konsumen memberi `logos` (satu entri: `logo-planters-club-horizontal-white.png`), `links` (anchor ke bagian yang benar-benar ada), dan `cta`.
