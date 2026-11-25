# Walidacja i Ewolucja Podziału

Szczegółowe techniki testowania jakości modularyzacji: alternatywne dekompozycje, rejestr ryzyk, scenariusze ewolucji, testy architektoniczne i pełna checklista.

## Spis Treści

- [Alternatywne Dekompozycje](#alternatywne-dekompozycje)
- [Rejestr Ryzyk](#rejestr-ryzyk)
- [Scenariusze Ewolucji](#scenariusze-ewolucji)
- [Testy Architektoniczne](#testy-architektoniczne)
- [Checklista Końcowa](#checklista-końcowa)

## Alternatywne Dekompozycje

Wygeneruj co najmniej dwie alternatywy dla istotnej modularyzacji. Alternatywy mają testować założenia, nie tylko różnić się nazwami.

| Kryterium | Wybrany podział | Alternatywa 1 | Alternatywa 2 |
| --- | --- | --- | --- |
| Logika granic | Bounded contexts po zdolnościach biznesowych | Moduły po zespołach | Moduły po danych/source of truth |
| Zalety | Wysoka spójność domenowa | Łatwe ownership | Mniej konfliktów danych |
| Wady | Wymaga uzgodnienia kontraktów | Ryzyko odwzorowania silosów | Może rozbić proces biznesowy |
| Ryzyko | Niedojrzały język domenowy | Coupling przez wspólne procesy | Zbyt techniczny podział |
| Kiedy wybrać | Gdy domena jest stabilna | Gdy team autonomy jest driverem | Gdy migracja danych jest największym ryzykiem |

Uzasadnienie wyboru powinno odwoływać się do celu modularyzacji, coupling/cohesion, jednostek spójności i scenariuszy ewolucji.

## Rejestr Ryzyk

Ryzyka zapisuj jako konkretne failure modes, nie ogólne obawy.

| Ryzyko | Dotkliwość | Prawdopodobieństwo | Sygnał ostrzegawczy | Mitygacja | Właściciel |
| --- | --- | --- | --- | --- | --- |
| Granica przecina invariant płatności | Wysoka | Średnie | Komendy wymagają transakcji w dwóch modułach | Przenieść invariant do Billing lub użyć procesu eventual consistency | Architekt/domena |
| Shared kernel rośnie poza stabilny model | Średnia | Wysokie | Coraz więcej modułów importuje typy shared | Limit API, testy zależności, ownership shared kernel | Lead modułu |
| Eventy ukrywają synchroniczny coupling | Średnia | Średnie | Konsumenci oczekują natychmiastowego efektu | Jawne SLA eventual consistency i retry policy | Integracje |

Minimalnie zapisz: dotkliwość, prawdopodobieństwo, mitygację i status decyzji: zaakceptowane, zmitigowane, otwarte.

## Scenariusze Ewolucji

Testuj podział zmianami, które system prawdopodobnie przeżyje:

| Scenariusz | Pytanie | Dobry wynik | Zły wynik |
| --- | --- | --- | --- |
| Nowa zdolność biznesowa | Ile modułów wymaga zmian? | Jeden moduł plus kontrakt/event | Wiele modułów i shared model |
| Zmiana reguły core | Czy reguła ma jednego właściciela? | Zmiana w jednym bounded context | Reguła rozproszona w UI/API/DB |
| Nowa integracja zewnętrzna | Czy model zewnętrzny jest izolowany? | ACL lub adapter w jednym module | Typy vendora przeciekają do domeny |
| Spike ruchu | Co można skalować niezależnie? | Krytyczny moduł ma osobny bottleneck i metryki | Wszystko skaluje się razem bez potrzeby |
| Restrukturyzacja zespołu | Czy ownership nadal jest jasny? | Kontrakty pozostają stabilne | Każda zmiana wymaga koordynacji wielu zespołów |
| Migracja danych | Kto posiada source of truth? | Jeden właściciel zapisu i plan projekcji | Wspólna tabela blokuje migrację |

Jeśli jeden realistyczny scenariusz wymaga zmian w wielu niepowiązanych modułach, potraktuj to jako sygnał do rewizji granicy.

## Testy Architektoniczne

Zaplanuj automatyczne egzekwowanie reguł, jeśli modularyzacja ma być utrzymana po wdrożeniu. Dobierz narzędzie do stosu technologicznego:

| Stos | Narzędzia przykładowe | Typowe reguły |
| --- | --- | --- |
| .NET | NetArchTest, Roslyn analyzers | warstwy, publiczne API modułu, brak cykli |
| Java/Kotlin | ArchUnit, jQAssistant | bounded contexts, zależności pakietów, warstwy |
| JS/TS | dependency-cruiser, eslint boundaries | import rules, brak deep imports, brak cykli |
| Python | import-linter, pytest-archon | kontrakty importów, warstwy, brak cykli |
| Polyglot | graph checks, CI scripts, CODEOWNERS | ownership, kontrakty, zabronione zależności |

Minimalne reguły do automatyzacji:

- domena nie zależy od infrastruktury, jeśli architektura warstwowa tego wymaga;
- moduły nie importują wewnętrznych typów innych modułów;
- brak cyklicznych zależności między bounded contexts;
- publiczne API modułu jest ograniczone do jawnych kontraktów;
- integracje zewnętrzne przechodzą przez ACL/adapter;
- nowe zależności między modułami wymagają testu lub ADR, gdy wpływ jest szeroki.

W `domain.md` wpisz testy architektoniczne w sekcji „Usprawnienia (Poza Zakresem)”, jeśli nie są implementowane w bieżącym zadaniu.

## Checklista Końcowa

```text
Walidacja modularyzacji:
- [ ] Zidentyfikowano subdomeny core/supporting/generic.
- [ ] Każdy bounded context ma odpowiedzialność, język i właściciela.
- [ ] Diagram UML Package pokazuje moduły i kierunki zależności.
- [ ] C4 Container istnieje, jeśli podział wpływa na runtime, integracje lub deployment.
- [ ] Każdy moduł ma publiczne API: commands, queries, events lub kontrakty integracyjne.
- [ ] Każdy moduł ma dane właścicielskie albo jawny powód braku własnych danych.
- [ ] Zidentyfikowano agregaty, encje, value objects, events, polityki i domain services tam, gdzie dotyczy.
- [ ] Jednostki spójności nie przecinają granic bez decyzji o eventual consistency lub zmianie granicy.
- [ ] Ocena granic zawiera coupling, cohesion, częstotliwość zmian, dane, zespół i komunikację.
- [ ] Wagi kryteriów są uzasadnione celem modularyzacji.
- [ ] Porównano co najmniej dwie alternatywne dekompozycje przy istotnych decyzjach.
- [ ] Rejestr ryzyk zawiera mitygacje i właścicieli.
- [ ] Scenariusze ewolucji nie ujawniają krytycznych zmian wielomodułowych bez planu.
- [ ] Brak zależności cyklicznych lub istnieje plan ich usunięcia.
- [ ] Zaplanowano testy architektoniczne albo zapisano, dlaczego nie dotyczą.
- [ ] Wynik zapisano jako `domain.md` zgodny z `./domain.example.md` albo jako plan modułów.
```
