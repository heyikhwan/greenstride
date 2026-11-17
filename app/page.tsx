/* eslint-disable @next/next/no-img-element */
import CopyTemplate from "@/components/CopyTemplate";
import Faq from "@/components/Faq";
import StructuredData from "@/components/StructuredData";
import { AppCard, Button, Callout, DocumentCard, FactTile, Pillar, RewardCard, SectionHeader } from "@/components/ds";
import { AppSteps, Countdown, KmSplitter, Navbar, Schedule } from "@/components/interactive";
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
                    Enam angka yang <em>perlu kamu ingat</em>
                  </>
                }
                lead="Semua aturan inti lomba dalam satu pandangan. Rinciannya ada di pusat jawaban."
              />
            </div>
            <div className="facts">
              <FactTile icon="team" value={EVENT.teamMax} unit="orang" label="Maksimal per tim" note={`Maksimal ${EVENT.teamsPerUnit} tim per unit`} />
              <FactTile icon="route" value={EVENT.teamTargetKm} unit="km" label="Target tim" note={`Dikumpulkan dalam ${EVENT.raceDays} hari`} />
              <FactTile icon="flag" value={EVENT.memberMinKm} unit="km" label="Minimal per anggota" note="Syarat tim menjadi finisher" />
              <FactTile icon="calendar" value={EVENT.dailyMaxKm} unit="km" label="Batas per hari" note="Jarak terbanyak yang dihitung, bukan target" />
              <FactTile icon="upload" value={EVENT.dailySubmitMax} unit="kali" label="Submit per hari" note="Paling lambat 23.59 WIB" />
              <FactTile icon="clock" value="5–15" unit="menit/km" label="Rentang pace" note="Dihitung dari moving time" />
            </div>
            <Callout tone="rule" title="Tidak dihitung">
              Treadmill, lari di dalam ruangan, bersepeda, dan aktivitas di luar {EVENT.raceRangeLabel}.
            </Callout>
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
            <div>
              <span className="gs-eyebrow">Batas 24 km</span>
              <h2 id="km-h" className="km__statement" style={{ marginTop: 12 }}>
                Gak harus jauh, yang penting <em>melangkah</em>.
              </h2>
              <p className="km__text">
                <strong>{EVENT.dailyMaxKm} km adalah batas harian, bukan target.</strong> Di tim berisi lima orang, rata-rata
                2,1 km per orang per hari sudah membawa tim ke {EVENT.teamTargetKm} km. Lari pagi dan sore pun boleh.
              </p>
              <img
                className="km__photo"
                src="/img/photo-langkah-pelari.webp"
                alt="Langkah kaki para pelari di jalan aspal"
                width={1400}
                height={931}
                loading="lazy"
              />
            </div>
            <KmSplitter />
          </div>
        </section>

        {/* ───────── Jadwal */}
        <section className="section section--tint" id="jadwal" aria-labelledby="jadwal-h">
          <div className="wrap split">
            <div className="split__side">
              <SectionHeader
                id="jadwal-h"
                eyebrow="Jadwal"
                title={
                  <>
                    {EVENT.raceDays} hari untuk <em>300 km</em>
                  </>
                }
                lead="Semua batas waktu memakai WIB. Titik kuning menandai tahap yang sedang berjalan."
              />
              <Callout tone="attention" title="Tiap hari, sebelum 23.59 WIB">
                Unggah aktivitas dan foto ke grup Strava “{EVENT.stravaGroup}”.
              </Callout>
            </div>
            <Schedule />
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
            <div className="rewards">
              <RewardCard feature icon="flag" who={`${EVENT.topTeamsInvited} tim terbaik`} title="Finisher jersey dan undangan offline race di Jakarta">
                Lari bersama tim-tim terbaik PTPN Group. Tanggal diumumkan panitia.
              </RewardCard>
              <RewardCard icon="medal" who="Semua tim finisher" title="Medali dan e-certificate">
                Tim mencapai {EVENT.teamTargetKm} km dan tiap anggota minimal {EVENT.memberMinKm} km.
              </RewardCard>
              <RewardCard icon="trophy" who="6 tim terbaik" title="Uang tunai">
                Juara I, II, III dan Harapan I, II, III.
              </RewardCard>
              <RewardCard icon="run" who="10 peraih MVP" title="Uang tunai dan undangan">
                Anggota tim dengan jarak terjauh, tetap diundang ke Jakarta meski timnya di luar 50 besar.
              </RewardCard>
              <RewardCard icon="shield-check" who="Lomba yang jujur" title="Verifikasi berkala">
                Kecurangan, seperti merekam sambil berkendara, membatalkan kepesertaan.
              </RewardCard>
            </div>
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
                lead="Laporkan ke Help Desk GreenStride. Sertakan nama, unit, tim, waktu kejadian, dan tangkapan layar agar cepat ditangani."
              />
              <div className="help__actions">
                <Button variant="lime" size="lg" href={EVENT.helpdeskUrl} external arrow>
                  Buka Help Desk
                </Button>
                <CopyTemplate />
              </div>
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
                <img src="/img/logo-danantara.png" alt="Danantara Indonesia" width={137} height={36} loading="lazy" />
                <img src="/img/logo-ptpn-holding.png" alt="Perkebunan Nusantara" width={100} height={48} loading="lazy" />
                <img src="/img/logo-planters-club.png" alt="Planters Club" width={46} height={56} loading="lazy" />
              </div>
            </div>
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
            <span>© 2026 PTPN Group · PTPN GreenStride 2026</span>
            <span>{EVENT.tagline}</span>
          </div>
        </div>
      </footer>
    </>
  );
}
