# Poprawność Renderowania

Referencja dla review błędów renderowania, stabilności tożsamości elementów, memoizacji, warunków, refów i stanu pochodnego. Czytaj ją, gdy PR dotyka list, render props, context providerów, conditional rendering, state derivation albo optymalizacji UI.

## Spis Treści

- [Stabilne Klucze](#stabilne-klucze)
- [Memoizacja](#memoizacja)
- [Stabilność Obiektów i Funkcji](#stabilność-obiektów-i-funkcji)
- [Renderowanie Warunkowe](#renderowanie-warunkowe)
- [Refy i Wartości Niereaktywne](#refy-i-wartości-niereaktywne)
- [Stan Pochodny](#stan-pochodny)
- [Czystość Renderu](#czystość-renderu)
- [Checklista](#checklista)

## Stabilne Klucze

Klucz listy reprezentuje tożsamość elementu. Używaj ID encji, UUID, stabilnego sluga albo innego trwałego identyfikatora.

Critical, jeśli dynamiczna lista używa indeksu jako klucza i elementy mogą być sortowane, filtrowane, dodawane, usuwane lub przestawiane. Skutki:

- mieszanie lokalnego stanu między wierszami;
- utrata fokusu po reorder/delete;
- błędne animacje i transition state;
- niepotrzebny unmount/remount;
- trudne do reprodukcji bugi formularzy w listach.

Indeks jest dopuszczalny tylko dla statycznej listy bez reordera, inserta, delete, filtrowania i lokalnego stanu elementów. Jeśli brak naturalnego ID, wygeneruj stabilne ID podczas tworzenia danych, nie w renderze.

## Memoizacja

Memoizacja jest narzędziem poprawności referencji i wydajności, nie domyślną dekoracją.

Oflaguj:

- memoizację trywialnych obliczeń bez profilu;
- `useMemo`/cache z niepełnymi zależnościami;
- `useCallback` dla handlera nieprzekazywanego dalej;
- `React.memo`/`ShouldRender` ukrywające stale data;
- custom compare ignorujący pola wpływające na UI;
- cache bez invalidacji po zmianie danych wejściowych.

Dobra memoizacja ma powód: kosztowne sort/filter, stabilna referencja wymagana przez memoizowane dziecko, provider/context value, selector albo obliczenie renderujące setki elementów.

## Stabilność Obiektów i Funkcji

Inline obiekty, tablice i funkcje tworzą nową referencję przy każdym renderze. To jest problem tylko wtedy, gdy referencja trafia do memoizowanego dziecka, providera, zależności efektu albo dużej listy.

Przykłady do review:

- `value={{ user, setUser }}` w providerze contextu;
- `options={[...]}` przekazywane do memoizowanego komponentu;
- `style={{ padding: 16 }}` w gorącej ścieżce listy;
- callback tworzony inline i przekazywany do wielu elementów listy;
- selector tworzony w renderze i subskrybujący store na nowo.

Poprawka zależy od lokalnego stylu: stała modułu, memoizacja, wydzielenie dziecka, lokalizacja stanu albo usunięcie zbędnej memoizacji u odbiorcy.

## Renderowanie Warunkowe

Warunki mają być czytelne i przewidywalne.

Preferuj:

- guard clauses / early returns dla statusów `loading`, `error`, `empty`;
- mapowanie statusu na komponent widoku, gdy liczba stanów rośnie;
- wydzielenie podkomponentu powyżej 2 poziomów zagnieżdżenia ternary;
- jawne fallbacki dla lazy loadingu i danych asynchronicznych;
- stabilne wymiary dla fallbacków, skeletonów i dynamicznych paneli.

Głęboko zagnieżdżony ternary jest zwykle `suggestion`, chyba że maskuje brak stanu błędu, pętlę renderowania albo nieosiągalny branch.

## Refy i Wartości Niereaktywne

Refy/pola niereaktywne są właściwe dla wartości, które nie powinny wywoływać renderu: ID timerów, poprzednia wartość do porównania, DOM element, mutable handle, worker, connection object.

Oflaguj dwa odwrotne błędy:

- ref przechowuje stan, który wpływa na UI i powinien wywołać render;
- state przechowuje wartość techniczną, która nie wpływa na UI i powoduje zbędne rendery.

W Blazor odpowiednikiem refów są prywatne pola komponentu i `ElementReference`. W React sprawdź `useRef`; w Vue `ref` może być reaktywny, więc oceń intencję według API frameworka.

## Stan Pochodny

Nie przechowuj w stanie wartości, którą można tanio wyliczyć z propsów, cache zapytań lub innego stanu.

Red flags:

- efekt kopiuje propsy do state tylko po to, aby odświeżyć UI;
- `total`, `filteredItems`, `isValid`, `fullName` są trzymane osobno i mogą się rozjechać;
- dane z serwera są kopiowane do lokalnego state, a potem ręcznie synchronizowane;
- cache/memoizacja nie ma pełnych zależności albo źródła prawdy.

Derived state może być uzasadniony, gdy obliczenie jest kosztowne, wynik musi mieć stabilną referencję albo użytkownik edytuje lokalny draft niezależny od źródła.

## Czystość Renderu

Render nie powinien wykonywać efektów ubocznych. Zgłaszaj jako `critical`, jeśli render lub funkcja obliczająca widok:

- wysyła request;
- zapisuje do `localStorage`, session storage, cookies lub globalnego store;
- mutuje obiekt wejściowy;
- rejestruje listener/subskrypcję;
- manipuluje DOM poza kontrolowanym API frameworka;
- generuje losowe ID używane jako key przy każdym renderze.

Czysty render upraszcza testy, SSR/hydration, Strict Mode i przewidywalność UI.

## Checklista

```text
- [ ] Dynamiczne listy mają stabilne klucze oparte o tożsamość elementu, nie indeks.
- [ ] Memoizacja ma powód i komplet zależności.
- [ ] Obiekty, tablice i callbacki są stabilne tam, gdzie referencja ma znaczenie.
- [ ] Renderowanie warunkowe jest czytelne i nie ukrywa brakujących stanów UI.
- [ ] Refy/pola niereaktywne i state są użyte zgodnie z intencją renderowania.
- [ ] Stan pochodny nie dubluje źródła prawdy bez uzasadnienia.
- [ ] Render jest czysty: brak requestów, zapisów, subskrypcji i mutacji.
```
