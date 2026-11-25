---
agent: "software-engineer"
model: "Auto"
description: "Zaimplementuj funkcję UI zgodnie z planem, z ciągłą weryfikacją wizualną."
---

> **WARUNEK WSTĘPNY**: Ten prompt rozszerza [implement.prompt.md](./implement.prompt.md). MUSISZ przeczytać i zastosować **wszystkie kroki** z bazowego workflow. Ten prompt dodaje zachowania specyficzne dla UI — nie usuwa ani nie zastępuje kroków bazowych.

Zaimplementuj funkcję UI zgodnie z **kontekstem badań** i **planem implementacji**, używając specyfikacji projektu i baseline UI jako źródła prawdy dla implementacji wizualnej.

## Wymagane umiejętności

Oprócz umiejętności wymaganych przez workflow bazowy, załaduj i stosuj:

- `implementing-frontend` — wzorce komponentów, użycie systemu projektowego, kompozycja i wytyczne wydajnościowe
- `ensuring-accessibility` — zgodność z WCAG 2.1 AA, semantyczny HTML, ARIA i automatyczna weryfikacja axe-core

## Referencje projektowe z Research i Plan

Zawsze traktuj pliki **research** i **plan** jako jedyne źródło linków do specyfikacji projektu:

- Przed rozpoczęciem implementacji (kroki 1–2 workflow bazowego):
  - Otwórz plik **research** (`*.research.md`) i szukaj:
    - Referencji projektowych i linków w sekcji `Relevant Links`.
    - Linków do konkretnych komponentów/widoków w `Gathered Information`.
  - Otwórz plik **plan** (`*.plan.md`) i szukaj:
    - Referencji projektowych w `Task details`.
    - Strukturalnej sekcji "Design References" mapującej widoki/komponenty na referencje projektowe lub ID widoków.
- Użyj tych referencji projektowych jako **domyślnego źródła** dla wszystkich odwołań do projektu podczas implementacji.

### Gdy brakuje referencji projektowej

Jeśli nie możesz znaleźć referencji projektowej dla komponentu/sekcji, którą zamierzasz zaimplementować:

1. **Zatrzymaj się** — nie kontynuuj implementacji tego komponentu
2. **Poproś użytkownika** o podanie referencji projektowej lub specyfikacji dla konkretnej sekcji
3. **Poczekaj na referencję** przed kontynuowaniem implementacji
4. **Dodaj referencję** do pliku planu po jej uzyskaniu (w `Task details` lub `Design References`)

NIE:
- Pomijaj implementacji z powodu braku referencji
- Zgaduj, jak powinien wyglądać projekt
- Kontynuuj implementację bez referencji projektowej

## Dodatkowa konfiguracja (przed rozpoczęciem implementacji)

Przed krokiem 6 workflow bazowego (rozpoczęcie implementacji) upewnij się, że:

- Lokalny serwer deweloperski jest uruchomiony.
- Masz dostęp do strony, którą implementujesz (uwierzytelniony, jeśli potrzeba).
- Zidentyfikowałeś wszystkie istotne referencje projektowe z plików research/plan.
- Rozumiesz tokeny systemu projektowego i komponenty dostępne w projekcie.

## Uwaga o weryfikacji UI

**Weryfikacja UI NIE jest Twoją jedyną odpowiedzialnością.** Pętla verify-fix jest obsługiwana przez agenta `ui-reviewer`. Skup się na implementacji UI zgodnie z planem i referencjami projektowymi. Jeśli otrzymasz raport weryfikacyjny z problemami do naprawy, zastosuj poprawki i zgłoś wynik.
