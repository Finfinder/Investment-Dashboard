# Contributing to Investment Dashboard

Thank you for your interest in contributing to Investment Dashboard! This guide outlines our development workflow, coding conventions, and pull request guidelines.

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code. Please report unacceptable behavior through [GitHub Issues](https://github.com/Finfinder/Investment-Dashboard/issues).

## Security

If you discover a security vulnerability, **do NOT open a public issue**. Instead, report it privately through [GitHub Security Advisories](https://github.com/Finfinder/Investment-Dashboard/security/advisories/new). See [SECURITY.md](SECURITY.md) for details.

## Issues and Linking

- Report bugs and feature requests via GitHub Issues: https://github.com/Finfinder/Investment-Dashboard/issues
- Link related work in commits and pull requests with `Refs #123`, `Fixes #123`, or `Closes #123`.
- Keep commit messages concise, imperative, and in English (e.g. `Add Stooq currency converter cache`, `Fix portfolio donut legend display`).

---

## Getting Started

### Prerequisites

| Tool | Recommended Version | Notes |
|------|---------------------|-------|
| [Node.js](https://nodejs.org/) | 20.x or 22.x LTS | Runtime environment |
| [npm](https://www.npmjs.com/) | 10.x+ | Package manager |
| [Git](https://git-scm.com/) | Latest | Version control |

### Clone and Install

```bash
git clone https://github.com/Finfinder/Investment-Dashboard.git
cd Investment-Dashboard

# Install dependencies
npm install

# Start local Vite development server
npm run dev

# Build production bundle
npm run build

# Preview production build
npm run preview
```

---

## Project Architecture

Investment Dashboard is built with modern React 19, TypeScript, and Vite.

```
src/
├── components/          # Reusable UI components
│   ├── auth/            # Authentication, TOTP 2FA, Landing page
│   ├── common/          # Common modals (e.g. BackupModal, InstrumentSearch)
│   ├── dashboard/       # Summary KPI cards, performance charts, donut allocation
│   ├── holdings/        # Holdings table, asset breakdown, filtering
│   ├── layout/          # Top navigation bar, profile switch, alerts
│   ├── portfolios/      # Multi-portfolio manager modal & settings
│   └── transactions/    # Buy/Sell asset modals, transaction history, XTB CSV/XLSX importer
├── context/             # Global state (AuthContext, PortfolioContext)
├── data/                # Default instruments and static mappings
├── services/            # Modular domain services (dependency-inversion style)
│   ├── analytics/       # Portfolio metrics (TWR, MWR, allocation, gain/loss)
│   ├── auth/            # Auth adapters (IAuthAdapter, LocalAuthAdapter)
│   ├── importers/       # Report parsers (XTB CSV / Excel parser)
│   ├── market/          # Market data providers (IMarketDataProvider, Stooq)
│   └── storage/         # Storage layer (IStorageAdapter, LocalStorageAdapter)
├── styles/              # Global CSS & theme styles
├── types/               # TypeScript interfaces and domain models
└── utils/               # Utility functions (e.g. TOTP calculation)
```

---

## Coding Conventions

For complete conventions, see [`.github/instructions/investment-dashboard.instructions.md`](.github/instructions/investment-dashboard.instructions.md).

### TypeScript & React Guidelines

- **Strict Typing**: No implicit `any`. Always provide explicit types for component props, function parameters, and service contracts.
- **Component Design**: Use functional components with explicit `React.FC<Props>` or typed props.
- **Service Interfaces**: Follow interface-driven development (`IStorageAdapter`, `IMarketDataProvider`, `IAuthAdapter`).
- **State Management**: Leverage React context providers (`AuthContext`, `PortfolioContext`) for shared domain state.
- **Styling**: Maintain a consistent dark financial dashboard aesthetic using clean CSS variables and modern UI patterns.
- **File Encoding**: All source files must be encoded in **UTF-8 without BOM** using **LF** line endings.

---

## Pull Request Guidelines

Before submitting a pull request, ensure:

1. **Build passes cleanly**: `npm run build` runs without TypeScript or Vite errors.
2. **Commit messages**: Use clear, concise imperative English summaries.
3. **Changelog updated**: Document your changes under the `[Unreleased]` section of `CHANGELOG.md`.
4. **Documentation**: Update `README.md` if your PR introduces new features or configuration requirements.
