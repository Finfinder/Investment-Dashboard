# Dane Rynkowe i Sygnały

Referencja dla hipotez, jakości danych, generowania sygnałów i reguł stop-loss/invalidation w systemach handlowych. Czytaj ją, gdy aktywny proces dotyka danych, signal engineering, multi-timeframe albo źródeł danych.

## Spis Treści

- [Typy Hipotez](#typy-hipotez)
- [Wymagania Danych](#wymagania-danych)
- [Źródła Danych](#źródła-danych)
- [Shift Sygnałów i Przyczynowość](#shift-sygnałów-i-przyczynowość)
- [Indicator Lag](#indicator-lag)
- [Stop-Loss i Invalidation](#stop-loss-i-invalidation)
- [Multi-Timeframe](#multi-timeframe)
- [Checklista](#checklista)

## Typy Hipotez

| Typ | Opis | Przykłady | Ryzyko walidacyjne |
| --- | --- | --- | --- |
| Mikrostrukturalna | Nierównowagi order flow, bid-ask, queue priority. | Market making, order flow imbalance. | Latencja i fill model dominują wynik. |
| Behawioralna | Overreaction, anchoring, herding. | Momentum, mean reversion po newsach. | Edge może zanikać po zmianie reżimu. |
| Fundamentalna | Niedoszacowanie jakości, wartości lub surprise. | Value, quality, earnings drift. | Point-in-time fundamentals i reporting delay. |
| Techniczna | Momentum, breakout, mean reversion. | Trend following, Bollinger bounce. | Indicator lag i fałszywy timing. |
| Statystyczna | Relacje między instrumentami lub czynnikami. | Pairs trading, factor spread. | Cointegration decay i multiple testing. |
| Zdarzeniowa | Corporate actions, makro, earnings. | Event-driven news trading. | Gap risk, liquidity i kalendarz publikacji. |

Hipoteza powinna być falsyfikowalna: określ, kiedy uznasz, że edge nie istnieje. Zapisz universe, timeframe, holding period, benchmark i koszt wykonania przed obejrzeniem wyników.

## Wymagania Danych

- Dane cenowe muszą być skorygowane o splity i dywidendy albo jawnie oznaczone jako split-only/unadjusted.
- Universe musi być point-in-time: skład indeksu, delistingi i instrumenty historycznie dostępne w danym dniu.
- Timestampy są timezone-aware i sprowadzone do UTC lub jawnie mapowane na kalendarz sesji rynku.
- Fundamentalne i makro dane wymagają daty publikacji oraz opóźnienia dostępności, nie tylko okresu sprawozdawczego.
- OHLCV wymaga walidacji luk, duplikatów świec, wolumenu zerowego, corporate actions i sesji świątecznych.
- Snapshot danych, vendor, zakres dat, transformacje i wersja kodu muszą być odtwarzalne.

## Źródła Danych

| Źródło | Użyj gdy | Uwaga |
| --- | --- | --- |
| Sharadar / Nasdaq Data Link | Potrzebne survivorship-bias-free equities i fundamentals. | Dobre dla poważniejszych backtestów equity. |
| Bloomberg / Refinitiv | Instytucjonalne dane multi-asset. | Koszt i licencje wymagają osobnego uzasadnienia. |
| Polygon.io / Alpaca Data | Market data API dla equities i paper/live prototypów. | Sprawdź opóźnienia, limity i corporate actions. |
| `yfinance` | Szybki research lub demo bez rygoru produkcyjnego. | Nie traktuj jako źródła finalnej walidacji. |
| CCXT / giełdy crypto | Crypto OHLCV i execution. | Uwzględnij maker/taker fees, funding i 24/7 session model. |
| FRED / oficjalne makro | Dane makro i stopy. | Używaj release calendar i revisions, jeśli strategia reaguje na publikacje. |

## Shift Sygnałów i Przyczynowość

Sygnał może używać tylko danych znanych w chwili decyzji. Jeśli sygnał powstaje na zamknięciu świecy, pozycja może wejść najwcześniej na następnej świecy albo przez event fill po zamknięciu.

```python
signal = prices["close"].pct_change(20)
positions = (signal.shift(1) > 0).astype(int)
```

Niepoprawny wzorzec:

```python
signal = prices["close"].pct_change(20)
positions = (signal > 0).astype(int)
```

Reguły:

- Rolling indicators wymagają warmup; nie wypełniaj warmup wartościami z przyszłości.
- Cross-sectional ranks są liczone na universe dostępne w danym dniu, nie na dzisiejszy skład indeksu.
- `merge` z fundamentals używa daty dostępności i `merge_asof`/point-in-time join.
- Feature engineering nie może normalizować po pełnej historii, jeśli strategia ma działać sekwencyjnie.

## Indicator Lag

Lagging indicators, takie jak MA, MACD i część oscylatorów, zwykle nie są dobrym samodzielnym triggerem entry. Traktuj je jako filtr reżimu lub kontekst, np. bierz sygnały long tylko, gdy cena jest powyżej SMA(200).

- Dywergencja RSI/MACD nie jest timingiem wejścia. Wymagaj potwierdzenia przez strukturę ceny, wolumen albo break poziomu.
- Im dłuższy lookback, tym większe opóźnienie reakcji; backtest musi oddać realny moment, w którym wskaźnik był znany.
- Lag dokumentuj przy strategiach opartych na wskaźnikach, bo inaczej łatwo porównać sygnał z ceną, której jeszcze nie można było znać.

## Stop-Loss i Invalidation

Każdy sygnał powinien mieć zasady opuszczenia pozycji, zanim powstanie backtest:

| Mechanizm | Kiedy używać | Uwaga |
| --- | --- | --- |
| ATR-based stop | Zmienność różni się między instrumentami. | Sizing opiera się na dystansie stopu. |
| Structure-based stop | Setup zależy od poziomów technicznych. | Stop za swing high/low lub poziomem invalidation. |
| Fixed percent stop | Proste strategie i szybki baseline. | Może ignorować zmienność instrumentu. |
| Time stop | Edge działa tylko krótko po sygnale. | Po upływie czasu sygnał wygasa. |
| Regime invalidation | Strategia zależy od trendu/volatility/liquidity. | Zmiana reżimu zamyka lub blokuje wejście. |

Gap risk oznacza, że stop może wykonać się gorzej niż poziom stop-loss. Position sizing ma używać worst-case fill lub historycznego percentyla gapów, nie tylko odległości do stopu.

## Multi-Timeframe

- Wyższy interwał jest filtrem kontekstu, nie źródłem przyszłych danych.
- Przy resamplingu używaj zamkniętych świec wyższego interwału i shiftuj wynik względem niższego interwału.
- Sygnał z 4H nie powinien używać niezamkniętej świecy daily.
- Multi-timeframe zwiększa liczbę warunków; waliduj, czy poprawia robustness, a nie tylko dopasowanie in-sample.

## Checklista

```text
- [ ] Hipoteza opisuje źródło edge i warunek falsyfikacji.
- [ ] Universe jest point-in-time i bez survivorship bias.
- [ ] Dane są adjusted albo tryb korekty jest jawnie opisany.
- [ ] Timestampy, sesje i opóźnienia publikacji danych są poprawne.
- [ ] Sygnały są shifted albo generowane event-driven.
- [ ] Stop-loss, invalidation i gap risk są zdefiniowane przed backtestem.
- [ ] Multi-timeframe używa zamkniętych świec i nie wprowadza look-ahead.
```
