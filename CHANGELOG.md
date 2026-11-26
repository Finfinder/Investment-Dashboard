# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Dedicated unit and integration test suite with Vitest, React Testing Library, and happy-dom (INV-01 #2).
- Unit tests for portfolio analytics and financial metrics engine (`portfolioCalculations.test.ts`).
- Unit tests for broker statement parser (`XTBImporter.test.ts`) covering CSV and XLSX imports.
- Unit tests for RFC 6238 TOTP two-factor authentication and backup codes (`totp.test.ts`).
- Unit tests for local storage adapter and Stooq market data provider (`LocalStorageAdapter.test.ts`, `StooqProvider.test.ts`).
- Integration tests for portfolio state management and context (`PortfolioContext.test.tsx`).
- Integration tests for UI modals and tables (`XTBImportModal.test.tsx`, `HoldingsTable.test.tsx`).
- V8 code coverage reporting with thresholds configured in `vitest.config.ts`.
- Standard repository documentation (`README.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `LICENSE`).
- Issue templates for bug reports and feature requests.
- Agent instructions (`.github/instructions/investment-dashboard.instructions.md` and `.github/copilot-instructions.md`).

### Changed
- Ignore internal Copilot agents, skills, internal prompts, and harness metadata in `.gitignore`.
- Refined `XTBImporter` ticker and currency extraction for cash operations, foreign dividends, and withholding taxes.
- Prioritized ETF categorization in `XTBImporter.categorizeSymbol` for global ETFs (e.g., `VWCE.DE`, `SPY.US`).
- Filtered non-trade pseudo-tickers before querying market quotes in `PortfolioContext.importXTBFile` and `PortfolioContext.syncPrices`.
- Skipped market quote requests in `PortfolioContext.syncPrices` when no traded tickers are present.
- Added `.npmrc` with `allow-remote=root` so that the SheetJS CDN tarball can be installed while remote tarballs of transitive dependencies stay blocked.
- Added `src/types/env.d.ts` with minimal typing for `import.meta.env`.
- Deduplicated XTB closed positions by ticker, quantity and trading day instead of comparing unrelated identifier namespaces, so a position reported in both "Cash Operations" and "Closed Positions" no longer produces duplicated BUY/SELL pairs.
- Memoized `PortfolioContext` derived state (`relevantTransactions`, `holdings`, `summaryStats`) and the exposed context value, with `useCallback` for all context actions.
- Typed `UserRecord.backupCodes` to remove `as any` casts in `LocalAuthAdapter`.
- Extracted closed-position trade creation into `XTBImporter.appendClosedPositionTrade`, reducing the cognitive complexity of `parseWorkbook` from 182 to 149.
- Added unit tests for `LocalAuthAdapter` account and session lifecycle (22 cases).
- Reset `profile.twoFactorEnabled: false` when sanitizing legacy accounts storing the public test vector in `LocalAuthAdapter`, preventing permanent account lockout (SEC-16).
- Scoped `claimedIds` in `XTBImporter.parseWorkbook` across all workbook sheets to prevent cross-sheet trade duplication (CQ-R7).
- Replaced hardcoded test vector string in `LocalAuthAdapter.test.ts` with `PUBLIC_VECTOR_SECRET` constant (CQ-R8).
- Added defensive validation in `LocalAuthAdapter.getUsers()` to handle non-array JSON without throwing unhandled exceptions (SEC-17 / CQ-R9).

### Removed
- Untrack internal Copilot agents, skills, internal prompts, and harness configuration files (`.github/agents`, `.github/internal-prompts`, `.github/skills`, `github/skills`, `.github/harness.json`, `harness.lock.json`) from repository.
- Removed the public RFC test vector `JBSWY3DPEHPK3PXP` from the seeded demo user record in `LocalAuthAdapter`.
- Sanitized legacy user records that still store the public RFC test vector as their 2FA secret when they are read from storage.

### Security
- Restricted the demo 2FA master code (`123456`) to Vite development builds via `isDemo2FACodeEnabled()`. Vite statically replaces `import.meta.env.DEV` with `false` in production bundles, so the code path and all UI hints (`AuthModal`, `TwoFactorSetupModal`, `LocalAuthAdapter` error message) are removed from production builds (SEC-1).
- Replaced `xlsx` 0.18.5 with SheetJS 0.20.3 from the official CDN tarball (`https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`), closing CVE-2023-30533 (prototype pollution) and CVE-2024-22363 (ReDoS). `npm audit` now reports 0 vulnerabilities (SEC-8).
- `LocalAuthAdapter.verify2FA` now rejects verification when the account has no stored 2FA secret instead of falling back to the publicly known RFC 4226/6238 test vector `JBSWY3DPEHPK3PXP`, which allowed anyone to compute a valid TOTP code (SEC-15).
- Eliminated permanent account lockout risk (SEC-16) by disabling `twoFactorEnabled` whenever a legacy public test vector is sanitized, allowing users to authenticate via password and re-enroll 2FA.
- `LocalAuthAdapter.verify2FA` now also rejects verification when the stored profile has two-factor authentication disabled, so a lingering secret cannot be used to bypass the flag (SEC-15).
- XTB closed-position deduplication now claims each already imported trade at most once, so two genuinely distinct positions sharing ticker, quantity, and trading day are no longer silently collapsed into a single pair (IT-14).

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
