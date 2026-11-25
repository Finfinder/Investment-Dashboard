---
name: analyzing-technicals
description: "Implementacja wskaźników technicznych (trend, momentum, volatility, volume), detekcja formacji świecowych i poziomów S/R, wizualizacja OHLC oraz walidacja sygnałów."
---

# Analiza Techniczna

Prowadzi budowę aplikacji do analizy technicznej: od danych OHLCV, przez wskaźniki, formacje i poziomy, po walidację sygnałów oraz wizualizację. Zakres kończy się na opisie i walidacji sygnału technicznego; strategia, execution, sizing, stop-loss, slippage, walk-forward, koszty i deployment należą do `implementing-trading-strategies`.

## Kiedy używać

- Implementacja wskaźników trendu, momentum, volatility, volume, VWAP albo własnych filtrów technicznych.
- Detekcja formacji świecowych, wzorców cenowych, poziomów S/R, trendlines i market structure.
- Budowa wykresów OHLC/świecowych z wolumenem, wskaźnikami, markerami i raportem sygnałów.
- Walidacja technicznego sygnału pod kątem jakości danych, przyczynowości, potwierdzenia i fałszywych trafień.
- Review kodu analizy technicznej pod kątem look-ahead, warmupu, adjusted/raw price mode i multi-timeframe.

**Nie używaj jako zamiennika:** analizy fundamentalnej (`analyzing-fundamentals`), backtestingu i wykonania strategii (`implementing-trading-strategies`), researchu vendorów/bibliotek (`solution-researching`) ani projektowania trwałego magazynu danych (`engineering-databases`).

<principles>

<data-first>
Waliduj dane przed sygnałem: kompletność OHLCV, `high >= max(open, close)`, `low <= min(open, close)`, brak duplikatów świec, brak nieopisanych luk temporalnych, timezone, kalendarz sesji, wolumen oraz minimalną historię dla najdłuższego wskaźnika. Jawnie zdecyduj, czy używasz adjusted, split-adjusted czy raw prices; nie mieszaj `Adjusted Close` z raw `High/Low` bez świadomej normalizacji.
</data-first>

<causal-signals>
Sygnał musi być przyczynowy. Generuj go z poprzedniej zamkniętej świecy albo z eventu zamknięcia świecy; w danych barowych stosuj `shift(1)` dla sygnałów używanych w decyzji na kolejnej świecy. Multi-timeframe alignment może używać wyłącznie zamkniętych świec wyższego interwału, zwykle przez przesunięcie sygnału higher timeframe przed merge z niższym interwałem.
</causal-signals>

<skeptical-signals>
Traktuj sygnały sceptycznie. Wskaźniki lagują, formacje mają istotny failure rate, S/R to strefy prawdopodobieństwa, a nie magiczne linie. Breakout bez wolumenu, kontekstu reżimu albo potwierdzenia struktury rynku jest kandydatem na false positive, nie gotową tezą tradingową.
</skeptical-signals>

<market-context>
Dobieraj narzędzia do reżimu rynku i instrumentu. Trend following, oscylatory, volatility bands, VWAP, volume profile i market structure nie są zamienne; najpierw nazwij reżim i interwał, potem wybierz wskaźniki oraz formacje.
</market-context>

</principles>

## Proces Analizy

```text
Postęp analizy:
- [ ] Krok 1: Zakres i dane
- [ ] Krok 2: Sanity danych
- [ ] Krok 3: Wskaźniki
- [ ] Krok 4: Formacje i S/R
- [ ] Krok 5: Walidacja sygnału
- [ ] Krok 6: Wizualizacja i raport
```

**Krok 1: Zakres i dane**

