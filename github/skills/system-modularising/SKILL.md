---
name: system-modularising
description: "Modularyzacja systemu — bounded contexts, granice modułów, kontrakt domenowy (domain.md), jakość podziału, dekompozycja monolitu."
---

# Modularyzacja Systemu

Ten skill prowadzi przez modularyzację systemu od bounded contexts i granic modułów po kontrakty domenowe, testy jakości podziału i wynik w formie `domain.md` albo planu modułów. Aktywny tier zawiera proces i guard raile; szczegółowe tabele, metryki i checklisty są w `references/`.

## Kiedy używać

- Dekompozycja monolitu, greenfield albo istniejącego systemu z niejasnymi bounded contexts i modułami.
- Planowanie granic, własności danych, kontraktów modułów, publicznych API oraz jednostek spójności.
- Ocena coupling/cohesion, cykli zależności i wynik w formie `domain.md` albo planu modułów.

<principles>

<boundary-first-thinking>
Granice modułów definiuj przed strukturą wewnętrzną. Najpierw ustal, co jest publicznym kontraktem, kto posiada dane i jakie zależności są dozwolone; dopiero potem opisuj katalogi, klasy albo adaptery.
</boundary-first-thinking>

<autonomy-over-reuse>
Preferuj autonomię modułów nad ponownym użyciem kodu. Duplikacja wewnątrz granicy jest często tańsza niż ukryty coupling przez shared kernel, wspólne encje albo globalne utilsy.
</autonomy-over-reuse>

<evidence-based-boundaries>
Każda granica modułu musi być uzasadniona evidence: językiem domenowym, lifecycle danych, częstotliwością zmian, coupling/cohesion, własnością zespołu, własnością danych i ryzykiem komunikacji.
</evidence-based-boundaries>

<evolutionary-fitness>
Dobry podział musi przetrwać zmianę biznesową. Testuj granice scenariuszami ewolucji; jeśli mała zmiana wymaga modyfikacji wielu niepowiązanych modułów, granica jest podejrzana.
</evolutionary-fitness>

</principles>

## Proces

```text
Postęp modularyzacji:
- [ ] Krok 1: Zrozum kontekst systemu i cel modularyzacji
- [ ] Krok 2: Odkryj bounded contexts i moduły wysokopoziomowe
- [ ] Krok 3: Rozbij moduły na elementy domenowe niskiego poziomu
- [ ] Krok 4: Oceń coupling, cohesion i jakość granic
- [ ] Krok 5: Przetestuj podział scenariuszami ewolucji
- [ ] Krok 6: Wygeneruj `domain.md` albo plan modułów
```

**Krok 1: Zrozum kontekst systemu i cel modularyzacji**

Przeczytaj rozmowę, istotne pliki, `*.research.md`, `*.plan.md`, dokumentację i obecną strukturę kodu. Ustal cel: greenfield decomposition, monolith extraction, boundary refinement, team alignment albo scaling. Jeśli brak danych zmieniłby granice, zadaj krótki pakiet pytań o domenę, zespoły, dane, planowane zmiany i ograniczenia techniczne.

**Krok 2: Odkryj bounded contexts i moduły wysokopoziomowe**

Odkryj subdomeny, język, ownership i lifecycle danych; mapuj bounded contexts po zdolnościach biznesowych, przygotuj UML Package, a C4 Container dodaj tylko przy wpływie na runtime, integracje lub deployment.

**Krok 3: Rozbij moduły na elementy domenowe niskiego poziomu**

Dla każdego modułu wskaż agregaty, encje, value objects, events, polityki, domain services i jednostki spójności; implementację bloków DDD przekaż do `modeling-domain`.

**Krok 4: Oceń coupling, cohesion i jakość granic**

Oceń granice przez coupling, cohesion, zmienność, dane, zespół, deployment i komunikację; słabe wyniki kieruj do merge, split, refactor, ACL, event-driven integration albo zmiany ownership danych.

**Krok 5: Przetestuj podział scenariuszami ewolucji**

Przy istotnych decyzjach porównaj alternatywy i sprawdź zmiany biznesowe, reguły core, integracje, ruch, zespół oraz migracje; dla kodu zaplanuj testy zależności i braku cykli.

**Krok 6: Wygeneruj `domain.md` albo plan modułów**

Dla kontraktu domenowego użyj `./domain.example.md` bez zmiany sekcji; dla planu opisz granice, odpowiedzialności, kontrakty, ryzyka, testy jakości, kolejne kroki i poprawność Mermaid.

## Guard Raile

- Nie uznawaj folderów, namespace'ów ani warstw technicznych za moduły bez publicznego kontraktu i odpowiedzialności biznesowej.
- Nie rozcinaj jednostki spójności, jeśli invariant wymaga atomowej transakcji; najpierw zmień granicę albo zaprojektuj eventual consistency.
- Nie pozwalaj na bezpośrednie referencje do wnętrza modułu poza zdefiniowanym API, eventem, portem albo ACL.
- Nie używaj shared kernel jako domyślnej odpowiedzi na duplikację; udowodnij stabilność i koszt duplikacji.
- Nie pomijaj coupling/cohesion, własności danych, cykli zależności, ryzyk ani testów jakości podziału.
- Nie projektuj architektury runtime, ADR, NFR lub technologii integracji w izolacji; eskaluj do `architecture-designing`, gdy decyzja wykracza poza granice modułów.

## Minimalny Wynik

- Moduły lub bounded contexts z odpowiedzialnością, właścicielem danych, publicznym kontraktem i kierunkiem zależności.
- Poziom wysoki: UML Package, opcjonalny C4 Container, macierz odpowiedzialności i jawne API modułów.
- Poziom niski: agregaty, polityki, zdarzenia, jednostki spójności i decyzje o consistency.
- Test jakości: coupling/cohesion, cykle, ryzyka, alternatywy, scenariusze ewolucji i testy architektoniczne.
- Forma wyniku: `domain.md` zgodny z `./domain.example.md` albo plan modułów z kolejnymi krokami.

## Materiały Referencyjne

- `./references/discovery-and-boundaries.md` - discovery i bounded contexts.
- `./references/high-level-modularisation.md` - UML, C4, kontrakty modułów.
- `./references/low-level-domain-decomposition.md` - agregaty i spójność.
- `./references/boundary-quality-and-metrics.md` - coupling/cohesion, metryki.
- `./references/validation-and-evolution.md` - alternatywy, ryzyka, checklista.
- `./references/collaboration.md` - routing i eskalacje.
- `./domain.example.md` - szablon `domain.md`.

## Powiązane Skille

- `architecture-designing` - gdy granice wymagają decyzji o runtime, integracjach, NFR, C4, ADR lub technologii komunikacji.
- `modeling-domain` - gdy trzeba zaimplementować taktyczne DDD wewnątrz modułów: agregaty, encje, VO, repozytoria, events i policies.
- `codebase-analysing` - gdy istniejący codebase wymaga głębokiej mapy zależności, hot spots, cykli albo realnego coupling/cohesion.
- `implementation-gap-analysing` - gdy trzeba porównać docelowy `domain.md` lub plan modułów z faktycznym stanem implementacji.
