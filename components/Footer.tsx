/* eslint-disable @next/next/no-img-element */
import { Icon } from "@/components/ds";
import { VisitCount } from "@/components/interactive";
import { EVENT, SOCIALS } from "@/lib/event";

const LINKS = [
  { href: "#tentang", label: "Tentang" },
  { href: "#panduan", label: "Panduan" },
  { href: "/peserta/", label: "Status peserta" },
  { href: "#jadwal", label: "Jadwal" },
  { href: "#hadiah", label: "Hadiah" },
  { href: "#faq", label: "FAQ" },
  { href: "#unduhan", label: "Unduhan" },
];

/** Footer semua halaman. Di luar halaman utama, tautan bagian diawali "/" agar kembali ke halaman utama. */
export default function Footer({ home = true }: { home?: boolean }) {
  return (
    <footer className="footer gs-on-band">
      <div className="wrap">
        <div className="footer__inner">
          <div>
            <img
              className="footer__brand"
              src="/img/logo-greenstride-white-320.webp"
              srcSet="/img/logo-greenstride-white-320.webp 320w, /img/logo-greenstride-white-608.webp 608w"
              sizes="200px"
              alt="PTPN GreenStride 2026"
              width={608}
              height={206}
              loading="lazy"
            />
            <p className="footer__line">Every step counts. Every stride matters.</p>
            <div className="footer__logos">
              <img className="footer__logo-brand" src="/img/logo-planters-club-horizontal.png" alt="Planters Club" width={157} height={56} loading="lazy" />
              <span className="footer__logo-parents">
                <img src="/img/logo-danantara.png" alt="Danantara Indonesia" width={99} height={26} loading="lazy" />
                <img src="/img/logo-ptpn-holding.png" alt="Perkebunan Nusantara" width={75} height={36} loading="lazy" />
                <img src="/img/logo-lifeatptpn.png" alt="Life at PTPN" width={101} height={75} loading="lazy" />
              </span>
            </div>
          </div>
          <div className="footer__aside">
            <nav className="footer__nav" aria-label="Footer">
              <h3>Jelajahi Halaman</h3>
              {LINKS.map((l) => (
                <a key={l.href} href={l.href.startsWith("#") && !home ? `/${l.href}` : l.href}>
                  {l.label}
                </a>
              ))}
              <a href={EVENT.helpdeskUrl} target="_blank" rel="noopener noreferrer">
                Help Desk
              </a>
            </nav>
            <VisitCount />
          </div>
        </div>
        <section className="footer__social" aria-labelledby="footer-ig">
          <div className="footer__social-head">
            <h3 id="footer-ig">Ikuti di Instagram</h3>
            <p>Kabar terbaru dari PTPN dan Planters Club.</p>
          </div>
          <ul>
            {SOCIALS.map((s) => (
              <li key={s.handle}>
                <a href={s.href} target="_blank" rel="noopener noreferrer">
                  <span className="footer__social-disc">
                    <Icon name="instagram" size={20} />
                  </span>
                  <span className="footer__social-text">
                    <strong>@{s.handle}</strong>
                    <small>{s.name}</small>
                  </span>
                  <Icon name="arrow-right" size={18} className="footer__social-go" />
                </a>
              </li>
            ))}
          </ul>
        </section>
        <div className="footer__legal">
          <span>© 2026 Planters Club · PTPN Group</span>
          <span>{EVENT.tagline}</span>
        </div>
      </div>
    </footer>
  );
}
