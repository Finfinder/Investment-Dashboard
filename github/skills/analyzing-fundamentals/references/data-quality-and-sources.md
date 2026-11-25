# Jakość Danych i Źródła

Szczegóły do ładowania, gdy zadanie dotyczy pobierania, normalizacji, walidacji albo audytu danych fundamentalnych. Celem jest reprodukowalny data contract, który nie miesza źródeł, walut, jednostek ani dat dostępności informacji.

## Źródła Danych

| Źródło | Zakres | Uwagi |
| --- | --- | --- |
| SEC EDGAR | 10-K, 10-Q, 8-K, filing dates | Oficjalne filingi US; preferowane dla audytu i point-in-time. |
| Raporty giełdowe / IR | Raporty okresowe, prezentacje, noty | Najlepsze dla spółek spoza US i niestandardowych segmentów. |
| Yahoo Finance (`yfinance`) | Ceny, podstawowe sprawozdania, market data | Dobry punkt startu; wymaga walidacji luk, splitów i NaN. |
| Financial Modeling Prep | Ratios, statements, screener, DCF | Wygodne REST API; sprawdzaj limity i metodologię pól. |
| OpenBB | Agregacja wielu źródeł | Przydatne w prototypach; dokumentuj vendor source dla każdego pola. |
| FRED (`fredapi`) | Stopy, inflacja, GDP, spready | Oficjalne dane makro do WACC, scenariuszy i cyklu. |
| Bloomberg / Refinitiv | Dane instytucjonalne | Najlepsze pokrycie, ale wymaga licencji i audytu uprawnień. |

## Minimalny Data Contract

Dla każdej spółki przechowuj:

- identyfikatory: ticker, ISIN/CUSIP, exchange, kraj, sektor/GICS, waluta raportowania;
- daty: fiscal period end, filing date, report accepted date, data pobrania, wersja źródła;
- sprawozdania: Income Statement, Balance Sheet, Cash Flow Statement za minimum 5 lat;
- dane rynkowe: cena, shares outstanding, market cap, enterprise value, beta, corporate actions;
- dane makro: risk-free rate, inflacja, spread kredytowy, PMI albo inne założenia użyte w modelu;
- jednostki: tysiące/miliony/miliardy, waluta, częstotliwość kwartalna/roczna.

## Walidacja Kompletności

- Brakujące okresy kwartalne albo roczne oznacz jako błąd danych, nie jako zero.
- Sprawdź tożsamość bilansową `Assets = Liabilities + Equity` z tolerancją zależną od jednostek.
- Porównaj OCF, capex, FCF i net income; duże rozbieżności kieruj do analizy jakości zysku.
- Wykryj pełne kolumny NaN, skoki cen po splitach, niespójne shares outstanding i restatements.
- Dla peer analysis sprawdź, czy wszystkie spółki mają ten sam okres LTM albo jasno opisane wyrównanie.

## Point-in-Time i Filing Dates

Analiza historyczna używa tylko danych publicznych w danym momencie. Fiscal period end nie jest datą dostępności danych.

```python
def get_available_fundamentals(filings, as_of_date, filing_lag_days=1):
    cutoff = pd.Timestamp(as_of_date) - pd.Timedelta(days=filing_lag_days)
    available = filings[filings["filing_date"] <= cutoff]
    if available.empty:
        raise ValueError(f"Brak publicznych filingów na dzień {as_of_date}")
    return available.sort_values("filing_date")
```

Zasady:

- używaj `filing_date` lub `accepted_date`, nie tylko `fiscal_period_end`;
- dodaj opóźnienie dostępności, jeśli vendor publikuje dane z lagiem;
- dla backtestów zapisuj skład indeksu/universe z danej daty, aby uniknąć survivorship bias;
- nie używaj danych po restatement bez oznaczenia wersji i daty rewizji.

## GAAP / IFRS Normalization

Normalizacja cross-standard jest potrzebna przed porównaniem spółek z różnych reżimów rachunkowości. Nie udawaj, że korekta jest neutralna: raportuj jej wpływ.

```python
def normalize_to_gaap(financials, standard):
    if standard == "GAAP":
        return financials

    adjusted = financials.copy()
    capitalized_rd = financials.get("capitalized_rd", 0)
    impairment_reversal = financials.get("impairment_reversal", 0)

    if capitalized_rd:
        adjusted["total_assets"] -= capitalized_rd
        adjusted["operating_income"] -= capitalized_rd
    if impairment_reversal:
        adjusted["net_income"] -= impairment_reversal

    adjusted["normalization_note"] = "IFRS adjusted toward GAAP-equivalent comparability"
    return adjusted
```

Typowe pola do sprawdzenia:

- IFRS capitalized development costs vs GAAP expense treatment;
- impairment reversals dopuszczalne w IFRS, zwykle niedostępne w GAAP;
- leasing, segment reporting, pension assumptions i revenue recognition;
- Non-GAAP adjusted EBITDA, SBC, restructuring charges i one-offs.

## Waluty i Jednostki

- Cash flows, WACC i terminal growth muszą być w tej samej walucie ekonomicznej.
- Nie mieszaj wartości w tysiącach i milionach; normalizuj do jednej jednostki przed wskaźnikami.
- Dla cross-border valuation zapisz spot FX, średni FX, datę kursu i country risk premium.
- Jeśli spółka raportuje w innej walucie niż notowanie akcji, pokaż wpływ FX na fair value i mnożniki.

## Guard Rails Implementacyjne

- Każdy dataset ma kolumny `source`, `filing_date`, `as_of_date`, `currency`, `unit`, `accounting_standard`.
- Walidatory danych uruchamiaj przed obliczeniem wskaźników i przed zapisem do cache.
- Nie imputuj brakujących filingów bez oznaczenia jakości danych.
- Dla `yfinance` i agregatorów zawsze porównaj kluczowe pola z filingiem lub drugim źródłem.
- Błędy danych blokujące wycenę eskaluj do `solution-researching` albo ręcznej weryfikacji źródeł.
