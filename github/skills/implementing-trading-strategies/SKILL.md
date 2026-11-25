---
name: implementing-trading-strategies
description: "Buduje i wdraża strategie handlowe: backtesting, walk-forward optimization, zarządzanie ryzykiem, paper trading i monitoring live."
---

# Implementacja Strategii Handlowych

Prowadzi budowę systemu handlowego od hipotezy do kontrolowanego live tradingu. Aktywny tier zawiera proces i twarde guard rails; szczegółowe pułapki, przykłady kodu, frameworki i checklisty są w `references/`.

## Kiedy używać

- Projektowanie strategii, backtestu, walk-forward optimization, paper tradingu albo live execution.
- Implementacja pipeline'u danych, sygnałów, kosztów transakcyjnych, risk managementu lub monitoringu strategii.
- Review kodu tradingowego pod kątem look-ahead bias, kosztów, overfittingu, OOS i ryzyka execution.
- Koordynacja z analizą techniczną/fundamentalną, backendem execution albo obserwowalnością tradingu.

<principles>

<out-of-sample-required>
Nigdy nie optymalizuj na wszystkich danych. Zanim stroisz parametry, wydziel okresy train/validation/test i trzymaj finalny out-of-sample poza procesem wyboru strategii.
</out-of-sample-required>

<costs-from-first-backtest>
Koszty są częścią strategii, nie późnym dodatkiem. Spread, prowizje, slippage, market impact i capacity check modeluj od pierwszego backtestu; edge znikający po kosztach nie jest edge'em.
</costs-from-first-backtest>

<causality-and-shift>
Backtest respektuje przyczynowość: sygnały pochodzą tylko z danych dostępnych w chwili decyzji. Dla sygnałów barowych używaj `shift(1)` albo event-driven engine; brak shiftu traktuj jak look-ahead bias.
</causality-and-shift>

<walk-forward-before-live>
Parametry muszą przejść walk-forward lub time-series split. Stabilne plateau wyników jest ważniejsze niż izolowany szczyt Sharpe in-sample.
</walk-forward-before-live>

<risk-before-return>
Każda strategia ma stop-loss albo warunek invalidation, limity ekspozycji, position sizing i maksymalny drawdown. Risk management projektuj przed optymalizacją zwrotu.
</risk-before-return>

<paper-first-kill-switch>
Live dopiero po paper tradingu. Przed pierwszym realnym zleceniem istnieją pre-trade checks, kill switch, limity dziennej straty, możliwość flatten all positions i alert operacyjny.
</paper-first-kill-switch>

<drift-monitoring>
Strategia live jest monitorowana pod kątem driftu: rolling Sharpe, drawdown, hit rate, slippage vs backtest, data feed health i zmiana reżimu. Degradacja poza próg zatrzymuje strategię albo wymaga review.
</drift-monitoring>

</principles>

## Proces Implementacji

```text
Postęp:
- [ ] Krok 1: Hipoteza
- [ ] Krok 2: Dane
- [ ] Krok 3: Backtest
- [ ] Krok 4: Koszty
- [ ] Krok 5: Walk-forward / OOS
- [ ] Krok 6: Risk
- [ ] Krok 7: Paper / Live
- [ ] Krok 8: Monitoring
```

**Krok 1: Hipoteza**

- Opisz nieefektywność rynkową, dlaczego istnieje i dlaczego może się utrzymać po kosztach.
- Ustal instrumenty, universe, timeframe, holding period, benchmark i minimalny sample size przed obejrzeniem wyników.
- Jeśli źródłem sygnału są wskaźniki albo fundamentals, deleguj generator sygnału do właściwego skilla, ale zachowaj odpowiedzialność za backtest, koszty i risk.

**Krok 2: Dane**

- Używaj point-in-time data, danych skorygowanych o splity/dywidendy i universe bez survivorship bias.
- Waliduj kompletność, timezone-aware timestamps, corporate actions, delistingi, sesje rynkowe i brak future joins.
- Oddziel dane train/validation/test zanim rozpoczniesz strojenie; vendor, snapshot danych i transformacje wersjonuj.

**Krok 3: Backtest**

- Preferuj event-driven backtest dla decyzji tradingowych; vectorized backtest może służyć tylko do szybkiego screeningu.
- Sygnały barowe muszą używać `shift(1)` albo zamkniętych eventów; rolling indicators potrzebują warmup i nie mogą widzieć świecy wykonania.
- Porównuj z benchmarkiem, buy & hold i prostym baseline'em losowym lub naiwnym, aby oddzielić edge od ekspozycji beta.

**Krok 4: Koszty**

- Modeluj prowizje, spread, slippage, market impact, funding/swap/margin i partial fills zależnie od klasy aktywów.
- Przeprowadź sensitivity check kosztów: strategia powinna przetrwać rozsądnie gorsze założenia spread/slippage.
- Capacity: sprawdź udział w ADV/volume i ogranicz participation rate; zyskowność na małym kapitale nie oznacza skalowalności.

**Krok 5: Walk-forward / OOS**

- Stosuj walk-forward albo `TimeSeriesSplit`; nie używaj grid search na pełnym zbiorze danych.
- Limituj liczbę parametrów i preferuj stabilne zakresy parametrów nad pojedynczym optimum.
- Finalny OOS oceniaj raz po wyborze strategii; jeśli po wyniku OOS stroisz dalej, tworzysz nowy eksperyment.

