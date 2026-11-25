---
name: performance-and-memory-js
description: "Optymalizacja wydajności i pamięci JS/TS — profilowanie CPU/heap, diagnostyka memory leaks, hot paths, DOM layout costs, debounce/throttle, Web Workers. Mierz ? zmień ? zmierz."
---

# Wydajność I Pamięć JS/TS

Prowadzi mierzoną optymalizację JavaScript i TypeScript po stronie frontendu oraz backendu. Najpierw mierz i nazwij bottleneck, potem zmieniaj kod; optymalizacja bez profilu łatwo pogarsza czytelność bez realnego zysku.

## Kiedy używać

- Diagnozujesz długi request, wysoki CPU, memory leak, rosnące zużycie heap albo blokujący runtime hot path.
- Optymalizujesz językowy hot path w frontendzie, backendzie Node, workerze, parserze albo transformacji danych.
- Pracujesz z dużymi tablicami, mapami, cache, event listenerami, timerami, DOM albo streamami danych.
- Rozważasz debounce, throttle, batching, Web Worker albo `worker_threads` dla kosztu runtime.
- Recenzujesz zmianę pod kątem kosztu pamięci, object churn albo niepotrzebnej pracy.

## Kiedy nie używać

- Problem dotyczy wyłącznie lintingu, importów albo stylu; użyj `ts-styling-and-linting`.
- Problem dotyczy architektury backendu Node, shutdown albo health checks; użyj `node-backend-guidelines`.
- Problem dotyczy Web Vitals, bundle-size, code splitting, renderowania komponentów albo ogólnego UI-performance; użyj `optimizing-frontend`.
- Problem dotyczy projektowania komponentów frontendowych bez mierzonego bottlenecku runtime; użyj `implementing-frontend`.
- Problem dotyczy typów i kontraktów; użyj `typescript-best-practices`.

## Zasada nadrzędna

Nie optymalizuj w ciemno. Każda większa zmiana performance powinna mieć obserwację bazową, hipotezę, zmianę i pomiar po zmianie. Zachowaj prosty kod, dopóki profil nie pokazuje, że prostota jest za droga.

## Zasady Wysokiego Priorytetu

- Znajdź hot path: CPU profile, flamegraph, heap snapshot, event loop delay, server latency albo benchmark lokalny.
- Usuń niepotrzebną pracę przed mikrooptymalizacją: powtórne parsowanie, podwójne mapowanie, zbędne transformacje, niekontrolowane retry.
- Ogranicz object churn w pętlach i częstych ścieżkach wykonania, ale nie kosztem nieczytelnych mutacji w kodzie nietrafiającym do hot path.
- Sprzątaj listeners, timers, observers, subscriptions, intervals, WebSockety i AbortControllers.
- Cache musi mieć lifecycle: limit rozmiaru, TTL, invalidation albo owner cleanup. Nieograniczony cache jest opóźnionym leak.
- Duże kolekcje przetwarzaj strumieniowo, stronami albo batchami, jeśli pełne załadowanie nie jest wymagane.
- W DOM grupuj odczyty i zapisy layoutu, aby uniknąć layout thrashing.
- Debounce i throttle dobieraj do intencji UX, nie jako losowe opóźnienie.
- Pracę CPU przenieś do Web Worker/worker_threads tylko wtedy, gdy koszt komunikacji i serializacji jest mniejszy niż blokowanie głównego wątku/event loop.

## Profilowanie

Dobierz narzędzie do pytania:

- Frontend runtime CPU: Performance panel, User Timing marks, profile funkcji i handlerów.
- Frontend pamięć: heap snapshots, allocation timeline, detached DOM nodes.
- Backend Node CPU: inspector profile, clinic/flamegraph, event loop delay metrics.
- Backend pamięć: heap snapshot, RSS/heapUsed, allocation sampling, leak reproduction loop.
- I/O: latency histogram, timeout count, queue depth, stream backpressure, DB timings.
- Runtime load: cold start time, module load profile, koszt inicjalizacji zależności.

Minimalny pomiar w kodzie:

```typescript
const start = performance.now();
const result = transform(input);
const durationMs = performance.now() - start;
logger.debug({ durationMs, itemCount: input.length }, 'Transform completed');
```

Nie zostawiaj hałaśliwych pomiarów debug w hot path bez kontroli poziomu logowania.

## Memory Leaks

Typowe źródła leaków:

- listener dodany bez `removeEventListener` albo `off`,
- `setInterval` bez `clearInterval`,
- closure trzymająca duży obiekt po zakończeniu requestu/renderu,
- cache bez limitu,
- globalna mapa per user/request/session,
- niezamknięty stream, socket, DB cursor albo observer,
- detached DOM node z aktywnym listenerem,
- testy tworzące serwery/timery bez cleanupu.

Wzorzec owner cleanup:

```typescript
function subscribe(signal: AbortSignal, onMessage: (value: string) => void) {
  source.addEventListener('message', onMessage);

  signal.addEventListener('abort', () => {
    source.removeEventListener('message', onMessage);
  }, { once: true });
}
```

## Kolekcje I Object Churn

Dla dużych arrays/maps:

