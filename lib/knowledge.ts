import { PAGE_SECTIONS } from "./chat-shared";
import { APP_STEPS, APPS, DOCUMENTS, EVENT, HELPDESK_CHECKLIST, rupiah, SCHEDULE, SOCIALS } from "./event";
import { FAQ, FAQ_CATEGORIES } from "./faq";
import { STATUS } from "./peserta-shared";

/**
 * Basis pengetahuan asisten chat, disusun dari data yang sama dengan halaman (lib/event.ts dan lib/faq.ts).
 * Ubah ketentuan di sana, bukan di sini; jawaban asisten ikut berubah. Bagian "Aturan di halaman" menyalin
 * kalimat yang hanya ada di app/page.tsx, dan bagian "Status peserta" menyalin arti status dari app/peserta/page.tsx,
 * jadi perbarui juga bila teks halaman itu berubah.
 */

const E = EVENT;

const rules = `## Aturan di halaman
- Jarak minimal tim sebagai finisher: ${E.teamTargetKm} km dalam ${E.raceDays} hari, tim berisi maksimal ${E.teamMax} orang. Setiap anggota minimal ${E.memberMinKm} km.
- Batas harian: jarak yang dihitung 0 sampai ${E.dailyMaxKm} km per orang per hari; maksimal ${E.dailySubmitMax} kali submit per hari; akhir hari pukul 23.59 WIB. Batas jarak dan submit dihitung per hari WIB.
- ${E.dailyMaxKm} km adalah batas harian, bukan target. Di tim berisi lima orang, rata-rata 2,1 km per orang per hari sudah membawa tim minimal ${E.teamTargetKm} km.
- Dihitung: lari atau jalan di luar ruangan yang direkam GPS di Strava; pace ${E.paceFast} – ${E.paceSlow} menit/km dari moving time; disimpan untuk Everyone dan masuk sebelum 23.59 WIB; terjadi ${E.raceRangeLabel}.
- Tidak dihitung: treadmill dan lari di dalam ruangan; bersepeda atau olahraga lain; aktivitas di luar periode event. Merekam sambil berkendara: kepesertaan dibatalkan.
- Panitia memverifikasi secara berkala, jadi angka di leaderboard bisa berubah sampai verifikasi final.
- Peringkat ditentukan dari total jarak yang lolos verifikasi. Bila sama, dihitung dari pace rata-rata.
- Di bagian Tentang ada alat "cek aktivitas": isi jarak dan waktu, halaman menghitung pace dan apakah aktivitas dihitung.`;

const event = `## Acara
- Nama: ${E.name}. Tantangan lari dan jalan kaki virtual beregu untuk karyawan PTPN Group, diselenggarakan Planters Club.
- Tagline: ${E.tagline}. Pilar: Move Together, Live Better, Grow Stronger. Penutup: Every step counts. Every stride matters.
- Periode event: ${E.raceRangeLabel}, mulai 00.00 WIB dan ditutup 23.59 WIB, total ${E.raceDays} hari.
- Satu unit, bagian, divisi, atau anak perusahaan boleh mengirim maksimal ${E.teamsPerUnit} tim.
- Aplikasi resmi event: ${E.appName}. Perekam aktivitas: Strava.
- Help Desk GreenStride: ${E.helpdeskUrl}`;

const schedule = `## Jadwal (semua waktu WIB)
${SCHEDULE.map((s) => `- ${s.date}: ${s.title}. ${s.body}`).join("\n")}`;

const prizes = `## Penghargaan
- Semua tim finisher: medali dan e-certificate (tim minimal ${E.teamTargetKm} km dan tiap anggota minimal ${E.memberMinKm} km).
- ${E.topTeamsInvited} tim terbaik: finisher jersey dan undangan offline race di Jakarta, ${E.offlineRaceLabel}.
- ${E.prizes.length} tim terbaik, uang tunai: ${E.prizes.map((p) => `${p.rank} ${rupiah(p.amount)}`).join("; ")}.
- ${E.mvpCount} orang peraih MVP: masing-masing ${rupiah(E.mvpPrize)} (total ${rupiah(E.mvpPrize * E.mvpCount)}) dan undangan ke Jakarta.`;

