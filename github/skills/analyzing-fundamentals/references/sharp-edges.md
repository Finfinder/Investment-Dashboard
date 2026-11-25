# Sharp Edges — Analyzing Fundamentals

Znane pułapki i nieoczywiste błędy, na które natrafisz budując systemy analizy fundamentalnej w stacku **Python (yfinance, OpenBB, pandas) + FastAPI**. Każdy wpis opisuje sytuację, przyczynę bólu, rozwiązanie i symptomy. Lista jest komplementarna wobec anty-wzorców i ostrzeżeń w SKILL.md — nie powielaj ich.

## Spis treści

- [SE-01: WACC Estimation Errors Compound](#se-01-wacc-estimation-errors-compound)
- [SE-02: Non-GAAP Metrics Masking Reality](#se-02-non-gaap-metrics-masking-reality)
- [SE-03: Comparable Companies Selection Bias](#se-03-comparable-companies-selection-bias)
- [SE-04: Earnings Management Red Flags Ignored](#se-04-earnings-management-red-flags-ignored)
- [SE-05: Currency Risk in Cross-Border Valuation](#se-05-currency-risk-in-cross-border-valuation)
- [SE-06: yfinance Data Quality Gaps](#se-06-yfinance-data-quality-gaps)
- [SE-07: Quarterly Data Release Delay](#se-07-quarterly-data-release-delay)
- [SE-08: Monte Carlo DCF z Uniform Distributions](#se-08-monte-carlo-dcf-z-uniform-distributions)

---

### SE-01: WACC Estimation Errors Compound

**Severity:** CRITICAL
**Stack:** Modeling

**Sytuacja:** WACC oparty na beta z 2-letniego okna = 1.45 (volatile tech). Beta z 5 lat = 0.95. Różnica WACC 1–2 p.p. → fair value ±20%. Jedna zmiana okna estymacji beta zmienia rekomendację z „buy" na „hold".

**Dlaczego to boli:** Beta jest niestabilna — okno, benchmark i częstotliwość danych drastycznie wpływają na wynik. Błąd propaguje się multiplikatywnie przez każdy rok prognozy i terminal value. Jeden WACC = fałszywa precyzja.

**Rozwiązanie:** Użyj minimum 3 metody estymacji WACC i prezentuj wynik jako range, nie single-point.

```python
def wacc_range(
    beta_2y: float, beta_5y: float, sector_beta: float,
    risk_free: float, erp: float, cost_of_debt: float,
    tax_rate: float, de_ratio: float,
) -> dict:
    """Estimate WACC range from multiple beta sources."""
    betas = {"2y_reg": beta_2y, "5y_reg": beta_5y, "sector": sector_beta}
    results = {}
    for label, beta in betas.items():
        ke = risk_free + beta * erp
        wd = de_ratio / (1 + de_ratio)
        results[label] = (1 - wd) * ke + wd * cost_of_debt * (1 - tax_rate)
    return {"wacc_estimates": results, "range": (min(results.values()), max(results.values()))}
```

**Symptomy:** Fair value zmienia się o >20% przy zmianie okna beta. Brak uzasadnienia wyboru jednej wartości WACC. Analityk nie zna wrażliwości wyceny na WACC ±1 p.p.

**Regex detekcji:** nie dotyczy — pułapka metodologiczna/modelowa

---

### SE-02: Non-GAAP Metrics Masking Reality

**Severity:** HIGH
**Stack:** Data

**Sytuacja:** Spółka raportuje Adjusted EBITDA = $500M, pomijając $200M SBC. Screener pobiera Adj EBITDA — P/E wygląda świetnie. Realny GAAP EBITDA = $300M. Wycena zawyżona o 67%.

**Dlaczego to boli:** Non-GAAP to marketing finansowy — spółka sama decyduje co „koryguje". SBC jest realnym kosztem (rozmycie). Screener oparty wyłącznie o Non-GAAP daje systematycznie zafałszowany obraz.

**Rozwiązanie:** Porównuj GAAP vs Non-GAAP; flaguj divergence > 20% i SBC > 10% revenue.

```python
def flag_non_gaap_divergence(
    gaap_ebitda: float, adjusted_ebitda: float,
    sbc: float, revenue: float, threshold: float = 0.20,
) -> dict:
    divergence = abs(adjusted_ebitda - gaap_ebitda) / gaap_ebitda
    sbc_pct = sbc / revenue
    warnings = []
    if divergence > threshold:
        warnings.append(f"GAAP vs Non-GAAP divergence: {divergence:.1%}")
    if sbc_pct > 0.10:
        warnings.append(f"SBC = {sbc_pct:.1%} of revenue — dilution risk")
    return {"divergence_pct": divergence, "sbc_pct": sbc_pct,
            "use_gaap": divergence > threshold, "warnings": warnings}
```

**Symptomy:** Spółka „tania" na Non-GAAP ale droga na GAAP. SBC > 10% revenue. Rosnąca rozbieżność GAAP vs Adjusted z kwartału na kwartał.

**Regex detekcji:** nie dotyczy — pułapka metodologiczna/modelowa

---

### SE-03: Comparable Companies Selection Bias

**Severity:** HIGH
**Stack:** Valuation

**Sytuacja:** Analityk wybiera 5 peerów, pomija outlier z P/E 8x (bo „nie jest reprezentatywny"). Median peer P/E = 25x, ze wszystkimi peerami: 18x. Wycena zmienia się o 40%.

**Dlaczego to boli:** Subiektywna selekcja → confirmation bias. Bez udokumentowanych kryteriów inclusion/exclusion wynik jest niereprodukowalny i nieweryfikowalny.

**Rozwiązanie:** Zdefiniuj obiektywne kryteria (GICS, revenue range, geography). Mierz impact excluded peers na medianę wyceny.

```python
def select_peers(
    target: str, universe: pd.DataFrame,
    gics_sector: str, rev_min: float, rev_max: float,
) -> dict:
    peers = universe[
        (universe["gics_sector"] == gics_sector)
        & (universe["revenue"].between(rev_min, rev_max))
        & (universe["ticker"] != target)
    ]
    full_median = universe[universe["gics_sector"] == gics_sector]["ev_ebitda"].median()
    peer_median = peers["ev_ebitda"].median()
    return {"included_count": len(peers), "peer_median": peer_median,
            "full_sector_median": full_median,
            "selection_impact_pct": (peer_median - full_median) / full_median}
```

**Symptomy:** Peer group < 5 spółek. Brak kryteriów selekcji w raporcie. Usunięcie jednej spółki zmienia wycenę o >15%.

**Regex detekcji:** nie dotyczy — pułapka metodologiczna/modelowa

---

### SE-04: Earnings Management Red Flags Ignored

**Severity:** CRITICAL
**Stack:** Data

**Sytuacja:** Spółka raportuje ciągły wzrost EPS przez 20 kwartałów. Pod spodem: channel stuffing, cookie jar reserves, agresywne ujmowanie przychodów. Kiedy manipulacja się wyczerpie — krach kursu 30–60%.

**Dlaczego to boli:** „Ładne" wyniki przykrywają manipulację. Model ekstrapoluje sztuczny trend. Restatement lub write-off niszczy pozycję inwestora w jeden dzień.

**Rozwiązanie:** Sprawdź OCF/NI ratio, trend DSO, accruals ratio i uproszczony Beneish DSRI.

```python
def earnings_quality_checks(
    operating_cf: float, net_income: float,
    receivables: float, receivables_prev: float,
    revenue: float, revenue_prev: float,
    total_assets: float, total_assets_prev: float,
) -> dict:
    cf_to_ni = operating_cf / net_income if net_income else 0.0
    dso_curr = (receivables / revenue) * 365 if revenue else 0.0
    dso_prev = (receivables_prev / revenue_prev) * 365 if revenue_prev else 0.0
    accruals = (net_income - operating_cf) / ((total_assets + total_assets_prev) / 2)
    dsri = (receivables / revenue) / (receivables_prev / revenue_prev) if revenue_prev and receivables_prev else 1.0
    flags = []
    if cf_to_ni < 0.8: flags.append(f"Low OCF/NI: {cf_to_ni:.2f}")
    if dso_curr - dso_prev > 10: flags.append(f"DSO +{dso_curr - dso_prev:.0f}d")
    if accruals > 0.10: flags.append(f"Accruals: {accruals:.2%}")
    if dsri > 1.05: flags.append(f"DSRI = {dsri:.2f}")
    return {"flags": flags, "risk": "HIGH" if len(flags) >= 2 else "LOW"}
```

**Symptomy:** OCF/NI < 0.6. Rosnące DSO przy rosnących przychodach. Accruals ratio > 10% aktywów. Beneish M-Score > -1.78.

**Regex detekcji:** nie dotyczy — pułapka metodologiczna/modelowa

---

### SE-05: Currency Risk in Cross-Border Valuation

**Severity:** HIGH
**Stack:** Modeling

**Sytuacja:** Porównujesz spółkę PLN z USD. PLN osłabiło się 15% — EV/EBITDA LTM wygląda inaczej w PLN vs USD. DCF z cash flows w PLN i WACC w USD = nonsens metodologiczny.

**Dlaczego to boli:** Mieszanie walut generuje niejawne założenie o przyszłym kursie. Porównanie spółek z różnych walut bez country risk premium daje fałszywy ranking.

**Rozwiązanie:** Cash flows i WACC w tej samej walucie. Terminal growth koryguj o inflation differential. Dodaj country risk premium dla EM.

```python
def cross_border_dcf_params(
    local_inflation: float, target_inflation: float,
    base_tgr: float, country_risk_premium: float = 0.0,
) -> dict:
    diff = local_inflation - target_inflation
    return {
        "terminal_growth_local_ccy": base_tgr + diff,
        "wacc_country_premium": country_risk_premium,
        "rule": "Cash flows and WACC must be in the same currency",
    }
# PLN: inflation 5%, US 2%, base TGR 2.5% → adjusted TGR = 5.5% in PLN
```

**Symptomy:** Cash flows w jednej walucie, WACC w innej. Wycena zmienia się z datą spot rate. Brak country risk premium.

**Regex detekcji:** nie dotyczy — pułapka metodologiczna/modelowa

---

### SE-06: yfinance Data Quality Gaps

**Severity:** HIGH
**Stack:** Python

**Sytuacja:** `yf.Ticker("AAPL").financials` zwraca NaN dla niektórych kwartałów. `yf.download()` ma luki w adjusted close po splitach. Brak błędu API — brakujące dane cicho propagują się przez pipeline.

**Dlaczego to boli:** NaN w pandas propaguje się bez wyjątku: `NaN * 5 = NaN`, `NaN > 0 = False`. ROE = NaN nie rzuci błędu — dostaniesz pusty wykres lub filtr odrzucający spółki.

**Rozwiązanie:** Waliduj null percentage i brak pełnych NaN-kolumn. Sprawdzaj skoki cen > 50% (sygnał błędnych splitów).

```python
def fetch_financials_safe(ticker: str) -> pd.DataFrame:
    df = yf.Ticker(ticker).financials
    if df is None or df.empty:
        raise ValueError(f"No data for {ticker}")
    null_pct = df.isnull().sum().sum() / df.size
    if null_pct > 0.1:
        raise ValueError(f"{ticker}: {null_pct:.1%} nulls — insufficient quality")
    full_nan = df.columns[df.isnull().all()]
    if len(full_nan) > 0:
        raise ValueError(f"{ticker}: missing quarters: {list(full_nan)}")
    return df

def validate_prices(prices: pd.Series, ticker: str) -> pd.Series:
    if prices.isnull().any():
        raise ValueError(f"{ticker}: price gaps on {prices[prices.isnull()].index.tolist()}")
    extreme = prices.pct_change().dropna().pipe(lambda s: s[s.abs() > 0.5])
    if len(extreme) > 0:
        raise ValueError(f"{ticker}: suspicious jumps >50%: {extreme.index.tolist()}")
    return prices
```

**Symptomy:** NaN w wskaźnikach. Screener zwraca mniej spółek niż oczekiwano. Dziwne skoki w time-series. ROE = inf.

**Regex detekcji:** `yf\.(Ticker|download)\([^)]*\)(?!\s*\n\s*assert)`

---

### SE-07: Quarterly Data Release Delay

**Severity:** HIGH
**Stack:** Data

**Sytuacja:** Q4 wyniki raportowane w lutym. Model używa Q4 data od 1 stycznia — kiedy jeszcze nie były publiczne. Fundamental screening na „Q4 results" z datą 2 stycznia = look-ahead bias.

**Dlaczego to boli:** Backtest używa danych, które w danym momencie nie były publiczne. Strategia „value screening" wygląda świetnie, ale live nie ma dostępu do przyszłych danych. Wynik zawyżony o premię informacyjną, która realnie nie istnieje.

**Rozwiązanie:** Mapuj SEC filing date (nie fiscal period end). Używaj danych dopiero od daty publikacji + lag (np. +1 dzień roboczy).

```python
def get_available_fundamentals(
    ticker: str, as_of_date: str, filing_lag_days: int = 1,
) -> pd.DataFrame:
    """Return only financials that were PUBLIC as of given date."""
    filings = fetch_sec_filings(ticker)  # must include filing_date
    cutoff = pd.Timestamp(as_of_date) - pd.Timedelta(days=filing_lag_days)
    available = filings[filings["filing_date"] <= cutoff]
    if available.empty:
        raise ValueError(f"No public filings for {ticker} as of {as_of_date}")
    return available

# BAD:  financials[financials["fiscal_period_end"] <= "2024-12-31"]
# GOOD: financials[financials["filing_date"] <= "2025-01-02"]
```

**Symptomy:** Backtest performance znacząco lepsza niż live. Screening zwraca Q4 data w styczniu. Brak kolumny `filing_date` — użycie `fiscal_period_end` jako proxy.

**Regex detekcji:** nie dotyczy — pułapka metodologiczna/modelowa

---

### SE-08: Monte Carlo DCF z Uniform Distributions

**Severity:** MEDIUM
**Stack:** Modeling

**Sytuacja:** Monte Carlo z `np.random.uniform(low, high)` dla WACC, growth i margins. Rozkład uniform zakłada, że 8% WACC jest tak samo prawdopodobny jak 15%. Wynik: absurdalnie szerokie confidence intervals bez actionable insight.

**Dlaczego to boli:** Uniform nie oddaje rzeczywistości. Confidence interval $50–$200 per share jest bezużyteczny. Fałszywe poczucie „naukowej" analizy.

**Rozwiązanie:** Triangular dla growth (asymetryczny, bounded). Normal dla WACC (centered na CAPM). Clip do sensownych granic. Target: p90/p10 ratio < 3x.

```python
def monte_carlo_dcf(
    base_fcf: float, n_years: int, shares: float, n_sims: int = 10_000,
    wacc_params: tuple = (0.10, 0.015),
    growth_params: tuple = (0.05, 0.08, 0.03),
    seed: int = 42,
) -> dict:
    rng = np.random.default_rng(seed)
    growth = rng.triangular(*growth_params, size=n_sims)
    wacc = np.clip(rng.normal(*wacc_params, size=n_sims), 0.04, 0.20)
    fv = []
    for i in range(n_sims):
        pv = sum(base_fcf * (1 + growth[i]) ** t / (1 + wacc[i]) ** t for t in range(1, n_years + 1))
        tv = base_fcf * (1 + growth[i]) ** n_years * 1.025 / (wacc[i] - 0.025)
        fv.append((pv + tv / (1 + wacc[i]) ** n_years) / shares)
    fv = np.array(fv)
    return {"median": float(np.median(fv)), "p10": float(np.percentile(fv, 10)),
            "p90": float(np.percentile(fv, 90)),
            "p90_p10_ratio": float(np.percentile(fv, 90) / np.percentile(fv, 10))}
# If p90/p10 > 3x — distributions too wide, refine inputs
```

**Symptomy:** Range np. $50–$200 (bezużyteczny). p90/p10 > 4x. Brak korelacji między parametrami.

**Regex detekcji:** nie dotyczy — pułapka metodologiczna/modelowa
