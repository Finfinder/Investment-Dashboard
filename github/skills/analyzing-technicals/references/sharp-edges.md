# Sharp Edges - Analyzing Technicals

Znane pułapki i nieoczywiste błędy w analizie technicznej w stacku **Python + TradingView Lightweight Charts + React/Next.js**. Każdy wpis opisuje sytuację, przyczynę bólu, rozwiązanie i symptomy. Lista jest komplementarna wobec anty-wzorców w SKILL.md — nie powielaj ich.

## Spis treści

- [SE-01: Bollinger Band Width Collapse as False Signal](#se-01-bollinger-band-width-collapse-as-false-signal)
- [SE-02: Support/Resistance Anchoring Bias](#se-02-supportresistance-anchoring-bias)
- [SE-03: TradingView Lightweight Charts Timezone Rendering Bug](#se-03-tradingview-lightweight-charts-timezone-rendering-bug)
- [SE-04: Backtest Fill Price vs Chart Display Price](#se-04-backtest-fill-price-vs-chart-display-price)
- [SE-05: Indicator Calculation Off-By-One](#se-05-indicator-calculation-off-by-one)
- [SE-06: Volume Profile Misinterpretation on Low-Liquid Assets](#se-06-volume-profile-misinterpretation-on-low-liquid-assets)
- [SE-07: Candle Close Assumption in Multi-Timeframe](#se-07-candle-close-assumption-in-multi-timeframe)
- [SE-08: Moving Average on Insufficient Data](#se-08-moving-average-on-insufficient-data)
- [SE-09: Insufficient Data Without Graceful Degradation](#se-09-insufficient-data-without-graceful-degradation)
- [SE-10: Ultra-Short Timeframes with Daily Indicators](#se-10-ultra-short-timeframes-with-daily-indicators)
- [SE-11: Crypto and Forex Session Assumptions](#se-11-crypto-and-forex-session-assumptions)
- [SE-12: Pattern Morphing After Failure](#se-12-pattern-morphing-after-failure)
- [SE-13: False Breakout Without Volume Context](#se-13-false-breakout-without-volume-context)

---

### SE-01: Bollinger Band Width Collapse as False Signal

**Severity:** HIGH
**Stack:** Calculating

**Sytuacja:** Bollinger Bands się kurczą (squeeze). Interpretowane jako "nadchodzi breakout". Ale na nisko-płynnych instrumentach squeeze trwa miesiącami bez breakoutu — niski wolumen nie oznacza akumulacji.

**Dlaczego to boli:** Trader wchodzi na squeeze oczekując breakoutu. Instrument dryfuje w wąskim zakresie bez ruchu kierunkowego. Kapitał zamrożony, opportunity cost rośnie.

**Rozwiązanie:**

```python
import pandas as pd


def detect_bb_squeeze(
    df: pd.DataFrame,
    bb_period: int = 20,
    bb_std: float = 2.0,
    squeeze_threshold: float = 0.03,
    min_adv: int = 500_000,
) -> pd.DataFrame:
    """BB Squeeze with volume confirmation and liquidity filter."""
    sma = df["close"].rolling(bb_period).mean()
    std = df["close"].rolling(bb_period).std()
    df["bb_upper"] = sma + bb_std * std
    df["bb_lower"] = sma - bb_std * std
    df["bb_width"] = (df["bb_upper"] - df["bb_lower"]) / sma

    df["is_squeeze"] = df["bb_width"] < squeeze_threshold

    # Volume confirmation — expanding volume validates breakout
    df["vol_sma"] = df["volume"].rolling(bb_period).mean()
    df["vol_expanding"] = df["volume"] > df["vol_sma"] * 1.5

    # Liquidity filter
    df["adv_20"] = df["volume"].rolling(20).mean()
    df["valid_squeeze"] = (
        df["is_squeeze"] & df["vol_expanding"] & (df["adv_20"] >= min_adv)
    )
    return df
```

**Symptomy:**

- Squeeze trwa tygodniami/miesiącami bez breakoutu
- Sygnały squeeze na nisko-płynnych instrumentach nie generują ruchu
- Wysoki odsetek false breakouts po squeeze

**Regex detekcji:** `bollinger.*squeeze|bb_width.*threshold(?!.*volume|.*adv)`

---

### SE-02: Support/Resistance Anchoring Bias

**Severity:** MEDIUM
**Stack:** Charting

**Sytuacja:** Rysujesz S/R levels sprzed 2 lat. Rynek dawno zapomniał o tych poziomach — kontekst się zmienił (split, zmiana fundamentów, sektor rotation). Stare linie to szum wizualny.

**Dlaczego to boli:** Anchoring bias każe traktować historyczne poziomy jako aktualne. Trader czeka na "odbicie od wsparcia", które rynek już nie respektuje — przegapia prawdziwe sygnały.

**Rozwiązanie:**

```python
import numpy as np

def find_sr_levels(
    df: pd.DataFrame,
    lookback: int = 100,
    min_touches: int = 2,
    tolerance: float = 0.005,
) -> list[dict]:
    """S/R with recency expiry and touch weighting."""
    recent = df.tail(lookback)
    highs = recent["high"].values
    lows = recent["low"].values
    levels = []

    for price in np.concatenate([highs, lows]):
        touches = sum(
            1 for h, l in zip(highs, lows)
            if l * (1 - tolerance) <= price <= h * (1 + tolerance)
        )
        if touches >= min_touches:
            levels.append({"price": round(price, 2), "touches": touches})

    # Deduplicate near-identical levels
    levels.sort(key=lambda x: x["price"])
    return _merge_close_levels(levels, tolerance)
```

**Symptomy:**

- S/R levels przebijane bez reakcji cenowej
- Wykres zasypany poziomami — brak priorytetyzacji
- "Historyczne" wsparcie nie generuje odbić

**Regex detekcji:** nie dotyczy

---

### SE-03: TradingView Lightweight Charts Timezone Rendering Bug

**Severity:** HIGH
**Stack:** TradingView

**Sytuacja:** Lightweight Charts renderuje timestamps w lokalnej strefie przeglądarki. Serwer zwraca UTC. Użytkownik w UTC+2 widzi świece przesunięte o 2 godziny — daily candle ma inny close niż w danych źródłowych.

**Dlaczego to boli:** Przesunięte świece oznaczają inny OHLC daily bar, inne sygnały, inne S/R. Każdy użytkownik w innej strefie widzi inne dane — debugging jest koszmarem.

**Rozwiązanie:**

```python
# Server-side: always send UTC epoch seconds
from datetime import datetime, timezone

def to_chart_timestamp(dt: datetime) -> int:
    """Convert to UTC epoch seconds for Lightweight Charts."""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return int(dt.timestamp())

candle = {
    "time": to_chart_timestamp(row["datetime"]),
    "open": row["open"],
    "high": row["high"],
    "low": row["low"],
    "close": row["close"],
}
```

```javascript
// Client-side: configure chart localization
const chart = createChart(containerRef.current, {
  localization: {
    timeFormatter: (ts) => new Date(ts * 1000).toUTCString(),
  },
  timeScale: {
    timeVisible: true,
    secondsVisible: false,
  },
});
```

**Symptomy:**

- Świece przesunięte względem danych źródłowych
- Daily close nie zgadza się między UI a API
- Różne wyniki u użytkowników w różnych strefach czasowych

**Regex detekcji:** `createChart\([^)]*\)(?![^;]*localization)|\.setData\(.*(?!timestamp)`

---

### SE-04: Backtest Fill Price vs Chart Display Price

**Severity:** HIGH
**Stack:** Calculating

**Sytuacja:** Backtest operuje na adjusted close (korekta splitów i dywidend). Wykres wyświetla unadjusted price. Sygnał "buy at $50" — ale w backteście adjusted close to $45 (pre-split equivalent). Linie S/R i markery entry nie trafiają w ceny na wykresie.

**Dlaczego to boli:** Użytkownik nie może wizualnie zweryfikować sygnałów backtestowych. Traci zaufanie do systemu albo — gorzej — ślepo ufa wynikowi, którego nie rozumie.

W tym skillu chodzi o walidację spójności sygnału i wykresu; pełny backtesting, execution, sizing i koszty należą do `implementing-trading-strategies`.

**Rozwiązanie:**

```python
# Option A: adjusted everywhere (consistent)
def prepare_chart_data(df: pd.DataFrame, adj: bool = True) -> pd.DataFrame:
    """Use same price mode for backtest and chart."""
    price_col = "adj_close" if adj else "close"
    return df[["datetime", "open", "high", "low", price_col, "volume"]].rename(
        columns={price_col: "close"}
    )

# Option B: unadjusted chart + adjusted returns
def calculate_returns(df: pd.DataFrame) -> pd.Series:
    """Calculate returns from adjusted close, display unadjusted."""
    return df["adj_close"].pct_change()

# Always label price mode in API response
response = {
    "candles": candles,
    "price_mode": "adjusted",  # explicit label
    "signals": signals,
}
```

**Symptomy:**

- Sygnały buy/sell nie trafiają na ceny widoczne na wykresie
- S/R levels z backtestowe nie wyświetlają się poprawnie
- Użytkownik zgłasza "dane się nie zgadzają"

**Regex detekcji:** nie dotyczy

---

### SE-05: Indicator Calculation Off-By-One

**Severity:** CRITICAL
**Stack:** Calculating

**Sytuacja:** `SMA(20)` via `rolling(20).mean()` daje wartość dla bieżącej świecy włącznie. Jeśli generujesz sygnał na bieżącej świecy używając SMA zawierającej tę świecę — w real-time je to look-ahead bias, bo świeca jeszcze się nie zamknęła.

**Dlaczego to boli:** Backtest wygląda świetnie, bo operuje na zamkniętych świecach. Live trading generuje sygnały na niedomkniętej świecy — SMA zmienia się z każdym tickiem. Wyniki live dramatycznie gorsze niż backtest.

**Rozwiązanie:**

```python
# BAD — signal uses current (potentially incomplete) candle
df["sma_20"] = df["close"].rolling(20).mean()
df["signal"] = (df["close"] > df["sma_20"]).astype(int)

# GOOD — signal based on previous completed candle
df["sma_20"] = df["close"].rolling(20).mean()
df["signal"] = (df["close"].shift(1) > df["sma_20"].shift(1)).astype(int)

# GOOD — explicit "act on next open" convention
df["sma_20"] = df["close"].rolling(20).mean()
df["raw_signal"] = (df["close"] > df["sma_20"]).astype(int)
df["entry_price"] = df["open"].shift(-1)  # execute at next bar open
```

Przykład `entry_price` służy tu wyłącznie sprawdzeniu przyczynowości i spójności sygnału; execution, sizing oraz koszty przenieś do `implementing-trading-strategies`.

**Symptomy:**

- Backtest znacząco lepszy niż live trading
- Sygnały "impossible" — reagują na cenę, która jeszcze nie zamknęła
- Rozbieżność między paper trading a backtest

**Regex detekcji:** `rolling\(\d+\)\.mean\(\)(?!\.shift)`

---

### SE-06: Volume Profile Misinterpretation on Low-Liquid Assets

**Severity:** MEDIUM
**Stack:** Calculating

**Sytuacja:** Stosujesz Volume Profile lub VWAP na instrumencie z ADV < 100k. Profil zdominowany przez kilka dużych transakcji blokowych. VWAP skacze — brak statystycznej istotności.

**Dlaczego to boli:** Volume-based levels na niskim wolumenie to artefakty statystyczne, nie realne poziomy równowagi. Trader obstawia poziom, który istnieje tylko z powodu jednego dużego zlecenia.

**Rozwiązanie:**

```python
MIN_ADV_FOR_VOLUME_PROFILE = 500_000

def should_use_volume_profile(df: pd.DataFrame, window: int = 20) -> bool:
    """Check if instrument has sufficient liquidity for volume analysis."""
    adv = df["volume"].tail(window).mean()
    return adv >= MIN_ADV_FOR_VOLUME_PROFILE

def get_sr_method(df: pd.DataFrame) -> str:
    """Select S/R method based on liquidity."""
    if should_use_volume_profile(df):
        return "volume_profile"
    return "price_action"  # pivot points, swing highs/lows
```

**Symptomy:**

- VWAP levels nie generują reakcji cenowej
- Volume Profile POC zmienia się drastycznie dzień do dnia
- Sygnały volume-based gorsze na small-capach niż na large-capach

**Regex detekcji:** nie dotyczy

---

### SE-07: Candle Close Assumption in Multi-Timeframe

**Severity:** HIGH
**Stack:** Calculating

**Sytuacja:** Łączysz sygnał z daily (close 16:00 EST) i 4H (close co 4h). W real-time o 14:00: daily candle jeszcze otwarta, ale 4H właśnie się zamknęła. Sygnał 4H triggeruje entry, ale daily context jest incomplete.

**Dlaczego to boli:** W backteście wszystkie timeframe'y mają complete candles — MTF działa idealnie. W live trading wyższy timeframe jest "w trakcie" przez większość dnia. Sygnały niestabilne — zmieniają się z każdym nowym tickiem na daily.

**Rozwiązanie:**

```python
def align_multi_timeframe(
    df_lower: pd.DataFrame,
    df_higher: pd.DataFrame,
) -> pd.DataFrame:
    """Use only completed higher-TF candles for signals."""
    # Shift higher TF by 1 to avoid incomplete candle
    df_higher["signal"] = df_higher["signal"].shift(1)

    # Merge: lower TF gets last completed higher TF signal
    merged = pd.merge_asof(
        df_lower.sort_values("datetime"),
        df_higher[["datetime", "signal"]].sort_values("datetime"),
        on="datetime",
        direction="backward",
        suffixes=("", "_htf"),
    )
    return merged

# Alternative: trigger ONLY on higher TF close
def should_evaluate(current_time: str, higher_tf: str = "1D") -> bool:
    """Only evaluate MTF signals at higher TF close."""
    if higher_tf == "1D":
        return current_time.endswith("16:00")  # market close
    return False
```

**Symptomy:**

- Sygnały MTF niestabilne w ciągu dnia
- Backtest MTF znacząco lepszy niż live
- Sygnał zmienia kierunek kilka razy w ciągu sesji

**Regex detekcji:** `resample\(.*\).*(?!shift)|timeframe.*daily.*(?!shift)`

---

### SE-08: Moving Average on Insufficient Data

**Severity:** HIGH
**Stack:** Calculating

**Sytuacja:** SMA(200) na instrumencie z 150 barami danych. Pandas `rolling(200).mean()` zwraca NaN dla pierwszych 199 barów. Jeśli nie sprawdzisz `min_periods`, sygnały istnieją tylko na ostatnich 51 barach — za mała próba do statystycznie istotnych wniosków.

**Dlaczego to boli:** Backtest na 51 barach nie ma mocy statystycznej, ale może wyglądać dobrze (szczególnie na trending market). Trader optymalizuje strategię na zbyt krótkiej próbie — overfitting gwarantowany.

**Rozwiązanie:**

```python
import pandas as pd

MIN_BARS_RATIO = 3  # minimum 3x lookback period of usable data


def safe_moving_average(
    series: pd.Series, window: int, min_usable_ratio: int = MIN_BARS_RATIO
) -> pd.Series:
    """SMA with data sufficiency check."""
    usable_bars = len(series) - window + 1
    required = window * min_usable_ratio

    if usable_bars < required:
        raise ValueError(
            f"Insufficient data: {usable_bars} usable bars, "
            f"need {required} (window={window}, ratio={min_usable_ratio})"
        )

    return series.rolling(window, min_periods=window).mean()


# Usage
df["sma_200"] = safe_moving_average(df["close"], window=200)
```

**Symptomy:**

- Backtest daje sygnały tylko na małym fragmencie danych
- Duża część DataFrame to NaN po obliczeniu wskaźnika
- Strategia "działa" na 50 barach, ale nie na pełnym datasecie

**Regex detekcji:** `rolling\(\d+\)\.mean\(\)(?!.*min_periods|.*dropna)`

---

### SE-09: Insufficient Data Without Graceful Degradation

**Severity:** MEDIUM
**Stack:** Calculating

**Sytuacja:** Dataset jest za krótki dla wybranych wskaźników, ale aplikacja zwraca pusty wykres, same NaN albo wyjątek bez alternatywy analitycznej.

**Dlaczego to boli:** Użytkownik traci wynik, mimo że część analizy mogłaby nadal działać: price action, wolumen, krótszy wskaźnik albo raport o ograniczeniach danych.

**Rozwiązanie:** Zaimplementuj degradację: wykryj brak historii, oznacz wskaźniki jako unavailable, zaproponuj krótszy lookback lub ogranicz analizę do formacji i wolumenu. Raportuj `required_bars`, `available_bars` i listę pominiętych wskaźników.

**Symptomy:** Pusty panel wskaźników, `NaN` na całym wykresie, wyjątek `Insufficient data` bez wskazania brakującej historii, brak informacji o warmupie.

**Regex detekcji:** `raise ValueError\([^)]*Insufficient data|rolling\(\d+\)(?![\s\S]*required_bars)`

---

### SE-10: Ultra-Short Timeframes with Daily Indicators

**Severity:** HIGH
**Stack:** Calculating

**Sytuacja:** Klasyczne wskaźniki daily, takie jak SMA, RSI i MACD, są stosowane na świecach 1m/3m bez uwzględnienia spreadu, szumu mikrostruktury i kosztu każdej zmiany sygnału.

**Dlaczego to boli:** Sygnały mnożą się na losowym ruchu bid-ask, a wykres wygląda aktywnie mimo braku trwałej informacji. Walidacja techniczna przecenia sygnał, który w realnym wykonaniu zniknąłby przez spread i slippage.

**Rozwiązanie:** Dla bardzo krótkich interwałów preferuj VWAP, session range, order-flow context, liquidity filters i minimalny expected move. Pełne koszty i execution przenieś do `implementing-trading-strategies`.

**Symptomy:** Setki sygnałów dziennie, duża zmiana wyniku po jednym ticku, sygnały odwracają się kilka razy w jednej świecy wyższego interwału, brak filtra płynności.

**Regex detekcji:** `(1m|3m|5m|minute).*?(RSI|MACD|SMA|EMA)`

---

### SE-11: Crypto and Forex Session Assumptions

**Severity:** MEDIUM
**Stack:** Data

**Sytuacja:** Kod traktuje crypto jak akcje z weekendami albo forex jak rynek 24/7 bez weekendowej przerwy, rollover i broker-specific daily close.

**Dlaczego to boli:** Resampling daily, volume confirmation i multi-timeframe alignment tworzą inne świece niż użytkownik widzi u dostawcy danych. Sygnały różnią się między giełdami, brokerami i strefami czasu.

**Rozwiązanie:** Zapisz model sesji per asset class: crypto 24/7 z maintenance gaps, forex 24/5 z New York close lub close brokera, akcje według kalendarza giełdy. Timezone i session close muszą trafić do raportu.

**Symptomy:** Daily candle ma inny close niż platforma brokera, weekendowe świece crypto są usuwane, forex pokazuje niedzielną mikroświecę jako pełny dzień.

**Regex detekcji:** `resample\(["']1D["']\)(?![\s\S]*(timezone|session|calendar|market))`

---

### SE-12: Pattern Morphing After Failure

**Severity:** MEDIUM
**Stack:** Pattern Detection

**Sytuacja:** Algorytm raz przypisuje etykietę patternu i utrzymuje ją mimo tego, że formacja zmieniła geometrię albo przekroczyła warunek invalidation.

**Dlaczego to boli:** Raport pokazuje stary scenariusz, bo etykieta patternu jest przyklejona do wykresu. Użytkownik dostaje pozorne potwierdzenie, choć pattern już się rozpadł.

**Rozwiązanie:** Każdy pattern ma `created_at`, maksymalny czas trwania, tolerancję geometrii i invalidation. Po przekroczeniu warunków zmień status na `invalidated` lub `morphed`, zamiast przepisywać historię.

**Symptomy:** Bull flag staje się kanałem spadkowym, ale marker zostaje `bull_flag`; triangle trwa tygodniami bez apex; pattern zmienia nazwę dopiero po ręcznej korekcie.

**Regex detekcji:** `pattern_type|bull_flag|triangle|head_shoulders`

---

### SE-13: False Breakout Without Volume Context

**Severity:** HIGH
**Stack:** Pattern Detection

**Sytuacja:** Breakout jest oznaczony po samym przekroczeniu poziomu ceny, bez wolumenu, retestu, follow-through albo kontekstu zmienności.

**Dlaczego to boli:** Pojedynczy wick, low-liquidity print albo gap może wyglądać jak wybicie. Użytkownik widzi sygnał `confirmed`, mimo że rynek wrócił do strefy w tej samej albo kolejnej świecy.

**Rozwiązanie:** Oznacz pierwszy przebieg jako `candidate`. Potwierdzenie wymaga volume expansion, zamknięcia poza strefą, retestu, range expansion albo innego jawnego filtra zgodnego z rynkiem.

**Symptomy:** Markery breakout na wickach, dużo sygnałów poza sesją o niskim wolumenie, szybki powrót ceny do S/R zone, brak statusu `failed_breakout`.

**Regex detekcji:** `breakout.*(high|close).*level(?![\s\S]*(volume|retest|follow|atr|confirm))`