const steps = `## Panduan aplikasi (lima langkah sebelum lari pertama)
${APP_STEPS.map((st, i) => `${i + 1}. ${st.title}: ${st.body}\n${st.shots.map((s, j) => `   ${i + 1}.${j + 1} ${s.text}`).join("\n")}`).join("\n")}`;

const apps = `## Aplikasi dan tautan unduh resmi
${APPS.map((a) => `- ${a.name} (${a.role}). App Store: ${a.appStore} · Google Play: ${a.playStore}`).join("\n")}`;

const docs = `## Dokumen di bagian Unduhan (rekomendasikan judulnya dan tautkan [Lihat unduhan](#unduhan), jangan tautkan berkasnya)
${DOCUMENTS.map((d) => `- ${d.title}: ${d.description} (${d.size}).`).join("\n")}`;

const help = `## Bantuan
- Kendala dilaporkan ke Help Desk GreenStride: ${E.helpdeskUrl}
- Siapkan sebelum melapor: ${HELPDESK_CHECKLIST.join(", ")}.
- Instagram: ${SOCIALS.map((s) => `@${s.handle} (${s.name})`).join(", ")}.`;

const S = STATUS;

const status = `## Status peserta (halaman [Cek status peserta](/peserta/))
- Peserta mencari nama atau nama timnya sendiri di halaman itu dan melihat status akun 99 Virtual Race tiap anggota. Status tim yang disebut namanya oleh pengguna ada di DATA TIM; selain itu arahkan ke halaman itu.
- Status diperbarui berkala. Setelah mengikuti langkahnya, cek lagi nanti.
- ${S.ok.label}: akun sudah terhubung ke event. Berikutnya hubungkan Strava dan nyalakan Auto Submission.
- ${S.app.label}: akun 99 Virtual Race dengan email yang ditulis di formulir pendaftaran belum ditemukan. Langkahnya: unduh 99 Virtual Race, ketuk Join Us, daftar dengan email yang sama persis dengan formulir pendaftaran tim, lalu tunggu pengecekan berikutnya. Bila sudah daftar dengan email yang benar tetapi status tidak berubah setelah pengecekan berikutnya, laporkan ke Help Desk.
- ${S.fix.label}: email kosong, formatnya salah, atau dipakai lebih dari satu orang. Laporkan ke Help Desk dengan nama lengkap dan nama tim.
- ${S.wait.label}: nama sudah tercatat di formulir pendaftaran, tetapi belum masuk daftar pengecekan 99 Virtual Race. Pastikan akun sudah dibuat dengan email yang sama, lalu cek lagi nanti.
- Bagian atas halaman menunjukkan berapa tim yang semua anggotanya sudah terhubung dan berapa peserta yang sudah terhubung. Satu anggota yang belum terhubung membuat timnya belum dihitung.
- Di bawahnya ada rekap persentase akun terhubung per entitas; tiap entitas bisa dibuka untuk melihat timnya dan tautannya bisa dibagikan ke koordinator unit.`;

const faq = `## FAQ (id dalam kurung siku bisa ditautkan sebagai #id)
${FAQ_CATEGORIES.map(
  (c) =>
    `### ${c.label}\n` +
    FAQ.filter((f) => f.cat === c.id)
      .map((f) => {
        const body = [...f.a, ...(f.list ?? []).map((li) => `- ${li}`), f.note ? `Perlu diperhatikan: ${f.note}` : ""].filter(Boolean).join("\n  ");
        return `- [${f.id}] T: ${f.q}\n  J: ${body}`;
      })
      .join("\n"),
).join("\n")}`;

const sections = `## Bagian halaman yang boleh ditautkan
${PAGE_SECTIONS.map((s) => `- [${s.link}](${s.href}): ${s.about}`).join("\n")}`;

export const KNOWLEDGE = [event, rules, schedule, prizes, steps, apps, docs, help, status, faq, sections].join("\n\n");
