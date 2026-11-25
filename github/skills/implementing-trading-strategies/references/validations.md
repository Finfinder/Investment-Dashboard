# Reguły Walidacji — Implementing Trading Strategies

Reguły walidacji specyficzne dla stacku **Python (pandas, numpy, backtesting.py, vectorbt) + yfinance/OpenBB (data)**. Ten plik przechowuje pełny resource tier kontroli, które aktywny `SKILL.md` tylko sygnalizuje: dane, backtest, koszty, OOS, risk, paper/live i monitoring driftu.

**Sposób użycia:** Dla każdej reguły uruchom `grep_search` z podanym wzorcem regex i wzorcem `includePattern` odpowiadającym polu „Dotyczy". Traktuj trafienia jako kandydatów — zweryfikuj kontekst przed zgłoszeniem.

## Spis Treści

- [Podsumowanie reguł](#podsumowanie-reguł)
- [Data Quality](#data-quality)
- [Backtest Integrity](#backtest-integrity)
- [Live Deployment](#live-deployment)
- [Guard Rails Aktywnego Procesu](#guard-rails-aktywnego-procesu)
- [Checklist Deploymentu](#checklist-deploymentu)
- [Kryteria Review PR](#kryteria-review-pr)

## Podsumowanie reguł

| ID | Nazwa | Severity | Kategoria |
| --- | --- | --- | --- |
| V-01 | NaN Not Handled in Price Series | ERROR | Data Quality |
| V-02 | Timezone-Naive Datetime in Multi-Market | ERROR | Data Quality |
| V-03 | Adjusted vs Unadjusted Price Mismatch | WARNING | Data Quality |
| V-04 | Future Data Leak via Pandas Join | CRITICAL | Backtest Integrity |
| V-05 | Backtest Without Slippage Model | WARNING | Backtest Integrity |
| V-06 | Walk-Forward Not Implemented | WARNING | Backtest Integrity |
| V-07 | Position Size as Constant | WARNING | Backtest Integrity |
| V-08 | Order Without Pre-Trade Validation | CRITICAL | Live Deployment |
| V-09 | Missing Kill Switch | ERROR | Live Deployment |
| V-10 | Logging Insufficient for Trade Audit | INFO | Live Deployment |
| V-11 | Signal Not Shifted | CRITICAL | Backtest Integrity |
| V-12 | No Out-of-Sample Holdout | ERROR | Validation |
| V-13 | Transaction Costs Missing | ERROR | Backtest Integrity |
| V-14 | Insufficient Trade Sample | WARNING | Validation |
| V-15 | Missing Stop-Loss or Invalidation | ERROR | Risk Management |
| V-16 | Risk/Reward Not Calculated | WARNING | Risk Management |
| V-17 | Multi-Timeframe Future Leak | ERROR | Backtest Integrity |
| V-18 | Volume Confirmation Missing for Breakout | INFO | Signal Quality |
| V-19 | Indicator Lag Not Documented | INFO | Signal Quality |
| V-20 | No Capacity Check | WARNING | Execution |
| V-21 | Drift Monitoring Missing | ERROR | Live Deployment |

---

## Data Quality

### V-01: NaN Not Handled in Price Series

**Severity:** ERROR  
**Dotyczy:** `**/*.py`

**Opis:** Brak asercji lub sprawdzeń na NaN po pobraniu danych lub obliczeniu wskaźników — NaN propaguje cicho przez cały pipeline, prowadząc do fałszywych sygnałów i błędnych wyników backtestu.

**Regex detekcji:**

```regex
yf\.download\(|\.rolling\(.*\)\.mean\(\)|ta\.\w+\((?!.*dropna|.*isnull|.*assert|.*fillna)
```

**Akcja naprawcza:** Dodaj `assert not df.isnull().any().any()` po każdym etapie pipeline (pobranie danych, obliczenie wskaźników, generacja sygnałów).

---

### V-02: Timezone-Naive Datetime in Multi-Market

**Severity:** ERROR  
**Dotyczy:** `**/*.py`

**Opis:** Użycie `pd.Timestamp` bez timezone lub merge bez konwersji tz — dane z różnych rynków (np. NYSE + GPW) łączone po naive date, co powoduje przesunięcie sesji i błędne sygnały.

**Regex detekcji:**

```regex
pd\.Timestamp\((?!.*tz)|pd\.merge\(.*on=.*(?:date|Date).*(?!.*tz)|\.index\.tz\s*is\s*None
```

**Akcja naprawcza:** Wszystkie timestamps konwertuj do UTC. Dodaj asercję `assert df.index.tz is not None` po każdym załadowaniu danych.

---

### V-03: Adjusted vs Unadjusted Price Mismatch

**Severity:** WARNING  
**Dotyczy:** `**/*.py`

**Opis:** Mieszanie kolumny Adj Close (z yfinance) z unadjusted OHLC bez jasnego oznaczenia — błędne obliczenia zwrotów i wskaźników opartych na cenach.

**Regex detekcji:**

```regex
['"]Adj Close['"].*['"]Close['"]|adjusted.*unadjusted|adj_close.*close(?!.*_adj)
```

**Akcja naprawcza:** Jeden tryb cenowy — albo wszystko adjusted (split + dywidenda), albo split-only adjusted z osobnym śledzeniem dywidend.

---

## Backtest Integrity

### V-04: Future Data Leak via Pandas Join

**Severity:** CRITICAL
**Dotyczy:** `**/*.py`

**Opis:** `pd.merge()` lub `.join()` bez sortowania i shift może wprowadzić future data — np. dane fundamentalne dostępne dopiero po earnings date, ale joinowane na quarter date.

**Regex detekcji:**

```regex
pd\.merge\([^)]*\)(?![^;]*(shift|as_of|point_in_time))|\.join\([^)]*\)(?![^;]*shift)
```

**Akcja naprawcza:** Point-in-time join — dane fundamentalne shifted o reporting delay (min. 45 dni). Dodaj komentarz z datą dostępności danych.

---

### V-05: Backtest Without Slippage Model

**Severity:** WARNING  
**Dotyczy:** `**/*.py`

**Opis:** Backtest zakłada fill na dokładnej cenie sygnału — brak modelu slippage i spreadu prowadzi do zawyżonych wyników, szczególnie na mniej płynnych instrumentach.

**Regex detekcji:**

```regex
Backtest\(|bt\.run\(|strategy\.run\((?!.*slippage|.*commission|.*spread)
```

**Akcja naprawcza:** Dodaj minimum `slippage=0.001` (0.1%) i `commission=0.001`. Dla mało płynnych instrumentów użyj modelu opartego na wolumenie.

---

### V-06: Walk-Forward Not Implemented

**Severity:** WARNING  
**Dotyczy:** `**/*.py`

**Opis:** Optymalizacja parametrów na pełnym datasecie bez walk-forward split — prowadzi do overfittingu i wyników niereplikowalnych na live.

**Regex detekcji:**

```regex
optimize\(|grid_search\(|param.*range\((?!.*TimeSeriesSplit|.*walk_forward|.*expanding)
```

**Akcja naprawcza:** Użyj `TimeSeriesSplit` z minimum 5 splits i ratio train/test 80/20. Porównaj stabilność wyników między foldami.

---

### V-07: Position Size as Constant

**Severity:** WARNING  
**Dotyczy:** `**/*.py`

**Opis:** Stały rozmiar pozycji (`position_size = 1000`, `shares = 100`) niezależny od volatility i equity — brak zarządzania ryzykiem na poziomie pozycji.

**Regex detekcji:**

```regex
position_size\s*=\s*\d+|shares\s*=\s*\d+|size\s*=\s*(?:0\.\d+|\d+)(?!.*atr|.*risk|.*equity|.*volatility)
```

**Akcja naprawcza:** Risk-based sizing: `size = (equity * risk_pct) / (entry - stop_loss)`. Uwzględnij ATR lub historyczną volatility.

---

## Live Deployment

### V-08: Order Without Pre-Trade Validation

**Severity:** CRITICAL  
**Dotyczy:** `**/*.py`

**Opis:** Zlecenie wysyłane bez sprawdzenia limitów — brak walidacji max rozmiaru pozycji, max ekspozycji portfela i dziennego limitu transakcji.

**Regex detekcji:**

```regex
\.(submit_order|place_order|create_order|send_order)\((?!.*validate|.*check|.*limit)
```

**Akcja naprawcza:** Pre-trade validation layer: sprawdzaj max position size, max order value, daily trade limit i exposure limit przed każdym zleceniem.

---

### V-09: Missing Kill Switch

**Severity:** ERROR
**Dotyczy:** `**/*.py`

**Opis:** Pętla live tradingu bez mechanizmu awaryjnego zatrzymania — brak reakcji na max drawdown, serię strat lub awarię danych.

**Regex detekcji:**

```regex
while\s+True.*(?:trade|order|signal)(?!.*kill_switch|.*max_drawdown|.*emergency|.*circuit_breaker)
```

**Akcja naprawcza:** Kill switch: `if drawdown > threshold → flatten all positions, pause trading, send alert`. Implementuj circuit breaker z cooldown period.

---

### V-10: Logging Insufficient for Trade Audit

**Severity:** INFO  
**Dotyczy:** `**/*.py`

**Opis:** Wykonanie transakcji bez logowania pełnego kontekstu — brak możliwości audytu i analizy post-trade (signal reason, ceny, slippage).

**Regex detekcji:**

```regex
(submit_order|place_order|execute).*(?!.*log|.*logger|.*record|.*audit)
```

**Akcja naprawcza:** Log per trade: timestamp, instrument, side, price, size, signal_reason, fill_price, slippage. Zapisuj do strukturalnego formatu (JSON/CSV).

---

## Guard Rails Aktywnego Procesu

### V-11: Signal Not Shifted

**Severity:** CRITICAL
**Dotyczy:** `**/*.py`

**Opis:** Sygnał barowy jest używany do pozycji na tej samej świecy, która go wygenerowała. To wprowadza look-ahead bias i zawyża wynik backtestu.

**Regex detekcji:**

```regex
position\s*=\s*(?:np\.where\()?\s*(?:signal|indicator)|\[["']position["']\]\s*=\s*\(?\s*(?:signal|indicator)(?!\.shift)
```

**Akcja naprawcza:** Użyj `signal.shift(1)` dla danych barowych albo event-driven engine z jawną kolejnością eventów. Dodaj test porównujący timestamp sygnału i timestamp fill.

---

### V-12: No Out-of-Sample Holdout

**Severity:** ERROR
**Dotyczy:** `**/*.py`, `**/*.ipynb`, `**/*.md`

**Opis:** Kod dzieli dane tylko na train/test albo optymalizuje na pełnej historii. Brakuje finalnego OOS, który nie uczestniczy w wyborze strategii i parametrów.

**Regex detekcji:**

```regex
train_test_split|iloc\[:.*\].*iloc\[.*:\]|optimize\(|grid_search\(
```

**Akcja naprawcza:** Wydziel train/validation/OOS przed strojeniem. Finalny OOS oceniaj raz po wyborze strategii; dalsze strojenie po OOS otwiera nowy eksperyment.

---

### V-13: Transaction Costs Missing

**Severity:** ERROR
**Dotyczy:** `**/*.py`

**Opis:** Backtest nie zawiera prowizji, spreadu, slippage lub market impact. Koszty są częścią strategii od pierwszego testu, nie dodatkiem przed live.

**Regex detekcji:**

```regex
Backtest\(|bt\.run\(|portfolio\.from_signals\((?!.*commission|.*fees|.*slippage|.*spread|.*cost)
```

**Akcja naprawcza:** Dodaj model kosztów odpowiadający klasie aktywów i uruchom sensitivity check dla 2x oraz 5x spread/slippage.

---

### V-14: Insufficient Trade Sample

**Severity:** WARNING
**Dotyczy:** `**/*.py`, `**/*.ipynb`, `**/*.md`

**Opis:** Strategia oceniana na zbyt małej liczbie transakcji. Mniej niż 30 transakcji nie wystarcza do wstępnej oceny, a wiele strategii wymaga znacznie większej próby.

**Regex detekcji:**

```regex
trade_count\s*[<>=]+\s*(?:[0-2]?\d|30)|len\(trades\)\s*[<>=]+\s*(?:[0-2]?\d|30)
```

**Akcja naprawcza:** Raportuj trade count per split i per regime. Jeśli strategia jest low-frequency, wydłuż historię, dodaj instrumenty albo obniż pewność wnioskowania.

---

### V-15: Missing Stop-Loss or Invalidation

**Severity:** ERROR
**Dotyczy:** `**/*.py`

**Opis:** Pozycja ma entry, ale nie ma stop-loss, time stop, regime invalidation ani warunku wyjścia niezależnego od targetu. Ryzyko pojedynczej transakcji jest nieograniczone.

**Regex detekcji:**

```regex
enter_long\(|enter_short\(|buy\(|sell\((?!.*stop|.*invalidation|.*exit|.*time_stop|.*atr)
```

**Akcja naprawcza:** Zdefiniuj stop-loss albo invalidation przed backtestem. Uwzględnij gap risk w position sizing, szczególnie dla overnight i event-driven setups.

---

### V-16: Risk/Reward Not Calculated

**Severity:** WARNING
**Dotyczy:** `**/*.py`

**Opis:** Setup ma entry i stop, ale nie liczy potencjalnego zysku względem ryzyka. Bez R:R strategia może mieć dodatni hit rate i ujemną oczekiwaną wartość.

**Regex detekcji:**

```regex
risk_reward|rr_ratio|reward_to_risk|expected_value
```

**Akcja naprawcza:** Dodaj `risk = abs(entry - stop)`, `reward = abs(target - entry)` i raportuj R:R oraz expectancy. Dla systemów bez targetu użyj historycznego avg win/loss.

---

### V-17: Multi-Timeframe Future Leak

**Severity:** ERROR
**Dotyczy:** `**/*.py`

**Opis:** Resampling wyższego interwału używa niezamkniętej świecy, np. daily high/close w trakcie dnia. Niższy interwał widzi dane z przyszłości.

**Regex detekcji:**

```regex
resample\([^)]*["'](?:D|W|M|4H|1H)["'][^\n]*(?:\.agg|\.last|\.max|\.min)(?![^\n]*shift)
```

**Akcja naprawcza:** Po resamplingu shiftuj wynik względem niższego interwału i testuj, że timestamp sygnału wyższego interwału jest zamknięty przed decyzją.

---

### V-18: Volume Confirmation Missing for Breakout

**Severity:** INFO
**Dotyczy:** `**/*.py`

**Opis:** Strategia breakout/reversal generuje sygnał bez potwierdzenia wolumenem lub liquidity. Może łapać fałszywe wybicia o niskiej jakości wykonania.

**Regex detekcji:**

```regex
breakout|reversal|support|resistance
```

**Akcja naprawcza:** Rozważ filtr wolumenu, spreadu albo participation rate. Jeśli świadomie pomijasz wolumen, opisz dlaczego i pokaż test bez pogorszenia fill quality.

---

### V-19: Indicator Lag Not Documented

**Severity:** INFO
**Dotyczy:** `**/*.py`, `**/*.md`

**Opis:** Strategia używa lagging indicators bez komentarza o opóźnieniu i roli wskaźnika. To utrudnia review look-ahead i timing wejść.

**Regex detekcji:**

```regex
RSI|MACD|SMA|EMA|Bollinger|moving_average
```

**Akcja naprawcza:** Udokumentuj, czy wskaźnik jest filtrem reżimu, triggerem entry czy kontekstem. Jeśli jest triggerem, pokaż shift i warunek potwierdzenia.

---

### V-20: No Capacity Check

**Severity:** WARNING
**Dotyczy:** `**/*.py`

**Opis:** Strategia nie sprawdza udziału zlecenia w wolumenie/ADV i może skalować się do rozmiaru niszczącego edge.

**Regex detekcji:**

```regex
average_daily_volume|ADV|participation_rate|capacity|market_impact
```

**Akcja naprawcza:** Dodaj limit participation rate, test najgorszych dni płynności i market impact zależny od order size.

---

### V-21: Drift Monitoring Missing

**Severity:** ERROR
**Dotyczy:** `**/*.py`, `**/*.yml`, `**/*.yaml`, `**/*.md`

**Opis:** Strategia live monitoruje tylko P&L albo nie ma monitoringu rolling metrics. Brak wykrywania degradacji edge, zmian reżimu i odchylenia execution od backtestu.

**Regex detekcji:**

```regex
rolling_sharpe|drift|drawdown_alert|slippage_alert|hit_rate|regime_change|data_feed_health
```

**Akcja naprawcza:** Monitoruj rolling Sharpe, drawdown, hit rate, avg win/loss, slippage vs model, data feed health i zgodność pozycji z brokerem. Degradacja poza próg uruchamia kill switch lub review.

---

## Checklist Deploymentu

```text
- [ ] Dane są point-in-time, adjusted i walidowane pod kątem braków.
- [ ] Sygnały są shifted albo generowane event-driven.
- [ ] Koszty obejmują spread, prowizje, slippage, impact i funding/swap/margin.
- [ ] Walk-forward i finalny OOS są oddzielone od optymalizacji.
- [ ] Trade count, sample size i wyniki per regime są raportowane.
- [ ] Stop-loss/invalidation, R:R, position sizing i capacity check są wdrożone.
- [ ] Paper trading pokazuje zgodność filli, slippage i metryk z backtestem.
- [ ] Pre-trade validation, audit log, kill switch i flatten all są przetestowane.
- [ ] Monitoring driftu, danych, pozycji, slippage i drawdownu ma alerty.
```

## Kryteria Review PR

| Obszar | Pytanie review | Minimalny dowód |
| --- | --- | --- |
| Dane | Czy dane były dostępne w chwili decyzji? | Point-in-time join, daty publikacji, brak future joins. |
| Backtest | Czy engine respektuje timing i fill model? | `shift(1)` albo event-driven tests. |
| Koszty | Czy edge przetrwa gorsze koszty? | Sensitivity 2x/5x spread/slippage. |
| OOS | Czy finalny OOS był nietknięty? | Split zapisany przed optymalizacją. |
| Risk | Czy pojedynczy trade i portfolio mają limity? | Stop/invalidation, sizing, drawdown, exposure. |
| Execution | Czy live może bezpiecznie wysyłać zlecenia? | Pre-trade checks, idempotencja, reconciliation. |
| Monitoring | Czy system zatrzyma się przy degradacji? | Alerty driftu, kill switch, procedura review. |
