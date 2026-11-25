# Submit i Błędy Serwera

Szczegóły lifecycle wysyłki formularza, blokady double-submit, loading state, transformacji danych, mapowania błędów API oraz CSRF/security. Ładuj przed implementacją submit handlera lub mutacji formularza.

## Lifecycle submitu

1. Zatrzymaj domyślną wysyłkę tylko przez mechanizm biblioteki formularzy lub poprawny handler formularza.
2. Uruchom pełną walidację schematu dla danych, które mają zostać wysłane.
3. Jeśli dane są niepoprawne, pokaż błędy, ustaw fokus na pierwszy błąd i przerwij wysyłkę.
4. Przetransformuj dane UI do payloadu API: trim, normalizacja dat, liczby, identyfikatory i pliki.
5. Ustaw `isSubmitting` albo równoważny status, wyłącz submit i pokaż loading.
6. Wywołaj mutację z obsługą sukcesu, błędów pól, błędów ogólnych i błędów sieci.
7. Po zakończeniu odblokuj submit, chyba że flow przechodzi do innego stanu, np. redirect albo success screen.

## `novalidate` i walidacja przeglądarki

Gdy formularz używa własnego schematu i kontrolowanej prezentacji błędów, dodaj `novalidate` albo lokalny odpowiednik, aby natywne dymki przeglądarki nie konkurowały z UI błędów.

Nie usuwaj natywnych semantycznych typów pól. `type="email"`, `type="number"`, `autocomplete`, `required` i input modes mogą nadal pomagać klawiaturom, autofillowi i technologiom asystującym, nawet jeśli finalna walidacja jest schematem.

## Double-submit i loading

Podwójna wysyłka może powstać przez szybkie kliknięcia, Enter, retry przeglądarki albo remount komponentu. Ochrona powinna istnieć w UI i po stronie serwera dla operacji krytycznych.

Reguły:

- Wyłącz przycisk submit, gdy wysyłka trwa.
- Ignoruj kolejne wywołanie submitu, jeśli status nadal jest pending.
- Dla operacji finansowych lub idempotentnych mutacji użyj idempotency key, jeśli API to wspiera.
- Loading nie może usuwać informacji o tym, co jest wysyłane, jeśli użytkownik musi zachować kontekst.

## Transformacje danych

Transformuj dane jawnie i blisko granicy submitu:

- trim i normalizacja pustych stringów;
- konwersja dat do formatu API;
- liczby z kontrolki tekstowej do typu oczekiwanego przez API;
- listy checkboxów/radio do wartości domenowych;
- pliki do `FormData` albo osobnego upload flow;
- usunięcie pól UI-only z payloadu.

Transformacja nie powinna ukrywać reguł biznesowych. Jeśli backend odrzuca transformowany payload, popraw schemat lub kontrakt API zamiast łatać pojedynczy handler.

## Mapowanie błędów API

Uzgodnij format błędów z backendem. Najwygodniejszy kontrakt zawiera nazwę pola, kod błędu i komunikat możliwy do pokazania użytkownikowi.

Mapowanie:

| Odpowiedź API | UI formularza |
| --- | --- |
| Błąd pola | Inline error przy polu i aktualizacja form state |
| Błąd wielu pól | Inline errors + opcjonalne summary po submit |
| Błąd niemapowalny | Form-level alert/status z akcją retry albo kontaktem |
| Błąd autoryzacji | Flow logowania/uprawnień, nie zwykły field error |
| Błąd sieci | Komunikat o retry, zachowanie draftu, brak resetu danych |

Jeśli API zwraca nazwy pól inne niż UI, utrzymuj mapę w jednym miejscu. Nie rozrzucaj mapowania po każdym komponencie pola.

## CSRF i security

Formularze mutujące dane muszą respektować model bezpieczeństwa aplikacji.

- Dla cookie/session auth sprawdź, czy wymagany jest CSRF token i czy submit go wysyła.
- Nie wkładaj sekretów, tokenów ani ukrytych uprawnień do pól formularza jako źródła prawdy.
- Walidacja klienta poprawia UX, ale backend musi walidować ponownie.
- Nie loguj pełnych payloadów formularzy, jeśli mogą zawierać PII, pliki, tokeny lub dane płatnicze.
- Przy uploadzie plików uwzględnij typy plików, rozmiary, skanowanie po stronie serwera i limity.

## Checklista submitu

```text
- [ ] Submit uruchamia pełną walidację schematu.
- [ ] Błędy lokalne ustawiają fokus na pierwszy problem i nie wysyłają requestu.
- [ ] Payload API powstaje przez jawną transformację.
- [ ] Double-submit jest zablokowany w UI i uwzględniony w API, jeśli operacja jest krytyczna.
- [ ] Loading, success, field errors, form errors i network errors mają osobne stany.
- [ ] Błędy API są mapowane przez jeden kontrakt.
- [ ] CSRF/security, PII i upload limits zostały sprawdzone.
```
