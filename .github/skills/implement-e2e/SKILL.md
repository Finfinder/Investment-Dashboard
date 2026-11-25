---
name: implement-e2e
description: "Twórz, utrzymuj i uruchamiaj testy E2E dla danej funkcji lub historii użytkownika."
disable-model-invocation: true
---

# Workflow Testów E2E

> **Kontekst migracji z promptu**: Ten skill powstał w wyniku migracji promptu `.github/prompts/implement-e2e.prompt.md` dla środowiska Agent Host / Copilot CLI.
> - **Oryginalny agent**: `e2e-engineer`

**Tryb nieinteraktywny** - podejmuj rozsądne decyzje i je dokumentuj.

## Wymagane Skille

Przed rozpoczęciem załaduj i stosuj poniższe skille:
- `task-analysing` - aby określić źródło wejścia i zebrać wymagania zadania
- `technical-context-discovering` - aby ustalić konwencje testów, istniejące wzorce oraz konfigurację projektu
- `git-workflow-managing` - aby poprawnie zbootstrapować branch taskowy, wersję docelową i lifecycle GitHub Issue
- `testing-e2e` - dla wzorców Page Object, struktury testów, strategii mockowania, reguł pętli weryfikacji, odzyskiwania po błędach i checklisty gotowości CI
- `testing-ts-js` - wyłącznie dla bibliotek pomocniczych TS/JS, typowanych fixture'ów oraz unit/integration harness wokół kodu wspierającego E2E; pełne przepływy Playwright pozostają w zakresie `testing-e2e`

---

## 0. Bootstrap Git i Issue przed pierwszą zmianą

Po zrozumieniu kontekstu zadania, ale przed pierwszą zmianą w repo:

- Ustal repozytorium docelowe, aktualny branch i docelową wersję rozwojową. Preferuj aktywny branch wersyjny albo jednoznaczny aktywny cykl rozwojowy repo. Jeśli wersji nie da się ustalić jednoznacznie, zatrzymaj się i zapytaj użytkownika.
- Sprawdź, czy w katalogu `.github/Issue` istnieje wygenerowany plik `*.plan.md` dla tego zadania. Jeśli zawiera on numer Issue (pole 'Numer Issue') lub link do Issue (pole 'Link do Issue'), użyj tych danych. Jeśli pliku nie ma lub pola są puste, ustal numer GitHub Issue z kontekstu zadania. Jeśli Issue jest niejednoznaczny albo go brakuje, zatrzymaj się i zapytaj użytkownika.
- Dobierz typ brancha zgodnie z charakterem zadania; dla typowych zmian E2E preferuj `tests`, a gdy nadal niejednoznaczne użyj `task`.
- Utwórz albo przełącz się na branch taskowy `<feat|fix|tests|chore|task>/<semver>/Issue/<number>` z docelowego brancha wersyjnego `<semver>`. Nie zaczynaj pracy na `main` ani bezpośrednio na branchu wersyjnym, jeśli zadanie ma własny Issue i nie istnieje jeszcze branch taskowy.
- Dotyczy to również obowiązkowego bootstrapu brancha taskowego `<feat|fix|tests|chore|task>/<semver>/Issue/<number>` (użyj 'task' jako fallback).
- Przed właściwą implementacją testów spróbuj ustawić status Issue na `In Progress` / `W realizacji` albo najbliższy odpowiednik. Preferuj workflow statusów w GitHub Project/boardzie, potem repo-local status labels, a przy ich braku zostaw komentarz sygnalizujący rozpoczęcie pracy. Jeśli wybór statusu jest niejednoznaczny, zatrzymaj się i zapytaj użytkownika.

## Reguły mapowania typu zadania → prefix brancha

- `feat`: Nowa funkcja lub widoczna zmiana UX/API. Przykład: "Dodaj ekran ustawień oszczędności".
- `fix`: Naprawa błędu lub niepoprawnego zachowania. Przykład: "Napraw błąd logowania przy pustym tokenie".
- `tests`: Zmiany wyłącznie w testach, fixture'ach lub konfiguracji testów. Przykład: "Dodaj testy jednostkowe dla parsowania".
- `chore`: Prace porządkowe i utrzymaniowe (aktualizacje zależności, CI, skrypty build). Przykład: "Zaktualizuj wersję GitHub Action".
- `task`: Fallback dla prac mieszanych lub niejednoznacznych; użyj gdy nie pasuje do powyższych. Przykład: "Migracja bazy + drobne poprawki".

- Przed implementacją agent musi potwierdzić wybrany prefix i numer Issue (forma: `issue/<number>`), a gałąź taskowa powinna mieć format: `<prefix>/<target-version-or-branch>/Issue/<number>`.
- Jeśli zadanie łączy typy (np. migracja + feature), preferuj `task` i zapytaj użytkownika o preferencję.

---

## 1. Kontekst

Postępuj zgodnie z krokiem **Step 0 (Determine input source)** skilla `task-analysing`, aby określić, czy kontekst pochodzi z plików research/plan, numeru/linku GitHub Issue, czy bezpośrednio z wiadomości promptu.

Dodatkowo zawsze:
- Sprawdź `*.instructions.md` -> konwencje specyficzne dla projektu
- Przeanalizuj `playwright.config.ts` oraz istniejące Page Objecty
- Odkryj istniejące wzorce testów i strategie locatorów w kodzie

---

## 2. Planowanie

Przypisz kryteria akceptacji do scenariuszy:

| Kryterium Akceptacji | Typ Scenariusza | Nazwa Testu |
|---------------------|---------------|-----------|
| [z planu/promptu] | Happy/Error/Edge | `powinno [zachowanie], gdy [warunek]` |

Checklista:
- [ ] Każde kryterium -> co najmniej jeden test
- [ ] Potrzeby mockowania API udokumentowane
- [ ] Lista Page Objectów do utworzenia

---

## 3. Implementacja i Weryfikacja

Stosuj skill `testing-e2e` dla:
- Wzorców Page Object i struktury testów
- Strategii mockowania (wyłącznie zewnętrzne API)
- Reguł pętli weryfikacji i limitów iteracji
- Procedur odzyskiwania po błędach
- Checklisty gotowości CI

---

## 4. Podsumowanie (wymagany output)

```markdown
## Podsumowanie Testów E2E

### Pokrycie
| Kryterium | Test | Status |
|-----------|------|--------|
| [z planu/promptu] | [plik#test] | ✅/❌ |

Pokrycie: X/Y (Z%)

### Wyniki
| Plik | Pass | Fail | Flaky | CI |
|------|------|------|-------|-----|
| login.spec.ts | 5 | 0 | 0 | ✅ |

### Problemy
- 🐛 BUG: [opis] -> test.fixme()
- ⚠️ FLAKY: [opis] -> wymaga analizy

### Pliki
- NOWY: tests/auth/login.spec.ts
- NOWY: pages/login.page.ts
```

Zaktualizuj plan (jeśli plik planu istnieje): odznacz kryteria akceptacji i dodaj pliki do Change Log.

---

## 5. Code Review (automatyczny)

Po zakończeniu implementacji testów E2E zawsze uruchamiaj agenta `code-reviewer`, aby zweryfikować testy E2E względem najlepszych praktyk i standardów jakości testów. Agent powinien być uruchamiany automatycznie, bez potwierdzenia użytkownika. Zaktualizuj sekcję changelog w pliku planu, wskazując że wykonano code review E2E i dodaj podsumowanie ustaleń.
