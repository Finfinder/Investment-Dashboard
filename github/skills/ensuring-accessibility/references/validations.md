# Reguły Walidacji - Zapewnianie Dostępności

Walidacje automatyczne i manualne dla dostępności: axe-core, eslint/jsx-a11y, Playwright, walkthrough klawiaturą, screen reader smoke, kontrast, zoom/reflow i raport walidacyjny.

## Podsumowanie reguł

| ID | Nazwa | Severity | Kategoria |
| --- | --- | --- | --- |
| V-01 | Automatyczny skan axe-core | ERROR | Automatyczne |
| V-02 | Linter semantyki i ARIA | WARNING | Automatyczne |
| V-03 | Playwright E2E a11y flow | WARNING | Automatyczne |
| V-04 | Keyboard walkthrough | ERROR | Manualne |
| V-05 | Screen reader smoke | ERROR | Manualne |
| V-06 | Kontrast i visual states | ERROR | Manualne |
| V-07 | Zoom i reflow | WARNING | Manualne |
| V-08 | Raport walidacyjny | INFO | Dokumentacja |

## Walidacje automatyczne

### V-01: Automatyczny skan axe-core

**Severity:** ERROR
**Dotyczy:** widoki lub story objęte zmianą UI

**Opis:** Uruchom axe-core jako szybki skan oczywistych naruszeń WCAG. Wynik grupuj według wpływu: critical, serious, moderate, minor.

**Detekcja:** Playwright `@axe-core/playwright`, `npx @axe-core/cli <URL>`, Storybook addon albo lokalny helper repozytorium.

**Akcja naprawcza:** Usuń naruszenia critical/serious przed finalizacją; dla pozostałych opisz ryzyko, jeśli naprawa wymaga decyzji projektowej.

### V-02: Linter semantyki i ARIA

**Severity:** WARNING
**Dotyczy:** React/JSX, Vue, Angular, Blazor analyzers albo odpowiedniki stacku

**Opis:** Linter wykrywa typowe błędy: brak `alt`, złe ARIA props, click handler bez klawiatury, `tabindex` i nieprawidłowe role.

**Detekcja:** `eslint-plugin-jsx-a11y`, frameworkowy analyzer albo istniejący pipeline lint.

**Akcja naprawcza:** Popraw przyczynę reguły; nie wyłączaj reguły bez lokalnego uzasadnienia i manualnej walidacji.

### V-03: Playwright E2E a11y flow

**Severity:** WARNING
**Dotyczy:** krytyczne ścieżki użytkownika

**Opis:** Test E2E powinien sprawdzić dostępność flow po stanie docelowym, a nie tylko statyczny pierwszy render.

**Detekcja:** Playwright z `@axe-core/playwright`, lokatory po roli i nazwie, asercje fokusu oraz stanów ARIA.

**Akcja naprawcza:** Dodaj test dla przepływu, który zmiana dotyka, szczególnie formularzy, modali, filtrów i nawigacji.

## Walidacje manualne

### V-04: Keyboard walkthrough

**Severity:** ERROR
**Dotyczy:** wszystkie interaktywne flow

**Opis:** Przejdź flow samą klawiaturą: `Tab`, `Shift+Tab`, `Enter`, `Space`, strzałki i `Escape`.

**Akcja naprawcza:** Napraw nieosiągalne akcje, nielogiczny focus order, niewidoczny fokus i pułapki fokusu.

### V-05: Screen reader smoke

**Severity:** ERROR
**Dotyczy:** krytyczne flow, formularze, modale i dynamiczne statusy

**Opis:** Potwierdź nazwę, rolę, stan, opis, komunikaty błędów i live updates w realnym czytniku ekranu.

**Akcja naprawcza:** Skoryguj semantykę, accessible names, `aria-describedby`, live regions i zarządzanie fokusem.

### V-06: Kontrast i visual states

**Severity:** ERROR
**Dotyczy:** tekst, focus indicators, ikony statusu, kontrolki i motywy

**Opis:** Sprawdź progi WCAG 2.1 AA: 4.5:1 dla tekstu normalnego, 3:1 dla dużego tekstu i UI indicators.

**Akcja naprawcza:** Zmień tokeny, warianty kolorów albo dodatkowe oznaczenia stanu; nie polegaj wyłącznie na kolorze.

### V-07: Zoom i reflow

**Severity:** WARNING
**Dotyczy:** widoki responsywne, dashboardy, tabele, formularze

**Opis:** Sprawdź 200% zoom i 400% zoom / 320px szerokości pod kątem utraty treści, overlapów i poziomego scrolla.

**Akcja naprawcza:** Popraw layout, wrapping, min/max, overflow i kolejność treści.

## Raport

### V-08: Raport walidacyjny

**Severity:** INFO
**Dotyczy:** finalna odpowiedź, PR description albo notatka review

**Opis:** Raport powinien oddzielać wyniki automatyczne od manualnych i wskazywać niewykonane kroki.

**Format:**

```text
Walidacja a11y:
- Automatyczne: axe-core PASS, lint a11y PASS
- Manualne: keyboard PASS, screen reader smoke PASS, contrast PASS
- Zakres: formularz rejestracji i modal potwierdzenia
- Pozostałe ryzyko: brak albo krótki opis niewykonanej walidacji
```

Axe-core i lintery są wsparciem, ale nie zastępują manualnej walidacji klawiaturą, fokusu, czytnika ekranu i sensu komunikatów.
