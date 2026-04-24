// src/NewsPanel.jsx
import React from "react";

export default function NewsPanel({ items }) {
  if (!items || items.length === 0) {
    return (
      <div className="text-xs text-slate-400">
        No recent jellyfish bloom headlines available.
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto pr-1 text-xs">
      {items.map((item, idx) => (
        <a
          key={idx}
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="block border border-slate-800 rounded-lg p-2 hover:border-sky-500/60 hover:bg-slate-800/40 transition"
        >
          <div className="text-[10px] text-slate-400 flex justify-between">
            <span>{item.source || "Unknown source"}</span>
            <span>
              {item.publishedAt
                ? new Date(item.publishedAt).toLocaleDateString()
                : ""}
            </span>
          </div>

          <div className="mt-1 font-semibold text-slate-100">
            {item.title}
          </div>

          {item.description && (
            <div className="mt-1 text-slate-300 line-clamp-2">
              {item.description}
            </div>
          )}
        </a>
      ))}
    </div>
  );
}
