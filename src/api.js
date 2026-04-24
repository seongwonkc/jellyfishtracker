// src/api.js

// -----------------------------------------------------
// Jellyfish species configuration
// -----------------------------------------------------
export const SPECIES = [
  {
    id: "moon",
    scientificName: "Aurelia aurita",
    commonName: "Moon Jellyfish",
    regionHint: "Global coastal waters",
  },
  {
    id: "nomurai",
    scientificName: "Nemopilema nomurai",
    commonName: "Nomura's Jellyfish",
    regionHint: "East Asia (China/Japan/Korea)",
  },
  {
    id: "mauve",
    scientificName: "Pelagia noctiluca",
    commonName: "Mauve Stinger",
    regionHint: "Mediterranean Sea",
  },
];

// -----------------------------------------------------
// GBIF occurrence API (via CORS proxy)
// -----------------------------------------------------
const GBIF_URL = "https://api.gbif.org/v1/occurrence/search";
const CORS_PROXY = "https://corsproxy.io/?";
const YEAR_RANGE = 5;
const PAGE_LIMIT = 300;
const MAX_PER_SPECIES = 2500;

function buildQuery(scientificName, offset) {
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - YEAR_RANGE;

  const params = new URLSearchParams({
    scientificName,
    hasCoordinate: "true",
    year: `${minYear},${currentYear}`,
    limit: PAGE_LIMIT,
    offset,
  });

  return `${GBIF_URL}?${params.toString()}`;
}

export async function fetchOccurrencesForSpecies(scientificName) {
  let all = [];
  let offset = 0;

  while (all.length < MAX_PER_SPECIES) {
    const rawUrl = buildQuery(scientificName, offset);
    const res = await fetch(CORS_PROXY + encodeURIComponent(rawUrl));

    if (!res.ok) throw new Error("GBIF fetch failed: " + res.status);

    const data = await res.json();
    const results = data.results || [];

    const cleaned = results
      .filter(
        (r) =>
          typeof r.decimalLatitude === "number" &&
          typeof r.decimalLongitude === "number"
      )
      .map((r) => ({
        lat: r.decimalLatitude,
        lng: r.decimalLongitude,
        year: r.year,
        country: r.country,
        stateProvince: r.stateProvince,
      }));

    all = all.concat(cleaned);
    if (data.endOfRecords) break;
    offset += PAGE_LIMIT;
  }

  return all.slice(0, MAX_PER_SPECIES);
}

export async function fetchAllSpeciesOccurrences() {
  const pairs = await Promise.all(
    SPECIES.map(async (sp) => {
      return [sp.id, await fetchOccurrencesForSpecies(sp.scientificName)];
    })
  );
  return Object.fromEntries(pairs);
}

// -----------------------------------------------------
// Convert raw points → grid with intensity
// -----------------------------------------------------
export function computeGridCells(
  occurrences,
  cellSizeDeg = 1,
  thresholds = { high: 40, medium: 15 }
) {
  const grid = new Map();

  occurrences.forEach((o) => {
    const latIdx = Math.floor(o.lat / cellSizeDeg);
    const lngIdx = Math.floor(o.lng / cellSizeDeg);
    const key = `${latIdx}_${lngIdx}`;

    const cell = grid.get(key) || {
      latIdx,
      lngIdx,
      count: 0,
      samples: [],
    };

    cell.count += 1;
    cell.samples.push(o);
    grid.set(key, cell);
  });

  let high = 0,
    med = 0,
    low = 0;

  const cells = [];

  for (const [key, cell] of grid.entries()) {
    let risk = "Low";
    if (cell.count >= thresholds.high) {
      risk = "High";
      high++;
    } else if (cell.count >= thresholds.medium) {
      risk = "Medium";
      med++;
    } else {
      low++;
    }

    cells.push({
      id: key,
      lat: (cell.latIdx + 0.5) * cellSizeDeg,
      lng: (cell.lngIdx + 0.5) * cellSizeDeg,
      count: cell.count,
      risk,
      samples: cell.samples,
    });
  }

  return {
    cells,
    summary: {
      totalRecords: occurrences.length,
      cellCount: cells.length,
      highCount: high,
      medCount: med,
      lowCount: low,
    },
  };
}

// -----------------------------------------------------
// Jellyfish → fertilizer model
// -----------------------------------------------------
export function estimateFertilizerYield(recordCount) {
  const avgWetMass = 2; // kg per record
  const totalWet = recordCount * avgWetMass;

  const dry = totalWet * 0.05;
  const nitrogen = dry * 0.1;
  const usableFertilizer = dry * 0.6;
  const soilArea = usableFertilizer / 0.002;

  return {
    totalWetMassKg: totalWet,
    dryMassKg: dry,
    nitrogenKg: nitrogen,
    fertilizerKg: usableFertilizer,
    soilAreaM2: soilArea,
  };
}

// -----------------------------------------------------
// News API (NewsAPI.org)
// -----------------------------------------------------
const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;

export async function fetchJellyNews() {
  if (!NEWS_API_KEY) {
    console.warn("Missing VITE_NEWS_API_KEY — returning empty news list.");
    return [];
  }

  const url = new URL("https://newsapi.org/v2/everything");
  url.searchParams.set(
    "q",
    "jellyfish bloom OR jellyfish invasion OR jellyfish swarm"
  );
  url.searchParams.set("language", "en");
  url.searchParams.set("sortBy", "publishedAt");
  url.searchParams.set("pageSize", "10");

  const res = await fetch(url.toString(), {
    headers: { "X-Api-Key": NEWS_API_KEY },
  });

  if (!res.ok) throw new Error("News API failed: " + res.status);

  const data = await res.json();
  return (data.articles || []).map((a) => ({
    title: a.title,
    description: a.description,
    url: a.url,
    source: a.source?.name,
    publishedAt: a.publishedAt,
  }));
}
