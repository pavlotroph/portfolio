# Portfolio Utilities

This repository contains a React-based site along with a few utility scripts.

## Blank Page Detector

`scripts/detect-blank-pages.js` can crawl a website and report pages that appear to contain no visible text.

### Usage

```bash
node scripts/detect-blank-pages.js --base https://example.com --depth 2 --out report.csv
```

**Options**

- `--base` – Root URL to crawl (required).
- `--depth` – How many link levels to follow (default: 0).
- `--out` – Output file path for the CSV report (default: `report.csv`).
- `--threshold` – Minimum number of visible characters required to consider a page non-blank (default: 10).

The resulting CSV lists each visited URL with a boolean `blank` flag, the length of visible text and the HTTP status.
