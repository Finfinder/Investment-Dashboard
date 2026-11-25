# Kontrakty Współpracy - Zapewnianie Dostępności

Formalne interfejsy między skillem `ensuring-accessibility` a najczęstszymi partnerami. Używaj tej referencji, gdy zadanie wymaga przekazania pracy między implementacją, review, testami E2E, formularzami, UI verification, performance albo hookami.

## Spis Treści

- [implementing-frontend](#implementing-frontend)
- [reviewing-frontend](#reviewing-frontend)
- [testing-e2e](#testing-e2e)
- [implementing-forms](#implementing-forms)
- [ui-verifying](#ui-verifying)
- [optimizing-frontend](#optimizing-frontend)
- [writing-hooks](#writing-hooks)

## implementing-frontend

Ten skill dostarcza:

- Wymagania semantyki, klawiatury, fokusu, ARIA, kontrastu i dynamicznych komunikatów.
- Guard rails WCAG 2.1 AA dla komponentu lub widoku.
- Kryteria walidacji dostępności dla stanów UI.

Partner dostarcza:

- Implementację komponentów, API props, kompozycję, integrację z design systemem i lokalnym stackiem.
- Mapowanie wymagań a11y na istniejące prymitywy komponentów.

Przykład interfejsu:

```text
ensuring-accessibility: dialog wymaga aria-labelledby, focus trap, Escape i powrotu fokusu.
implementing-frontend: implementuje Dialog API, style, tokeny i integrację w module.
```

## reviewing-frontend

Ten skill dostarcza:

- Kryteria a11y do oceny: semantyka, keyboard path, focus management, formularze, kontrast i live regions.
- Priorytety severity dla blokujących naruszeń dostępności.

Partner dostarcza:

- Findings review osadzone w diffie, z priorytetem i wskazaniem regresji.
- Szybką ocenę jakości komponentu, hooków, renderowania i performance w PR.

Przykład interfejsu:

```text
reviewing-frontend: wykrywa div z onClick bez obsługi klawiatury.
ensuring-accessibility: określa poprawkę semantyczną i wymagany model Enter/Space/focus.
```

## testing-e2e

Ten skill dostarcza:

- Scenariusze a11y dla flow: keyboard walkthrough, modale, formularze, live updates i axe checks.
- Kryteria dla lokatorów po roli/nazwie i asercji fokusu.

Partner dostarcza:

- Implementację testów Playwright, fixture, mocki, stabilizację i uruchomienie E2E.
- Integrację `@axe-core/playwright` albo istniejącego helpera repozytorium.

Przykład interfejsu:

```text
ensuring-accessibility: flow filtrów musi ogłaszać liczbę wyników i zachować logiczny fokus.
testing-e2e: dodaje test Playwright z keyboard navigation, aria-live assertion i axe scan.
```

## implementing-forms

Ten skill dostarcza:

- Minimalny kontrakt etykiet, `aria-describedby`, błędów, live regions i screen reader smoke.
- Wymagania focus management po submit i dla formularzy wieloetapowych.

Partner dostarcza:

- Architekturę formularza, walidację schematem, composition pól, submit flow i obsługę błędów domenowych.
- Szczegółowe reguły walidacji i UX formularza.

Przykład interfejsu:

```text
implementing-forms: projektuje schema validation i reusable Field.
ensuring-accessibility: wymaga widocznej labelki, error id, aria-describedby i fokusowania pierwszego błędu.
```

## ui-verifying

Ten skill dostarcza:

- Kryteria dostępności, które muszą pozostać zgodne z projektem: kontrast, focus, stany i reflow.
- Granice akceptowalnych różnic, gdy projekt wizualny koliduje z WCAG.

Partner dostarcza:

- Porównanie implementacji z projektem, screenshoty, tolerancje i klasyfikację różnic UI.
- Weryfikację overlapów, spacingu, typografii i responsywności.

Przykład interfejsu:

```text
ui-verifying: focus ring różni się od projektu.
ensuring-accessibility: potwierdza, że zamiennik musi nadal spełniać kontrast 3:1.
```

## optimizing-frontend

Ten skill dostarcza:

- Wymagania a11y dla zmian wpływających na renderowanie, lazy loading, animacje i responsywność interakcji.
- Ograniczenia: performance nie może usuwać semantyki, focus state ani live updates.

Partner dostarcza:

- Pomiar Web Vitals, bundle size, render profiling, lazy loading i memory leak analysis.
- Optymalizacje bez regresji w keyboard/focus/screen reader path.

Przykład interfejsu:

```text
optimizing-frontend: opóźnia ładowanie panelu.
ensuring-accessibility: wymaga statusu ładowania i zachowania fokusu po pojawieniu się panelu.
```

## writing-hooks

Ten skill dostarcza:

- Kontrakt zachowania dla reusable focus trap, route focus, Escape handler, roving tabindex i cleanup live subscriptions.
- Edge cases dostępności, które hook musi obsłużyć.

Partner dostarcza:

- Stabilne API hooka/composable, lifecycle, cleanup, testy i integrację z frameworkiem.
- Kontrolę referencji DOM, event listenerów i zależności efektów.

Przykład interfejsu:

```text
ensuring-accessibility: modal wymaga trapu fokusu i powrotu do triggera.
writing-hooks: projektuje useFocusTrap z cleanupem listenerów i testami lifecycle.
```
