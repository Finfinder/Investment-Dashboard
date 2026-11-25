---
name: optimizing-frontend
description: Optymalizacja wydajności frontendu — renderowanie, memoizacja, code splitting, lazy loading, redukcja bundla, debugowanie regresji wydajności.
---

# Optymalizacja Frontendu

Prowadzi optymalizację frontendu przez pomiar, diagnozę wąskiego gardła i najmniejszą zmianę, która daje mierzalną poprawę. Aktywny tier zawiera proces i progi decyzyjne; szczegółowe checklisty, tabele i wzorce frameworkowe są w `references/`.

## Kiedy używać

- Debugowanie regresji wydajności UI, Core Web Vitals, wolnych interakcji albo zamrożeń głównego wątku.
- Redukcja rozmiaru bundla, code splitting, lazy loading, SSR/SSG/streaming albo optymalizacja delivery.
- Optymalizacja renderowania komponentów, memoizacji, lokalności stanu, kluczy list i wirtualizacji.
- Optymalizacja obrazów, fontów, CSS, głębokości DOM, layout thrashingu i cleanupu pamięci.
- Przegląd PR pod kątem regresji wydajności bez utraty poprawności, dostępności i UX.

<principles>

<measure-first>
Najpierw mierz. Nie dodawaj memoizacji, lazy loadingu ani przepisywania struktury bez baseline'u i jasnego objawu: metryki Web Vitals, profil renderowania, analiza bundla, flamechart lub reprodukowalny smoke case.
</measure-first>

<optimize-the-bottleneck>
Optymalizuj wąskie gardło, nie kategorię problemu. Jeśli bottleneckiem jest główny wątek, redukcja obrazów nie pomoże; jeśli bottleneckiem jest 600 KB JavaScriptu, mikrooptymalizacja renderu będzie szumem.
</optimize-the-bottleneck>

<preserve-correctness-a11y-ux>
Wydajność nie może psuć poprawności, dostępności ani UX. Lazy loading wymaga stanów ładowania, wirtualizacja nie może łamać klawiatury i czytników ekranu, a cache/memoizacja nie mogą pokazywać stale data.
</preserve-correctness-a11y-ux>

</principles>

## Progi Decyzyjne

- Core Web Vitals: LCP <= 2.5 s, INP <= 200 ms, CLS <= 0.1. Wynik poza progiem wymaga diagnozy źródła, nie losowego tuningu.
- Long task > 50 ms blokuje główny wątek. Rozważ Web Worker, chunking pracy, `scheduler.yield()`/fallback albo przeniesienie obliczeń na serwer.
- Pojedynczy chunk > 200 KB gzip to czerwona flaga. Sprawdź code splitting, lazy loading ciężkich komponentów, third-party scripts, duplikaty zależności i barrel files.
- Memoizacja tylko po pomiarze: kosztowne obliczenie, częsty re-render z tymi samymi danymi albo stabilna referencja wymagana przez memoizowane dziecko.
- Każdy efekt ma cleanup: listenery, timery, subskrypcje, WebSocket, obserwatory, requesty przez `AbortController` i zasoby tworzone w runtime.
- DOM i layout: batchuj odczyty przed zapisami, unikaj forced reflow, animuj `transform`/`opacity`, ogranicz głębokość DOM i zbędne wrappery.

## Proces Optymalizacji

```text
Postęp:
- [ ] Krok 1: Kontekst
- [ ] Krok 2: Baseline
- [ ] Krok 3: Diagnoza
- [ ] Krok 4: Plan
- [ ] Krok 5: Implementacja
- [ ] Krok 6: Walidacja
- [ ] Krok 7: Raport
```

**Krok 1: Kontekst**

- Ustal stack, framework, bundler, typ aplikacji, krytyczne trasy, docelowe urządzenia/sieć i zgłoszony objaw.
- Odkryj lokalne komendy build/test/lint oraz istniejące wzorce importów, lazy loadingu, renderowania i assetów.
- Wybierz referencje do załadowania z sekcji `Materiały Referencyjne` tylko dla dotkniętego obszaru.

**Krok 2: Baseline**

- Zmierz stan przed zmianą: bundle analyzer, DevTools Performance, Lighthouse/Web Vitals, React/Blazor profiler albo własne `performance.mark()`.
- Zapisz liczby i warunki pomiaru: URL/trasa, build dev vs production, device/network, akcja użytkownika, rozmiary chunków i metryki Web Vitals.
- Bez baseline'u ogranicz się do discovery i poproś o dane albo uruchom lokalną walidację, jeśli repo ją umożliwia.

**Krok 3: Diagnoza**

- Przypisz problem do jednej dominującej kategorii: delivery/bundle, renderowanie, runtime przeglądarki, assety/DOM, pamięć, third-party albo backend wpływający na frontend.
- Wskaż dowód: konkretny chunk, long task, commit renderu, forced reflow, memory growth, request blocking lub metrykę Web Vitals.
- Jeśli dowód jest niejednoznaczny, pogłęb pomiar zamiast implementować kilka optymalizacji naraz.

**Krok 4: Plan**

