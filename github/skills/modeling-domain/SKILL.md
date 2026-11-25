---
name: modeling-domain
description: "Implementuje taktyczne wzorce DDD: Entity, Value Object, Aggregate, Repository, Domain Service, Factory, Domain Event, CQRS. Używaj przy budowaniu i refaktoryzacji modelu domenowego, definiowaniu agregatów, inwariantów i repozytoriów."
---

# Modelowanie Domeny

Prowadzi implementację taktycznych building blocks DDD: encji, value objects, agregatów, repozytoriów, zdarzeń, polityk, fabryk i CQRS w modelu domenowym. Uzupełnia `system-modularising`: `domain.md` albo wynik strategicznej modularyzacji jest wejściem do modelowania taktycznego, nie opcjonalnym dodatkiem ani zamiennikiem odkrywania bounded contexts.

## Kiedy używać

- Budowanie albo refaktoryzacja modelu domenowego wewnątrz zdefiniowanego bounded contextu.
- Projektowanie agregatów, inwariantów, encji, value objects, domain events i repozytoriów.
- Przenoszenie logiki z CRUD/service layer do bogatego modelu domenowego.
- Review implementacji DDD pod kątem granic transakcji, anemicznego modelu i persistence ignorance.

**Nie używaj jako zamiennika:** strategicznego odkrywania bounded contexts (`system-modularising`), implementacji API i application services (`implementing-backend`) ani projektowania schematu/ORM (`engineering-databases`).

<principles>

<aggregate-consistency>
Agregat jest granicą spójności i transakcji. Jeden command modyfikuje jeden aggregate root; komunikacja między agregatami odbywa się przez domain events, a referencje między agregatami są po ID. Root agregatu jest jedynym punktem wejścia do zmian i wymusza inwarianty całego klastra.
</aggregate-consistency>

<invalid-state-unrepresentable>
Nieprawidłowy stan ma być niereprezentowalny. Encje i agregaty zmieniają stan przez metody biznesowe, a value objects są niemutowalne, walidowane przy tworzeniu i porównywane po wartości.
</invalid-state-unrepresentable>

<events-and-contracts>
Domain events są niemutowalne, nazwane w czasie przeszłym i niosą dane zdarzenia, nie całe agregaty. Bounded contexts mają jawne granice, własny język i własny model; kontrakty między nimi muszą być nazwane, wersjonowalne i możliwe do przetestowania.
</events-and-contracts>

<repository-discipline>
Repozytorium istnieje jedno per aggregate root: interfejs w domenie, implementacja w infrastrukturze. Generic CRUD repository i repository per entity rozrywają granicę agregatu i ukrywają intencję domenową.
</repository-discipline>

<pragmatic-cqrs>
CQRS stosuj tylko wtedy, gdy separacja komend i zapytań daje realną wartość: asymetria read/write, inne modele odczytu, skalowanie albo audyt. Nie wprowadzaj CQRS dla prostego CRUD.
</pragmatic-cqrs>

</principles>

## Proces Modelowania Domeny

```text
Postęp:
- [ ] Krok 1: Kontekst i język
- [ ] Krok 2: Agregaty i inwarianty
- [ ] Krok 3: Building blocks
- [ ] Krok 4: Kontrakty i zdarzenia
- [ ] Krok 5: Walidacja modelu
```

**Krok 1: Kontekst i język**

- Zacznij od `domain.md`, wyniku `system-modularising` albo innego jawnego opisu bounded contexts, procesów, odpowiedzialności i języka wszechobecnego.
- Jeśli granice kontekstów są niejasne, zatrzymaj taktykę i wróć do `system-modularising`.
- Przeczytaj istniejący kod domenowy, nazwy klas, moduły, repozytoria, migracje i testy, aby zachować lokalny język.

**Krok 2: Agregaty i inwarianty**

- Dla każdego procesu biznesowego wskaż aggregate root, obiekty wewnętrzne i inwarianty, które muszą być spójne natychmiast.
- Granicę agregatu wyznacza inwariant transakcyjny, nie wygoda nawigacji po obiektach ani układ tabel.
- Preferuj małe agregaty; jeżeli nie umiesz nazwać reguły łączącej obiekty, nie powinny być w tym samym agregacie.

**Krok 3: Building blocks**

- Mapuj koncepcje na Entity, Value Object, Aggregate, Repository, Domain Service, Factory, Domain Event, Domain Policy, Module/Bounded Context albo CQRS.
- Logika domenowa mieszka w encjach, value objects, agregatach, politykach albo serwisach domenowych, nie w kontrolerach, handlerach transportu ani workflownych service bags.
- Domain Service wybieraj tylko dla operacji bez naturalnego właściciela w pojedynczej encji lub agregacie.

**Krok 4: Kontrakty i zdarzenia**

- Zdefiniuj interfejsy repozytoriów w domenie oraz adaptery infrastrukturalne poza domeną.
- Zdarzenia domenowe emituj po zmianie stanu agregatu i traktuj jako wewnętrzne dla bounded contextu; poza kontekst publikuj integration events przez jawny kontrakt lub outbox.
- Na granicach bounded contexts używaj jawnych kontraktów, ACL albo tłumaczenia języka; nie współdziel modelu wewnętrznego jako API.

