# Async i Hooki Danych

Szczegóły warunkowego wykonywania, anulowania async, race conditions, obsługi błędów i granic względem bibliotek cache danych. Ładuj tę referencję, gdy hook/composable dotyka requestów, mutacji, debouncu, retry albo stanów asynchronicznych.

## Spis Treści

- [Enabled i skip](#enabled-i-skip)
- [Abortable async](#abortable-async)
- [Race conditions](#race-conditions)
- [Expected errors](#expected-errors)
- [Granice cache danych](#granice-cache-danych)
- [Retry, debounce i throttle](#retry-debounce-i-throttle)

## Enabled i skip

Hook danych powinien mieć jawny sposób pominięcia operacji, gdy warunki wstępne nie są spełnione. Użyj lokalnej konwencji: `enabled`, `skip`, brak `queryKey`, guard w serwisie albo opcja biblioteki danych.

Stan wyłączony powinien być przewidywalny:

- brak requestu;
- brak błędu tylko dlatego, że parametr jest pusty;
- czytelny stan bezczynny, np. `{ data: undefined, error: null, isPending: false }`;
- zachowanie zgodne z biblioteką cache, jeśli repo jej używa.

## Abortable async

Dla operacji zależnej od parametrów zapewnij anulowanie starej pracy. W React i wielu API webowych naturalnym wyborem jest `AbortController`; w Blazor użyj `CancellationTokenSource`; w Vue composables użyj cleanupu watchera, `onScopeDispose` albo sygnału biblioteki.

```typescript
useEffect(() => {
  const controller = new AbortController();

  loadProfile({ userId, signal: controller.signal })
    .then(setData)
    .catch((error) => {
      if (error.name !== "AbortError") {
        setError(error);
      }
    });

  return () => controller.abort();
}, [userId, loadProfile]);
```

Jeśli operacji nie da się anulować, oznacz aktywną generację requestu i ignoruj wynik starszej generacji po zmianie parametrów.

## Race conditions

Najczęstszy błąd: użytkownik zmienia parametr, nowszy request kończy się pierwszy, a starszy po chwili nadpisuje stan. Wymagaj jednego z mechanizmów ochronnych:

- anulowanie requestu przy zmianie zależności;
- monotoniczny identyfikator generacji i ignorowanie starych wyników;
- delegowanie do biblioteki danych, która obsługuje deduplikację i cache;
- test asynchroniczny, który wymusza zakończenie requestów w odwrotnej kolejności.

## Expected errors

Nie ukrywaj oczekiwanych błędów przez silent catch. Hook powinien zwracać stan błędu albo wynik domenowy, który konsument potrafi wyrenderować.

Dobre kontrakty:

- `{ data, error, isPending, refetch }`;
- `{ result, status, retry }`;
- discriminated union, jeśli repo używa takiego stylu.

Rzucanie wyjątku jest dopuszczalne dla błędów programistycznych, np. użycia hooka poza wymaganym Providerem, albo świadomie zintegrowanych Error Boundaries/Suspense.

## Granice cache danych

Nie buduj własnej orkiestracji fetch/cache w hooku, jeśli repo ma już TanStack Query, SWR, Apollo, RTK Query, Vue Query, Pinia z ustaloną warstwą danych, serwisy Blazor albo inny standard.

W takim repo własny hook powinien zwykle:

- opakować istniejącą bibliotekę w domenowy kontrakt;
- ustalić query key, `enabled`, selekcję danych i mapowanie błędów;
- nie implementować ręcznie cache, deduplikacji, retry i invalidation;
- dokumentować wyjątek, jeśli zespół naprawdę potrzebuje ręcznego async.

## Retry, debounce i throttle

Retry, debounce i throttle są elementami kontraktu, nie dekoracją.

- Retry stosuj tylko dla operacji idempotentnych albo zgodnych z polityką domeny.
- Debounce czyści timer przy zmianie wartości i unmount.
- Throttle musi jasno określać leading/trailing behavior.
- Testuj fake timerami, bez rzeczywistych opóźnień.
- Nie ukrywaj retry w hooku UI, jeśli repo centralizuje politykę retry w kliencie danych.
