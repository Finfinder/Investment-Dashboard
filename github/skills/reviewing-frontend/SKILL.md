---
name: reviewing-frontend
description: Kryteria przeglądu frontendu — antywzorce komponentów, jakość hooków, poprawność renderowania, dostępność i wydajność. Używaj przy review PR frontendowych, audycie komponentów lub identyfikacji zapachów kodu UI.
---

# Przegląd Frontendu

Uzupełnia, a nie zastępuje, ogólny `code-reviewing`: dodaje frontendową soczewkę dla komponentów, hooków/composables, renderowania, dostępności, wydajności i organizacji UI. Aktywny tier zawiera proces, progi ważności i blokery; szczegółowe checklisty oraz przykłady są w `references/`.

## Kiedy używać

- Review PR lub diffu zmieniającego komponenty, hooki, composables, formularze, listy, modale, routing UI albo stan po stronie klienta.
- Audyt jakości frontendowego kodu, gdy ogólny review nie wystarcza do oceny renderingu, a11y, bundla i lifecycle.
- Identyfikacja zapachów UI: przeciążone komponenty, niepełne stany danych, stale closure, niestabilne klucze, cleanup i focus management.
- Szybki przegląd regresji frontendowych przed eskalacją do `ensuring-accessibility`, `optimizing-frontend`, `writing-hooks` albo `implementing-frontend`.

<principles>

<frontend-lens>
Najpierw wykonaj ogólny code review albo prowadź go równolegle przez `code-reviewing`. Ten skill dodaje tylko kryteria specyficzne dla frontendu: zachowanie UI, semantykę interakcji, cykl życia komponentów, rendering, stan po stronie klienta i koszt dostarczanego kodu.
</frontend-lens>

<severity-over-style>
Poprawność, dostępność, rendering, bezpieczeństwo i wycieki pamięci mają wyższy priorytet niż styl, nazewnictwo i preferencje kompozycji. Nie blokuj merge z powodu estetyki, jeśli nie umiesz wskazać ryzyka użytkownika, utrzymania albo regresji.
</severity-over-style>

<evidence-before-deep-claims>
Szybka kontrola wydajności w review wskazuje ryzyko, nie udaje pełnego profilu. Dla claims o Web Vitals, bundle size, re-render count albo memory growth podaj pomiar albo przekaż do `optimizing-frontend`.
</evidence-before-deep-claims>

</principles>

## Blokery Critical

Poniższe problemy zgłaszaj jako `critical`, chyba że diff pokazuje bezpieczny, lokalnie przyjęty wzorzec, który usuwa ryzyko:

- Niesemantyczne interakcje: `div`/`span` jako przycisk lub link bez natywnej klawiatury, roli, nazwy i fokusu.
- Brak focus management w modalach/dialogach: fokus nie trafia do dialogu, ucieka na tło albo nie wraca do triggera.
- `index` jako key w dynamicznych listach, które mogą się sortować, filtrować, dodawać, usuwać lub trzymać lokalny stan.
- Efekty bez cleanupu dla timerów, listenerów, subskrypcji, requestów, WebSocketów, obserwatorów albo workerów.
- Side effects w renderze: requesty, storage, mutacje store, event dispatch, subskrypcje lub losowe klucze tworzone podczas renderowania.
- Surowy HTML bez sanityzacji: `dangerouslySetInnerHTML`, `innerHTML`, `MarkupString`, `v-html`, `AddMarkupContent` z danymi użytkownika/API/CMS.

Jeśli blocker dotyczy tylko hipotetycznego przyszłego użycia, obniż do `warning` i nazwij warunek, który uczyniłby go krytycznym.

## Proces Przeglądu

```text
Postęp przeglądu frontendu:
- [ ] Krok 1: Komponenty
- [ ] Krok 2: Hooki / composables / reaktywność
- [ ] Krok 3: Poprawność renderowania
- [ ] Krok 4: Szybka dostępność
- [ ] Krok 5: Szybka wydajność
- [ ] Krok 6: Raport findings
```

