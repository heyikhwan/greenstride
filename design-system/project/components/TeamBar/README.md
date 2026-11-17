# TeamBar

Grafik target tim: satu bar 300 km yang dibagi rata ke anggota. Bagian minimal tiap anggota (60 km) berwarna `leaf`, sisa porsi `lime`, label km di bawah tiap segmen dan legenda di bawahnya. Segmen terisi berurutan sekali saat pertama terlihat; saat `members` berubah, segmen membelah ulang dengan pegas.

Konsumen memberi `target`, `memberMin`, `max` (jumlah anggota terbanyak, 5) dan `members`. Dipakai di klaster "Target tim" (5 orang, statis) dan di dalam KmSplitter.
