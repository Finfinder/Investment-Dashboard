# Architektura Komponentów - Implementing Frontend

Szczegółowe reguły projektowania granic komponentów, kompozycji, props API, stanu i fallbacków. Wczytaj tę referencję, gdy aktywny proces wymaga decyzji strukturalnych większych niż prosta implementacja pojedynczego komponentu.

## Spis treści

- [Granice komponentów](#granice-komponentów)
- [Kompozycja](#kompozycja)
- [Props API](#props-api)
- [Granice stanu](#granice-stanu)
- [Loading, error i empty](#loading-error-i-empty)
- [Error boundaries](#error-boundaries)
- [Checklista komponentu](#checklista-komponentu)

## Granice komponentów

Komponent powinien mieć jeden jasny powód do zmiany. Jeśli ta sama jednostka UI obsługuje pobieranie danych, transformację, układ, wiele niezależnych flow i efekty uboczne, rozdziel ją na container, komponent prezentacyjny, hook/composable albo serwis danych.

Stosuj te heurystyki:

- Komponent wielokrotnego użytku: ma stabilny kontrakt, jest konsumowany w kilku miejscach i nie zna szczegółów konkretnej strony.
- Komponent feature: zna język domeny danego ekranu, ale nie powinien zawierać ogólnego design systemu na nowo.
- Layout strony: organizuje regiony, routing i dane, ale nie powinien implementować detali prymitywów UI.
- Podkomponent prywatny: wydziela czytelność lub lokalny fragment UI, ale nie wymaga publicznego eksportu.

Rozważ dekompozycję, gdy komponent ma wiele niepowiązanych stanów, więcej niż kilka wariantów sterowanych booleanami, głębokie warunki renderowania albo trudny do przetestowania efekt uboczny.

## Kompozycja

Preferuj kompozycję nad konfiguracją. `children`, sloty, render props, `RenderFragment` i compound components pozwalają konsumentowi sterować strukturą bez dokładania kolejnych propsów do jednego komponentu.

Dobry komponent narzuca stabilną ramę i oddaje rozszerzalne miejsca kompozycji. Nie powinien wymagać głębokiego props drillingu tylko po to, aby jeden podkomponent otrzymał label, ikonę albo akcję.

Jeśli komponent ma więcej niż około siedem propsów, sprawdź, czy część z nich nie jest sygnałem do:

- wydzielenia wariantu domenowego;
- użycia slotu lub `children`;
- stworzenia compound components;
- przeniesienia logiki do hooka/composable;
- rozdzielenia komponentu container/presentation.

## Props API

Props API jest publicznym kontraktem komponentu. Musi być typowane, minimalne i stabilne.

Reguły:

- Używaj jawnych typów wejścia i wyjścia; unikaj `any` oraz nieopisanych struktur `Record<string, unknown>` dla danych UI.
- Callbacki nazwij od intencji użytkownika: `onSelect`, `onDismiss`, `onRetry`, nie od szczegółu implementacji.
- Boolean props są dobre dla jednego oczywistego stanu; kilka booleanów sterujących wariantem zamień na enum/union albo kompozycję.
- Ustal sensowne wartości domyślne tylko tam, gdzie nie ukrywają brakującego wymagania projektowego.
- Nie przepuszczaj losowego `...props` do elementów interaktywnych bez kontroli kolizji atrybutów, aria i handlerów.

## Granice stanu

| Rodzaj stanu | Użyj gdy | Unikaj gdy |
| --- | --- | --- |
| Lokalny stan komponentu | Dotyczy tylko jednego komponentu lub małego prywatnego subtree | Dwa niezależne ekrany muszą synchronizować tę samą wartość |
| Stan wyniesiony | 2-3 rodzeństwa muszą reagować na tę samą decyzję użytkownika | Prop drilling przechodzi przez wiele poziomów bez użycia pośredniego |
| Kontekst/DI | Głęboko konsumowany stan przekrojowy: theme, auth, locale, feature flags | Dane zmieniają się często i powodują szeroki re-render |
| Globalny store | Złożony stan aplikacyjny współdzielony przez wiele feature'ów | Lokalny toggle, otwarcie dropdowna albo stan formularza jednego komponentu |
| Cache serwera | Dane zdalne, invalidacja, refetch, optimistic updates | Czysty stan interakcji lokalnej bez źródła zdalnego |

Nie trzymaj dwóch źródeł prawdy. Stan pochodny wyliczaj podczas renderowania albo memoizuj, jeśli pomiar pokazuje koszt.

## Loading, error i empty

Każdy async UI ma trzy jawne ścieżki poza happy path:

- Loading: szkielet, spinner albo placeholder dopasowany do gęstości UI i dostępności.
- Error: zrozumiały komunikat, brak wycieku technicznych szczegółów oraz akcja odzyskania, np. retry, reset albo link do poprzedniego widoku.
- Empty: pomocna informacja o braku danych, najlepiej z następną sensowną akcją użytkownika.

Te stany powinny zachowywać wymiary layoutu na tyle stabilnie, aby nie powodować skoków UI i nakładania treści.

## Error boundaries

Boundary umieszczaj blisko ryzykownego subtree, nie tylko globalnie. Szczególnie dotyczy to komponentów zależnych od danych zdalnych, chartów, edytorów, map, lazy loaded widgets i integracji z bibliotekami spoza design systemu.

Boundary nie zwalnia z obsługi błędów asynchronicznych. Requesty, event handlers, subskrypcje i integracje API potrzebują własnego try/catch, stanu błędu UI albo mechanizmu biblioteki danych.

## Checklista komponentu

```text
- [ ] Odpowiedzialność komponentu jest jedna i nazwana.
- [ ] Props API jest typowane, stabilne i nie używa `any`.
- [ ] Kompozycja zastępuje rozrost wariantów tam, gdzie konsumenci potrzebują elastyczności.
- [ ] Stan znajduje się najbliżej miejsca użycia i nie tworzy drugiego źródła prawdy.
- [ ] Async UI ma loading, error i empty.
- [ ] Ryzykowne subtree ma boundary albo jawny fallback.
- [ ] Reużywalna logika lifecycle/cleanup jest w hooku/composable albo serwisie, nie w prezentacji.
```
