# Wzorce i Antywzorce - modeling-domain

Referencja do diagnozowania typowych błędów taktycznego DDD oraz odróżniania wzorców domenowych od aplikacyjnych i infrastrukturalnych.

## Spis treści

- [Tabela antywzorców](#tabela-antywzorców)
- [Domain Service vs Application Service](#domain-service-vs-application-service)
- [Anemic Domain Model](#anemic-domain-model)
- [God Aggregate](#god-aggregate)
- [Repository per Entity](#repository-per-entity)
- [Generic Repository](#generic-repository)
- [Domain Service jako worek](#domain-service-jako-worek)
- [Checklista naprawcza](#checklista-naprawcza)

## Tabela antywzorców

| Antywzorzec | Dlaczego szkodzi | Zamiast tego |
| --- | --- | --- |
| Anemic Domain Model | Obiekty domenowe są DTO, a reguły rozproszone w serwisach | Bogaty model: metody biznesowe w encjach, value objects i agregatach |
| God Aggregate | Jeden root blokuje wiele procesów, rośnie graf obiektów i liczba konfliktów | Małe agregaty z inwariantami, referencje po ID, events |
| Repository per Entity | Encje wewnętrzne są zapisywane poza rootem, omijając inwarianty | Repozytorium per aggregate root |
| Generic Repository | `CRUD<T>` ukrywa język domeny i wymusza płaski model | Repozytoria z metodami domenowymi |
| ORM-first modelowanie | Framework persistence narzuca kształt domeny | Model domenowy najpierw, mapping w infrastrukturze |
| Referencja obiektowa między agregatami | Przypadkowa mutacja wielu rootów w jednej transakcji | Referencje po ID i domain events |
| Logika domenowa w Application Service | Use case orchestration miesza się z regułami biznesowymi | Reguły w modelu domenowym, application service orkiestruje |
| Domain Service jako worek | Każda trudniejsza reguła trafia do klasy `SomethingService` | Najpierw encja/agregat/value object/policy, service tylko bez właściciela |
| Wspólna encja między bounded contexts | Jeden model musi spełniać sprzeczne języki i reguły | Osobne modele per kontekst, ACL/shared kernel minimalnie |
| CQRS dla prostego CRUD | Złożoność synchronizacji bez wartości | Prosty model komend/zapytań w jednej warstwie aplikacji |

## Domain Service vs Application Service

| Cecha | Domain Service | Application Service |
| --- | --- | --- |
| Warstwa | Domena | Aplikacja/use case |
| Odpowiedzialność | Reguła biznesowa bez naturalnego właściciela | Orkiestracja: load, call domain, save, publish |
| Stan | Bezstanowy | Zwykle bezstanowy, zależy od repozytoriów i adapterów |
| Zależności | Inne obiekty domenowe, policies, value objects | Repozytoria, unit of work, clock, event bus, auth context |
| Przykład | `TransferFundsService` sprawdza regułę transferu | `PlaceOrderHandler` ładuje koszyk, tworzy zamówienie i zapisuje |
| Błąd | Zna HTTP, transakcje, ORM albo kolejkę | Zawiera szczegółowe reguły rabatów, limitów i statusów |

**Reguła praktyczna:** jeśli metoda może być opisana językiem biznesowym i nie wymaga I/O, rozważ Domain Service lub policy. Jeśli metoda koordynuje repozytoria, transakcję, autoryzację i publikację eventów, to Application Service.

## Anemic Domain Model

**Objawy:**

- Encje mają głównie publiczne pola, gettery/settery i mało zachowania.
- Serwisy sprawdzają statusy, limity i przejścia stanów przez instrukcje warunkowe.
- Testy biznesowe wymagają mockowania wielu serwisów zamiast testowania obiektu domenowego.
- Ten sam inwariant pojawia się w kilku handlerach.

**Naprawa:**

- Przenieś reguły do metod biznesowych agregatu albo value object.
- Zastąp settery operacjami z języka domeny: `submit`, `cancel`, `reserve`, `approve`.
- Dodaj typy wartości dla pojęć z walidacją: `Money`, `Email`, `Quantity`, `DateRange`.
- Zostaw application service jako cienką orkiestrację use case'u.

## God Aggregate

**Objawy:**

- Jeden root zawiera wiele niezależnych kolekcji i procesów.
- Zapis ma dużo konfliktów, bo równoległe operacje dotykają tego samego root ID.
- Trudno nazwać jeden inwariant uzasadniający granicę.
- Root zna pojęcia z kilku bounded contexts.

**Naprawa:**

- Rozbij agregat według inwariantów i cyklu życia.
- Zamień obiektowe referencje na ID.
- Przenieś proces między rootami do domain events, outboxa albo sagi.
- Dla odczytów przekrojowych zbuduj read model zamiast powiększać agregat.

## Repository per Entity

**Objawy:**

- `OrderItemRepository` zapisuje pozycję zamówienia bez `Order`.
- Testy potrafią utworzyć wewnętrzną encję w stanie niemożliwym z perspektywy root.
- Application service składa agregat ręcznie z kilku repozytoriów.

**Naprawa:**

- Usuń repozytoria encji wewnętrznych albo ogranicz je do infrastrukturalnych DAO niewidocznych dla domeny.
- Pobieraj i zapisuj aggregate root jako jednostkę spójności.
- Zapytania raportowe przenieś do query/read modelu, nie do repozytorium encji.

## Generic Repository

**Objawy:**

- Każde repozytorium dziedziczy `Add`, `Update`, `Delete`, `GetAll` bez języka domenowego.
- Kod aplikacyjny pobiera encje i filtruje reguły biznesowe poza repozytorium.
- Łatwo zapisać niepełny albo przypadkowy fragment agregatu.

**Naprawa:**

- Zdefiniuj interfejs per aggregate root z metodami wynikającymi z use case'ów.
- Zostaw generyczne helpery wyłącznie jako detal infrastruktury, nie kontrakt domeny.
- Używaj query handlers dla list, dashboardów i raportów.

## Domain Service jako worek

**Objawy:**

- Klasa `OrderService` ma dziesiątki metod i zna wszystkie reguły zamówienia.
- Serwis mutuje pola encji przez settery.
- Serwis wykonuje walidację, zapis, wysyłkę maila i integracje w jednym miejscu.

**Naprawa:**

- Rozdziel orkiestrację use case'u od reguł domenowych.
- Przenieś przejścia stanów do aggregate root.
- Reguły wymienne wydziel jako Domain Policy.
- Integracje i efekty uboczne obsłuż handlerami eventów albo adapterami.

## Checklista naprawcza

- [ ] Każdy serwis z logiką domenową został sprawdzony pod kątem naturalnego właściciela w modelu.
- [ ] Każde repozytorium odpowiada aggregate root, nie encji wewnętrznej.
- [ ] Każda transakcja obejmująca wiele agregatów ma udokumentowany powód albo została rozbita na events/sagę.
- [ ] Odczyty przekrojowe nie wymuszają powiększenia agregatu.
- [ ] Model domenowy nie importuje ORM, HTTP, kolejki, frameworka aplikacyjnego ani adapterów technicznych.
