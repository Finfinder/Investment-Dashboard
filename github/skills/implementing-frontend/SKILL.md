---
name: implementing-frontend
description: Wzorce komponentów frontendowych, kompozycja, tokeny projektowe, barrel files, stany i obsługa błędów w UI.
---

# Implementacja Frontendu

Implementuje komponenty UI, kompozycję, integrację tokenów projektowych, organizację modułów i obsługę stanów w istniejącym stosie frontendu. Nie zastępuje pełnego audytu dostępności, optymalizacji wydajności, review PR ani projektowania hooków/composables — te obszary deleguj do powiązanych skilli.

## Kiedy używać

- Implementacja lub refaktor komponentów UI, układów i stanów danych.
- Projektowanie API komponentu, kompozycji `children`/slotów, wariantów i publicznych eksportów.
- Integracja z design systemem, tokenami, responsywnością i lokalną organizacją modułów.
- Porządkowanie granic między komponentem, hookiem/composable, warstwą danych i modułem feature.

<principles>

<declarative-over-imperative>
Definiuj UI jako funkcję stanu. Render ma opisywać wynik, a side effects należą do handlerów, lifecycle/effect API lub warstwy danych.
</declarative-over-imperative>

<composition-over-configuration>
Preferuj kompozycję nad rozbudowaną konfiguracją: `children`, sloty, render delegation i compound components są lepsze niż komponent z armią booleanów i wariantów.
</composition-over-configuration>

<design-system-first>
Najpierw sprawdź istniejące komponenty, tokeny, klasy narzędziowe, breakpointy i konwencje stylowania. Nie zgaduj kolorów, spacingu, promieni, typografii ani breakpointów.
</design-system-first>

<explicit-states>
Każdy async UI ma jawne stany loading, error i empty. Interaktywne elementy mają też stany hover, focus, active i disabled zgodne z lokalnym design systemem.
</explicit-states>

</principles>

## Proces Implementacji

Użyj poniższego procesu i śledź postęp:

```text
Postęp:
- [ ] Krok 1: Rozpoznaj konwencje
- [ ] Krok 2: Zaprojektuj API komponentu
- [ ] Krok 3: Zaimplementuj stany i layout
- [ ] Krok 4: Zintegruj z design systemem i modułami
- [ ] Krok 5: Zweryfikuj i zdeleguj specjalizacje
```

**Krok 1: Rozpoznaj konwencje**

- Odkryj stos, istniejące komponenty, sposób stylowania, tokeny, breakpointy, eksporty modułów i lokalne walidacje.
- Porównaj wymagany UI z dostępnymi prymitywami design systemu; rozszerzaj lub składaj istniejące elementy zamiast duplikować.
- Jeśli brakuje specyfikacji tokenów, spacingu, breakpointów lub zachowania responsywnego, zapytaj zamiast wymyślać wartości.

**Krok 2: Zaprojektuj API komponentu**

- Ustal granice: komponent wielokrotnego użytku, layout strony, container danych, podkomponent albo hook/composable.
- Zaprojektuj stabilne, typowane props API: jawne wejścia, sensowne wartości domyślne, czytelne callbacki i brak `any`.
- Wybierz kompozycję (`children`, sloty, render props, compound components), gdy konsumenci potrzebują elastyczności.
- Umieść stan jak najbliżej miejsca użycia; shared/global state stosuj tylko dla rzeczywistej konsumpcji przekrojowej.

**Krok 3: Zaimplementuj stany i layout**

- Renderuj deklaratywnie, bez side effects w renderze i bez ręcznej manipulacji DOM poza uzasadnionymi integracjami.
- Dla danych asynchronicznych dodaj loading, error i empty; error powinien mieć znaczącą wiadomość oraz akcję odzyskania, jeśli jest możliwa.
- Owiń ryzykowne subtree mechanizmem error boundary frameworka, zwłaszcza przy danych zdalnych, chartach, integracjach i lazy loadingu.
- Zaimplementuj responsywność na istniejących breakpointach i tokenach; sprawdź układ, overflow, kolejność treści i zachowanie elementów ukrywanych.

**Krok 4: Zintegruj z design systemem i modułami**