**Krok 6: Risk**

- Każdy setup ma stop-loss albo invalidation: czas, cena, volatility, zmiana reżimu lub warunek fundamentalny/techniczny.
- Position sizing wynika z ryzyka na trade, volatility, gap risk, korelacji i limitów koncentracji.
- Portfolio ma limity drawdownu, dziennej straty, liczby transakcji, ekspozycji per instrument/sektor i maksymalnego leverage.

**Krok 7: Paper / Live**

- Paper trading trwa co najmniej 2 tygodnie albo pełny cykl sygnałów; dla strategii low-frequency wydłuż go do zebrania reprezentatywnych transakcji.
- Przejście na live zaczyna się małym kapitałem i skalowaniem dopiero po zgodności filli, slippage i metryk z backtestem/paper.
- Live wymaga pre-trade validation, audit logu, obsługi awarii data feedu, kill switcha i procedury ręcznego zatrzymania.

**Krok 8: Monitoring**

- Dashboard obejmuje P&L, exposure, drawdown, rolling Sharpe, hit rate, avg win/loss, slippage vs model i błędy danych.
- Alertuj na drawdown, brak danych, odchylenie slippage, drift metryk > 2σ, serię strat i niezgodność pozycji z brokerem.
- Każdy trade loguj z timestamp, instrumentem, sygnałem, ceną decyzyjną, fill price, kosztami i wersją strategii.

## Minimalne Go/No-Go Criteria

**Go:** hipoteza jest falsyfikowalna, dane są point-in-time, backtest jest event-driven lub shifted, koszty są realistyczne, walk-forward i OOS są dodatnie względem benchmarku, sample size jest reprezentatywny, risk limits są wdrożone, paper trading nie odbiega istotnie od backtestu, a monitoring i kill switch działają.

**No-Go:** brak `shift(1)`, brak kosztów, strojenie na pełnym zbiorze, wyniki tylko na jednym rynku/reżimie, brak stop-loss/invalidation, brak capacity check, paper pominięty, brak kill switcha albo drift live bez procedury zatrzymania.

## Materiały Referencyjne

Ładuj referencje warunkowo, gdy zadanie dotyczy danego obszaru:

- `./references/market-data-and-signals.md` — typy hipotez, wymagania danych, źródła danych, shift sygnałów, indicator lag, stop-loss/invalidation i multi-timeframe.
- `./references/backtesting-and-execution.md` — frameworki backtestowe, `RealisticCosts`, przykład walk-forward, brokerzy API, TWAP/VWAP/IS/POV i capacity check.
- `./references/sharp-edges.md` — szczegółowe pułapki: look-ahead, survivorship bias, gap risk, overfitting, slippage underestimation, indicator lag i antywzorce z backtestu/live.
- `./references/validations.md` — reguły walidacji kodu, regex/checki, deployment checklist, go-live review i kryteria oceny PR.
- `./references/collaboration.md` — kontrakty i eskalacje z `analyzing-technicals`, `analyzing-fundamentals`, `implementing-backend` i `implementing-observability`.

## Antywzorce

| Antywzorzec | Zamiast tego |
| --- | --- |
| Sygnał bez `shift(1)` | Handluj dopiero po danych dostępnych w chwili decyzji. |
| Backtest bez kosztów | Dodaj spread, prowizje, slippage i impact od pierwszego testu. |
| Grid search na całej historii | Walk-forward, OOS i limit parametrów. |
| Jeden rynek i jeden reżim | Testuj wiele okresów, instrumentów i warunków zmienności. |
| Stop-loss bez gap risk | Sizing licz na realny worst-case fill, nie tylko poziom stop. |
| Brak invalidation | Definiuj expiry sygnału, odchylenie ceny i zmianę reżimu. |
| Paper pominięty | Paper-first, mały live rollout i porównanie filli. |
| Monitoring tylko P&L | Monitoruj drift, slippage, dane, pozycje i błędy execution. |

## Checklista Końcowa

```text
- [ ] Frontmatter, dane, kod, parametry i wyniki są wersjonowane.
- [ ] Backtest nie ma look-ahead bias: event-driven albo sygnały shifted o 1 bar.
- [ ] Koszty i capacity są modelowane oraz przetestowane na gorszych założeniach.
- [ ] Walk-forward i finalny OOS są rozdzielone od procesu strojenia.
- [ ] Każdy trade ma stop-loss/invalidation, R:R i risk-based position sizing.
- [ ] Paper trading, kill switch, pre-trade checks i audit log są gotowe przed live.
- [ ] Monitoring driftu i alerty zatrzymujące strategię są zdefiniowane.
- [ ] Przed finalizacją sprawdzono `validations.md` i istotne `sharp-edges.md`.
```

## Powiązane Skille

- `analyzing-technicals` — implementacja wskaźników i generatorów sygnałów technicznych.
- `analyzing-fundamentals` — czynniki fundamentalne, screening i point-in-time fundamentals.
- `implementing-backend` — API, kolejki, execution engine, persystencja i integracje brokerów.
- `implementing-observability` — dashboardy, alerty, logging, tracing i drift monitoring.
- `solution-researching` — research brokerów, frameworków, vendorów danych i narzędzi monitoringu.

Pełne kontrakty współpracy i eskalacje są w `./references/collaboration.md`.
