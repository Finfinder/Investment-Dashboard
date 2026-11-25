# Wzorce implementacyjne React

Wzorce specyficzne dla Reacta do umiejętności `implementing-frontend`. Wczytaj tę referencję, gdy projekt używa Reacta.

## Spis treści

- [Kompozycja komponentów](#kompozycja-komponentów)
- [Kontrakty komponentów](#kontrakty-komponentów)
- [Wzorce stanu](#wzorce-stanu)
- [Stany danych](#stany-danych)
- [Obsługa błędów](#obsługa-błędów)
- [Wzorce wydajności](#wzorce-wydajności)
- [Antywzorce](#antywzorce)

## Kompozycja komponentów

React implementuje ogólne wzorce kompozycji w następujący sposób:

- Projekcja treści: prop `children`.
- Delegacja renderowania: render props, np. `renderItem={(item) => <Item data={item} />}`.
- Komponenty złożone: współdzielony kontekst między rodzicem a podkomponentami, np. `Select` + `Select.Option`.
- Sloty: nazwane propsy przyjmujące `ReactNode`, np. `header`, `footer`, `sidebar`.

Preferuj `children` przy pojedynczej projekcji treści. Używaj nazwanych propsów `ReactNode` (slotów), gdy potrzebujesz wielu punktów wstrzyknięcia. Używaj komponentów złożonych dla ściśle powiązanych grup UI (zakładki, akordeon, select).

## Kontrakty komponentów

- Definiuj jawne typy propsów; nie używaj `any` dla danych UI ani callbacków.
- Preferuj named exports dla komponentów i typów: `export function Button(...)` oraz `export type ButtonProps = ...`.
- Callbacki nazywaj od intencji: `onSelect`, `onDismiss`, `onRetry`; unikaj nazw zależnych od implementacji.
- Dla slotów używaj `ReactNode`; dla delegacji renderowania używaj jawnie typowanych render props.
- Stabilizuj obiekty, tablice i callbacki tylko wtedy, gdy trafiają do memoizowanego dziecka, context provider value albo dependency array.

## Wzorce stanu

Typowe mapowanie stanu w React:

- Stan lokalny: zasięg komponentu przez `useState` albo `useReducer`.
- Stan wyniesiony: `useState` rodzica oraz propsy/callbacki przekazane w dół.
- Kontekst / DI: React Context API przez `createContext` i `useContext`.
- Cache serwera: biblioteka do pobierania danych, np. TanStack Query, SWR albo rozwiązanie frameworka.

Używaj `useReducer` zamiast `useState`, gdy przejścia stanu są złożone (wiele powiązanych wartości, aktualizacje oparte na akcjach).

## Stany danych

- Loading: `Suspense` jest dobry, gdy data layer i framework go wspierają; w pozostałych przypadkach renderuj jawny skeleton/spinner.
- Error: error boundary obsługuje błędy renderowania, ale błędy requestów i handlerów mapuj na stan UI albo mechanizm biblioteki danych.
- Empty: renderuj osobną ścieżkę, nie pustą listę bez komunikatu.
- Retry/reset: przekazuj jako jawny callback, np. `onRetry`, `resetErrorBoundary` albo metoda data clienta.

## Obsługa błędów

React używa **granic błędów** — komponentów klasowych z `componentDidCatch` / `getDerivedStateFromError`:

- Owijaj sekcje zależne od danych komponentem `<ErrorBoundary>`.
- Granice per-funkcja są lepsze niż jedna globalna granica.
- Granice błędów NIE przechwytują błędów w obsłudze zdarzeń, kodzie asynchronicznym ani renderowaniu po stronie serwera — tam używaj try/catch.
- W Next.js App Router korzystaj z lokalnych `error.tsx` i `loading.tsx` na poziomie segmentu, gdy to pasuje do routingu.

## Wzorce wydajności

Typowe narzędzia wydajnościowe React:

- Memoizacja komponentu: `React.memo(Component)` dla kosztownych renderów z rzadko zmieniającymi się propsami.
- Kosztowne obliczenia: `useMemo(() => compute(data), [data])` dla ciężkich obliczeń pochodnych od stanu lub propsów.
- Stabilne callbacki: `useCallback(fn, [deps])` dla callbacków przekazywanych do memoizowanych dzieci.
- Podział kodu: `React.lazy(() => import('./Heavy'))` + `<Suspense>` na poziomie tras i ciężkich komponentów.

**Zasada kciuka**: Nie memoizuj domyślnie. Najpierw zmierz. `React.memo` pomaga tylko wtedy, gdy re-rendery są mierzalnie kosztowne i propsy rzadko się zmieniają.

## Antywzorce

- Inline `{}` / `[]` jako prop do memoizowanego dziecka: nowa referencja przy każdym renderze niweluje memoizację; wynieś wartość do stałej modułu albo `useMemo`.
- Brakująca lub błędna tablica zależności: powoduje przestarzałe domknięcia i pętle; uwzględnij wszystkie wartości reaktywne i korzystaj z `exhaustive-deps`.
- `useEffect` dla stanu pochodnego: tworzy niepotrzebny cykl renderowania; oblicz wynik podczas renderowania.
- Indeks jako klucz listy: psuje reconciliation przy zmianie kolejności lub usunięciu; używaj stabilnego unikalnego ID.
- Komponent klasowy dla nowego kodu: wprowadza niespójne wzorce; preferuj komponenty funkcyjne, chyba że lokalny framework wymaga inaczej.
