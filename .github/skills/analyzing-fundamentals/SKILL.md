---
name: analyzing-fundamentals
description: "Tworzy systemy analizy fundamentalnej: wskaźniki (wycena, rentowność, płynność, zadłużenie), modele DCF/DDM, wrażliwość i raporty inwestycyjne."
---

# Analiza Fundamentalna

Prowadzi budowę aplikacji do analizy fundamentalnej spółek i rynków finansowych: od danych źródłowych, przez wskaźniki i wycenę, po scenariusze i raport. Uzupełnia inne skille finansowe; nie zastępuje researchu źródeł danych, audytu filingów ani profesjonalnej odpowiedzialności inwestycyjnej.

## Kiedy używać

- Projektowanie systemów pobierających i walidujących dane finansowe spółek, sektorów albo rynków.
- Implementacja wskaźników fundamentalnych, screeningu value/quality/growth/dividend i porównań peer group.
- Budowa modeli DCF, DDM, comparable companies, residual income, SOTP albo wariantów dla ujemnych FCF/earnings.
- Generowanie raportów analitycznych z założeniami, scenariuszami, ryzykami i walidacją modelu.
- Review aplikacji fundamentalnej pod kątem jakości danych, biasów, walut, jednostek i odpowiedzialności finansowej.

**Nie używaj jako zamiennika:** analizy technicznej (`analyzing-technicals`), backtestingu i execution strategii (`implementing-trading-strategies`), researchu vendorów danych (`solution-researching`) ani projektowania magazynu danych (`engineering-databases`).

<principles>

<financial-responsibility>
Nie generuj rekomendacji Buy/Hold/Sell ani jednoznacznej porady inwestycyjnej bez jawnych założeń, źródeł danych, filing dates, scenariuszy bull/base/bear, ryzyk, horyzontu, marginesu bezpieczeństwa i wskazania ograniczeń modelu. Jeśli wynik zawiera rekomendacyjny język, przedstaw go jako rezultat modelu przy określonych założeniach, nie jako poradę dla użytkownika.
</financial-responsibility>

<data-quality-first>
Wycena jest tak dobra jak dane. Zawsze weryfikuj źródło, datę publikacji filingu, kompletność okresów, standard rachunkowości GAAP/IFRS, spójność bilansu i cash flow, walutę, jednostki oraz to, czy analiza historyczna używa danych point-in-time bez survivorship i look-ahead bias.
</data-quality-first>

<industry-context>
Wskaźniki i mnożniki interpretuj w kontekście branży, regionu, cap size i cyklu gospodarczego. Peer group z innej branży lub regionu wymaga jawnego uzasadnienia i testu wpływu na mediany mnożników.
</industry-context>

<margin-of-safety>
Wartość wewnętrzna jest zakresem, nie pojedynczą liczbą. Preferuj konserwatywne założenia, sanity checki WACC/terminal value/growth, scenariusze i margines bezpieczeństwa zamiast precyzji ukrywającej niepewność.
</margin-of-safety>

</principles>

## Proces Analizy

```text
Postęp:
- [ ] Krok 1: Zakres
- [ ] Krok 2: Dane
- [ ] Krok 3: Wskaźniki
- [ ] Krok 4: Wycena
- [ ] Krok 5: Wrażliwość i scenariusze
- [ ] Krok 6: Raport
```

**Krok 1: Zakres**

- Ustal cel: screening, deep-dive wycena, peer comparison, analiza sektorowa, raport inwestycyjny albo walidacja istniejącego modelu.
- Zdefiniuj universe, branżę, region, cap size, horyzont, benchmark, standard rachunkowości i wymagany poziom dowodów.
- Jeśli zadanie wymaga wyboru vendorów, API albo danych alternatywnych, załaduj `solution-researching` i wróć z ustalonym źródłem.

**Krok 2: Dane**

- Pobieraj minimum 5 lat sprawozdań: Income Statement, Balance Sheet, Cash Flow Statement; dla kwartalnych analiz zachowuj filing date.
- Waliduj kompletność, waluty, jednostki, corporate actions, restatements, GAAP/IFRS i tożsamość `Assets = Liabilities + Equity`.
- Przy backtestach lub screeningu historycznym używaj składu universe i danych dostępnych na daną datę, nie dzisiejszych danych po rewizjach.

**Krok 3: Wskaźniki**

- Licz wskaźniki wyceny, rentowności, płynności, zadłużenia, efektywności, jakości zysku, growth i dywidendowe.
- Dobieraj wskaźniki branżowo: banki, REIT-y, utilities, tech/growth i spółki cykliczne mają inne miary bazowe.
- Screening dokumentuj jako pipeline: universe -> filtry -> rank -> sanity checks -> output z uzasadnieniem progów.

**Krok 4: Wycena**

