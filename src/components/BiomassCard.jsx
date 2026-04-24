// src/components/BiomassCard.jsx
import React from "react";

export default function BiomassCard({ label, value }) {
  return (
    <div className="bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="text-xs font-semibold text-slate-100 truncate">
        {value ?? "—"}
      </div>
    </div>
  );
}