**Krok 5: Walidacja modelu**

- Sprawdź, czy inwarianty są wymuszane w kodzie, a nie tylko opisane w komentarzach lub testach.
- Zweryfikuj: jeden agregat na transakcję, referencje po ID, brak generic CRUD repository, brak zależności domeny od ORM/frameworka.
- Przejdź testami przez ścieżki naruszające reguły biznesowe; model ma odmówić utworzenia albo zmiany nieprawidłowego stanu.

## Krytyczne Guard Rails

- Agregat jest granicą spójności i transakcji; jedna transakcja modyfikuje jeden aggregate root.
- Komunikacja między agregatami przechodzi przez domain events; referencje między agregatami są po ID.
- Root agregatu wymusza inwarianty i ukrywa obiekty wewnętrzne przed bezpośrednią mutacją.
- Nieprawidłowy stan ma być niereprezentowalny przez konstruktory, fabryki i metody biznesowe.
- Value objects są niemutowalne, walidowane przy tworzeniu i porównywane po wartości.
- Domain events są niemutowalne, nazwane w czasie przeszłym i zawierają dane zdarzenia, nie całe agregaty.
- Repozytorium: jedno per aggregate root, interfejs w domenie, implementacja w infrastrukturze.
- Zakaz generic CRUD repository i repository per entity.
- CQRS tylko przy realnej wartości separacji komend/zapytań, nigdy jako ceremoniał dla prostego CRUD.
- Bounded contexts mają jawne granice, własny język i własny model.
- `domain.md` albo wynik `system-modularising` jest wejściem do taktycznego modelowania.

## Minimalne Zakazy

- Anemic Domain Model: dane w encjach, logika w serwisach.
- God Aggregate: jeden masywny root obejmujący zbyt wiele procesów i inwariantów.
- Repository per entity albo generic repository ukrywające intencję domenową.
- ORM-first modelowanie, w którym tabele i adnotacje frameworka dyktują model domeny.
- Transaction boundary obejmujące wiele agregatów bez jawnego uzasadnienia, outboxa, sagi albo procesu kompensacji.
- Domain Service jako worek na logikę aplikacyjną, orkiestrację use case'ów albo techniczne integracje.

## Materiały Referencyjne

Ładuj referencje warunkowo, gdy zadanie wymaga szczegółów:

- `./references/domain-contract.md` — gdy zaczynasz od `domain.md`, wyniku `system-modularising`, ubiquitous language, bounded contexts, kandydatów na agregaty albo kontraktów modułów.
- `./references/building-blocks.md` — gdy potrzebujesz pełnych reguł i przykładów dla Entity, Value Object, Aggregate, Repository, Domain Service, Factory, Domain Event, Domain Policy, Module/Bounded Context lub CQRS.
- `./references/aggregate-design.md` — gdy projektujesz granice agregatów, inwarianty, transaction boundary, referencje po ID, eventual consistency albo naprawiasz złe granice.
- `./references/patterns-and-antipatterns.md` — gdy diagnozujesz anemiczny model, God Aggregate, Repository per Entity, generic repository albo mylisz Domain Service z Application Service.
- `./references/implementation-variants.md` — gdy implementacja wymaga wariantów C#, Python, TypeScript, Java, wskazówek ORM albo persistence ignorance.
- `./references/collaboration.md` — gdy trzeba skoordynować modelowanie z backendem, bazą danych, architekturą, modularyzacją albo code review.

## Eskalacje

- Brak albo sprzeczne bounded contexts -> `system-modularising`; przekaż procesy biznesowe, słownik pojęć i istniejące moduły.
- Złożone mapowanie agregatu do tabel, migracje, indeksy albo query model -> `engineering-databases`; przekaż strukturę agregatu i wzorce dostępu.
- Endpointy, application services, auth, middleware albo transport -> `implementing-backend`; przekaż model domenowy, repozytoria i events.
- Decyzje systemowe wykraczające poza model domeny -> `architecture-designing`; przekaż ograniczenia domeny i wymagania integracyjne.

## Checklista Końcowa

```text
- [ ] Ubiquitous language i bounded context są jawne oraz spójne z `domain.md`.
- [ ] Każdy agregat ma root, inwarianty i uzasadnioną granicę transakcji.
- [ ] Encje mają tożsamość, value objects są niemutowalne, a events są w czasie przeszłym.
- [ ] Repozytoria są per aggregate root i nie wyciekają szczegółów ORM do domeny.
- [ ] Logika domenowa nie jest anemiczna ani ukryta w application services.
- [ ] Relacje między agregatami używają ID, events i eventual consistency.
```

## Powiązane Skille

- `system-modularising` — strategiczne DDD, bounded contexts, `domain.md`, granice modułów i kandydaci na agregaty.
- `implementing-backend` — application services, API, transport, auth, middleware i implementacja adapterów wokół domeny.
- `engineering-databases` — schemat, migracje, ORM mapping, transakcje, indeksy i read models.
- `architecture-designing` — decyzje systemowe, C4, topologia integracji i ograniczenia architektoniczne.
- `code-reviewing` — recenzja jakości implementacji modelu domenowego i wykrywanie naruszeń guard rails.
