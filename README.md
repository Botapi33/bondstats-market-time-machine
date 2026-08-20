# BondStats Market Time Machine — Production v2

This is the upgraded production version of the existing Market Time Machine. The visual structure is intentionally preserved while the historical-data and chart layers are rebuilt.

## What changed

- Every historical moment is built with a long daily Treasury path instead of 4–5 hand-entered points.
- Every moment exposes 1D, 7D, 30D, 90D and 1Y horizons.
- The chart includes roughly six months of pre-event history and more than one year after the event.
- The information boundary is drawn inside the canvas, so the shaded future region is aligned precisely with the plotted data.
- The left side of the chart now contains substantial pre-event history and no longer looks clipped or unfinished.
- The original event cutoff remains visible after advancing the market.
- The selected horizon is visibly active and the exact reveal date is shown.
- The existing narrative, layout, sources drawer, market conditions, mobile rail and deep links are preserved.

## Data

At GitHub Pages build time the repository downloads official/public FRED series:

- DGS2 — 2-Year Treasury Constant Maturity Rate
- DGS10 — 10-Year Treasury Constant Maturity Rate
- VIXCLS — CBOE Volatility Index (where historically available)

The production `moments.json` is generated during the Pages build. No API key is required for these public FRED CSV graph endpoints.

## Deployment

Repository name can remain:

`bondstats-market-time-machine`

1. Replace the existing repository contents with this package.
2. Keep the default branch as `main`.
3. GitHub → Settings → Pages → Source: **GitHub Actions**.
4. Push/commit the files.
5. The deploy workflow builds the complete historical dataset, validates all five horizons for every moment, then deploys.

Expected URL:

`https://botapi33.github.io/bondstats-market-time-machine/`

## Safety against regressions

The build fails before deployment if:
- a moment has missing or unsorted time-series data,
- the cutoff index is invalid,
- an outcome points outside the chart series,
- any production-built moment lacks 1D / 7D / 30D / 90D / 1Y.

The existing UI is not replaced by a new design.
