# C4 i ADR

Materiał referencyjny dla diagramów C4 oraz Architecture Decision Records tworzonych w planach architektonicznych.

## Reguły C4

C4 ma wyjaśniać granice i relacje, nie dekorować dokument. Dobierz poziom do decyzji:

- Context: obowiązkowy dla nowych systemów, integracji i zmian z aktorami lub systemami zewnętrznymi.
- Container: domyślny poziom dla planu implementacji; pokazuje aplikacje, API, bazy danych, kolejki, workers i relacje.
- Component: warunkowy; twórz tylko dla kontenerów bezpośrednio zmienianych albo gdy granice odpowiedzialności nie są oczywiste.
- Code: zwykle pomijaj w planach; użyj tylko dla bardzo technicznej decyzji, gdy diagram klas/funkcji jest bardziej czytelny niż opis.

Domyślnie używaj Mermaid, bo dobrze działa w Markdown i kontroli wersji. Jeśli repozytorium ma istniejący standard PlantUML, Structurizr albo draw.io, dopasuj się do niego.

## C4 Context

Context pokazuje system jako jedną całość w otoczeniu:

- Nazwij system projektowany i zaznacz jego granicę.
- Pokaż aktorów, role i systemy zewnętrzne, które mają wpływ na wymagania lub ryzyka.
- Opisz relacje czasownikiem i technologią tylko wtedy, gdy ma to znaczenie decyzyjne.
- Nie pokazuj wewnętrznych komponentów ani tabel baz danych.

## C4 Container

Container pokazuje elementy wdrożeniowe lub runtime:

- Aplikacje web/mobile/desktop, API, backend services, workers, schedulery, kolejki, cache, bazy danych i storage.
- Granice zaufania, protokoły, kierunek zależności i źródła prawdy dla danych.
- Elementy istniejące oraz nowe lub zmieniane w planie.
- Quality concerns przy relacjach, jeśli są kluczowe: auth, szyfrowanie, retry, idempotencja, observability.

## C4 Component

Component stosuj, gdy plan wymaga zrozumienia odpowiedzialności wewnątrz kontenera:

- Pokaż komponenty bezpośrednio dotknięte zmianą, nie cały system.
- Grupuj według warstw, domen albo boundary, zgodnie z lokalnym stylem.
- Zaznacz publiczne interfejsy, adaptery, repozytoria, domain services, handlers i walidatory, jeśli wpływają na implementację.
- Unikaj diagramu, który powtarza strukturę katalogów bez dodatkowej wartości decyzyjnej.

## ADR: Kiedy Tworzyć

Twórz ADR, gdy decyzja:

- Jest trudna do odwrócenia albo koszt odwrócenia jest wysoki.
- Wpływa na wiele modułów, granice systemu, dane, security, performance lub operacje.
- Wybiera technologię, wzorzec integracji, model danych, strategię migracji albo standard API.
- Ma istotne alternatywy i trade-offy.
- Pochodzi z `solution-researching` i wymaga akceptacji w planie.

Nie twórz ADR dla oczywistej lokalnej zmiany bez alternatyw; w planie zapisz wtedy `Nie dotyczy` i krótki powód.

## Format ADR

Minimalny ADR w planie:

```markdown
### ADR-001: Tytuł decyzji

**Status:** Proponowany | Zaakceptowany | Odrzucony | Zastąpiony | Wycofany

**Kontekst:** Jakie wymagania, ograniczenia i ryzyka wymuszają decyzję.

**Rozważane opcje:** Lista realnych alternatyw z krótkim opisem.

**Decyzja:** Wybrany wariant.

**Uzasadnienie:** Dlaczego ten wariant najlepiej spełnia kryteria.

**Konsekwencje:** Pozytywne, negatywne i operacyjne skutki decyzji.
```

Statusy stosuj konsekwentnie:

- Proponowany: decyzja do akceptacji w planie.
- Zaakceptowany: decyzja zatwierdzona do implementacji.
- Odrzucony: wariant rozważony, ale niewybrany.
- Zastąpiony: decyzja historyczna zastąpiona nową.
- Wycofany: decyzja nie obowiązuje i nie ma bezpośredniego następcy.

## ADR-y z Solution Research

Jeśli `*.solution-research.md` dostarcza ADR drafts:

- Przenieś je do planu tylko, jeśli nadal dotyczą zakresu.
- Zaktualizuj status na podstawie decyzji architektonicznej.
- Zachowaj alternatywy i kryteria oceny, aby nie zgubić trade-offów.
- Oznacz odrzucone warianty jako odrzucone, zamiast usuwać historię decyzji.

## Walidacja Diagramów i ADR

Przed finalizacją sprawdź:

```text
- [ ] Context pokazuje aktorów, system, systemy zewnętrzne i granicę.
- [ ] Container pokazuje główne runtime elements i relacje.
- [ ] Component jest obecny tylko, gdy pomaga w implementacji.
- [ ] Diagramy nie przeczą wymaganiom, NFR ani istniejącemu codebase.
- [ ] ADR-y mają realne alternatywy, decyzję, uzasadnienie i konsekwencje.
- [ ] Istotne decyzje bez ADR mają jawny powód pominięcia.
```
