---
name: ensuring-accessibility
description: Zapewnienie dostępności WCAG 2.1 AA: semantyczny HTML, wzorce ARIA, nawigacja klawiaturą, zarządzanie fokusem, kontrast i wsparcie screen readerów. Używaj przy implementacji dostępnych komponentów, audytach a11y i inkluzywnych formularzach.
---

# Zapewnianie Dostępności

Prowadzi prace nad zgodnością WCAG 2.1 AA: semantyczny HTML, ARIA, klawiatura, fokus, kontrast, formularze i screen readers. Aktywny tier zostawia guard raile; szczegóły, tabele i przykłady są w `references/`.

## Kiedy używać

- Dostępne komponenty, interaktywne widżety, modale, menu, zakładki i formularze.
- Audyt a11y, review UI, WCAG 2.1 AA albo naprawa regresji dostępności.
- Semantyczny HTML, landmarki, ARIA, accessible names i drzewo dostępności.
- Klawiatura, focus management, focus trap, route focus, screen readers i live regions.
- Kontrast, focus indicators, stany wizualne, zoom/reflow i informacja nieoparta wyłącznie o kolor.

<principles>

<semantic-html-before-aria>
Najpierw dobierz właściwy element HTML. ARIA uzupełnia brakującą semantykę, ale nie naprawia złego wzorca ani nie dubluje natywnej semantyki bez potrzeby.
</semantic-html-before-aria>

<keyboard-first-class-path>
Klawiatura jest pełnoprawną ścieżką użycia. Każda akcja myszy ma działać przez Tab, Shift+Tab, Enter, Space, Escape albo strzałki zgodnie ze wzorcem komponentu.
</keyboard-first-class-path>

<focus-is-application-state>
Fokus traktuj jak stan aplikacji: po modalach, zmianie trasy, walidacji i aktualizacjach użytkownik musi wiedzieć, gdzie jest i co się zmieniło.
</focus-is-application-state>

<accessibility-is-ui-contract>
Dostępność jest kontraktem UI. Nazwa, rola, stan, opis, kontrast, widoczny fokus i błędy muszą pozostać stabilne przy refaktorach.
</accessibility-is-ui-contract>

<automated-and-manual-validation>
Axe-core, lintery i testy E2E wspierają walidację, ale nie zastępują klawiatury, screen reader smoke testu i oceny sensu komunikatów.
</automated-and-manual-validation>

</principles>

## Proces

```text
Postęp a11y:
- [ ] Krok 1: Rozpoznaj wzorce repozytorium
- [ ] Krok 2: Zaprojektuj semantykę
- [ ] Krok 3: Zapewnij klawiaturę i fokus
- [ ] Krok 4: Obsłuż formularze, zmiany dynamiczne i kontrast
- [ ] Krok 5: Przetestuj automatycznie i ręcznie
- [ ] Krok 6: Zdeleguj szczegóły do powiązanych skilli
```

**Krok 1: Rozpoznaj wzorce repozytorium**

- Sprawdź stack, design system, komponenty bazowe, helpery testowe, lint i E2E.
- Używaj lokalnych prymitywów a11y: dialog, visually-hidden, field wrapper, live region, skip link, focus helper.

**Krok 2: Zaprojektuj semantykę**

- Wybierz natywne elementy HTML i landmarki przed ARIA: `<button>`, `<a href>`, `<main>`, `<nav>`, `<label>`, pola formularza.
- Zapewnij accessible name, rolę, stan i opis elementów interaktywnych oraz informacji nietekstowych.
- Dodawaj ARIA tylko tam, gdzie HTML nie wystarcza: `aria-expanded`, `aria-current`, `aria-describedby`, `aria-invalid`, `aria-modal`, live regions.

**Krok 3: Zapewnij klawiaturę i fokus**

- Zweryfikuj logiczny focus order i brak `tabindex > 0`.
- Custom widgets obsługują Enter/Space/Escape/strzałki i widoczny focus indicator.
- Dialogi/modale wymagają focus trapu, sensownego Escape i powrotu fokusu do triggera albo logicznego następcy.
- Po zmianie trasy, submit z błędami lub zmianie kontekstu ustaw fokus albo ogłoś zmianę równoważnym mechanizmem.

**Krok 4: Obsłuż formularze, zmiany dynamiczne i kontrast**

- Formularze wymagają widocznych etykiet, powiązanych opisów i błędów, `aria-invalid` oraz `aria-describedby`.
- Istotne zmiany dynamiczne komunikuj przez live regions, `role="status"`, `role="alert"` albo równoważny mechanizm.
- Zachowaj kontrast WCAG 2.1 AA: 4.5:1 dla tekstu normalnego, 3:1 dla dużego tekstu oraz UI indicators/focus indicators.
- Nie przekazuj błędu, statusu ani informacji wyłącznie kolorem; dodaj tekst, ikonę z nazwą, kształt albo semantyczny stan.

