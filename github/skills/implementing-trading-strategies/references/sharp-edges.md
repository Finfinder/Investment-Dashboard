# Sharp Edges — Implementing Trading Strategies

Znane pułapki i nieoczywiste błędy, na które natrafisz budując systemy handlowe w stacku **Python (FastAPI) + React/Next.js + TradingView Lightweight Charts**. Ten plik przechowuje szczegóły wyniesione z aktywnego `SKILL.md`: antywzorce backtestu/live, indicator lag, survivorship bias, gap risk, overfitting i niedoszacowanie slippage.

## Spis treści

- [SE-01: Data Snooping / Multiple Testing Bias](#se-01-data-snooping--multiple-testing-bias)
- [SE-02: Strategy Decay / Alpha Erosion](#se-02-strategy-decay--alpha-erosion)
- [SE-03: Execution Latency Gap](#se-03-execution-latency-gap)
- [SE-04: Overnight / Weekend Gap Risk](#se-04-overnight--weekend-gap-risk)
- [SE-05: Correlation Blow-Up](#se-05-correlation-blow-up)
- [SE-06: Backtesting.py Default Commission Model](#se-06-backtestingpy-default-commission-model)
- [SE-07: Vectorized Backtest Overstates Performance](#se-07-vectorized-backtest-overstates-performance)
- [SE-08: Paper Trading != Live Trading](#se-08-paper-trading--live-trading)
- [SE-09: API Rate Limit During Live Data Fetch](#se-09-api-rate-limit-during-live-data-fetch)
- [SE-10: Dividend / Split Adjustment Mismatch](#se-10-dividend--split-adjustment-mismatch)
- [SE-11: Missing Signal Shift](#se-11-missing-signal-shift)
- [SE-12: Indicator Lag as Entry Trigger](#se-12-indicator-lag-as-entry-trigger)
- [SE-13: Survivorship-Biased Universe](#se-13-survivorship-biased-universe)
- [SE-14: Parameter Overfitting and Isolated Optimum](#se-14-parameter-overfitting-and-isolated-optimum)
- [SE-15: Slippage Underestimation on Illiquid Instruments](#se-15-slippage-underestimation-on-illiquid-instruments)
- [SE-16: No Capacity Check](#se-16-no-capacity-check)
- [SE-17: Single-Market Validation](#se-17-single-market-validation)
- [SE-18: Hardcoded Parameters After Regime Change](#se-18-hardcoded-parameters-after-regime-change)
- [SE-19: P&L-First Research](#se-19-pl-first-research)
- [SE-20: Missing Signal Invalidation](#se-20-missing-signal-invalidation)

---

### SE-01: Data Snooping / Multiple Testing Bias

**Severity:** CRITICAL | **Stack:** Backtesting

**Sytuacja:** Testujesz 100 strategii na tym samym datasecie. 5 osiąga Sharpe > 1.5. Statystycznie przy p < 0.05 oczekujesz dokładnie 5 fałszywych pozytywów — znajdziesz "działające" strategie nawet na losowych danych.

**Dlaczego to boli:** Selekcjonujesz wyniki post-hoc i wdrażasz strategię, która przeszła backtest wyłącznie przez szum statystyczny. Na live nie ma edge'a.

**Rozwiązanie:**

```python
import numpy as np

def benjamini_hochberg_fdr(p_values: list[float], alpha: float = 0.05) -> list[bool]:
    n = len(p_values)
    sorted_idx = np.argsort(p_values)
    sorted_pvals = np.array(p_values)[sorted_idx]
    thresholds = [(i + 1) / n * alpha for i in range(n)]
    rejected = np.zeros(n, dtype=bool)
    max_k = max((k for k in range(n) if sorted_pvals[k] <= thresholds[k]), default=-1)
    if max_k >= 0:
        rejected[sorted_idx[: max_k + 1]] = True
    return rejected.tolist()

strategy_pvalues = [backtest_pvalue(s) for s in candidate_strategies]
significant = benjamini_hochberg_fdr(strategy_pvalues, alpha=0.05)
validated = [s for s, sig in zip(candidate_strategies, significant) if sig]
holdout_results = [run_backtest(s, data=holdout_data) for s in validated]
```

**Symptomy:** Wiele strategii z podobnym Sharpe na tym samym datasecie; strategia traci od pierwszego dnia live; wyniki nie replikują się na holdout.

**Regex detekcji:** nie dotyczy — pułapka metodologiczna

---

### SE-02: Strategy Decay / Alpha Erosion

**Severity:** HIGH | **Stack:** Live Trading

**Sytuacja:** Strategia generuje 15% rocznie przez 2 lata, potem zwroty spadają do 3%. Edge zniknął — inni odkryli tę samą nieefektywność lub zmienił się reżim rynkowy.

**Dlaczego to boli:** Bez monitoringu erozji alpha kontynuujesz alokację kapitału do strategii, która już nie działa. Drawdown narasta powoli — po 12 miesiącach masz -8% zamiast +15%.

**Rozwiązanie:**

```python
import pandas as pd
import numpy as np

def rolling_sharpe(returns: pd.Series, window: int = 126) -> pd.Series:
    return (returns.rolling(window).mean() * 252) / (returns.rolling(window).std() * np.sqrt(252))

def detect_alpha_decay(returns: pd.Series, window: int = 126, decay_threshold: float = 0.5) -> dict:
    sharpe = rolling_sharpe(returns, window)
    peak = sharpe.expanding().max().iloc[-1]
    current = sharpe.iloc[-1]
    return {"current_sharpe": round(current, 2), "peak_sharpe": round(peak, 2), "alert": current < decay_threshold * peak}

decay = detect_alpha_decay(strategy_returns)
if decay["alert"]:
    send_alert(f"Alpha decay: Sharpe {decay['current_sharpe']} vs peak {decay['peak_sharpe']}")
```

**Symptomy:** Malejący rolling Sharpe na przestrzeni 6-12 miesięcy; rosnąca częstotliwość drawdownów; spadek hit rate przy niezmienionym systemie.

**Regex detekcji:** nie dotyczy — pułapka metodologiczna

---

### SE-03: Execution Latency Gap

**Severity:** CRITICAL | **Stack:** Live Trading

**Sytuacja:** Backtest zakłada fill na close price. Live: sygnał po close, order +500ms, fill +2 ticki. Na 500 tradów rocznie to 1-3% performance gap.

**Dlaczego to boli:** Każdy trade kosztuje 2-5 bps więcej niż w backteście. Na strategii z edge 8% brutto, po latency gap zostaje 5-6%.

**Rozwiązanie:**

```python
import numpy as np

def realistic_fill_price(
    target_price: float, spread: float, volume: float, order_size: float, side: str = "buy",
) -> float:
    half_spread = spread / 2
    participation_rate = order_size / volume if volume > 0 else 1.0
    impact = target_price * 0.1 * np.sqrt(participation_rate)
    sign = 1 if side == "buy" else -1
    return target_price + sign * (half_spread + impact)

SLIPPAGE_CONFIG = {
    "spread_bps": 5, "impact_coeff": 0.1, "latency_ticks": 2, "tick_size": 0.01,
}
```

**Symptomy:** Live P&L systematycznie niższe niż backtest o 1-3% rocznie; fills konsekwentnie gorsze; gap rośnie przy mniej płynnych instrumentach.

**Regex detekcji:** `commission\s*=\s*0[^.]|slippage\s*=\s*0\b`

---

### SE-04: Overnight / Weekend Gap Risk

**Severity:** HIGH | **Stack:** Live Trading

**Sytuacja:** Pozycja otwarta z stop-loss na $98. Overnight news: spółka traci 20%. Open = $82. Stop-loss przeskoczony. Strata 3× większa niż planowana.

**Dlaczego to boli:** Stop-loss to instrukcja wysłania market order gdy cena osiągnie poziom. Przy gap-down order wykonuje się na otwarciu, poniżej stop-loss. Position sizing bazujący na odległości do stop-loss zaniża ryzyko.

**Rozwiązanie:**

```python
import pandas as pd
import numpy as np

def position_size_with_gap_risk(
    capital: float, risk_per_trade: float, entry_price: float,
    stop_loss: float, worst_case_gap_pct: float,
) -> int:
    stop_distance = abs(entry_price - stop_loss) / entry_price
    effective_risk = max(stop_distance, worst_case_gap_pct)
    return int((capital * risk_per_trade) / (entry_price * effective_risk))

def calculate_gap_risk(prices: pd.DataFrame, percentile: float = 99.0) -> dict:
    gaps = (prices["Open"] - prices["Close"].shift(1)) / prices["Close"].shift(1)
    gaps = gaps.dropna()
    return {"max_gap_down_pct": round(gaps.min() * 100, 2), "p99_gap_pct": round(np.percentile(gaps.abs(), percentile) * 100, 2)}
```

**Symptomy:** Sporadyczne ogromne straty (fat tail) — actual loss 3-5× planu; equity curve z pionowymi spadkami; stop-loss hit rate 100% ale average loss >> expected.

**Regex detekcji:** nie dotyczy — pułapka metodologiczna

---

### SE-05: Correlation Blow-Up

**Severity:** CRITICAL | **Stack:** Live Trading

**Sytuacja:** Portfolio 10 "nieskorelowanych" strategii. W normalnych warunkach korelacje 0.1-0.3. W kryzysie (2008, COVID, 2022) korelacje skaczą do 0.8-1.0. Drawdown 30% zamiast 10%.

**Dlaczego to boli:** Dywersyfikacja oparta na normalnych korelacjach to iluzja. W kryzysie znika. Portfolio sizing na bazie normalnych korelacji = 2-3× za duże pozycje.

**Rozwiązanie:**

```python
import pandas as pd
import numpy as np

CRISIS_PERIODS = [("2008-09-01", "2009-03-31"), ("2020-02-20", "2020-04-30"), ("2022-01-01", "2022-10-31")]

def stressed_correlation_matrix(returns: pd.DataFrame, stress_periods: list[tuple[str, str]]) -> pd.DataFrame:
    stress_returns = pd.concat([returns.loc[s:e] for s, e in stress_periods])
    return stress_returns.corr()

def check_correlation_regime(returns: pd.DataFrame, window: int = 21, threshold: float = 0.6) -> bool:
    recent_corr = returns.tail(window).corr()
    mask = np.triu(np.ones(recent_corr.shape, dtype=bool), k=1)
    return recent_corr.where(mask).stack().mean() > threshold
```

**Symptomy:** Drawdown 2-3× większy niż historyczny max; wszystkie pozycje red jednocześnie; VaR raport stale zaniża ryzyko.

**Regex detekcji:** nie dotyczy — pułapka metodologiczna

---

### SE-06: Backtesting.py Default Commission Model

**Severity:** HIGH | **Stack:** Backtesting

**Sytuacja:** `backtesting.py` domyślnie ustawia `commission=0`, co zawyża wyniki backtestu. Strategia z 200 tradami rocznie "zarabia" 15%, ale po 10 bps commission per trade zostaje 11%.

**Dlaczego to boli:** Każdy backtest bez explicit commission daje fałszywie optymistyczne wyniki. Strategie z niskim edge (< 5% rocznie) mogą okazać się net-negative po uwzględnieniu kosztów.

**Rozwiązanie:**

```python
from backtesting import Backtest

bt = Backtest(
    data,
    MyStrategy,
    cash=100_000,
    commission=0.001,       # MINIMUM 10 bps — always set explicitly
    exclusive_orders=True,
)
result = bt.run()

# Sensitivity check across commission levels
for comm in [0.001, 0.002, 0.005]:
    r = Backtest(data, MyStrategy, cash=100_000, commission=comm).run()
    print(f"Commission={comm}: Sharpe={r['Sharpe Ratio']:.2f}, Return={r['Return [%]']:.1f}%")
```

**Symptomy:** Nierealnie wysokie zwroty w backteście; wyniki drastycznie spadają po dodaniu kosztów; Sharpe > 3 na strategii dziennej.

**Regex detekcji:** `Backtest\([^)]*\)(?![^)]*commission)|commission\s*=\s*0\s*[,)]`

---

### SE-07: Vectorized Backtest Overstates Performance

**Severity:** HIGH | **Stack:** Backtesting

**Sytuacja:** Vectorized backtest (pandas/vectorbt) zakłada instant execution, zero market impact i frakcje shares. Mean-reversion wygląda na +50% rocznie. Event-driven: +5%.

**Dlaczego to boli:** Vectorized backtesty nie modelują order flow. Dla strategii wrażliwych na timing (mean-reversion, HFT) różnica jest 5-10× między vectorized a realistic backtest.

**Rozwiązanie:**

```python
import vectorbt as vbt
from backtesting import Backtest

# STEP 1: Vectorized for rapid screening
portfolio = vbt.Portfolio.from_signals(prices["Close"], entries, exits)
screening_sharpe = portfolio.sharpe_ratio()

# STEP 2: Event-driven for validation (REQUIRED before live)
bt = Backtest(data, MyStrategy, cash=100_000, commission=0.001, exclusive_orders=True)
validated = bt.run()

# STEP 3: Compare — gap > 20% = red flag
gap = abs(screening_sharpe - validated["Sharpe Ratio"]) / screening_sharpe * 100
if gap > 20:
    print(f"WARNING: {gap:.0f}% gap between vectorized and event-driven")
```

**Symptomy:** Nierealnie wysokie zwroty (Sharpe > 3); duża rozbieżność vectorized vs event-driven (> 20%); wyniki spadają po dodaniu kosztów.

**Regex detekcji:** `vbt\.Portfolio\.from_signals\([^)]*\)(?![^)]*commission)`

---

### SE-08: Paper Trading != Live Trading

**Severity:** HIGH | **Stack:** Live Trading

**Sytuacja:** Paper trade daje +20% rocznie. Live: +5%. Różnica: paper fill na mid price, live na ask; paper no queue priority; paper nie modeluje emotional decision making ani partial fills.

**Dlaczego to boli:** Paper trading daje fałszywe poczucie walidacji. Trzy źródła rozbieżności: (1) execution quality — paper fill instant na mid price, live na bid/ask z opóźnieniem; (2) market impact — paper nie wpływa na order book; (3) psychologia — paper nie generuje presji emocjonalnej przy drawdownach.

**Rozwiązanie:**

```python
def paper_to_live_checklist(paper_results: dict) -> list[str]:
    warnings = []
    if paper_results.get("avg_fill_slippage_bps", 0) < 2:
        warnings.append("Paper slippage unrealistically low — add 3-5 bps buffer for live")
    if paper_results.get("partial_fill_rate", 0) == 0:
        warnings.append("Zero partial fills in paper — expect 10-30% partials in live")
    if paper_results.get("max_drawdown_pct", 0) < 10:
        warnings.append("Paper max DD < 10% — plan for 1.5-2x DD in live (emotional exits)")
    return warnings

# Transition rule: run paper minimum 2 weeks or a full signal cycle, then start live small
LIVE_SCALING = [0.25, 0.50, 0.75, 1.0]  # scale up over 4 months
```

**Symptomy:** Live returns systematycznie niższe niż paper o 30-60%; więcej partial fills w live; większe drawdowns mimo identycznej logiki.

**Regex detekcji:** nie dotyczy — pułapka metodologiczna

---

### SE-09: API Rate Limit During Live Data Fetch

**Severity:** MEDIUM | **Stack:** Data

**Sytuacja:** yfinance/broker API rate limit hit podczas live tradingu → brak danych → sygnał nie generowany → pominięty trade. System milczy — brak alertu, brak retry, brak fallback.

**Dlaczego to boli:** Na live każdy pominięty sygnał to potencjalny zysk lub uniknięta strata. System bez obsługi rate limitów wygląda jak poprawnie działający — po prostu nie generuje sygnałów w losowych momentach.

**Rozwiązanie:**

```python
import logging
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

logger = logging.getLogger(__name__)

class RateLimitError(Exception):
    pass

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=30), retry=retry_if_exception_type(RateLimitError))
def fetch_live_data(ticker: str) -> dict:
    response = api_client.get_quote(ticker)
    if response.status_code == 429:
        logger.warning(f"Rate limited for {ticker}, retrying...")
        raise RateLimitError(f"429 for {ticker}")
    return response.json()

def fetch_with_fallback(ticker: str, sources: list) -> dict:
    for source in sources:
        try:
            return source.fetch(ticker)
        except Exception as e:
            logger.warning(f"Source {source.name} failed: {e}")
    raise RuntimeError(f"All data sources failed for {ticker}")
```

**Symptomy:** Losowe luki w sygnałach; fewer trades niż w backteście; 429 w logach bez alertu; dane stale z cache.

**Regex detekcji:** `yf\.download\(|api_client\.(get|fetch)\(`

---

### SE-10: Dividend / Split Adjustment Mismatch

**Severity:** HIGH | **Stack:** Data

**Sytuacja:** Benchmark buy & hold używa adjusted close z Yahoo Finance. Twoje sygnały bazują na unadjusted price. Inna metodologia adjustmentu = różnica 2-5% rocznie.

**Dlaczego to boli:** Yahoo retroaktywnie przelicza historyczne ceny po każdym splicie/dywidendzie. Porównanie total return z Yahoo adjusted close daje nierzetelne wyniki. Na 5-letnim backteście to 10-25% skumulowanej różnicy.

**Rozwiązanie:**

```python
import yfinance as yf

def validate_adjustment_consistency(own_prices, ticker: str, tolerance_pct: float = 1.0) -> dict:
    ref = yf.download(ticker, start=own_prices.index[0], end=own_prices.index[-1])
    own_ret = own_prices["Adj_Close"].pct_change().dropna()
    ref_ret = ref["Adj Close"].pct_change().dropna()
    common = own_ret.index.intersection(ref_ret.index)
    own_annual = (1 + own_ret.loc[common]).prod() ** (252 / len(common)) - 1
    ref_annual = (1 + ref_ret.loc[common]).prod() ** (252 / len(common)) - 1
    diff = abs(own_annual - ref_annual) * 100
    return {"own_pct": round(own_annual * 100, 2), "ref_pct": round(ref_annual * 100, 2), "diff": round(diff, 2), "ok": diff < tolerance_pct}

check = validate_adjustment_consistency(my_prices, "SPY")
if not check["ok"]:
    raise ValueError(f"Adjustment mismatch: own={check['own_pct']}% vs ref={check['ref_pct']}%")
```

**Symptomy:** Benchmark porównanie nie zgadza się z publicznie dostępnymi danymi; buy & hold returns różnią się o 2-5% rocznie; ceny historyczne zmieniają się po re-downloadzeniu.

**Regex detekcji:** `Adj.Close|adjusted_close|adj_price`

---

### SE-11: Missing Signal Shift

**Severity:** CRITICAL | **Stack:** Backtesting

**Sytuacja:** Sygnał wygenerowany z ceny zamknięcia jest używany do wejścia na tym samym zamknięciu. Backtest wygląda świetnie, bo strategia handluje informacją, która w chwili decyzji nie była jeszcze dostępna.

**Dlaczego to boli:** To klasyczny look-ahead bias. Najczęściej zawyża wyniki strategii momentum, breakout i mean reversion, a live performance spada od pierwszych transakcji.

**Rozwiązanie:** Shiftuj pozycję o 1 bar albo użyj event-driven engine z jawną kolejnością: market data event -> signal event -> order event -> fill event.

```python
signal = df["close"].pct_change(20)
df["position"] = (signal.shift(1) > 0).astype(int)

# Źle: pozycja używa tej samej świecy, która wygenerowała sygnał.
df["lookahead_position"] = (signal > 0).astype(int)
```

**Symptomy:** Sharpe > 3 na prostej strategii dziennej; wyniki znikają po przesunięciu sygnału; trade timestamp pokrywa się z timestampem obliczenia sygnału.

**Regex detekcji:** `position\s*=\s*np\.where\([^\n]*(signal|indicator)(?!\.shift)|\[["']position["']\]\s*=\s*\(?\s*(signal|indicator)(?!\.shift)`

---

### SE-12: Indicator Lag as Entry Trigger

**Severity:** HIGH | **Stack:** Signal Engineering

**Sytuacja:** Strategia używa lagging indicator, np. MA/MACD/RSI, jako bezpośredniego timingowego triggera bez potwierdzenia price action. W backteście działa tylko na wybranym okresie, a live wchodzi po ruchu.

**Dlaczego to boli:** Wskaźnik jest przekształceniem historycznej ceny. Długi lookback dodaje opóźnienie, a dywergencje potrafią trwać długo w silnym trendzie. Entry po samym wskaźniku często kupuje późno i sprzedaje późno.

**Rozwiązanie:** Traktuj lagging indicators jako filtr reżimu lub kontekst. Entry wymagaj przez strukturę ceny, wolumen, break poziomu albo inny sygnał z jasnym momentem decyzyjnym.

```text
Dobre użycie: long tylko gdy cena > SMA(200), a entry wynika z osobnego setupu.
Ryzykowne użycie: kupuj natychmiast po przecięciu MACD bez filtra kosztów i shiftu.
```

**Symptomy:** Wielokrotne straty przy fading trendu; dywergencje traktowane jako wejście; parametr lookback idealny tylko w jednym okresie.

**Regex detekcji:** `RSI|MACD|SMA|EMA|Bollinger|divergence`

---

### SE-13: Survivorship-Biased Universe

**Severity:** CRITICAL | **Stack:** Data

**Sytuacja:** Backtest na dzisiejszym składzie indeksu S&P 500 od 2010 roku. Spółki, które wypadły z indeksu, zbankrutowały albo zostały przejęte, nie istnieją w danych.

**Dlaczego to boli:** Strategia "wybiera" zwycięzców, bo losers zniknęli z universe. Wynik jest fałszywie stabilny, szczególnie dla momentum, quality i screening fundamentalnego.

**Rozwiązanie:** Użyj point-in-time constituents i delisting returns. Jeśli źródło danych nie obsługuje survivorship-free universe, oznacz backtest jako research niskiego rygoru i nie używaj go jako go-live evidence.

```text
Wymagane pola universe: symbol, effective_from, effective_to, delisting_date, delisting_return, corporate_action_id.
```

**Symptomy:** Backtest działa najlepiej na dużych indeksach i blue-chipach; brak delistingów w danych; universe tworzony przez aktualną listę tickerów.

**Regex detekcji:** `sp500|nasdaq100|current_constituents|today_universe|tickers\s*=\s*\[`

---

### SE-14: Parameter Overfitting and Isolated Optimum

**Severity:** HIGH | **Stack:** Optimization

**Sytuacja:** Grid search znajduje jeden zestaw parametrów z Sharpe 2.1, ale sąsiednie wartości dają Sharpe 0.4. Strategia wygląda dobrze tylko w jednym punkcie przestrzeni parametrów.

**Dlaczego to boli:** Izolowany szczyt jest zwykle dopasowaniem do szumu. Live nie zna idealnego parametru, a niewielka zmiana reżimu niszczy edge.

**Rozwiązanie:** Ogranicz liczbę parametrów, używaj walk-forward i szukaj plateau wyników. Stabilny zakres parametrów ma pierwszeństwo przed najwyższym wynikiem in-sample.

```python
def is_parameter_plateau(scores, center, tolerance=0.15):
    center_score = scores[center]
    neighbor_scores = [scores[idx] for idx in neighbors(center)]
    return min(neighbor_scores) >= center_score * (1 - tolerance)
```

**Symptomy:** Max 2-3 wartości parametrów generują cały wynik; wyniki OOS są niestabilne; kolejne runy wybierają skrajne wartości gridu.

**Regex detekcji:** `grid_search|ParameterGrid|optimize\(|for\s+.*in\s+range\(`

---

### SE-15: Slippage Underestimation on Illiquid Instruments

**Severity:** HIGH | **Stack:** Execution

**Sytuacja:** Backtest zakłada 5 bps slippage dla instrumentu, którego spread i wolumen zmieniają się skokowo. Live fills są 30-80 bps gorsze w dniach niskiej płynności.

**Dlaczego to boli:** Edge strategii o wysokim turnover znika przez kilka gorszych filli. Niedoszacowanie slippage jest częstsze niż błąd prowizji, bo zależy od wolumenu, spreadu i urgency zlecenia.

**Rozwiązanie:** Modeluj slippage zależnie od spreadu, volatility i udziału zlecenia w wolumenie. Uruchom sensitivity check 2x i 5x kosztów oraz osobny test na najgorszych dniach liquidity.

```python
def slippage_bps(spread_bps, order_value, average_daily_value, impact_coeff=15.0):
    participation = min(order_value / max(average_daily_value, 1.0), 1.0)
    return spread_bps / 2 + impact_coeff * participation ** 0.5
```

**Symptomy:** Paper/live P&L systematycznie gorszy od backtestu; strategia traci głównie na mało płynnych instrumentach; fill price stale poza modelem.

**Regex detekcji:** `slippage_bps\s*=\s*(0|[1-5](\.0)?)|slippage\s*=\s*0`

---

### SE-16: No Capacity Check

**Severity:** HIGH | **Stack:** Portfolio / Execution

**Sytuacja:** Strategia działa na kapitale 10k, ale po zwiększeniu do 1M wymaga zleceń przekraczających 20% dziennego wolumenu części instrumentów.

**Dlaczego to boli:** Market impact rośnie nieliniowo. Strategia może być realnie zyskowna tylko przy małym kapitale, a skalowanie niszczy fill quality i zwiększa ryzyko partial fills.

**Rozwiązanie:** Dodaj capacity check: participation rate, ADV/ADTV, max order value, min liquidity i test w gorszych dniach wolumenu. Dla live ustaw limit order size zależny od wolumenu.

```python
max_order_value = average_daily_value * 0.10
if order_value > max_order_value:
    raise ValueError("Order exceeds capacity limit")
```

**Symptomy:** Wyniki spadają wraz z kapitałem; ordery wykonują się częściowo; wysokie odchylenie fill price vs decision price.

**Regex detekcji:** `average_daily_volume|ADV|participation_rate|capacity`

---

### SE-17: Single-Market Validation

**Severity:** MEDIUM | **Stack:** Validation

**Sytuacja:** Strategia została sprawdzona tylko na jednym tickerze, jednym rynku albo jednym reżimie volatility. Wynik wygląda stabilnie, bo dokładnie pasuje do lokalnej historii.

**Dlaczego to boli:** Edge może być ekspozycją na konkretny rynek, sektor albo okres, a nie powtarzalną nieefektywnością. Live w innym reżimie szybko ujawnia zależność.

**Rozwiązanie:** Testuj wiele instrumentów, okresów i reżimów. Minimum: trend/range, high/low volatility, bull/bear i różne poziomy liquidity.

**Symptomy:** Wyniki nie replikują się poza jednym instrumentem; strategia działa tylko w hossie; drawdown live przekracza backtestowy stres.

**Regex detekcji:** `symbol\s*=\s*["'][A-Z]+["']|ticker\s*=\s*["'][A-Z]+["']`

---

### SE-18: Hardcoded Parameters After Regime Change

**Severity:** MEDIUM | **Stack:** Risk / Configuration

**Sytuacja:** Stałe progi volatility, stop-loss albo lookback działają w jednym reżimie, ale po zmianie zmienności strategia przestaje reagować adekwatnie.

**Dlaczego to boli:** Hardcoded parameters tworzą ukrytą zależność od reżimu rynku. Wzrost volatility może zwiększyć turnover, stop-outs i koszty bez ostrzeżenia.

**Rozwiązanie:** Preferuj parametry robustne, wyrażone w jednostkach volatility/ATR albo adaptowane przez jasno wersjonowaną politykę. Monitoruj drift i zmiany reżimu.

**Symptomy:** Stop-loss trafiany stale po wzroście volatility; liczba transakcji zmienia się skokowo; parametry nie były rewidowane po zmianie danych.

**Regex detekcji:** `stop_loss\s*=\s*0\.\d+|lookback\s*=\s*\d+|threshold\s*=\s*0\.\d+`

---

### SE-19: P&L-First Research

**Severity:** MEDIUM | **Stack:** Research Process

**Sytuacja:** Proces zaczyna się od sortowania wariantów po P&L/CAGR, a dopiero potem dopisywana jest hipoteza. Strategia jest narracją dopasowaną do wyniku.

**Dlaczego to boli:** To data snooping i curve fitting. Bez hipotezy, kosztów i falsyfikacji można znaleźć "działającą" strategię na losowych danych.

**Rozwiązanie:** Najpierw zapisz hipotezę, universe, koszty, benchmark, metryki i warunki odrzucenia. P&L jest jedną z metryk, nie pierwszym filtrem.

**Symptomy:** Wiele wariantów porzuconych bez zapisu; brak negative results; opis strategii powstaje po obejrzeniu equity curve.

**Regex detekcji:** nie dotyczy — pułapka metodologiczna

---

### SE-20: Missing Signal Invalidation

**Severity:** MEDIUM | **Stack:** Signal Engineering / Risk

**Sytuacja:** Sygnał long pozostaje ważny bez limitu czasu, mimo że cena oddaliła się od entry level albo zmienił się reżim. System wchodzi w transakcję w warunkach innych niż te, które wygenerowały sygnał.

**Dlaczego to boli:** Stale signals zwiększają drawdown i sprawiają, że backtest handluje setupami, które live trader odrzuciłby jako nieaktualne.

**Rozwiązanie:** Definiuj invalidation: max czas od sygnału, max odchylenie ceny, zmiana volatility/trendu, publikacja news lub brak potwierdzenia wolumenu.

```python
is_valid = (
    signal_age <= max_signal_age
    and abs(current_price / entry_reference - 1) <= max_price_deviation
    and regime == signal_regime
)
```

**Symptomy:** Wejścia daleko od setupu; transakcje po newsach mimo sygnału technicznego sprzed publikacji; wysoki average loss na spóźnionych wejściach.

**Regex detekcji:** `signal_age|invalidation|expiry|expires_at|max_signal_age`
