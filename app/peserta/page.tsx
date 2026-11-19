import type { Metadata } from "next";
import Chat from "@/components/ChatLazy";
import Footer from "@/components/Footer";
import Link from "next/link";
import PesertaBrowser, { StatusPill } from "@/components/PesertaBrowser";
import PesertaRekap from "@/components/PesertaRekap";
import { StatusMeter } from "@/components/PesertaSection";
import { AppCard, Button, Callout, Icon, SectionHeader } from "@/components/ds";
import { BackToTop, Drawn, Navbar } from "@/components/interactive";
import { APPS, EVENT } from "@/lib/event";
import { getPeserta } from "@/lib/peserta";
import { STATUS, fmtWib, num, teamsReady, type EntitySummary, type StatusCode } from "@/lib/peserta-shared";

// Dibuat statis lalu dibuat ulang dari Google Sheet panitia paling cepat tiap 5 menit (ISR). Lihat lib/peserta.ts.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Status peserta",
  description: "Cari nama atau tim peserta PTPN GreenStride 2026 dan lihat apakah akun 99 Virtual Race setiap anggota sudah terhubung.",
  alternates: { canonical: "/peserta/" },
  // Halaman memuat nama karyawan; tetap bisa dibuka dari situs, tetapi tidak dimasukkan ke mesin pencari.
  robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
  openGraph: { url: "/peserta/", title: "Status peserta · PTPN GreenStride 2026" },
};

const LEGEND: StatusCode[] = ["ok", "app", "fix", "wait"];
const share = (e: EntitySummary) => (e.people ? e.ok / e.people : 0);
const byShare = (a: EntitySummary, b: EntitySummary) => share(b) - share(a) || b.people - a.people;
const virtualRace = APPS[0];

