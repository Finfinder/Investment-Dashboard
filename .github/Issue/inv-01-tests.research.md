# Raport Badawczy (Research): INV-01 Dedykowane testy jednostkowe i integracyjne dla silnika analitycznego i importera XTB

Data utworzenia: 2026-11-25  
Zadanie: [INV-01 tests: Dedykowane testy jednostkowe i integracyjne dla silnika analitycznego i importera XTB #2](https://github.com/Finfinder/Investment-Dashboard/issues/2)  
Milestone: [1.1.0 Jakosc kodu i testowalnosc](https://github.com/Finfinder/Investment-Dashboard/milestone/1)  
Status: Gotowy do planowania architektonicznego  
Autor analizy: Context Engineer (GitHub Copilot)  

---

## 1. Streszczenie Wykonawcze

Niniejszy dokument przedstawia kompleksowy raport badawczy (research) dla zadania **INV-01 (#2)**, bedacego pierwszym etapem realizacyjnym w ramach wydania **v1.1.0**. Glownym celem zadania jest wdrozenie kompletnego, nowoczesnego srodowiska testowego (Vitest + React Testing Library + happy-dom) oraz przygotowanie zestawu deterministycznych testow jednostkowych i integracyjnych dla krytycznych komponentow aplikacji `Investment Dashboard`.

Obecne pokrycie testami w projekcie wynosi **0%**. Aplikacja realizuje kluczowe operacje matematyczno-finansowe (kalkulacja wag, zysku/straty, wyliczanie CAGR, przewalutowania wielowalutowe FX) oraz parsuje zewnetrzne pliki raportow maklerskich (XTB CSV i XLSX), przez co brak automatycznej weryfikacji stanowi bezposrednie ryzyko regresji, bledow numerycznych oraz utrudnia bezpieczny refaktoring.

Realizacja zadania podniesie jakosc kodu do poziomu stabilnego baseline testowego, gwarantujac determinizm obliczen oraz odpornosc importera na anomalie w plikach zewnetrznych.

---

## 2. Kontekst Biznesowy i Cele Zadania

### 2.1. Zrodla kontekstu i powiazania
- **GitHub Issue**: [#2 (INV-01 tests)](https://github.com/Finfinder/Investment-Dashboard/issues/2)
- **Roadmapa i Milestone**: [Status projektu / Roadmapa #1](https://github.com/Finfinder/Investment-Dashboard/issues/1), `ROADMAP.md` (Faza 1, Milestone `1.1.0 Jakość kodu i testowalność`)
- **Audyt architektoniczny**: `.github/Issue/FullProjectReview.plan.md` (Epik 1: Zadania TASK-1.1, TASK-1.2, TASK-1.3)
- **Instrukcje projektu**: `.github/instructions/investment-dashboard.instructions.md` oraz `.github/copilot-instructions.md`

### 2.2. Uzasadnienie biznesowe
1. **Prawidlowosc wyceny majatku inwestycyjnego**: Bledy w zaokragleniach, algorytmie sredniej ceny wazonej lub przeliczeniach walutowych (PLN, USD, EUR, GBP, CHF) wprowadzaja uzytkownika w blad co do rzeczywistej stopy zwrotu i wartosci portfela.
2. **Niezawodnosc importu danych z biura maklerskiego XTB**: Uzytkownicy eksportuja z platformy xStation wyciagi w dwoch formatach (CSV oraz XLSX) o zmiennych naglowkach, roznych separatorach dziesietnych (przecinek vs kropka) i niejednolitych opisach transakcji. Blad parsowania moze prowadzic do pominiecia transakcji lub ich duplikacji.
3. **Integralnosc uwierzytelniania dwuskladnikowego (TOTP RFC 6238)**: Modul bezpieczenstwa musi scisle odpowiadac specyfikacji kryptograficznej (HMAC-SHA1, okno czasowe 30 sekund, drift tolerance +-1 krok).
4. **Fundament pod automatyzacje CI/CD (Milestone 1.4.0)**: Brak polecenia `npm run test` konczacego sie sukcesem uniemozliwia skonfigurowanie bramek jakosci w GitHub Actions.

---

## 3. Analiza Biezacego Stanu Systemu (Current Implementation Status)

| Obszar / Modul | Plik zrodlowy | Stan obecny | Zidentyfikowane luki i podatnosci |
|---|---|---|---|
| **Srodowisko testowe** | `package.json`, `vite.config.ts` | Brak konfiguracji testow, brak pakietow `vitest`, `happy-dom`, `@testing-library/react`. Skrypt `test` nie istnieje w `package.json`. | 0% pokrycia testami, brak mozliwosci automatycznego uruchomienia weryfikacji. |
| **Silnik analityczny** | `src/services/analytics/portfolioCalculations.ts` | Klasa statyczna z metodami: `calculateHoldings`, `groupHoldings`, `calculateSummaryStats`. | Brak testow weryfikujacych zaokraglenia zmiennoprzecinkowe, zachowanie przy pustym portfelu, dzielenie przez zero przy zerowym koszcie (`totalCostPLN = 0`), ujemne stopy zwrotu. |
| **Importer raportow XTB** | `src/services/importers/XTBImporter.ts` | Klasa statyczna obslugujaca pliki XLSX (arkusze 'Operacje gotówkowe' i 'Pozycje zamknięte') oraz CSV (PapaParse). | Logika detekcji walut i kategorii oparta na regexach i substringach (`detectCurrency`, `categorizeSymbol`). Ryzyko bledow przy nietypowych tickerach lub formatach liczb z przecinkami. Uzycie `FileReader` wymaga obslugi w testach. |
| **Uwierzytelnianie 2FA TOTP** | `src/utils/totp.ts` | Generowanie sekretu Base32, generowanie i weryfikacja kodu TOTP w oparciu o `window.crypto.subtle` (Web Crypto API). | Zaleznosc od `window.crypto` - w srodowisku happy-dom nalezy zapewnic dostep do `crypto.subtle` lub polifilla z Node.js `node:crypto`. |
| **Zarzadzanie stanem** | `src/context/PortfolioContext.tsx` | Kontekst React integrujacy storage, providery rynkowe, kalkulacje analityczne i import XTB. | Brak testow integracyjnych weryfikujacych reaktywnosc stanu po dodaniu/usunieciu transakcji, aktualizacji notowan i procedurze importu. |
| **Interfejs uzytkownika (UI)** | `src/components/transactions/XTBImportModal.tsx`, `src/components/holdings/HoldingsTable.tsx` | Modale transakcyjne i importu, tabela pozycji ze zwijaniem grup i eksportem CSV/XLS. | Komponenty zalezne od kontekstow i bibliotek formatujacych. Komponenty dashboardu uzywaja Canvas (`chart.js`), co wymaga zamockowania w srodowisku testowym DOM. |

---

## 4. Wymagania Funkcjonalne i Scenariusze Testowe

### 4.1. Modul 1: Silnik kalkulacji portfela (`PortfolioCalculations`)
Plik docelowy testow: `src/services/analytics/__tests__/portfolioCalculations.test.ts`

- **Scenariusz 1.1: Kalkulacja pozycji metodą ważonej ceny zakupu**:
  - Weryfikacja dla transakcji pojedynczego zakupu (BUY).
  - Weryfikacja dla wielokrotnych zakupow tego samego waloru w roznych cenach i z roznymi prowizjami (kalkulacja `totalCostPLN`, `totalCostOriginal`, `averageBuyPricePLN`, `averageBuyPriceOriginal`).
  - Weryfikacja czesciowej sprzedazy (SELL) - redukcja ilosci przy zachowaniu proporcjonalnego kosztu wlasnego.
  - Weryfikacja calkowitej sprzedazy waloru (pozycja o ilosci <= 0.0001 nie powinna pojawiac sie w aktywnych pozycjach `holdings`).
- **Scenariusz 1.2: Przeliczenia wielowalutowe FX**:
  - Walory denominowane w USD, EUR, GBP przeliczane wedlug zadanego kursu walutowego do PLN.
  - Weryfikacja poprawnosci `currentPricePLN = currentPriceOriginal * fxRate`.
- **Scenariusz 1.3: Alokacja i wagi portfela**:
  - Suma wag procentowych wszystkich aktywnych pozycji (`portfolioSharePercent`) musi wynosic 100% (z tolerancja na zaokraglenia +-0.05%).
- **Scenariusz 1.4: Grupowanie aktywow (`groupHoldings`)**:
  - Poprawne grupowanie pozycji wedlug `AssetCategory` (Akcje GPW, Akcje NASDAQ, ETF, Surowce itp.).
  - Agregacja wartosci calkowitej, kosztu, zysku dziennego i calkowitego per kategoria.
  - Poprawny udzial kategorii w calym portfelu.
- **Scenariusz 1.5: Podsumowanie skonsolidowane (`calculateSummaryStats`)**:
  - Uwzglednianie w statystykach wylacznie portfeli majacych flage `includeInDashboard === true`.
  - Wyliczanie liczby spolek zyskujacych (`gainersCount`) i tracacych (`losersCount`).
  - Wyliczanie wskaznika CAGR na podstawie najstarszej transakcji.
- **Scenariusz 1.6: Przypadki brzegowe i ekstremalne**:
  - Pusta lista transakcji (zwraca pusta tablice `holdings`, `totalValuePLN = 0`, brak bledow NaN).
  - Brak notowania dla danego tickera w mapie `quotes` (fallback do ceny zakupu, zmiana dzienna 0%).
  - Koszt zakupu rowny 0 (`totalCostPLN = 0`) - stopa zwrotu powinna wynosic 0% bez rzucania bledu dzielenia przez zero (`Infinity`).

### 4.2. Modul 2: Importer wyciagow XTB (`XTBImporter`)
Plik docelowy testow: `src/services/importers/__tests__/XTBImporter.test.ts`

- **Scenariusz 2.1: Parsowanie wyciagu CSV**:
  - Prawidlowe parsowanie pliku CSV zawierajacego sekcje operacji gotowkowych (wplaty, wyplaty, dywidendy, podatki).
  - Ekstrakcja liczby akcji i ceny z pola komentarza (np. `OPEN BUY 2/3 @ 141.43` lub `OPEN BUY 10 @ 25.50`).
  - Weryfikacja poprawnosci kwot i typow transakcji (`DEPOSIT`, `WITHDRAWAL`, `DIVIDEND`, `TAX`, `BUY`, `SELL`).
- **Scenariusz 2.2: Parsowanie wyciagu Excel XLSX**:
  - Parsowanie skoroszytu z arkuszami 'Operacje gotówkowe' (lub 'Cash Operations') oraz 'Pozycje zamknięte' (lub 'Closed Positions').
  - Powiazanie transakcji kupna i sprzedazy dla pozycji zamknietych, generowanie unikalnych `xtbId` (`posId-buy`, `posId-sell`).
  - Unikanie duplikatow transakcji, jesli operacja zostala juz zarejestrowana w sekcji gotowkowej.
- **Scenariusz 2.3: Klasyfikacja symboli i walut**:
  - Weryfikacja funkcji `categorizeSymbol`: rozpoznawanie spolek GPW (`.PL`), NASDAQ (`AAPL`, `NVDA`, `.US`), Europejskich (`.DE`, `.NL`), ETF (`VWCE`, `SPY`) oraz Surowcow (`GOLD`, `OIL`).
  - Weryfikacja funkcji `detectCurrency`: rozpoznawanie PLN, USD, EUR, GBP na podstawie tickera lub komentarza.
- **Scenariusz 2.4: Odpornosc na bledne dane (Resilience)**:
  - Przekazanie pliku o nieobslugiwanym rozszerzeniu (np. `.pdf`, `.json`) - oczekiwane odrzucenie Promise z czytelnym komunikatem bledu.
  - Plik CSV/XLSX z brakujacymi naglowkami kolumn - bezpieczne zakonczenie bez wyjatku, zwrocenie 0 transakcji lub odpowiednich ostrzezen.
  - Plik z pustymi wierszami i wierszami podsumowujacymi ('Total', 'Razem') - wiersze podsumowan musza byc ignorowane.
  - Format liczb z przecinkiem dziesietnym (np. `141,43`) vs kropka (`141.43`).

### 4.3. Modul 3: Narzedzia bezpieczenstwa 2FA TOTP (`totp`)
Plik docelowy testow: `src/utils/__tests__/totp.test.ts`

- **Scenariusz 3.1: Generowanie sekretu Base32**:
  - Dlugosc sekretu (domyslnie 16 znakow).
  - Wszystkie znaki naleza wylacznie do dozwolonego alfabetu Base32 (`A-Z`, `2-7`).
- **Scenariusz 3.2: Generowanie i weryfikacja kodu TOTP (RFC 6238)**:
  - Generowanie 6-cyfrowego kodu dla zadanego sekretu.
  - Poprawna weryfikacja kodu wygenerowanego w biezacym kroku czasowym (offset 0).
  - Poprawna weryfikacja kodu z tolerancja czasowa (offset -1: 30 sekund wstecz, offset +1: 30 sekund w przod).
  - Odrzucenie nieprawidlowego kodu (np. `000000` dla losowego sekretu) oraz kodu z przesunieciem czasowym >= 2 kroki (>= 60 sekund).
- **Scenariusz 3.3: Kody awaryjne i kod demonstracyjny**:
  - Akceptacja uniwersalnego kodu deweloperskiego `123456`.
  - Generowanie listy 8 kodow zapasowych w formacie `XXXX-XXXX`.
  - Poprawna weryfikacja kodu zapasowego z listy i zwrocenie `usedBackupCode`.
- **Scenariusz 3.4: Format URL `otpauth://`**:
  - Weryfikacja generowania poprawnego adresu URI dla aplikacji uwierzytelniajacych (parametry `secret`, `issuer`, `algorithm=SHA1`, `digits=6`, `period=30`).

### 4.4. Modul 4: Testy integracyjne stanu i komponentow UI
Pliki docelowe testow:
- `src/context/__tests__/PortfolioContext.test.tsx`
- `src/components/transactions/__tests__/XTBImportModal.test.tsx`
- `src/components/holdings/__tests__/HoldingsTable.test.tsx`

- **Scenariusz 4.1: Zarzadzanie stanem w `PortfolioContext`**:
  - Inicjalizacja stanu: ladowanie portfeli i transakcji z adaptera storage.
  - Wywolanie `addPortfolio`: utworzenie nowego portfela i utrwalenie w adapterze.
  - Wywolanie `deletePortfolio`: usuniecie powiazanych transakcji i zmiana aktywnego widoku na 'ALL'.
  - Wywolanie `addTransaction`: aktualizacja listy transakcji i przeliczenie pozycji `holdings`.
  - Wywolanie `importXTBFile`: integracja z parserem XTB, zasilenie stanu nowymi transakcjami i odswiezenie notowan.
- **Scenariusz 4.2: Komponent `XTBImportModal`**:
  - Renderowanie komponentu, sprawdzanie czy modal nie renderuje sie gdy `isOpen === false`.
  - Wybor pliku przez input plikowy oraz obsluga przeciagniecia (drag & drop).
  - Prezentacja szczegolow wybranego pliku (nazwa, rozmiar w KB).
  - Wywolanie procesu importu po kliknieciu przycisku 'Zaimportuj raport', wyswietlenie stanu ladowania i komunikatu sukcesu/bledu.
- **Scenariusz 4.3: Komponent `HoldingsTable`**:
  - Renderowanie listy pozycji z prawidlowymi naglowkami i etykietami walorow.
  - Formatowanie kwot zysku/straty (kolorowanie zielony/czerwony w zaleznosci od wartosci).
  - Zwijanie i rozwijanie grup kategorii aktywow.
  - Prawidlowe renderowanie widoku przy pustej liscie pozycji.

---

## 5. Przypadki Brzegowe i Reguly Walidacji

1. **Precyzja zmiennoprzecinkowa JavaScript**:
   - Operacje mnozenia i dzielenia liczb typu `float` (np. `0.1 + 0.2 !== 0.3`) moga powodowac niespelnienie scislych asercji `toBe()`.
   - **Regula**: W testach kalkulacji finansowych nalezy stosowac assercje `toBeCloseTo(expected, numDigits)` (standardowo 2 miejsca po przecinku).
2. **Kalkulacje przy zerowych dzielnikach**:
   - Gdy `totalCostPLN === 0`, wyliczenie `unrealizedProfitPercent` nie moze zwracac `NaN` ani `Infinity` (musi zwracac 0).
   - Gdy `totalPortfolioValue === 0`, udzial pozycji w portfelu `portfolioSharePercent` musi wynosic 0.
3. **Drift czasowy i strefy czasowe**:
   - Wyliczanie okresu inwestycji `investmentPeriodDays` oraz weryfikacja okna czasowego TOTP zaleza od `Date.now()`.
   - **Regula**: W testach TOTP i dat nalezy stosowac `vi.useFakeTimers()` oraz `vi.setSystemTime()` w celu zapewnienia pelnej powtarzalnosci.
4. **Zaleznosc od Canvas w testach UI**:
   - Komponenty korzystajace bezposrednio lub posrednio z `chart.js` / `react-chartjs-2` rzucaja blad w srodowisku happy-dom (`HTMLCanvasElement.getContext('2d') is not implemented`).
   - **Regula**: W pliku setupu testow (`src/test/setup.ts`) nalezy globalnie zamockowac komponenty wykresow (`Doughnut`, `Line`) lub zdefiniowac atrapowa implementacje Canvas context.

---

## 6. Zakres Prac i Wylaczenia z Zakresu

### W zakresie (In Scope)
1. Konfiguracja bibliotek i narzedzi:
   - Instalacja `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `happy-dom`, `@vitest/coverage-v8`.
   - Utworzenie konfiguracji `vitest.config.ts` ze srodowiskiem `happy-dom` i plikiem przygotowawczym `src/test/setup.ts`.
   - Skonfigurowanie skryptow w `package.json`:
     - `"test": "vitest run"`
     - `"test:watch": "vitest"`
     - `"test:coverage": "vitest run --coverage"`
2. Implementacja testow jednostkowych:
   - Testy kalkulatora portfela: `src/services/analytics/__tests__/portfolioCalculations.test.ts`.
   - Testy importera XTB: `src/services/importers/__tests__/XTBImporter.test.ts`.
   - Testy generatora TOTP: `src/utils/__tests__/totp.test.ts`.
3. Implementacja testow integracyjnych:
   - Testy kontekstu portfela: `src/context/__tests__/PortfolioContext.test.tsx`.
   - Testy modalu importu: `src/components/transactions/__tests__/XTBImportModal.test.tsx`.
   - Testy tabeli pozycji: `src/components/holdings/__tests__/HoldingsTable.test.tsx`.
4. Przygotowanie danych testowych (Fixtures / Mock Data):
   - Wzorce wyciagow CSV i arkuszy roboczych XLSX dla XTB.
   - Mocki providerow danych rynkowych i adaptera pamieci lokalnej.
5. Aktualizacja dokumentacji:
   - Dodanie wpisu w `CHANGELOG.md` pod sekcja `[Unreleased]`.
   - Weryfikacja bezblednej kompilacji `npm run build` i testow `npm run test`.

### Poza zakresem (Out of Scope)
1. **Testy End-to-End (Playwright)**: Zaplanowane w dalszych etapach rozwoju interfejsu uzytkownika.
2. **Testy sieciowe ze Stooq na zywo**: Wszelkie testy sieciowe musza dzialac na mockach, aby wyeliminowac flakiness i brak dostepu do internetu w CI.
3. **Potok GitHub Actions CI**: Konfiguracja plikow `.github/workflows/ci.yml` jest zakresem dedykowanego Milestone `1.4.0 CI/CD i automatyzacja wydań`.
4. **Modyfikacja logiki biznesowej**: Zadanie koncentruje sie na weryfikacji istniejacego kodu; zmiany algorytmiczne moga dotyczyc wylacznie usuniecia ewidentnych defektow ujawnionych przez testy.

---

## 7. Analiza Rozwiazan Technologicznych (Solution Evaluation)

Stos technologiczny dla srodowiska testowego zostal okreslony w celach architektury projektu i Issue #2. Ponizej podsumowano uzasadnienie podjetych wyborow:

| Kategoria | Wybrane rozwiazanie | Alternatywa | Uzasadnienie wyboru |
|---|---|---|---|
| **Test Runner** | **Vitest** (v3+) | Jest | Natywna integracja z Vite 6, wspolne przetwarzanie konfiguracji i aliasow modulow, bezposrednie wsparcie dla ESM i TypeScript bez koniecznosci uzywania Babel/ts-jest. Znaczaco krotszy czas uruchomienia i pelna kompatybilnosc API z Jest (`describe`, `it`, `expect`, `vi`). |
| **Srodowisko DOM** | **happy-dom** | jsdom | Znaczaco mniejsze zuzycie pamieci i 2-3x szybszy czas wykonywania testow niz jsdom. W pelni wystarczajacy dla aplikacji React 19 testowanej z `@testing-library/react`. Brakujace API (Canvas) latwo zamockowac w `setup.ts`. |
| **Biblioteka testow UI** | **React Testing Library** (@testing-library/react) | Enzyme (przestarzale), wlasne renderery | Standard branzy dla Reacta, promuje testowanie z perspektywy uzytkownika (User-Centric Testing) zamiast testowania wewnetrznego stanu komponentow. |
| **Raportowanie pokrycia** | **@vitest/coverage-v8** | istanbul | Wbudowany silnik V8 coverage dziala bezposrednio w procesie Node, nie wymaga transformacji kodu zrodlowego, zapewnia wyzsza wydajnosc. |

---

## 8. Rekomendacja Modularyzacyjna (Modularization Recommendation)

**Rekomendacja:** `modularization: not-needed`

**Uzasadnienie:**  
Zadanie INV-01 nie wprowadza nowego bounded contextu, nie zmienia granic domenowych ani nie przeprowadza dekompozycji architektury. Polega na dostarczeniu infrastruktury testowej dla istniejacych serwisow (`services/analytics`, `services/importers`, `services/storage`), narzedzi (`utils/totp`) oraz komponentow UI. Architektura projektu posiada juz czytelny podzial na warstwy zgodny z instrukcjami (`src/services/`, `src/context/`, `src/components/`, `src/types/`). Zadanie nie wymaga uruchamiania procedury `/modularise`.

---

## 9. Ryzyka Techniczne i Strategie Mitygacji

| Ryzyko / Wyzwanie | Prawdopodobienstwo | Wplyw | Strategia mitygacji |
|---|---|---|---|
| **Brak implementacji Canvas w happy-dom** | Wysokie | Sredni | W pliku `src/test/setup.ts` utworzyc mock modulu `react-chartjs-2` (np. zastepujac komponenty `Doughnut` i `Line` prostymi znacznikami `<div data-testid="chart-mock" />`), co eliminuje wywolywanie metod kontekstu 2D. |
| **Web Crypto API w srodowisku testowym** | Srednie | Wysoki | Modul `totp.ts` uzywa `window.crypto.subtle`. W `src/test/setup.ts` nalezy zagwarantowac, ze `globalThis.crypto` wskazuje na pelne Web Crypto API dostarczane przez Node.js (`const { webcrypto } = await import('node:crypto'); Object.defineProperty(globalThis, 'crypto', { value: webcrypto });`). |
| **Niestabilnosc asercji liczb zmiennoprzecinkowych** | Wysokie | Sredni | Konsekwentne stosowanie matchera `expect(value).toBeCloseTo(expected, 2)` w testach kalkulacji finansowych (`portfolioCalculations`). |
| **Zaleznosc od `FileReader` w parserze XTB** | Srednie | Niski | `XTBImporter.parseFile` korzysta z `FileReader`. Klasa ta jest dostepna w happy-dom. Dodatkowo bezposrednio testowac metody przetwarzajace dane tekstowe (`parseCSVText`) oraz skoroszyty (`parseWorkbook`). |
| **Zaleznosci czasowe w testach TOTP** | Srednie | Sredni | Uzycie mechanizmu zegarow wirtualnych Vitest (`vi.useFakeTimers()`, `vi.setSystemTime()`) w celu weryfikacji stalych wektorow testowych RFC 6238. |

---

## 10. Kryteria Akceptacji (Definition of Done)

Zgodnie z wymaganiami zgloszenia Issue #2, zadanie uznaje sie za zrealizowane po spelnieniu nastepujacych warunkow:

- [ ] Zainstalowano i poprawnie skonfigurowano pakiety `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `happy-dom` oraz `@vitest/coverage-v8`.
- [ ] Utworzono plik konfiguracyjny `vitest.config.ts` ze srodowiskiem `happy-dom` oraz plik przygotowawczy `src/test/setup.ts` (z prawidlowym mockowaniem Canvas i Web Crypto).
- [ ] W pliku `package.json` zdefiniowano skrypty: `"test": "vitest run"`, `"test:watch": "vitest"`, `"test:coverage": "vitest run --coverage"`.
- [ ] Zaimplementowano zestaw testow jednostkowych dla `src/services/analytics/portfolioCalculations.ts` pokrywajacych wszystkie glowne metody, stopy zwrotu, przewalutowania FX oraz przypadki brzegowe (pusty portfel, zerowy koszt, dzielenie przez zero).
- [ ] Zaimplementowano zestaw testow jednostkowych dla `src/services/importers/XTBImporter.ts` sprawdzajacych parsowanie plikow CSV i XLSX, mapowanie typow operacji, obsluge bledow i detekcje symboli.
- [ ] Zaimplementowano testy jednostkowe dla `src/utils/totp.ts` sprawdzajace generowanie sekretu, kodow TOTP, weryfikacje z tolerancja czasowa, kody zapasowe i format URL.
- [ ] Zaimplementowano testy integracyjne dla `PortfolioContext.tsx`, `XTBImportModal.tsx` oraz `HoldingsTable.tsx`.
- [ ] Polecenie `npm run test` wykonuje sie bez zadnych bledow (wszystkie testy zielone, kod wyjscia 0).
- [ ] Polecenie `npm run build` kompiluje sie czysto bez bledow TypeScript (`strict: true`).
- [ ] Zaktualizowano plik `CHANGELOG.md` w sekcji `[Unreleased]`.
