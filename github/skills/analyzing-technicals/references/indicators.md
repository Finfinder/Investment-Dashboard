# Wskaźniki Techniczne

Referencja dla implementacji i interpretacji wskaźników technicznych. Ładuj ją, gdy zadanie dotyczy wyboru wskaźników, bibliotek, przykładowego kodu, opóźnienia, redundancji albo dopasowania do reżimu rynku.

## Spis Treści

- [Kategorie Wskaźników](#kategorie-wskaźników)
- [Biblioteki](#biblioteki)
- [Przykłady Kodu](#przykłady-kodu)
- [Indicator Lag](#indicator-lag)
- [Redundancja](#redundancja)
- [Dobór do Reżimu](#dobór-do-reżimu)
- [Checklista](#checklista)

## Kategorie Wskaźników

| Kategoria | Przykłady | Użycie |
| --- | --- | --- |
| Trend | SMA, EMA, DEMA, TEMA, ADX | Kierunek i filtr reżimu. |
| Momentum | RSI, MACD, Stochastic, ROC, CCI | Siła ruchu, dywergencje, wyczerpanie. |
| Volatility | Bollinger Bands, ATR, Keltner, Donchian | Zmienność, zakres, breakout context. |
| Volume | OBV, MFI, A/D Line, volume SMA | Potwierdzenie ruchu, akumulacja/dystrybucja. |
| Intraday benchmark | VWAP, anchored VWAP | Kontekst sesji, institutional benchmark. |
| Breadth / market internals | advance/decline, new highs/lows | Szerokość rynku, gdy dane są dostępne. |

Wskaźniki z tej samej kategorii zwykle nie są niezależnym potwierdzeniem. RSI, Stochastic i CCI to różne widoki momentum, nie trzy osobne źródła prawdy.

## Biblioteki

| Biblioteka | Mocne strony | Uważaj na |
| --- | --- | --- |
| `pandas-ta` | Pure Python, dużo wskaźników, wygodne `DataFrame.ta`. | Nazwy kolumn i parametry trzeba stabilizować w kontrakcie danych. |
| `ta-lib` | Szybkie funkcje C, `CDL*` dla świec. | Instalacja systemowa bywa trudna; różnice platformowe. |
| `ta` | Prosty API, dobry start. | Mniejszy zakres wskaźników niż `pandas-ta`/TA-Lib. |
| `tulipy` | Lekki C wrapper, szybkie obliczenia. | Mniej popularny ekosystem i ograniczony zestaw wskaźników. |
| Własna implementacja | Pełna kontrola i audytowalność. | Testy regresyjne są obowiązkowe, szczególnie dla warmupu i NaN. |

Przy wyborze biblioteki sprawdź licencję, wsparcie platformy, dokładność względem referencji, nazwy outputów i zachowanie przy NaN/warmup.

## Przykłady Kodu

`pandas-ta`:

```python
import pandas_ta as ta

df.ta.sma(length=20, append=True)
df.ta.rsi(length=14, append=True)
df.ta.macd(fast=12, slow=26, signal=9, append=True)
df.ta.bbands(length=20, std=2, append=True)
```

Własny sygnał z przyczynowym przesunięciem:

```python
df["sma_50"] = df["close"].rolling(50, min_periods=50).mean()
df["above_sma_50"] = (df["close"].shift(1) > df["sma_50"].shift(1))
```

Przy porównaniu bibliotek trzymaj fixture z kilkoma znanymi świecami i oczekiwanymi wartościami. Różnice zaokrągleń są normalne, ale różne definicje wskaźnika muszą być opisane.

## Indicator Lag

Wskaźnik jest transformacją ceny lub wolumenu, więc zwykle reaguje po fakcie.

| Wskaźnik | Typowe opóźnienie interpretacyjne | Bezpieczna rola |
| --- | --- | --- |
| SMA(200) | Bardzo duże; filtr długiego trendu. | Kontekst trendu, nie timing. |
| SMA/EMA cross | Opóźnia zmianę trendu, szczególnie w konsolidacji. | Filtr lub potwierdzenie, nie samodzielny sygnał. |
| MACD | MA od MA; crossover bywa spóźniony. | Momentum context, dywergencje z ostrożnością. |
| RSI | Mniejszy lag, ale w trendzie może długo pozostać wykupiony/wyprzedany. | Warunek reżimu lub ostrzeżenie, nie timing. |
| ATR | Opisuje zmienność historyczną. | Tolerancje, bands, normalizacja poziomów. |

Nie opisuj wskaźnika jako generatora rekomendacji. W outputach używaj języka: `kontekst`, `filtr`, `potwierdzenie`, `kandydat sygnału`, `warunek odrzucenia`.

## Redundancja

Redundancja zwiększa pewność pozorną. Zamiast dokładać kolejne wskaźniki, sprawdź, czy nowe źródło wnosi inną informację:

- price action: struktura HH/HL, LH/LL, breakout, retest;
- volume: wolumen względem średniej, OBV, MFI, volume profile;
- volatility: ATR, Bollinger width, range expansion;
- market context: indeks, sektor, breadth, wyższy interwał;
- instrument-specific: sesja, płynność, spread, event calendar.

Dobry zestaw dla aplikacji zwykle ma 2-4 elementy: filtr reżimu, miarę momentum/volatility, potwierdzenie wolumenowe i price action.

## Dobór do Reżimu

| Reżim | Preferuj | Uważaj na |
| --- | --- | --- |
| Silny trend | MA/ADX, pullback do średniej, structure break. | Oscylatory mogą długo pokazywać wykupienie. |
| Konsolidacja | Oscylatory, bands, mean reversion, S/R zones. | MA cross generuje dużo false positives. |
| Breakout | Donchian, Bollinger/Keltner squeeze, volume expansion, ATR. | Breakout bez wolumenu i follow-through. |
| Intraday | VWAP, volume profile, session ranges. | Klasyczne daily indicators na szumie mikrostruktury. |
| Low liquidity | Proste price action, filtry ADV, szerokie tolerancje. | Volume indicators i squeeze często są artefaktem. |

## Checklista

```text
- [ ] Wskaźniki są dobrane do reżimu i instrumentu.
- [ ] Parametry, input price, warmup i nazwy outputów są jawne.
- [ ] Sygnały używają shift(1) albo eventu zamknięcia świecy.
- [ ] Zestaw nie duplikuje tej samej kategorii sygnału bez powodu.
- [ ] Indicator lag jest opisany w interpretacji, nie ukryty.
- [ ] Biblioteka została sprawdzona pod kątem NaN, warmupu i instalacji.
```
