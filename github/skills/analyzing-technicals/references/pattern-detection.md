# Detekcja Formacji i Poziomów

Referencja dla formacji świecowych, wzorców cenowych, poziomów wsparcia/oporu i zaawansowanych struktur rynku. Ładuj ją, gdy zadanie dotyczy detekcji patternów, Bulkowski rates, S/R zones, trendlines, Wyckoff, Volume Profile, Market Structure Break albo VWAP.

## Spis Treści

- [Formacje Świecowe](#formacje-świecowe)
- [Wzorce Cenowe](#wzorce-cenowe)
- [Bulkowski Rates](#bulkowski-rates)
- [S/R Zones i Trendlines](#sr-zones-i-trendlines)
- [Zaawansowane Wzorce](#zaawansowane-wzorce)
- [Invalidation i Failure](#invalidation-i-failure)
- [Checklista](#checklista)

## Formacje Świecowe

Typowe formacje: Doji, Hammer, Shooting Star, Engulfing, Morning/Evening Star, Three White Soldiers, Harami, Piercing Line. TA-Lib ma funkcje `CDL*`, ale wynik biblioteki to kandydat, nie prawda rynkowa.

Reguły implementacji:

- formacja świecowa wymaga kontekstu trendu, np. hammer po spadku ma inne znaczenie niż hammer w środku konsolidacji;
- rozmiar korpusu i cienia normalizuj przez ATR, zakres świecy albo procent ceny;
- dodaj filtr wolumenu lub struktury, jeśli formacja ma generować sygnał;
- zapisuj invalidation: poziom, czas albo warunek, po którym formacja przestaje obowiązywać.

## Wzorce Cenowe

Wzorce cenowe obejmują Head & Shoulders, Double Top/Bottom, Triangle, Flag, Pennant, Cup & Handle, Rectangle, Wedge i Channel.

Detekcja zwykle wymaga:

- swing highs/lows przez peak/trough albo fractal pivots;
- minimalnej liczby punktów i tolerancji geometrii;
- limitu czasu trwania patternu;
- relacji wolumenu do impulsu i konsolidacji;
- invalidation po wybiciu w przeciwną stronę albo po przekroczeniu czasu/rozmiaru.

Pattern morphing jest normalne: bull flag może stać się descending channel, a triangle może przejść w rectangle. Algorytm musi umieć porzucić stary label.

## Bulkowski Rates

Historyczne statystyki formacji, często kojarzone z badaniami Bulkowskiego, pokazują rozkłady, a nie gwarancje. Traktuj je jako sanity check oczekiwań.

| Formacja | Orientacyjny success rate | Uwaga implementacyjna |
| --- | ---: | --- |
| Head & Shoulders | ~63% | Wymaga wolumenu i jasnej neckline. |
| Double Bottom | ~65% | Lepsze po extended downtrendzie i z potwierdzeniem. |
| Cup & Handle | ~65% | Handle powinien mieć ograniczoną głębokość. |
| Bull Flag | ~63% | Wymaga silnego impulsu przed flagą. |
| Symmetric Triangle | ~54% | Wysoki failure rate; nie przeceniaj kierunku wybicia. |

W raporcie pisz: `historycznie pattern ma istotny failure rate`, nie `pattern jest skuteczny`. Jeśli zaczynasz liczyć wynik strategii z tych statystyk, przejdź do `implementing-trading-strategies`.

## S/R Zones i Trendlines

S/R to strefa prawdopodobieństwa. Implementuj poziomy jako pasmo tolerancji, np. procent ceny, `0.5 * ATR` albo przedział kwantylowy świec.

```python
def sr_zone(level, atr, multiplier=0.5):
    width = atr * multiplier
    return {"lower": level - width, "upper": level + width}
```

Reguły:

- licz touches z wagą świeżości, wolumenu i reakcji ceny;
- deduplikuj bliskie poziomy, aby wykres nie zamienił się w siatkę linii;
- stare poziomy wygaszaj, jeśli rynek ich nie respektuje;
- trendline wymaga co najmniej dwóch, a lepiej trzech istotnych punktów i tolerancji;
- Fibonacci traktuj jako obserwowany poziom uczestników, nie matematyczną gwarancję.

## Zaawansowane Wzorce

| Wzorzec | Co wymaga | Uwaga |
| --- | --- | --- |
| Wyckoff | Etapy PS, SC, AR, ST, Spring, Test, SOS i wolumen. | Dużo subiektywności; dobrze nadaje się do raportu, trudniej do automatu. |
| Volume Profile | Dane wolumen-cena, binning, POC, VAH/VAL. | Na low liquidity profile bywa artefaktem kilku transakcji. |
| Market Structure Break | HH/HL -> LH/LL lub odwrotnie. | Wymaga stabilnej definicji swingów. |
| VWAP / Anchored VWAP | Intraday/session data i poprawny timestamp sesji. | Uważaj na timezone i sesje częściowe. |
| Failed breakout | Poziom, wolumen, follow-through i szybki powrót do strefy. | Failure jest informacją o invalidation poprzedniego scenariusza. |

## Invalidation i Failure

Każdy pattern ma warunek unieważnienia:

- poziom ceny: powrót pod/powyżej strefy, złamanie neckline, utrata swing low/high;
- czas: brak follow-through po N świecach;
- rozmiar: konsolidacja za głęboka lub zbyt długa względem impulsu;
- wolumen: wybicie bez ekspansji wolumenu albo z szybkim zanikiem;
- struktura: nowy swing negujący założony kierunek.

Nieudany pattern bywa silnym sygnałem zmiany oczekiwań, ale nadal jest tylko kandydatem wymagającym walidacji. Nie zamieniaj go automatycznie w rekomendację przeciwnego kierunku.

## Checklista

```text
- [ ] Pattern ma definicję matematyczną, tolerancje i minimalną liczbę punktów.
- [ ] Formacja jest interpretowana w kontekście trendu, wolumenu i interwału.
- [ ] S/R są strefami z tolerancją, recency weighting i deduplikacją.
- [ ] Trendlines i swing points mają stabilny algorytm.
- [ ] Bulkowski rates są opisane jako historyczne failure rates, nie gwarancje.
- [ ] Każda formacja ma invalidation level/time/structure.
- [ ] Zaawansowane wzorce mają wymagane dane i jawne caveats.
```
