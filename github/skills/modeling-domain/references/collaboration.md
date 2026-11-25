# Kontrakty Współpracy - modeling-domain

Materiał referencyjny definiujący granice odpowiedzialności i interfejsy między skillem `modeling-domain` a najczęstszymi partnerami. Czytaj go, gdy aktywny tier wskazuje eskalację albo gdy modelowanie domeny wymaga koordynacji kilku domen kompetencji.

## Kiedy czytać

- Brakuje strategicznych bounded contexts lub `domain.md`.
- Model domenowy musi zostać przełożony na API, application services, ORM albo schemat bazy.
- Trzeba rozstrzygnąć, który skill prowadzi, a który wspiera.
- Potrzebujesz konkretnych danych do przekazania przy eskalacji.

## Spis treści

- [Szybki routing współpracy](#szybki-routing-współpracy)
- [System Modularising](#system-modularising)
- [Implementing Backend](#implementing-backend)
- [Engineering Databases](#engineering-databases)
- [Architecture Designing](#architecture-designing)
- [Code Reviewing](#code-reviewing)
- [Eskalacje](#eskalacje)
- [Spostrzeżenia międzydomenowe](#spostrzeżenia-międzydomenowe)
- [Checklista współpracy](#checklista-współpracy)

## Szybki routing współpracy

| Skill | Rola | Tryb | Trigger | Przekaż | Otrzymasz |
| --- | --- | --- | --- | --- | --- |
| `system-modularising` | Prowadzi | Sekwencyjny | Brak granic bounded contexts, brak `domain.md`, sporne znaczenia pojęć | Wymagania biznesowe, procesy, słownik, istniejące moduły | Bounded contexts, `domain.md`, kontrakty modułów, kandydaci na agregaty |
| `implementing-backend` | Wspiera | Równoległy/sekwencyjny | Model domenowy ma zostać osadzony w API, use case'ach i adapterach | Agregaty, repozytoria, events, błędy domenowe | Application services, endpointy, transakcje, adaptery repozytoriów |
| `engineering-databases` | Prowadzi | Sekwencyjny po modelu | Mapowanie agregatów, migracje, indeksy, read models, N+1 | Struktura agregatów, value objects, wzorce dostępu | DDL, migracje, ORM mapping, indeksy, rekomendacje zapytań |
| `architecture-designing` | Wspiera | Sekwencyjny | Decyzje systemowe, topologia, event-driven vs request-response, mikroserwisy | Złożoność domeny, granice kontekstów, wymagania integracyjne | Decyzje architektoniczne, C4, ograniczenia technologiczne |
| `code-reviewing` | Wspiera | Recenzja | Gotowa implementacja modelu domenowego wymaga oceny jakości | Kod domeny, użyte wzorce, guard rails | Findings, naruszenia inwariantów, antywzorce, brakujące testy |

## System Modularising

**Ten skill dostarcza:**

- Feedback na jakość granic modułów z perspektywy agregatów i inwariantów.
- Zidentyfikowane domain events jako mechanizm komunikacji między modułami.
- Informację, które pojęcia wymagają osobnego języka i modelu.

**Partner dostarcza:**

- Bounded contexts z jasno zdefiniowanymi granicami.
- `domain.md`, macierz odpowiedzialności modułów i kontrakty komunikacji.
- Kandydatów na agregaty oraz procesy biznesowe do taktycznej weryfikacji.

**Przykład interfejsu:**

`system-modularising` wskazuje konteksty Sprzedaż, Fakturacja i Magazyn. `modeling-domain` projektuje agregaty wyłącznie wewnątrz Sprzedaży, a kontakt z Fakturacją opisuje przez event `OrderPlaced` i ACL.

## Implementing Backend

**Ten skill dostarcza:**

- Definicje agregatów, encji i value objects.
- Interfejsy repozytoriów w warstwie domeny.
- Domain events, błędy domenowe i reguły inwariantów.
- Wskazanie, gdzie application service ma tylko orkiestrację use case'u.

**Partner dostarcza:**

- Endpointy API, kontrolery i application services orkiestrujące domenę.
- Implementacje repozytoriów i unit of work w infrastrukturze.
- Middleware, auth, walidację wejścia, obsługę błędów i transakcje aplikacyjne.

**Przykład interfejsu:**

`modeling-domain` definiuje `Order.place()` i `OrderRepository`. `implementing-backend` buduje `PlaceOrderHandler`, który ładuje dane wejściowe, wywołuje model, zapisuje root i publikuje events po commit.

## Engineering Databases

**Ten skill dostarcza:**

- Strukturę agregatów do zmapowania na tabele lub dokumenty.
- Value Objects wymagające decyzji o kolumnach, owned types, JSON albo converterach.
- Wzorce dostępu: zapisy rootów, zapytania read model, wolumeny i transakcyjność.

**Partner dostarcza:**

- DDL, migracje i rekomendacje indeksowania.
- Mapowanie ORM zgodne z persistence ignorance.
- Strategię read models, projections, outbox table i query optimization.

**Przykład interfejsu:**

`modeling-domain` nie decyduje, czy `Money` ma być owned type, dwoma kolumnami czy JSON. Przekazuje semantykę i wzorce zapytań do `engineering-databases`, który dobiera mapowanie i indeksy.

## Architecture Designing

**Ten skill dostarcza:**

- Model domenowy jako wejście do C4 Component i decyzji o granicach runtime.
- Informację, które inwarianty wymagają natychmiastowej spójności, a które mogą być eventual consistent.
- Zdarzenia domenowe wpływające na wybór stylu komunikacji.

**Partner dostarcza:**

- Decyzje architektoniczne: monolit modularny, mikroserwisy, event-driven, request-response.
- Diagramy C4, ograniczenia technologiczne i wymagania integracyjne.
- Decyzje o kontraktach między komponentami i konsekwencjach operacyjnych.

**Przykład interfejsu:**

Gdy granice agregatów sugerują silną separację kontekstów, `architecture-designing` ocenia, czy wystarczy modułowy monolit, czy wymagany jest osobny deployment i kontrakty integracyjne.

## Code Reviewing

**Ten skill dostarcza:**

- Guard rails DDD do weryfikacji: agregaty, value objects, repozytoria, events, persistence ignorance.
- Listę antywzorców: anemic model, God Aggregate, generic repository, repository per entity.
- Kontekst intencji domenowej, aby reviewer nie oceniał modelu wyłącznie jak CRUD.

**Partner dostarcza:**

- Findings z priorytetami, odniesieniami do plików i ryzykiem regresji.
- Identyfikację brakujących testów inwariantów.
- Weryfikację, czy implementacja zachowała lokalne konwencje repozytorium.

**Przykład interfejsu:**

Po implementacji `Order` reviewer sprawdza, czy `OrderItem` nie ma własnego repozytorium, czy mutacje przechodzą przez root i czy testy obejmują naruszenia limitów pozycji.

## Eskalacje

| Sytuacja | Eskaluj do | Kontekst do przekazania | Powód |
| --- | --- | --- | --- |
| Niejasne granice bounded context | `system-modularising` | Koncepcje domenowe, procesy biznesowe, obecne moduły | Wymagana strategiczna dekompozycja przed taktyką |
| Brak albo nieaktualny `domain.md` | `system-modularising` | Aktualne wymagania, kod, sprzeczne pojęcia | Potrzebny kontrakt wejściowy dla modelowania |
| Złożone mapowanie persistence dla agregatów | `engineering-databases` | Struktura agregatu, value objects, wzorce zapytań | Wymagana ekspertyza schematu i ORM |
| Architektura nie wspiera wzorców DDD | `architecture-designing` | Obecna architektura, coupling, ograniczenia runtime | Wymagana decyzja systemowa albo refaktor granic |
| Model gotowy do wdrożenia w API | `implementing-backend` | Agregaty, repozytoria, events, błędy domenowe | Potrzebne use case'y, transport i adaptery |
| Implementacja wymaga oceny jakości | `code-reviewing` | Kod domeny, testy, decyzje projektowe | Potrzebny przegląd ryzyk i naruszeń wzorców |

## Spostrzeżenia międzydomenowe

- **`implementing-backend`:** Repository w backendzie bywa zwykłym data access wrapperem. DDD Repository zwraca kompletne agregaty i chroni inwarianty, nie jest generycznym CRUD.
- **`engineering-databases`:** Agregat nie jest tabelą. Mapowanie może wymagać owned types, JSON, tabel zależnych albo read models; decyzję podejmuj na podstawie inwariantów i wzorców zapytań.
- **`system-modularising`:** Strategiczne DDD poprzedza taktyczne. Jeśli język i bounded contexts nie są jasne, projektowanie agregatów będzie zgadywaniem.
- **`architecture-designing`:** Event-driven architecture nie wynika automatycznie z domain events. Events w domenie są faktem biznesowym; topologia komunikacji to osobna decyzja architektoniczna.
- **`code-reviewing`:** Review modelu domenowego musi sprawdzać zachowanie i inwarianty, nie tylko styl klas i pokrycie testami.

## Checklista współpracy

- [ ] Wybrano skill prowadzący dla problemu, a nie uruchomiono wszystkich partnerów naraz.
- [ ] Przy eskalacji przekazano konkretne artefakty: `domain.md`, agregaty, inwarianty, events, wzorce dostępu albo kod.
- [ ] `modeling-domain` nie przejął projektowania schematu, API, deploymentu ani strategicznych bounded contexts.
- [ ] Partnerzy otrzymali model w języku domenowym, nie listę tabel albo DTO.
- [ ] Po powrocie od partnera guard rails agregatów i value objects pozostały nienaruszone.