- Ustal instrument, rynek, sesję handlową, primary timeframe, interwały kontekstowe i cel: trend, momentum, volatility, formacje, S/R albo raport.
- Wybierz źródło danych i zapisz jego ograniczenia: opóźnienia, corporate actions, coverage, timezone, kalendarz i limity API.
- Zdecyduj o price mode: adjusted, split-adjusted albo raw. Wykres, wskaźniki i sygnały muszą używać spójnego trybu albo jawnie opisanej konwersji.
- Jeśli użytkownik oczekuje strategii, zleceń, pozycji, kosztów, stop-loss albo deploymentu live, przekaż definicję sygnału do `implementing-trading-strategies`.

**Krok 2: Sanity danych**

- Sprawdź kolumny OHLCV, typy liczbowe, monotoniczne timestampy, duplikaty, NaN, zero/ujemne ceny, relację `High/Low/Open/Close` i wolumen.
- Rozróżnij oczekiwane luki sesyjne od brakujących świec. Akcje mają weekendy i święta, crypto zwykle działa 24/7, forex ma weekendową przerwę i specyfikę rollover.
- Wymagaj historii dłuższej niż lookback wskaźnika: warmup jest częścią kontraktu, nie kosmetyką. Przy zbyt krótkiej historii degraduj gracefully: krótszy wskaźnik, price action + wolumen albo prośba o więcej danych.
- Zapisz timezone i moment zamknięcia świecy. Bez tego multi-timeframe i daily close mogą generować inne sygnały w różnych środowiskach.

**Krok 3: Wskaźniki**

- Dobierz wskaźniki do reżimu: trend, konsolidacja, breakout, mean reversion, intraday VWAP albo low-liquidity. Nie dokładaj kolejnego oscylatora jako niezależnego potwierdzenia.
- Używaj maksymalnie kilku wskaźników z różnych kategorii: trend, momentum, volatility, volume. Redundancja typu RSI + Stochastic + CCI zwykle tylko potwierdza ten sam szum.
- Dokumentuj parametry, lookback, warmup, price input i expected lag. Wskaźniki są kontekstem i filtrem, nie samodzielną rekomendacją.
- Jeśli potrzebujesz tabel bibliotek, kodu `pandas-ta`/`ta-lib`/`ta`/`tulipy` albo decyzji o reżimie rynku, załaduj `./references/indicators.md`.

**Krok 4: Formacje i S/R**

- Detekcja formacji wymaga kontekstu trendu, wolumenu i poziomu invalidation. Nazwa formacji bez warunku unieważnienia jest opisem wykresu, nie walidowanym sygnałem.
- S/R implementuj jako strefy, np. tolerancja procentowa albo ATR band, a nie pojedynczą cenę. Wicki i fałszywe naruszenia są normalne.
- Breakout traktuj jako kandydat, dopóki nie ma wolumenu, retestu, struktury rynku albo innego potwierdzenia zgodnego z celem analizy.
- Zaawansowane wzorce, takie jak Wyckoff, Volume Profile, Market Structure Break i VWAP, wymagają osobnych danych oraz ostrożnej interpretacji; szczegóły są w `./references/pattern-detection.md`.

**Krok 5: Walidacja sygnału**

- Potwierdź brak look-ahead: sygnał używa zamkniętej świecy, `shift(1)` albo jawnego eventu zamknięcia, a higher timeframe jest przesunięty do ostatniej kompletnej świecy.
- Sprawdź warmup, sample size, false positives, false breakouts, volume confirmation, reżim rynku i stabilność sygnału po zmianie interwału lub parametru.
- Out-of-sample i benchmark traktuj jako granicę jakości sygnału; gdy zaczynasz liczyć zwrot, profit factor, drawdown, koszty, sizing albo zlecenia, przejdź do `implementing-trading-strategies`.
- Nie formułuj rekomendacji inwestycyjnej ani tradingowej. Wynik opisuje reguły sygnału, potwierdzenia, ograniczenia i wymagania dalszej walidacji.

**Krok 6: Wizualizacja i raport**

