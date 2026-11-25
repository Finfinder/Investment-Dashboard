---
name: react-performance
description: "Optymalizuje React przez render/commit profiling, stabilnosc props, state locality, Suspense, transitions, hydration i granice Server Components."
---
slug: react-performance

# React: wydajnosc i profilowanie

## Short description

Optymalizuj React dopiero po rozpoznaniu realnego kosztu renderowania, commit phase albo hydratacji. Ten skill prowadzi przez React DevTools Profiler, stabilnosc props, lokalnosc stanu, wirtualizacje list, Suspense, transitions i granice Server Components.

## Use cases / When to use

- Komponent renderuje sie zbyt czesto albo blokuje interakcje uzytkownika.
- Lista, tabela, wykres albo dashboard staje sie wolny przy wiekszych danych.
- Debugujesz regresje po dodaniu context, global state, memo albo efektow.
- Analizujesz hydratacje SSR, Suspense, transitions albo granice Server Components.
- Recenzujesz PR z `React.memo`, `useMemo`, `useCallback`, virtualization albo Suspense.
- Chcesz ustalic, czy problem jest w React, danych, CSS layout, sieci czy bundlerze.

## When NOT to use

- Problem dotyczy ogolnego hot path JavaScript poza React; uzyj `performance-and-memory-js`.
- Problem dotyczy language/runtime memory leaks, listenerow, timerow, closure leaks albo object churn poza modelem React; uzyj `performance-and-memory-js`.
- Problem dotyczy ogolnych Web Vitals, obrazow, fontow, asset delivery, bundle delivery albo strategii CDN; uzyj `optimizing-frontend`.
- Problem dotyczy API komponentow; uzyj `react-component-design`.
- Problem dotyczy hookow i dependency arrays; uzyj `react-hooks-best-practices`.
- Problem dotyczy testow wydajnosci lub stabilizacji testow; uzyj `react-testing`.
- Nie ma objawu, pomiaru ani podejrzenia regresji; nie optymalizuj na zapas.

## Key rules and concrete guidance

- Najpierw zmierz. Dla React zacznij od React DevTools Profiler: ktore komponenty renderuja, ile trwa render i ile kosztuje commit.
- Rozdziel problemy: render time, commit time, layout/reflow po commit, hydration mismatch, Suspense waterfalls, memory churn w drzewie React.
- Zidentyfikuj czesto renderujace sie galezie. Czasem wystarczy przesunac state nizej, zamiast memoizowac wszystko.
- `React.memo` pomaga tylko wtedy, gdy props sa referencyjnie stabilne i render komponentu jest kosztowny.

```tsx
const UserRow = React.memo(function UserRow({ user, onSelect }: UserRowProps) {
  return <button onClick={() => onSelect(user.id)}>{user.name}</button>;
});
```

- `React.memo` nie pomoze, jesli rodzic przekazuje nowe obiekty lub funkcje przy kazdym renderze.

```tsx
// Slabo: nowy obiekt przy kazdym renderze.
<UserCard options={{ dense: true }} />

// Lepiej: stala albo memo, jesli obiekt zalezy od props/state.
const options = React.useMemo(() => ({ dense: true }), []);
<UserCard options={options} />
```

- `useMemo` sluzy do kosztownych obliczen albo stabilnej referencji. Nie uzywaj go do kazdej zmiennej.
- `useCallback` sluzy do stabilizacji funkcji przekazywanej do memoizowanego dziecka lub dependency array. Nie jest automatycznie szybszy.
- Dla duzych list uzyj wirtualizacji (`react-window`, `react-virtualized`, `@tanstack/react-virtual`) zamiast renderowac tysiace elementow.
- Dla tabel rozdziel stan filtrowania, sortowania i selection. Nie przepychaj calego modelu danych przez context przy kazdej zmianie.
- Context renderuje wszystkich konsumentow, gdy zmienia sie wartosc providera. Dziel contexty wedlug czestotliwosci zmian albo uzyj selectorow/store.

```tsx
const value = React.useMemo(() => ({ currentUser, logout }), [currentUser, logout]);
return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
```

- Przenos state najblizej miejsca uzycia. Nie trzymaj input hover/focus/local UI w globalnym store.
- Dla wolnych aktualizacji UI uzywaj `startTransition` lub `useDeferredValue`, gdy interakcja pilna ma pozostac responsywna.

