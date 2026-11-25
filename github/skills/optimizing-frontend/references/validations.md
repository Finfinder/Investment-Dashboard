# Reguły Walidacji - Optymalizacja Frontendu

Reguły walidacji, workflow Lighthouse/Web Vitals, smoke cases i checklisty końcowe dla skilla `optimizing-frontend`. Używaj ich po baseline, przed zamknięciem optymalizacji albo przy review zmian dotykających wydajności UI.

## Spis Treści

- [Workflow Lighthouse i Web Vitals](#workflow-lighthouse-i-web-vitals)
- [Smoke Cases](#smoke-cases)
- [Podsumowanie reguł](#podsumowanie-reguł)
- [Rozmiar Bundla](#rozmiar-bundla)
- [Główny Wątek](#główny-wątek)
- [Wycieki Pamięci](#wycieki-pamięci)
- [Renderowanie React](#renderowanie-react)
- [Runtime Przeglądarki](#runtime-przeglądarki)
- [Końcowa Checklista Walidacyjna](#końcowa-checklista-walidacyjna)
- [Użycie](#użycie)

## Workflow Lighthouse i Web Vitals

1. **Ustal cel pomiaru:** URL/trasa, scenariusz użytkownika, typ builda, device/network, oczekiwane progi i czy mierzysz lab, staging czy production.
2. **Uruchom production-like build:** preferuj `build` + `preview`/`start`, nie dev server, jeśli metryki mają reprezentować realny bundle.
3. **Zbierz baseline:** Lighthouse dla LCP/CLS/performance score, DevTools Performance dla long tasks i flamechartu, Web Vitals/RUM dla INP, jeśli projekt ma te dane.
4. **Zapisz warunki:** viewport, throttling, browser, CPU/network, cache warm/cold, wersja aplikacji i dokładna akcja użytkownika.
5. **Zidentyfikuj bottleneck:** największy koszt przypisz do delivery, renderowania, runtime, assetów, third-party albo backendu wpływającego na frontend.
6. **Wprowadź jedną optymalizację:** unikaj mieszania wielu zmian, bo utrudnia to przypisanie efektu.
7. **Powtórz pomiar:** ten sam URL, warunki i scenariusz. Porównaj liczby, nie tylko subiektywne odczucie.
8. **Zapisz wynik:** baseline -> po zmianie, metryki, ryzyka, smoke cases i pozostałe czerwone flagi.

Domyślne progi: Lighthouse performance >= 90, LCP <= 2.5 s, INP <= 200 ms, CLS <= 0.1, brak long tasks > 50 ms na krytycznej interakcji, brak pojedynczego chunku > 200 KB gzip bez uzasadnienia.

Przykład CLI, gdy projekt dopuszcza użycie Lighthouse lokalnie:

```powershell
npx lighthouse <URL> --output=json --output-path=./lighthouse-report.json --chrome-flags="--headless"
```

Lighthouse w lab może raportować TBT zamiast realnego INP. Dla INP preferuj dane `web-vitals`, CrUX/RUM albo ręczną walidację interakcji w DevTools Performance.

## Smoke Cases

| Case | Cel | Co sprawdzić |
| --- | --- | --- |
| Pierwsze wejście na krytyczną trasę | LCP, CLS, initial JS | Hero/treść above-the-fold, skeletony, brak skoków layoutu. |
| Najważniejsza interakcja | INP/long tasks | Kliknięcie, input, submit, filtr, sort; reakcja UI bez zamrożenia. |
| Ciężki komponent lazy-loaded | UX delivery | Modal, wykres, edytor lub mapa ładuje się na żądanie z fallbackiem. |
| Długa lista | Render i DOM | Scroll, filtrowanie, reorder/delete, stabilne klucze, wirtualizacja bez utraty fokusu. |
| Nawigacja tam i z powrotem | Pamięć i cleanup | Brak rosnących listenerów, timerów, requestów, WebSocketów i obserwatorów. |
| Klawiatura i czytnik ekranu | A11y po optymalizacji | Fokus, aria-live dla ładowania, zachowana kolejność DOM i etykiety. |

## Podsumowanie reguł

| ID | Nazwa | Severity | Kategoria |
| --- | --- | --- | --- |
| V-01 | Ciężki import biblioteki | WARNING | Rozmiar bundla |
| V-02 | Brak lazy loadingu ciężkiego komponentu | INFO | Rozmiar bundla |
| V-03 | Blokujące synchroniczne API | WARNING | Główny wątek |
| V-04 | Potencjalnie ciężka operacja synchroniczna | INFO | Główny wątek |
| V-05 | Event listener bez cleanup | WARNING | Wycieki pamięci |
| V-06 | setInterval bez cleanup | WARNING | Wycieki pamięci |
| V-07 | Inline obiekt/tablica w JSX props | INFO | Renderowanie React |
| V-08 | Anonimowy callback w JSX props | INFO | Renderowanie React |
| V-09 | Wymuszony layout w pętli | WARNING | Runtime przeglądarki |
| V-10 | Skrypt third-party blokujący parser | WARNING | Delivery |

---

## Rozmiar Bundla

### V-01: Ciężki import biblioteki

**Severity:** WARNING
**Dotyczy:** `*.js`, `*.ts`, `*.jsx`, `*.tsx`

**Opis:** Import pełnej biblioteki `moment` lub całego `lodash` może znacząco zwiększyć bundle. Lżejsze alternatywy lub selektywne importy zwykle dają tę samą funkcjonalność mniejszym kosztem.

**Regex detekcji:**

```regex
from ['"]moment['"]|from ['"]lodash['"]$|import _ from ['"]lodash['"]|require\(['"]moment['"]\)
```

**Akcja naprawcza:** Zamień `moment` na `date-fns`/`dayjs` albo pełny `lodash` na selektywne importy, np. `lodash/debounce`, jeśli projekt nie ma lepszego lokalnego wzorca.

---

### V-02: Brak lazy loadingu ciężkiego komponentu

**Severity:** INFO
**Dotyczy:** `*.jsx`, `*.tsx`

**Opis:** Bezpośredni import wykresów, edytorów, map i bogatych modali ładuje je w głównym bundlu. Lazy loading pozwala pobrać je dopiero po potrzebie użytkownika.

**Regex detekcji:**

```regex
import.*from ['"]\.\/.*Chart['"]|import.*from ['"]\.\/.*Editor['"]|import.*from ['"]\.\/.*Modal['"]|import.*from ['"]@monaco-editor
```

**Akcja naprawcza:** Użyj mechanizmu dynamic import frameworka i dodaj fallback ładowania dostępny dla użytkownika.

---

## Główny Wątek

### V-03: Blokujące synchroniczne API

**Severity:** WARNING
**Dotyczy:** `*.js`, `*.ts`

**Opis:** Synchroniczne API blokują event loop. W przeglądarce powtarzane synchroniczne odczyty storage lub duże operacje CPU zwiększają INP i long tasks.

**Regex detekcji:**

```regex
readFileSync|writeFileSync|execSync|localStorage\.getItem.*localStorage\.getItem
```

**Akcja naprawcza:** Użyj API asynchronicznych, przenieś pracę do Web Workera albo rozbij zadanie na mniejsze porcje.

---

### V-04: Potencjalnie ciężka operacja synchroniczna

**Severity:** INFO
**Dotyczy:** `*.js`, `*.ts`, `*.jsx`, `*.tsx`

**Opis:** Łańcuchy operacji tablicowych i głębokie klonowanie przez JSON mogą być kosztowne na dużych zbiorach danych.

**Regex detekcji:**

```regex
\.sort\(.*\)\.filter\(|\.filter\(.*\)\.map\(.*\)\.reduce\(|JSON\.parse\(.*JSON\.stringify
```

**Akcja naprawcza:** Zmierz rozmiar danych. Dla dużych zbiorów rozważ jedno przejście, memoizację wyniku, paginację, Web Worker albo obliczenie po stronie serwera.

---

## Wycieki Pamięci

### V-05: Event listener bez cleanup

**Severity:** WARNING
**Dotyczy:** `*.jsx`, `*.tsx`

**Opis:** `addEventListener` w efekcie bez odpowiadającego `removeEventListener` kumuluje listenery na długożyjących stronach SPA.

**Regex detekcji:**

```regex
addEventListener(?![\s\S]*removeEventListener)
```

**Akcja naprawcza:** Zwróć cleanup z efektu i usuń listener tą samą referencją funkcji. Trafienia traktuj jako kandydatów do ręcznej weryfikacji.

---

### V-06: setInterval bez cleanup

**Severity:** WARNING
**Dotyczy:** `*.js`, `*.ts`, `*.jsx`, `*.tsx`

**Opis:** Interwał bez `clearInterval` działa po zniknięciu komponentu i powoduje memory leak oraz niepotrzebne odświeżenia.

**Regex detekcji:**

```regex
setInterval\([^;]*\);(?!.*clearInterval)
```

**Akcja naprawcza:** Przechowuj ID interwału i czyść go w cleanupie komponentu lub lifecycle hooku frameworka.

---

## Renderowanie React

### V-07: Inline obiekt/tablica w JSX props

**Severity:** INFO
**Dotyczy:** `*.jsx`, `*.tsx`

**Opis:** Inline obiekty i tablice tworzą nową referencję przy każdym renderze, co psuje memoizację komponentów potomnych.

**Regex detekcji:**

```regex
style=\{\{|className=\{\[.*\]\.join
```

**Akcja naprawcza:** Przenieś statyczną wartość poza komponent albo użyj memoizacji tylko wtedy, gdy pomiar pokazuje koszt re-renderu.

---

### V-08: Anonimowy callback w JSX props

**Severity:** INFO
**Dotyczy:** `*.jsx`, `*.tsx`

**Opis:** Funkcje strzałkowe w atrybutach zdarzeń tworzą nową referencję. Problem ma znaczenie, gdy trafiają do memoizowanych dzieci lub dużych list.

**Regex detekcji:**

```regex
onClick=\{?\(\)\s*=>|onChange=\{\(e\)\s*=>|onSubmit=\{\(\)\s*=>
```

**Akcja naprawcza:** Użyj stabilnego callbacka tylko wtedy, gdy referencja jest realnym powodem re-renderu.

---

## Runtime Przeglądarki

### V-09: Wymuszony layout w pętli

**Severity:** WARNING
**Dotyczy:** `*.js`, `*.ts`, `*.jsx`, `*.tsx`

**Opis:** Odczyt layoutu i zapis stylu w pętli powodują forced reflow i szarpane animacje.

**Regex detekcji:**

```regex
(offsetHeight|offsetWidth|getBoundingClientRect|clientHeight|clientWidth)[\s\S]{0,120}(style\.|classList\.)
```

**Akcja naprawcza:** Zbatchuj wszystkie odczyty przed zapisami i preferuj animacje przez `transform`/`opacity`.

---

### V-10: Skrypt third-party blokujący parser

**Severity:** WARNING
**Dotyczy:** `*.html`, `*.tsx`, `*.jsx`

**Opis:** Zewnętrzny `<script>` bez `async`, `defer` albo kontrolowanego loadera może blokować parsowanie HTML i opóźniać LCP/INP.

**Regex detekcji:**

```regex
<script(?![^>]*(async|defer|type=["']module["']))[^>]+src=["']https?://
```

**Akcja naprawcza:** Dodaj `async`/`defer`, użyj loadera frameworka, lazy-loaduj niekrytyczne widgety i rozważ `preconnect` dla krytycznych originów.

## Końcowa Checklista Walidacyjna

```text
- [ ] Baseline i pomiar po zmianie wykonano w tych samych warunkach.
- [ ] Porównano LCP, INP lub najbliższy dostępny proxy, CLS, long tasks i rozmiary chunków.
- [ ] Każdy chunk > 200 KB gzip ma uzasadnienie albo plan redukcji.
- [ ] Lighthouse/Web Vitals nie pogorszyły się na krytycznej trasie.
- [ ] Smoke cases z tej referencji przeszły dla dotkniętego flow.
- [ ] Lazy loading ma fallback i nie psuje fokusu ani odczytu screen readera.
- [ ] Efekty mają cleanup, a memory profiler nie pokazuje oczywistego wzrostu po nawigacji.
- [ ] Reguły V-01-V-10 sprawdzono ręcznie lub przez grep_search na zmienionych plikach.
- [ ] Wynik raportuje liczby przed/po i ewentualne ryzyka pozostawione do obserwacji.
```

## Użycie

- **Code review frontendowy:** przeskanuj reguły V-01-V-10 na zmienionych plikach i potwierdź kontekst ręcznie.
- **Regresja wydajności:** zacznij od workflow Lighthouse/Web Vitals i dopiero potem wybierz reguły powiązane z bottleneckiem.
- **Nowy ciężki komponent:** sprawdź V-02, smoke case lazy loadingu i sekcję bundle/delivery.
- **Audyt przed deployem:** wykonaj końcową checklistę, nawet jeśli optymalizacja dotyczyła tylko jednego komponentu.
