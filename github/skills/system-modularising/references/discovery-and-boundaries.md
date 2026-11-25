# Discovery i Granice Modularyzacji

Szczegółowe discovery dla `system-modularising`: cele modularyzacji, źródła evidence, heurystyki bounded contexts, typy subdomen i pytania do użytkownika.

## Spis Treści

- [Cele Modularyzacji](#cele-modularyzacji)
- [Źródła Evidence](#źródła-evidence)
- [Heurystyki Bounded Contexts](#heurystyki-bounded-contexts)
- [Subdomeny](#subdomeny)
- [Pytania Do Użytkownika](#pytania-do-użytkownika)
- [Warunki Stopu](#warunki-stopu)

## Cele Modularyzacji

Ustal cel przed proponowaniem granic, bo różne cele premiują różne kompromisy:

| Cel | Kiedy występuje | Priorytet decyzji |
| --- | --- | --- |
| Greenfield decomposition | Nowy system, domena jeszcze nieutrwalona w kodzie | Ubiquitous language, bounded contexts, kontrakty publiczne |
| Monolith extraction | Istniejący monolit ma zostać rozcięty na moduły lub usługi | Zależności, dane, sekwencja migracji, ryzyko regresji |
| Boundary refinement | Moduły istnieją, ale granice są nieostre | Coupling/cohesion, ownership, publiczne API, testy architektoniczne |
| Team alignment | Granice kodu mają wspierać strukturę zespołów | Własność decyzji, komunikacja, odpowiedzialność za dane |
| Scaling/operations | System wymaga niezależnego skalowania lub deploymentu | Autonomia runtime, observability, kontrakty integracyjne |

Jeśli cel jest mieszany, nazwij główny driver i drugorzędne ograniczenia. Nie optymalizuj jednocześnie pod wszystkie kryteria z tą samą wagą.

## Źródła Evidence

Przed oceną granic zbierz dane z co najmniej kilku źródeł:

- istniejąca struktura katalogów, namespace'ów, pakietów i deployment units;
- zależności importów, referencji projektowych, komunikacji sieciowej i eventów;
- historia zmian: pliki zmieniające się razem, obszary częstych konfliktów, hot spots;
- dokumenty: `*.research.md`, `*.plan.md`, ADR, README, diagramy, runbooki;
- język domenowy w kodzie, UI, API, dokumentacji, ticketach i rozmowie użytkownika;
- własność danych: tabele, kolekcje, schematy, event streams, integracje zewnętrzne;
- organizacja zespołów i przepływ decyzyjny, jeśli wpływa na utrzymanie modułów.

Dla istniejącego codebase użyj `codebase-analysing`, gdy sama lektura kilku plików nie wystarcza do mapy zależności lub metryk coupling/cohesion.

## Heurystyki Bounded Contexts

Traktuj poniższe heurystyki jako sygnały, nie jako automatyczny podział:

| Sygnał | Interpretacja | Pytanie kontrolne |
| --- | --- | --- |
| Inny język domenowy | Możliwy osobny bounded context | Czy ten sam termin ma inne znaczenie w różnych częściach systemu? |
| Inny lifecycle danych | Możliwa osobna odpowiedzialność | Czy dane powstają, zmieniają się i wygasają w innym rytmie? |
| Inna częstotliwość zmian | Granica może chronić przed churnem | Czy zmiany biznesowe zwykle dotykają tych elementów razem? |
| Inny właściciel biznesowy lub zespół | Granica może wspierać autonomię | Czy decyzje wymagają koordynacji między zespołami? |
| Inne wymagania spójności | Granica transakcyjna może być zła | Czy invariant musi być utrzymany atomowo w wielu elementach? |
| Integracja zewnętrzna | Potrzebny ACL lub osobny kontekst | Czy model zewnętrzny przecieka do domeny wewnętrznej? |
| Współdzielona tabela lub obiekt | Ryzyko ukrytego couplingu | Kto jest właścicielem zapisu, a kto tylko czyta projekcję? |

Bounded context nie musi mapować się 1:1 na mikroserwis. Może być modułem monolitu, biblioteką domenową, kontenerem aplikacyjnym albo etapem migracji.

## Subdomeny

Klasyfikuj subdomeny, aby nie przeinwestować w obszary commodity:

| Typ | Znaczenie | Strategia modularyzacji |
| --- | --- | --- |
| Core | Różnicuje biznes, zawiera najważniejsze reguły i przewagę | Najsilniejsza izolacja, bogaty model domenowy, wyraźne kontrakty |
| Supporting | Potrzebna dla biznesu, ale nie jest przewagą konkurencyjną | Prosty model, integracja z core przez kontrakty, umiarkowana autonomia |
| Generic | Standardowa funkcja możliwa do kupienia lub użycia z biblioteki | Minimalna customizacja, adaptery, vendor/API boundaries |

Jeśli subdomena core jest duża, rozbij ją dalej po języku, lifecycle i jednostkach spójności. Jeśli generic jest duże, ogranicz własny model i zaplanuj antykorupcyjną warstwę integracji.

## Pytania Do Użytkownika

Zadaj krótki pakiet pytań tylko wtedy, gdy odpowiedź zmieni granice lub ryzyko:

- Jaki jest cel modularyzacji: greenfield, extraction, refinement, scaling, team alignment?
- Które zdolności biznesowe są core, a które supporting lub generic?
- Jakie terminy domenowe mają różne znaczenia w różnych częściach systemu?
- Które dane muszą być spójne atomowo, a które mogą być eventual consistent?
- Które zmiany biznesowe są spodziewane w najbliższych miesiącach?
- Jak wygląda własność zespołów, komponentów, danych i kontraktów API?
- Które integracje zewnętrzne narzucają własny model lub proces?
- Jakie ograniczenia deploymentu, runtime, compliance lub kosztów wpływają na granice?

## Warunki Stopu

Nie finalizuj podziału bez dopisania założeń lub pytań otwartych, gdy:

- nie wiadomo, który obszar jest core;
- brakuje właściciela danych albo publicznego kontraktu modułu;
- proponowana granica przecina invariant wymagający spójności transakcyjnej;
- zależności cykliczne są znane, ale nie mają planu usunięcia;
- użytkownik oczekuje planu wdrożenia, a nie tylko modelu granic.