**Krok 5: Przetestuj automatycznie i ręcznie**

- Uruchom dostępne w repo lintery, axe-core albo testy Playwright/axe dla dotkniętego flow.
- Przejdź krytyczne flow klawiaturą i sprawdź widoczność fokusu, kolejność, Escape oraz pułapki fokusu.
- Wykonaj screen reader smoke test dla krytycznych flow: nazwy, role, stany, błędy, live updates i powrót fokusu.
- Sprawdź kontrast, zoom/reflow i motywy, jeśli zmiana dotyka stylów.

**Krok 6: Zdeleguj szczegóły do powiązanych skilli**

- Gdy zadanie przechodzi w implementację, testy E2E, formularze, review, UI verification, performance albo hooki, użyj właściwego powiązanego skilla.
- W finalnej odpowiedzi oddziel walidację automatyczną od manualnej i nazwij pominięte kroki.

## Guard Rails

- Celem jest WCAG 2.1 AA; wyjątki wymagają jawnego opisania ryzyka i powodu.
- Semantyka, nazwa, rola, stan i opis elementu muszą odpowiadać zachowaniu widocznemu w UI.
- Wszystkie elementy interaktywne muszą być osiągalne i obsługiwalne klawiaturą.
- Fokus musi być widoczny, logiczny i zarządzany przy zmianach kontekstu; dialogi/modale wymagają focus trapu i powrotu fokusu.
- Kontrast: minimum 4.5:1 dla tekstu normalnego oraz 3:1 dla dużego tekstu, kontrolek, focus indicators i informacji nietekstowych.
- Błędy, statusy i istotne dynamiczne zmiany muszą mieć widoczny komunikat oraz live region albo równoważny mechanizm dla technologii asystujących.
- Krytyczne flow wymagają screen reader smoke testu, zwłaszcza formularze, modale, nawigacja i operacje z błędami.
- Axe-core i lintery traktuj jako wsparcie, nie jako dowód pełnej zgodności bez manualnej walidacji.

## Zakazy

- Nie używaj `div`/`span` jako przycisku lub linku bez pełnej semantyki, `tabindex="0"` i obsługi Enter/Space.
- Nie usuwaj `outline` ani focus indicator bez równoważnego, widocznego zamiennika.
- Nie używaj `tabindex > 0`.
- Nie dubluj ani nie nadpisuj natywnej semantyki ARIA bez potrzeby.
- Nie komunikuj błędu, statusu ani informacji wyłącznie kolorem.
- Nie zostawiaj formularzy bez widocznych etykiet oraz powiązanych komunikatów błędów.
- Nie oznaczaj elementów interaktywnych lub sfokusowanych przez `aria-hidden="true"`.

## Materiały Referencyjne

Ładuj tylko referencje potrzebne do konkretnego zadania:

- `./references/semantic-html-and-aria.md` — semantyczny HTML, landmarki, role, accessible names, ARIA, wzorce i antywzorce.
- `./references/keyboard-and-focus.md` — klawiatura, focus order, focus trap, route focus, skip links, roving tabindex, Escape i zmiany fokusu.
- `./references/contrast-and-visual-states.md` — kontrast, focus indicators, stany, kolor, zoom/reflow, reduced motion, RTL i visual regressions.
- `./references/forms-and-screen-readers.md` — formularze, etykiety, błędy, `aria-describedby`, `role="alert"`, `aria-live`, screen reader smoke i multi-step forms.
- `./references/validations.md` — axe-core, eslint/jsx-a11y, Playwright, keyboard walkthrough, screen reader smoke, kontrast, zoom/reflow i raport.
- `./references/collaboration.md` — kontrakty przekazania pracy do powiązanych skilli i artefakty na granicach odpowiedzialności.
- `./references/blazor-patterns.md` — Blazor Server/WebAssembly: focus management, `EditForm`, `InputBase<T>`, bUnit i antywzorce.

## Powiązane Skille

- `implementing-frontend` — implementacja komponentów i design systemu po ustaleniu wymagań a11y.
- `reviewing-frontend` — szybkie findings review dla regresji UI.
- `testing-e2e` — Playwright/axe E2E flows, lokatory po roli/nazwie, asercje fokusu.
- `implementing-forms` — pogłębione formularze, walidacja, pola i wieloetapowe flow.
- `ui-verifying` — zgodność z projektem, screenshoty, tolerancje, overlap, responsywność i stany.
- `optimizing-frontend` — tylko gdy zmiany a11y dotykają performance, bundla, lazy loadingu albo animacji.
- `writing-hooks` — reusable lifecycle/focus/cleanup hooki, focus trap, route focus, Escape i roving tabindex.
