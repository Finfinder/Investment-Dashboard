# Investment Dashboard

[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript 5.7](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite 6](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Chart.js 4](https://img.shields.io/badge/Chart.js-4.4-FF6384?logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)
[![Version](https://img.shields.io/badge/version-1.0.0-green)](package.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A modern, high-performance financial tracking web application designed for individual investors. Track portfolios, import brokerage statements (e.g. XTB), visualize asset allocation, analyze performance, and manage multiple accounts with local-first security and TOTP 2FA protection.

---

## Key Features

- **Multi-Portfolio Architecture**: Manage multiple investment accounts (e.g., Brokerage, IKE, IKZE, Crypto) with independent base currencies (PLN, USD, EUR, GBP, CHF) and consolidated dashboard view.
- **XTB Broker Statement Importer**: Import official XTB transaction reports directly from CSV and Excel (`.xlsx`) files with automatic ticker detection, exchange rate calculations, and fee parsing.
- **Real-Time KPIs & Analytics**: Instant calculation of portfolio net worth, total invested capital, realized and unrealized profit/loss, and portfolio weighting.
- **Visual Analytics**: Interactive performance equity curves and asset allocation donut charts powered by Chart.js.
- **Comprehensive Holdings Ledger**: Live table showing positions, quantity, average cost basis, current market price, and return percentage.
- **Transaction History**: Complete transaction log supporting BUY, SELL, DIVIDEND, CASH DEPOSIT, and CASH WITHDRAWAL.
- **Market Data Integration**: Extensible provider architecture featuring live and EOD market data retrieval via Stooq.
- **Local-First & Privacy Focused**: Your financial data resides locally on your device with exportable and restorable encrypted backup files.
- **Security & Multi-User Profiles**: Built-in user accounts with optional Two-Factor Authentication (TOTP / Google Authenticator) and QR code provisioning.
- **Modern Dark UI**: Carefully crafted dark financial interface with responsive design and high accessibility.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Core Framework** | [React 19](https://react.dev/) |
| **Language** | [TypeScript 5.7](https://www.typescriptlang.org/) |
| **Build & Dev Tool** | [Vite 6](https://vitejs.dev/) |
| **Visualization** | [Chart.js 4](https://www.chartjs.org/) & [react-chartjs-2](https://react-chartjs-2.js.org/) |
| **File Parsing** | [PapaParse](https://www.papaparse.com/) (CSV) & [SheetJS (xlsx)](https://sheetjs.com/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Market Data** | Stooq Provider Adapter |

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (version 20.x or 22.x LTS recommended)
- [npm](https://www.npmjs.com/) (version 10.x or newer)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Finfinder/Investment-Dashboard.git
   cd Investment-Dashboard
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. **Build for production**:
   ```bash
   npm run build
   ```
   The compiled static bundle will be generated in `dist/`.

5. **Preview production build**:
   ```bash
   npm run preview
   ```

---

## Project Structure

```
├── .github/
│   ├── ISSUE_TEMPLATE/     # GitHub Issue forms (bug reports, feature requests)
│   ├── instructions/       # Agent instructions and architectural context
│   └── workflows/          # GitHub Actions CI/CD workflows
├── src/
│   ├── components/         # Modular UI components
│   │   ├── auth/           # Login, registration, TOTP 2FA, landing page
│   │   ├── common/         # Modals, backup/restore, search dialogs
│   │   ├── dashboard/      # Summary KPIs, performance charts, donut chart
│   │   ├── holdings/       # Holdings table and asset breakdown
│   │   ├── layout/         # Top navbar and navigation elements
│   │   ├── portfolios/     # Multi-portfolio management dialogs
│   │   └── transactions/   # Buy/Sell modals, ledger, XTB import wizard
│   ├── context/            # React context providers (Auth, Portfolio)
│   ├── data/               # Static instrument definitions and default tickers
│   ├── services/           # Decoupled business logic and adapters
│   │   ├── analytics/      # Portfolio valuation, TWR, profit/loss calculations
│   │   ├── auth/           # Authentication adapters (IAuthAdapter)
│   │   ├── importers/      # XTB statement parser (CSV/XLSX)
│   │   ├── market/         # Market data provider interfaces (Stooq)
│   │   └── storage/        # Storage persistence adapters (IStorageAdapter)
│   ├── styles/             # Application styles and CSS theme variables
│   ├── types/              # Domain models, enums, and TypeScript interfaces
│   └── utils/              # TOTP token generator and helper utilities
├── index.html              # HTML entry point
├── package.json            # Project manifest and npm scripts
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build configuration
```

---

## Importing Broker Reports (XTB)

1. Open your XTB trading platform (xStation).
2. Navigate to **History** &rarr; **Cash Operations** or **Closed Positions**.
3. Export the report as a **CSV** or **Excel (.xlsx)** file.
4. In Investment Dashboard, click **Importuj XTB** in the top navigation.
5. Select your target portfolio and upload your file. All closed trades, dividends, and cash movements will be parsed and synchronized automatically.

---

## Feedback, Issues, and Contributing

- Report bugs or request features via [GitHub Issues](https://github.com/Finfinder/Investment-Dashboard/issues).
- Review our [Contributing Guide](CONTRIBUTING.md) for conventions and development guidelines.
- Please adhere to our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## Security

For reporting security vulnerabilities, refer to our [Security Policy](SECURITY.md). Please do not report security issues via public GitHub issues.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
