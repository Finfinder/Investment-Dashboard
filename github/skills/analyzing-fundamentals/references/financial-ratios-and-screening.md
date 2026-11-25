# Wskaźniki Finansowe i Screening

Ładuj tę referencję przy implementacji wskaźników, screenerów, scoringu fundamentalnego albo interpretacji progów. Progi są heurystykami analitycznymi, nie rekomendacjami inwestycyjnymi.

## Kategorie Wskaźników

| Kategoria | Przykłady | Zastosowanie |
| --- | --- | --- |
| Wycena | P/E, P/B, EV/EBITDA, EV/FCF, EV/Sales | Relatywna atrakcyjność względem historii i peer group. |
| Rentowność | ROE, ROIC, ROA, gross margin, operating margin, net margin | Jakość modelu biznesowego i przewaga konkurencyjna. |
| Płynność | Current ratio, quick ratio, cash ratio | Krótkoterminowa odporność bilansu; mniej użyteczne dla banków. |
| Zadłużenie | Debt/Equity, Net Debt/EBITDA, interest coverage | Ryzyko finansowe, covenant pressure i koszt kapitału. |
| Efektywność | Asset turnover, inventory turnover, DSO, cash conversion cycle | Jakość operacyjna i zmiany working capital. |
| Jakość zysku | OCF/NI, accruals, FCF conversion, SBC/revenue | Czy zysk księgowy zamienia się w gotówkę. |
| Growth | Revenue CAGR, EPS CAGR, FCF CAGR, retention, TAM proxy | Tempo wzrostu i trwałość reinwestycji. |
| Dywidendy | Dividend yield, payout ratio, dividend growth, buyback yield | Zwrot kapitału i trwałość wypłat. |

## Różnice Branżowe

| Branża | Preferowane miary | Czego unikać bez uzasadnienia |
| --- | --- | --- |
| Banki | CET1, NIM, cost/income, ROE, NPL ratio, loan growth | Current ratio, klasyczne EV/EBITDA. |
| REIT-y | FFO, AFFO, NAV, occupancy, cap rate, debt/EBITDA | P/E jako główna miara. |
| Utilities | Rate base, dividend coverage, net debt/EBITDA, allowed ROE | Porównania z high-growth tech. |
| Tech/growth | Revenue growth, gross margin, net retention, SBC/revenue, EV/Sales | P/E przy ujemnym lub zaniżonym earnings. |
| Cykliczne | Mid-cycle margins, normalized EPS, inventory cycle, commodity exposure | Ekstrapolacja peak earnings. |
| Przemysł | ROIC, backlog, book-to-bill, working capital, capex intensity | Sam P/E bez cyklu i capex. |

## Pipeline Screeningowy

Screening powinien być reprodukowalny: definicja universe i progów poprzedza ranking.

```python
def screen_universe(universe, criteria, rank_by="ev_ebitda", top_n=20):
    filtered = universe.copy()
    for column, (operator, value) in criteria.items():
        if operator == ">":
            filtered = filtered[filtered[column] > value]
        elif operator == "<":
            filtered = filtered[filtered[column] < value]
        elif operator == "between":
            filtered = filtered[filtered[column].between(*value)]
        else:
            raise ValueError(f"Nieznany operator: {operator}")

    ranked = filtered.sort_values(rank_by, ascending=True)
    return ranked.head(top_n)
```

Minimalny audit trail screeningu:

- data uruchomienia i `as_of_date` danych;
- definicja universe, wykluczenia, kraj, sektor, liquidity/cap filters;
- progi i ich uzasadnienie;
- kolumny rankingu, tie-breakers i liczba spółek po każdym filtrze;
- sanity checks: outliers, brak danych, peer comparability, sektorowe biasy.

## Typowe Screeny

### Value

- EV/EBITDA poniżej mediany sektora i dodatni FCF yield;
- P/B niskie tylko po sprawdzeniu jakości aktywów i ROE;
- P/E używaj dla dodatnich, znormalizowanych earnings;
- unikaj value traps: spadające ROIC, dług, restatements, kurczący się TAM.

### Quality

- ROIC powyżej WACC przez kilka lat;
- stabilne lub rosnące marże brutto i operacyjne;
- OCF/NI > 0.8 dla stabilnych spółek;
- niski leverage i brak agresywnych korekt Non-GAAP.

### Growth

- Revenue CAGR i gross margin trend spójne z modelem biznesowym;
- wzrost finansowany rozsądnie: FCF path, dilution, SBC, unit economics;
- porównuj growth z reinvestment rate i ROIC, nie tylko z headline revenue.

### Dividend

- Payout ratio i FCF coverage, nie tylko dividend yield;
- historia cięć dywidendy, buybacków i zadłużenia;
- dla REIT-ów używaj AFFO payout, nie EPS payout.

## Interpretacja Progów

- Próg bez peer group jest tylko filtrem wstępnym.
- Mediana sektora jest punktem odniesienia, ale sprawdź rozkład i outliers.
- Niski mnożnik może oznaczać ryzyko strukturalne, nie okazję.
- Wysoki P/E może być uzasadniony wysokim ROIC i długim runway growth.
- Wskaźnik poprawiający się po jednorazowym zdarzeniu wymaga normalizacji.

## Guard Rails

- Nie rankuj spółek z brakującymi danymi bez flag jakości.
- Nie porównuj banków, REIT-ów, utilities i tech tym samym zestawem wskaźników.
- Nie używaj jednego wskaźnika jako samodzielnej tezy.
- Nie przenoś progów między regionami bez uwzględnienia stóp procentowych, inflacji i premii za ryzyko.
- Jeżeli screener ma zasilać strategię, przekaż definicje czynników do `implementing-trading-strategies` na etap backtestu.
