# CardPortfolio

[简体中文](README.zh-CN.md)

A lightweight React app for organizing a credit-card portfolio. Keep track of card openings, annual fees, product changes, issuer restrictions, and Chase 5/24 status in one private, browser-based workspace.

**Live site:** [shiweicao.github.io/credit-card-portfolio](https://shiweicao.github.io/credit-card-portfolio/)

## What it does

- Maintain a portfolio of active and closed personal or business cards.
- Track annual fees, custom fee-renewal dates, upcoming renewals, and yearly totals.
- Record product changes, upgrades, and downgrades while preserving the original account timeline.
- Review visual account timelines and a chronological product-change log.
- View Chase 5/24 eligibility and other issuer-oriented card-age signals.
- Search, filter, and sort cards by opening date, annual fee, next fee due date, or bank.
- Import and export portfolio data as a local JSON file.
- Create manual cloud backups in a private GitHub Gist and restore them on another browser.

## Data and privacy

Portfolio data is stored locally in your browser under the `credit_card_tracker_portfolio_v1` localStorage key. Nothing is sent to a server by the app itself.

The optional Cloud Sync feature uses your GitHub personal access token to create or update a private Gist named `credit_card_portfolio.json`. The token and Gist ID are stored only in that browser's localStorage. Use a classic token with the `gist` scope, or a fine-grained token with Gists read/write permission.

## Development

### Prerequisites

- Node.js 18 or later
- npm

### Install and run

```bash
git clone https://github.com/ShiweiCao/credit-card-portfolio.git
cd credit-card-portfolio
npm install
npm run dev
```

Vite starts a local server at `http://localhost:3000/credit-card-portfolio/`.

### Available commands

```bash
# Run the development server
npm run dev

# Type-check the project
npm run lint

# Create a production build in dist/
npm run build

# Preview the production build locally
npm run preview

# Remove generated build output
npm run clean
```

## Tech stack

- React + TypeScript
- Vite
- Tailwind CSS
- Lucide icons
