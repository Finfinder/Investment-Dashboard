# Kontrakt API i Kompozycja Hooków

Szczegóły projektowania publicznego API hooków, composables i analogicznych jednostek logiki UI. Ładuj tę referencję, gdy trzeba zdecydować nazwę, wejścia, kształt zwracanej wartości, stabilność kontraktu albo poziom kompozycji.

## Spis Treści

- [Nazewnictwo](#nazewnictwo)
- [Parametry i options object](#parametry-i-options-object)
- [Return shape](#return-shape)
- [Stabilny publiczny API](#stabilny-publiczny-api)
- [Poziomy kompozycji](#poziomy-kompozycji)
- [Kompozycja hooków](#kompozycja-hooków)

## Nazewnictwo

Stosuj konwencję frameworka projektu. W React i Vue konwencją jest prefiks `use` + opisowy rzeczownik lub czasownik. W Blazor ta sama rola może mieć nazwę serwisu stanu, klasy bazowej albo code-behind, ale nazwa nadal opisuje zachowanie, nie mechanizm.

| Wzorzec | Przykład | Zastosowanie |
| --- | --- | --- |
| `use` + rzeczownik | `useDebounce`, `useMediaQuery` | Zwraca wartość pochodną lub obserwowaną |
| `use` + czasownik | `useToggle`, `useFetchState` | Zwraca wartość i akcje |
| `use` + domena | `useAuth`, `useCart` | Komponuje logikę domenową lub stan aplikacji |

Dobre nazwy mówią, co konsument może zrobić: `useLocalStorage`, `useKeyboardShortcut`, `useRouteFocus`. Słabe nazwy ujawniają implementację: `useBrowserEffect`, `useInternalListener`.

## Parametry i options object

Dla 1-2 prostych wejść argumenty pozycyjne są czytelne. Dla 3+ parametrów, wartości opcjonalnych albo API, które będzie ewoluować, preferuj pojedynczy obiekt opcji.

```typescript
const useDebounce = ({ value, delay, leading = false }: UseDebounceOptions) => {
  // ...
};
```

Obiekt opcji pozwala dodać nowe ustawienia bez łamania istniejących miejsc użycia, ułatwia wartości domyślne i zmniejsza ryzyko pomylenia argumentów pozycyjnych.

## Return shape

Kształt zwracanej wartości jest publicznym kontraktem. Wybieraj go pod kątem czytelności konsumenta, nie krótszej implementacji.

| Typ zwracanej wartości | Kiedy | Przykład |
| --- | --- | --- |
| Pojedyncza wartość | Hook oblicza jedną rzecz | `debouncedValue` |
| Para o utrwalonej konwencji | Bardzo mały hook zgodny z lokalnym idiomem | `[value, setValue]` |
| Obiekt | 3+ wartości, akcje, stany async, API rozwijane w czasie | `{ data, error, isPending, refetch }` |

Dla 3+ wartości używaj obiektu lub nazwanych pól. Krotki są kruche, gdy dochodzą nowe wartości, a kolejność nie ma oczywistego znaczenia.

## Stabilny publiczny API

Stabilność API oznacza dwa różne tematy:

- stabilność semantyczna: pola i akcje znaczą to samo między wersjami hooka;
- stabilność referencyjna: callbacki albo obiekty nie zmieniają tożsamości bez potrzeby.

Nie memoizuj wszystkiego odruchowo. Stabilizuj callbacki i wartości wtedy, gdy konsumenci przekazują je do zmemoizowanych komponentów, providerów, watcherów, efektów albo kosztownych list. Jeśli konsument nie zależy od stabilnej referencji, proste API bywa lepsze niż memoizacja dla samej memoizacji.

## Poziomy kompozycji

| Poziom | Zakres | Zależności | Przykłady |
| --- | --- | --- | --- |
| Atom | Lokalny stan UI, media queries, klawiatura, DOM | Bez danych zdalnych i bez globalnej orkiestracji | `useToggle`, `useMediaQuery`, `useKeyPress` |
| Molekuła | Koordynuje kilka atomów lub lekką logikę UI | Inne atomy i lokalny kontekst | `useFormField`, `usePagination`, `useDebouncedSearch` |
| Organizm | Logika domenowa, dane zdalne, mutacje, cache | Może opakowywać bibliotekę danych i atomy UI | `useUserProfile`, `useSearchResults` |

Atom nie powinien importować biblioteki pobierania danych. Molekuła nie powinna potajemnie stawać się warstwą danych. Organizm może dotykać danych zdalnych, ale powinien respektować istniejącą warstwę cache lub query clienta w repo.

## Kompozycja hooków

Kompozycja jest preferowaną odpowiedzią na rosnący zakres. Jeśli hook zaczyna przyjmować wiele flag trybu, rozbij go na mniejsze jednostki i zbuduj hook koordynujący.

```typescript
const useDebouncedSearch = ({ storageKey, delay }: Options) => {
  const { value: query, setValue: setQuery } = useLocalStorage(storageKey, "");
  const debouncedQuery = useDebounce({ value: query, delay });

  return { query, setQuery, debouncedQuery };
};
```

Hook koordynujący może łączyć atomy, ale nie powinien ukrywać niepowiązanych odpowiedzialności. Jeśli konsumenci potrzebują tylko części zachowania, ekspozycja mniejszych hooków często jest lepsza niż jeden mega-hook.
