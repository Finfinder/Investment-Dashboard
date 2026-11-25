# Projektowanie Agregatów - modeling-domain

Referencja projektowania granic agregatów, inwariantów i transakcji. Czytaj ją, gdy model zaczyna puchnąć, obejmuje kilka rootów albo wymaga eventual consistency.

## Spis treści

- [Punkt startowy: inwariant](#punkt-startowy-inwariant)
- [Heurystyki wielkości agregatu](#heurystyki-wielkości-agregatu)
- [Root i enkapsulacja](#root-i-enkapsulacja)
- [Granica transakcji](#granica-transakcji)
- [Referencje po ID](#referencje-po-id)
- [Eventual consistency](#eventual-consistency)
- [Przykłady złych granic](#przykłady-złych-granic)
- [Checklista projektowa](#checklista-projektowa)

## Punkt startowy: inwariant

Agregat istnieje po to, aby wymuszać inwarianty wymagające natychmiastowej spójności. Nie projektuj agregatu od relacji tabel, ekranów UI ani wygody `include` w ORM.

**Dobre pytania:**

- Jaka reguła biznesowa musi być prawdziwa po każdej operacji?
- Które obiekty muszą zostać zmienione atomowo, aby reguła była zachowana?
- Który obiekt naturalnie podejmuje decyzję i może odmówić zmiany?
- Co może stać się spójne później przez event, projekcję albo proces kompensacji?

**Sygnały ostrzegawcze:**

- Granica agregatu jest uzasadniana wyłącznie relacją `has many`.
- Root istnieje tylko jako kontener danych, bez decyzji biznesowych.
- Operacja potrzebuje załadować pół systemu, aby zmienić jeden stan.
- Wiele modułów dopisuje settery do obiektów wewnętrznych, omijając root.

## Heurystyki wielkości agregatu

| Heurystyka | Preferuj | Unikaj |
| --- | --- | --- |
| Inwariant | Obiekty, które muszą być spójne natychmiast | Obiekty powiązane tylko raportowo |
| Rozmiar | Małe agregaty z jasną odpowiedzialnością | God Aggregate z całym procesem end-to-end |
| Częstotliwość zmian | Oddziel obiekty o innym rytmie zapisu | Wspólny lock dla często zmienianych danych |
| Życie obiektu | Obiekty wewnętrzne zależne od root | Niezależne byty schowane jako children |
| Dostęp | Ładowanie potrzebne do decyzji biznesowej | Ładowanie dla wygody odczytu lub UI |

Mały agregat nie oznacza ubogiego modelu. Oznacza, że reguły natychmiastowej spójności są lokalne, a reszta procesu jest koordynowana przez eventy, polityki albo application service.

## Root i enkapsulacja

Aggregate root jest jedynym obiektem, który świat zewnętrzny może pobrać i zapisać przez repozytorium.

**Root powinien:**

- posiadać ID agregatu i kontrolować cykl życia obiektów wewnętrznych;
- publikować metody biznesowe nazwane językiem domeny;
- walidować inwarianty przed zmianą stanu;
- emitować domain events po skutecznej zmianie;
- ukrywać kolekcje wewnętrzne jako read-only snapshots albo operacje domenowe.

**Root nie powinien:**

- udostępniać mutowalnych list children do dowolnej zmiany;
- przyjmować obiektów innych agregatów jako referencji;
- znać SQL, ORM session, HTTP, kolejki ani serializerów;
- podejmować decyzji należących do innych bounded contexts.

## Granica transakcji

Zasada domyślna: jedna transakcja zapisuje jeden aggregate root. Jeśli operacja wymaga zmian w wielu agregatach, najpierw sprawdź, czy to naprawdę jeden inwariant natychmiastowej spójności.

**Gdy jedna transakcja obejmuje kilka agregatów:**

- opisz jawnie inwariant, którego inaczej nie da się utrzymać;
- rozważ połączenie granic tylko wtedy, gdy obiekty mają wspólny cykl życia i mały rozmiar;
- oceń koszt konfliktów zapisu, locków i ładowania grafu;
- jeśli to proces, użyj domain events, outboxa, sagi albo kompensacji.

**Typowe rozwiązania poza jedną transakcją:**

- Domain event zapisany razem z agregatem i opublikowany po commit.
- Outbox pattern dla integracji między procesami.
- Process manager/saga dla sekwencji kroków z kompensacją.
- Read model/projekcja dla spójności odczytu bez rozciągania agregatu.

## Referencje po ID

Agregaty nie powinny trzymać bezpośrednich referencji obiektowych do innych agregatów. Przechowuj identyfikator i pobieraj drugi agregat w osobnym use case'u, jeśli trzeba.

**Dlaczego ID:**

- ogranicza rozmiar ładowanego grafu;
- zapobiega przypadkowej mutacji drugiego agregatu w tej samej transakcji;
- ułatwia serializację eventów i kontraktów;
- zmniejsza coupling między bounded contexts;
- pozwala na asynchroniczną synchronizację stanu.

**Przykład decyzji:**

| Potrzeba | Modeluj jako |
| --- | --- |
| `Order` potrzebuje wiedzieć, kto kupuje | `CustomerId` w `Order` |
| `Order` musi znać aktualny limit kredytowy klienta | Osobny check w application service albo policy, potem event |
| `Invoice` potrzebuje danych adresowych z chwili wystawienia | Snapshot value object, nie referencja do żywego `Customer` |

## Eventual consistency

Eventual consistency jest właściwa, gdy reguła może zostać spełniona po krótkim czasie albo proces biznesowy naturalnie składa się z kroków.

**Stosuj ją dla:**

- powiadomień, maili, audytu i integracji zewnętrznych;
- aktualizacji read models i dashboardów;
- rezerwacji zasobów, które mogą mieć status pending/confirmed/rejected;
- przepływów między bounded contexts, gdzie każdy kontekst ma własny model.

**Nie ukrywaj eventual consistency:**

- nazwij statusy pośrednie w domenie;
- zaprojektuj retry, idempotencję handlerów i deduplikację eventów;
- testuj opóźnione, zdublowane i nieudane eventy;
- komunikuj użytkownikowi stan procesu, jeśli wynik nie jest natychmiastowy.

## Przykłady złych granic

| Zła granica | Objaw | Lepszy kierunek |
| --- | --- | --- |
| `Customer` zawiera wszystkie `Order`, `Invoice`, `Payment` | Każda zmiana klienta ładuje historię transakcji | Oddziel agregaty, referencje po `CustomerId`, events |
| `Order` zawiera pełny `Product` i `Inventory` | Zmiana ceny lub stanu magazynu blokuje zamówienia | Snapshot ceny w pozycji, rezerwacja magazynu przez event |
| `Account` i `Transfer` jako jeden root globalny | Wysoka konkurencja zapisów na jednym agregacie | Transfer jako proces, konta osobno, idempotentne eventy |
| `Project` zawiera wszystkie taski, komentarze i załączniki | Root puchnie, konflikty przy równoległej pracy | Task jako osobny agregat, komentarze według inwariantów |
| `User` jako globalny root auth, billing i profile | Jeden model musi służyć wielu językom | Osobne bounded contexts, shared `UserId` |

## Checklista projektowa

- [ ] Każdy agregat ma nazwany inwariant natychmiastowej spójności.
- [ ] Root jest jedynym publicznym punktem mutacji.
- [ ] Obiekty wewnętrzne nie mają własnych repozytoriów.
- [ ] Inne agregaty są referencjonowane po ID.
- [ ] Jedna transakcja zapisuje jeden root albo wyjątek ma jawne uzasadnienie.
- [ ] Procesy między agregatami mają events, outbox, sagę albo status pośredni.
- [ ] Granica agregatu wynika z języka domeny, nie z układu tabel ani potrzeb UI.