export default async function PesertaPage() {
  const { data, source } = await getPeserta();
  const ranked = [...(data?.entities ?? [])].sort(byShare);
  const ready = data ? teamsReady(data.teams) : 0;
  return (
    <>
      <a className="skip" href="#cari">
        Langsung ke pencarian
      </a>
      <Navbar page="/peserta/" />

      <main id="top">
        {/* ───────── Kepala halaman: band menyambung dari header, angka kesiapan sebagai fokus */}
        <section className="phead gs-on-band" aria-labelledby="phead-h">
          <div className="wrap phead__inner">
            <div className="phead__text">
              <h1 id="phead-h">
                Cek status <Drawn as="em" className="gs-keyline">timmu</Drawn>
              </h1>
              <p className="phead__lead">Pastikan akun 99 Virtual Race setiap anggota sudah terhubung ke event sebelum {EVENT.raceRangeLabel.split(" – ")[0]}.</p>
            </div>
            {data && (
              <div className="phead__meter">
                <div className="phead__stats">
                  <p className="phead__big">
                    <strong>
                      {num(ready)}
                      <small>/{num(data.totals.teams)}</small>
                    </strong>
                    <span>tim, semua anggotanya terhubung</span>
                  </p>
                  <p className="phead__big">
                    <strong>
                      {num(data.totals.ok)}
                      <small>/{num(data.totals.people)}</small>
                    </strong>
                    <span>peserta sudah terhubung</span>
                  </p>
                </div>
                <StatusMeter totals={data.totals} className="pmeter--band" />
                <ul className="phead__legend">
                  {LEGEND.map((s) => (
                    <li key={s}>
                      <i className={`pmeter__key pmeter__seg--${s}`} aria-hidden="true" />
                      <span>{STATUS[s].label}</span>
                      <strong>{num(data.totals[s])}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* ───────── Pencarian */}
        <section className="section" id="cari" aria-labelledby="cari-h">
          <div className="wrap">
            {source === "cache" && data && (
              <div className="pnote">
                <Callout tone="info" title="Menampilkan data terakhir yang tersimpan">
                  Status terbaru belum bisa dimuat, jadi halaman ini memakai data per {fmtWib(data.updatedAt)}. Buka lagi beberapa saat lagi.
                </Callout>
              </div>
            )}
            {data ? (
              <PesertaBrowser teams={data.teams} entities={data.entities} />
            ) : (
              <div className="faq-empty perror">
                <span className="faq-empty__icon">
                  <Icon name="alert" size={28} />
                </span>
                <h2 id="cari-h">Data peserta belum bisa dimuat</h2>
                <p>Buka lagi halaman ini beberapa saat lagi. Bila perlu memastikan status sekarang, tanyakan ke Help Desk.</p>
                <div className="faq-empty__actions">
                  <a className="gs-btn gs-btn--primary gs-btn--sm" href="/peserta/">
                    <span>Muat ulang</span>
                  </a>
                  <a className="gs-btn gs-btn--ghost gs-btn--sm" href={EVENT.helpdeskUrl} target="_blank" rel="noopener noreferrer">
                    <Icon name="lifebuoy" size={18} />
                    <span>Buka Help Desk</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ───────── Arti status: yang paling sering (belum daftar aplikasi) paling besar, tiga lainnya ringkas */}
        <section className="section section--tint" id="arti-status" aria-labelledby="arti-h">
          <div className="wrap">
            <div className="section__head">
              <SectionHeader
                id="arti-h"
                eyebrow="Arti status"
                title={
                  <>
                    Belum terhubung? Ini <Drawn as="em" className="gs-keyline">langkahnya</Drawn>
                  </>
                }
                lead="Status diperbarui berkala. Ikuti langkah sesuai statusmu, lalu cek lagi nanti."
              />
            </div>
            <div className="pguide">
              <article className="pguide__main" aria-labelledby="arti-app">
                <h3 id="arti-app" className="pguide__h">
                  <StatusPill status="app" />
                </h3>
                <p className="pguide__lead">Akun 99 Virtual Race dengan email yang kamu tulis di formulir pendaftaran belum ditemukan.</p>
                <ol className="pguide__steps">
                  <li>Unduh 99 Virtual Race, lalu ketuk Join Us.</li>
                  <li>Daftar dengan email yang sama persis dengan formulir pendaftaran tim.</li>
                  <li>Tunggu pengecekan berikutnya, lalu cari lagi namamu di halaman ini.</li>
                  <li>Sudah daftar dengan email yang benar tetapi status tidak berubah setelah pengecekan berikutnya? Laporkan ke Help Desk.</li>
                </ol>
                <AppCard {...virtualRace} />
                <Link className="pguide__link" href="/#panduan">
                  Lihat panduan bergambar
                </Link>
              </article>
              <div className="pguide__side">
                <article className="pguide__item" aria-labelledby="arti-fix">
                  <h3 id="arti-fix" className="pguide__h">
                    <StatusPill status="fix" />
                  </h3>
                  <p>Email kosong, formatnya salah, atau dipakai lebih dari satu orang. Laporkan ke Help Desk dengan nama lengkap dan nama tim.</p>
                  <Button variant="secondary" size="sm" href={EVENT.helpdeskUrl} external icon="lifebuoy">
                    Buka Help Desk
                  </Button>
                </article>
                <article className="pguide__item" aria-labelledby="arti-wait">
                  <h3 id="arti-wait" className="pguide__h">
                    <StatusPill status="wait" />
                  </h3>
                  <p>Namamu tercatat di formulir pendaftaran, tetapi belum masuk daftar pengecekan 99 Virtual Race. Pastikan akunmu sudah dibuat dengan email yang sama, lalu cek lagi nanti.</p>
                </article>
                <article className="pguide__item" aria-labelledby="arti-ok">
                  <h3 id="arti-ok" className="pguide__h">
                    <StatusPill status="ok" />
                  </h3>
                  <p>
                    Akunmu sudah terhubung ke event. Berikutnya hubungkan Strava dan nyalakan Auto Submission. <Link href="/#panduan">Buka panduan</Link>
                  </p>
                </article>
              </div>
            </div>
          </div>
        </section>

        {/* ───────── Rekap per entitas */}
        {data && (
          <section className="section" id="rekap" aria-labelledby="rekap-h">
            <div className="wrap">
              <div className="section__head">
                <SectionHeader id="rekap-h" eyebrow="Rekap entitas" title="Akun terhubung per entitas" lead="Diurutkan dari persentase tertinggi. Pilih entitas untuk melihat timnya, lalu bagikan tautannya ke koordinator unit." />
              </div>
              <PesertaRekap entities={ranked} />
            </div>
          </section>
        )}
      </main>

      <Footer home={false} />
      <BackToTop />
      <Chat />
    </>
  );
}
