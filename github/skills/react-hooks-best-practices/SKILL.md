---
name: react-hooks-best-practices
description: "Stabilizuje hooki React: Rules of Hooks, useEffect, exhaustive deps, Strict Effects, useSyncExternalStore i custom hooks."
---
slug: react-hooks-best-practices

# React: najlepsze praktyki hookow

## Short description

Pisz hooki React tak, aby mialy stabilny kontrakt, poprawne zaleznosci i przewidywalny lifecycle w Strict Effects. Ten skill obejmuje Rules of Hooks, `useEffect`, exhaustive deps, custom hooks, referencje, `useSyncExternalStore` i granice efektow ubocznych.

## Use cases / When to use

- Implementujesz custom hook dla logiki wielokrotnego uzycia.
- Debugujesz nieskonczone rendery, stale closures albo brak aktualizacji efektu.
- Ustalasz poprawna tablice zaleznosci dla `useEffect`, `useMemo` lub `useCallback`.
- Przenosisz logike z komponentu do hooka.
- Integrujesz komponent z API przegladarki, timerem, subskrypcja, event listenerem albo zewnetrznym store.
- Recenzujesz PR z istotnymi zmianami w hookach.

## When NOT to use

- Problem dotyczy projektu publicznego API komponentu; uzyj `react-component-design`.
- Problem dotyczy architektury calej aplikacji i granic stanu; uzyj `react-architecture`.
- Problem dotyczy tylko wydajnosci renderowania; uzyj `react-performance`.
- Problem dotyczy testow hookow i komponentow; uzyj `react-testing`.
- Problem dotyczy Vue composables, Blazor lifecycle albo generycznej logiki reusable UI poza React; uzyj `writing-hooks`.
- Problem dotyczy modelowania typow TypeScript, unions, branded types albo runtime validation; uzyj `typescript-best-practices`.

## Key rules and concrete guidance

- Hook musi zaczynac sie od `use` i byc wywolywany tylko na najwyzszym poziomie komponentu lub innego hooka.
- Nie wywoluj hookow warunkowo, w petlach, callbackach ani po wczesnym returnie.
- Custom hook powinien miec maly, stabilny ksztalt zwracanej wartosci. Dla wielu pol preferuj obiekt; dla pary state/setter tuple jest naturalny.

```tsx
function useDisclosure(initialOpen = false) {
  const [open, setOpen] = React.useState(initialOpen);

  const show = React.useCallback(() => setOpen(true), []);
  const hide = React.useCallback(() => setOpen(false), []);
  const toggle = React.useCallback(() => setOpen(value => !value), []);

  return { open, show, hide, toggle };
}
```

- Dependency array ma odzwierciedlac wartosci czytane przez efekt, memo lub callback. Nie usuwaj zaleznosci tylko po to, aby uciszyc linter.
- Jesli aktualizacja zalezy od poprzedniego stanu, uzyj functional update. To czesto usuwa zaleznosc bez oszustwa.

```tsx
const increment = React.useCallback(() => {
  setCount(count => count + 1);
}, []);
```

- Efekty sluzy do synchronizacji z systemami poza React: DOM API, network, storage, timer, subskrypcja. Nie uzywaj efektu do obliczen, ktore mozna zrobic w renderze.
- Kazdy efekt z subskrypcja, timerem lub listenerem powinien zwracac cleanup.

```tsx
React.useEffect(() => {
  function handleResize() {
    setWidth(window.innerWidth);
  }

  window.addEventListener('resize', handleResize);
  handleResize();

  return () => window.removeEventListener('resize', handleResize);
}, []);
```

- Abortuj requesty lub ignoruj stare wyniki, gdy efekt zalezy od inputu i moze zostac wywolany ponownie.

```tsx
React.useEffect(() => {
  const controller = new AbortController();

  void fetch(`/api/users/${userId}`, { signal: controller.signal })
    .then(response => response.json())
    .then(setUser)
    .catch(error => {
      if (error.name !== 'AbortError') setError(error);
    });

  return () => controller.abort();
}, [userId]);
```

