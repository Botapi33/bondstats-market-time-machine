# BondStats Market Time Machine — Production v2.1 (recovery build)

This package is based on the previously working Market Time Machine and preserves its UI.

## Critical v2.1 fix

The prior v2 package contained a malformed trailing fragment in `js/app.js` after `function draw()`. That JavaScript syntax error prevented the entire application from booting, which is why the page showed the shell but no market moments, no snapshot data and an empty chart.

v2.1 removes that corruption and adds an automated JavaScript smoke test so the same failure cannot deploy again.

## Data improvements retained

At GitHub Pages build time, `scripts/build_historical_data.py` generates:
- a long daily pre-event and post-event Treasury path,
- U.S. 2Y and 10Y series,
- all five reveal horizons for every market moment: 1D, 7D, 30D, 90D and 1Y,
- VIX where historically available.

The original narratives, market-state labels, source drawer, layout, mobile rail and deep links remain intact.

## Deploy safely

Use the existing repository `bondstats-market-time-machine`.

1. Replace the repository contents with the files inside this package.
2. GitHub → Settings → Pages → Source: **GitHub Actions**.
3. Commit/push to `main`.
4. The workflow first builds the historical dataset, then validates it, then syntax-checks the application JavaScript.
5. Deployment happens only if all checks pass.

Do not use “Deploy from a branch” for this version, because the extended historical dataset is intentionally generated during the Pages workflow.

Expected URL:
`https://botapi33.github.io/bondstats-market-time-machine/`