**Krok 1: Komponenty**

- Sprawdź, czy komponent ma jedną odpowiedzialność i nie miesza fetchingu, transformacji, prezentacji oraz niezależnych flow.
- Oceń propsy: minimalne, typowane, bez armii booleanów i bez konfiguracji, która zastępuje kompozycję.
- Sprawdź kompozycję przez `children`, sloty, compound components lub lokalny wzorzec frameworka, jeśli konsumenci potrzebują elastyczności.
- Zweryfikuj lokalizację stanu: stan blisko miejsca użycia, brak niepotrzebnego liftingu i brak globalnego store dla lokalnego UI.
- Dla danych asynchronicznych wymagaj stanów loading, error i empty.
- Nazwy komponentów oraz callbacków mają mówić o domenie UI; default export traktuj jako `suggestion`, chyba że repo wymaga named exports.
- Przy progach podziału komponentu, propsach, SRP i exportach załaduj `./references/component-structure.md`.

**Krok 2: Hooki / Composables / Reaktywność**

- Dla reużywalnej logiki sprawdź nazwę, pojedynczą odpowiedzialność, czytelny return shape i stabilność referencji zwracanych callbacków.
- Każda wartość reaktywna użyta w efekcie, watcherze, selectorze lub lifecycle musi być ujęta w zależnościach albo mieć jawne uzasadnienie.
- Wyciszone reguły zależności (`exhaustive-deps`, reguły Vue, podobne lintery) traktuj jako `warning`, a jako `critical`, jeśli prowadzą do błędnego zapisu lub stale data.
- Każdy timer, listener, request, subskrypcja, observer, WebSocket i worker ma cleanup.
- Render i computed view pozostają czyste; efekty uboczne należą do handlerów lub lifecycle/effect API.
- Przy głębszej analizie hooków/composables załaduj `./references/hooks-and-reactivity.md`; dla API React/Blazor dodatkowo `./references/react-patterns.md` lub `./references/blazor-patterns.md`.

**Krok 3: Poprawność Renderowania**

- Listy dynamiczne używają stabilnych kluczy opartych o tożsamość rekordu, nie indeks.
- Memoizacja ma powód i komplet zależności; nie może ukrywać stale data ani custom compare ignorującego pola wpływające na UI.
- Obiekty, tablice i callbacki są stabilne tam, gdzie referencja trafia do memoizowanego dziecka, providera, zależności efektu albo dużej listy.
- Warunki renderowania są czytelne; preferuj guard clauses dla loading/error/empty i wydzielanie podkomponentów powyżej 2 poziomów zagnieżdżenia.
- Refy/pola niereaktywne nie przechowują stanu wpływającego na UI, a state nie przechowuje wartości technicznych typu timer ID.
- Stan pochodny wyliczaj lub memoizuj, zamiast trzymać dwa źródła prawdy.
- Przy keys, memo, refs, derived state i conditional rendering załaduj `./references/rendering-correctness.md`.

**Krok 4: Szybka Dostępność**

- To szybka kontrola, nie pełny audyt WCAG. Dla pełnej walidacji użyj `ensuring-accessibility`.
- Sprawdź semantyczne elementy interaktywne, widoczne etykiety formularzy, tekstowe błędy, logiczne nagłówki, keyboard access i brak `tabIndex > 0`.
- Modale/dialogi wymagają focus management i powrotu fokusu.
- Stan nie może opierać się wyłącznie na kolorze; ARIA nie może ukrywać elementów interaktywnych ani sfokusowanych.
- Przy checklistach a11y, ARIA i eskalacji załaduj `./references/accessibility-and-performance-review.md`.

**Krok 5: Szybka Wydajność**

