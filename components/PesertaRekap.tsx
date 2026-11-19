"use client";

import { Icon } from "./ds";
import { num, type EntitySummary } from "@/lib/peserta-shared";

/**
 * Rekap per entitas di /peserta/. Setiap baris adalah tautan yang memfilter daftar tim ke entitas itu:
 * dengan JavaScript lewat event "peserta:filter" (tanpa memuat ulang), tanpa JavaScript lewat ?entitas=.
 */
export default function PesertaRekap({ entities }: { entities: EntitySummary[] }) {
  return (
    <ol className="prekap">
      {entities.map((e) => {
        const pct = e.people ? Math.round((e.ok / e.people) * 100) : 0;
        return (
          <li key={e.name}>
            <a
              href={`?entitas=${encodeURIComponent(e.short)}#cari`}
              onClick={(ev) => {
                if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button !== 0) return;
                ev.preventDefault();
                window.dispatchEvent(new CustomEvent("peserta:filter", { detail: { entity: e.name } }));
                document.getElementById("cari")?.scrollIntoView({ block: "start" });
              }}
            >
              <span className="prekap__name">
                <strong>{e.short}</strong>
              </span>
              <span className="prekap__nums">
                {num(e.teams)} tim · {num(e.people)} orang
              </span>
              <span className="prekap__bar" role="img" aria-label={`${num(e.ok)} dari ${num(e.people)} terhubung, ${pct}%`}>
                <span style={{ width: `${pct}%` }} />
              </span>
              <span className="prekap__pct">
                {pct}%<small>terhubung</small>
              </span>
              <Icon name="arrow-right" size={18} className="prekap__go" />
            </a>
          </li>
        );
      })}
    </ol>
  );
}
