// src/FertilizerCalculator.jsx
import React from "react";
import BiomassCard from "./components/BiomassCard";

export default function FertilizerCalculator({ stats }) {
  if (!stats) return null;

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
      <h2 className="text-sm font-semibold mb-2">
        Jellyfish → Fertilizer Conversion Model
      </h2>

      <p className="text-xs text-slate-400 mb-4">
        Approximate conversion from observed jellyfish biomass to fertilizer and
        soil impact.
      </p>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <BiomassCard
          label="Total Wet Biomass (kg)"
          value={stats.totalWetMassKg.toFixed(1)}
        />
        <BiomassCard
          label="Dry Biomass (kg)"
          value={stats.dryMassKg.toFixed(1)}
        />
        <BiomassCard
          label="Nitrogen Content (kg)"
          value={stats.nitrogenKg.toFixed(2)}
        />
        <BiomassCard
          label="Fertilizer Produced (kg)"
          value={stats.fertilizerKg.toFixed(1)}
        />
      </div>

      <div className="mt-4 p-3 bg-slate-800/40 rounded-lg text-xs">
        <strong className="text-slate-200">Soil Impact:</strong>
        <p className="mt-1 text-slate-300">
          This biomass could enrich approximately{" "}
          <span className="font-semibold">
            {(stats.soilAreaM2 / 10000).toFixed(2)}
          </span>{" "}
          hectares of soil.
        </p>
      </div>
    </div>
  );
}
