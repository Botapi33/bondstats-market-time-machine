# Market Time Machine

A mobile-first historical fixed-income research interface designed for static hosting on GitHub Pages and embedding in Google Sites.

## Principles
- Information cutoff: future observations stay hidden until the user advances the market.
- No AI forecasts or opaque scores.
- Historical data is stored locally and source-linked.
- Data validation runs before deployment.
- Mobile is the reference layout, not a reduced desktop view.

## Local preview
Because the app loads JSON via `fetch`, serve the directory over HTTP:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Add a historical moment
1. Add a new object to `data/moments.json`.
2. Add any new source metadata to `data/sources.json`.
3. Run `python scripts/validate_data.py`.
4. Commit and push. GitHub Actions validates before Pages deployment.

## Google Sites
After GitHub Pages is enabled for the repository, use **Insert → Embed → URL** and paste the GitHub Pages URL. For the strongest mobile experience, use a full-page embed if possible.

## Data note
The included Treasury observations are curated from Federal Reserve/FRED H.15 constant-maturity series. The VIX observation in the Lehman scenario is from the CBOE series distributed through FRED. Editorial context is intentionally concise and should be reviewed when new moments are added.
