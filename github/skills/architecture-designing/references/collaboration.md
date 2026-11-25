# Współpraca i Eskalacje

Materiał referencyjny definiujący, kiedy `architecture-designing` współpracuje z innymi skillami i jaki kontekst przekazuje.

## Zasada Współpracy

Architektura integruje wyniki innych skilli, ale nie zastępuje ich specjalizacji. Gdy obszar wymaga głębokiej wiedzy domenowej, uruchom właściwy skill, przekaż mu kontekst i włącz wynik do planu, ADR, C4 lub quality gates.

## Eskalacje Szybkie

| Sytuacja | Skill | Przekaż | Otrzymasz |
| --- | --- | --- | --- |
| Brakuje konwencji repo, źródeł prawdy albo topologii systemu | `technical-context-discovering` | Obszar zadania, technologie, pytania architektoniczne | Konwencje, praktyki, komendy, źródła prawdy |
| Decyzja wymaga głębokiej mapy istniejącego kodu | `codebase-analysing` | Moduły, hipotezy, granice do sprawdzenia | Komponenty, zależności, wzorce, tech debt |
| Trzeba porównać zewnętrzne rozwiązania | `solution-researching` | Problem, wymagania, ograniczenia, kryteria oceny | Rekomendacja, matryca, C4 Context, ADR drafts |
| Nie wiadomo, co z planu już istnieje | `implementation-gap-analysing` | Docelowa architektura, wymagane komponenty, plan | Gapy, elementy do reuse, priorytety, test coverage |
| Trzeba rozciąć moduły lub bounded contexts | `system-modularising` | Domeny, zależności, NFR, ograniczenia | Granice modułów, kontrakty, diagram zależności |
| Trzeba zaprojektować domenę | `modeling-domain` | Bounded contexts, reguły biznesowe, decyzje architektoniczne | Agregaty, encje, VO, domain services, events |
| Trzeba zaprojektować dane | `engineering-databases` | Wymagania danych, wolumeny, spójność, migracje | Schemat, indeksy, transakcje, strategia migracji |
| UI wymaga dostępności | `ensuring-accessibility` | User journeys, komponenty, stany, wymagania WCAG | Wymagania a11y, testy, ryzyka i korekty UX |
| Kluczowe ścieżki wymagają E2E | `testing-e2e` | Scenariusze użytkownika, dane, środowisko, oczekiwane wyniki | Stabilne testy E2E, lokatory, mocki, walidacje |

## Kontrakty Szczegółowe

### Technical Context Discovering

**Architektura przekazuje:** zakres systemu, podejrzane granice, technologie, pytania o konwencje i potrzebne komendy walidacji.

**Skill dostarcza:** źródła prawdy, lokalne wzorce, instrukcje repo, komendy, istniejące quality gates i ograniczenia stylu.

### Codebase Analysing

**Architektura przekazuje:** hipotezy projektowe, moduły do zbadania, pytania o zależności, oczekiwane przepływy danych i granice.

**Skill dostarcza:** mapę komponentów, zależności, punkty rozszerzeń, duplikacje, tech debt i ryzyka aktualnej implementacji.

### Solution Researching

**Architektura przekazuje:** problem statement, wymagania, NFR, ograniczenia, kryteria oceny, budżet, compliance i zakres decyzji.

**Skill dostarcza:** porównanie opcji, rekomendację, uzasadnienie, ryzyka, C4 Context i ADR drafts do akceptacji lub odrzucenia.

### Implementation Gap Analysing

**Architektura przekazuje:** docelowe komponenty, fazy planu, diagramy, ADR, oczekiwane testy i quality gates.

**Skill dostarcza:** klasyfikację elementów jako istniejące, do modyfikacji albo do dodania, wraz z priorytetem i pokryciem testowym.

### System Modularising

**Architektura przekazuje:** domeny, bounded context candidates, zależności, wymagania spójności, organizację zespołów i NFR.

**Skill dostarcza:** proponowane moduły, kontrakty między modułami, agregaty wysokiego poziomu, polityki i diagram zależności.

### Modeling Domain

**Architektura przekazuje:** granice domen, decyzje warstwowe, reguły biznesowe, wymagania transakcyjności i integracji.

**Skill dostarcza:** model domenowy, agregaty, encje, value objects, repozytoria, domain services, events i polityki domenowe.

### Engineering Databases

**Architektura przekazuje:** model danych, wolumeny, wzorce odczytu/zapisu, wymagania spójności, migracje i rollback.

**Skill dostarcza:** schemat, indeksy, strategię migracji, transakcje, izolację, query patterns i ryzyka wydajnościowe.

### Ensuring Accessibility

**Architektura przekazuje:** user journeys, role użytkowników, komponenty UI, stany interakcji, ograniczenia projektowe i wymagania WCAG.

**Skill dostarcza:** wymagania dostępności, wzorce ARIA, fokus, klawiaturę, kontrast, walidacje i testy.

### Testing E2E

**Architektura przekazuje:** krytyczne przepływy, dane testowe, zależności zewnętrzne, stany błędów i oczekiwane zachowanie.

**Skill dostarcza:** stabilne scenariusze E2E, strategię mocków, lokatory dostępności, izolację testów i walidacje CI.

## Inne Relewantne Skille

- `implementing-backend` - kontrakty API, middleware, auth, rate limiting, background jobs i odporność.
- `implementing-frontend` - architektura komponentów, design system, stan UI i integracja z API.
- `implementing-ci-cd` - pipeline, release gates, deployment strategy i rollback.
- `implementing-observability` - metryki, logi, tracing, dashboardy i alerting dla decyzji operacyjnych.
- `managing-secrets` - sekrety, rotacja, OIDC, Kubernetes/Docker secrets i policy.
- `write-docs` - utrwalenie decyzji w README, docs architektonicznych, ADR i changelogu.
- `code-reviewing` - końcowe review planu, ryzyk, testów, security i regresji.

## Walidacja Współpracy

Przed finalizacją sprawdź:

```text
- [ ] Specjalistyczne decyzje nie zostały podjęte bez właściwego skilla, jeśli ryzyko jest wysokie.
- [ ] Wyniki innych skilli są włączone do planu, ADR, C4 albo quality gates.
- [ ] Nie skopiowano pełnych checklist skilli do aktywnego planu bez potrzeby.
- [ ] Kontekst przekazywany między skillami zawiera wymagania, ograniczenia, granice, NFR i ryzyka.
- [ ] Plan zachowuje jedną spójną decyzję, bez konkurencyjnych interpretacji procesu.
```
