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

export function DocumentCard({ title, description, href, size }: { title: string; description: string; href: string; size: string }) {
  return (
    <a className="gs-doc" href={href} download>
      <span className="gs-doc__icon">
        <Icon name="document" size={26} />
        <span className="gs-doc__type">PDF</span>
      </span>
      <span>
        <h3 className="gs-doc__title">{title}</h3>
        <p className="gs-doc__desc">{description}</p>
        <span className="gs-doc__meta">{size}</span>
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