- Zaplanuj najmniejszą zmianę, która usuwa wykryte wąskie gardło, oraz metrykę sukcesu przed edycją.
- Oceń ryzyko correctness/a11y/UX: stany ładowania, fokus, kolejność DOM, stale data, cleanup, zachowanie list i nawigacji.
- Przy bundle/runtime/renderowaniu załaduj odpowiednią referencję szczegółową przed implementacją.

**Krok 5: Implementacja**

- Zachowaj lokalny styl projektu i API frameworka. Preferuj usunięcie zbędnej pracy lub kodu przed dodaniem cache.
- Stosuj code splitting, SSR/SSG, memoizację, wirtualizację, optymalizację assetów albo offloading tylko wtedy, gdy odpowiadają diagnozie.
- Dodaj cleanup efektów i nie zostawiaj optymalizacji bez testu albo smoke case'u dla zachowania użytkownika.

**Krok 6: Walidacja**

- Powtórz ten sam pomiar co w baseline i porównaj liczby przed/po.
- Uruchom właściwe testy repo, lint/build oraz smoke cases dla trasy i interakcji dotkniętej zmianą.
- Jeśli wynik nie poprawił metryki albo pogorszył UX/a11y, cofnij kierunek i wróć do diagnozy.

**Krok 7: Raport**

- Podaj zmierzoną zmianę liczbową, np. chunk 280 KB -> 145 KB gzip, LCP 3.2 s -> 2.1 s, long task 180 ms -> 42 ms.
- Wymień zmienione pliki, wykonane walidacje, pozostałe ryzyka i obszary wymagające dalszych pomiarów.
- Nie deklaruj poprawy, której nie da się poprzeć pomiarem albo reprodukowalnym smoke case'em.

## Materiały Referencyjne

Ładuj referencje warunkowo, gdy zadanie dotyczy danego obszaru:

- `./references/validations.md` — workflow Lighthouse/Web Vitals, końcowa checklista walidacyjna, smoke cases i reguły skanowalne regex.
- `./references/bundle-and-delivery.md` — bundle red flags, chunking, SSR/SSG/streaming, barrel files, third-party scripts, lazy loading, preload/prefetch.
- `./references/rendering-and-memoization.md` — reguły renderowania, memoizacji, local state, keys, virtualization, derived state i antywzorce renderowania.
- `./references/browser-runtime.md` — obrazy, fonty, CSS, layout thrashing, DOM depth, cleanup pamięci, main thread, web workers i chunking pracy.
- `./references/react-patterns.md` — React: `React.memo`, `useMemo`, `useCallback`, `lazy`, `Suspense`, `useRef`, profiler i cleanup efektów.
- `./references/blazor-patterns.md` — Blazor Server/WebAssembly: `ShouldRender()`, `@key`, `EventCallback`, `StateHasChanged()`, `<Virtualize>`, lazy assemblies i cleanup `IDisposable`/`IAsyncDisposable`.
- `./references/sharp-edges.md` — produkcyjne pułapki i dłuższe antywzorce: zła diagnoza, long tasks, nadmierna memoizacja, layout thrashing, cache invalidation, bundle explosion i memory leaks.

## Antywzorce

| Antywzorzec | Zamiast tego |
| --- | --- |
| Optymalizacja bez baseline'u | Zmierz, nazwij bottleneck i ustaw metrykę sukcesu. |
| Memoizowanie wszystkiego | Memoizuj tylko po dowodzie, że koszt renderu/obliczeń jest istotny. |
| Lazy loading bez stanu ładowania | Dodaj fallback, focus behavior i smoke case interakcji. |
| Indeks tablicy jako klucz listy | Użyj stabilnego ID i sprawdź zachowanie przy reorder/delete. |
| Efekt bez cleanupu | Usuń listenery, timery, subskrypcje i anuluj requesty. |
| Animowanie właściwości layoutu | Preferuj `transform`/`opacity` i unikaj read-write layout loop. |

## Checklista Końcowa

```text
- [ ] Istnieje baseline i pomiar po zmianie w tych samych warunkach.
- [ ] Największy bottleneck jest nazwany i powiązany z konkretną zmianą.
- [ ] Chunks > 200 KB gzip, long tasks > 50 ms i Web Vitals poza progiem są wyjaśnione albo poprawione.
- [ ] Memoizacja/cache mają uzasadnienie pomiarem i nie tworzą stale data.
- [ ] Efekty runtime mają cleanup, a DOM nie wymusza layout thrashingu.
- [ ] Lazy loading, wirtualizacja i assety zachowują UX, fokus i dostępność.
- [ ] Uruchomiono właściwe testy/lint/build albo jasno opisano, czego nie dało się uruchomić.
```

## Powiązane Skille

- `implementing-frontend` — wzorce komponentów i struktura UI, gdy problem wymaga zmiany architektury komponentów.
- `writing-hooks` — custom hooki, zależności efektów, memoizacja i cleanup w React.
- `reviewing-frontend` — punktowy review PR pod kątem regresji wydajności i UX.
- `ensuring-accessibility` — walidacja, że optymalizacje nie psują klawiatury, focus management i czytników ekranu.
