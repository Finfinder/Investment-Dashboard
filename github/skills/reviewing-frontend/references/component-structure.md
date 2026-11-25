# Struktura Komponentów

Referencja dla przeglądu komponentów UI w skillu `reviewing-frontend`. Czytaj ją, gdy PR dotyka komponentów, propsów, kompozycji, stanów UI albo organizacji eksportów.

## Spis Treści

- [Pojedyncza Odpowiedzialność](#pojedyncza-odpowiedzialność)
- [Projekt Propsów](#projekt-propsów)
- [Kompozycja](#kompozycja)
- [Lokalizacja Stanu](#lokalizacja-stanu)
- [Stany Loading, Error i Empty](#stany-loading-error-i-empty)
- [Nazewnictwo i Eksporty](#nazewnictwo-i-eksporty)
- [Progi Podziału Komponentu](#progi-podziału-komponentu)
- [Checklista](#checklista)

## Pojedyncza Odpowiedzialność

Komponent powinien mieć jeden czytelny powód zmiany. Jeżeli plik jednocześnie pobiera dane, transformuje je, obsługuje formularz, zarządza modalem i renderuje szczegółowy layout, review powinien wskazać rozdzielenie odpowiedzialności.

Sygnały naruszenia SRP:

- nazwa zawiera `And`, `With`, `Manager`, `Handler` bez jasnego powodu;
- komponent miesza data fetching, transformację i prezentację;
- wiele niepowiązanych zmiennych stanu opisuje różne przepływy UI;
- część JSX/Razor/template można nazwać osobnym pojęciem domenowym;
- test komponentu wymaga mockowania wielu niepowiązanych zależności.

Preferuj podział według zachowania użytkownika i granic domenowych, nie według arbitralnej liczby linii. Progi z tej referencji są sygnałami do review, nie automatycznym nakazem refaktoru.

## Projekt Propsów

Propsy są kontraktem komponentu. Dobre propsy są minimalne, dobrze typowane i opisują intencję konsumenta, nie wewnętrzną implementację.

Sprawdzaj:

- Czy propsy reprezentują stabilny model domenowy lub wariant UI?
- Czy komponent nie wymaga przekazywania dużego obiektu konfiguracyjnego tylko po to, aby ukryć brak kompozycji?
- Czy wiele booleanów tworzy niejawne stany sprzeczne, np. `isLoading`, `isDisabled`, `isSelected`, `isExpanded`?
- Czy lepszy byłby enum/status (`status: 'idle' | 'loading' | 'error' | 'ready'`) albo union typów?
- Czy wartości domyślne są jawne i bezpieczne?
- Czy callbacki mają nazwy od zdarzenia domenowego (`onOrderSelected`) zamiast od implementacji (`handleClick`)?

Nadmiar propsów nie zawsze oznacza błąd, ale 7+ propsów zwykle wymaga pytania, czy komponent nie próbuje być kilkoma komponentami naraz.

## Kompozycja

Kompozycja daje konsumentom możliwość składania UI bez rozrastania propsów i wariantów.

Preferuj:

- `children`, sloty lub render props, gdy konsument ma kontrolować część zawartości;
- compound components dla złożonych, powtarzalnych struktur, np. `Tabs.Root`, `Tabs.List`, `Tabs.Panel`;
- małe komponenty prezentacyjne zamiast jednego komponentu z wieloma warunkami layoutu;
- jawne API wariantów tylko wtedy, gdy warianty są zamkniętym zbiorem projektowym.

Oflaguj komponent, który przyjmuje rozbudowany obiekt `config`, mapuje go na wiele przypadków UI i przez to staje się prywatnym DSL-em layoutu.

## Lokalizacja Stanu

Stan powinien żyć możliwie blisko miejsca użycia. Podnoszenie stanu bez realnej potrzeby zwiększa promień re-renderu i utrudnia zrozumienie przepływu danych.

Reguły review:

- Stan używany przez jedno dziecko powinien żyć w tym dziecku.
- Stan współdzielony przez bliskie rodzeństwo może żyć w najbliższym wspólnym rodzicu.
- Stan używany przez odległe fragmenty drzewa może należeć do contextu/store, ale subskrypcje powinny być selektywne.
- Stan serwerowy trzymaj w cache zapytań, jeśli projekt ma taki wzorzec, a nie w ręcznie synchronizowanych kopiach.
- Tymczasowy stan UI, np. hover, otwarty panel, draft input, zwykle nie należy do globalnego store.

## Stany Loading, Error i Empty

Każdy komponent zależny od danych musi mieć komplet stanów użytkownika:

| Stan | Co sprawdzić | Typowy problem |
| --- | --- | --- |
| Loading | Czy użytkownik dostaje stabilny feedback i brak skoku layoutu? | Pusty ekran albo fallback bez wymiarów. |
| Error | Czy błąd jest widoczny, możliwy do zrozumienia i zgodny z lokalnym wzorcem? | Ciche `null`, toast bez kontekstu albo brak retry. |
| Empty | Czy brak danych ma własny stan, inny niż błąd? | Pusta tabela bez komunikatu i akcji. |

Dla krytycznych przepływów brak error state jest zwykle `warning`. Dla interakcji blokującej zadanie użytkownika może być `critical`, jeśli uniemożliwia użycie flow.

## Nazewnictwo i Eksporty

Nazwy komponentów mają opisywać renderowaną rzecz lub rolę w UI: `UserProfileCard`, `OrderStatusBadge`, `PortfolioSummary`. Unikaj ogólników typu `DataDisplay`, `Wrapper`, `Container`, chyba że komponent naprawdę jest tylko layout containerem.

Named exports są domyślnie preferowane, bo utrzymują spójne nazwy importów i ułatwiają refaktoryzację. Default export traktuj jako `suggestion`, chyba że repozytorium ma inną utrwaloną konwencję.

## Progi Podziału Komponentu

| Sygnał | Próg review | Co rozważyć |
| --- | --- | --- |
| Długość pliku | > 300 linii | Wydzielenie podkomponentów, hooka/composable albo funkcji transformującej dane. |
| Liczba propsów | > 7 propsów | Status/union, compound component, kompozycja przez children/sloty. |
| Zmienne stanu | > 5 niezależnych deklaracji | Reduktor, lokalizacja stanu, podział flow. |
| Efekty uboczne | > 3 efekty/watchery | Wydzielenie hooka/composable albo uporządkowanie lifecycle. |
| Warunki renderowania | > 2 poziomy zagnieżdżenia | Guard clauses, podkomponenty, mapowanie statusu na widok. |
| Mieszane odpowiedzialności | Fetch + transformacja + render w jednym pliku | Container/presenter, server data hook, mapper. |

Progi mają wywołać rozmowę z konkretnym przykładem ryzyka: trudny test, ukryty stan, render bug, brak obsługi błędu lub rosnący koszt utrzymania.

## Checklista

```text
- [ ] Komponent ma jedną czytelną odpowiedzialność.
- [ ] Propsy są minimalne, typowane i nie tworzą sprzecznych boolean states.
- [ ] Kompozycja zastępuje konfigurację tam, gdzie konsumenci potrzebują elastyczności.
- [ ] Stan jest możliwie blisko miejsca użycia i nie zwiększa niepotrzebnie re-renderów.
- [ ] Obsłużono loading, error i empty dla danych asynchronicznych.
- [ ] Nazwy komponentów i callbacków opisują domenę UI.
- [ ] Eksporty są zgodne z lokalną konwencją; default exporty są świadome.
- [ ] Progi podziału komponentu zostały ocenione z ryzykiem, nie mechanicznie.
```
