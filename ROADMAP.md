# Status projektu / Roadmapa (Investment Dashboard)

Ten dokument oraz powiązane Issue na GitHubie zbierają bieżący status, mapę drogową, architekturę wydań oraz najbliższe priorytety projektu **Investment Dashboard**.

---

## 1. Wizja i Stan Obecny (Wersja 1.0.0)

Investment Dashboard to zorientowana na prywatność (local-first) aplikacja webowa do ewidencji i zaawansowanej analityki portfeli inwestycyjnych, importu wyciągów maklerskich XTB, analizy alokacji i wyników finansowych.

Wersja bazowa `1.0.0` (wydana 2026-11-25) obejmuje:
- Zarządzanie wieloma portfelami i obsługę walut bazowych (PLN, USD, EUR, GBP, CHF) z przeliczeniami FX (kursy Stooq).
- Pełną ewidencję transakcji (Kupno, Sprzedaż, Dywidendy, Wpłaty, Wypłaty).
- Parser wyciągów z platformy XTB (xStation) w formatach CSV oraz XLSX.
- Wizualizacje alokacji (Donut Chart) i historii wyników (Line Chart) oparte o Chart.js.
- Uwierzytelnianie użytkowników z opcjonalnym 2FA TOTP (RFC 6238) i generatorem kodów QR.
- Eksport i import zaszyfrowanych kopii zapasowych (backup JSON) z lokalnego magazynu przeglądarki.

---

## 2. Roadmapa Wydań i Cykle Rozwoju

Rozwój projektu prowadzony jest według semantycznego wersjonowania (SemVer) oraz strategii branchowania opisanej w `git-workflow-managing`. Każda wersja posiada dedykowany Milestone na GitHubie.

