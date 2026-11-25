# Bloki Budowlane DDD - modeling-domain

Szczegółowa referencja taktycznych building blocks DDD. Czytaj ją, gdy aktywny `SKILL.md` wskazuje potrzebę pełnych reguł implementacji albo przykładów strukturalnych.

## Spis treści

- [Szybkie mapowanie](#szybkie-mapowanie)
- [Entity](#entity)
- [Value Object](#value-object)
- [Aggregate](#aggregate)
- [Repository](#repository)
- [Domain Service](#domain-service)
- [Factory](#factory)
- [Domain Event](#domain-event)
- [Domain Policy](#domain-policy)
- [Module / Bounded Context](#module--bounded-context)
- [CQRS](#cqrs)
- [Checklista zastosowania](#checklista-zastosowania)

## Szybkie mapowanie

| Pytanie | Wzorzec | Przykład |
| --- | --- | --- |
| Czy obiekt ma tożsamość i zmienia się w czasie? | Entity | Zamówienie, Użytkownik, Produkt |
| Czy obiekt opisuje wartość bez własnej tożsamości? | Value Object | Adres, Kwota, Email |
| Czy grupa obiektów musi zachować inwariant w jednej transakcji? | Aggregate | Zamówienie z pozycjami |
| Czy potrzebny jest dostęp do kompletnego agregatu? | Repository | `OrderRepository` |
| Czy operacja nie ma naturalnego właściciela? | Domain Service | Transfer środków między kontami |
| Czy tworzenie wymaga reguł biznesowych? | Factory | `OrderFactory` z polityką cenową |
| Czy coś ważnego wydarzyło się w domenie? | Domain Event | `OrderPlaced`, `PaymentProcessed` |
| Czy reguła ma warianty zależne od rynku/klienta/czasu? | Domain Policy | Polityka rabatowa |
| Czy pojęcia mają inne znaczenie w innych częściach systemu? | Module / Bounded Context | Sprzedaż vs Fakturacja |
| Czy odczyt i zapis mają różne modele albo obciążenia? | CQRS | Osobny read model dla raportów |

## Entity

Encja ma trwałą tożsamość i cykl życia. Jej stan może się zmieniać, ale równość wynika z ID, nie z aktualnych pól.

**Reguły implementacji:**

- Każda encja ma jawny typ ID, generowany albo przypisany przez domenę.
- Równość i hash bazują wyłącznie na ID; pola biznesowe mogą się zmieniać.
- Mutacja przechodzi przez metody biznesowe, nie publiczne settery.
- Encja nie pozwala wejść w stan sprzeczny z regułami domeny.
- Encja wewnątrz agregatu jest mutowana tylko przez aggregate root.

```text
OrderItem(id, productId, quantity, unitPrice)
  changeQuantity(newQuantity):
    require newQuantity > 0
    quantity = newQuantity
```

## Value Object

Value Object opisuje wartość i nie ma własnej tożsamości. Dwie instancje są równe, gdy wszystkie istotne pola mają tę samą wartość.

**Reguły implementacji:**

- Wszystkie pola są readonly/frozen; operacje zwracają nową instancję.
- Walidacja odbywa się przy tworzeniu, a błędny stan nie powstaje.
- Równość jest po wartości wszystkich pól znaczących biznesowo.
- Value Object może zawierać logikę: normalizację, porównanie, obliczenia i formatowanie domenowe.
- Unikaj pustych primitive wrappers bez reguł; typ wartości ma nieść zachowanie albo walidację.

```text
Money(amount, currency)
  require amount >= 0
  add(other): require sameCurrency(other); return Money(amount + other.amount, currency)
```

## Aggregate

Agregat grupuje root i obiekty wewnętrzne, które muszą być spójne natychmiast. Aggregate root jest jedynym publicznym punktem wejścia.

**Reguły implementacji:**

- Root wymusza inwarianty całego klastra.
- Obiekty wewnętrzne nie są pobierane i zapisywane osobno.
- Jeden agregat jest zapisywany w jednej transakcji.
- Referencje do innych agregatów są po ID, nie przez bezpośredni obiekt.
- Zmiany wymagające innych agregatów koordynuj przez domain events i eventual consistency.

```text
Order(root)
  addItem(productId, quantity, price):
    require status == Draft
    require itemCount < 50
    items.add(OrderItem(...))
    recalculateTotal()
```

Szczegółowe heurystyki granic są w `./aggregate-design.md`.

## Repository

Repozytorium reprezentuje kolekcję aggregate roots. Nie jest generycznym wrapperem CRUD ani DAO dla każdej encji.

**Reguły implementacji:**

- Jedno repozytorium per aggregate root.
- Interfejs żyje w domenie, implementacja w infrastrukturze.
- Zwraca kompletne agregaty gotowe do wymuszania inwariantów.
- Metody mają język domenowy, np. `findPendingByCustomer`, nie tylko `getAll`.
- Query/read models i projekcje DTO nie muszą przechodzić przez repozytorium agregatu.

```text
OrderRepository
  getById(orderId) -> Order?
  findPendingByCustomer(customerId) -> List<Order>
  save(order)
```

## Domain Service

Domain Service zawiera logikę domenową, która nie pasuje naturalnie do pojedynczej encji lub agregatu.

**Reguły implementacji:**

- Jest bezstanowy i nazwany operacją domenową.
- Nie orkiestruje transportu, transakcji, autoryzacji ani zapisu infrastrukturalnego.
- Używaj go oszczędnie: najpierw szukaj naturalnego właściciela logiki w agregacie lub value object.
- Może współpracować z politykami, specyfikacjami i agregatami, ale nie staje się application service.

```text
TransferFundsService
  transfer(fromAccount, toAccount, amount):
    fromAccount.withdraw(amount)
    toAccount.deposit(amount)
    return FundsTransferred(...)
```

## Factory

Factory tworzy poprawny obiekt domenowy, gdy konstrukcja wymaga wielu kroków, reguł albo zależnych polityk.

**Reguły implementacji:**

- Zwraca wyłącznie poprawny agregat albo jasno zwraca błąd domenowy.
- Ukrywa kolejność tworzenia obiektów wewnętrznych.
- Może być osobną klasą, metodą statyczną aggregate root albo metodą domenową na innym agregacie.
- Nie zamieniaj każdej konstrukcji w factory; prosty value object może walidować się sam.

```text
OrderFactory.create(customerId, items, pricingPolicy)
  require items not empty
  order = Order.draft(customerId)
  for item in items: order.addItem(item.productId, item.quantity, pricingPolicy.priceFor(item))
  return order
```

## Domain Event

Domain Event opisuje fakt, który już wydarzył się w domenie.

**Reguły implementacji:**

- Nazwa w czasie przeszłym: `OrderPlaced`, `PaymentProcessed`.
- Event jest niemutowalny i zawiera dane zdarzenia, nie cały agregat.
- Jest emitowany po zmianie stanu, zwykle przez aggregate root.
- Handler może uruchamiać procesy poboczne, aktualizować read model albo wysłać integrację.
- Dla publikacji między procesami rozważ outbox, aby powiązać zapis agregatu i eventu.

```text
OrderPlaced(orderId, customerId, total, occurredAt)
```

## Domain Policy

Domain Policy enkapsuluje regułę biznesową, która ma warianty zależne od klienta, rynku, kanału, czasu albo konfiguracji domenowej.

**Reguły implementacji:**

- Implementuj jako strategię albo specyfikację z jawnie nazwanym kontraktem.
- Wybór obowiązującej polityki jest decyzją domenową albo aplikacyjną opartą na kontekście use case'u.
- Polityka nie powinna wykonywać I/O; jeśli potrzebuje danych, przekaż je jako parametry albo osobny model.

```text
PricingPolicy.calculate(product, customerSegment, quantity) -> Money
```

## Module / Bounded Context

Module grupuje elementy jednego języka i modelu. Bounded Context definiuje granicę, w której pojęcia mają konkretne znaczenie.

**Reguły implementacji:**

- Używaj osobnych namespace/pakietów per bounded context.
- Komunikacja między kontekstami idzie przez kontrakty, domain events, ACL albo shared kernel o małym zakresie.
- Ten sam termin może mieć różne modele w różnych kontekstach; nie wymuszaj jednej klasy globalnej.
- Brak współdzielonych tabel między kontekstami, jeśli celem jest niezależność modelu.

Strategiczne granice odkrywaj przez `system-modularising`; ten skill modeluje wnętrze wybranego kontekstu.

## CQRS

CQRS rozdziela model komend od modelu zapytań. Strona zapisu przechodzi przez agregaty, a strona odczytu może używać projekcji zoptymalizowanej pod zapytania.

**Reguły implementacji:**

- Komendy zmieniają stan i przechodzą przez agregaty oraz inwarianty.
- Zapytania nie mają efektów ubocznych i mogą korzystać z read modelu, SQL albo denormalizacji.
- Prosty CQRS może działać na jednej bazie z osobnymi handlerami.
- Pełny CQRS z oddzielnymi bazami wymaga synchronizacji przez eventy i obsługi opóźnień.
- Nie stosuj CQRS, jeśli CRUD jest prosty, odczyt i zapis są symetryczne, a zespół nie zyska na separacji.

## Checklista zastosowania

- [ ] Każda koncepcja ma wzorzec dobrany przez zachowanie i inwariant, nie przez nazwę tabeli.
- [ ] Encje, value objects i agregaty mają metody biznesowe zgodne z ubiquitous language.
- [ ] Repozytoria zwracają aggregate roots, a nie przypadkowe fragmenty grafu obiektów.
- [ ] Zdarzenia domenowe są kontraktami faktów i nie przenoszą całych agregatów.
- [ ] CQRS, polityki i serwisy domenowe mają uzasadnienie wynikające z realnej złożoności domeny.
