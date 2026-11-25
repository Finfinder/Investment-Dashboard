# Kontrakty Współpracy — Implementing Trading Strategies

Materiał referencyjny definiujący granice odpowiedzialności i interfejsy między skillem `implementing-trading-strategies` a jego kluczowymi partnerami. Każdy kontrakt precyzuje co dostarcza każda ze stron i jak wygląda punkt styku.

## Spis treści

- [Analyzing Technicals](#analyzing-technicals)
- [Analyzing Fundamentals](#analyzing-fundamentals)
- [Implementing Backend](#implementing-backend)
- [Implementing Observability](#implementing-observability)
- [Spostrzeżenia Międzydomenowe](#spostrzeżenia-międzydomenowe)
- [Eskalacje](#eskalacje)
- [Szybki Routing](#szybki-routing)

## Analyzing Technicals

**Ten skill dostarcza:**

- Specyfikację sygnałów wejścia/wyjścia (definicja buy/sell triggers)
- Wymagania walidacji sygnałów (confirmation rules, minimum confidence)
- Constraints backtestowe (lookback period, warmup, shift)
- Format danych wejściowych (OHLCV DataFrame z kolumnami)

**Partner dostarcza:**

- Implementacje wskaźników (SMA, EMA, RSI, MACD, Bollinger Bands)
- Logikę generowania sygnałów (crossover, threshold, divergence)
- Parametry default i zakresy optymalizacji per wskaźnik
- Walidację sygnałów (filtracja szumu, minimum holding period)

**Przykład interfejsu:**

Trading definiuje strategię opartą na wskaźnikach, technicals dostarcza implementacje wskaźników i logikę sygnałów.

```python
# Trading skill definiuje strategię
class MACrossoverStrategy:
    def __init__(self, fast_period: int = 10, slow_period: int = 50):
        self.fast_period = fast_period
        self.slow_period = slow_period

    def generate_signals(self, df: pd.DataFrame) -> pd.Series:
        # Punkt styku: trading woła technicals
        fast_ma = calculate_sma(df["close"], self.fast_period)
        slow_ma = calculate_sma(df["close"], self.slow_period)
        return (fast_ma > slow_ma).astype(int).diff().fillna(0)

# Technicals skill implementuje wskaźnik
def calculate_sma(series: pd.Series, period: int) -> pd.Series:
    """Simple Moving Average — shift(1) dla uniknięcia look-ahead bias."""
    return series.rolling(window=period).mean().shift(1)
```

## Analyzing Fundamentals

**Ten skill dostarcza:**

- Wymagania screeningu (filtry fundamentalne jako pre-filter dla strategii)
- Universe definition (kryteria selekcji spółek do backtestów)
- Rebalancing schedule i trigger conditions
- Position sizing rules oparte na fundamentals (quality score → allocation weight)

**Partner dostarcza:**

- Wskaźniki fundamentalne (P/E, P/B, ROE, debt/equity, FCF yield)
- Modele scoringowe (composite quality score, value score)
- Dane historyczne wskaźników (point-in-time, bez survivorship bias)
- Screening results (lista spółek spełniających kryteria)

**Przykład interfejsu:**

Trading definiuje universe selection i zasady rebalancingu, fundamentals dostarcza ranking i screening spółek.

```python
# Trading skill definiuje universe selection
class FundamentalFilter:
    min_market_cap: float = 1e9      # > $1B
    max_pe_ratio: float = 25.0       # Value constraint
    min_roe: float = 0.10            # Quality constraint

# Fundamentals skill dostarcza screening
def screen_universe(filter: FundamentalFilter) -> list[str]:
    """Zwraca symbole spełniające kryteria fundamentalne."""
    stocks = get_fundamental_data()  # Point-in-time data
    return [
        s.symbol for s in stocks
        if s.market_cap >= filter.min_market_cap
        and s.pe_ratio <= filter.max_pe_ratio
        and s.roe >= filter.min_roe
    ]

# Punkt styku: trading używa universe w backtestingu
universe = screen_universe(FundamentalFilter())
for symbol in universe:
    backtest_results = run_backtest(strategy, symbol)
```

## Implementing Backend

**Ten skill dostarcza:**

- Specyfikację endpointów danych rynkowych (schema, częstotliwość, filtry)
- Wymagania compute dla backtestów (CPU, memory, timeout budgets)
- Data pipeline requirements (źródła danych, freshness, format)
- Format wyników do persystencji (trade log schema, portfolio state, metrics)

**Partner dostarcza:**

- REST API z paginacją i rate limitem dla danych rynkowych
- Background job infrastructure (Celery/ARQ) dla długich backtestów
- WebSocket/SSE dla live streaming wyników
- Persystencję i query interface dla wyników historycznych

**Przykład interfejsu:**

Trading definiuje kontrakty danych i wymagania obliczeniowe, backend implementuje infrastrukturę wykonawczą i persystencję.

```python
# Trading definiuje wymagania
class BacktestConfig(BaseModel):
    strategy_id: str
    symbols: list[str]
    start_date: date
    end_date: date
    initial_capital: Decimal = Decimal("100000")
    commission_bps: int = 10  # 10 basis points

class BacktestResult(BaseModel):
    total_return: float
    sharpe_ratio: float
    max_drawdown: float
    trades: list[TradeRecord]

# Backend implementuje execution pipeline
@celery.task(bind=True, max_retries=3, time_limit=3600)
def execute_backtest(self, config: dict) -> dict:
    cfg = BacktestConfig(**config)
    engine = BacktestEngine(cfg)
    result = engine.run()
    # Persystencja wyników
    save_backtest_result(cfg.strategy_id, result)
    return result.model_dump()
```

## Implementing Observability

**Ten skill dostarcza:**

- Definicje metryk strategii: rolling Sharpe, drawdown, hit rate, avg win/loss, turnover, exposure, slippage vs model.
- Progi alertów tradingowych: max intraday loss, max drawdown, drift > 2σ, brak danych, niezgodność pozycji, seria strat.
- Kontekst biznesowy alarmów: kiedy zatrzymać strategię, kiedy skalować w dół, kiedy tylko oznaczyć do review.
- Schemat trade audit log: signal version, decision price, fill price, koszty, broker order id, status, reason.

**Partner dostarcza:**

- Instrumentację metryk, logów i trace dla data feed, signal engine, order routera i reconciliation.
- Dashboardy dla live tradingu, paper tradingu i post-trade analysis.
- Alert routing, escalation policy, on-call handoff i runbooki operacyjne.
- SLO/SLI dla data freshness, order latency, error rate i pozycji zgodnych z brokerem.

**Przykład interfejsu:**

Trading definiuje metryki i warunki zatrzymania, observability implementuje eksport, dashboard i alerty.

```python
class StrategyHealthSnapshot(BaseModel):
    strategy_id: str
    rolling_sharpe_30d: float
    max_drawdown_30d: float
    slippage_bps_vs_model: float
    data_feed_lag_seconds: float
    position_mismatch_count: int

def should_trigger_kill_switch(snapshot: StrategyHealthSnapshot) -> bool:
    return (
        snapshot.max_drawdown_30d <= -0.10
        or snapshot.slippage_bps_vs_model > 25
        or snapshot.data_feed_lag_seconds > 60
        or snapshot.position_mismatch_count > 0
    )
```

## Spostrzeżenia Międzydomenowe

- **Technicals:** Wskaźniki lagujące nie są automatycznym entry. Trading odpowiada za timing, `shift(1)`, warmup i event-driven validation, nawet jeśli wskaźnik dostarcza inny skill.
- **Fundamentals:** Wskaźniki fundamentalne muszą być point-in-time. Data publikacji i reporting delay są częścią sygnału, bo inaczej screening widzi przyszłość.
- **Backend:** Execution engine potrzebuje idempotencji zleceń, retry policy, reconciliation i pre-trade validation. Trading nie powinien wysyłać orderów bez tych kontraktów.
- **Observability:** Monitoring tylko P&L nie wystarcza. Drift metryk, data feed health, slippage i zgodność pozycji są warunkami utrzymania live.
- **Databases:** Dane tick/bar i trade logi wymagają indeksów po czasie, symbolu i strategy_id; inaczej backfill, window queries i audyt live degradują szybkość systemu.

## Eskalacje

| Sytuacja | Eskaluj do | Kontekst do przekazania | Powód |
| --- | --- | --- | --- |
| Backtest ma nierealistycznie wysokie zwroty albo znika po `shift(1)` | `analyzing-technicals` | Kod sygnału, wskaźniki, lookback, warmup, timestampy | Możliwy look-ahead bias lub zły timing wskaźnika. |
| Screening fundamentalny nie replikuje wyników OOS | `analyzing-fundamentals` | Universe, daty publikacji, czynniki, scoring, vendor danych | Możliwy survivorship bias albo future fundamentals. |
| Paper/live odbiega od backtestu przez fill timing lub rejected orders | `implementing-backend` | Order flow, broker responses, latency, retry/reconciliation logs | Wymaga poprawy execution pipeline lub integracji brokera. |
| Slippage i błędy danych przekraczają progi alertów | `implementing-observability` | Metryki live, dashboard, alert rules, runbook | Potrzebne alerty, kill switch, dashboard i drift monitoring. |
| Koszty transakcyjne usuwają edge albo broker nie obsługuje wymagań | `solution-researching` | Klasa aktywów, turnover, order types, fee schedule, liquidity | Wymaga researchu brokerów, danych lub execution venues. |

## Szybki Routing

| Potrzeba | Skill prowadzący | Trading zachowuje odpowiedzialność za |
| --- | --- | --- |
| Implementacja RSI/MACD/SMA, patternów lub sygnałów technicznych | `analyzing-technicals` | Shift, koszty, backtest, OOS, risk i execution. |
| Screening value/quality/growth i dane sprawozdawcze | `analyzing-fundamentals` | Point-in-time join, rebalance, turnover i koszty. |
| API backtestów, job queue, order router, broker integration | `implementing-backend` | Kontrakt zleceń, pre-trade checks, risk limits i expected behavior. |
| Dashboard, alerty, logi, traces, SLO dla tradingu live | `implementing-observability` | Metryki strategii, progi kill switch i interpretacja driftu. |
| Wybór frameworka, brokera, vendora danych lub algorytmu execution | `solution-researching` | Kryteria domenowe, akceptowalne koszty i ryzyko wdrożenia. |
