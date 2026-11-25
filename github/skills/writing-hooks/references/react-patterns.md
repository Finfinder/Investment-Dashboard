# Wzorce hooków React

Wzorce specyficzne dla Reacta dla umiejętności `writing-hooks`. Załaduj to odniesienie, gdy projekt używa Reacta.

## Spis treści

- [Zasady hooków](#zasady-hooków)
- [Tablice zależności](#tablice-zależności)
- [Składnia czyszczenia efektów](#składnia-czyszczenia-efektów)
- [API memoizacji](#api-memoizacji)
- [Testowanie za pomocą renderHook](#testowanie-za-pomocą-renderhook)

## Zasady hooków

React wymusza dwie zasady ograniczające użycie hooków:

1. **Wywołuj hooki tylko na najwyższym poziomie** — nigdy wewnątrz warunków, pętli ani funkcji zagnieżdżonych. React polega na kolejności wywołań, aby powiązać stan z odpowiednim hookiem.
2. **Wywołuj hooki tylko z funkcji Reacta** — komponentów funkcyjnych lub innych hooków niestandardowych.

`eslint-plugin-react-hooks` egzekwuje te zasady. Nigdy nie wyłączaj `react-hooks/rules-of-hooks`.

## Tablice zależności

Efekty Reacta i hooki memoizacji używają tablic zależności do śledzenia wartości reaktywnych:

| Hook Reacta | Zachowanie tablicy zależności |
| --- | --- |
| `useEffect(fn, [deps])` | Ponownie uruchamia `fn`, gdy dowolna zależność zmieni referencję |
| `useMemo(() => val, [deps])` | Przelicza wartość, gdy dowolna zależność się zmieni |
| `useCallback(fn, [deps])` | Zwraca stabilną referencję, dopóki zależności się nie zmienią |

**Zasady**:

- Uwzględnij WSZYSTKIE wartości reaktywne (propsy, stan, wartości pochodne) w tablicy.
- Reguła ESLint `exhaustive-deps` wykrywa brakujące zależności — nie wyłączaj jej.
- Zależności będące obiektami i tablicami są porównywane referencyjnie, a nie wartościowo. Wynieś stabilne obiekty do zakresu modułu lub je memoizuj.

## Składnia czyszczenia efektów

Czyszczenie w React odbywa się przez funkcję zwracaną z `useEffect`:

```typescript
// Czyszczenie timera
useEffect(() => {
  const id = setTimeout(callback, delay);
  return () => clearTimeout(id);
}, [callback, delay]);

// Czyszczenie nasłuchiwacza zdarzeń
useEffect(() => {
  window.addEventListener("resize", handler);
  return () => window.removeEventListener("resize", handler);
}, [handler]);

// AbortController dla anulowalnych operacji asynchronicznych
useEffect(() => {
  const controller = new AbortController();
  // Przekaż sygnał do operacji, które można anulować, także przy uzasadnionym ręcznym async/fetch
  longRunningOperation({ signal: controller.signal });
  return () => controller.abort();
}, [longRunningOperation]);

// Czyszczenie subskrypcji
useEffect(() => {
  const subscription = source.subscribe(handler);
  return () => subscription.unsubscribe();
}, [source, handler]);
```

Czyszczenie uruchamia się przed kolejnym wykonaniem efektu oraz przy odmontowaniu komponentu.

> **Uwaga**: Jeśli repo ma lokalny standard danych, taki jak TanStack Query, SWR, query client, store, serwis danych albo warstwa frameworka, preferuj go zamiast ręcznego `useEffect` z `fetch`. W repo bez takiej warstwy ręczny async/fetch w hooku jest dopuszczalny, ale wymaga lokalnego uzasadnienia, anulowania przez `AbortController` albo odpowiednik, ochrony przed race conditions/starymi wynikami oraz jawnej obsługi błędów.

## API memoizacji

| Koncepcja ogólna (z umiejętności) | API Reacta | Zastosowanie |
| --- | --- | --- |
| Memoizacja callbacka | `useCallback(fn, [deps])` | Stabilna referencja funkcji obsługi dla memoizowanych dzieci |
| Memoizacja wartości obliczanej | `useMemo(() => compute(data), [deps])` | Kosztowne wyliczenia pochodne ze stanu/propsów |
| Memoizacja komponentu | `React.memo(Component)` | Pomija ponowne renderowanie, gdy propsy się nie zmieniły |
| Mutowalna referencja poza renderowaniem | `useRef(initialValue)` | Identyfikatory timerów, referencje DOM — używaj tylko w efektach lub funkcjach obsługi zdarzeń, nigdy podczas renderowania |
| Stan warunkowy | `useState` / `useReducer` | `useReducer` dla złożonych przejść stanu |

**Kiedy NIE memoizować**:

- Trywialne obliczenia (prosta arytmetyka, łączenie stringów) — narzut memoizacji przewyższa korzyść.
- Funkcje obsługi, które nie są przekazywane do memoizowanych dzieci — `useCallback` nie daje korzyści.
- Komponenty, które zawsze otrzymują nowe propsy — porównanie `React.memo` się wykona, ale nigdy nie oszczędzi renderu.

## Testowanie za pomocą renderHook

Hooki Reacta testuje się przy użyciu `renderHook` z `@testing-library/react` (v13+):

```typescript
import { renderHook, act } from "@testing-library/react";

it("zwraca stan początkowy", () => {
  const { result } = renderHook(() => useCounter({ initial: 5 }));
  expect(result.current.count).toBe(5);
});

it("aktualizuje stan przez akcje", () => {
  const { result } = renderHook(() => useCounter({ initial: 0 }));
  act(() => result.current.increment());
  expect(result.current.count).toBe(1);
});

it("czyści zasoby przy odmontowaniu", () => {
  const { unmount } = renderHook(() =>
    useDebounce({ value: "test", delay: 500 }),
  );
  unmount();
  // Przesuń timery - zweryfikuj brak wycieków skutków ubocznych
});
```

Dla hooków wymagających dostawców kontekstu (np. klienta zapytań lub kontekstu) użyj opcji `wrapper`:

```typescript
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);
const { result } = renderHook(() => useUserProfile(1), { wrapper });
```
