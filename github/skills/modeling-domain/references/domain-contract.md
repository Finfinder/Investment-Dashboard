# Kontrakt Domenowy - modeling-domain

Referencja opisuje, jak używać `domain.md` i wyników `system-modularising` jako wejścia do taktycznego modelowania DDD.

## Spis treści

- [Rola domain.md](#rola-domainmd)
- [Co wyciągnąć z system-modularising](#co-wyciągnąć-z-system-modularising)
- [Ubiquitous language](#ubiquitous-language)
- [Bounded contexts](#bounded-contexts)
- [Agregaty i inwarianty](#agregaty-i-inwarianty)
- [Zdarzenia i kontrakty](#zdarzenia-i-kontrakty)
- [Minimalny wynik modelowania](#minimalny-wynik-modelowania)
- [Gdy brakuje wejścia](#gdy-brakuje-wejścia)

## Rola domain.md

`domain.md` jest kontraktem wejściowym dla taktycznego DDD. Nie jest ozdobnikiem dokumentacyjnym: stabilizuje język, granice i odpowiedzialności, zanim powstaną klasy domenowe.

**Używaj `domain.md`, aby:**

- ustalić, w którym bounded context pracujesz;
- zachować nazwy z ubiquitous language w kodzie;
- odróżnić procesy biznesowe od integracji technicznych;
- wskazać kandydatów na agregaty i zdarzenia;
- wykryć miejsca, gdzie model taktyczny zaczyna przekraczać granicę kontekstu.

## Co wyciągnąć z system-modularising

| Wejście strategiczne | Jak użyć w modelowaniu taktycznym |
| --- | --- |
| Bounded contexts | Ogranicz model do jednego języka i odpowiedzialności |
| Kandydaci na agregaty | Zweryfikuj przez inwarianty i granice transakcji |
| Procesy biznesowe | Przekształć w commands, metody root i domain events |
| Kontrakty modułów | Nazwij eventy, ACL, shared kernel albo API między kontekstami |
| Macierz odpowiedzialności | Unikaj God Aggregate i klas globalnych |
| Zdarzenia domenowe | Ustal fakty w czasie przeszłym i dane payloadu |
| Polityki/reguły | Wydziel Domain Policy, Value Object albo metodę agregatu |

Jeśli output strategiczny jest zbyt ogólny, nie zgaduj granic. Wróć do `system-modularising` z pytaniami o proces, słownik, ownership danych i punkty integracji.

## Ubiquitous language

Język wszechobecny powinien przechodzić z dokumentu do kodu bez tłumaczenia na techniczne synonimy.

**Sprawdź:**

- Czy nazwy klas, metod, eventów i błędów używają terminów domenowych?
- Czy ten sam termin ma to samo znaczenie w danym bounded context?
- Czy terminy wieloznaczne są rozdzielone między konteksty?
- Czy nazwy metod są operacjami biznesowymi, np. `approve`, `reserve`, `settle`, zamiast `updateStatus`?
- Czy wyjątki/Result errors mówią językiem reguł domenowych?

## Bounded contexts

Model taktyczny powstaje wewnątrz jednego bounded context. Ta sama koncepcja może mieć inną reprezentację w innym kontekście.

**Zasady:**

- Nie współdziel wewnętrznych encji między kontekstami.
- Na granicach stosuj ACL, eventy integracyjne, DTO albo shared kernel o minimalnym zakresie.
- Nie pozwól, aby potrzeby raportu lub UI rozszerzały agregat poza język kontekstu.
- W kodzie utrzymuj osobne namespace/pakiety zgodne z kontekstami.

**Przykład językowy:**

| Termin | Kontekst | Model |
| --- | --- | --- |
| Klient | Sprzedaż | Kupujący z preferencjami i limitem zamówień |
| Klient | Fakturacja | Płatnik z danymi podatkowymi |
| Produkt | Katalog | Opis, kategorie, cena bazowa |
| Produkt | Magazyn | SKU, lokalizacja, dostępność |

## Agregaty i inwarianty

Kandydat na agregat z `domain.md` wymaga weryfikacji taktycznej.

**Dla każdego agregatu zapisz:**

- nazwę aggregate root;
- odpowiedzialność w języku domeny;
- inwarianty natychmiastowej spójności;
- obiekty wewnętrzne i value objects;
- referencje do innych agregatów po ID;
- events emitowane przez root;
- repozytorium per root;
- scenariusze odmowy zmiany stanu.

## Zdarzenia i kontrakty

Zdarzenia domenowe i kontrakty między kontekstami powinny wynikać z procesu biznesowego, nie z potrzeb technicznych kolejek.

**Dobre eventy:**

- opisują fakt po zmianie stanu: `OrderPlaced`, `PaymentCaptured`, `ShipmentRequested`;
- zawierają ID i dane zdarzenia wymagane przez handlerów;
- są niemutowalne i możliwe do wersjonowania;
- nie przenoszą całego aggregate root ani obiektów ORM;
- mają jasnego właściciela w bounded context.

**Kontrakty między kontekstami:**

- nazwij producenta i konsumentów;
- opisz payload, wersję i semantykę zdarzenia;
- wskaż wymagania idempotencji i retry;
- rozróżnij domain event wewnątrz kontekstu od integration event na zewnątrz.

## Minimalny wynik modelowania

Po użyciu tego skilla wynik powinien zawierać co najmniej:

- nazwę bounded contextu i link/odwołanie do `domain.md`;
- słownik kluczowych terminów domenowych;
- listę agregatów z rootami i inwariantami;
- value objects i encje wewnętrzne;
- repozytoria per aggregate root;
- domain events i ich minimalne payloady;
- decyzje o CQRS/read model, jeśli są potrzebne;
- znane kompromisy i miejsca wymagające `engineering-databases` albo `implementing-backend`.

## Gdy brakuje wejścia

Nie zaczynaj od klas, jeśli brakuje strategicznego kontekstu.

**Eskaluj do `system-modularising`, gdy:**

- nie wiadomo, które bounded contexts istnieją;
- ten sam termin ma kilka znaczeń, ale nie wiadomo gdzie przebiegają granice;
- proces przechodzi przez wiele zespołów, modułów albo źródeł danych;
- kandydaci na agregaty są listą tabel albo ekranów UI;
- `domain.md` jest nieaktualny wobec kodu.

**Możesz kontynuować warunkowo, gdy:**

- zadanie dotyczy małej zmiany w istniejącym, dobrze nazwanym kontekście;
- repozytorium ma już jednoznaczne moduły domenowe i testy inwariantów;
- użytkownik dostarczył reguły biznesowe oraz granice odpowiedzialności w promptcie zadania.