- Wykres pokazuje OHLC/świece, wolumen, użyte wskaźniki, markery sygnałów, strefy S/R, trendlines oraz zakres danych.
- Raport musi oznaczać źródło danych, timezone, interwał, price mode, warmup, parametry wskaźników i powód odrzucenia sygnałów niezwalidowanych.
- Markery nie mogą sugerować gotowych transakcji, jeśli analiza nie przeszła do skilla strategii. Nazwy typu `signal`, `candidate`, `confirmed` są bezpieczniejsze niż język rekomendacyjny.
- Szczegóły bibliotek i wzorców chartingu są w `./references/visualizations.md`.

## Minimalne Zakazy

- Nie generuj sygnału z bieżącej niedomkniętej świecy ani z higher timeframe, który jeszcze się nie zamknął.
- Nie licz wskaźników i formacji bez warmupu oraz minimalnej historii; nie dopuszczaj `data leakage` przez look-ahead, normalizację po pełnej historii, future joins ani backfill/fill z przyszłości.
- Nie mieszaj `Adjusted Close` z raw `Open/High/Low` bez świadomej decyzji o price mode.
- Nie traktuj formacji bez wolumenu, kontekstu trendu i invalidation jako potwierdzonego sygnału.
- Nie rysuj S/R jako pojedynczej magicznej linii; używaj stref i tolerancji.
- Nie składaj rekomendacji tradingowej, sizingu, stop-loss ani execution planu bez przejścia do `implementing-trading-strategies`.

## Materiały Referencyjne

Ładuj referencje warunkowo, tylko gdy zadanie dotyczy danego obszaru:

- `./references/data-quality-and-timeframes.md` — źródła danych, OHLCV validation, adjusted vs raw, warmup, missing data, crypto/forex i multi-timeframe alignment.
- `./references/indicators.md` — kategorie wskaźników, biblioteki, przykłady kodu, lag, redundancja i dobór do reżimu rynku.
- `./references/pattern-detection.md` — formacje świecowe i cenowe, Bulkowski rates, S/R zones, trendlines, Wyckoff, Volume Profile, MSB, VWAP i invalidation.
- `./references/visualizations.md` — `mplfinance`, `plotly`, `lightweight-charts`, panele OHLC/volume/indicators, markery, timezone i price mode labels.
- `./references/signal-validation.md` — checklisty walidacyjne, no look-ahead, `shift(1)`, false positives, volume confirmation, sample size, OOS, benchmark i granica z backtestingiem.
- `./references/sharp-edges.md` — produkcyjne pułapki: timezone charts, adjusted/raw mismatch, off-by-one, MTF candle close, low liquidity, ultra-krótkie interwały, crypto/forex i false breakouts.

## Checklista Końcowa

```text
- [ ] Dane mają zwalidowane OHLCV, timezone, missing candles, duplikaty i price mode.
- [ ] Historia obejmuje warmup najdłuższego wskaźnika albo wynik degraduje gracefully.
- [ ] Sygnały są przyczynowe: poprzednia zamknięta świeca, shift(1) lub jawny event close.
- [ ] Multi-timeframe używa tylko zamkniętych świec wyższego interwału.
- [ ] Wskaźniki i formacje mają kontekst reżimu, wolumen lub price action oraz invalidation.
- [ ] Wizualizacja pokazuje źródło, interwał, timezone, price mode i ograniczenia sygnału.
- [ ] Output nie zawiera rekomendacji tradingowej ani elementów strategii bez eskalacji.
```

## Powiązane Skille

- `implementing-trading-strategies` — backtesting, execution, koszty, sizing, stop-loss, walk-forward, paper/live i deployment strategii.
- `analyzing-fundamentals` — kontekst fundamentalny dla instrumentów wskazanych przez analizę techniczną.
- `optimizing-frontend` — wydajność interaktywnych wykresów, ciężkich bibliotek chartingowych i renderowania danych.
- `engineering-databases` — modelowanie i indeksowanie historycznych danych OHLCV oraz point-in-time storage.
- `solution-researching` — wybór vendorów danych, bibliotek wskaźników i narzędzi wizualizacji.
