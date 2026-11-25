# Odbiorca i Utrzymanie — Writing Docs

Referencja dla projektowania dokumentacji pod odbiorcę, progressive disclosure i długoterminową aktualność względem kodu. Używaj jej, gdy dokument ma więcej niż jeden typ czytelnika albo gdy zmiana docs musi zostać wpięta w proces utrzymania.

## Analiza Odbiorcy

Przed pisaniem odpowiedz krótko na cztery pytania:

- Kim jest czytelnik: nowy użytkownik, maintainer, integrator API, operator, reviewer, analityk, product manager?
- Co już wie: domena, język, framework, konwencje repo, ograniczenia produkcyjne?
- Jaki problem rozwiązuje: start, konfiguracja, migracja, debug, decyzja architektoniczna, onboarding?
- W jakim trybie czyta: szybki copy-paste, skanowanie referencji, nauka od zera, presja awarii?

## Progressive Disclosure

Układaj treść w warstwach:

1. Sygnał: co to jest i czy dokument dotyczy mojego problemu.
2. Quick start: minimalny działający wynik.
3. Podstawowe użycie: najczęstsze parametry, konfiguracja i ograniczenia.
4. Referencja: pełne API, tabele, warianty, edge cases.
5. Operacje: troubleshooting, runbooki, migracje i wersjonowanie.

Nie każ czytelnikowi rozumieć architektury, zanim zobaczy pierwszy działający wynik. Nie upychaj zaawansowanych wariantów w ścieżce startowej; linkuj je jako next steps.

## Proces Utrzymania

- Dokumentacja zmienia się w tym samym PR co kod, publiczne API, CLI, konfiguracja, schemat danych lub proces release.
- PR zmieniający zachowanie użytkowe powinien odpowiedzieć: czy README, API docs, tutorial, changelog albo troubleshooting wymagają aktualizacji?
- Właściciel zmiany odpowiada za docs, nawet jeśli finalny tekst przechodzi review documentation engineera.
- Duże zmiany wymagają migration guide albo sekcji „Breaking changes”.
- Docs bez właściciela powinny mieć przynajmniej proces: gdzie zgłosić błąd, jak testować przykłady, kiedy aktualizować wersje.

## Wersjonowanie Docs z Kodem

- Wersjonuj dokumentację razem z branchami i tagami kodu, jeśli użytkownicy korzystają z wielu wersji.
- Oznaczaj zmiany API przez `since`, `deprecated`, `removed` albo migration notes.
- Nie mieszaj dokumentacji starej i nowej wersji na jednej stronie bez jasnych etykiet.
- Przy zmianach breaking aktualizuj README, API reference, changelog i tutoriale, które zawierają stary wzorzec.

## Generowanie z Kodu

Generuj albo synchronizuj automatycznie, gdy ręczne docs łatwo dryfują:

- OpenAPI/Swagger dla REST API.
- GraphQL schema docs dla GraphQL.
- JSDoc/TSDoc/TypeDoc dla publicznego TypeScript API.
- Sphinx/autodoc albo MkDocs Material dla projektów Pythonowych.
- Storybook/MDX dla komponentów UI.
- Changelog helpers, gdy repo ma stabilny format release notes.

Generowanie nie zwalnia z pisania narracji. Wygenerowana referencja mówi „co istnieje”; README, tutorial i troubleshooting mówią „jak skutecznie tego użyć”.

## Docs jako Definition of Done

Zmiana jest gotowa dopiero, gdy dokumentacja odpowiada aktualnemu zachowaniu. Minimalny DoD docs:

- [ ] Użytkownik wie, że zachowanie się zmieniło.
- [ ] Quick start albo tutorial nie prowadzi przez przestarzałą ścieżkę.
- [ ] API docs i CLI examples pasują do kodu.
- [ ] Changelog opisuje zmianę widoczną dla użytkownika.
- [ ] Przykłady, komendy i linki zostały sprawdzone albo ograniczenie walidacji jest jawne.
- [ ] Sekrety i dane prywatne nie trafiły do przykładów.
