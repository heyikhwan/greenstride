/* eslint-disable @next/next/no-img-element */
import Faq from "@/components/Faq";
import StructuredData from "@/components/StructuredData";
import { AppCard, Button, DocumentCard, Icon, Pillar, RuleGraphic, SectionHeader } from "@/components/ds";
import { ActivityCheck, AppSteps, Countdown, KmRoute, KmSplitter, Navbar, RaceCalendar, RewardLadder, Schedule, TeamRoute } from "@/components/interactive";
import { APPS, DOCUMENTS, EVENT } from "@/lib/event";

export default function Home() {
  return (
    <>
      <StructuredData />
      <a className="skip" href="#ringkasan">
        Langsung ke isi
      </a>
      <Navbar />

      <main id="top">
        {/* ───────── Hero */}
        <section className="hero gs-on-band" aria-labelledby="hero-h">
          <div className="wrap hero__inner">
            <div>
              <img className="hero__brand enter" src="/img/logo-greenstride-white.png" alt="PTPN GreenStride 2026" width={608} height={206} />
              <h1 id="hero-h" className="enter enter--2">
                Kumpulkan <em>300 km</em> bersama timmu
              </h1>
              <p className="hero__lead enter enter--3">
                Lomba lari virtual beregu untuk karyawan PTPN Group. Lari atau jalan di mana saja, rekam di Strava, dan
                bawa pulang <strong>medali finisher</strong>.
              </p>
              <div className="hero__actions enter enter--4">
                <Button variant="lime" size="lg" href="#faq" arrow>
                  Cari jawaban
                </Button>
                <Button variant="on-band" size="lg" href="#cara-ikut" icon="phone">
                  Siapkan aplikasi
                </Button>
              </div>
              <div className="hero__pillars enter enter--5">
                <Pillar icon="run">Move together</Pillar>
                <Pillar icon="heart-pulse">Live better</Pillar>
                <Pillar icon="team">Grow stronger</Pillar>
              </div>
            </div>

            <div className="hero__visual enter enter--3">
              <img
                className="hero__photo"
                src="/img/hero-runners.webp"
                alt="Dua pelari menyusuri jalan di antara kebun teh dan sawit dengan kota di kejauhan"
                width={800}
                height={950}
                fetchPriority="high"
              />
              <span className="hero__tagline">Every step counts</span>
              <div className="hero__count">
                <Countdown />
              </div>
            </div>
          </div>
          {/* Gelombang bertumpuk dari key visual: daun, lime, lalu warna halaman. */}
          <svg className="hero__wave" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">
            <path className="hero__wave-leaf" d="M0 58C300 6 640 118 1000 70c180-24 320-58 440-62v112H0z" />
            <path className="hero__wave-lime" d="M0 84C340 40 700 124 1060 84c150-17 270-38 380-44v80H0z" />
            <path className="hero__wave-page" d="M0 100c360-38 740 30 1100-4 130-12 240-22 340-26v50H0z" />
          </svg>
        </section>

        {/* ───────── Ringkasan */}
        <section className="section" id="ringkasan" aria-labelledby="ringkasan-h">
          <div className="wrap">
            <div className="section__head">
              <SectionHeader
                id="ringkasan-h"
                eyebrow="Ringkasan aturan"
                title={
                  <>
                    Tiga hal yang <em>perlu kamu ingat</em>
                  </>
                }
                lead="Target tim, batas harian, dan aktivitas yang dihitung. Cek aktivitasmu langsung di bawah."
              />
            </div>
            <div className="rules">
              <div className="rules__team gs-on-band">
                <div className="rules__team-head">
                  <div>
                    <h3 className="rules__label">
                      <Icon name="team" size={20} /> Target tim
                    </h3>
                    <p className="rules__big">
                      {EVENT.teamTargetKm}
                      <small>km</small>
                    </p>
                  </div>
                  <p className="rules__sub">
                    dalam <strong>{EVENT.raceDays} hari</strong>, dari tim berisi maksimal <strong>{EVENT.teamMax} orang</strong>. Maksimal {EVENT.teamsPerUnit} tim
                    per unit.
                  </p>
                </div>
                <TeamRoute />
              </div>

              <div className="rules__daily">
                <h3 className="rules__label">
                  <Icon name="calendar" size={20} /> Setiap hari
                </h3>
                <ul className="rules__list">
                  <li>
                    <RuleGraphic name="limit" value={EVENT.dailyMaxKm} />
                    <div>
                      <p className="rules__num">
                        {EVENT.dailyMaxKm}
                        <small>km</small>
                      </p>
                      <p className="rules__desc">Batas jarak yang dihitung per orang. Batas, bukan target.</p>
                    </div>
                  </li>
                  <li>
                    <RuleGraphic name="submit" />
                    <div>
                      <p className="rules__num">
                        {EVENT.dailySubmitMax}
                        <small>kali submit</small>
                      </p>
                      <p className="rules__desc">Misalnya lari pagi dan jalan sore.</p>
                    </div>
                  </li>
                  <li>
                    <RuleGraphic name="deadline" />
                    <div>
                      <p className="rules__num">
                        23.59<small>WIB</small>
                      </p>
                      <p className="rules__desc">Batas unggah aktivitas dan foto ke grup Strava “{EVENT.stravaGroup}”.</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="rules__valid">
                <div className="rules__valid-text">
                  <div className="verdicts">
                    <div className="verdicts__col verdicts__col--yes">
                      <h3>
                        <span className="verdicts__mark">
                          <Icon name="check" size={16} strokeWidth={3} />
                        </span>
                        Dihitung
                      </h3>
                      <ul>
                        <li>
                          <Icon name="gps" size={20} />
                          Lari atau jalan di luar ruangan, direkam GPS di Strava
                        </li>
                        <li>
                          <Icon name="clock" size={20} />
                          Pace {EVENT.paceFast} – {EVENT.paceSlow} menit/km dari moving time
                        </li>
                        <li>
                          <Icon name="upload" size={20} />
                          Disimpan untuk Everyone, masuk sebelum 23.59 WIB
                        </li>
                        <li>
                          <Icon name="calendar" size={20} />
                          Terjadi {EVENT.raceRangeLabel}
                        </li>
                      </ul>
                    </div>
                    <div className="verdicts__col verdicts__col--no">
                      <h3>
                        <span className="verdicts__mark">
                          <Icon name="close" size={16} strokeWidth={3} />
                        </span>
                        Tidak dihitung
                      </h3>
                      <ul>
                        <li>
                          <Icon name="ban" size={20} />
                          Treadmill dan lari di dalam ruangan
                        </li>
                        <li>
                          <Icon name="ban" size={20} />
                          Bersepeda atau olahraga lain
                        </li>
                        <li>
                          <Icon name="ban" size={20} />
                          Aktivitas di luar periode lomba
                        </li>
                        <li>
                          <Icon name="alert" size={20} />
                          Merekam sambil berkendara: kepesertaan dibatalkan
                        </li>
                      </ul>
                    </div>
                  </div>
                  <p className="rules__verify">
                    <Icon name="shield-check" size={18} />
                    Panitia memverifikasi secara berkala, jadi angka di leaderboard bisa berubah sampai verifikasi final.
                  </p>
                </div>
                <ActivityCheck wide />
              </div>
            </div>
          </div>
        </section>

        {/* ───────── Cara ikut */}
        <section className="section section--tint" id="cara-ikut" aria-labelledby="cara-ikut-h">
          <div className="wrap">
            <div className="section__head">
              <SectionHeader
                id="cara-ikut-h"
                eyebrow="Cara ikut"
                title={
                  <>
                    Lima langkah sebelum <em>lari pertama</em>
                  </>
                }
                lead="Pilih langkah untuk melihat layarnya. Setelah Strava terhubung, setiap lari otomatis tercatat untuk timmu."
              />
            </div>
            <AppSteps />
            <div className="apps">
              <h3 className="apps__title">Unduh aplikasinya</h3>
              {APPS.map((a) => (
                <AppCard key={a.name} {...a} />
              ))}
            </div>
          </div>
        </section>

        {/* ───────── 24 km */}
        <section className="section" id="batas-harian" aria-labelledby="km-h">
          <div className="wrap km">
            <div className="km__panel gs-on-band">
              <img className="km__photo" src="/img/photo-langkah-pelari.webp" alt="" width={1400} height={931} loading="lazy" />
              <span className="gs-eyebrow">Batas {EVENT.dailyMaxKm} km</span>
              <h2 id="km-h" className="km__statement">
                Gak harus jauh, yang penting <em>melangkah</em>.
              </h2>
              <p className="km__text">
                <strong>{EVENT.dailyMaxKm} km adalah batas harian, bukan target.</strong> Di tim berisi lima orang, rata-rata 2,1 km per orang per hari sudah
                membawa tim ke {EVENT.teamTargetKm} km. Lari pagi dan sore pun boleh.
              </p>
              <KmRoute />
            </div>
            <KmSplitter />
          </div>
        </section>

        {/* ───────── Jadwal */}
        <section className="section section--tint" id="jadwal" aria-labelledby="jadwal-h">
          <div className="wrap">
            <div className="section__head">
              <SectionHeader
                id="jadwal-h"
                eyebrow="Jadwal"
                title={
                  <>
                    {EVENT.raceDays} hari untuk <em>300 km</em>
                  </>
                }
                lead="Semua batas waktu memakai WIB. Tanda kuning menandai tahap yang sedang berjalan."
              />
            </div>
            <div className="split">
              <RaceCalendar />
              <Schedule />
            </div>
          </div>
        </section>

        {/* ───────── Hadiah */}
        <section className="section" id="hadiah" aria-labelledby="hadiah-h">
          <div className="wrap">
            <div className="section__head">
              <SectionHeader
                id="hadiah-h"
                eyebrow="Penghargaan"
                title={
                  <>
                    Setiap langkah <em>dihargai</em>
                  </>
                }
                lead="Peringkat ditentukan dari total jarak yang lolos verifikasi. Bila sama, dari pace rata-rata."
              />
            </div>
            <RewardLadder />
          </div>
        </section>

        {/* ───────── FAQ */}
        <section className="section section--tint" id="faq" aria-labelledby="faq-h">
          <div className="wrap">
            <div className="section__head">
              <SectionHeader
                id="faq-h"
                eyebrow="Pusat jawaban"
                title={
                  <>
                    Ada pertanyaan? <em>Cari di sini</em>
                  </>
                }
                lead="Ketik kata kunci atau pilih topik. Tekan / untuk langsung ke kolom pencarian."
              />
            </div>
            <Faq />
          </div>
        </section>

        {/* ───────── Unduhan */}
        <section className="section" id="unduhan" aria-labelledby="unduhan-h">
          <div className="wrap">
            <div className="section__head">
              <SectionHeader id="unduhan-h" eyebrow="Unduhan" title="Dokumen untuk peserta" lead="Simpan di ponselmu agar bisa dibaca tanpa sinyal." />
            </div>
            <div className="docs">
              {DOCUMENTS.map((d) => (
                <DocumentCard key={d.href} {...d} />
              ))}
            </div>
          </div>
        </section>

        {/* ───────── Bantuan */}
        <section className="wrap" aria-labelledby="bantuan-h">
          <div className="help gs-on-band">
            <div className="help__body">
              <SectionHeader
                id="bantuan-h"
                eyebrow="Bantuan"
                title={
                  <>
                    Masih ada <em>kendala</em>?
                  </>
                }
                lead="Laporkan ke Help Desk GreenStride. Siapkan data berikut agar laporanmu cepat ditangani."
              />
              <div className="help__actions">
                <Button variant="lime" size="lg" href={EVENT.helpdeskUrl} external arrow>
                  Buka Help Desk
                </Button>
              </div>
            </div>
            <div className="help__list">
              <h3>Siapkan sebelum melapor</h3>
              <ul>
                {["Nama lengkap", "Unit kerja", "Nama tim", "Waktu kejadian", "Tangkapan layar aplikasi"].map((t) => (
                  <li key={t}>
                    <Icon name="check" size={16} strokeWidth={2.5} />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <img className="help__runner" src="/img/pelari-greenstride.webp" alt="" width={540} height={1339} loading="lazy" />
          </div>
        </section>
      </main>

      {/* ───────── Footer */}
      <footer className="footer gs-on-band">
        <div className="wrap">
          <div className="footer__inner">
            <div>
              <img className="footer__brand" src="/img/logo-greenstride-white.png" alt="PTPN GreenStride 2026" width={608} height={206} loading="lazy" />
              <p className="footer__line">Every step counts. Every stride matters.</p>
              <div className="footer__logos">
                <img className="footer__logo-brand" src="/img/logo-planters-club-horizontal.png" alt="Planters Club" width={157} height={56} loading="lazy" />
                <span className="footer__logo-parents">
                  <img src="/img/logo-danantara.png" alt="Danantara Indonesia" width={99} height={26} loading="lazy" />
                  <img src="/img/logo-ptpn-holding.png" alt="Perkebunan Nusantara" width={75} height={36} loading="lazy" />
                </span>
              </div>            </div>
            <nav className="footer__nav" aria-label="Footer">
              <h3>Halaman ini</h3>
              <a href="#ringkasan">Ringkasan aturan</a>
              <a href="#cara-ikut">Cara ikut</a>
              <a href="#jadwal">Jadwal</a>
              <a href="#hadiah">Penghargaan</a>
              <a href="#faq">Pusat jawaban</a>
              <a href="#unduhan">Unduhan</a>
              <a href={EVENT.helpdeskUrl} target="_blank" rel="noopener noreferrer">
                Help Desk
              </a>
            </nav>
          </div>
          <div className="footer__legal">
            <span>© 2026 Planters Club · PTPN Group</span>
            <span>{EVENT.tagline}</span>
          </div>
        </div>
      </footer>
    </>
  );
}
