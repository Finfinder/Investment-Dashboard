# Modele Wyceny

Szczegóły modeli ładuj przy implementacji wyceny, review założeń albo wyborze metody dla nietypowej spółki. Wynik modelu zawsze traktuj jako zakres zależny od założeń.

## Spis Treści

- [Mapa Modeli](#mapa-modeli)
- [DCF](#dcf)
- [Ujemne FCF / Earnings](#ujemne-fcf--earnings)
- [DDM](#ddm)
- [Comparable Companies](#comparable-companies)
- [Precedent Transactions i SOTP](#precedent-transactions-i-sotp)
- [WACC i Terminal Value](#wacc-i-terminal-value)
- [Checklista Modelu](#checklista-modelu)

## Mapa Modeli

| Model | Użyj gdy | Kluczowe parametry |
| --- | --- | --- |
| DCF | Spółka ma przewidywalne cash flows albo da się wiarygodnie modelować ścieżkę FCF. | FCF, WACC, terminal growth, capex, reinvestment, net debt, shares. |
| DDM | Spółka wypłaca trwałe dywidendy i ma stabilny payout. | Cost of equity, dividend growth, payout sustainability. |
| Comparable Companies | Potrzebna wycena relatywna względem podobnych spółek. | Peer group, mnożniki, normalizacja earnings/EBITDA. |
| Precedent Transactions | Analiza M&A albo control premium. | Transaction multiples, premium, data transakcji, cykl. |
| SOTP | Konglomeraty, segmenty o różnych profilach ryzyka. | Segment revenue/EBITDA, segment multiples, holding discount. |
| Residual Income | Spółki z niskim FCF, banki lub firmy z istotną wartością księgową. | Book value, ROE, cost of equity, persistence. |

## DCF

```python
def dcf_valuation(fcf_projections, wacc, terminal_growth, shares_outstanding, net_debt=0):
    if terminal_growth >= wacc:
        raise ValueError("Terminal growth musi być mniejszy niż WACC")
    if shares_outstanding <= 0:
        raise ValueError("Shares outstanding musi być dodatnie")

    pv_fcf = sum(fcf / (1 + wacc) ** year for year, fcf in enumerate(fcf_projections, 1))
    terminal_value = fcf_projections[-1] * (1 + terminal_growth) / (wacc - terminal_growth)
    pv_terminal = terminal_value / (1 + wacc) ** len(fcf_projections)
    enterprise_value = pv_fcf + pv_terminal
    equity_value = enterprise_value - net_debt
    return equity_value / shares_outstanding
```

DCF oparty na FCF to firm daje enterprise value; fair value per share licz po przejściu do equity value, zwykle po korekcie o dług netto.

Sanity checks:

- `terminal_growth < WACC`, zwykle także poniżej długoterminowego nominal GDP dla rynku;
- terminal value nie powinien dominować wyceny bez jawnego ostrzeżenia, np. > 75% DCF;
- WACC porównaj z zakresem opartym o beta 2Y/5Y, sektorową betę, cost of debt i country risk premium;
- FCF musi spinać się z revenue growth, margins, working capital, capex i tax rate;
- shares outstanding uwzględnia rozwodnienie, SBC i buybacks.

## Ujemne FCF / Earnings

Nie wymuszaj klasycznego DCF ani P/E dla spółek growth-stage, turnaround lub cyklicznych w dołku.

```python
def dcf_negative_fcf(revenue_projections, target_fcf_margin, wacc, terminal_growth, shares):
    fcf_projected = [revenue * target_fcf_margin for revenue in revenue_projections]
    if any(fcf <= 0 for fcf in fcf_projected):
        raise ValueError("Docelowa marża FCF nadal daje ujemne FCF")
    return dcf_valuation(fcf_projected, wacc, terminal_growth, shares)
```

Alternatywy:

- revenue-based DCF z docelową marżą FCF i ścieżką dojścia;
- EV/Sales albo EV/Gross Profit dla spółek bez dodatniego EBITDA;
- normalized mid-cycle earnings dla cyklicznych;
- residual income dla banków albo spółek z istotną wartością księgową;
- liquidation/NAV approach, gdy business model jest w restrukturyzacji.

## DDM

Używaj tylko, gdy dywidenda jest trwała i powiązana z realnym FCF.

- Sprawdź payout ratio, FCF coverage, leverage i historię cięć.
- Growth dywidendy nie może przekraczać długoterminowej zdolności reinwestycji.
- Dla REIT-ów bazuj na AFFO payout, nie EPS payout.
- Dla banków sprawdź wymogi kapitałowe i buyback constraints.

## Comparable Companies

Peer group musi być obiektywnie zdefiniowana:

- ta sama branża lub segment ekonomiczny, podobny region, cap size, growth i margin profile;
- minimum 5 spółek, chyba że rynek jest bardzo wąski i ograniczenie jest jawne;
- wykluczenia outliers dokumentuj i pokaż wpływ na medianę;
- mnożniki normalizuj do tego samego okresu: LTM, NTM, FY1 albo FY2.

Typowe mnożniki:

- EV/EBITDA dla dojrzałych spółek operacyjnych;
- EV/Revenue lub EV/Gross Profit dla growth bez earnings;
- P/E dla dodatnich, znormalizowanych earnings;
- P/B i P/TBV dla banków lub ubezpieczycieli;
- P/FFO i NAV premium/discount dla REIT-ów.

## Precedent Transactions i SOTP

Precedent transactions wymagają dat transakcji, premii za kontrolę, cyklu M&A i struktury transakcji. Nie używaj ich jako prostej mediany bez normalizacji rynku.

SOTP wymaga:

- mapy segmentów z revenue/EBITDA/FCF;
- oddzielnych peerów lub mnożników dla każdego segmentu;
- korekty długu, gotówki, udziałów mniejszościowych i kosztów holdingu;
- jawnego holding discount, jeśli konglomerat historycznie handluje z dyskontem.

## WACC i Terminal Value

- Cost of equity: risk-free rate + beta * equity risk premium + country/size premium, jeśli uzasadnione.
- Cost of debt: aktualny koszt refinansowania, nie tylko historyczne odsetki.
- Tax shield: stosuj efektywną lub docelową stopę podatkową z uzasadnieniem.
- Capital structure: użyj docelowej struktury lub obecnej, ale sprawdź wpływ dźwigni.
- Terminal value: Gordon Growth albo exit multiple; porównaj oba jako sanity check.

## Checklista Modelu

```text
- [ ] Model pasuje do ekonomiki spółki i jakości danych.
- [ ] Parametry WACC, growth, marż i capex mają źródła albo uzasadnienie.
- [ ] Terminal growth < discount rate, a terminal value nie dominuje bez ostrzeżenia.
- [ ] Peer group ma obiektywne kryteria i wpływ outliers jest sprawdzony.
- [ ] Ujemne FCF/earnings mają osobną metodę, nie wymuszone P/E.
- [ ] Wynik jest zakresem i przechodzi scenariusze oraz sanity checks.
```