- To szybka kontrola ryzyka, nie pełna optymalizacja. Dla pomiarów Web Vitals, bundla, profilerów i memory analysis użyj `optimizing-frontend`.
- Sprawdź nowe ciężkie importy, wildcard/barrel imports, brak lazy loadingu dla tras i ciężkich komponentów poza pierwszym ekranem.
- Oflaguj provider values tworzone inline, duże listy bez paginacji/wirtualizacji, niestabilne propsy w memoizowanych dzieciach i kosztowną pracę synchroniczną w handlerach.
- Cleanup efektów jest także kontrolą wydajności i pamięci.
- Przy szybkich checklistach performance załaduj `./references/accessibility-and-performance-review.md`; przy typowych failure modes `./references/sharp-edges.md`.

**Krok 6: Raport Findings**

- Findings prowadzą odpowiedź i są posortowane od najwyższej severity.
- Każde ustalenie zawiera lokalizację, skutek i konkretny fix.
- `critical`: poprawność, dostępność, rendering, security albo memory leak blokujące bezpieczny merge.
- `warning`: ryzyko warte naprawy lub świadomej akceptacji.
- `suggestion`: usprawnienie stylu, kompozycji lub czytelności bez blokowania merge.
- Przy mapowaniu severity, formacie raportu i przykładach załaduj `./references/reporting-and-severity.md`.

## Materiały Referencyjne

Ładuj referencje warunkowo, tylko dla dotkniętego obszaru:

- `./references/component-structure.md` — SRP, propsy, kompozycja, lokalizacja stanu, loading/error/empty, nazwy, named exports i progi podziału komponentu.
- `./references/hooks-and-reactivity.md` — dependencies, cleanup, return shape, side effects, reactivity i adaptacja dla hooków/composables/lifecycle.
- `./references/rendering-correctness.md` — keys, memoizacja, stabilność obiektów/funkcji, conditional rendering, refs i stan pochodny.
- `./references/accessibility-and-performance-review.md` — szybkie checklisty a11y/performance oraz routing do `ensuring-accessibility` i `optimizing-frontend`.
- `./references/reporting-and-severity.md` — mapowanie severity, format raportu i przykładowe ustalenia.
- `./references/sharp-edges.md` — typowe edge cases: niesemantyczne interakcje, fokus modalny, index-as-key, cleanup, side effects w renderze, raw HTML, stale closure.
- `./references/react-patterns.md` — React: `exhaustive-deps`, rules of hooks, memoizacja, context values i `dangerouslySetInnerHTML`.
- `./references/blazor-patterns.md` — Blazor UI: lifecycle, `@key`, `EventCallback`, `CascadingValue`, `MarkupString`, JS interop i cleanup `Dispose`/`DisposeAsync`.

## Checklista Końcowa

```text
- [ ] Review ogólny (`code-reviewing`) nie został zastąpiony frontendową checklistą.
- [ ] Critical blokery z aktywnego tieru zostały sprawdzone w diffie.
- [ ] Komponenty mają sensowne granice, propsy, kompozycję i stany danych.
- [ ] Hooki/composables mają komplet zależności, cleanup i czysty render.
- [ ] Listy, memoizacja, refy i stan pochodny nie tworzą błędów renderowania.
- [ ] Szybka kontrola a11y nie wykazała problemów klawiatury, fokusu, etykiet ani ARIA.
- [ ] Szybka kontrola performance nie wykazała oczywistych regresji bundla, renderu ani pamięci.
- [ ] Findings mają severity, lokalizację, skutek i konkretny fix.
```

## Powiązane Skille

- `code-reviewing` — ogólny proces review; ten skill dostarcza wyłącznie kontrole specyficzne dla frontendu.
- `implementing-frontend` — wzorce komponentów, kompozycji, design systemu i organizacji UI, gdy review wymaga większej przebudowy.
- `writing-hooks` — szczegółowe wzorce jakości hooków, composables, stabilności API i testowania reużywalnej logiki.
- `ensuring-accessibility` — pełny audyt WCAG, ARIA, keyboard navigation, focus management i testy dostępności.
- `optimizing-frontend` — pomiary i naprawy wydajności: Web Vitals, bundle, profiler renderowania, memory leaks i delivery.
