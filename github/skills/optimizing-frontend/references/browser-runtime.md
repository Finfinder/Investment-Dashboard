# Browser Runtime, Assety i Pamięć

Referencja dla optymalizacji kosztów po stronie przeglądarki: obrazy, fonty, CSS, layout, DOM, cleanup pamięci, główny wątek i Web Workers. Czytaj ją, gdy diagnoza wskazuje long tasks, layout thrashing, memory growth, CLS albo ciężkie assety.

## Spis Treści

- [Assety: Obrazy, Fonty i CSS](#assety-obrazy-fonty-i-css)
- [Layout Thrashing](#layout-thrashing)
- [DOM Depth i Koszt Layoutu](#dom-depth-i-koszt-layoutu)
- [Cleanup Pamięci](#cleanup-pamięci)
- [Offloading Głównego Wątku](#offloading-głównego-wątku)
- [Web Workers](#web-workers)
- [Chunking Pracy](#chunking-pracy)
- [Checklista](#checklista)

## Assety: Obrazy, Fonty i CSS

### Obrazy

- Używaj nowoczesnych formatów WebP/AVIF z fallbackiem, jeśli projekt tego wymaga.
- Każdy obraz wpływający na layout ma jawne `width`/`height` albo stabilny kontener z `aspect-ratio`.
- Obraz LCP nie powinien być lazy-loaded; obrazy poniżej pierwszego ekranu powinny być lazy-loaded.
- Dopasuj rozmiary responsive do realnego viewportu, aby nie pobierać obrazu kilka razy większego niż renderowany.
- Preloaduj tylko obraz krytyczny dla LCP potwierdzony w waterfallu.

### Fonty

- Używaj `font-display: swap` lub `optional`, aby uniknąć niewidocznego tekstu.
- Subsetuj fonty do używanych znaków i wag.
- Preloaduj tylko krytyczne fonty above-the-fold.
- Zadbaj o fallback o podobnych metrykach, aby ograniczyć CLS przy podmianie fontu.

### CSS i animacje

- Usuń nieużywane CSS i unikaj globalnych frameworków bez purge/content scanning.
- Animuj `transform` i `opacity`; unikaj animacji `top`, `left`, `width`, `height`, `margin` i `padding`.
- `will-change` stosuj krótko przed animacją, nie stale. Stałe użycie zwiększa zużycie pamięci.
- Preferuj `prefers-reduced-motion` dla kosztownych animacji i dostępności.

## Layout Thrashing

Layout thrashing powstaje, gdy kod przeplata odczyty layoutu i zapisy stylów, zmuszając przeglądarkę do wielokrotnego reflow.

Właściwości często wymuszające layout: `offsetHeight`, `offsetWidth`, `clientHeight`, `clientWidth`, `scrollTop`, `getBoundingClientRect()`.

```javascript
// Źle: read -> write w każdej iteracji
items.forEach((element) => {
  const height = element.offsetHeight;
  element.style.height = `${height + 8}px`;
});

// Dobrze: wszystkie odczyty, potem wszystkie zapisy
const heights = items.map((element) => element.offsetHeight);
items.forEach((element, index) => {
  element.style.height = `${heights[index] + 8}px`;
});
```

Diagnozuj w DevTools Performance: szukaj `Forced reflow`, długiego `Layout`, szarpanych animacji i spadku FPS.

## DOM Depth i Koszt Layoutu

- Usuwaj wrappery istniejące wyłącznie dla stylowania, jeśli CSS może obsłużyć układ bez dodatkowych elementów.
- Długie tabele, listy i drzewa renderuj przez wirtualizację, paginację albo rozwijanie na żądanie.
- Unikaj masowego montowania ukrytych paneli przez `display: none`, jeśli każdy panel ma ciężkie efekty.
- Stabilizuj wymiary elementów dynamicznych: skeletony, fallbacki lazy loadingu, obrazy, kafle, wiersze list.
- Głęboki DOM zwiększa koszty style recalculation, layout i paint nawet wtedy, gdy JavaScript jest szybki.

## Cleanup Pamięci

Każdy zasób utworzony w runtime musi mieć właściciela i moment zwolnienia.

| Zasób | Cleanup |
| --- | --- |
| `addEventListener` | `removeEventListener` tą samą referencją handlera. |
| `setTimeout` / `setInterval` | `clearTimeout` / `clearInterval`. |
| Fetch/request | `AbortController.abort()` przy odmontowaniu albo zmianie parametru. |
| WebSocket/EventSource | `close()` i odpięcie handlerów. |
| Observable/event bus/store subscription | Funkcja unsubscribe/dispose. |
| `IntersectionObserver` / `ResizeObserver` | `disconnect()` albo `unobserve()`. |
| Object URL | `URL.revokeObjectURL()`. |
| Web Worker | `worker.terminate()`, jeśli worker ma cykl życia komponentu. |

Memory leak często widać dopiero po nawigacji tam i z powrotem albo po długiej sesji. Porównuj heap snapshots i retainer paths w DevTools Memory.

## Offloading Głównego Wątku

JavaScript na głównym wątku blokuje input i paint. Każde zadanie > 50 ms traktuj jako sygnał do podziału pracy albo przeniesienia jej poza UI.

Typowe operacje do offloadingu:

- sort/filter/agregacje na 10k+ elementów,
- parsowanie JSON > 1 MB,
- kompresja, kryptografia, przetwarzanie obrazów,
- walidacja dużych formularzy z kosztownymi regułami,
- generowanie danych do wykresów lub tabel.

## Web Workers

Web Worker działa poza głównym wątkiem i komunikuje się przez wiadomości.

```javascript
const worker = new Worker(new URL('./worker.js', import.meta.url));

worker.postMessage({ items, filters });
worker.onmessage = (event) => {
  renderResult(event.data);
};

// cleanup, jeśli worker nie jest globalnym singletonem
worker.terminate();
```

Ograniczenia: Worker nie ma dostępu do DOM, `window` ani lifecycle frameworka. Dane są kopiowane lub transferowane, więc bardzo duże payloady też mają koszt. Dla dużych buforów rozważ Transferable Objects.

## Chunking Pracy

Gdy Worker jest za ciężki, podziel pracę na mniejsze partie i oddawaj kontrolę przeglądarce między partiami.

```javascript
async function processInChunks(items, chunkSize = 100) {
  for (let index = 0; index < items.length; index += chunkSize) {
    processChunk(items.slice(index, index + chunkSize));

    if ('scheduler' in window && 'yield' in scheduler) {
      await scheduler.yield();
    } else {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }
}
```

Chunking powinien pokazać stan ładowania lub progres, jeśli użytkownik czeka na wynik. Brak feedbacku przy długiej operacji to problem UX, nawet jeśli UI formalnie nie zamiera.

## Checklista

```text
- [ ] Obraz LCP ma właściwy rozmiar, priorytet i stabilne wymiary.
- [ ] Obrazy poniżej pierwszego ekranu są lazy-loaded.
- [ ] Fonty używają font-display i subsetów; preload jest ograniczony do krytycznych zasobów.
- [ ] Animacje używają transform/opacity i szanują prefers-reduced-motion.
- [ ] Nie ma pętli read-write wymuszających layout.
- [ ] DOM depth i liczba elementów są uzasadnione albo ograniczone wirtualizacją/paginacją.
- [ ] Listenery, timery, requesty, obserwatory, workery i object URLs mają cleanup.
- [ ] Long tasks > 50 ms są rozbite, przeniesione do Workera lub na serwer.
```
