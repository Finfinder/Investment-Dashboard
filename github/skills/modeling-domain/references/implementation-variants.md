# Warianty Implementacyjne - modeling-domain

Referencja pokazuje, jak zachować te same reguły DDD w różnych językach i przy mapowaniu ORM. Składnia jest przykładowa; lokalne konwencje repozytorium mają pierwszeństwo.

## Spis treści

- [Reguły wspólne](#reguły-wspólne)
- [C Sharp i .NET](#c-sharp-i-net)
- [Python](#python)
- [TypeScript](#typescript)
- [Java](#java)
- [ORM mapping hints](#orm-mapping-hints)
- [Persistence ignorance](#persistence-ignorance)
- [Checklista technologiczna](#checklista-technologiczna)

## Reguły wspólne

- Typy ID powinny odróżniać pojęcia domenowe (`OrderId` nie jest zwykłym stringiem wszędzie).
- Value Objects są immutable i walidowane przy tworzeniu.
- Encje porównują się po ID, nie po wszystkich polach.
- Aggregate root ukrywa mutowalne kolekcje i wystawia operacje domenowe.
- Domain events są immutable, nazwane w czasie przeszłym i serializowalne jako kontrakt danych.
- ORM, serializer i framework webowy są adapterami, nie źródłem modelu domeny.

## C Sharp i .NET

**Dobre dopasowania:** `record` dla value objects, prywatne konstruktory dla ORM, `private set`, kolekcje read-only, metody biznesowe na agregatach, interfejsy repozytoriów w projekcie/domain assembly.

```csharp
public sealed record Money(decimal Amount, string Currency)
{
    public Money
    {
        if (Amount < 0) throw new DomainException("Amount cannot be negative.");
        if (string.IsNullOrWhiteSpace(Currency)) throw new DomainException("Currency is required.");
    }
}

public sealed class Order
{
    private readonly List<OrderItem> items = [];

    public OrderId Id { get; }
    public IReadOnlyCollection<OrderItem> Items => items.AsReadOnly();

    public void AddItem(ProductId productId, Quantity quantity, Money price)
    {
        if (items.Count >= 50) throw new DomainException("Order item limit exceeded.");
        items.Add(new OrderItem(productId, quantity, price));
    }
}
```

**Wskazówki:**

- EF Core mapping trzymaj w infrastrukturze (`IEntityTypeConfiguration`), nie jako adnotacje w domenie.
- Dla value objects używaj owned types albo conversion, zależnie od złożoności.
- Domain events trzymaj jako rekordy/immutable classes, a publikację obsługuj po commit.
- Testy domenowe uruchamiaj bez bazy danych, HTTP, kontenera DI i frameworka webowego; sprawdzaj inwarianty agregatów, value objects i wyjątki domenowe.
- Formatowanie techniczne w value objects, parserach i kontraktach maszynowo odczytywalnych wykonuj z `InvariantCulture`; UI i raporty użytkownika mogą wymagać kultury użytkownika.
- Rich domain model, prywatne settery, lokalne typy bazowe i wyjątki domenowe stosuj zgodnie z konwencją repozytorium. Nie narzucaj globalnych nazw typu `AuditableEntity` ani `BusinessRuleViolationException`.

## Python

**Dobre dopasowania:** `dataclass(frozen=True)` dla value objects, zwykłe klasy dla encji/agregatów, wyjątki domenowe albo Result Type zgodnie z repozytorium.

```python
from dataclasses import dataclass
from decimal import Decimal


@dataclass(frozen=True)
class Money:
    amount: Decimal
    currency: str

    def __post_init__(self):
        if self.amount < 0:
            raise DomainError("Kwota nie może być ujemna")
        if not self.currency:
            raise DomainError("Waluta jest wymagana")

    def add(self, other):
        if self.currency != other.currency:
            raise DomainError("Waluty muszą być takie same")
        return Money(self.amount + other.amount, self.currency)
```

```python
class Order:
    def __init__(self, order_id, customer_id):
        self.id = order_id
        self.customer_id = customer_id
        self._items = []
        self._events = []

    @property
    def items(self):
        return tuple(self._items)

    def add_item(self, product_id, quantity, price):
        if len(self._items) >= 50:
            raise DomainError("Limit pozycji przekroczony")
        self._items.append(OrderItem(product_id, quantity, price))
```

**Wskazówki:**

- Modele SQLAlchemy/Pydantic nie muszą być tymi samymi klasami co domena.
- Jeśli repo preferuje SQLAlchemy models, utrzymuj metody domenowe bez zależności od session/query.
- Zamykaj mutowalne kolekcje przez tuple/read-only views.

## TypeScript

**Dobre dopasowania:** `readonly`, branded types dla ID, klasy albo factory functions dla value objects, discriminated unions dla Result/Errors.

```ts
type Brand<T, Name extends string> = T & { readonly __brand: Name };
type OrderId = Brand<string, "OrderId">;
type ProductId = Brand<string, "ProductId">;

class Money {
  private constructor(
    public readonly amount: number,
    public readonly currency: string,
  ) {}

  static create(amount: number, currency: string): Money {
    if (amount < 0) throw new DomainError("Amount cannot be negative");
    if (!currency) throw new DomainError("Currency is required");
    return new Money(amount, currency);
  }
}
```

**Wskazówki:**

- Nie ufaj samym typom runtime-free; waliduj wejście przy tworzeniu value objects.
- DTO z API nie są obiektami domenowymi.
- ORM decorators w klasach domenowych zwiększają coupling; preferuj mapper/adapters, jeśli projekt pozwala.

## Java

**Dobre dopasowania:** `record` dla value objects, klasy z prywatnymi konstruktorami dla agregatów, kolekcje niemutowalne na zewnątrz.

```java
public record Money(BigDecimal amount, Currency currency) {
    public Money {
        if (amount.signum() < 0) {
            throw new DomainException("Amount cannot be negative");
        }
        Objects.requireNonNull(currency);
    }
}

public final class Order {
    private final OrderId id;
    private final List<OrderItem> items = new ArrayList<>();

    public List<OrderItem> items() {
        return List.copyOf(items);
    }

    public void addItem(ProductId productId, Quantity quantity, Money price) {
        if (items.size() >= 50) throw new DomainException("Order item limit exceeded");
        items.add(new OrderItem(productId, quantity, price));
    }
}
```

**Wskazówki:**

- JPA często wymaga bezargumentowego konstruktora; ogranicz jego widoczność.
- Hibernate annotations w domenie są kompromisem. Jeśli projekt wymaga persistence ignorance, użyj mapperów lub oddzielnych persistence entities.
- Domain events mogą być records albo immutable classes.

## ORM mapping hints

| Element domeny | Typowe mapowanie | Uwaga |
| --- | --- | --- |
| Aggregate Root | Tabela główna albo dokument | Repozytorium zapisuje root jako jednostkę spójności |
| Encja wewnętrzna | Tabela zależna, owned collection, embedded document | Brak osobnego repozytorium domenowego |
| Value Object prosty | Owned type, embedded columns, converter | Walidacja nadal w value object |
| Value Object złożony | Osobna tabela albo JSON/document | Decyzja zależy od wzorców zapytań |
| Referencja do innego agregatu | Kolumna `OtherAggregateId` | Nie mapuj jako eager object graph |
| Domain Event | Outbox table albo kolekcja transient events | Publikacja po commit |
| Read Model | Tabela/projekcja/DTO zoptymalizowane pod odczyt | Nie musi być agregatem |

Szczegóły schematu, indeksów i query performance przekazuj do `engineering-databases`.

## Persistence ignorance

Persistence ignorance oznacza, że model domenowy nie wie, jak jest utrwalany.

**Zachowuj:**

- brak importów ORM/session/query w domenie;
- brak adnotacji bazodanowych, jeśli repozytorium dopuszcza oddzielne mapowanie;
- repozytoria jako porty domenowe;
- mappery w warstwie infrastruktury;
- testy domenowe bez bazy danych.

**Dopuszczalne kompromisy:**

- prywatny konstruktor dla ORM;
- chronione settery wymagane przez framework;
- adnotacje persistence, jeśli architektura projektu świadomie tak działa.

Każdy kompromis powinien być lokalny i nie może pozwalać ominąć inwariantów root.

## Checklista technologiczna

- [ ] Value objects mają runtime validation, nie tylko typy compile-time.
- [ ] Encje nie porównują się po mutowalnych polach.
- [ ] Agregaty nie eksponują mutowalnych kolekcji.
- [ ] Repozytoria są portami domenowymi, a ORM żyje w adapterze/infrastrukturze.
- [ ] Domain events da się serializować bez ciągnięcia całego grafu obiektów.
- [ ] Wariant językowy zachowuje guard rails aktywnego `SKILL.md`.
