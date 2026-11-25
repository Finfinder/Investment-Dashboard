# Niskopoziomowa Dekompozycja Domenowa

Szczegóły dekompozycji modułów na agregaty, encje, value objects, zdarzenia, polityki, domain services, archetypy biznesowe i jednostki spójności.

## Spis Treści

- [Workflow](#workflow)
- [Building Blocks](#building-blocks)
- [Jednostki Spójności](#jednostki-spójności)
- [Polityki i Reguły](#polityki-i-reguły)
- [Archetypy Biznesowe](#archetypy-biznesowe)
- [Autonomia Modułu](#autonomia-modułu)
- [Kiedy Delegować Do Modeling Domain](#kiedy-delegować-do-modeling-domain)

## Workflow

Dla każdego bounded context lub modułu:

1. Nazwij główną zdolność biznesową i język modułu.
2. Wskaż aggregate roots jako granice transakcyjne i właścicieli invariantów.
3. Rozdziel encje od value objects po tożsamości i cyklu życia.
4. Zidentyfikuj domain events jako fakty publikowane poza moduł.
5. Wyodrębnij polityki i domain services tylko wtedy, gdy reguła nie pasuje naturalnie do encji albo agregatu.
6. Sprawdź, które elementy zmieniają się razem, są używane razem i muszą być spójne razem.
7. Zapisz model w `domain.md` bez zmiany sekcji szablonu.

## Building Blocks

| Element | Rola | Pytanie kontrolne | Pułapka |
| --- | --- | --- | --- |
| Aggregate root | Jedyny punkt wejścia do spójnej transakcji | Kto pilnuje invariantów? | Zbyt duży agregat blokujący autonomię |
| Entity | Obiekt z tożsamością i cyklem życia | Czy tożsamość trwa mimo zmiany pól? | Encje udostępniane między modułami |
| Value object | Niemutowalna wartość opisana atrybutami | Czy równość wynika z wartości? | VO z ukrytą tożsamością lub mutacją |
| Domain event | Fakt domenowy po zmianie stanu | Co już się wydarzyło i kogo to interesuje? | Event jako komenda ukrywająca coupling |
| Policy | Decyzja biznesowa oparta na regułach | Kiedy reguła może się zmienić niezależnie? | Rozproszone if-y w wielu modułach |
| Domain service | Operacja domenowa bez naturalnego właściciela | Czy logika naprawdę nie należy do agregatu? | Anemiczny model i service god object |
| Repository | Kontrakt persystencji agregatu | Czy zapis/odczyt dotyczy aggregate root? | Repozytorium dla każdej tabeli |

## Jednostki Spójności

Jednostka spójności to grupa elementów, które muszą zachowywać invariant razem. Może wskazywać agregat, moduł albo potrzebę zmiany granicy.

Analizuj:

- invarianty biznesowe: co musi być prawdziwe po każdej komendzie;
- transakcje: co musi zostać zapisane atomowo;
- lifecycle: co powstaje, zmienia się i wygasa razem;
- użycie: co jest ładowane i modyfikowane razem w typowych przypadkach użycia;
- częstotliwość zmian: co zmienia się w tych samych commitach lub ticketach;
- źródło prawdy: kto jest właścicielem zapisu, a kto projekcji.

Jeśli invariant przecina dwa moduły, rozważ scalenie, zmianę granicy agregatu, eventual consistency albo przeniesienie reguły do jednego właściciela.

## Polityki i Reguły

Polityki nadają nazwę decyzjom biznesowym, które mogą ewoluować bez zmiany podstawowego lifecycle agregatu.

| Typ polityki | Przykład | Wskazówka granicy |
| --- | --- | --- |
| Eligibility | Czy klient może dostać rabat? | Często należy do modułu reguł lub pricingu |
| Allocation | Jak przydzielić zasób? | Właścicielem jest moduł mający source of truth zasobu |
| Validation | Czy komenda jest dopuszczalna? | Zwykle blisko aggregate root |
| Routing | Gdzie skierować sprawę/proces? | Może wskazywać osobny workflow context |
| Compliance | Czy operacja spełnia reguły prawne? | Często wymaga jawnego audytu i ownership |

Nie twórz polityk jako workarounds dla złej granicy modułu. Jeśli polityka musi znać wewnętrzny stan wielu modułów, najpierw przetestuj granicę.

## Archetypy Biznesowe

Archetypy pomagają wykryć brakujące typy domenowe:

| Archetyp | Znaczenie | Przykłady |
| --- | --- | --- |
| Party | Osoba lub organizacja | Customer, Supplier, Broker |
| Place | Lokalizacja fizyczna lub logiczna | Warehouse, Region, AccountLocation |
| Thing | Przedmiot lub zasób | Product, Instrument, Vehicle |
| Description | Specyfikacja lub typ | ProductCatalogItem, PlanDefinition |
| Role | Rola pełniona w kontekście | AccountOwner, Approver, Trader |
| Moment-Interval | Zdarzenie, okres, proces w czasie | Order, Subscription, Shipment |

Jeśli nazwa modułu jest tylko techniczna, archetypy często ujawniają brak języka domenowego.

## Autonomia Modułu

Oceń autonomię w trzech wymiarach:

| Wymiar | Pytanie | Sygnał problemu |
| --- | --- | --- |
| Autonomia zmian | Czy moduł może zmieniać reguły bez zmiany innych modułów? | Każda zmiana wymaga edycji wspólnych typów |
| Autonomia decyzji | Czy właściciel może decydować o modelu i API? | Decyzje są rozproszone między zespołami |
| Autonomia deploymentu | Czy runtime może być wdrożony lub skalowany niezależnie, jeśli to cel? | Wspólna baza i synchroniczne zależności blokują release |

Autonomia deploymentu nie jest zawsze wymagana. Dla modularnego monolitu ważniejsza może być autonomia zmian i decyzji przy wspólnym deploymencie.

## Kiedy Delegować Do Modeling Domain

Użyj `modeling-domain`, gdy zadanie przechodzi od granic modułów do implementacji taktycznego DDD:

- projektowanie agregatów, encji, value objects, repozytoriów, factories lub domain events w kodzie;
- wybór invariantów i transakcji wewnątrz agregatu;
- refaktor anemicznego modelu domenowego;
- implementacja CQRS, domain services lub policies w konkretnym stosie technologicznym.

Przekaż: bounded contexts, odpowiedzialności modułów, kandydatów na agregaty, zdarzenia, reguły biznesowe, kontrakty i ograniczenia spójności.
