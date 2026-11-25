# Kontrakty Współpracy - Pisanie Hooków

Formalne interfejsy między `writing-hooks` a najczęstszymi partnerami. Ładuj tę referencję, gdy zadanie wykracza poza samą reużywalną logikę UI albo wymaga przekazania decyzji do innego skilla.

## implementing-frontend

Ten skill dostarcza:

- Kontrakt hooka/composable: nazwa, wejścia, return shape, lifecycle, cleanup i testy jednostkowe.
- Decyzję, co zostaje logiką reużywalną, a co należy do komponentu.

Partner dostarcza:

- Strukturę komponentów, kompozycję, integrację z design systemem, layout, stany UI i organizację modułów.

Przykład interfejsu:

```text
writing-hooks: useDialogState zwraca { isOpen, open, close }
implementing-frontend: Dialog komponuje hook z komponentem modalnym design systemu
```

## reviewing-frontend

Ten skill dostarcza:

- Kryteria jakości hooków: zależności, cleanup, stale closures, return shape, testy lifecycle.

Partner dostarcza:

- Findings PR, severity, lokalizacje w diffie i ocenę wpływu na komponenty/rendering.

Przykład interfejsu:

```text
reviewing-frontend zgłasza disabled exhaustive-deps; writing-hooks wskazuje przebudowę efektu i test stale closure.
```

## optimizing-frontend

Ten skill dostarcza:

- Stabilny kontrakt publiczny oraz miejsca, gdzie callbacki/wartości są konsumowane przez memoizowane dzieci, providery lub listy.

Partner dostarcza:

- Pomiary render cost, Web Vitals, profiler, bundle impact, memory profile i decyzje memoizacyjne oparte na danych.

Przykład interfejsu:

```text
writing-hooks stabilizuje provider value, a optimizing-frontend potwierdza spadek re-renderów profilerem.
```

## ensuring-accessibility

Ten skill dostarcza:

- Mechanikę hooków wspierających fokus, Escape, roving tabindex, route focus lub live regions.

Partner dostarcza:

- Pełną politykę WCAG, semantykę ARIA, keyboard navigation, focus management całego flow i walidację dostępności.

Przykład interfejsu:

```text
writing-hooks implementuje useFocusTrap; ensuring-accessibility ocenia role dialogu, etykiety i zachowanie czytnika ekranu.
```

## testing-e2e

Ten skill dostarcza:

- Testy jednostkowe hooka/composable: initial state, transitions, cleanup, error path i async cancellation.

Partner dostarcza:

- Playwright user flows, integrację z routingiem, realną klawiaturę/fokus i scenariusze użytkownika.

Przykład interfejsu:

```text
writing-hooks testuje useKeyboardShortcut izolowanie; testing-e2e sprawdza skrót w pełnym flow aplikacji.
```

## implementing-forms

Ten skill dostarcza:

- Małe hooki pól, dirty/touched state, debounce i cleanup walidacji async, jeśli zakres jest lokalny.

Partner dostarcza:

- Architekturę złożonego form state, schema validation, multi-step flows, dostępne błędy i integrację z biblioteką formularzy.

Przykład interfejsu:

```text
writing-hooks projektuje useFieldFocus; implementing-forms projektuje walidację formularza i kontrakt błędów.
```

## ui-verifying

Ten skill dostarcza:

- Informację, jakie zachowanie hooka wpływa na widoczny stan UI, focus lub interakcję.

Partner dostarcza:

- Weryfikację zgodności z projektem, tolerancje wizualne i priorytety różnic względem makiety.

Przykład interfejsu:

```text
writing-hooks wskazuje, że useTabs zarządza active tab; ui-verifying sprawdza zgodność stanów tabów z projektem.
```
