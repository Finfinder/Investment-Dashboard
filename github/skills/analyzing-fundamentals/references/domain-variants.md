# Warianty Domenowe

Ładuj, gdy standardowy zestaw wskaźników lub modeli nie pasuje do typu spółki, regionu albo standardu rachunkowości. Wariant domenowy nie znosi guard raili: nadal wymagane są źródła, filing dates, scenariusze, ryzyka i walidacja walut/jednostek.

## Banki

- Główne miary: CET1, Tier 1, NIM, cost/income, ROE, ROA, NPL ratio, loan loss provisions, deposit beta.
- Wycena: P/TBV, P/B vs ROE, dividend capacity, residual income.
- Ryzyka: jakość portfela kredytowego, duration mismatch, funding costs, regulacje kapitałowe.
- Unikaj: current ratio, EV/EBITDA i klasycznego FCF DCF jako głównego modelu.

## REIT-y

- Główne miary: FFO, AFFO, NAV, occupancy, same-store NOI, cap rate, lease maturity, debt/EBITDA.
- Wycena: P/FFO, P/AFFO, NAV premium/discount, implied cap rate.
- Ryzyka: refinancing, stopy procentowe, koncentracja najemców, jakość aktywów, capex maintenance.
- Unikaj: P/E jako głównej miary i dywidend bez AFFO payout coverage.

## Utilities

- Główne miary: allowed ROE, rate base growth, regulated/unregulated mix, dividend coverage, net debt/EBITDA.
- Wycena: DDM, regulated asset base, EV/EBITDA z peerami utilities.
- Ryzyka: regulacje, capex, stopy procentowe, paliwa, polityka taryfowa.
- Unikaj: porównań z high-growth sektorami i terminal growth powyżej stabilnego nominal GDP.

## Tech / Growth

- Główne miary: revenue growth, gross margin, net retention, CAC payback, rule of 40, SBC/revenue, dilution.
- Wycena: EV/Sales, EV/Gross Profit, revenue-based DCF, path-to-FCF.
- Ryzyka: TAM saturation, konkurencja, pricing power, churn, SBC i potrzeba finansowania.
- Unikaj: P/E przy ujemnych earnings i ignorowania rozwodnienia przez SBC.

## Spółki Cykliczne

- Główne miary: mid-cycle EBITDA, normalized EPS, ROIC through-cycle, inventory, backlog, commodity exposure.
- Wycena: normalized EV/EBITDA, replacement cost, SOTP, stress test spadku wolumenu/marż.
- Ryzyka: peak earnings, commodity cycle, operating leverage, working capital reversal.
- Unikaj: ekstrapolacji ostatniego dobrego roku i terminal growth z fazy szczytu cyklu.

## Cross-Border Valuation

- Cash flows, WACC i terminal growth trzymaj w tej samej walucie.
- Dodaj country risk premium, jeśli rynek, waluta albo regulacje uzasadniają wyższą premię.
- Dokumentuj kurs FX: spot, średni okresowy, data kursu i źródło.
- Porównując peerów z różnych krajów, sprawdź podatki, inflację, stopy i standard rachunkowości.

```python
def cross_border_dcf_params(local_inflation, target_inflation, base_tgr, country_risk_premium=0.0):
    inflation_diff = local_inflation - target_inflation
    return {
        "terminal_growth_local_currency": base_tgr + inflation_diff,
        "wacc_country_premium": country_risk_premium,
        "rule": "Cash flows and WACC must be in the same currency",
    }
```

## IFRS vs GAAP

- IFRS może kapitalizować development costs; GAAP częściej ujmuje R&D jako koszt.
- IFRS dopuszcza impairment reversals w wybranych aktywach; GAAP zwykle nie.
- Leasing, revaluations, pension assumptions i segment reporting mogą zaburzać porównania.
- Non-GAAP adjusted metrics porównuj z GAAP/IFRS i flaguj duże rozbieżności.

## Waluty i Jednostki

- Raportowanie w EUR, notowanie w PLN i zadłużenie w USD wymaga osobnej mapy ekspozycji.
- Normalizuj jednostki przed wskaźnikami: tysiące vs miliony to częsty błąd screenerów.
- Dla spółek eksportowych pokazuj wpływ FX na revenue, margin i debt service.
- Dla hiperinflacyjnych albo wysokoinflacyjnych jurysdykcji sprawdź real vs nominal assumptions.

## Szybka Decyzja Modelu

| Typ spółki | Pierwszy model | Drugi model sanity check |
| --- | --- | --- |
| Dojrzała przemysłowa | DCF | EV/EBITDA peers |
| Bank | Residual Income / P/TBV | ROE vs cost of equity |
| REIT | NAV / P/AFFO | Implied cap rate |
| Utility | DDM / regulated asset base | EV/EBITDA utilities |
| SaaS growth | Revenue-based DCF | EV/Sales / EV/Gross Profit |
| Konglomerat | SOTP | Comparable segment multiples |
| Cykliczna | Mid-cycle normalized earnings | Stress test downside |

## Guard Rails

- Jeśli typ spółki ma specjalistyczne wskaźniki, nie forsuj uniwersalnego screeningu.
- Każdy cross-border model ma jawne założenia FX, inflacji i premii za ryzyko kraju.
- Dla IFRS/GAAP porównań pokaż, które korekty zmieniły wynik i o ile.
- Wariant domenowy musi zostać opisany w raporcie, aby użytkownik nie traktował wyniku jak standardowego DCF.
