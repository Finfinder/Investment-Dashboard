# Raportowanie i Walidacja

Ładuj przy generowaniu raportu inwestycyjnego, eksportu PDF/Excel/HTML, walidacji modelu albo review aplikacji fundamentalnej. Raport ma jasno oddzielać dane, założenia, wynik modelu i ograniczenia.

## Struktura Raportu

1. **Podsumowanie analityczne** — teza, zakres, fair value range, cena referencyjna, horyzont i status: wynik modelu, nie porada inwestycyjna.
2. **Profil spółki** — model biznesowy, segmenty, przewagi konkurencyjne, ekspozycje geograficzne i walutowe.
3. **Dane i metodologia** — źródła, filing dates, standard rachunkowości, waluty, jednostki, normalizacje i ograniczenia.
4. **Analiza finansowa** — trendy 5-letnie, jakość zysku, cash flow, bilans, peer group i branżowe benchmarki.
5. **Wycena** — DCF, comparable companies i inne modele z uzasadnieniem wag.
6. **Wrażliwość i scenariusze** — WACC/growth matrix, bull/base/bear, stress tests i główne drivers.
7. **Ryzyka i katalizatory** — top risks, upside/downside catalysts, warunki invalidation tezy.
8. **Załączniki** — tabele danych, definicje wskaźników, audit trail, wersja modelu.

## Narzędzia Raportowania

| Narzędzie | Użyj gdy | Uwagi |
| --- | --- | --- |
| Jinja2 | Generujesz HTML/PDF z szablonu | Trzymaj logikę modelu poza szablonem. |
| WeasyPrint | Potrzebny PDF z HTML/CSS | Waliduj render tabel i wykresów. |
| XlsxWriter / openpyxl | Użytkownik potrzebuje arkusza modelu | Zapisuj assumptions i outputs oddzielnie. |
| Plotly | Interaktywne wykresy scenariuszy | Eksportuj statyczne fallbacki do PDF. |
| pandas Styler | Szybkie tabele HTML | Unikaj jako jedynego źródła truth. |

Przykład minimalnego generatora:

```python
from jinja2 import Environment
from weasyprint import HTML

REPORT_TEMPLATE = """
<h1>{{ company.name }} - Investment Report</h1>
<p>Fair value range: {{ valuation.low }} - {{ valuation.high }}</p>
<p>Data sources: {{ data.sources | join(', ') }}</p>
<p>Status: wynik modelu przy jawnych założeniach, nie porada inwestycyjna.</p>
"""

def generate_report(data, output_path):
    html = Environment().from_string(REPORT_TEMPLATE).render(**data)
    HTML(string=html).write_pdf(output_path)
    return output_path
```

## Anti-patterny

| Anti-pattern | Problem | Zamiast tego |
| --- | --- | --- |
| Cherry-picking wskaźników | Confirmation bias | Analizuj pełne kategorie wskaźników i pokaż słabe punkty. |
| Ignorowanie cash flow | Zysk nie równa się gotówce | Sprawdzaj FCF, OCF/NI i accruals. |
| Statyczny DCF | Jedno założenie daje fałszywą precyzję | Dodaj scenariusze i sensitivity matrix. |
| Cross-industry peers | Niereprezentatywne mnożniki | Peer group z tej samej ekonomiki lub jawne uzasadnienie. |
| Terminal value > 75% DCF bez ostrzeżenia | Model zdominowany przez daleką przyszłość | Rewiduj założenia lub dodaj alternatywny model. |
| Brak point-in-time data | Look-ahead i survivorship bias | Użyj filing dates i historycznego universe. |
| Rekomendacja bez ryzyk | Nieodpowiedzialny output | Dodaj ryzyka, horyzont, scenariusze i ograniczenia. |

## Reguły Walidacji

| Reguła | Opis | Severity |
| --- | --- | --- |
| Peer group relevance | Peerzy z tej samej branży, regionu i skali albo jawne uzasadnienie. | ERROR |
| Balance identity | `Assets = Liabilities + Equity` dla pobranych sprawozdań. | ERROR |
| Currency/unit consistency | Jedna waluta i jednostka w modelu albo jawna konwersja. | ERROR |
| Point-in-time availability | Dane historyczne dostępne dopiero od filing date plus lag. | ERROR |
| Terminal growth check | Terminal growth mniejszy niż discount rate. | ERROR |
| Minimalna próba | Minimum 5 peerów i 10 spółek/okresów w walidacji retrospektywnej. | WARNING |
| Terminal value share | TV > 75% DCF wymaga ostrzeżenia i sanity checku. | WARNING |
| Data recency | Dane nie starsze niż 1 kwartał, chyba że analiza historyczna. | WARNING |
| FCF quality | Niski OCF/NI lub FCF/NI wymaga analizy accruals. | INFO |

## Eskalacje

| Sytuacja | Eskaluj do | Przekaż |
| --- | --- | --- |
| Brakujące lub sprzeczne dane źródłowe | `solution-researching` | Źródła, brakujące pola, wymagana granularność i region. |
| Potrzeba trwałego modelu danych point-in-time | `engineering-databases` | Encje, daty obowiązywania, vendor snapshots i audit trail. |
| Sygnały techniczne potrzebne do timingu | `analyzing-technicals` | Teza fundamentalna, instrument, horyzont i poziomy ryzyka. |
| Screening ma stać się strategią | `implementing-trading-strategies` | Definicje czynników, universe, rebalancing i koszty. |
| Raport dla nietechnicznego odbiorcy wymaga dopracowania | `write-docs` | Struktura raportu, odbiorcy, ton i ograniczenia prawne. |

## Checklista Przed Publikacją

```text
- [ ] Raport zawiera źródła, filing dates, wersję modelu i datę danych.
- [ ] Wszystkie założenia są jawne i możliwe do zmiany.
- [ ] Wycena pokazuje zakres, scenariusze i sensitivity.
- [ ] Rekomendacyjny język jest opisany jako wynik modelu, nie porada.
- [ ] Tabele i wykresy zgadzają się z danymi źródłowymi.
- [ ] Severity walidacji jest widoczne dla błędów blokujących.
```
