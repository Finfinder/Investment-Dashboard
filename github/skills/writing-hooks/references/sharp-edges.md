# Sharp Edges - Pisanie Hooków

Produkcyjne pułapki hooków, composables i analogicznych jednostek reużywalnej logiki UI. Ładuj tę referencję, gdy widzisz antywzorzec, wyciek zasobu, stale data albo niejasny kontrakt API.

## Spis Treści

- [SE-01: Mega-hook przejmuje zbyt wiele odpowiedzialności](#se-01-mega-hook-przejmuje-zbyt-wiele-odpowiedzialności)
- [SE-02: Wyłączone dependency rules ukrywają stale closures](#se-02-wyłączone-dependency-rules-ukrywają-stale-closures)
- [SE-03: Brak cleanupu zostawia zasoby po unmount](#se-03-brak-cleanupu-zostawia-zasoby-po-unmount)
- [SE-04: Krotka ukrywa znaczenie zwracanych wartości](#se-04-krotka-ukrywa-znaczenie-zwracanych-wartości)
- [SE-05: useEffect data fetching omija warstwę cache](#se-05-useeffect-data-fetching-omija-warstwę-cache)
- [SE-06: Over-memoization zwiększa złożoność bez pomiaru](#se-06-over-memoization-zwiększa-złożoność-bez-pomiaru)
- [SE-07: Efekty uboczne w renderze powodują niestabilne UI](#se-07-efekty-uboczne-w-renderze-powodują-niestabilne-ui)
- [SE-08: Starszy async nadpisuje nowszy stan](#se-08-starszy-async-nadpisuje-nowszy-stan)

### SE-01: Mega-hook przejmuje zbyt wiele odpowiedzialności

**Severity:** HIGH
**Stack:** React, Vue, Blazor UI

**Sytuacja:** Hook ma wiele flag trybu, 5+ opcji konfiguracyjnych albo zwraca duży zestaw niepowiązanych pól.

**Dlaczego to boli:** Konsumenci płacą za logikę, której nie potrzebują, a zmiana jednej ścieżki psuje inne przypadki.

**Rozwiązanie:** Rozbij na hooki atomowe/molekularne i zostaw osobny hook koordynujący tylko dla realnie wspólnego flow.

```text
useSearchState + useDebounce + useSearchResults zamiast jednego useSearchEverything
```

**Symptomy:** Boolean flags typu `withX`, `enableY`, `mode`, wielkie obiekty return, trudne testy setupu.

**Regex detekcji:** `use[A-Za-z0-9_]+\([^)]*(options|config|mode|enabled|with)`

### SE-02: Wyłączone dependency rules ukrywają stale closures

**Severity:** HIGH
**Stack:** React, Vue, reactive UI

**Sytuacja:** Kod wycisza `exhaustive-deps`, `rules-of-hooks` albo analogiczny linter bez lokalnego uzasadnienia i testu.

**Dlaczego to boli:** Efekt może czytać stare propsy, stan lub callback i generować stale data trudne do odtworzenia.

**Rozwiązanie:** Uzupełnij zależności, wydziel stabilne API albo przebuduj efekt tak, aby cykl był jawny.

```typescript
useEffect(() => subscribe(userId, handler), [userId, handler]);
```

**Symptomy:** Komponent reaguje dopiero po drugim kliknięciu, pokazuje stare dane albo działa inaczej po hot reload.

**Regex detekcji:** `eslint-disable.*(exhaustive-deps|rules-of-hooks)`

### SE-03: Brak cleanupu zostawia zasoby po unmount

**Severity:** CRITICAL
**Stack:** React, Vue, Blazor UI

**Sytuacja:** Hook tworzy timer, listener, subskrypcję, observer, WebSocket albo request bez cleanupu.

**Dlaczego to boli:** Powstają memory leaks, podwójne handlery, aktualizacje po unmount i losowe błędy w długich sesjach.

**Rozwiązanie:** Cleanup wykonuj przy unmount/dispose i przy zmianie zależności; używaj `AbortController`, `onScopeDispose`, `Dispose` albo odpowiednika frameworka.

```typescript
return () => controller.abort();
```

**Symptomy:** Warningi o update po unmount, rosnąca liczba listenerów, powtarzające się requesty.

**Regex detekcji:** `(addEventListener|setInterval|setTimeout|subscribe|new WebSocket|new AbortController)`

### SE-04: Krotka ukrywa znaczenie zwracanych wartości

**Severity:** MEDIUM
**Stack:** React, Vue composables

**Sytuacja:** Hook zwraca `[a, b, c, d]` lub tuple, której znaczenie zna tylko autor.

**Dlaczego to boli:** Konsument łatwo pomyli kolejność, a dodanie pola jest breaking change.

**Rozwiązanie:** Dla 3+ wartości zwróć obiekt z nazwanymi polami.

```typescript
return { value, setValue, reset, isDirty };
```

**Symptomy:** Destrukturyzacja z pomijaniem elementów, nazwy lokalne niezgodne z semantyką, komentarze tłumaczące kolejność.

**Regex detekcji:** `return \[[^\]]*,[^\]]*,[^\]]+\]`

### SE-05: useEffect data fetching omija warstwę cache

**Severity:** HIGH
**Stack:** React, Vue, client data libraries

**Sytuacja:** Hook ręcznie pobiera dane w efekcie, mimo że repo ma TanStack Query, SWR, Apollo, RTK Query, Vue Query albo ustaloną warstwę danych.

**Dlaczego to boli:** Tracisz cache, deduplikację, retry, invalidation, SSR/hydration rules i spójne stany błędów.

**Rozwiązanie:** Owiń istniejącą bibliotekę w domenowy hook i mapuj jej kontrakt na lokalny return shape.

```typescript
return useQuery({ queryKey: ["profile", userId], enabled: Boolean(userId), queryFn });
```

**Symptomy:** Duplikowane requesty, niespójne loading/error, ręczne flagi `isMounted`, brak invalidation.

**Regex detekcji:** `useEffect\([^)]*(fetch|axios|client\.|http\.)`

### SE-06: Over-memoization zwiększa złożoność bez pomiaru

**Severity:** MEDIUM
**Stack:** React, Vue, Blazor UI

**Sytuacja:** Każda funkcja i wartość jest memoizowana, mimo że nie trafia do memoizowanych konsumentów ani kosztownych zależności.

**Dlaczego to boli:** Kod staje się trudniejszy, zależności są podatne na błędy, a wydajność może się pogorszyć.

**Rozwiązanie:** Stabilizuj tylko publiczne callbacki/wartości, których konsumenci realnie potrzebują, lub po pomiarze.

```text
Memoizacja jest kontraktem konsumenta albo wynikiem pomiaru, nie stylem domyślnym.
```

**Symptomy:** Długie dependency arrays, `useMemo` wokół prostych obliczeń, custom compare ukrywające zmiany.

**Regex detekcji:** `(useMemo|useCallback)\(`

### SE-07: Efekty uboczne w renderze powodują niestabilne UI

**Severity:** CRITICAL
**Stack:** React, Vue, Blazor UI

**Sytuacja:** Ciało hooka/composable albo render komponentu robi request, zapis do storage, subskrypcję, dispatch albo losową mutację.

**Dlaczego to boli:** Render przestaje być deterministyczny, Strict Mode ujawnia podwójne efekty, a UI staje się zależne od kolejności renderów.

**Rozwiązanie:** Przenieś efekt uboczny do lifecycle/effect API albo handlera zdarzenia.

```text
Render wylicza; lifecycle i handlery wykonują skutki uboczne.
```

**Symptomy:** Requesty przy każdym renderze, inne zachowanie w dev/prod, stan zmienia się bez interakcji.

**Regex detekcji:** `(localStorage\.setItem|sessionStorage\.setItem|dispatch\(|fetch\()`

### SE-08: Starszy async nadpisuje nowszy stan

**Severity:** HIGH
**Stack:** React, Vue, Blazor UI

**Sytuacja:** Hook odpala async po zmianie parametrów, ale nie anuluje starszej operacji ani nie ignoruje starego wyniku.

**Dlaczego to boli:** Użytkownik widzi dane dla poprzedniego filtra, profilu lub trasy.

**Rozwiązanie:** Użyj `AbortController`, `CancellationTokenSource`, cleanupu watchera albo identyfikatora generacji.

```typescript
if (requestId !== latestRequestId.current) return;
```

**Symptomy:** Dane migają, wyniki wyszukiwania nie pasują do query, testy są niestabilne przy opóźnieniach.

**Regex detekcji:** `(then\(|await ).*(set[A-Z]|\.value\s*=)`
