// src/MapComponent.jsx
import React from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Tooltip,
} from "react-leaflet";

export default function MapComponent({
  gridData,
  selectedSpecies,
  onCellClick,
}) {
  const cells = gridData?.cells || [];

  // Used to scale the marker radius
  const maxIntensity =
    cells.length > 0 ? Math.max(...cells.map((c) => c.count)) : 1;

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      className="h-full w-full rounded-xl"
      minZoom={2}
      maxZoom={8}
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {cells.map((cell) => {
        const normalized = cell.count / maxIntensity;

        const color =
          cell.risk === "High"
            ? "#f97316" // orange
            : cell.risk === "Medium"
            ? "#22c55e" // green
            : "#38bdf8"; // blue

        return (
          <CircleMarker
            key={cell.id}
            center={[cell.lat, cell.lng]}
            radius={3 + normalized * 10}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: 0.3 + normalized * 0.5,
              weight: 0.5,
            }}
            eventHandlers={{
              click: () => onCellClick && onCellClick(cell),
            }}
          >
            <Tooltip>
              <div>
                <strong>{selectedSpecies?.commonName}</strong>
                <div>Observations: {cell.count}</div>
                <div>Bloom level: {cell.risk}</div>
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
