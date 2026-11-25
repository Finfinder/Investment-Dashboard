---
name: writing-hooks
description: "Wzorce hooków i composables — reużywalna logika UI, lifecycle, cleanup, testy. React, Vue, Blazor."
---

# Pisanie Hooków

Prowadzi projektowanie i implementację reużywalnej logiki UI: hooków Reacta, composables Vue, lifecycle/code-behind Blazor oraz analogicznych abstrakcji frameworka. Aktywny tier zawiera proces i guard raile; tabele, przykłady, testy i warianty frameworkowe są w `references/`.

## Kiedy używać

- Pisanie, refaktoryzacja, debugowanie lub review hooków Reacta, composables Vue, Blazor lifecycle/code-behind i reusable UI logic.
- Ekstrakcja logiki z komponentu do małej jednostki wielokrotnego użytku.
- Decyzje o dependency arrays, watcherach, cleanup, stale closures, stable callbacks, return shape i testing hooks.
- Projektowanie API hooka/composable, gdy potrzebny jest stabilny kontrakt wejść, wyjść, błędów i lifecycle.

<principles>

<single-responsibility>
Hook robi jedną rzecz. Gdy rośnie liczba opcji, trybów albo niezależnych efektów, rozbij go na mniejsze atomy i ewentualny hook koordynujący.
</single-responsibility>

<stable-api-contract>
Kształt zwracanej wartości jest publicznym API. Dla 3+ wartości używaj obiektu lub nazwanych pól; stabilizuj callbacki i wartości tylko wtedy, gdy konsumenci rzeczywiście potrzebują stabilnej referencji.
</stable-api-contract>

<complete-reactivity>
Śledź pełne zależności efektów, watcherów, memoizacji i lifecycle. Czysty render nie wykonuje requestów, subskrypcji, timerów, dispatchy ani mutacji globalnego stanu.
</complete-reactivity>

<owner-cleanup>
Kod tworzący zasób odpowiada za cleanup przy unmount/dispose oraz przy zmianie zależności. Dotyczy timerów, listenerów, subskrypcji, observerów, requestów, focus trapów i operacji async.
</owner-cleanup>

<testable-lifecycle>
Nietrywialny hook ma testy dla initial state, transitions, cleanup/unmount, error path oraz async cancellation albo fake timers, jeśli używa czasu, requestów lub subskrypcji.
</testable-lifecycle>

</principles>

## Proces

```text
Postęp hooka/composable:
- [ ] Krok 1: Rozpoznaj lokalne wzorce
- [ ] Krok 2: Zaprojektuj API i return shape
- [ ] Krok 3: Zaimplementuj lifecycle, dependencies i cleanup
- [ ] Krok 4: Obsłuż async, race conditions i errors
- [ ] Krok 5: Przetestuj hook/composable/lifecycle
- [ ] Krok 6: Zdeleguj komponenty, a11y, performance i E2E do partnerów
```

**Krok 1: Rozpoznaj lokalne wzorce**

Sprawdź framework, istniejące hooki/composables, bibliotekę danych, test runner, linter zależności i konwencję eksportów. Nie wprowadzaj nowego stylu API, jeśli repo ma już utrwalony wzorzec.

**Krok 2: Zaprojektuj API i return shape**

Nazwij zachowanie, nie implementację. Dla 3+ parametrów preferuj options object; dla 3+ wartości zwracaj obiekt z nazwanymi polami. Ustal, które pola są stanem, akcjami, błędem, statusem albo funkcjami cleanup/refetch.

**Krok 3: Zaimplementuj lifecycle, dependencies i cleanup**

Hooki/composables wywołuj zgodnie z zasadami frameworka: na najwyższym poziomie, bez wywołań warunkowych, w pętlach, callbackach lub po early return. Każda reaktywna wartość użyta w efekcie, watcherze, memoizacji lub lifecycle musi być śledzona albo lokalnie uzasadniona i przetestowana.

**Krok 4: Obsłuż async, race conditions i errors**

Async zależny od parametrów ma anulowanie przez `AbortController`, `CancellationTokenSource`, cleanup watchera albo równoważny mechanizm. Jeśli operacji nie da się anulować, ignoruj stare wyniki. Expected errors zwracaj jako `{ error }`, status albo wynik domenowy; silent catch jest błędem.

**Krok 5: Przetestuj hook/composable/lifecycle**

