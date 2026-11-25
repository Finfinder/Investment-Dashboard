# Bundle i Delivery Frontendu

Referencja dla redukcji dostarczanego kodu, chunkingu, strategii renderowania i zasobów third-party. Czytaj ją, gdy diagnoza wskazuje, że problemem jest initial load, rozmiar JS/CSS, zbyt ciężkie zależności albo opóźnione LCP przez delivery.

## Spis Treści

- [Budżety i Czerwone Flagi](#budżety-i-czerwone-flagi)
- [Proces Analizy Bundla](#proces-analizy-bundla)
- [Chunking i Code Splitting](#chunking-i-code-splitting)
- [SSR, SSG i Streaming](#ssr-ssg-i-streaming)
- [Barrel Files i Tree Shaking](#barrel-files-i-tree-shaking)
- [Third-Party Scripts](#third-party-scripts)
- [Lazy Loading](#lazy-loading)
- [Preload, Prefetch i Preconnect](#preload-prefetch-i-preconnect)
- [Checklista](#checklista)

## Budżety i Czerwone Flagi

| Sygnał | Dlaczego boli | Działanie |
| --- | --- | --- |
| Pojedynczy chunk > 200 KB gzip | Długi download, parse i compile JS. | Podziel trasę lub ciężką funkcję; usuń zbędne zależności. |
| Initial JS > 250 KB gzip | LCP i INP cierpią, szczególnie mobile. | Przenieś kod poniżej interakcji do lazy chunks. |
| Biblioteka do małego zadania > 50 KB | Koszt przewyższa wartość funkcji. | Zastąp natywnym API albo mniejszą zależnością. |
| Duplikaty zależności | Ten sam kod w kilku wersjach. | Ujednolić wersje, sprawdzić lock file i analyzer. |
| Pełny framework CSS bez purge | Użytkownik pobiera nieużywane style. | Włącz purge/content scanning lub importuj częściowo. |
| Polyfille dla wspieranych funkcji | Zbędny JS dla docelowych przeglądarek. | Ładuj warunkowo albo usuń zgodnie z browserslist. |
| Ponad 10 requestów third-party na start | Blokują network i main thread. | Ustal budżet, lazy-loaduj niekrytyczne widgety. |

## Proces Analizy Bundla

1. Uruchom production build i analizator właściwy dla bundlera/frameworka.
2. Zapisz rozmiary gzip/brotli dla initial chunks, route chunks, shared/vendor chunks i CSS.
3. Wskaż top zależności oraz moduły powtarzające się między chunkami.
4. Sprawdź import path: wildcard, barrel, ciężkie biblioteki dat, wykresy, edytory i mapy.
5. Wybierz jedną redukcję i porównaj analyzer przed/po.

Nie raportuj redukcji bez jednostki. Używaj `KB gzip`, `KB brotli`, liczby requestów i informacji, czy zmiana dotyczy initial load czy lazy chunku.

## Chunking i Code Splitting

- Dziel kod na poziomie tras, gdy użytkownik nie potrzebuje całej aplikacji przy pierwszym wejściu.
- Lazy-loaduj ciężkie komponenty uruchamiane interakcją: wykresy, mapy, edytory, preview PDF, modale z rozbudowaną treścią.
- Nie twórz mikroskopijnych chunków bez powodu; zbyt wiele requestów może pogorszyć delivery.
- Uważaj na shared/vendor chunk, który rośnie po dodaniu lazy importu, bo zależność nadal może trafić do initial bundle.
- Każda granica lazy loadingu wymaga fallbacku i smoke case'u interakcji.

## SSR, SSG i Streaming

| Strategia | Użyj gdy | Unikaj gdy |
| --- | --- | --- |
| SSG/prerender | Treść nie zmienia się per request albo może być rewalidowana. | Dane są silnie użytkownikowe i muszą być świeże przy każdym wejściu. |
| SSR | LCP cierpi przez client-side render, a serwer może dostarczyć gotowy HTML. | Strona jest wyłącznie lokalnym narzędziem po zalogowaniu bez SEO/LCP problemu. |
| Streaming SSR | Część UI może pojawić się wcześniej, a reszta zależy od wolnych danych. | Framework lub hosting nie wspiera stabilnie streamingu. |
| CSR | UI jest wysoko interaktywny i użytkownikowy, a initial SEO/LCP nie jest głównym celem. | Publiczne landing/content pages z wysokim kosztem JS. |

Decyzja o SSR/SSG nie zastępuje redukcji JS. Nawet szybki HTML może mieć słaby INP, jeśli hydracja dostarcza zbyt dużo kodu.

## Barrel Files i Tree Shaking

- Barrel files (`index.ts`) są wygodne, ale re-eksport `export *` z dużego folderu może wciągać nieużywany kod.
- Dla dużych bibliotek preferuj bezpośredni import z modułu źródłowego, jeśli dokumentacja biblioteki potwierdza lepszy tree shaking.
- Unikaj `import * as Lib from 'lib'`, gdy potrzebujesz jednej funkcji lub komponentu.
- Sprawdź `sideEffects` w paczce i własnych modułach. Side effects mogą blokować eliminację kodu.
- Po zmianie importów potwierdź efekt w analyzerze; nie zakładaj, że bundler zawsze usunie kod.

## Third-Party Scripts

- Krytyczne skrypty ładuj przez mechanizm frameworka albo `defer`, jeśli muszą działać po parsowaniu HTML.
- `async` jest dobre dla niezależnych skryptów, które mogą wykonać się poza kolejnością.
- Widgety chat, social embeds, video embeds i heatmapy lazy-loaduj po scrollu, zgodzie użytkownika albo interakcji.
- Dla krytycznych originów rozważ `preconnect`, ale ogranicz liczbę połączeń, bo każdy preconnect kosztuje zasoby.
- Ustal budżet third-party: liczba requestów, KB JS i wpływ na main thread.

## Lazy Loading

- Lazy-loaduj poniżej pierwszego ekranu, trasy rzadko odwiedzane i funkcje uruchamiane intencją użytkownika.
- Nie lazy-loaduj zasobów krytycznych dla LCP, jeśli opóźni to główną treść.
- Fallback powinien mieć stabilny rozmiar, aby nie pogarszać CLS.
- Po załadowaniu komponentu zachowaj fokus i informację o stanie dla technologii asystujących.
- Prefetch lazy chunku ma sens po sygnale intencji: hover, focus, widoczność linku albo idle po pierwszym renderze.

## Preload, Prefetch i Preconnect

| Relacja | Do czego służy | Używaj ostrożnie |
| --- | --- | --- |
| `preload` | Krytyczny zasób dla aktualnej strony: font, hero image, critical script. | Zbyt wiele preloadów konkuruje o bandwidth. |
| `prefetch` | Zasób prawdopodobnie potrzebny później. | Nie powinien blokować aktualnej strony. |
| `preconnect` | Szybsze DNS/TLS dla krytycznego originu. | Każde połączenie ma koszt; nie dodawaj hurtowo. |
| `dns-prefetch` | Tańsze przygotowanie DNS. | Pomaga mniej niż preconnect, ale jest lżejsze. |

Preloaduj tylko zasoby potwierdzone w waterfallu jako krytyczne dla LCP lub pierwszej interakcji.

## Checklista

```text
- [ ] Analyzer pokazuje top chunks, initial JS/CSS i największe zależności.
- [ ] Każdy chunk > 200 KB gzip ma plan: split, usunięcie zależności albo uzasadnienie.
- [ ] Ciężkie trasy i komponenty są lazy-loaded z fallbackiem.
- [ ] Barrel/wildcard imports nie blokują tree shakingu.
- [ ] Third-party scripts mają async/defer/loader i budżet requestów.
- [ ] SSR/SSG/streaming oceniono dla tras z problemem LCP.
- [ ] Preload/prefetch/preconnect wynikają z waterfallu, nie z domysłu.
```
