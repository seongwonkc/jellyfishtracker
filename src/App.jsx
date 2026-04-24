// src/App.jsx

import React, { useEffect, useMemo, useState } from "react";
import MapComponent from "./MapComponent";
import FertilizerCalculator from "./FertilizerCalculator";
import BiomassCard from "./components/BiomassCard";
import NewsPanel from "/src/NewsPanel.jsx";
;

import {
  SPECIES,
  fetchAllSpeciesOccurrences,
  computeGridCells,
  estimateFertilizerYield,
  fetchJellyNews,
} from "./api";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  Legend,
} from "recharts";

const THRESHOLDS = { high: 40, medium: 15 };

function formatChart(summary) {
  if (!summary) return [];
  return [
    { name: "High", value: summary.highCount },
    { name: "Medium", value: summary.medCount },
    { name: "Low", value: summary.lowCount },
  ];
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [speciesData, setSpeciesData] = useState({});
  const [selectedSpeciesId, setSelectedSpeciesId] = useState("nomurai");
  const [selectedCell, setSelectedCell] = useState(null);
  const [error, setError] = useState(null);

  const [news, setNews] = useState([]);
  const [newsError, setNewsError] = useState(null);

  // Load GBIF data
  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAllSpeciesOccurrences();
        setSpeciesData(data);
      } catch (e) {
        console.error(e);
        setError("Failed to fetch jellyfish occurrence data.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Load news
  useEffect(() => {
    async function load() {
      try {
        const items = await fetchJellyNews();
        setNews(items);
      } catch (e) {
        console.error(e);
        setNewsError("Failed to load news articles.");
      }
    }
    load();
  }, []);

  const selectedSpecies = SPECIES.find((s) => s.id === selectedSpeciesId);

  const gridData = useMemo(() => {
    const list = speciesData[selectedSpeciesId] || [];
    return computeGridCells(list, 1, THRESHOLDS);
  }, [speciesData, selectedSpeciesId]);

  const fertilizerStats = useMemo(() => {
    const count = gridData?.summary.totalRecords || 0;
    return estimateFertilizerYield(count);
  }, [gridData]);

  const chartData = useMemo(
    () => formatChart(gridData?.summary),
    [gridData]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* HEADER */}
      <header className="border-b border-slate-800 p-4">
        <h1 className="text-xl font-semibold">
          JellyFertilizer Dashboard — Global Jellyfish Bloom Monitor
        </h1>
        <p className="text-sm text-slate-400">
          Tracks bloom intensity and estimates fertilizer potential.
        </p>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-[2fr_1.3fr] gap-4 p-6 flex-1">
        {/* LEFT SIDE — SPECIES SELECTOR + MAP */}
        <section className="flex flex-col gap-4">

          {/* SPECIES SELECT */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <h2 className="text-sm mb-3 font-semibold">Select Jellyfish Species</h2>

            <div className="flex flex-wrap gap-2 mb-4">
              {SPECIES.map((sp) => (
                <button
                  key={sp.id}
                  onClick={() => {
                    setSelectedSpeciesId(sp.id);
                    setSelectedCell(null);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs border ${
                    selectedSpeciesId === sp.id
                      ? "bg-white text-black border-white"
                      : "bg-slate-900 text-slate-300 border-slate-600 hover:border-slate-400"
                  }`}
                >
                  {sp.commonName}
                </button>
              ))}
            </div>

            {/* SPECIES INFO CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <BiomassCard label="Scientific Name" value={selectedSpecies.scientificName} />
              <BiomassCard label="Hotspot" value={selectedSpecies.regionHint} />
              <BiomassCard label="Records (5y)" value={gridData?.summary.totalRecords} />
              <BiomassCard label="High Bloom Cells" value={gridData?.summary.highCount} />
            </div>
          </div>

          {/* MAP */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl min-h-[450px] p-1">
            {loading ? (
              <div className="flex items-center justify-center h-full text-slate-400">
                Loading GBIF data...
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full text-red-400">
                {error}
              </div>
            ) : (
              <MapComponent
                gridData={gridData}
                selectedSpecies={selectedSpecies}
                onCellClick={setSelectedCell}
              />
            )}
          </div>
        </section>

        {/* RIGHT SIDE — ANALYTICS + NEWS */}
        <section className="flex flex-col gap-4">

          {/* BLOOM INTENSITY CHART */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <h2 className="text-sm mb-2 font-semibold">Bloom Intensity Index</h2>

            <div className="h-44">
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <ReTooltip
                    contentStyle={{
                      background: "#020617",
                      border: "1px solid #1e293b",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="value" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* SELECTED CELL DETAILS */}
            {selectedCell && (
              <div className="mt-3 text-xs border-t border-slate-700 pt-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Selected Cell</span>
                  <span className="px-2 py-0.5 text-[10px] rounded-full border border-slate-600">
                    {selectedCell.risk}
                  </span>
                </div>
                <div className="mt-1">
                  Observations: <span className="font-semibold">{selectedCell.count}</span>
                </div>
              </div>
            )}
          </div>

          {/* FERTILIZER PANEL */}
          <FertilizerCalculator stats={fertilizerStats} />

          {/* NEWS PANEL */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <h2 className="text-sm font-semibold mb-2">Recent Jellyfish Bloom Reports</h2>
            <p className="text-xs text-slate-400 mb-2">
              Headlines mentioning jellyfish blooms, invasions, or coastal impacts.
            </p>

            {newsError ? (
              <div className="text-xs text-red-400">{newsError}</div>
            ) : (
              <NewsPanel items={news} />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
