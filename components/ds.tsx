/* eslint-disable @next/next/no-img-element */
/**
 * Komponen presentasi GreenStride 2026, port dari design-system/project/components.
 * Kelas gs-* ada di app/ds.css.
 */
import type { ReactNode } from "react";
import ICONS from "@/design-system/icon-paths.json";

export type IconName = keyof typeof ICONS;

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

export function Icon({ name, size = 20, strokeWidth = 2, className, label }: { name: IconName | string; size?: number; strokeWidth?: number; className?: string; label?: string }) {
  const body = (ICONS as Record<string, string>)[name];
  if (!body) return null;
  return (
    <svg
      className={cx("gs-icon", className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
}

type ButtonProps = {
  variant?: "primary" | "secondary" | "ghost" | "lime" | "on-band";
  size?: "sm" | "md" | "lg";
  icon?: IconName;
  arrow?: boolean;
  href: string;
  external?: boolean;
  download?: boolean;
  className?: string;
  children: ReactNode;
};

export function Button({ variant = "primary", size = "md", icon, arrow, href, external, download, className, children }: ButtonProps) {
  return (
    <a
      className={cx("gs-btn", `gs-btn--${variant}`, size !== "md" && `gs-btn--${size}`, className)}
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      download={download || undefined}
    >
      {icon && <Icon name={icon} size={18} />}
      <span>{children}</span>
      {arrow && <Icon name="arrow-right" size={18} className="gs-btn__arrow" />}
    </a>
  );
}

export function SectionHeader({ eyebrow, title, lead, align, id }: { eyebrow?: string; title: ReactNode; lead?: ReactNode; align?: "center"; id?: string }) {
  return (
    <div className={cx("gs-section-head", align === "center" && "gs-section-head--center")}>
      {eyebrow && <span className="gs-eyebrow">{eyebrow}</span>}
      <h2 id={id}>{title}</h2>
      {lead && <p>{lead}</p>}
    </div>
  );
}

export function Pillar({ icon, children }: { icon: IconName; children: ReactNode }) {
  return (
    <span className="gs-pillar">
      <span className="gs-pillar__disc">
        <Icon name={icon} size={22} />
      </span>
      <span>{children}</span>
    </span>
  );
}

export function FactTile({ icon, value, unit, label, note }: { icon: IconName; value: ReactNode; unit?: string; label: string; note?: string }) {
  return (
    <div className="gs-fact">
      <span className="gs-fact__icon">
        <Icon name={icon} size={22} />
      </span>
      <span className="gs-fact__value">
        {value}
        {unit && <small>{unit}</small>}
      </span>
      <span className="gs-fact__label">{label}</span>
      {note && <span className="gs-fact__note">{note}</span>}
    </div>
  );
}

export function RewardCard({ icon = "medal", who, title, feature, children }: { icon?: IconName; who: string; title: string; feature?: boolean; children?: ReactNode }) {
  return (
    <article className={cx("gs-reward", feature && "gs-reward--feature")}>
      <span className="gs-reward__icon">
        <Icon name={icon} size={24} />
      </span>
      <span className="gs-reward__who">{who}</span>
      <h3 className="gs-reward__title">{title}</h3>
      {children && <p className="gs-reward__body">{children}</p>}
    </article>
  );
}

const CALLOUT_ICON = { attention: "alert", info: "info", rule: "ban" } as const;

export function Callout({ tone = "attention", title, children }: { tone?: "attention" | "info" | "rule"; title?: string; children: ReactNode }) {
  return (
    <div className={cx("gs-callout", `gs-callout--${tone}`)}>
      <Icon name={CALLOUT_ICON[tone]} size={20} className="gs-callout__icon" />
      <div>
        {title && <strong className="gs-callout__title">{title}</strong>}
        {children}
      </div>
    </div>
  );
}

export function DocumentCard({ title, description, href, size, note }: { title: string; description: string; href: string; size: string; note?: string }) {
  return (
    <a className="gs-doc" href={href} download>
      <span className="gs-doc__icon">
        <Icon name="document" size={26} />
        <span className="gs-doc__type">PDF</span>
      </span>
      <span>
        <h3 className="gs-doc__title">{title}</h3>
        <p className="gs-doc__desc">{description}</p>
        <span className="gs-doc__meta">
          {size}
          {note && <span className="gs-doc__note">{note}</span>}
        </span>
      </span>
      <span className="gs-doc__go" aria-hidden="true">
        <Icon name="download" size={20} />
      </span>
    </a>
  );
}

export function AppCard({ name, role, icon, appStore, playStore }: { name: string; role: string; icon: string; appStore: string; playStore: string }) {
  return (
    <div className="gs-app">
      <img className="gs-app__icon" src={icon} alt="" width={64} height={64} loading="lazy" />
      <div>
        <h3 className="gs-app__name">{name}</h3>
        <p className="gs-app__role">{role}</p>
      </div>
      <div className="gs-app__stores">
        <a className="gs-store" href={appStore} target="_blank" rel="noopener noreferrer">
          <img src="/img/badge-app-store.png" alt={`Unduh ${name} di App Store`} width={148} height={44} loading="lazy" />
        </a>
        <a className="gs-store" href={playStore} target="_blank" rel="noopener noreferrer">
          <img src="/img/badge-google-play.png" alt={`Unduh ${name} di Google Play`} width={131} height={44} loading="lazy" />
        </a>
      </div>
    </div>
  );
}

/**
 * Ilustrasi penghargaan bergaya set ikon (garis 2 px, ujung bulat, isian lime dan leaf-soft).
 * Gambar ini ilustrasi, bukan foto medali atau jersey resmi; ganti dengan foto panitia bila tersedia.
 */
export function Illustration({ name, size = 88 }: { name: "medal" | "jersey" | "trophy"; size?: number }) {
  return (
    <svg className="gs-illo" width={size} height={size} viewBox="0 0 96 96" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {name === "medal" && (
        <>
          <path className="gs-illo__soft" d="M28 6h14l12 30H40z" />
          <path className="gs-illo__soft" d="M68 6H54L42 36h14z" />
          <circle className="gs-illo__fill" cx="48" cy="62" r="24" />
          <circle cx="48" cy="62" r="16" />
          <path d="M40 63l6 6 11-13" />
        </>
      )}
      {name === "jersey" && (
        <>
          <path className="gs-illo__soft" d="M35 12 22 17 8 31l10 11 8-6v48h44V36l8 6 10-11-14-14-13-5c-2 6-7 10-13 10s-11-4-13-10z" />
          <path className="gs-illo__fill" stroke="none" d="M27 66 69 46v12L27 78z" />
          <path d="M26 36v48h44V36" />
        </>
      )}
      {name === "trophy" && (
        <>
          <path d="M30 22H19v6c0 8 5 13 12 13M66 22h11v6c0 8-5 13-12 13" />
          <path className="gs-illo__fill" d="M30 12h36v22c0 11-8 20-18 20s-18-9-18-20z" />
          <path d="M44 54v10h8V54" />
          <rect className="gs-illo__soft" x="32" y="64" width="32" height="9" rx="2" />
          <rect className="gs-illo__soft" x="26" y="73" width="44" height="11" rx="2" />
        </>
      )}
    </svg>
  );
}

/**
 * Grafik kecil untuk aturan harian. limit: rambu batas (lingkaran danger, angka di tengah), karena 24 km adalah batas, bukan target.
 * submit: dua token unggah. deadline: jam dengan jarum di 23.59. Hiasan; teks di sebelahnya yang membawa informasi.
 */
export function RuleGraphic({ name, value }: { name: "limit" | "submit" | "deadline"; value?: number }) {
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI) / 6;
    return { x1: 32 + 22 * Math.sin(a), y1: 32 - 22 * Math.cos(a), x2: 32 + 26 * Math.sin(a), y2: 32 - 26 * Math.cos(a) };
  });
  return (
    <svg className={cx("gs-rulegfx", `gs-rulegfx--${name}`)} width={64} height={64} viewBox="0 0 64 64" aria-hidden="true">
      {name === "limit" && (
        <>
          <circle className="gs-rulegfx__sign" cx="32" cy="32" r="27" />
          <text x="32" y="33">
            {value}
          </text>
        </>
      )}
      {name === "submit" && (
        <>
          <circle className="gs-rulegfx__token gs-rulegfx__token--a" cx="24" cy="38" r="18" />
          <path className="gs-rulegfx__arrow" d="M24 46V30m-6 6 6-6 6 6" />
          <circle className="gs-rulegfx__token gs-rulegfx__token--b" cx="41" cy="26" r="18" />
          <path className="gs-rulegfx__arrow gs-rulegfx__arrow--b" d="M41 34V18m-6 6 6-6 6 6" />
        </>
      )}
      {name === "deadline" && (
        <>
          <circle className="gs-rulegfx__face" cx="32" cy="32" r="28" />
          {ticks.map((t, i) => (
            <line key={i} className={i === 0 ? "gs-rulegfx__tick gs-rulegfx__tick--12" : "gs-rulegfx__tick"} {...t} />
          ))}
          <line className="gs-rulegfx__hand" x1="32" y1="32" x2="31.9" y2="18" />
          <line className="gs-rulegfx__hand gs-rulegfx__hand--min" x1="32" y1="32" x2="29.7" y2="10.4" />
          <circle className="gs-rulegfx__pin" cx="32" cy="32" r="3.5" />
        </>
      )}
    </svg>
  );
}
