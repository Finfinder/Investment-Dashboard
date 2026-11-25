# Walidacja Sygnałów Technicznych

Referencja dla sprawdzania jakości sygnału technicznego przed użyciem go jako wejścia do strategii. Ładuj ją, gdy zadanie dotyczy no look-ahead, `shift(1)`, false positives, wolumenu, sample size, out-of-sample, benchmarku albo granicy z backtestingiem.

## Spis Treści

- [Granica Walidacji](#granica-walidacji)
- [No Look-Ahead i Data Leakage](#no-look-ahead-i-data-leakage)
- [False Positives](#false-positives)
- [Volume Confirmation](#volume-confirmation)
- [Sample Size i Stabilność](#sample-size-i-stabilność)
- [Out-of-Sample i Benchmark](#out-of-sample-i-benchmark)
- [Checklisty](#checklisty)

## Granica Walidacji

Ten skill waliduje, czy sygnał techniczny jest przyczynowy, spójny z danymi i sensownie opisany. Nie ocenia jeszcze kompletnej strategii.

Przejdź do `implementing-trading-strategies`, gdy pojawia się:

- pozycja, sizing, stop-loss, take-profit, R:R albo exposure;
- model kosztów, spread, slippage, fill price lub order type;
- backtest performance: CAGR, Sharpe, max drawdown, profit factor;
- walk-forward optimization, paper trading, broker API albo live deployment.

## No Look-Ahead i Data Leakage

Reguła główna: decyzja może używać tylko danych znanych w chwili decyzji.

```python
df["rsi_14"] = calculate_rsi(df["close"], length=14)
df["raw_signal"] = df["rsi_14"] < 30
df["usable_signal"] = df["raw_signal"].shift(1).fillna(False)
```

Red flags:

- sygnał z bieżącej świecy używany do akcji na tej samej świecy;
- `rolling(...).mean()` bez `min_periods` i bez przesunięcia sygnału;
- normalizacja po całej historii przed symulacją sekwencyjną;
- `merge` z danymi fundamentalnymi/makro bez daty publikacji;
- resampling higher timeframe bez przesunięcia do ostatniej zamkniętej świecy;
- backfill warmupu albo brakujących danych z przyszłości.

## False Positives

Sygnał techniczny ma fałszywe trafienia z definicji. Walidacja powinna policzyć lub przynajmniej oznaczyć:

- liczbę kandydatów i liczbę odrzuconych przez filtry;
- przypadki breakout bez follow-through;
- patterny unieważnione przed potwierdzeniem;
- sygnały tylko na low volume albo low liquidity;
- sygnały sprzeczne z higher timeframe lub reżimem volatility;
- wrażliwość na małą zmianę parametru, np. RSI 14 vs 15.

Nie pokazuj wyłącznie udanych przykładów. Raport powinien mieć sekcję failure cases albo przynajmniej `filtered_out`/`invalidated` markers.

## Volume Confirmation

Wolumen nie jest obowiązkowy dla każdego typu analizy, ale breakouty, reversale i formacje cenowe bez wolumenu są słabsze.

Typowe filtry:

```python
df["volume_sma_20"] = df["volume"].rolling(20, min_periods=20).mean()
df["volume_expansion"] = df["volume"].shift(1) > df["volume_sma_20"].shift(1) * 1.5
```

Uwaga: wolumen na FX jest często tick volume albo dane brokera, nie pełny wolumen rynku. W crypto wolumen zależy od giełdy i pary, więc potwierdzenie wolumenowe powinno wskazywać źródło.

## Sample Size i Stabilność

Minimalne progi zależą od celu, ale poniższe heurystyki są przydatne:

| Liczba sygnałów | Interpretacja |
| ---: | --- |
| < 30 | Za mało do wniosków; tylko sanity check. |
| 30-100 | Wstępna walidacja, wysokie ryzyko losowości. |
| 100+ | Lepsza próba, nadal sprawdź reżimy i outliers. |
| 300+ | Możliwa analiza podgrup, ale pilnuj data leakage. |

Sprawdź stabilność po podziale na okresy, instrumenty, reżimy volatility i interwały. Sygnał działający tylko w jednym małym wycinku danych jest hipotezą, nie regułą.

## Out-of-Sample i Benchmark

Walidacja OOS dla sygnału oznacza, że definicja sygnału nie została dobrana na tym samym fragmencie danych, na którym oceniasz jego jakość.

- Podziel dane chronologicznie: train/design -> validation/OOS.
- Nie wybieraj parametrów po obejrzeniu OOS.
- Porównaj częstotliwość i jakość sygnału z prostym benchmarkiem kontekstu, np. trend rynku, buy-and-hold lub losowy sygnał o tej samej częstotliwości.
- Jeśli zaczynasz oceniać zwroty po kosztach, trade count, turnover i drawdown, przenieś pracę do `implementing-trading-strategies`.

## Checklisty

### Walidacja Przyczynowości

```text
- [ ] Sygnał używa zamkniętej świecy albo jawnego eventu close.
- [ ] Sygnały barowe są przesunięte przez shift(1), jeśli decyzja jest na kolejnej świecy.
- [ ] Higher timeframe jest przesunięty do ostatniej zamkniętej świecy.
- [ ] Warmup i NaN nie są backfillowane z przyszłości.
- [ ] Join danych zewnętrznych używa daty dostępności informacji.
```

### Walidacja Jakości Sygnału

```text
- [ ] Sygnał ma zdefiniowane warunki candidate, confirmed, invalidated i filtered_out.
- [ ] Breakouty/reversale mają wolumen lub jawny powód braku filtra wolumenowego.
- [ ] Raport pokazuje false positives i failure cases.
- [ ] Sample size jest wystarczający albo ograniczenie jest jawne.
- [ ] OOS/benchmark nie zostały użyte do strojenia definicji sygnału.
- [ ] Wynik pozostaje analizą sygnału, nie rekomendacją transakcyjną.
```
