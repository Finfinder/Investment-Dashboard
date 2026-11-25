# Schema i State Formularzy

Szczegóły schema-first validation, typów formularza, async validation oraz granic między UI state, domain state i server state. Ładuj tę referencję, gdy projektujesz model formularza, integrację walidatora albo dirty/touched behavior.

## Schema-first validation

Schemat walidacyjny opisuje poprawne dane niezależnie od renderowania pól. Powinien zawierać pola wymagane, wartości domyślne, długości, formaty, zależności między polami, reguły warunkowe i komunikaty błędów nadające się do UI.

Reguły:

- Schemat współlokuj blisko formularza lub feature, ale nie mieszaj go z JSX/template/markup.
- Typ formularza wyprowadzaj ze schematu albo modelu walidacyjnego.
- Jeśli payload API różni się od danych UI, dodaj jawną funkcję transformacji i test.
- Nie powielaj tego samego ograniczenia w komponencie, handlerze i backendowym mapperze bez jednego źródła prawdy.

## Typy i transformacje

Formularz często ma trzy kształty danych:

| Kształt | Cel | Przykład |
| --- | --- | --- |
| UI input | To, co kontrolka potrafi edytować | string z pola daty, lista plików, checkbox state |
| Domain model | To, co znaczy biznesowo | date range, money, address, consent |
| API payload | To, co przyjmuje endpoint | ISO date, cents, IDs, flattened fields |

Waliduj na granicy UI i przed submit. Transformacje rób w jednym miejscu, nazwanym według kierunku, np. `toSubmitPayload`, `fromDraft`, `toDomainCommand`.

## Granice state

| Rodzaj stanu | Należy do | Przykłady |
| --- | --- | --- |
| UI state | Formularz/komponent | touched, dirty, focused field, visible section, local draft |
| Domain state | Domena/API | invariant, allowed transition, business rule, permissions |
| Server state | Query/mutation/backend | remote data, mutation status, cache invalidation, refetch |

Nie kopiuj server state do formularza bez powodu. Jeśli użytkownik edytuje draft, zapisz moment inicjalizacji i świadomie obsłuż konflikt z nowszymi danymi z serwera.

## Dirty i touched

`touched` oznacza, że użytkownik odwiedził pole. `dirty` oznacza, że wartość różni się od wartości początkowej. Te stany sterują momentem pokazywania błędów, ostrzeganiem przed opuszczeniem formularza i aktywacją submitu.

Zasady:

- Błędy pokazuj po blur/touched albo po submit, nie od pierwszego renderu.
- Po pierwszej próbie submit pokazuj wszystkie błędy blokujące wysyłkę.
- Reset formularza powinien resetować dirty/touched i wartości początkowe zgodnie z intencją UX.
- Przy multi-step nie kasuj dirty/touched poprzednich kroków, jeśli użytkownik może wrócić i poprawiać dane.

## Async validation

Walidacja asynchroniczna jest potrzebna dla reguł zależnych od serwera lub kosztownych źródeł, np. unikalności nazwy, limitów konta albo dostępności terminu.

Guard rails:

- Uruchamiaj po blur, po debounce albo przy submit; unikaj requestu na każdy znak.
- Anuluj starsze requesty albo ignoruj ich wyniki, jeśli wartość pola się zmieniła.
- Rozróżnij błąd walidacji od błędu sieciowego i pokaż właściwy status.
- Nie traktuj pozytywnej async validation jako gwarancji submitu; backend nadal musi walidować.
- Testuj scenariusz, w którym starszy request kończy się po nowszym.

## Checklista modelu

```text
- [ ] Schemat lub model walidacyjny jest źródłem prawdy dla reguł.
- [ ] Typ formularza jest wyprowadzony ze schematu albo jawnie powiązany z modelem walidacji.
- [ ] Transformacje UI/domain/API są nazwane i testowalne.
- [ ] UI state, domain state i server state nie dublują siebie nawzajem.
- [ ] Dirty/touched sterują momentem błędów i ostrzeżeń przed opuszczeniem.
- [ ] Async validation ma debounce/anulowanie, status i obsługę race conditions.
```
