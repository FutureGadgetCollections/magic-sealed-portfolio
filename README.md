# Investment Portfolio Tracker

A Jekyll-based static site for tracking investment portfolios. Manages holdings via CSV files, calculates Internal Rate of Return (IRR) client-side, and deploys free on GitHub Pages.

## Features

- **CSV-based data management** - Edit holdings, transactions, and sales in simple CSV files
- **Portfolio dashboard** - Total value, cost basis, gain/loss at a glance
- **Realized vs unrealized gains** - Track completed sales separately from current holdings
- **IRR calculation** - Client-side Internal Rate of Return using Newton-Raphson method
- **Filterable holdings table** - Search and filter by category
- **Sortable columns** - Click headers to sort by any field
- **Category breakdown** - Visual breakdown of portfolio allocation
- **Responsive design** - Works on desktop and mobile
- **GitHub Pages compatible** - No custom plugins required

## Requirements

- Ruby 2.7+ (Ruby 3.x recommended)
- Bundler gem (`gem install bundler`)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/FutureGadgetTemplates/Portfolio1.git
   cd Portfolio1
   ```

2. Install dependencies:
   ```bash
   bundle install
   ```

## Local Development

Start the Jekyll development server:

```bash
bundle exec jekyll serve
```

Open http://127.0.0.1:4000 in your browser.

The server watches for file changes and automatically rebuilds. Press `Ctrl+C` to stop.

## Configuration

Edit `_config.yml` to customize:

```yaml
title: Investment Portfolio          # Site title
description: Track your investments  # Meta description
baseurl: ""                          # Set if hosting in subdirectory (e.g., /portfolio)
url: ""                              # Your domain (e.g., https://example.com)
```

## Managing Data

### Holdings (`_data/holdings.csv`)

Add or edit portfolio items:

| Column | Description |
|--------|-------------|
| `id` | Unique identifier (e.g., `pokemon-charizard-psa10`) |
| `name` | Display name |
| `category` | Grouping (e.g., "Trading Cards", "Watches") |
| `date_acquired` | Purchase date (YYYY-MM-DD) |
| `cost_basis` | Total amount paid |
| `current_value` | Current estimated value |
| `quantity` | Number of units |
| `notes` | Optional description |

### Transactions (`_data/transactions.csv`)

Track cash flows for IRR calculation:

| Column | Description |
|--------|-------------|
| `id` | Links to holding ID, or "PORTFOLIO" for general |
| `date` | Transaction date (YYYY-MM-DD) |
| `type` | "BUY", "SELL", "DIVIDEND", or "EXPENSE" |
| `amount` | Cash flow (negative for outflows, positive for inflows) |
| `description` | Transaction notes |

### Sales (`_data/sales.csv`)

Track realized gains from sold items:

| Column | Description |
|--------|-------------|
| `id` | Unique sale identifier (e.g., `sale-001`) |
| `holding_id` | Reference to original holding or description |
| `date_sold` | Sale date (YYYY-MM-DD) |
| `quantity_sold` | Number of units sold |
| `sale_proceeds` | Total amount received from sale |
| `cost_basis_sold` | Cost basis of the sold units |
| `notes` | Optional sale notes |

**Realized gain** is automatically calculated as `sale_proceeds - cost_basis_sold`.

## Deploying to GitHub Pages

1. Push to GitHub:
   ```bash
   git add .
   git commit -m "Initial portfolio setup"
   git push origin main
   ```

2. Enable GitHub Pages:
   - Go to repository Settings > Pages
   - Source: Deploy from a branch
   - Branch: `main` / `/ (root)`
   - Save

3. Access at `https://futuregadgettemplates.github.io/Portfolio1/`

## Project Structure

```
├── _config.yml           # Jekyll configuration
├── _data/
│   ├── holdings.csv      # Portfolio items
│   ├── transactions.csv  # Cash flow history
│   └── sales.csv         # Realized gains from sales
├── _includes/
│   ├── head.html         # HTML head
│   ├── header.html       # Navigation
│   ├── footer.html       # Footer
│   └── holding-card.html # Card component
├── _layouts/
│   ├── default.html      # Base layout
│   └── page.html         # Page layout
├── assets/
│   ├── css/style.css     # Styles
│   └── js/portfolio.js   # IRR calc & interactivity
├── index.md              # Dashboard
├── holdings.md           # Holdings list
└── performance.md        # IRR & analytics
```

## License

See [LICENSE](LICENSE) for details.
