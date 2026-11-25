# Backtesting i Execution

Referencja dla wyboru frameworka backtestowego, modelowania kosztów, walk-forward optimization, brokerów API, algorytmów wykonawczych i capacity check. Czytaj ją, gdy aktywny proces przechodzi od danych/sygnałów do testu, paper albo live.

## Spis Treści

- [Frameworki Backtestowe](#frameworki-backtestowe)
- [Event-Driven vs Vectorized](#event-driven-vs-vectorized)
- [Model Kosztów `RealisticCosts`](#model-kosztów-realisticcosts)
- [Walk-Forward Przykład](#walk-forward-przykład)
- [Brokerzy API](#brokerzy-api)
- [Execution Algorithms](#execution-algorithms)
- [Capacity Check](#capacity-check)
- [Paper-to-Live Rollout](#paper-to-live-rollout)
- [Checklista](#checklista)

## Frameworki Backtestowe

| Framework | Charakterystyka | Użyj gdy | Uważaj gdy |
| --- | --- | --- | --- |
| `backtesting.py` | Lekki, prosty API, szybki start. | Prosty research i strategie OHLCV. | Ograniczony model execution. |
| `vectorbt` | Wektoryzowany, bardzo szybki, NumPy-native. | Screening parametrów i szybkie porównania. | Nie zastępuje event-driven validation przed live. |
| `backtrader` | Dojrzały event-driven backtester, broker integrations. | Potrzebny realistyczniejszy fill/order model. | Większy narzut i starszy styl API. |
| `zipline` | Event-driven, Quantopian heritage. | Legacy pipeline lub istniejący kod Zipline. | Maintenance mode i zależności. |
| QuantConnect/Lean | Pełny engine multi-asset, data + execution simulation. | Strategia wymaga rozbudowanego środowiska backtest/live. | Vendor/platform lock-in i złożoność. |

## Event-Driven vs Vectorized

Vectorized backtest jest dobry do screeningu, ale finalna walidacja musi modelować kolejność zdarzeń, fill timing, koszty i constraints wykonania.

```text
Szybki research: vectorized screening -> odrzucenie słabych wariantów.
Walidacja: event-driven backtest -> fill model -> koszty -> risk -> OOS.
Przed live: paper trading -> zgodność filli i slippage -> mały rollout.
```

Czerwona flaga: Sharpe lub CAGR spada o ponad 20-30% między vectorized a event-driven. To zwykle oznacza nierealistyczny timing, koszty lub fill model.

## Model Kosztów `RealisticCosts`

Model kosztów musi istnieć od pierwszego backtestu. Poniższy wariant jest equity-focused i wymaga adaptacji do klasy aktywów.

```python
from dataclasses import dataclass


@dataclass(frozen=True)
class RealisticCosts:
    commission_per_share: float = 0.005
    spread_bps: float = 10.0
    slippage_bps: float = 10.0
    min_commission: float = 1.0

    def calculate(self, shares: float, price: float) -> float:
        commission = max(abs(shares) * self.commission_per_share, self.min_commission)
        spread = abs(shares) * price * (self.spread_bps / 10_000)
        slippage = abs(shares) * price * (self.slippage_bps / 10_000)
        return commission + spread + slippage
```

Adaptacje:

- Crypto: maker/taker fees, funding rates, withdrawal/borrow costs, 24/7 calendar i exchange outages.
- Forex: spread in pips, swap/rollover, lot size, session liquidity.
- Futures: tick size/value, commission per contract, margin, contango/backwardation, roll costs.
- Illiquid equities: wider spread, volume-based impact, partial fills i hard-to-borrow fees.

Sensitivity check: uruchom backtest na co najmniej bazowym, 2x i 5x slippage/spread. Strategia z edge tylko przy optymistycznych kosztach nie przechodzi do live.

## Walk-Forward Przykład

```python
from sklearn.model_selection import TimeSeriesSplit


def walk_forward(data, parameter_grid, splits=5):
    results = []
    splitter = TimeSeriesSplit(n_splits=splits)

    for train_index, test_index in splitter.split(data):
        train = data.iloc[train_index]
        test = data.iloc[test_index]
        best_params = optimize_on_train(train, parameter_grid)
        result = validate_on_test(test, best_params)
        results.append({"params": best_params, "result": result})

    return results
```

Reguły:

- Nie używaj finalnego OOS w pętli wyboru parametrów.
- Oceniaj stabilność parametrów między foldami, nie tylko średni wynik.
- Jeśli najlepszy parametr skacze między skrajnymi wartościami, strategia jest prawdopodobnie niestabilna.
- Zapisz rozkład wyników per fold: Sharpe, drawdown, trade count, costs, turnover.

## Brokerzy API

| Broker/API | Użyj gdy | Uwaga |
| --- | --- | --- |
| Alpaca (`alpaca-py`) | API-first equities, darmowy paper trading. | Dobry start dla US equities; sprawdź coverage i order types. |
| Interactive Brokers (`ib_insync`) | Szeroki dostęp do rynków i instrumentów. | TWS/IB Gateway, sesje i reconnect są częścią systemu. |
| CCXT | Ujednolicone API dla giełd crypto. | Każda giełda ma inne limity, symbole, fee i zachowanie order book. |
| OANDA / brokerzy FX | Forex i CFD. | Spread, swap i regulacje zależą od konta i regionu. |
| FIX/native APIs | Niska latencja lub institutional execution. | Wymaga osobnego projektu backend/execution i obserwowalności. |

Nie wybieraj brokera wyłącznie po prowizji. Sprawdź stabilność API, paper/live parity, typy zleceń, limity, market data, reporting, reconciliation i procedury awaryjne.

## Execution Algorithms

| Algorytm | Pełna nazwa | Zastosowanie | Główne ryzyko |
| --- | --- | --- | --- |
| TWAP | Time-Weighted Average Price | Równomierny rozkład zlecenia w czasie. | Ignoruje realny profil wolumenu. |
| VWAP | Volume-Weighted Average Price | Śledzenie profilu wolumenu sesji. | Profil historyczny może nie pasować do dnia eventowego. |
| IS | Implementation Shortfall | Minimalizacja odchylenia od ceny decyzyjnej. | Trudniejsze parametry i trade-off market impact vs timing. |
| POV | Percentage of Volume | Stały udział w obrocie. | W niskiej płynności zlecenie może trwać za długo. |

Dla małych zleceń market/limit order może wystarczyć. Dla zleceń wpływających na rynek wybierz algorytm zgodny z liquidity, urgency i risk limits.

## Capacity Check

Capacity określa, przy jakim kapitale strategia przestaje działać przez market impact, spread i ograniczenia płynności.

Reguły praktyczne:

- Max participation rate: zacznij od 5-10% ADV dla płynnych equities i niżej dla mniej płynnych instrumentów.
- Licz turnover i średni order size względem wolumenu instrumentu.
- Modeluj impact jako funkcję udziału w wolumenie; proste przybliżenie rośnie nieliniowo, np. z pierwiastkiem participation rate.
- Sprawdź najgorsze dni płynności, nie tylko medianę.
- Capacity test wykonuj po kosztach i z konserwatywnym slippage.

```python
def participation_rate(order_value: float, average_daily_value: float) -> float:
    if average_daily_value <= 0:
        return 1.0
    return order_value / average_daily_value
```

## Paper-to-Live Rollout

- Paper trading: minimum 2 tygodnie albo pełny cykl sygnałów; dla strategii low-frequency zbierz reprezentatywne transakcje, zanim uznasz test za zakończony.
- Porównaj paper vs backtest: fill price, slippage, trade count, missed signals, rejected orders i latency.
- Jeśli paper Sharpe lub drawdown odbiega o ponad 30%, diagnozuj przed live.
- Start live na małym kapitale, np. 10-25% docelowej ekspozycji, z planem stopniowego skalowania.
- Kill switch musi umieć zatrzymać nowe zlecenia, anulować otwarte zlecenia, spłaszczyć pozycje i wysłać alert.

## Checklista

```text
- [ ] Wybrany framework pasuje do poziomu realizmu potrzebnego przed live.
- [ ] Vectorized screening ma osobną event-driven validation.
- [ ] Koszty obejmują spread, prowizje, slippage, impact i specyfikę klasy aktywów.
- [ ] Walk-forward nie używa finalnego OOS do strojenia.
- [ ] Broker API obsługuje wymagane typy zleceń, dane i reconciliation.
- [ ] Algorytm execution pasuje do urgency, wolumenu i płynności.
- [ ] Capacity check ogranicza udział w rynku i testuje gorszą płynność.
- [ ] Paper/live rollout ma metryki porównawcze, kill switch i skalowanie.
```
