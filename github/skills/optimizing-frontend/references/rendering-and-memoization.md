# Renderowanie i Memoizacja

Referencja dla ograniczania niepotrzebnej pracy renderowania bez pogarszania poprawności danych. Czytaj ją, gdy profil pokazuje częste re-rendery, drogie komponenty, niestabilne referencje, długie listy albo błędy wynikające z nadmiernego cache.

## Spis Treści

- [Reguły Renderowania](#reguły-renderowania)
- [Decyzja o Memoizacji](#decyzja-o-memoizacji)
- [Lokalność Stanu i Subskrypcje](#lokalność-stanu-i-subskrypcje)
- [Stabilne Klucze](#stabilne-klucze)
- [Wirtualizacja](#wirtualizacja)
- [Derived State](#derived-state)
- [Framework-Neutral Render Anti-Patterns](#framework-neutral-render-anti-patterns)
- [Checklista](#checklista)

## Reguły Renderowania

- Najpierw sprawdź profiler: który komponent renderuje się często, ile trwa render i dlaczego został wywołany.
- Usuń zbędną pracę przed dodaniem memoizacji: lokalizuj stan, ogranicz propsy, zmniejsz listę renderowanych elementów.
- Stabilizuj referencje tylko wtedy, gdy konsumuje je memoizowane dziecko, selector, provider albo kosztowny efekt zależny od referencji.
- Unikaj tworzenia nowych obiektów, tablic i funkcji w gorącej ścieżce renderowania, jeśli łamią memoizację niżej w drzewie.
- Render powinien być czysty: bez mutacji globalnego stanu, odczytów layoutu, requestów i zapisu refów poza dozwoloną leniwą inicjalizacją frameworka.

## Decyzja o Memoizacji

| Memoizuj gdy | Nie memoizuj gdy |
| --- | --- |
| Obliczenie jest kosztowne: sort/filter dużej listy, transformacja wykresu, agregacja. | Operacja jest trywialna: arytmetyka, konkatenacja, proste mapowanie kilku elementów. |
| Komponent renderuje się często z tymi samymi propsami i render jest mierzalnie drogi. | Komponent jest tani albo propsy zawsze się zmieniają. |
| Stabilna referencja callbacka jest wymagana przez memoizowane dziecko lub subskrypcję. | Handler jest lokalny i nie jest przekazywany dalej. |
| Wartość trafia do providera/contextu lub selectorów, które reagują na referencję. | Cache komplikuje invalidację i grozi stale data. |

Koszt memoizacji to pamięć, porównania i złożoność. Jeśli nie umiesz wskazać pomiaru lub konsumenta stabilnej referencji, prawdopodobnie jej nie potrzebujesz.

## Lokalność Stanu i Subskrypcje

- Trzymaj stan jak najbliżej miejsca użycia. Stan na szczycie drzewa zwiększa promień re-renderu.
- Dziel globalny store na selektywne subskrypcje/slice'y. Komponent nie powinien subskrybować całego store, jeśli potrzebuje jednego pola.
- Provider contextu z nowym obiektem `value` przy każdym renderze re-renderuje wszystkich konsumentów.
- Przenoś stan UI lokalny, np. hover, otwarcie małego panelu, tymczasowy input, poza globalny store.
- Dane z serwera trzymaj w cache zapytań, jeśli projekt go używa, a nie w ręcznie synchronizowanych kopiach wielu komponentów.

## Stabilne Klucze

- Klucz listy musi reprezentować tożsamość elementu: ID z bazy, UUID, stabilny slug albo inny niezmienny identyfikator.
- Nie używaj indeksu tablicy, gdy lista może być sortowana, filtrowana, wstawiana, usuwana lub reorderowana.
- Niestabilny klucz powoduje odmontowanie, utratę fokusu, reset lokalnego stanu i kosztowne ponowne renderowanie.
- Przy wirtualizacji klucz musi nadal identyfikować rekord, nie pozycję w oknie.

## Wirtualizacja

- Wirtualizuj listy/tabele z setkami lub tysiącami elementów, gdy DOM i render kosztują więcej niż logika danych.
- Zachowaj dostępność: prawidłowe role, etykiety, fokus, przewidywalny scroll i informacja o liczbie elementów, jeśli UI tego wymaga.
- Uważaj na dynamiczne wysokości wierszy; zły pomiar wysokości może powodować skoki scrolla i CLS.
- Dla danych serwerowych preferuj provider/paginację zamiast pobierania całej kolekcji do pamięci.
- Dodaj smoke case dla scrolla, filtrowania, reorder/delete i powrotu fokusu po interakcji.

## Derived State

- Nie duplikuj stanu, który można tanio wyliczyć z propsów lub danych cache.
- Nie używaj efektu tylko po to, aby skopiować props do state; to tworzy dodatkowy render i ryzyko rozjazdu.
- Cache'uj derived state tylko wtedy, gdy obliczenie jest kosztowne albo wynik musi mieć stabilną referencję.
- Przy sort/filter dużych list sprawdź, czy lepsze będzie filtrowanie po stronie serwera, paginacja lub worker.
- Ustal, kto jest źródłem prawdy. Memoizacja nie jest strategią synchronizacji danych.

## Framework-Neutral Render Anti-Patterns

| Antywzorzec | Skutek | Lepszy wzorzec |
| --- | --- | --- |
| Globalny stan dla lokalnego UI | Kaskadowe re-rendery całej aplikacji. | Stan lokalny albo selektywna subskrypcja. |
| Nowy obiekt konfiguracji w renderze | Dziecko widzi zmianę przy każdym cyklu. | Stała modułu albo memoizacja po pomiarze. |
| Indeks tablicy jako klucz | Reset stanu i fokusu przy reorder/delete. | Stabilny identyfikator rekordu. |
| Derived state kopiowany efektem | Dodatkowy render i stale data. | Wylicz podczas renderu albo cache'uj kosztowny wynik. |
| Memoizacja bez profilu | Więcej kodu, pamięci i porównań bez zysku. | Profil, hipoteza, mała zmiana, pomiar po. |
| Renderowanie pełnej listy 5000 elementów | Duży DOM, wolny layout i scroll. | Wirtualizacja albo paginacja. |
| Warunkowe ukrywanie ciężkiego komponentu CSS-em | Komponent nadal renderuje i wykonuje efekty. | Warunkowy mount/unmount lub lazy loading. |

## Checklista

```text
- [ ] Profiler wskazuje konkretny komponent, commit lub interakcję.
- [ ] Stan jest lokalny albo subskrypcja globalna jest selektywna.
- [ ] Memoizacja ma mierzalny powód i stabilne zależności.
- [ ] Klucze list są stabilne i nie bazują na indeksie dla zmiennych list.
- [ ] Długie listy mają wirtualizację/paginację i smoke case scrolla.
- [ ] Derived state nie dubluje źródła prawdy bez uzasadnienia.
- [ ] Po zmianie porównano render count/czas commitów przed i po.
```