- Wybierz modele adekwatne do spółki: DCF, DDM, Comparable Companies, Precedent Transactions, SOTP albo Residual Income.
- DCF wymaga sanity checków WACC, terminal growth (`g < r`), terminal value, reinvestment, marż i udziału wartości terminalnej.
- Dla ujemnych FCF/earnings nie wymuszaj klasycznego DCF/P/E; rozważ revenue-based DCF, EV/Sales, normalized mid-cycle earnings albo residual income.

**Krok 5: Wrażliwość i scenariusze**

- Przygotuj macierz wrażliwości co najmniej dla WACC i terminal growth; pokaż, jak zmienia się fair value i margines bezpieczeństwa.
- Modeluj bull/base/bear z odrębnymi założeniami przychodów, marż, capex, kosztu kapitału i ryzyk.
- Dla modeli o wysokiej niepewności użyj stress testów, Monte Carlo albo retrospektywnej walidacji na danych historycznych.

**Krok 6: Raport**

- Raport zawiera tezę, źródła danych, daty filingów, metodologię, wskaźniki, wycenę, scenariusze, ryzyka, katalizatory, ograniczenia i horyzont.
- Każda rekomendacyjna konkluzja wymaga scenariuszy, ryzyk, marginesu bezpieczeństwa i jawnego statusu: wynik modelu, nie porada inwestycyjna.
- Jeśli raport ma format PDF/Excel/HTML, traktuj warstwę prezentacji jako pochodną modelu i waliduj zgodność danych z tabelami źródłowymi.

## Minimalne Zakazy

- Nie akceptuj DCF bez sanity checków WACC, terminal value i warunku `terminal growth < discount rate`.
- Nie buduj peer group z innej branży, regionu albo skali bez uzasadnienia i analizy wpływu na mnożniki.
- Nie formułuj rekomendacji bez scenariuszy, ryzyk, horyzontu, źródeł danych i marginesu bezpieczeństwa.
- Nie ignoruj ujemnych FCF/earnings ani jakości zysku; dobierz model do ekonomiki spółki.
- Nie mieszaj walut, jednostek, okresów raportowania ani standardów GAAP/IFRS bez normalizacji.
- Nie używaj danych przyszłych, zrewidowanych po czasie albo dzisiejszego universe w analizie historycznej (data leakage).

## Materiały Referencyjne

Ładuj referencje warunkowo, gdy zadanie dotyczy danego obszaru:

- `./references/data-quality-and-sources.md` — źródła danych, filing dates, point-in-time, waluty, jednostki, GAAP/IFRS i walidacja kompletności.
- `./references/financial-ratios-and-screening.md` — kategorie wskaźników, progi, interpretacje, różnice branżowe i pipeline screeningu.
- `./references/valuation-models.md` — DCF, DDM, comparable companies, precedent transactions, SOTP, residual income, WACC, terminal value i ujemne FCF/earnings.
- `./references/sensitivity-and-scenarios.md` — macierze wrażliwości, bull/base/bear, Monte Carlo, stress testing i retrospektywna walidacja modelu.
- `./references/reporting-and-validation.md` — struktura raportu, szablony Jinja/PDF/Excel, anti-patterny, severity walidacji i eskalacje.
- `./references/domain-variants.md` — banki, REIT-y, utilities, tech/growth, cykliczne spółki, cross-border valuation, IFRS vs GAAP i waluty.
- `./references/sharp-edges.md` — produkcyjne pułapki: WACC, Non-GAAP, peer bias, earnings management, waluty, yfinance gaps, filing delay i Monte Carlo distributions.

## Checklista Końcowa

```text
- [ ] Źródła, filing dates, waluty, jednostki i standard rachunkowości są zapisane przy danych.
- [ ] Bilans, cash flow, kompletność okresów i point-in-time availability zostały zwalidowane.
- [ ] Wskaźniki są dobrane do branży i porównane z właściwą peer group.
- [ ] Modele wyceny mają sanity checki, alternatywy dla ujemnych FCF/earnings i uzasadnione parametry.
- [ ] Wrażliwość, scenariusze, ryzyka i margines bezpieczeństwa są częścią wyniku.
- [ ] Raport rozróżnia rezultat modelu od porady inwestycyjnej.
```

## Powiązane Skille

- `analyzing-technicals` — timing wejścia/wyjścia i kontekst trendu po analizie fundamentalnej.
- `implementing-trading-strategies` — backtesting, execution, koszty, risk management i strategie oparte na czynnikach fundamentalnych.
- `engineering-databases` — modelowanie, indeksowanie i audytowalne przechowywanie danych finansowych point-in-time.
- `solution-researching` — research vendorów danych, bibliotek, API i narzędzi wyceny.
- `write-docs` — dopracowanie raportów, dokumentacji metodologii i materiałów dla odbiorców nietechnicznych.
