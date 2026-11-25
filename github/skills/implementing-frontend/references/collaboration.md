# Kontrakty Współpracy - Implementing Frontend

Formalne interfejsy między skillem `implementing-frontend` a partnerami, którzy przejmują pełny audyt dostępności, optymalizację, review albo projektowanie hooków/composables. Używaj tej referencji przy przekazaniu pracy lub gdy aktywny skill wskazuje delegację.

## Spis treści

- [Ensuring Accessibility](#ensuring-accessibility)
- [Optimizing Frontend](#optimizing-frontend)
- [Reviewing Frontend](#reviewing-frontend)
- [Writing Hooks](#writing-hooks)

## Ensuring Accessibility

### Kiedy przekazać do ensuring-accessibility

- Komponent ma złożone interakcje klawiaturą: combobox, menu, modal, tabs, tree, drag and drop.
- Pojawia się ryzyko focus trap, focus restore, aria state, live region albo kontrastu.
- Szybka kontrola wykazała brak etykiet, niestandardowe elementy interaktywne albo niejasne stany disabled/loading/error.

### Ten skill dostarcza dla ensuring-accessibility

- Strukturę komponentu: elementy interaktywne, DOM tree, sloty, focusable children.
- Stany UI: default, hover, focus, active, disabled, loading, error, empty, selected, expanded.
- Mapowanie tokenów: kolory, kontrast, typografia, rozmiary elementów i widoczne focus states.
- Kontekst zachowania: akcje użytkownika, skróty klawiaturowe, modale, popovery, elementy ukrywane responsywnie.

### Ensuring-accessibility dostarcza

- Role, atrybuty ARIA i semantyczny HTML dla każdego stanu.
- Wzorce keyboard navigation, tab order, arrow keys, escape, enter/space i focus management.
- Wymagania WCAG 2.1 AA, w tym kontrast i zachowanie dla screen readerów.
- Testy lub checklistę a11y adekwatną do komponentu.

### Przykład interfejsu ensuring-accessibility

```text
Implementing frontend: komponent `CommandMenu`, struktura slotów, stany open/loading/empty/error, tokeny focus ring.
Ensuring accessibility: role dialog/listbox/option, aria-activedescendant, focus trap, escape handling, screen reader labels.
```

## Optimizing Frontend

### Kiedy przekazać do optimizing-frontend

- Implementacja powoduje regresję Web Vitals, bundle size, render count, memory usage albo płynności interakcji.
- Komponent renderuje duże listy, wykresy, mapy, edytory, ciężkie biblioteki albo częste aktualizacje danych.
- Potrzebne są pomiary, profiler, bundle analyzer, lazy loading, memoizacja lub wirtualizacja.

### Ten skill dostarcza dla optimizing-frontend

- Strukturę komponentu, granice lazy/error/Suspense i zależności modułowe.
- Wzorce danych: częstotliwość aktualizacji, rozmiary list, źródła server cache i koszt transformacji.
- Informację, które elementy są krytyczne dla pierwszego ekranu, a które mogą być ładowane później.
- Ryzyka UX/a11y wynikające z lazy loadingu, wirtualizacji lub skeletonów.

### Optimizing-frontend dostarcza

- Baseline i pomiar po zmianie: Web Vitals, bundle analyzer, profiler renderowania albo memory snapshot.
- Strategię code splitting, lazy loadingu, memoizacji, wirtualizacji lub offloadingu pracy.
- Walidację, że optymalizacja nie psuje poprawności, dostępności, focus behavior ani stanów danych.

### Przykład interfejsu optimizing-frontend

```text
Implementing frontend: `DashboardWidgets` z komponentami chart/table, loading/error/empty i public API feature.
Optimizing frontend: split points, memoizacja kosztownych filtrów, wirtualizacja tabeli, wynik bundle before/after.
```

## Reviewing Frontend

### Kiedy przekazać do reviewing-frontend

- Zmiana jest gotowa do PR review albo wymaga niezależnej oceny jakości komponentów.
- Potrzebna jest klasyfikacja findingów: critical, warning, suggestion.
- Chcesz sprawdzić antywzorce renderowania, hooków, a11y, performance i organizacji bez prowadzenia pełnej implementacji.

### Ten skill dostarcza dla reviewing-frontend

- Listę zmienionych komponentów, zakres zachowania użytkownika i decyzje projektowe.
- Props API, state boundaries, loading/error/empty, error boundaries i modułowe public API.
- Informację o lokalnych kompromisach: brak tokenu, świadome odchylenie, brak pełnego audytu a11y/performance.

### Reviewing-frontend dostarcza

- Findings z severity, lokalizacją, skutkiem i konkretnym fixem.
- Szybką kontrolę komponentów, hooków/composables, renderowania, a11y, performance i organizacji modułów.
- Decyzję, co blokuje merge, a co jest sugestią refaktoryzacyjną.

### Przykład interfejsu reviewing-frontend

```text
Implementing frontend: komponent `FilterPanel`, API propsów, stan lokalny i barrel file feature.
Reviewing frontend: finding o braku empty state, warning o index key, suggestion przeniesienia helpera do hooka.
```

## Writing Hooks

### Kiedy przekazać do writing-hooks

- Komponent zawiera reużywalną logikę lifecycle, debounce, subskrypcje, retry, cleanup albo integrację z browser API.
- Hook/composable ma być publicznym API dla kilku komponentów.
- Pojawia się stale closure, memory leak, niestabilny return shape albo trudne zależności efektów.

### Ten skill dostarcza dla writing-hooks

- Potrzebę komponentu: props, state shape, lifecycle requirements, eventy i warunki renderowania.
- Kontrakt typów wejścia/wyjścia oraz oczekiwany kształt wartości zwracanej.
- Miejsce integracji w component tree oraz wymagania dotyczące stabilności referencji.
- Stany UI, które hook ma zasilać: loading, error, empty, isPending, selected, expanded.

### Writing-hooks dostarcza

- Hook/composable z nazwą, stabilnym API, cleanupem i testami.
- Strategię zależności efektów, memoizacji callbacków, abortowania requestów i usuwania listenerów.
- Dokumentację warunków re-renderu oraz ograniczeń użycia.

### Przykład interfejsu writing-hooks

```text
Implementing frontend: komponent potrzebuje filtrowania z debounce, retry i stanem `isFiltering`.
Writing hooks: `useFilter` z typowanym API, cleanupem timera, stabilnymi callbackami i testami edge cases.
```
