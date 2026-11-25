# Testowanie Hooków i Composables

Szczegóły testów hooków Reacta, Vue composables, Blazor lifecycle/code-behind i analogicznych jednostek reużywalnej logiki UI. Ładuj tę referencję, gdy implementacja wymaga testów stanu, cleanupu, błędów, timerów albo async cancellation.

## Spis Treści

- [Zakres testów](#zakres-testów)
- [React renderHook](#react-renderhook)
- [Vue composable tests](#vue-composable-tests)
- [Providery i kontekst](#providery-i-kontekst)
- [Fake timery](#fake-timery)
- [Cleanup i unmount](#cleanup-i-unmount)
- [Error paths i async cancellation](#error-paths-i-async-cancellation)
- [Blazor i bUnit](#blazor-i-bunit)

## Zakres testów

Minimalny zestaw dla nietrywialnego hooka:

1. stan początkowy;
2. przejścia stanu po akcjach lub zmianie parametrów;
3. cleanup przy unmount/dispose i zmianie zależności;
4. ścieżka błędu;
5. anulowanie async albo fake timery, jeśli hook używa czasu lub requestów.

Testy powinny używać lokalnego runnera i helperów repo. Nie dodawaj nowej biblioteki testowej, jeśli projekt ma już standard.

## React renderHook

W React używaj `renderHook` z lokalnie przyjętej biblioteki, zwykle `@testing-library/react`.

```typescript
const { result } = renderHook(() => useCounter({ initial: 1 }));

act(() => result.current.increment());

expect(result.current.count).toBe(2);
```

Dla zmian propsów używaj `rerender`, a dla cleanupu `unmount`. Asercje wykonuj przez publiczny kontrakt hooka, nie przez prywatne zmienne implementacyjne.

## Vue composable tests

Dla composables Vue testuj czystą funkcję, jeśli nie używa lifecycle komponentu. Gdy composable wymaga `onMounted`, `provide/inject` albo scope komponentu, zamontuj mały komponent testowy lub użyj lokalnego helpera.

Typowe narzędzia to Vitest, `@vue/test-utils`, `nextTick` i `flushPromises`. Dla watcherów sprawdzaj zmianę źródła oraz cleanup poprzedniej subskrypcji.

## Providery i kontekst

Hooki danych i domenowe często wymagają providerów: query clienta, routera, store, DI albo kontekstu użytkownika. Test powinien tworzyć izolowany provider per test, aby cache i subskrypcje nie przeciekały między przypadkami.

Przykłady:

- React: `wrapper` dla `renderHook`.
- Vue: `global.plugins`, `provide` albo testowy Pinia/store.
- Blazor: rejestracje w `TestContext.Services`.

## Fake timery

Używaj fake timerów dla debounce, throttle, polling, timeoutów i retry. Testy nie powinny czekać rzeczywistego czasu.

Po teście przywróć prawdziwe timery i wyczyść oczekujące zadania, jeśli runner tego wymaga. Sprawdź także, że unmount/dispose nie zostawia aktywnego timera.

## Cleanup i unmount

Cleanup testuj przez obserwowalny efekt:

- `removeEventListener` wywołany dla listenera dodanego przez hook;
- `clearTimeout`/`clearInterval` dla timerów;
- `unsubscribe`, `dispose` albo `abort` dla subskrypcji/requestów;
- brak aktualizacji stanu po unmount.

Nie wystarczy test happy path. Wyciek zwykle pojawia się dopiero przy zmianie zależności albo odmontowaniu.

## Error paths i async cancellation

Dla błędów sprawdzaj publiczne pole `error`, `status` albo rezultat domenowy. Silent catch bez asercji jest luką testową.

Dla async cancellation wymuś kolejność zakończenia operacji: starsza kończy się po nowszej. Test powinien pokazać, że starszy wynik nie nadpisuje aktualnego stanu albo że operacja została anulowana.

## Blazor i bUnit

W Blazor rozdziel testy:

- czysta logika serwisu stanu bez renderowania;
- komponent w bUnit, jeśli lifecycle, markup albo DI wpływa na wynik;
- `Dispose`/`DisposeAsync` dla subskrypcji i `CancellationTokenSource`.

Rejestruj zależności w `TestContext.Services`, renderuj komponent, wykonuj interakcje i sprawdzaj wynik przez publiczny markup albo publiczne API testowanego serwisu.
