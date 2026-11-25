# GitHub Copilot Instructions for Investment Dashboard

This repository contains **Investment Dashboard**, a local-first financial portfolio tracker built with React 19, TypeScript, Vite, and Chart.js.

## Core Directives

1. **Architecture & Separation of Concerns**:
   - Keep business logic inside `src/services/` (`analytics`, `auth`, `importers`, `market`, `storage`).
   - Keep UI components inside `src/components/`.
   - Access global application state exclusively through `AuthContext` and `PortfolioContext`.
   - Maintain service contracts using TypeScript interfaces (`IStorageAdapter`, `IMarketDataProvider`, `IAuthAdapter`).

2. **TypeScript & React Standards**:
   - Strict TypeScript rules apply (`strict: true`). Avoid `any` without exceptions.
   - Use standard React 19 functional components and hooks (`useState`, `useEffect`, `useMemo`, `useCallback`).
   - Type props explicitly as interfaces or type aliases.

3. **Data & File Importers**:
   - The XTB broker statement parser (`src/services/importers/XTBImporter.ts`) processes both CSV (PapaParse) and Excel XLSX (SheetJS).
   - Ensure transaction types (`BUY`, `SELL`, `DIVIDEND`, `DEPOSIT`, `WITHDRAWAL`) and currency mappings are handled defensively.

4. **Formatting & Encoding (Crucial on Windows)**:
   - Always output files using **UTF-8 without BOM** and **LF** line endings (`\n`).
   - Use plain ASCII hyphens (`-`) rather than typographical em-dashes (`—`).

5. **Commit & Workflow Conventions**:
   - Write commit messages in imperative English (e.g., `Add Stooq currency cache`, `Fix holdings sorting bug`).
   - When introducing user-facing features or bug fixes, update `CHANGELOG.md` under `[Unreleased]`.
   - Ensure `npm run build` succeeds cleanly prior to committing.