- Unikaj wielokrotnego `map().filter().reduce()` w krytycznej pętli, jeśli jedna pętla jest czytelna i znacząco tańsza.
- Używaj `Map`/`Set` dla lookupów, zamiast `Array.prototype.find` w pętli po dużej kolekcji.
- Prealokacja lub mutacja lokalna może być dobra w hot path, ale ukryta mutacja publicznych inputów jest ryzykowna.
- Sortowanie jest kosztowne i mutuje tablicę. Kopiuj przed sortowaniem, jeśli input jest współdzielony.
- Uważaj na `JSON.stringify` dużych obiektów w logach i cache keys.

```typescript
const usersById = new Map(users.map(user => [user.id, user]));

for (const order of orders) {
  const user = usersById.get(order.userId);
  if (user) {
    attachUser(order, user);
  }
}
```

## DOM Layout Costs

Niskopoziomowe koszty DOM:

- odczyt layoutu po każdym zapisie stylu,
- handler scroll/resize bez throttle/debounce lub `requestAnimationFrame`,
- synchronous measurement w gorącej ścieżce,
- detached DOM nodes trzymane przez listenery albo closure,
- duże batchowe mutacje DOM bez rozdzielenia odczytów i zapisów.

Layout thrashing:

```typescript
// Źle: mieszanie odczytu i zapisu w pętli.
for (const item of items) {
  item.style.width = `${container.offsetWidth}px`;
}

// Lepiej: odczyt raz, zapis batchowo.
const width = container.offsetWidth;
for (const item of items) {
  item.style.width = `${width}px`;
}
```

Ogólną optymalizację renderowania komponentów, Web Vitals i decyzje o virtualization prowadź przez `optimizing-frontend`.

## Debounce, Throttle I Batching

- Debounce: gdy liczy się ostatnia wartość po ciszy, np. search input.
- Throttle: gdy chcesz ograniczyć częstotliwość ciągłego strumienia, np. scroll/resize.
- `requestAnimationFrame`: gdy aktualizacja dotyczy renderowania i ma zsynchronizować się z klatką.
- Async batching: gdy wiele małych operacji I/O można połączyć w jedną partię.

Nie używaj debounce do ukrywania wolnego endpointu bez naprawy źródła problemu. Nie używaj throttle tak agresywnie, że UI traci przewidywalność.

## Workers

Rozważ Web Worker albo `worker_threads`, gdy:

- praca CPU blokuje główny wątek/event loop,
- dane wejściowe są wystarczająco małe albo transferowalne,
- zadanie można opisać jako czysty job,
- koszt serializacji nie zjada zysku,
- istnieje plan cancel/timeout/error handling.

Nie przenoś do workera operacji, której bottleneckiem jest sieć lub baza. Nie współdziel z workerem niekontrolowanego globalnego stanu.

## Workflow

1. Zdefiniuj objaw: runtime latency, CPU, heap, RSS, event loop delay, layout thrashing albo cold start.
2. Zrób pomiar bazowy i zapisz warunki: dane, środowisko, liczba iteracji, urządzenie, wersja Node/browser.
3. Wskaż hot path i hipotezę zmiany.
4. Zastosuj najmniejszą zmianę: usuń zbędną pracę, dodaj cleanup, ogranicz cache, zbatchuj I/O albo przenieś CPU.
5. Zmierz po zmianie tym samym scenariuszem.
6. Dodaj test regresji, benchmark smoke, metrykę albo komentarz przy nieoczywistym hot path.
7. Usuń debug instrumentation, jeśli nie jest częścią obserwowalności.

## Walidacja I Smoke Testy

- Profil przed i po pokazuje poprawę w metryce, która była problemem.
- Heap snapshot po powtarzalnym scenariuszu nie pokazuje rosnących retained objects bez właściciela.
- Listener/timer/subscription cleanup jest testowany albo widoczny w lifecycle.
- Backendowy hot path nie używa sync I/O ani kosztownej serializacji w logach.
- Benchmark smoke ma stabilne dane i nie jest zbyt wrażliwy na maszynę CI.

## Antywzorce

- Mikrooptymalizacja czytelnego kodu bez profilu.
- Globalny cache bez TTL, limitu i invalidation.
- `setInterval` w module top-level bez ścieżki cleanup.
- Wielkie `JSON.stringify` w logu requestu.
- `Promise.all` na tysiącach operacji bez limitu współbieżności.
- Worker użyty do pracy I/O, gdzie koszt komunikacji jest większy niż zysk.
- Benchmark porównujący nierealne dane i wyciągający wnioski dla produkcji.

## Checklista Końcowa

```text
- [ ] Istnieje pomiar bazowy i pomiar po zmianie.
- [ ] Zmieniono realny hot path, a nie przypadkowy fragment kodu.
- [ ] Cleanup obejmuje listeners, timers, observers, sockets, streams i cache.
- [ ] Duże kolekcje mają właściwą strukturę danych, batching albo streaming.
- [ ] DOM updates nie powodują niepotrzebnego layout thrashing.
- [ ] Debounce/throttle/batching ma uzasadnienie UX lub operacyjne.
- [ ] Worker/Web Worker/worker_threads ma timeout, error handling i kontrolowany koszt serializacji.
```

## Powiązane Skille

- `optimizing-frontend` — szczegółowa optymalizacja renderowania, bundla i Web Vitals.
- `node-backend-guidelines` — event loop, streams, backpressure i backendowy lifecycle.
- `testing-ts-js` — testy regresji performance, fake timers i deterministyczne benchmark smoke.
- `ts-styling-and-linting` — reguły importów i promises wspierające bezpieczną wydajność.
