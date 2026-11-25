# Walidacje i Pułapki Formularzy

Checklisty, antywzorce i edge cases dla formularzy. Ładuj przed finalizacją implementacji, podczas review albo gdy formularz ma nietypowe wymagania walidacji, dostępności, submitu lub multi-step.

## Checklista końcowa

```text
- [ ] Schemat/model walidacyjny jest źródłem prawdy.
- [ ] Typy formularza nie są ręcznie duplikowane poza schematem.
- [ ] Każde pole ma widoczny label, help/error text i powiązanie błędu z polem.
- [ ] Dirty/touched sterują momentem pokazywania błędów.
- [ ] Async validation ma debounce/anulowanie i obsługę race conditions.
- [ ] Submit blokuje double-submit i pokazuje loading.
- [ ] Payload API powstaje przez jawną transformację.
- [ ] Błędy API mapują się na pola albo form-level error.
- [ ] Po submit z błędami fokus trafia na pierwszy błąd lub summary.
- [ ] CSRF/security i ponowna walidacja backendowa są uwzględnione.
- [ ] Multi-step zachowuje draft i waliduje pełny kontrakt na końcu.
```

## Antywzorce

| Antywzorzec | Skutek | Lepszy wzorzec |
| --- | --- | --- |
| Ręczna walidacja w handlerach | Rozjazd reguł i trudne testy | Schemat/model walidacyjny |
| Typ formularza kopiowany ręcznie | Drift typów i reguł | Typ wyprowadzony ze schematu |
| Placeholder jako label | Utrata kontekstu i problem a11y | Widoczny label |
| Błąd tylko kolorem | Niedostępny feedback | Tekst błędu + stan wizualny |
| Walidacja async na każdy znak | Szum requestów i race conditions | Blur, submit lub debounce |
| Brak mapowania server errors | Użytkownik nie wie, co poprawić | Field errors + form-level error |
| Submit bez loading/disabled | Double-submit i duplikaty | Status pending + blokada submitu |
| Wizard bez draft state | Utrata danych przy nawigacji | Jeden właściciel state/draftu |
| Reset po błędzie sieci | Utrata pracy użytkownika | Zachowaj dane i pokaż retry |
| CSRF pominięty przy sesji cookie | Ryzyko bezpieczeństwa | Token/mechanizm zgodny z backendem |

## Edge cases

### Dynamiczne pola

Jeśli użytkownik może dodawać lub usuwać pola, używaj stabilnych identyfikatorów. Indeks tablicy jako tożsamość pola może przenieść błędy, dirty/touched i fokus na inny rekord po usunięciu elementu.

### Pola zależne

Gdy wartość jednego pola zmienia dostępne opcje albo wymagania innego, zapisz regułę w schemacie. Jeśli zależność unieważnia wcześniejszą wartość, wyczyść ją jawnie i pokaż użytkownikowi, dlaczego.

### Edycja danych z serwera

Po załadowaniu danych z serwera ustal wartości początkowe formularza. Jeśli dane zdalne odświeżą się w trakcie edycji, nie nadpisuj lokalnego draftu bez decyzji UX.

### Formularze w modalach

Przy zamknięciu modala zdecyduj, czy draft jest porzucany, zapisywany czy wymaga potwierdzenia. Po błędzie submitu fokus zostaje w modalu i prowadzi do błędu.

### Upload plików

Sprawdź anulowanie uploadu, usuwanie pliku, retry, limity rozmiaru, wybór tego samego pliku drugi raz, upload wielu plików i błąd częściowy.

### Offline i utrata sieci

Formularz nie powinien tracić danych przy błędzie sieci. Dla długich formularzy rozważ lokalny draft, retry albo komunikat o braku połączenia zgodny z aplikacją.

## Szybka walidacja manualna

1. Otwórz formularz bez danych i spróbuj wysłać.
2. Popraw pierwszy błąd i sprawdź, czy znika w przewidywalnym momencie.
3. Wymuś błąd API pola i błąd API niemapowalny.
4. Kliknij submit kilka razy oraz naciśnij Enter podczas pending.
5. Przejdź klawiaturą przez wszystkie pola.
6. W multi-step wróć do poprzedniego kroku, zmień dane i sprawdź późniejsze kroki.
7. Odśwież stronę lub zamknij modal zgodnie z wymaganiem draftu.

## Sygnały do delegacji

- Pełny audyt semantyki, czytników ekranu, kontrastu i złożonego focus management: `ensuring-accessibility`.
- Komponenty design systemu, layout, responsywność i publiczne API pól: `implementing-frontend`.
- Reużywalne hooki/composables, cleanup, debounce i async cancellation: `writing-hooks`.
- Kontrakt błędów API, CSRF, idempotency key i walidacja backendowa: `implementing-backend`.
- Pełne przepływy użytkownika, regresje keyboard/focus i scenariusze wizardów: `testing-e2e`.
