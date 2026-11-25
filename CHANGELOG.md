# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- Ignore internal Copilot agents, skills, internal prompts, and harness metadata in `.gitignore`.

### Removed
- Untrack internal Copilot agents, skills, internal prompts, and harness configuration files (`.github/agents`, `.github/internal-prompts`, `.github/skills`, `github/skills`, `.github/harness.json`, `harness.lock.json`) from repository.

### Added
- Standard repository documentation (`README.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `LICENSE`).
- Issue templates for bug reports and feature requests.
- Agent instructions (`.github/instructions/investment-dashboard.instructions.md` and `.github/copilot-instructions.md`).

## [1.0.0] - 2026-11-25

### Added
- Complete Investment Dashboard application built with React 19, TypeScript, and Vite.
- Multi-portfolio management supporting multiple accounts and base currencies (PLN, USD, EUR, GBP, CHF).
- Summary KPI metrics (Total Value, Total Cost, Profit/Loss, Daily Performance).
- Interactive Asset Allocation Donut Chart and Historical Performance Chart powered by Chart.js.
- Holdings table with real-time valuation, gain/loss indicators, and allocation percentages.
- Full transaction ledger supporting BUY, SELL, DIVIDEND, CASH IN, and CASH OUT operations.
- Native XTB statement importer supporting CSV and XLSX formats with automatic ticker detection.
- Market data integration with Stooq provider for quotes and currency exchange rates.
- Local storage persistence with automated encrypted JSON backup export and import.
- Built-in multi-user authentication with optional TOTP Two-Factor Authentication (2FA) and QR code setup.
- Modern dark-themed financial UI tailored for clarity and responsive operation.