```tsx
const [query, setQuery] = React.useState('');
const deferredQuery = React.useDeferredValue(query);
const visibleItems = React.useMemo(() => filterItems(items, deferredQuery), [items, deferredQuery]);
```

- SSR hydration: HTML z serwera musi zgadzac sie z pierwszym renderem klienta. Unikaj `Date.now()`, `Math.random()`, odczytu `window` i lokalnego storage w renderze bez fallbacku.
- Dla danych zaleznych od przegladarki renderuj bezpieczny placeholder i uzupelniaj po mount, albo uzyj frameworkowego mechanizmu dynamic/no-SSR.
- Suspense granice ustawiaj wokol realnie niezaleznych regionow. Zbyt wysoko blokuje caly widok, zbyt nisko moze tworzyc kaskade fallbackow.
- W React Server Components trzymaj ciezkie odczyty i transformacje po stronie serwera, ale nie przeciekaj client-only zaleznosci przez server boundary.
- Lazy loaduj ciezkie widoki, wykresy, edytory, mapy i modaly rzadko otwierane. Nie tnij kazdego malego komponentu.
- Jesli problem dotyczy glownie rozmiaru bundla albo delivery assetow, przenies analize do `optimizing-frontend`.
- Unikaj `useLayoutEffect`, chyba ze musisz mierzyc DOM przed paint. Naduzycie blokuje rendering.
- Animacje i layout: sprawdz, czy problem nie pochodzi z CSS (`top/left`, layout thrashing, cienie, filtry) zamiast React.
- Memoizacja ma koszt pamieci i zlozonosci. Usuwaj ja, gdy nie ma pomiaru albo komplikuje kod bez zysku.

## Typical mistakes / anti-patterns to avoid

- Dodawanie `memo`, `useMemo` i `useCallback` bez profilu albo konkretnego celu.
- Przekazywanie inline obiektow do memoizowanych dzieci.
- Jeden globalny context z czesto zmieniajaca sie wartoscia dla calej aplikacji.
- Renderowanie tysiecy wierszy bez wirtualizacji.
- Kopiowanie duzych struktur danych w kazdym renderze.
- Hydration mismatch przez losowe wartosci, czas, locale albo odczyt `window` w renderze.
- `useLayoutEffect` dla zwyklych efektow sieciowych albo logowania.
- Snapshoty lub testy, ktore utrwalaja przypadkowe struktury po optymalizacji.
- Przedwczesne code splitting, ktore pogarsza UX przez wiele malych chunkow.

## Checklist for PR reviews

- [ ] Jest objaw lub pomiar uzasadniajacy optymalizacje.
- [ ] Optymalizacja ma najwezszym mozliwy zakres i nie komplikuje publicznego API.
- [ ] `React.memo` ma stabilne props albo uzasadnienie custom compare.
- [ ] `useMemo`/`useCallback` nie maskuja problemow z modelem stanu.
- [ ] Duze listy/tabele uzywaja wirtualizacji albo paginacji.
- [ ] Contexty sa podzielone wedlug czestotliwosci zmian.
- [ ] SSR nie generuje hydration mismatch dla danych klienta.
- [ ] Bundle impact nowej zaleznosci zostal sprawdzony.
- [ ] Testy pokrywaja zachowanie po optymalizacji, nie szczegoly implementacji.

## Example snippets

```tsx
function ProductList({ products }: { products: Product[] }) {
  const [query, setQuery] = React.useState('');
  const deferredQuery = React.useDeferredValue(query);

  const filtered = React.useMemo(
    () => products.filter(product => product.name.toLowerCase().includes(deferredQuery.toLowerCase())),
    [products, deferredQuery]
  );

  return <List items={filtered} onQueryChange={setQuery} query={query} />;
}
```

```tsx
function ClientOnlyClock() {
  const [now, setNow] = React.useState<string | null>(null);

  React.useEffect(() => {
    setNow(new Date().toLocaleTimeString());
  }, []);

  return <span>{now ?? '--:--:--'}</span>;
}
```

```tsx
const Chart = React.lazy(() => import('./Chart'));

export function AnalyticsPanel() {
  return (
    <React.Suspense fallback={<div>Loading chart...</div>}>
      <Chart />
    </React.Suspense>
  );
}
```

## Trigger description

React performance: render/commit profiling, props stability, state locality, Suspense, transitions, hydration i Server Components.
