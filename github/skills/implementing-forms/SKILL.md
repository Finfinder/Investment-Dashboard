---
name: implementing-forms
description: "Architektura formularzy: schema-first validation, kompozycja pól, walidacja, submit lifecycle, błędy serwera, multi-step flow. Przy budowie, refaktorze i review formularzy."
---

# Implementowanie Formularzy

Prowadzi projektowanie formularzy: schema-first validation, kompozycję pól, dostępne błędy, submit lifecycle, server errors i multi-step flow. Aktywny tier trzyma decyzje krytyczne; checklisty, `aria-*`, `novalidate`, pola plikowe, mapowanie API i warianty frameworkowe są w `references/`.

## Kiedy używać

- Budowa, refaktor lub review formularzy, walidacji, field wrapperów, pól plikowych i bibliotek formularzy.
- Projektowanie submitu, async validation, server errors, draft state i blokady double-submit.
- Tworzenie wizardów oraz granic między form state, domain state, server state, backend/API i hookami.

<principles>

<schema-first-validation>
Reguły poprawności definiuj jako osobny schemat lub model walidacyjny. Typ wejścia wyprowadzaj ze schematu, a różnice między UI, domeną i payloadem API opisuj jako jawne transformacje, nie ręczne duplikaty.
</schema-first-validation>

<accessible-form-contract>
Każde pole ma widoczną etykietę, potrzebny help text i tekstowy błąd powiązany z polem. Po nieudanym submit ustaw fokus na pierwszym błędzie; błędy serwera mapuj na pola, a ogólny błąd zostaw dla problemów niemapowalnych.
</accessible-form-contract>

<state-boundaries>
Rozdziel UI state, domain state i server state. Dirty/touched, draft, aktywny krok i focus należą do formularza; reguły biznesowe do domeny/API; dane zdalne, mutacje i invalidacja do server state lub backendu.
</state-boundaries>

<submit-is-a-lifecycle>
Submit to lifecycle: walidacja, fokus na błędy, transformacja danych, double-submit guard, loading, sukces, błędy serwera i CSRF/security. Nie zostawiaj go jako luźnego handlera bez statusów i ścieżek błędu.
</submit-is-a-lifecycle>

</principles>

## Proces

```text
Postęp formularza:
- [ ] Krok 1: Rozpoznaj stos i zdefiniuj schema/state contract
- [ ] Krok 2: Złóż pola jako dostępne field wrappers
- [ ] Krok 3: Zaimplementuj submit lifecycle i błędy serwera
- [ ] Krok 4: Obsłuż async validation i multi-step state, jeśli dotyczy
- [ ] Krok 5: Zweryfikuj, zdeleguj i domknij ryzyka
```

**Krok 1: Rozpoznaj stos i zdefiniuj schema/state contract**

Sprawdź bibliotekę formularzy, walidator, komponenty UI, fetch/mutation i wzorce błędów. Zdefiniuj pola, defaulty, typ wejścia, transformację do payloadu API oraz granicę UI/domain/server state. Async validation uruchamiaj po blur, debounce albo submit, z anulowaniem lub ignorowaniem starych wyników.

**Krok 2: Złóż pola jako dostępne field wrappers**

Pole powinno być wrapperem: label, kontrolka, help text, error text, touched/dirty/error state i integracja z biblioteką. Wrapper nie ukrywa semantyki kontroli ani nie zastępuje labela placeholderem. Dla custom controls i plików załaduj referencję field composition; pełny audyt WCAG deleguj do `ensuring-accessibility`.

**Krok 3: Zaimplementuj submit lifecycle i błędy serwera**

Przed wysyłką waliduj schemat i pokaż błędy przy polach. Podczas wysyłki wyłącz submit, pokaż loading i chroń kliknięcie/Enter przed duplikatem. Po API mapuj field errors na formularz, błędy ogólne na status, a sukces na reset, nawigację, potwierdzenie albo invalidację server state.

**Krok 4: Obsłuż async validation i multi-step state, jeśli dotyczy**

Async validation ma status, debounce/anulowanie i ścieżkę błędu sieciowego. Wizardy waliduj per krok, zachowuj draft, pozwalaj wracać bez utraty danych i pokazuj postęp. Final submit składa komplet danych i ponownie waliduje kontrakt końcowy.

**Krok 5: Zweryfikuj, zdeleguj i domknij ryzyka**

Sprawdź ścieżki: default, dirty/touched, blur validation, lokalne błędy, API errors, loading, double-submit, sukces, reset, keyboard submit i stan multi-step. Deleguj komponenty do `implementing-frontend`, hooki do `writing-hooks`, pełną dostępność do `ensuring-accessibility`, a kontrakt API, CSRF i semantykę błędów do backendu.

## Guard Raile

- Nie waliduj ręcznie w handlerach, jeśli formularz ma schemat albo model walidacyjny.
- Nie duplikuj typów formularza poza schematem; jawnie modeluj transformacje UI -> API -> domena.
- Nie pokazuj błędów po każdym znaku bez powodu; użyj blur, submit albo debounce dla async.
- Nie zostawiaj pola bez widocznej etykiety, tekstowego błędu i programu powiązania błędu z polem.
- Nie ignoruj błędów serwera; mapuj je na pola albo pokazuj jako błąd formularza.
- Nie pozwalaj na double-submit i nie wysyłaj formularza bez loading/statusu.
- Nie gub dirty/touched ani draftu przy przejściu między krokami.
- Nie pomijaj CSRF/security, gdy formularz mutuje dane lub działa na sesji użytkownika.

## Materiały Referencyjne

Ładuj referencje tylko dla dotkniętego obszaru:

- `./references/schema-and-state.md` — schema-first validation, typy, async validation, UI/domain/server state oraz dirty/touched.
- `./references/field-composition-and-accessibility.md` — field wrappers, label/help/error text, `aria-*`, file upload, keyboard i focus; pełny audyt deleguj do `ensuring-accessibility`.
- `./references/submit-and-server-errors.md` — submit lifecycle, `novalidate`, double-submit, loading, transformacje danych, mapowanie błędów API, CSRF/security.
- `./references/multi-step-forms.md` — wizardy, walidacja per krok, draft/state, progress indicator i final submit.
- `./references/validations-and-sharp-edges.md` — checklisty, antywzorce, edge cases i szybkie kontrole przed finalizacją.
- `./references/blazor-patterns.md` — wzorce formularzy Blazor.

## Powiązane Skille

- `ensuring-accessibility` — WCAG, ARIA, keyboard, focus i screen reader behavior.
- `implementing-frontend` — komponenty UI, design system, layout i organizacja modułów.
- `writing-hooks` — field hooks, multi-step hooks, async cancellation i dirty/touched helpers.
- `implementing-backend` — kontrakty API, walidacja serwerowa, CSRF i semantyka błędów.
- `testing-e2e` — Playwright flows dla submitu, błędów, fokusu i wizardów.
