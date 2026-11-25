# Wzorce Composables Vue

Wzorce specyficzne dla Vue composables w ramach skilla `writing-hooks`. Ładuj tę referencję, gdy projekt używa Vue, Composition API, Pinia, Vue Router albo Vue Query.

## Spis Treści

- [Konwencje composable](#konwencje-composable)
- [Model reaktywności](#model-reaktywności)
- [Watch i watchEffect](#watch-i-watcheffect)
- [Cleanup scope](#cleanup-scope)
- [Stabilny kontrakt publiczny](#stabilny-kontrakt-publiczny)
- [Async i dane](#async-i-dane)
- [Testowanie](#testowanie)

## Konwencje composable

Composable nazywaj `useX`, gdy jest wielokrotnego użytku i korzysta z Composition API. Nazwa opisuje zachowanie: `useRouteFocus`, `useMediaQuery`, `useDebouncedRef`.

Composable powinien być funkcją, która przyjmuje jawne wejścia i zwraca nazwany kontrakt. Jeśli potrzebuje konfiguracji 3+ parametrów, użyj obiektu opcji.

## Model reaktywności

Używaj `ref` dla pojedynczych wartości, `reactive` dla spójnych obiektów stanu i `computed` dla wartości pochodnych. Nie trzymaj wartości pochodnej jako drugiego źródła prawdy, jeśli można ją wyliczyć.

Uważaj na destrukturyzację obiektów reaktywnych. Jeśli zwracasz pola z `reactive`, rozważ `toRefs`, aby konsumenci nie tracili reaktywności.

## Watch i watchEffect

`watch` jest lepszy, gdy zależności mają być jawne. `watchEffect` jest wygodny dla prostych zależności automatycznych, ale łatwo ukrywa zbyt szeroki zakres reaktywności.

Zasady:

- źródła watchera powinny odpowiadać parametrom, od których zależy efekt;
- cleanup poprzedniej pracy rejestruj przez `onCleanup`/`onWatcherCleanup`, zależnie od wersji Vue;
- nie używaj watchera do synchronizowania dwóch źródeł prawdy, jeśli wystarczy `computed`;
- unikaj głębokiego watcha bez uzasadnienia, bo może być kosztowny i trudny do testowania.

## Cleanup scope

Composable tworzący listener, timer, observer albo subskrypcję powinien sprzątać po sobie przez cleanup watchera, `onUnmounted`, `onScopeDispose` albo lokalny efekt scope.

Jeśli composable może działać poza komponentem, upewnij się, że ma aktywny scope albo zwraca jawny `dispose` zgodny z lokalną konwencją.

## Stabilny kontrakt publiczny

Dla 3+ wartości zwracaj obiekt:

```typescript
return {
  value,
  setValue,
  isPending,
  error,
};
```

Nie zwracaj mieszaniny surowych refs, computed i funkcji bez nazw, jeśli konsument musi zgadywać, co jest reaktywne. Ustal, czy pola są readonly, mutable albo akcjami.

## Async i dane

Dla composables danych preferuj istniejącą warstwę repo: Vue Query, Pinia, Apollo, klient domenowy albo router loaders. Własny composable powinien opakować tę warstwę, nie ręcznie odtwarzać cache, retry i invalidation.

Dla async zależnego od parametrów:

- wspieraj `enabled`/`skip` albo jawny brak startu;
- anuluj lub ignoruj starszy wynik przy zmianie źródła;
- zwracaj `error`/`status`, nie silent catch;
- testuj kolejność zakończenia requestów.

## Testowanie

Testuj composable jako czystą funkcję, jeśli nie wymaga lifecycle. Gdy używa `onMounted`, `provide/inject`, routera albo Pinia, zamontuj mały komponent testowy z lokalnymi providerami.

Używaj lokalnego standardu: zwykle Vitest, `@vue/test-utils`, `nextTick`, `flushPromises` i fake timerów. Po teście czyść scope, timery i mocki, aby kolejne przypadki nie dziedziczyły subskrypcji.
