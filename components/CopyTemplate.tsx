"use client";

import { useState } from "react";
import { Icon } from "./ds";

const TEMPLATE = `Halo Help Desk GreenStride 2026,

Nama:
Unit:
Nama tim:
Email terdaftar:
Kendala:
Waktu kejadian:
Lampiran: tangkapan layar`;

export default function CopyTemplate() {
  const [state, setState] = useState<"idle" | "copied" | "manual">("idle");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(TEMPLATE);
      setState("copied");
      window.setTimeout(() => setState("idle"), 3500);
    } catch {
      setState("manual");
    }
  };

  return (
    <div className="copy-template">
      <button type="button" className="gs-btn gs-btn--on-band" onClick={copy}>
        <Icon name={state === "copied" ? "check" : "document"} size={18} />
        <span>{state === "copied" ? "Format tersalin" : "Salin format laporan"}</span>
      </button>
      <p className="copy-template__status" role="status">
        {state === "copied" && "Tempel di Help Desk, lalu lengkapi isinya."}
        {state === "manual" && "Salin manual dari kotak di bawah."}
      </p>
      {state === "manual" && (
        <textarea aria-label="Format laporan" readOnly rows={9} value={TEMPLATE} onFocus={(e) => e.currentTarget.select()} />
      )}
    </div>
  );
}
