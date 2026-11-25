# Wzorce Optymalizacji React

Wzorce specyficzne dla Reacta w ramach skilla `optimizing-frontend`. Wczytaj tę referencję, gdy projekt używa Reacta.

## Spis Treści

- [API Memoizacji](#api-memoizacji)
- [Profilowanie React](#profilowanie-react)
- [Podział Kodu](#podział-kodu)
- [Refy dla Wartości Niereaktywnych](#refy-dla-wartości-niereaktywnych)
- [Cleanup Efektów](#cleanup-efektów)
- [Typowe Wzorce Marnotrawstwa Renderowania](#typowe-wzorce-marnotrawstwa-renderowania)

## API Memoizacji

| Ogólna koncepcja (ze skilla)  | API Reacta                             | Składnia                                                                  |
| ----------------------------- | -------------------------------------- | ------------------------------------------------------------------------- |
| Memoizacja komponentu         | `React.memo(Component)`                | Opakowuje komponent; pomija re-render gdy propsy są płytko równe          |
| Własne porównanie             | `React.memo(Component, areEqual)`      | `areEqual(prevProps, nextProps)` zwraca `true`, aby pominąć re-render     |
| Buforowanie obliczeń          | `useMemo(() => compute(data), [deps])` | Przelicza tylko gdy zmieni się zależność                                  |
| Stabilizacja callbacka        | `useCallback(fn, [deps])`              | Zwraca stabilną referencję funkcji dopóki zależności się nie zmienią      |
| Mutowalny ref                 | `useRef(initialValue)`                 | `.current` jest mutowalny, nie wyzwala re-renderu                         |

**Tablice zależności**: Wszystkie hooki memoizacji używają `[deps]` do śledzenia. Uwzględnij wszystkie wartości reaktywne. Reguła ESLint `exhaustive-deps` wymusza kompletność — nie wyłączaj jej.

## Profilowanie React

- Użyj React DevTools Profiler, aby zobaczyć czas commitów, komponenty renderujące się najczęściej i powód renderu.
- Szukaj komponentów z renderem >16 ms albo często powtarzanych commitów podczas jednej interakcji.
- Nie dodawaj `React.memo`, `useMemo` ani `useCallback` bez wskazania komponentu lub wartości, które profiler pokazuje jako kosztowne.
- React Strict Mode może uruchamiać efekty podwójnie w dev. Nie traktuj tego jako produkcyjnej regresji, ale wykorzystaj do wykrywania brakującego cleanupu.

## Podział Kodu

React używa `lazy()` + `Suspense` do podziału kodu:

```typescript
import { lazy, Suspense } from 'react';

const HeavyChart = lazy(() => import('./HeavyChart'));

const Dashboard = () => (
  <Suspense fallback={<ChartSkeleton />}>
    <HeavyChart data={data} />
  </Suspense>
);
```

- Umieszczaj granice `Suspense` na poziomie tras i wokół ciężkich komponentów ładowanych na żądanie (modale, wykresy, edytory).
- Prop `fallback` renderuje się podczas ładowania chunka — użyj szkieletu lub spinnera.
- Zagnieżdżone granice `Suspense` pozwalają na niezależne stany ładowania dla różnych regionów strony.

## Refy dla Wartości Niereaktywnych

Używaj `useRef` dla wartości, które muszą przetrwać między renderowaniami bez wywoływania re-renderów.

> **Pułapka**: NIE czytaj ani nie zapisuj `ref.current` podczas renderowania. React oczekuje, że ciała komponentów są czystymi funkcjami. Czytanie lub zapisywanie refów podczas renderowania łamie to założenie i może powodować nieprzewidywalne zachowanie. Uzyskuj dostęp do refów tylko w **handlerach zdarzeń** lub **efektach**. Jedynym wyjątkiem jest leniwa inicjalizacja: `if (!ref.current) ref.current = new Thing()`.

```typescript
// ID timera — nie przechowuj w useState (re-render jest marnotrawstwem)
const timerRef = useRef<number>();

// Start/stop timera — odczyt/zapis refa odbywa się w handlerach zdarzeń, NIE podczas renderowania
const handleStart = () => {
  timerRef.current = window.setInterval(tick, 1000);
};
const handleStop = () => {
  clearInterval(timerRef.current);
};
```

### Śledzenie wartości z poprzedniego renderowania

Jeśli potrzebujesz poprzedniej wartości **podczas renderowania** (np. aby wykryć zmiany propów), użyj `useState` — nie `useRef`:

```typescript
const [prevItems, setPrevItems] = useState(items);
if (items !== prevItems) {
  setPrevItems(items);
  // Zareaguj na zmianę (np. zresetuj zaznaczenie)
}
```

Ten wzorzec jest udokumentowany w dokumentacji Reacta pod hasłem „Storing information from previous renders". React natychmiast re-renderuje komponent (przed dziećmi) gdy stan jest ustawiany podczas renderowania, dzięki czemu dzieci nigdy nie widzą nieaktualnych wartości.

## Cleanup Efektów

Każdy `useEffect`, który tworzy zasób poza Reactem, musi zwrócić cleanup. Dotyczy to listenerów, timerów, subskrypcji, requestów, obserwatorów, workerów i object URLs.

```typescript
useEffect(() => {
  const controller = new AbortController();
  const handleResize = () => setWidth(window.innerWidth);

  window.addEventListener('resize', handleResize);
  const intervalId = window.setInterval(refresh, 30_000);

  fetch('/api/data', { signal: controller.signal }).then(loadData);

  return () => {
    window.removeEventListener('resize', handleResize);
    window.clearInterval(intervalId);
    controller.abort();
  };
}, []);
```

- Handler przekazany do `removeEventListener` musi być tą samą referencją, którą dodano.
- Przy requestach zależnych od propsów anuluj poprzednie żądanie przy zmianie zależności.
- WebSocket/EventSource zamykaj w cleanupie albo trzymaj jako kontrolowany singleton poza komponentem.
- Dla workerów tworzonych per komponent wywołaj `terminate()` w cleanupie.

## Typowe Wzorce Marnotrawstwa Renderowania

| Wzorzec | Problem | Rozwiązanie w Reakcie |
| --- | --- | --- |
| `style={{ margin: 8 }}` w JSX | Nowy obiekt przy każdym renderowaniu | Przenieś do stałej modułu: `const style = { margin: 8 }` |
| `options={[1, 2, 3]}` w JSX | Nowa tablica przy każdym renderowaniu | Przenieś do stałej modułu lub użyj `useMemo` |
| `onChange={(e) => set(e.target.value)}` | Nowa funkcja przy każdym renderowaniu | `useCallback` jeśli dziecko jest opakowane w `React.memo` |
| `value={{ a, b }}` w providerze kontekstu | Nowy obiekt re-renderuje wszystkich konsumentów | Zmemoizuj wartość: `useMemo(() => ({ a, b }), [a, b])` |
| Brak `React.memo` na komponencie elementu listy | Re-render listy rodzica re-renderuje każdy element | Opakuj komponent elementu w `React.memo` |