Użyj lokalnego standardu testów: `renderHook`, helpera composable, bUnit, fake timers, provider wrapperów albo DI test context. Pokryj stan początkowy, przejścia, cleanup/unmount, ścieżkę błędu oraz async cancellation/race, jeśli dotyczy.

**Krok 6: Zdeleguj komponenty, a11y, performance i E2E do partnerów**

Ten skill kończy się na reużywalnej logice UI. Komponenty, design system, pełny WCAG/focus policy, mierzoną wydajność, Playwright flows, formularze i zgodność z projektem przekazuj do powiązanych skilli.

## Guard Raile I Minimalne Zakazy

- Nie łam Rules of Hooks ani analogicznych zasad composables/lifecycle: brak wywołań warunkowych, w pętlach, callbackach lub po early return.
- Nie wyciszaj `exhaustive-deps`, `rules-of-hooks` ani podobnych reguł bez lokalnego uzasadnienia i testu pokrywającego ryzyko stale closures albo stale data.
- Nie twórz efektów, subskrypcji, timerów, listenerów, observerów, requestów ani focus trapów bez cleanupu przy unmount/dispose i zmianie zależności.
- Nie zostawiaj async zależnego od parametrów bez `AbortController` albo równoważnego anulowania; chroń stan przed race conditions i starymi wynikami.
- Nie zwracaj niestabilnego lub pozycyjnie niejasnego API dla 3+ wartości; użyj obiektu, nazwanych pól i stabilnych publicznych callbacków tylko tam, gdzie konsumenci ich potrzebują.
- Nie ukrywaj expected errors przez silent catch; zwróć stan błędu, status albo rezultat, który komponent może obsłużyć.
- Nie rób fetch/data orchestration w hooku, jeśli repo ma dedykowaną bibliotekę/cache danych, query clienta, store albo serwisy danych bez lokalnego uzasadnienia.
- Nie mieszaj renderowanych komponentów JSX/Razor z hookiem jako domyślnego wyniku, jeśli zaciera to granicę komponentu i logiki.

## Materiały Referencyjne

Ładuj referencje warunkowo, tylko dla dotkniętego obszaru:

- `./references/api-contract-and-composition.md` — nazewnictwo, options object, return shape, stabilny publiczny API, poziomy atom/molekuła/organizm i kompozycja hooków.
- `./references/lifecycle-and-reactivity.md` — dependency arrays/watchers, stale closures, czysty render, stabilne tożsamości, cleanup zasobów, lifecycle i dispose.
- `./references/async-and-data-hooks.md` — `enabled`/`skip`, abortable async, race conditions, expected errors, granice cache danych, retry, debounce i throttle.
- `./references/testing-hooks.md` — `renderHook`, testy composables, providery, fake timers, cleanup, error paths, async cancellation i bUnit.
- `./references/accessibility-hooks.md` — focus trap helpers, route focus, Escape, roving tabindex i live regions; pełny audyt deleguj do `ensuring-accessibility`.
- `./references/sharp-edges.md` — antywzorce i pułapki: mega-hook, disabled deps, stale data, missing cleanup, tuple misuse, useEffect data fetching, over-memoization i render side effects.
- `./references/collaboration.md` — kontrakty współpracy z powiązanymi skillami, gdy zakres wykracza poza sam hook/composable.
- `./references/react-patterns.md` — React: `useEffect`, `useMemo`, `useCallback`, tablice zależności, cleanup i `renderHook`.
- `./references/vue-patterns.md` — Vue: Composition API, refs/reactive/computed, watch/watchEffect, scope cleanup, composables danych i testy.
- `./references/blazor-patterns.md` — Blazor UI: serwisy stanu, lifecycle, `StateHasChanged`, `IDisposable`/`IAsyncDisposable` i bUnit.

## Powiązane Skille

- `implementing-frontend` — komponenty, kompozycja, design system, layout i organizacja modułów konsumujących hook.
- `reviewing-frontend` — PR findings dla hooków, composables, reaktywności, cleanupu i wpływu na rendering.
- `optimizing-frontend` — mierzona wydajność, memoizacja, render cost, bundle impact i memory profile.
- `ensuring-accessibility` — pełny WCAG, semantyka ARIA, keyboard navigation, focus policy i testy dostępności.
- `testing-e2e` — Playwright user flows i integracyjne scenariusze użytkownika.
- `implementing-forms` — złożona walidacja, form state, multi-step flows i integracja z biblioteką formularzy.
- `ui-verifying` — zgodność widocznego zachowania, stanów i interakcji z projektem UI.
