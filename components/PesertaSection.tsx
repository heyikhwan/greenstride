import { Drawn } from "./interactive";
import { Icon, SectionHeader } from "./ds";
import { EVENT } from "@/lib/event";
import { STATUS, STATUS_ORDER, num, type PesertaSummary, type StatusCode, type Totals } from "@/lib/peserta-shared";

/** Bar bertumpuk jumlah peserta per status, urut terhubung lalu yang perlu tindakan. Lebar ruas sebanding jumlah orang. */
export function StatusMeter({ totals, className }: { totals: Totals; className?: string }) {
  const order: StatusCode[] = ["ok", ...STATUS_ORDER.filter((s) => s !== "ok")];
  const label = order.map((s) => `${num(totals[s])} ${STATUS[s].label.toLowerCase()}`).join(", ");
  return (
    <div className={`pmeter${className ? ` ${className}` : ""}`} role="img" aria-label={`${num(totals.people)} peserta: ${label}`}>
      {order.map((s) => (totals[s] > 0 ? <span key={s} className={`pmeter__seg pmeter__seg--${s}`} style={{ flexGrow: totals[s] }} /> : null))}
    </div>
  );
}

/**
 * Bagian Peserta di halaman utama, sesudah Panduan (urutannya sama dengan navbar). Satu panel: kiri judul, kanan jumlah yang ikut
 * dari rekap panitia (tanpa angka yang belum terhubung; rincian itu di /peserta/) lalu pencarian nama atau tim.
 * Bila rekap tidak terbaca (summary null), angka disembunyikan dan pencarian tetap tampil.
 * Formulir biasa (GET ke /peserta/?q=), jadi tetap berfungsi tanpa JavaScript.
 */
export function PesertaSection({ summary }: { summary: PesertaSummary | null }) {
  const stats: [number, string][] = summary
    ? [
        [summary.teams, "tim"],
        [summary.people, "peserta"],
      ]
    : [];
  return (
    <section className="section" id="peserta" aria-labelledby="peserta-h">
      <div className="wrap">
        <div className="ppeserta">
          <SectionHeader
            id="peserta-h"
            eyebrow="Peserta"
            title={
              <>
                Sudah terdaftar? <Drawn as="em" className="gs-keyline">Cek timmu</Drawn>
              </>
            }
            lead={`Cari nama atau timmu untuk memastikan akun ${EVENT.appName} setiap anggota sudah terhubung ke event.`}
          />
          <div className="ppeserta__side">
            {summary && (
              <ul className="ppeserta__stats" aria-label="Jumlah peserta terdaftar">
                {stats.map(([n, label]) => (
                  <li key={label}>
                    <strong>{num(n)}</strong>
                    <span>{label}</span>
                  </li>
                ))}
              </ul>
            )}
            <form className="ppeserta__form" action="/peserta/" method="get" role="search" aria-label="Cari status peserta">
              <div className="gs-search">
                <label className="gs-search__label" htmlFor="ppeserta-q">
                  Nama lengkap atau nama tim
                </label>
                <div className="gs-search__field">
                  <Icon name="search" size={20} className="gs-search__icon" />
                  <input id="ppeserta-q" name="q" type="search" autoComplete="off" enterKeyHint="search" maxLength={80} />
                </div>
              </div>
              <div className="ppeserta__actions">
                <button type="submit" className="gs-btn gs-btn--primary">
                  <span>Cek status</span>
                </button>
                <a className="gs-btn gs-btn--secondary" href="/peserta/">
                  <Icon name="team" size={18} />
                  <span>Lihat semua tim</span>
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
