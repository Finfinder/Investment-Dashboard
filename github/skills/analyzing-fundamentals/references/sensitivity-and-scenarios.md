# Wrażliwość i Scenariusze

Ładuj przy budowie sensitivity matrix, bull/base/bear, Monte Carlo, stress testów albo walidacji modelu na danych historycznych. Celem jest pokazanie niepewności, nie udawanie precyzji.

## Sensitivity Matrix

Macierz wrażliwości pokazuje, które założenia dominują wycenę. Minimum dla DCF to WACC i terminal growth; często dodaj margin, revenue growth albo capex intensity.

```python
def sensitivity_matrix(base_fcf, wacc_range, growth_range, shares):
    matrix = {}
    for wacc in wacc_range:
        for growth in growth_range:
            matrix[(wacc, growth)] = dcf_valuation(base_fcf, wacc, growth, shares)
    return matrix
```

Zasady:

- zakresy mają być ekonomicznie uzasadnione, np. WACC +/- 2 p.p. i terminal growth +/- 1 p.p.;
- oznacz komórki, w których `growth >= WACC`, jako nieważne;
- pokaż medianę, zakres i margines bezpieczeństwa względem ceny;
- jeśli wynik zmienia się o kilkadziesiąt procent przy małej zmianie WACC, raportuj wysoką niepewność.

## Bull / Base / Bear

Scenariusze nie są tylko mnożnikiem ceny. Każdy ma osobny opis tezy i spójny zestaw założeń.

```python
def scenario_analysis(base_revenue, base_margin, wacc, shares, years=5):
    scenarios = {
        "bull": {"rev_growth": 0.15, "margin_delta": 0.02, "tgr": 0.03},
        "base": {"rev_growth": 0.08, "margin_delta": 0.00, "tgr": 0.025},
        "bear": {"rev_growth": 0.02, "margin_delta": -0.03, "tgr": 0.02},
    }
    results = {}
    for name, scenario in scenarios.items():
        margin = base_margin + scenario["margin_delta"]
        fcf = [base_revenue * (1 + scenario["rev_growth"]) ** year * margin for year in range(1, years + 1)]
        results[name] = dcf_valuation(fcf, wacc, scenario["tgr"], shares)
    weighted = results["bull"] * 0.25 + results["base"] * 0.50 + results["bear"] * 0.25
    return {"scenarios": results, "weighted_avg": weighted}
```

Wymagania scenariusza:

- opis katalizatorów i ryzyk;
- założenia przychodów, marż, capex, working capital, kosztu kapitału i terminal growth;
- prawdopodobieństwa, jeśli liczysz weighted average;
- porównanie z historią spółki, sektora i cyklem makro.

## Monte Carlo

Monte Carlo ma sens, gdy rozkłady parametrów są uzasadnione. Uniform dla wszystkiego zwykle daje fałszywą precyzję albo bezużytecznie szeroki zakres.

- WACC: rozkład normalny lub triangular wokół źródeł CAPM, obcięty do sensownych granic.
- Growth: triangular albo lognormal zależnie od etapu spółki; unikaj wartości powyżej nominal GDP w terminalu.
- Marże: ogranicz do historycznych i peer ranges.
- Parametry skorelowane modeluj razem, np. wyższy growth może wymagać wyższego reinvestment.

Raportuj medianę, p10, p90, probability of downside i p90/p10 ratio. Jeśli p90/p10 jest bardzo wysokie, model mówi „założenia są zbyt niepewne”, nie „kupuj”.

## Stress Testing

Stres testy mają odpowiadać na pytanie, co łamie tezę:

- recesja i spadek przychodów;
- wzrost stóp i kosztu długu;
- utrata kluczowego klienta;
- spadek marży brutto lub pricing power;
- refinancing wall, covenant breach, downgrade;
- osłabienie waluty raportowania albo waluty przychodów.

Każdy stress test powinien mieć trigger, wpływ na model i warunek invalidation tezy.

## Retrospektywna Walidacja Modelu

Przetestuj model na historycznych danych point-in-time: czy zastosowany kilka lat temu dawałby rozsądne zakresy fair value?

Minimalna procedura:

1. Wybierz co najmniej 10 spółek albo pełny peer group z kilku okresów.
2. Odtwórz dane dostępne na datę analizy, z filing dates i ówczesnymi cenami.
3. Zastosuj te same reguły modelu bez strojenia na wyniku.
4. Porównaj fair value range z ceną po 1-3 latach i z benchmarkiem.
5. Sprawdź bias: czy model systematycznie zawyża growth, marże albo terminal value.

## Output Walidacyjny

```text
- [ ] Macierz wrażliwości obejmuje parametry dominujące wycenę.
- [ ] Scenariusze mają różne, spójne założenia i jawne ryzyka.
- [ ] Monte Carlo, jeśli użyte, ma uzasadnione rozkłady i korelacje.
- [ ] Stress test wskazuje warunki złamania tezy.
- [ ] Retrospektywna walidacja używa point-in-time data.
- [ ] Raport pokazuje zakres fair value, nie tylko pojedynczą cenę docelową.
```
