# Współpraca i Eskalacje - Modularyzacja Systemu

Kontrakty współpracy między `system-modularising` a skillami używanymi przy discovery, architekturze, modelowaniu domeny, analizie kodu, gap analysis i wdrażaniu reguł.

## Spis Treści

- [Eskalacje Szybkie](#eskalacje-szybkie)
- [Architecture Designing](#architecture-designing)
- [Modeling Domain](#modeling-domain)
- [Codebase Analysing](#codebase-analysing)
- [Implementation Gap Analysing](#implementation-gap-analysing)
- [Technical Context Discovering](#technical-context-discovering)
- [Inne Relewantne Skille](#inne-relewantne-skille)
- [Walidacja Współpracy](#walidacja-współpracy)

## Eskalacje Szybkie

| Sytuacja | Eskaluj do | Kontekst do przekazania | Powód |
| --- | --- | --- | --- |
| Modularyzacja wymaga decyzji o runtime, integracjach, NFR, C4 lub ADR | `architecture-designing` | Proponowane moduły, kontrakty, zależności, ryzyka, NFR | Potrzebna decyzja architektoniczna poza samym cięciem granic |
| Implementacja taktycznego DDD wewnątrz modułów | `modeling-domain` | Bounded contexts, kandydaci na agregaty, invarianty, zdarzenia, polityki | Potrzebny model domenowy i building blocks w kodzie |
| Istniejący kod wymaga głębokiej mapy zależności | `codebase-analysing` | Zakres systemu, hipotezy granic, pytania o coupling/cohesion | Potrzebna analiza struktury i zależności codebase |
| Trzeba sprawdzić, co z planu już istnieje | `implementation-gap-analysing` | Docelowy `domain.md` lub plan modułów, aktualny stan, kryteria gotowości | Potrzebna klasyfikacja: reuse, modify, implement |
| Brakuje konwencji repo, instrukcji, komend lub topologii technicznej | `technical-context-discovering` | Repo, technologie, obszar domeny, pytania o źródła prawdy | Potrzebny kontekst przed projektowaniem granic |
| Zmiana granic jest już w PR i wymaga oceny | `code-reviewing` | PR, kontrakty modułów, reguły zależności, ryzyka | Potrzebna recenzja naruszeń coupling/cohesion |
| Granice wpływają na dane, transakcje, indeksy lub migracje | `engineering-databases` | Własność danych, invarianty, wolumeny, migracje, spójność | Potrzebny projekt danych i strategia migracji |
| Granice wymagają pipeline gates lub testów architektonicznych | `implementing-ci-cd` | Reguły architektoniczne, narzędzia, oczekiwany gate | Potrzebne egzekwowanie w CI/CD |

## Architecture Designing

**Ten skill dostarcza:**

- Bounded contexts, subdomeny i granice modułów.
- Publiczne kontrakty modułów, integracje i kierunki zależności.
- Wyniki oceny coupling/cohesion, ryzyka i scenariusze ewolucji.
- Sygnały, gdzie potrzebny jest C4, ADR, decyzja runtime lub NFR.

**Partner dostarcza:**

- Decyzje architektoniczne, C4 Context/Container/Component i ADR-y.
- Warianty integracji, deploymentu, komunikacji, danych i quality gates.
- Uzasadnienie trade-offów oraz wpływ na security, scalability, maintainability i performance.

**Przykład interfejsu:**

```text
System modularising: Ordering i Fulfillment powinny być osobnymi bounded contexts, komunikacja przez OrderPlaced event, brak współdzielonej tabeli.
Architecture designing: projektuje event bus, kontrakt eventu, ownership danych, C4 Container i ADR dla komunikacji asynchronicznej.
```

## Modeling Domain

**Ten skill dostarcza:**

- Granice bounded contexts i język każdego kontekstu.
- Kandydatów na agregaty, events, policies, domain services i jednostki spójności.
- Ograniczenia integracyjne między modułami.

**Partner dostarcza:**

- Taktyczny model DDD gotowy do implementacji.
- Agregaty, encje, value objects, invarianty, repozytoria, factories, events i policies.
- Wskazówki implementacyjne dla konkretnego języka lub frameworka.

**Przykład interfejsu:**

```text
System modularising: Payments posiada invariant autoryzacji i rozliczenia; Orders tylko konsumuje PaymentAuthorized.
Modeling domain: projektuje Payment aggregate, PaymentAuthorized event i politykę retry/compensation.
```

## Codebase Analysing

**Ten skill dostarcza:**

- Hipotezy granic i pytania, które trzeba potwierdzić w kodzie.
- Obszary podejrzane o cykle, shared kernel abuse, deep imports lub wspólne dane.
- Oczekiwany format wyników: dependency graph, hot spots, coupling/cohesion findings.

**Partner dostarcza:**

- Mapę istniejących komponentów, zależności, importów, przepływów danych i punktów rozszerzeń.
- Duplikacje, tech debt, miejsca wysokiego churnu i ryzyka migracji.
- Fakty pozwalające odróżnić strukturę katalogów od realnych granic modułów.

**Przykład interfejsu:**

```text
System modularising: sprawdź, czy Catalog i Pricing są realnie rozdzielone.
Codebase analysing: wykrywa, że Pricing importuje wewnętrzne typy Catalog i zapisuje tę samą tabelę Product.
```

## Implementation Gap Analysing

**Ten skill dostarcza:**

- Docelowy `domain.md` albo plan modułów.
- Kryteria gotowości granic, kontraktów, testów i ownership.
- Priorytety ryzyk oraz listę najsłabszych granic.

**Partner dostarcza:**

- Raport, które elementy istnieją, wymagają modyfikacji albo trzeba dodać.
- Priorytetyzację luk, zależności między pracami i pokrycie testowe.
- Rekomendację kolejności implementacji lub refaktoru.

**Przykład interfejsu:**

```text
System modularising: docelowo Billing nie może importować Orders.Internal.
Implementation gap analysing: klasyfikuje aktualne importy, wskazuje pliki do refaktoru i brakujący test architektoniczny.
```

## Technical Context Discovering

**Ten skill dostarcza:**

- Pytania o kontekst techniczny wpływający na granice.
- Zakres modułów, źródła prawdy i podejrzane miejsca do sprawdzenia.

**Partner dostarcza:**

- Instrukcje repo, istniejące wzorce, komendy walidacji, style architektury i lokalne ograniczenia.
- Informacje, czy projekt ma już testy architektoniczne, ADR-y, monorepo conventions albo ownership docs.

**Przykład interfejsu:**

```text
System modularising: potrzebuję ustalić, czy repo używa import-linter i jakie są istniejące granice pakietów.
Technical context discovering: zwraca konfigurację, konwencje i lokalne quality gates.
```

## Inne Relewantne Skille

- `engineering-databases` - projektowanie własności danych, transakcji, migracji, read models i indeksów.
- `implementing-backend` - implementacja kontraktów API, middleware, background jobs, auth i resiliency po ustaleniu granic.
- `implementing-frontend` - granice modułów UI, design system, state ownership i kontrakty z backendem.
- `implementing-ci-cd` - pipeline gates, testy architektoniczne i blokowanie naruszeń zależności.
- `implementing-observability` - metryki, logi i tracing na granicach modułów oraz scenariusze operacyjne.
- `write-docs` - utrwalenie `domain.md`, ADR, README, diagramów i changeloga.
- `code-reviewing` - końcowa weryfikacja zmian kodu względem kontraktów modułów.

## Walidacja Współpracy

```text
- [ ] Decyzje architektoniczne nie zostały podjęte bez `architecture-designing`, jeśli wpływają na C4, ADR, runtime lub NFR.
- [ ] Implementacyjne DDD przekazano do `modeling-domain`, zamiast projektować szczegóły klas w tym skillu.
- [ ] Fakty o istniejącym codebase pochodzą z analizy lub jawnych założeń, nie z samej nazwy katalogów.
- [ ] Gap analysis używa docelowego `domain.md` lub planu modułów jako kryterium porównania.
- [ ] Wyniki partnerów są włączone do kontraktu domenowego, planu modułów, ryzyk albo quality gates.
```
