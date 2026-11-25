# Dostępność i Wydajność w Review

Szybkie kontrole dostępności i wydajności dla przeglądu frontendu. To nie jest pełny audyt WCAG ani pełna optymalizacja wydajności; gdy problem wymaga pogłębienia, eskaluj do `ensuring-accessibility` albo `optimizing-frontend`.

## Spis Treści

- [Zakres Szybkiego Review](#zakres-szybkiego-review)
- [Szybka Dostępność](#szybka-dostępność)
- [Szybka Wydajność](#szybka-wydajność)
- [Kiedy Eskalować](#kiedy-eskalować)
- [Checklista](#checklista)

## Zakres Szybkiego Review

Celem tej referencji jest wychwycenie regresji widocznych w diffie: semantyka interakcji, etykiety formularzy, fokus, ARIA, oczywisty wzrost bundla, brak lazy loadingu i niepotrzebne re-rendery. Nie zastępuje ona testów E2E, axe, Lighthouse, profilu renderowania ani manualnego audytu klawiaturą.

W review zgłaszaj problem tylko wtedy, gdy potrafisz wskazać konkretne zachowanie użytkownika albo ryzyko techniczne. Drobny styl CSS bez wpływu na UX nie powinien konkurować z poprawnością, dostępnością i wyciekami pamięci.

## Szybka Dostępność

### Elementy interaktywne

- Akcje używają `<button>`, linki nawigacyjne używają `<a href>`.
- `div`/`span` z `onClick` bez roli, `tabIndex`, obsługi klawiatury i focus styles to `critical`; preferuj zmianę na natywny element.
- Przyciski ikonowe mają dostępne nazwy (`aria-label`, ukryty tekst albo widoczny label).
- `disabled` nie powinien ukrywać wyjaśnienia, jeśli użytkownik musi wiedzieć, co zrobić dalej.

### Formularze i etykiety

- Pola formularzy mają widoczne etykiety powiązane przez `for`/`id` albo lokalny wzorzec komponentu formularza.
- Placeholder jako jedyna etykieta to co najmniej `warning`, bo znika po wpisaniu wartości.
- Komunikaty błędów istnieją jako tekst i są powiązane z polem, jeśli framework/projekt ma taki wzorzec.
- Stan błędu nie może opierać się wyłącznie na czerwonej ramce.

### Nagłówki i struktura

- Strona/widok ma logiczną hierarchię nagłówków.
- Nie pomijaj poziomów nagłówków bez powodu, np. `h1` -> `h3`.
- Komponenty wielokrotnego użytku nie powinny wymuszać konkretnego poziomu nagłówka, jeśli kontekst strony może się różnić; rozważ prop/slot dla heading level.

### Klawiatura i fokus

- Niestandardowe widgety są osiągalne klawiaturą i obsługują oczekiwane klawisze.
- Modal/dialog przenosi fokus do środka po otwarciu i oddaje go elementowi wyzwalającemu po zamknięciu.
- Fokus nie ginie po filtrze, lazy load, reorder listy ani zamknięciu panelu.
- `tabIndex > 0` prawie zawsze jest błędem, bo zaburza naturalny porządek tabowania.

### ARIA

- Najpierw semantyczny HTML, potem ARIA.
- `aria-hidden="true"` nie może obejmować elementu interaktywnego ani aktualnie sfokusowanego.
- `role="button"` na nienatywnym elemencie wymaga `tabIndex="0"`, obsługi `Enter`/`Space` i focus styles; zwykle lepiej użyć `<button>`.
- `aria-live` rozważ dla asynchronicznych statusów, które użytkownik czytnika ekranu powinien usłyszeć.

## Szybka Wydajność

### Bundle i importy

- Oflaguj nowe ciężkie biblioteki: wykresy, mapy, rich text, daty, PDF, syntax highlighting, edytory.
- Unikaj pełnych importów bibliotek, gdy projekt używa selektywnych importów.
- Barrel files (`index.ts`) z `export *` mogą wciągać nieużywany kod; sprawdź lokalny bundler i wzorzec repo.
- Nowe trasy i ciężkie komponenty poza first viewport są kandydatami do lazy loadingu.

### Lazy loading i fallbacki

- Lazy-loaded modal, drawer, wykres lub edytor ma fallback o stabilnym rozmiarze i sensowny stan ładowania.
- Nie lazy-loaduj elementu krytycznego dla LCP, jeśli opóźni główną treść.
- Po lazy loadzie zachowaj fokus, szczególnie gdy komponent otwiera się po kliknięciu przycisku.

### Renderowanie

- Provider contextu nie powinien przekazywać `value={{ ... }}` tworzonego w każdym renderze bez uzasadnienia.
- Duże listy 100+ elementów wymagają pytania o wirtualizację, paginację albo server-side filtering.
- Obiekty, tablice i callbacki inline mają znaczenie, jeśli trafiają do memoizowanych dzieci, dużych list lub zależności efektów.
- Derived state kopiowany efektem zwykle powoduje dodatkowy render i ryzyko stale data.

### Główny wątek i pamięć

- Duże synchroniczne sort/filter/parse w handlerze może pogorszyć INP; dla głębokiej diagnozy użyj `optimizing-frontend`.
- Timery, listenery, subskrypcje, WebSockety, obserwatory i requesty wymagają cleanupu.
- Brak cleanupu jest problemem poprawności i pamięci, nie kosmetyką wydajnościową.

## Kiedy Eskalować

| Sytuacja | Skill prowadzący | Co przekazać |
| --- | --- | --- |
| Potrzebny pełny audyt WCAG, axe, focus trap, aria patterns lub test klawiatury | `ensuring-accessibility` | Widoki, komponenty, interakcje, znane naruszenia i wymagany poziom zgodności. |
| Potrzebny pomiar Web Vitals, Lighthouse, bundle analyzer lub profiler renderowania | `optimizing-frontend` | Objaw, trasa, metryki, diff importów, podejrzane komponenty. |
| Problem dotyczy API hooka, stabilności callbacków albo testowania custom hooków | `writing-hooks` | Hook/composable, konsumenci, zależności, cleanup, oczekiwany kontrakt. |
| Problem wymaga przebudowy komponentów, kompozycji lub systemu design patterns | `implementing-frontend` | Komponenty, wzorce repo, ograniczenia design systemu, oczekiwane zachowanie. |

## Checklista

```text
- [ ] Interakcje używają natywnych elementów albo kompletnej semantyki klawiatury.
- [ ] Formularze mają widoczne etykiety i tekstowe komunikaty błędów.
- [ ] Nagłówki, regiony i struktura strony są logiczne.
- [ ] Modal/dialog zarządza fokusem przy otwarciu i zamknięciu.
- [ ] Stan nie jest komunikowany wyłącznie kolorem.
- [ ] ARIA nie ukrywa interaktywnych lub sfokusowanych elementów.
- [ ] Nowe ciężkie importy, trasy i komponenty są ocenione pod lazy loading.
- [ ] Duże listy, provider values i inline referencje nie tworzą oczywistych re-renderów.
- [ ] Efekty runtime mają cleanup i nie zostawiają rosnących zasobów.
- [ ] Głębszy audyt został przekazany do właściwego skilla.
```
