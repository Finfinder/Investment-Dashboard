# Jakość Granic i Metryki

Szczegółowa ocena granic modułów: kryteria, wagi, wynik ważony, coupling/cohesion, metryki Instability/Abstractness/Distance i cykle zależności.

## Spis Treści

- [Macierz Kryteriów](#macierz-kryteriów)
- [Wagi i Wynik Ważony](#wagi-i-wynik-ważony)
- [Coupling i Cohesion](#coupling-i-cohesion)
- [Metryki Pakietów](#metryki-pakietów)
- [Cykle Zależności](#cykle-zależności)
- [Interpretacja Wyniku](#interpretacja-wyniku)

## Macierz Kryteriów

Oceń każdą granicę modułów w skali 1-5. Niska ocena oznacza granicę wymagającą przebudowy lub jawnego ryzyka.

| Kryterium | Waga | Ocena 1 | Ocena 3 | Ocena 5 |
| --- | --- | --- | --- | --- |
| Coupling | 1-5 | Wiele bezpośrednich zależności i wspólny stan | Kilka zależności przez częściowe kontrakty | Minimalne zależności przez publiczne API/eventy |
| Cohesion | 1-5 | Moduł miesza różne cele biznesowe | Większość elementów wspiera jedną zdolność | Elementy zmieniają się i są używane razem |
| Częstotliwość zmian | 1-5 | Zmiany regularnie przecinają granicę | Czasem wymagają koordynacji | Zmiany zwykle mieszczą się w jednym module |
| Własność zespołowa | 1-5 | Brak właściciela lub wielu właścicieli | Własność niepełna | Jasny właściciel decyzji i kontraktu |
| Deployment/autonomia runtime | 1-5 | Granica blokuje release lub skalowanie | Częściowa niezależność | Moduł może być wdrażany/skalowany zgodnie z celem |
| Własność danych | 1-5 | Wiele modułów zapisuje te same dane | Właściciel zapisu nie zawsze jasny | Jeden właściciel source of truth |
| Komunikacja | 1-5 | Chatty calls, transakcje rozproszone, cykle | Mieszane style integracji | Prosty kontrakt, mało koordynacji |

Dodaj kryteria specyficzne dla systemu tylko wtedy, gdy realnie zmieniają decyzję, np. compliance, tenant isolation, latency albo migracja legacy.

## Wagi i Wynik Ważony

Wagi powinny wynikać z celu modularyzacji. Dla extraction ważniejsze mogą być zależności i dane; dla team alignment własność zespołowa; dla scaling deployment i runtime.

Formuła:

```text
wynik_granicy = suma(ocena_kryterium * waga_kryterium) / suma(wag)
```

Szablon tabeli:

| Granica | Coupling (w:5) | Cohesion (w:4) | Zmiana (w:4) | Zespół (w:3) | Dane (w:5) | Komunikacja (w:3) | Wynik |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Ordering ↔ Pricing | 4 | 5 | 4 | 3 | 5 | 4 | 4.25 |
| Ordering ↔ Fulfillment | 3 | 4 | 3 | 4 | 4 | 3 | 3.46 |

Jawnie zapisz uzasadnienie wag. Bez uzasadnienia wynik wygląda precyzyjnie, ale jest tylko arbitralną punktacją.

## Coupling i Cohesion

Coupling oceniaj przez:

- liczbę importów/referencji między modułami;
- zależności do typów wewnętrznych zamiast publicznego API;
- wspólne tabele, modele, konfiguracje i utilsy;
- synchroniczne call chainy i chatty communication;
- konieczność równoczesnych zmian w kilku modułach;
- ukryte zależności przez globalny stan, singletony, shared cache lub eventy bez właściciela.

Cohesion oceniaj przez:

- wspólną zdolność biznesową i język domenowy;
- elementy zmieniające się razem w historii commitów;
- wspólne invarianty i jednostki spójności;
- mały, zrozumiały publiczny kontrakt;
- brak technicznego worka typu `Common`, `Core`, `Shared`, `Utils` jako domenowego modułu.

## Metryki Pakietów

Dla języków i repozytoriów, gdzie da się policzyć zależności pakietów, użyj metryk:

```text
Ca = afferent coupling, liczba modułów zależących od badanego modułu
Ce = efferent coupling, liczba modułów, od których zależy badany moduł
I = Instability = Ce / (Ca + Ce)
A = Abstractness = abstrakcje / wszystkie typy
D = Distance = |A + I - 1|
```

Interpretacja:

| Metryka | Dobry sygnał | Ryzyko |
| --- | --- | --- |
| Ca wysokie | Moduł stabilny i używany | Zmiany są kosztowne, API musi być stabilne |
| Ce wysokie | Moduł składa wiele zależności | Duże ryzyko łamania przez zmiany upstream |
| I blisko 0 | Stabilny moduł | Nie powinien zależeć od niestabilnych detali |
| I blisko 1 | Niestabilny/adaptacyjny moduł | Nie powinien być zależnością wielu modułów core |
| D blisko 0 | Blisko main sequence | Zwykle zdrowy balans abstrakcji i stabilności |
| D wysokie | Pain zone lub useless zone | Wymaga przeglądu granicy i abstrakcji |

Metryki są wsparciem, nie werdyktem. Domena i jednostki spójności mają pierwszeństwo, gdy liczby są mylące.

## Cykle Zależności

Cykle między modułami są domyślnie błędem granic. Typowe naprawy:

- wyodrębnij kontrakt/port w module właścicielskim;
- zmień direct call na event domenowy;
- przenieś regułę do modułu, który posiada dane i invariant;
- scal moduły, jeśli cykl wynika z jednej jednostki spójności;
- wprowadź ACL dla legacy lub integracji zewnętrznej;
- usuń wspólny `shared` model, który stał się ukrytym centrum zależności.

Nie akceptuj cyklu jako „tymczasowego” bez właściciela, terminu i testu architektonicznego wykrywającego regresję.

## Interpretacja Wyniku

| Wynik | Znaczenie | Akcja |
| --- | --- | --- |
| 4.0-5.0 | Granica prawdopodobnie zdrowa | Utrwal kontrakt i testy |
| 3.0-3.9 | Granica używalna, ale wymaga obserwacji | Zapisz ryzyka i scenariusze ewolucji |
| 2.0-2.9 | Granica słaba | Zaproponuj alternatywę lub refaktor |
| 1.0-1.9 | Granica niebezpieczna | Przebuduj, scal albo rozdziel przed implementacją |

Granice o niskim wyniku umieść w sekcji najsłabszych granic `domain.md` wraz z rekomendacją: merge, split, refactor, ACL, event-driven integration lub zmiana własności danych.