| Wersja | Milestone GitHub | Status | Szacowany Rozmiar | Główne Cele i Zakres | Zależności |
|---|---|---|---|---|---|
| **1.0.0** | Wydana (2026-11-25) | Ukończona | L | Wersja bazowa: Multi-portfolio, import XTB (CSV/XLSX), Stooq FX, 2FA TOTP, Dark theme | Brak |
| **1.1.0** | [1.1.0 Jakość kodu i testowalność](https://github.com/Finfinder/Investment-Dashboard/milestone/1) | W realizacji | M | Środowisko testowe Vitest + RTL, testy jednostkowe silnika portfela i importera XTB, testy integracyjne UI | 1.0.0 |
| **1.2.0** | [1.2.0 Bezpieczeństwo i magazyn danych](https://github.com/Finfinder/Investment-Dashboard/milestone/2) | Zaplanowana | M | Szyfrowanie LocalStorage (AES-GCM Web Crypto), ochrona brute-force 2FA, AbortController w zapytaniach sieciowych | 1.1.0 |
| **1.3.0** | [1.3.0 Architektura domenowa i odporność UI](https://github.com/Finfinder/Investment-Dashboard/milestone/3) | Zaplanowana | M | Czyste serwisy domenowe (wydzielenie z Context), globalny ErrorBoundary, zaawansowana walidacja formularzy | 1.2.0 |
| **1.4.0** | [1.4.0 CI/CD i automatyzacja wydań](https://github.com/Finfinder/Investment-Dashboard/milestone/4) | Zaplanowana | S | Potok GitHub Actions CI (lint, test, build, audit), automatyzacja wydań, weryfikacja jakości Sonar | 1.3.0 |
| **2.0.0** | [2.0.0 Zaawansowana analityka i integracje](https://github.com/Finfinder/Investment-Dashboard/milestone/5) | Przyszłość | XL | Wycena fundamentalna (DCF / DDM, C/Z, EV/EBITDA), kolejni brokerzy (BOSSA, mBank, IBKR), opcjonalny sync | 1.4.0 |

---

## 3. Szczegółowy Zakres Faz Rozwojowych

### Faza 1: Wersja 1.1.0 - Jakość Kodu i Testowalność
- **Cel:** Podniesienie pokrycia testami z 0% do stabilnego baseline i zapewnienie odporności kalkulacji finansowych.
- **Zadania:**
  - Konfiguracja środowiska testowego (Vitest, React Testing Library, happy-dom).
  - Testy jednostkowe silnika analitycznego (`src/services/analytics/portfolioCalculations.ts`).
  - Testy jednostkowe importera wyciągów XTB (`src/services/importers/XTBImporter.ts`) z walidacją poprawnych i uszkodzonych plików CSV/XLSX.
  - Testy jednostkowe algorytmu TOTP RFC 6238 (`src/utils/totp.ts`).
  - Testy integracyjne komponentów modali transakcyjnych i importu danych.
  - Konfiguracja lintera i skryptów weryfikacyjnych w `package.json`.

### Faza 2: Wersja 1.2.0 - Bezpieczeństwo i Magazyn Danych
- **Cel:** Ochrona wrażliwych danych finansowych i kluczy uwierzytelniania w środowisku przeglądarkowym.
- **Zadania:**
  - Wprowadzenie szyfrowania po stronie klienta (AES-GCM) dla danych w `LocalStorageAdapter`.
  - Zabezpieczenie weryfikacji kodów TOTP przed atakami siłowymi (rate-limiting i blokada czasowa po N nieudanych próbach).
  - Obsługa anulowania żądań HTTP (`AbortController`) w `StooqProvider` eliminująca wycieki pamięci i wyścigi zapytań (race conditions).
  - Audyt bezpieczeństwa zależności npm (`npm audit`) i eliminacja podatności.

### Faza 3: Wersja 1.3.0 - Architektura Domenowa i Odporność UI
- **Cel:** Czysty podział odpowiedzialności (Separation of Concerns) oraz odporność na błędy czasu wykonania.
- **Zadania:**
  - Ekstrakcja czystej logiki biznesowej z `PortfolioContext` i `AuthContext` do dedykowanych serwisów domenowych.
  - Wdrożenie globalnego oraz sekcyjnego komponentu `ErrorBoundary` zapobiegającego awariom całej aplikacji przy błędach renderowania.
  - Usprawnienie obsługi błędów użytkownika i zaawansowana walidacja formularzy (kupno/sprzedaż, wpłaty, edycja portfeli).

### Faza 4: Wersja 1.4.0 - CI/CD i Automatyzacja Wydań
- **Cel:** Automatyczna weryfikacja każdego PR i powtarzalny proces release.
- **Zadania:**
  - Konfiguracja GitHub Actions workflow (testy jednostkowe, lintowanie TypeScript, audyt npm, budowanie produkcyjne).
  - Integracja bramek jakości (Sonar Quality Gate) dla gałęzi wersyjnych.
  - Automatyzacja generowania changelogów i release tagów według semver.
  - Rozbudowa dokumentacji technicznej i podręcznika użytkownika w `README.md`.

### Faza 5: Wersja 2.0.0 - Zaawansowana Analityka i Integracje
- **Cel:** Przekształcenie dashboardu w zaawansowaną platformę analizy fundamentalnej i multi-brokerskiej.
- **Zadania:**
  - Silnik wyceny fundamentalnej (modele DCF, DDM, analiza wskaźnikowa C/Z, P/BV, EV/EBITDA).
  - Nowe importery wyciągów maklerskich: Dom Maklerski BOŚ (BOSSA), mBank eMakler, Interactive Brokers (Activity Statement).
  - Opcjonalna synchronizacja szyfrowanych danych (E2EE) z prywatnym serwerem (Self-hosted CouchDB / Supabase).

---

## 4. Zasady Inżynieryjne i Zarządzanie Zadaniami

1. **Kanoniczny format branchy taskowych**: `<feat|fix|tests|chore|task>/<semver>/Issue/<number>`.
2. **Merge-forward**: Prace wchodzą przez zatwierdzony Pull Request do gałęzi wersyjnej (`<semver>`), a następnie są propagowane w górę do kolejnych wersji i do `main`.
3. **Strict TypeScript & Czysty Kod**: Zakaz stosowania typu `any`, rygorystyczne sprawdzanie typów, czyste funkcje biznesowe odseparowane od widoków React.
4. **Local-First & Zero-Knowledge**: Dane użytkownika należą do użytkownika i domyślnie nigdy nie opuszczają lokalnego magazynu przeglądarki.
