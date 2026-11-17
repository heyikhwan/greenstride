import { EVENT } from "./event";

export type FaqCategoryId = "umum" | "tim" | "akun" | "aktivitas" | "submit" | "hadiah" | "kendala";

export type FaqItem = {
  id: string;
  cat: FaqCategoryId;
  q: string;
  /** Paragraf jawaban; paragraf pertama dibuka dengan kepastian. */
  a: string[];
  list?: string[];
  /** Hal yang mudah terlewat, tampil sebagai callout kuning. */
  note?: string;
  /** Kata kunci tambahan untuk pencarian. */
  tags?: string;
};

export const FAQ_CATEGORIES: { id: FaqCategoryId; label: string; icon: string }[] = [
  { id: "umum", label: "Tentang lomba", icon: "flag" },
  { id: "tim", label: "Tim & pendaftaran", icon: "team" },
  { id: "akun", label: "Aplikasi", icon: "phone" },
  { id: "aktivitas", label: "Aturan lari", icon: "run" },
  { id: "submit", label: "Submit", icon: "upload" },
  { id: "hadiah", label: "Target & hadiah", icon: "medal" },
  { id: "kendala", label: "Kendala", icon: "lifebuoy" },
];

const E = EVENT;

export const FAQ: FaqItem[] = [
  // Tentang lomba
  {
    id: "apa-itu-greenstride", cat: "umum", q: "Apa itu PTPN GreenStride 2026?",
    a: ["Lomba lari virtual beregu untuk karyawan PTPN Group yang diselenggarakan Planters Club. Kamu lari atau jalan di luar ruangan di mana saja, lalu jaraknya dijumlahkan bersama tim."],
    tags: "virtual run lomba planters club",
  },
  {
    id: "kapan-lomba", cat: "umum", q: "Kapan lombanya berlangsung?",
    a: [`${E.raceRangeLabel}. Dimulai pukul 00.00 WIB dan ditutup pukul 23.59 WIB, total ${E.raceDays} hari.`],
    tags: "tanggal jadwal mulai selesai periode",
  },
  {
    id: "harus-bareng", cat: "umum", q: "Apakah satu tim harus lari bersama?",
    a: ["Tidak. Setiap anggota bebas memilih tempat dan waktu sendiri. Yang dihitung adalah jumlah jarak semua anggota."],
    tags: "lokasi beda kota bareng",
  },
  {
    id: "biaya", cat: "umum", q: "Apakah ada biaya?",
    a: ["Tidak, gratis. Setiap peserta mendapat e-BIB, dan tim finisher mendapat e-certificate serta medali."],
    tags: "bayar gratis",
  },
  {
    id: "offline-race", cat: "umum", q: "Kapan offline race di Jakarta?",
    a: [`Tanggalnya diumumkan panitia. Offline race diikuti ${E.topTeamsInvited} tim terbaik dan 10 peraih MVP.`],
    tags: "jakarta awarding undangan",
  },

  // Tim & pendaftaran
  {
    id: "siapa-boleh-ikut", cat: "tim", q: "Siapa yang boleh ikut?",
    a: ["Karyawan PTPN Group yang hubungan kerjanya aktif sampai lomba selesai, termasuk karyawan tetap, PKWT, dan karyawan penugasan."],
    tags: "syarat peserta karyawan",
  },
  {
    id: "pkwt", cat: "tim", q: "Saya karyawan PKWT. Boleh ikut?",
    a: ["Boleh, selama kontrakmu aktif sampai lomba selesai. SDM unit memverifikasi statusmu."],
    tags: "kontrak giling musiman nik sap",
  },
  {
    id: "outsourcing", cat: "tim", q: "Apakah tenaga alih daya boleh ikut?",
    a: ["Tidak. GreenStride 2026 khusus untuk karyawan langsung perusahaan di lingkungan PTPN Group."],
    tags: "outsource vendor pihak ketiga",
  },
  {
    id: "keluarga", cat: "tim", q: "Bolehkah keluarga ikut dalam tim?",
    a: ["Tidak. Semua anggota tim harus karyawan PTPN Group. Keluarga boleh menemani lari, tetapi jaraknya tidak dihitung."],
    tags: "istri suami anak umum",
  },
  {
    id: "jumlah-anggota", cat: "tim", q: "Berapa orang dalam satu tim?",
    a: [`Maksimal ${E.teamMax} orang. Satu unit, bagian, divisi, atau anak perusahaan boleh mengirim maksimal ${E.teamsPerUnit} tim.`],
    tags: "anggota kontingen",
  },
  {
    id: "kurang-dari-lima", cat: "tim", q: "Bolehkah tim kurang dari 5 orang?",
    a: [`Boleh. Target tetap ${E.teamTargetKm} km dan setiap anggota minimal ${E.memberMinKm} km, jadi porsi tiap orang lebih besar.`],
    list: ["4 orang: 75 km per orang", "3 orang: 100 km per orang", "2 orang: 150 km per orang"],
    tags: "4 orang 3 orang",
  },
  {
    id: "satu-unit", cat: "tim", q: "Kenapa anggota tim harus dari unit yang sama?",
    a: ["Agar kebersamaan di tiap tempat kerja makin kuat dan kompetisi lebih seimbang antar tim."],
    tags: "lintas unit campur",
  },
  {
    id: "data-pendaftaran", cat: "tim", q: "Data apa yang harus dilengkapi?",
    a: ["Setiap anggota mengisi email pribadi dan NIK SAP, serta menandatangani surat pernyataan bermeterai. Pendaftaran tim lengkap bila data semua anggota lengkap."],
    tags: "email gmail nik sap formulir meterai",
  },
  {
    id: "surat-pernyataan", cat: "tim", q: "Apakah surat pernyataan bermeterai wajib?",
    a: ["Ya. Tanpa surat pernyataan bermeterai, kamu tidak bisa ditetapkan sebagai peserta. Pastikan nama tim di surat sama dengan data pendaftaran."],
    tags: "materai meterai template",
  },
  {
    id: "ganti-anggota", cat: "tim", q: "Bisakah mengganti anggota atau nama tim?",
    a: ["Bisa sampai pendaftaran ditutup 18 November 2026, diajukan ketua tim dan disetujui panitia. Setelah itu data tim tidak dapat diubah."],
    tags: "ganti anggota rename cedera sakit pengganti",
  },

  // Aplikasi
  {
    id: "aplikasi-apa", cat: "akun", q: "Aplikasi apa yang dipakai?",
    a: [`Dua aplikasi: Strava untuk merekam lari, dan ${E.appName} sebagai aplikasi resmi lomba untuk eBIB, submit, dan peringkat. Keduanya dihubungkan.`],
    tags: "vr99 strava unduh download",
  },
  {
    id: "kode-undangan", cat: "akun", q: "Perlu kode undangan atau daftar event sendiri di aplikasi?",
    a: [`Tidak. Panitia mendaftarkan kepesertaanmu lewat sistem setelah kamu punya akun ${E.appName}. Konfirmasi dikirim ke email.`],
    tags: "invitation code join race",
  },
  {
    id: "email-sama", cat: "akun", q: "Email mana yang harus dipakai?",
    a: [`Satu email yang sama di formulir pendaftaran, akun Strava, dan akun ${E.appName}. Email berbeda membuat kepesertaanmu tidak terbaca sistem.`],
    tags: "gmail email kantor",
  },
  {
    id: "event-tidak-muncul", cat: "akun", q: "Event belum muncul di My Races. Kenapa?",
    a: ["Pastikan email akunmu sama dengan email di formulir. Bila sudah sama dan tetap tidak muncul, laporkan ke Help Desk dengan nama, tim, dan email."],
    tags: "my races kosong belum terdaftar",
  },
  {
    id: "ebib", cat: "akun", q: "Di mana melihat e-BIB?",
    a: ["Buka My Races, pilih GreenStride 2026, lalu klik eBib. Tekan Download Image untuk menyimpannya."],
    tags: "nomor peserta bib",
  },
  {
    id: "hubungkan-strava", cat: "akun", q: "Bagaimana menghubungkan Strava?",
    a: ["Lakukan sekali sebelum lari pertama:"],
    list: [`Di ${E.appName}, pilih Submit lalu Strava Connect.`, "Login dengan akun Strava yang sudah kamu pakai.", "Biarkan semua izin tercentang, lalu Authorize.", "Buka Auto Submission dan pastikan Strava ON."],
    tags: "connect sinkron sync auto submit",
  },
  {
    id: "smartwatch", cat: "akun", q: "Boleh merekam pakai smartwatch?",
    a: ["Boleh, selama jam tanganmu tersinkron ke akun Strava yang terhubung. Garmin, Coros, Apple Watch, dan perangkat lain yang terhubung ke Strava bisa dipakai."],
    tags: "garmin coros apple watch huawei",
  },
  {
    id: "lupa-password", cat: "akun", q: "Saya lupa password 99 Virtual Race.",
    a: ["Pilih Forgot password di halaman login. Jangan membuat akun baru dengan email lain."],
    tags: "reset kata sandi login",
  },

  // Aturan lari
  {
    id: "jenis-aktivitas", cat: "aktivitas", q: "Aktivitas apa yang dihitung?",
    a: ["Lari atau jalan kaki di luar ruangan yang terekam di Strava. Mode Run dan Walk sama-sama dihitung."],
    tags: "run walk jalan",
  },
  {
    id: "treadmill", cat: "aktivitas", q: "Apakah treadmill atau bersepeda dihitung?",
    a: ["Tidak. Treadmill, lari di dalam ruangan, bersepeda, dan olahraga lain tidak dihitung."],
    tags: "indoor gym sepeda renang",
  },
  {
    id: "pace", cat: "aktivitas", q: "Berapa batas pace?",
    a: [`${E.paceFast} sampai ${E.paceSlow} menit/km (sekitar 12 sampai 4 km/jam), dihitung dari moving time. Aktivitas di luar rentang ini tidak dihitung.`],
    tags: "kecepatan cepat lambat moving time",
  },
  {
    id: "24km", cat: "aktivitas", q: "Apakah harus lari 24 km setiap hari?",
    a: [`Tidak. ${E.dailyMaxKm} km adalah batas jarak yang dihitung per orang per hari, bukan target. Di tim berisi 5 orang, rata-rata 2,1 km per orang per hari sudah cukup.`],
    tags: "24 km batas wajib target harian",
  },
  {
    id: "lebih-24km", cat: "aktivitas", q: "Bagaimana kalau lari lebih dari 24 km sehari?",
    a: [`Yang dihitung tetap ${E.dailyMaxKm} km. Kelebihannya tidak menambah jarak tim.`],
    tags: "long run marathon",
  },
  {
    id: "jarak-pendek", cat: "aktivitas", q: "Lari 2 km saja boleh?",
    a: [`Boleh. Kamu bisa lari pagi dan sore, maksimal ${E.dailySubmitMax} aktivitas per hari.`],
    tags: "1 km 2 km pemula",
  },
  {
    id: "lokasi", cat: "aktivitas", q: "Boleh lari di area kebun atau kantor?",
    a: ["Boleh, di mana saja di luar ruangan selama aman dan sinyal GPS terekam baik. Di kebun, pilih jalur yang boleh dilalui."],
    tags: "afdeling lapangan stadion",
  },
  {
    id: "di-luar-periode", cat: "aktivitas", q: "Lari sebelum 23 November dihitung?",
    a: ["Tidak. Hanya aktivitas antara 23 November 2026 pukul 00.00 WIB dan 20 Desember 2026 pukul 23.59 WIB yang dihitung."],
    tags: "latihan sebelum periode",
  },
  {
    id: "zona-waktu", cat: "aktivitas", q: "Saya di wilayah WITA atau WIT. Batas waktunya jam berapa?",
    a: ["Semua batas waktu memakai WIB. Pukul 23.59 WIB sama dengan 00.59 WITA dan 01.59 WIT."],
    tags: "timezone sulawesi kalimantan papua",
  },

  // Submit
  {
    id: "cara-submit", cat: "submit", q: "Bagaimana cara submit hasil lari?",
    a: [`Simpan aktivitas di Strava dengan pilihan Everyone. Bila Auto Submission menyala, aktivitas otomatis masuk ke ${E.appName}. Cek di My Races, Submit Logs.`],
    tags: "lapor upload kirim",
  },
  {
    id: "batas-submit", cat: "submit", q: "Berapa kali boleh submit dalam sehari?",
    a: [`Maksimal ${E.dailySubmitMax} kali per hari, dengan jarak dihitung maksimal ${E.dailyMaxKm} km.`],
    tags: "3 kali tiga sesi",
  },
  {
    id: "grup-strava", cat: "submit", q: "Apakah harus unggah ke grup Strava?",
    a: [`Ya. Unggah aktivitas beserta foto atau selfie ke grup Strava "${E.stravaGroup}" pada hari yang sama, paling lambat 23.59 WIB.`],
    tags: "club foto selfie bukti",
  },
  {
    id: "everyone", cat: "submit", q: "Kenapa aktivitas harus Everyone?",
    a: ["Agar panitia bisa memverifikasinya. Aktivitas yang disembunyikan dapat dihapus admin verifikasi."],
    note: "Ubah Who can view menjadi Everyone sebelum menekan Save Activity.",
    tags: "private visibility followers",
  },
  {
    id: "langsung-sah", cat: "submit", q: "Apakah aktivitas yang masuk langsung sah?",
    a: ["Belum tentu. Panitia memverifikasi secara berkala, sehingga angka di leaderboard bisa berubah sampai verifikasi final."],
    tags: "verifikasi leaderboard berubah dihapus",
  },
  {
    id: "curang", cat: "submit", q: "Apa akibatnya jika curang?",
    a: ["Kepesertaan dibatalkan tanpa pemberitahuan. Contohnya merekam sambil berkendara, menitipkan perangkat ke orang lain, atau memalsukan data."],
    tags: "joki kendaraan motor diskualifikasi",
  },

  // Target & hadiah
  {
    id: "syarat-finisher", cat: "hadiah", q: "Apa syarat tim menjadi finisher?",
    a: [`Total jarak tim minimal ${E.teamTargetKm} km dan setiap anggota minimal ${E.memberMinKm} km, dari aktivitas yang lolos verifikasi.`],
    tags: "300 km 60 km finish",
  },
  {
    id: "anggota-kurang-60", cat: "hadiah", q: "Tim sudah 300 km, tapi ada anggota di bawah 60 km. Finisher?",
    a: [`Belum. Setiap anggota wajib mencapai minimal ${E.memberMinKm} km.`],
    tags: "individu minimal",
  },
  {
    id: "sudah-300", cat: "hadiah", q: "Tim sudah 300 km. Boleh berhenti?",
    a: ["Boleh, tim sudah memenuhi syarat finisher. Namun peringkat ditentukan dari total jarak, jadi terus menambah jarak memperbesar peluang masuk tim terbaik."],
    tags: "lanjut setelah target",
  },
  {
    id: "penentuan-juara", cat: "hadiah", q: "Bagaimana pemenang ditentukan?",
    a: ["Dari total jarak terjauh yang lolos verifikasi. Bila jaraknya sama, ditentukan dari pace rata-rata."],
    tags: "ranking juara peringkat seri",
  },
  {
    id: "hadiah", cat: "hadiah", q: "Apa saja penghargaannya?",
    a: ["Empat tingkat penghargaan:"],
    list: [
      "Semua tim finisher: e-certificate dan medali",
      `${E.topTeamsInvited} tim terbaik: finisher jersey dan undangan offline race di Jakarta`,
      "6 tim terbaik (Juara I – III, Harapan I – III): uang tunai",
      "10 anggota tim terbaik (MVP): uang tunai",
    ],
    tags: "hadiah uang jersey medali sertifikat mvp",
  },
  {
    id: "mvp", cat: "hadiah", q: "Saya MVP, tapi tim saya di luar 50 besar. Tetap diundang?",
    a: ["Ya. Peraih MVP tetap diundang ke offline race di Jakarta."],
    tags: "individu terbaik undangan",
  },
  {
    id: "lihat-peringkat", cat: "hadiah", q: "Di mana melihat peringkat?",
    a: [`Di menu Ranking aplikasi ${E.appName}. Pilih Group Leaderboard untuk peringkat tim, lalu klik nama tim untuk melihat anggotanya.`],
    tags: "leaderboard klasemen",
  },

  // Kendala
  {
    id: "aktivitas-tidak-masuk", cat: "kendala", q: "Aktivitas saya tidak muncul di 99 Virtual Race.",
    a: ["Periksa berurutan:"],
    list: [
      "Aktivitas sudah tersimpan di Strava.",
      "Who can view diatur ke Everyone.",
      "Akun Strava yang terhubung sama dengan yang dipakai merekam.",
      "Auto Submission untuk Strava menyala.",
      "Pace dalam rentang 5:00 – 15:00 menit/km dan belum lewat 2 submit hari itu.",
    ],
    tags: "tidak sinkron hilang sync gagal",
  },
  {
    id: "internet", cat: "kendala", q: "Harus online selama lari?",
    a: ["Tidak. Strava merekam dengan GPS dan mengunggah saat ponsel kembali online. Pastikan terunggah sebelum 23.59 WIB."],
    tags: "sinyal kuota offline kebun",
  },
  {
    id: "gps", cat: "kendala", q: "GPS saya tidak akurat.",
    a: ["Tunggu tulisan GPS Acquired sebelum Start, nyalakan izin lokasi, dan matikan mode hemat baterai. Jarak yang melompat bisa membuat pace keluar rentang."],
    tags: "lokasi melompat akurasi",
  },
  {
    id: "strava-gagal-login", cat: "kendala", q: "Tidak bisa login Strava saat menghubungkan.",
    a: ["Login dengan cara yang sama seperti saat membuat akun (email, Google, Apple, atau Facebook). Jangan membuat akun Strava baru."],
    tags: "gagal connect akun ganda",
  },
  {
    id: "hubungi", cat: "kendala", q: "Ke mana melapor bila ada kendala?",
    a: ["Ke Help Desk GreenStride. Sertakan nama, unit, nama tim, waktu kejadian, dan tangkapan layar agar cepat ditangani."],
    tags: "kontak helpdesk cs panitia pic",
  },
  {
    id: "keselamatan", cat: "kendala", q: "Siapa yang menanggung bila terjadi cedera?",
    a: ["Peserta bertanggung jawab atas dirinya sendiri selama berolahraga. Lari sesuai kemampuan, pilih rute aman, dan berhenti bila badan terasa tidak baik."],
    tags: "asuransi kecelakaan kesehatan",
  },
];