- Do stabilnego odczytu mutowalnej wartosci bez renderu uzywaj `useRef`. Nie traktuj ref jako ukrytego state, jesli UI powinien sie aktualizowac.
- `useMemo` i `useCallback` nie sa gwarancja wydajnosci. Uzywaj ich, gdy stabilna referencja jest kontraktem albo pomiar pokazuje koszt.
- Dla external store uzywaj `useSyncExternalStore`, a nie recznej subskrypcji w `useEffect`, jesli potrzebujesz zgodnosci z concurrent rendering.
- Dla SSR external store musi miec deterministyczny `getServerSnapshot`, zgodny z pierwszym renderem klienta.
- Dla storage przegladarki zaczynaj od deterministycznego state. Odczyt i zapis `localStorage` rob w efektach po mount; nie czytaj `window.localStorage` w renderze ani initializerze `useState`.
- Dla efektow zaleznych od event handlerow rozdziel state i handler. Jesli projekt uzywa `useEvent`/`useEffectEvent`, trzymaj sie lokalnej konwencji.
- Nie ustawiaj state w efekcie tylko po to, aby przechowac pochodna wartosc. Oblicz ja w renderze albo `useMemo`, jesli jest kosztowna.

```tsx
// Dobrze
const fullName = `${firstName} ${lastName}`;

// Gorzej
React.useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);
```

- Custom hook nie powinien ukrywac globalnego singletonu, jesli utrudnia testy. Wstrzykuj klienta lub provider, gdy integracja jest istotna.
- Hook zwracajacy callbacki powinien stabilizowac je przez `useCallback`, jesli konsumenci moga miec je w dependency array.
- Hook zwracajacy obiekt moze uzywac `useMemo`, jesli stabilnosc referencji jest czescia kontraktu.

## Typical mistakes / anti-patterns to avoid

- Puste dependency array mimo odczytu props, state albo funkcji z renderu.
- `// eslint-disable-next-line react-hooks/exhaustive-deps` bez konkretnego uzasadnienia.
- Efekt jako zamiennik zwyklego obliczenia.
- Brak cleanup dla listenera, intervala, subskrypcji lub requestu.
- Przechowywanie danych UI w `useRef`, przez co interfejs nie reaguje na zmiany.
- Custom hook zwracajacy inny ksztalt danych zalezenie od stanu.
- Przekazywanie niestabilnych obiektow do dependency array bez memoizacji albo zmiany modelu danych.
- Wywolywanie hookow warunkowo po `if`, `return` albo w callbacku.

## Checklist for PR reviews

- [ ] Hooki sa wywolywane tylko na najwyzszym poziomie.
- [ ] Dependency arrays odpowiadaja wartosciom czytanym w hooku.
- [ ] Brak nowych disable comments dla `exhaustive-deps` bez uzasadnienia.
- [ ] Efekty maja cleanup dla zasobow zewnetrznych.
- [ ] Requesty w efektach obsluguja abort albo ignorowanie starych wynikow.
- [ ] Pochodne wartosci nie sa niepotrzebnie trzymane w state.
- [ ] Custom hook ma stabilny ksztalt zwracanej wartosci.
- [ ] Callbacki zwracane z hooka sa stabilne, jesli konsumenci moga na tym polegac.
- [ ] Hook ma test lub test komponentu, ktory pokrywa jego kluczowy behavior.

## Example snippets

```tsx
function useInterval(callback: () => void, delayMs: number | null) {
  const callbackRef = React.useRef(callback);

  React.useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  React.useEffect(() => {
    if (delayMs === null) return;

    const id = window.setInterval(() => callbackRef.current(), delayMs);
    return () => window.clearInterval(id);
  }, [delayMs]);
}
```

```tsx
function useLocalStorageState(key: string, initialValue: string) {
  const [value, setValue] = React.useState(initialValue);
  const [loadedKey, setLoadedKey] = React.useState<string | null>(null);

  React.useEffect(() => {
    const stored = window.localStorage.getItem(key);
    setValue(stored ?? initialValue);
    setLoadedKey(key);
  }, [key, initialValue]);

  React.useEffect(() => {
    if (loadedKey !== key) return;
    window.localStorage.setItem(key, value);
  }, [key, loadedKey, value]);

  return [value, setValue] as const;
}
```

```tsx
function useOnlineStatus() {
  return React.useSyncExternalStore(
    onStoreChange => {
      window.addEventListener('online', onStoreChange);
      window.addEventListener('offline', onStoreChange);
      return () => {
        window.removeEventListener('online', onStoreChange);
        window.removeEventListener('offline', onStoreChange);
      };
    },
    () => navigator.onLine,
    () => true
  );
}
```

## Trigger description

Hooki React: Rules of Hooks, useEffect, exhaustive deps, Strict Effects, useSyncExternalStore i custom hooks.