- Wszystkie wartości wizualne mapuj na tokeny projektowe: kolor, spacing, typografia, cienie, promienie, animacje i z-index.
- Utrzymuj publiczne API folderu: named exports w TS, świadome barrel files, stabilne nazwy komponentów i feature grouping w Blazor.
- Nie duplikuj logiki hooków/composables w komponentach. Gdy logika ma lifecycle, cleanup, debounce, subskrypcje albo reuse, wydziel ją i użyj `writing-hooks`.

**Krok 5: Zweryfikuj i zdeleguj specjalizacje**

- Sprawdź default, hover, focus, active, disabled, loading, error, empty i podstawowe zachowanie responsywne.
- Uruchom lokalne lint/test/build albo najwęższą walidację repozytorium dla dotkniętej ścieżki.
- Dla pełnego audytu WCAG użyj `ensuring-accessibility`; dla pomiarów Web Vitals/bundla `optimizing-frontend`; dla PR review `reviewing-frontend`; dla reusable lifecycle logic `writing-hooks`.

## Guard Rails

- Komponent ma jasną odpowiedzialność i nie miesza bez potrzeby fetchingu, transformacji, renderingu oraz niezależnych side effects.
- Props API jest typowane, stabilne i minimalne; warianty są nazwane domenowo, a callbacki opisują intencję użytkownika.
- Stan lokalny zostaje lokalny; wyniesiony, kontekstowy lub globalny stan wymaga realnego współdzielenia albo przekrojowej odpowiedzialności.
- Każdy async UI ma loading, error i empty; każdy ryzykowny subtree ma boundary lub jawny fallback błędu.
- Layout ma zdefiniowane zachowanie responsywne, a fixed-format elementy mają stabilne wymiary lub ograniczenia.
- Tokeny projektowe zastępują hardcoded wartości; nowy token lub odstęp wymaga potwierdzenia albo udokumentowanego odchylenia.
- Reużywalna logika, cleanup i lifecycle nie powinny mieszkać w komponentach prezentacyjnych, jeśli naturalnie należą do hooka/composable.

## Zakazy

- Nie koduj na sztywno wartości designu bez sprawdzenia tokenów, utility classes albo lokalnych zmiennych CSS.
- Nie twórz komponentu, który jednocześnie pobiera dane, transformuje je, renderuje wiele flow i zarządza niezależnymi efektami.
- Nie dodawaj barrel file `index.ts`, który eksportuje wszystko bez świadomego public API.
- Nie ignoruj keyboard/focus states, zwłaszcza w przyciskach, linkach, listach wyboru, modalach i elementach sterujących.
- Nie zostawiaj async UI bez loading/error/empty, nawet jeśli happy path jest szybki w dev.
- Nie używaj `any` dla propsów ani globalnego store dla lokalnego przełącznika UI.

## Materiały Referencyjne

Ładuj tylko referencje potrzebne do konkretnego zadania:

- `./references/component-architecture.md` — granice komponentów, kompozycja, props API, state boundaries, loading/error/empty i error boundaries.
- `./references/design-system-and-responsive.md` — mapowanie tokenów, brakujące wartości, breakpointy, responsive behavior i zakazy hardcoded design values.
- `./references/module-organization.md` — barrel files, named exports, public API folderów, granice modułów i Blazor feature grouping.
- `./references/collaboration.md` — pełne kontrakty przekazania pracy do `ensuring-accessibility`, `optimizing-frontend`, `reviewing-frontend` i `writing-hooks`.
- `./references/react-patterns.md` — React/TypeScript: JSX composition, typed props, hooks, error boundaries, memoizacja i Suspense/lazy.
- `./references/blazor-patterns.md` — Blazor UI: `RenderFragment`, `[Parameter]`, `EventCallback<T>`, `ErrorBoundary`, `@key`, `ShouldRender` i wirtualizacja.
- `./references/validations.md` — warunkowe reguły skanowalne regex dla Next.js/React/TradingView, gdy zadanie dotyczy tego stacku.
- `./references/sharp-edges.md` — produkcyjne pułapki React/Next.js/TradingView, stale closure, memory leaks, hydration i bundle explosion.

## Powiązane Skille

- `ensuring-accessibility` — pełny audyt WCAG, ARIA, keyboard navigation i focus management.
- `optimizing-frontend` — pomiary Web Vitals, bundle size, render profiling, lazy loading i memory leaks.
- `reviewing-frontend` — review PR pod kątem jakości komponentów, hooków, renderowania, a11y i performance.
- `writing-hooks` — projektowanie reusable hooków/composables, stabilnego API, cleanupu i testów lifecycle.
