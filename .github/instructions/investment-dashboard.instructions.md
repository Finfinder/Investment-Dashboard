---
description: "Konwencje React 19 / TypeScript / Vite dla Investment Dashboard — architektura dashboardu finansowego, stan, serwisy, import raportów XTB, analityka portfelowa, UI i testowanie."
applyTo: "**"
---

# Investment Dashboard

Aplikacja webowa do ewidencji i zaawansowanej analityki portfeli inwestycyjnych, importu raportów maklerskich (XTB), wizualizacji alokacji aktywów i śledzenia wyników finansowych z lokalną architekturą (local-first) oraz uwierzytelnianiem 2FA (TOTP).

## Stos technologiczny

- **React 19** — nowoczesne komponenty funkcyjne, hooks
- **TypeScript 5.7+** — ścisłe typowanie (`strict: true`), brak typu `any`
- **Vite 6** — szybki bundler i środowisko deweloperskie
- **Chart.js 4 & react-chartjs-2** — wykresy alokacji (Donut) oraz wykresy wyników (Line)
- **PapaParse** — parser plików CSV (raporty XTB)
- **SheetJS (xlsx)** — parser arkuszy kalkulacyjnych Excel (raporty XTB)
- **Lucide React** — ikony interfejsu
- **CSS Custom Properties** — dedykowany motyw ciemny (dark theme)

---

## Architektura projektu

```
src/
??? components/          # Komponenty interfejsu użytkownika
?   ??? auth/            # Logowanie, rejestracja, TOTP 2FA, QR kod, LandingPage
?   ??? common/          # Współdzielone modale (BackupModal, InstrumentSearch itp.)
?   ??? dashboard/       # KPI, wykresy podsumowania, alokacja aktywów
?   ??? holdings/        # Tabela pozycji, wskaźniki zysku/straty, wagi
?   ??? layout/          # Górny pasek nawigacji, przełącznik portfeli
?   ??? portfolios/      # Zarządzanie portfelami (PortfolioManagerModal)
?   ??? transactions/    # Modale Kupna/Sprzedaży, historia operacji, importer XTB
??? context/             # Globalny stan aplikacji (AuthContext, PortfolioContext)
??? data/                # Statyczne bazy instrumentów i mapowania
??? services/            # Architektura serwisów (Dependency Inversion)
?   ??? analytics/       # Obliczenia finansowe (TWR, MWR, stopa zwrotu, zysk/strata)
?   ??? auth/            # Interfejs IAuthAdapter i implementacja LocalAuthAdapter
?   ??? importers/       # Parsery wyciągów (XTB CSV/XLSX)
?   ??? market/          # Dostawcy danych rynkowych (IMarketDataProvider, Stooq)
?   ??? storage/         # Warstwa pamięci (IStorageAdapter, LocalStorageAdapter)
??? styles/              # Globalne style CSS
??? types/               # Definicje typów TypeScript
??? utils/               # Narzędzia pomocnicze (np. algorytm TOTP RFC 6238)
```

---

## Kluczowe wzorce i reguły architektoniczne

### 1. Warstwa serwisów i odwrócenie zależności (Inversion of Control)
- Komponenty UI nie powinny bezpośrednio manipulować magazynem danych ani wykonywać zapytań HTTP do dostawców cen.
- Każda domena posiada interfejs (`IStorageAdapter`, `IMarketDataProvider`, `IAuthAdapter`) oraz implementację domyślną.
- Logika analityczna portfela (`services/analytics/`) jest czystą logiką domenową (pure functions), łatwą do testowania jednostkowego.

### 2. Wieloportfelowość i waluty
- Każdy portfel posiada własną walutę bazową (`Currency = 'PLN' | 'USD' | 'EUR' | 'GBP' | 'CHF'`).
- Konsolidacja na głównym dashboardzie przelicza wartości wg aktualnych kursów walutowych.
- Portfele mogą być włączane/wyłączane z widoku skonsolidowanego za pomocą flagi `includeInDashboard`.

### 3. Importer raportów XTB (`XTBImporter.ts`)
- Obsługuje dwa formaty wyciągów z platformy XTB (xStation): CSV oraz XLSX.
- Rozpoznaje typy operacji: Otwarcia i zamknięcia pozycji, dywidendy, wpłaty i wypłaty środków, podatki.
- Zachowuje spójność numerów zleceń (`positionId`) i unika duplikatów przy ponownym imporcie.

### 4. Bezpieczeństwo i Local-First
- Dane inwestycyjne nie są wysyłane na żaden zewnętrzny serwer – są przechowywane w bezpieczny sposób w przeglądarce użytkownika.
- Uwierzytelnianie dwuskładnikowe (TOTP RFC 6238) generuje sekret w formacie Base32 i kod QR do zeskanowania aplikacją typu Google Authenticator lub Aegis.
- Funkcja kopii zapasowej (`BackupModal`) umożliwia eksport i import stanu do zaszyfrowanego pliku JSON.

---

## Konwencje kodowania

### TypeScript
- **Ścisłe typowanie**: Nie używaj `any`. Jeśli typ nie jest jeszcze znany, użyj `unknown` i type guardów.
- **Interfejsy i modele**: Definiuj struktury w `src/types/` (np. `portfolio.ts`, `marketData.ts`, `user.ts`).
- **Props komponentów**: Jawnie typuj parametry wejściowe komponentów (`interface Props` lub `type Props`).

### React 19
- **Komponenty funkcyjne**: Używaj komponentów funkcyjnych z React Hooks.
- **Czystość renderowania**: Unikaj wywoływania efektów ubocznych bezpośrednio w ciele funkcji renderującej.
- **Optymalizacja**: Używaj `useMemo` i `useCallback` w miejscach ciężkich obliczeń analitycznych (np. agregacje tysięcy transakcji, kalkulacja stóp zwrotu).

### Kodowanie plików i formatowanie (KRYTYCZNE)
- Wszystkie pliki muszą być zapisywane w formacie **UTF-8 bez BOM**.
- Znaki końca linii: **LF** (`\n`), nigdy CRLF.
- Myślniki w dokumentacji: używaj zwykłego myślnika ASCII (`-`), unikaj em-dash (`—` / `–`) powodujących błędy kodowania w konsolach Windows.
- Polskie znaki diakrytyczne (ą, ć, ę, ł, ń, ó, ś, ź, ż) są dozwolone w tekstach UI, ale upewnij się, że plik nie został zapisany w Windows cp1250.

---

## Konwencje commitów i Git

- Opisy commitów ZAWSZE w języku angielskim w trybie rozkazującym (np. `Add Stooq exchange rate caching`, `Fix XTB dividend parser error`).
- Nie twórz commita z plikami `node_modules/` lub `dist/`.
- Przed zatwierdzeniem zmian upewnij się, że:
  - `npm run build` przechodzi bez błędów.
  - Zaktualizowano `CHANGELOG.md` w sekcji `[Unreleased]`.
  - W razie potrzeby zaktualizowano `README.md`.

---

## Czego NIE robić

- NIE wprowadzaj bibliotek zewnętrznych do zarządzania stanem (Redux, MobX, Zustand) – kontekst React w zupełności wystarcza dla tej architektury.
- NIE wykonuj synchronicznych operacji blokujących w głównym wątku przy parsowaniu dużych plików CSV/XLSX.
- NIE zapisuj sekretów ani kluczy API na stałe w repozytorium.
- NIE zmieniaj kodowania plików na Windows-1250 ani UTF-8 z BOM.
