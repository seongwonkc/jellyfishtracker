# JellyWatch

A student-built static website for tracking jellyfish blooms around Korea,
China, and Japan. It combines a public-data map, Netlify forms, a research
story, and a CoastCare kit concept.

## Pages

- `index.html` - project homepage and preview map
- `map.html` - live bloom map powered by GBIF occurrence records
- `submit.html` - Netlify sighting report form
- `kit.html` - CoastCare kit request form
- `research.html` - project research and further reading
- `about.html` - student/founder story

## Run Locally

This is a static site. From this folder, run a simple local server:

```bash
python -m http.server 4174
```

Then open:

```text
http://localhost:4174/
```

## Data Behavior

The map pages request recent coordinate-backed records from the GBIF occurrence
API. If GBIF is unavailable or a request times out, the map falls back to a
small demo dataset so the project can still be presented.

The homepage includes a one-year evidence section. It compares GBIF records for
the last two complete years, reports the current season to date, and includes a
short project log showing how the student project improved from static research
to a live map and reporting workflow.

## Forms

The sighting and kit forms are configured for Netlify Forms. In local preview
they show the confirmation state without posting data. On Netlify, they submit
to the deployed site root using `FormData`.

## Notes

This is a student prototype, not an official monitoring platform. Public
occurrence records can be sparse, biased toward well-sampled locations, and
delayed relative to real bloom events.
