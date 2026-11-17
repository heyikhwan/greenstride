// GreenStride 2026: tipe komponen (dokumentasi).
import type { ReactNode } from "react";

export type IconName = "alert" | "arrow-right" | "calendar" | "check" | "chevron-down" | "clock" | "close" | "info" | "ban" | "document" | "download" | "flag" | "gps" | "heart-pulse" | "lifebuoy" | "medal" | "moon" | "phone" | "route" | "run" | "search" | "shield-check" | "sun" | "team" | "trophy" | "upload";

export interface IconProps { name: IconName; size?: number; strokeWidth?: number; label?: string; className?: string }
export interface ButtonProps { variant?: "primary" | "secondary" | "ghost" | "lime" | "on-band"; size?: "sm" | "md" | "lg"; icon?: IconName; arrow?: boolean; href?: string; external?: boolean; type?: "button" | "submit"; disabled?: boolean; onClick?: () => void; className?: string; children: ReactNode }
export interface SectionHeaderProps { eyebrow?: string; title: ReactNode; lead?: ReactNode; align?: "start" | "center"; as?: "h1" | "h2" | "h3" }
export interface PillarProps { icon: IconName; children: ReactNode }
export interface FactTileProps { icon: IconName; value: string | number; unit?: string; label: string; note?: string }
export interface CountdownProps { start: string; end: string; days?: number; rangeLabel?: string; rangeNote?: string; endLabel?: string; idleLabel?: string; now?: number }
export interface KmSplitterProps { target?: number; days?: number; dailyMax?: number; memberMin?: number; options?: number[]; question?: string }
export interface TeamBarProps { target?: number; memberMin?: number; max?: number; members?: number }
export interface RouteProps { className?: string; style?: Record<string, string | number> }
export interface ActivityCheckProps { id?: string; wide?: boolean; title?: string; paceFast?: string; paceSlow?: string; dailyMax?: number }
export interface RaceCalendarProps { start: string; end: string; days?: number; target?: number; now?: number }
export interface TeamRouteProps { target?: number; memberMin?: number; note?: boolean }
export interface RuleGraphicProps { name: "limit" | "submit" | "deadline"; value?: number }
export interface IllustrationProps { name: "medal" | "jersey" | "trophy"; size?: number }
export interface RewardStep { illustration: "medal" | "jersey" | "trophy"; who: string; title: string; body?: string }
export interface RewardLadderProps { steps: RewardStep[]; side?: { icon?: IconName; who: string; title: string; body?: string } }
export interface ScheduleItemProps { date: string; title: string; status?: "done" | "now" | "next" | "tba"; chip?: { pre?: string; day?: string; month?: string }; children?: ReactNode }
export interface RewardCardProps { icon?: IconName; who: string; title: string; feature?: boolean; children?: ReactNode }
export interface AppStep { title: string; body: string; image: string; alt: string }
export interface AppStepsProps { steps: AppStep[]; label?: string }
export interface AppCardProps { name: string; role: string; icon: string; appStore?: string; playStore?: string; appStoreBadge: string; playStoreBadge: string }
export interface ChipProps { icon?: IconName; count?: number; pressed?: boolean; quiet?: boolean; onClick?: () => void; children: ReactNode }
export interface SearchFieldProps { id?: string; label?: string; placeholder?: string; value: string; onChange: (value: string) => void }
export interface FaqItemProps { id?: string; question: ReactNode; defaultOpen?: boolean; open?: boolean; onToggle?: (open: boolean) => void; children: ReactNode }
export interface CalloutProps { tone?: "attention" | "info" | "rule"; title?: string; icon?: IconName; children: ReactNode }
export interface DocumentCardProps { title: string; description: string; href: string; size?: string; note?: string; type?: string; download?: string | boolean }
export interface NavLink { href: string; label: string; current?: boolean }
export interface NavbarProps { logos: { src: string; alt: string }[]; links: NavLink[]; cta?: { href: string; label: string; external?: boolean }; homeHref?: string; homeLabel?: string; theme?: boolean }
