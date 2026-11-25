---
name: implement
description: "Wdrażaj funkcję zgodnie z planem."
disable-model-invocation: true
---

# Wdrażanie Funkcji Zgodnie z Planem

> **Kontekst migracji z promptu**: Ten skill powstał w wyniku migracji promptu `.github/prompts/implement.prompt.md` dla środowiska Agent Host / Copilot CLI.
> - **Oryginalny agent**: `software-engineer`

Twoim celem jest zaimplementowanie funkcji zgodnie z dostarczonym planem implementacji oraz kontekstem funkcjonalnym.

Przed rozpoczęciem implementacji dokładnie przeanalizuj plan implementacji i kontekst funkcji. Upewnij się, że wymagania oraz założenia techniczne są w pełni zrozumiałe, aby dostarczyć skuteczne rozwiązania.

Korzystaj z dostępnych narzędzi, aby zebrać niezbędne informacje i dokumentować ustalenia.

Nie odchodź od planu implementacji. Realizuj go krok po kroku, aby zapewnić spełnienie wszystkich wymagań.

Jeśli podczas implementacji zajdzie potrzeba wprowadzenia zmian względem pierwotnego rozwiązania, przed kontynuacją zaczekaj na potwierdzenie. Pamiętaj też, aby udokumentować te zmiany w sekcji Changelog wskazanego pliku planu. Pozwala to zachować przejrzystość i śledzić wszystkie modyfikacje.

## Wymagane skille

Przed rozpoczęciem załaduj i stosuj następujące skille:
- `technical-context-discovering` - aby ustalić konwencje projektu, standardy kodowania i istniejące wzorce
- `implementation-gap-analysing` - aby zweryfikować stan obecny przed wprowadzaniem zmian
- `git-workflow-managing` - aby poprawnie zbootstrapować branch taskowy, wersję docelową i lifecycle GitHub Issue
- `engineering-databases` - podczas implementowania schematów baz danych, migracji, zapytań SQL, dostępu ORM lub pracy z transakcjami i blokadami
- `system-modularising` - warunkowo do rozpoznania, że implementacja zmienia granice modułów/domeny albo wymaga kontraktu domenowego przed kodowaniem
- `implementing-frontend`, `react-architecture`, `react-component-design`, `react-hooks-best-practices`, `react-styling-and-css`, `react-accessibility`, `react-performance`, `react-security-and-deps`, `react-testing` - warunkowo przy implementacji frontendowej lub React UI
- `typescript-best-practices`, `ts-styling-and-linting`, `ts-project-structure`, `testing-ts-js`, `javascript-modern-patterns`, `performance-and-memory-js` - warunkowo przy implementacji TypeScript/JavaScript
- `typescript-best-practices`, `ts-styling-and-linting`, `ts-project-structure`, `testing-ts-js`, `javascript-modern-patterns`, `performance-and-memory-js` - warunkowo przy implementacji TypeScript/JavaScript
- `preventing-common-ts-errors` - podczas generowania lub modyfikowania kodu TypeScript/React/Node; dostarcza checklistę i reguły zapobiegające typowym błędom (replaceAll, negacje, ternary, regex, a11y, promisy, typy).
- `implementing-backend`, `node-backend-guidelines` - warunkowo przy backendzie, API albo usługach Node.js
- `implementing-ci-cd`, `implementing-observability`, `implementing-kubernetes`, `testing-e2e` - warunkowo przy infrastrukturze, obserwowalności, Kubernetes albo testach E2E

## Bootstrap brancha taskowego i Issue

Po zrozumieniu planu, ale przed pierwszą zmianą w repo:

- Ustal repozytorium docelowe i aktualny branch.
- Ustal docelową wersję rozwojową produktu. Preferuj aktywny branch wersyjny albo jednoznaczny aktywny cykl rozwojowy repo. Jeśli wersji nie da się ustalić jednoznacznie, zatrzymaj się i zapytaj użytkownika o wersję docelową.
- Sprawdź, czy w katalogu `.github/Issue` istnieje wygenerowany plik `*.plan.md` dla tego zadania. Jeśli zawiera on numer Issue (pole 'Numer Issue') lub link do Issue (pole 'Link do Issue'), użyj tych danych. Jeśli pliku nie ma lub pola są puste, ustal numer GitHub Issue z kontekstu zadania. Jeśli Issue jest niejednoznaczny albo go brakuje, zatrzymaj się i zapytaj użytkownika.
- Dobierz typ brancha do charakteru zadania: `feat`, `fix`, `tests`, `chore`, a gdy nadal niejednoznaczne użyj `task`.
- Utwórz albo przełącz się na branch taskowy w kanonicznym formacie `<feat|fix|tests|chore|task>/<semver>/Issue/<number>`, startując z docelowego brancha wersyjnego `<semver>`. Jeśli właściwy branch taskowy już istnieje, użyj go zamiast tworzyć nowy.
- Nie zaczynaj implementacji na `main` ani bezpośrednio na branchu wersyjnym, jeśli zmiana ma własny Issue i nie istnieje jeszcze branch taskowy.
- Przed właściwą implementacją spróbuj ustawić status Issue na `In Progress` / `W realizacji` albo najbliższy dostępny odpowiednik. Preferuj status workflow z GitHub Project/boardu, potem repo-local status labels, a gdy brak lepszego mechanizmu zostaw komentarz sygnalizujący rozpoczęcie pracy. Jeśli kilka opcji jest równie prawdopodobnych i nie da się wybrać jednoznacznie, zatrzymaj się i zapytaj użytkownika.

## Reguły mapowania typu zadania → prefix brancha

- `feat`: Nowa funkcja lub widoczna zmiana UX/API. Przykład: "Dodaj ekran ustawień oszczędności".
- `fix`: Naprawa błędu lub niepoprawnego zachowania. Przykład: "Napraw błąd logowania przy pustym tokenie".
- `tests`: Zmiany wyłącznie w testach, fixture'ach lub konfiguracji testów. Przykład: "Dodaj testy jednostkowe dla parsowania".
- `chore`: Prace porządkowe i utrzymaniowe (aktualizacje zależności, CI, skrypty build). Przykład: "Zaktualizuj wersję GitHub Action".
- `task`: Fallback dla prac mieszanych lub niejednoznacznych; użyj gdy nie pasuje do powyższych. Przykład: "Migracja bazy + drobne poprawki".

- Przed implementacją agent musi potwierdzić wybrany prefix i numer Issue (forma: `issue/<number>`), a gałąź taskowa powinna mieć format: `<prefix>/<target-version-or-branch>/Issue/<number>`.
- Jeśli zadanie łączy typy (np. migracja + feature), preferuj `task` i zapytaj użytkownika o preferencję.

## Kontrola modularyzacji przed implementacją

Przed pierwszą zmianą w kodzie sprawdź, czy plan i research zawierają decyzję modularyzacyjną w formacie `modularization: not-needed | use-existing-domain | run-modularise-first | include-in-plan`. Jeśli implementacja zmienia granice modułów lub domeny, tworzy nowy bounded context, przenosi własność danych między modułami, wprowadza zależności między wieloma podsystemami albo nie istnieje jasny kontrakt domenowy (`domain.md`), zatrzymaj implementację i zarekomenduj `/modularise` albo powrót do `/create-plan` z użyciem `system-modularising`. Dla starszych planów lub researchy bez jawnej decyzji modularyzacyjnej: jeśli nie ma sygnałów granic, odnotuj `not-needed` i kontynuuj; jeśli sygnały granic są obecne, zatrzymaj się i wróć do `/create-plan` albo `/modularise`. Nie koduj zmian granicznych na podstawie domysłów.

## Delegowanie wyspecjalizowanych prac

Gdy zakres zadania wyraźnie należy do wyspecjalizowanego workflow, użyj odpowiedniego promptu lub subagenta zamiast mieszać odpowiedzialności w głównym `/implement`:

- Frontend, React UI lub projektowanie interfejsu: użyj `/implement-ui` i/lub uruchom `ui-reviewer` do weryfikacji. Prompt przekazania ma zawierać cel użytkownika, dotknięte pliki, ograniczenia projektowe, właściwe skille React/TS, kryteria akceptacji i oczekiwany wynik.
- Backend, API albo usługi Node.js/TypeScript: użyj `/implement-backend`. Jeśli uruchamiasz subagenta, przekaż kontrakt API, ograniczenia runtime, skille `implementing-backend`, `node-backend-guidelines`, `typescript-best-practices`, `testing-ts-js`, kryteria akceptacji i format wyniku.
- Infrastruktura, CI/CD, obserwowalność, Kubernetes lub IaC: deleguj do `devops-engineer` albo promptów `/implement-pipeline`, `/implement-observability`, `/deploy-kubernetes`. Prompt przekazania ma zawierać target wdrożenia, ograniczenia sekretów, oczekiwania rollbacku/walidacji i właściwe skille infrastrukturalne.
- Projektowanie lub implementacja testów E2E: deleguj do `e2e-engineer` albo `/implement-e2e`. Prompt przekazania ma zawierać przepływy użytkownika, komendę startu aplikacji lub URL, dane testowe/mocki, ograniczenia stabilności, skill `testing-e2e` i oczekiwane pliki/testy.

## Przebieg pracy

1. Dokładnie przeanalizuj plan implementacji oraz kontekst funkcji.
2. Przejrzyj wszystkie instrukcje Copilota w projekcie (`*.instructions.md`) oraz kod źródłowy, aby zrozumieć istniejącą architekturę, standardy kodowania i istotne wytyczne.
3. Zbierz listę poleceń potrzebnych podczas implementacji: uruchamianie testów (jednostkowych, integracyjnych, E2E i innych), linterów, budowania projektu, uruchamiania i generowania migracji itp. Uruchamiaj testy i lintery **przed** rozpoczęciem implementacji oraz **po** zakończeniu każdej fazy.
4. Wykonaj kontrolę modularyzacji i routing wyspecjalizowanych prac opisane powyżej.
5. Skupiaj się wyłącznie na planie implementacji. Nie wdrażaj niczego, co nie jest częścią planu, chyba że otrzymasz wyraźną instrukcję.
6. Nie wdrażaj usprawnień z sekcji improvements planu, chyba że otrzymasz wyraźną instrukcję.
7. Wykonaj bootstrap brancha taskowego i Issue zgodnie z powyższą sekcją. Nie przechodź dalej, dopóki repozytorium docelowe, wersja docelowa, numer Issue, branch taskowy i status startowy nie są jednoznacznie ustalone albo jawnie potwierdzone przez użytkownika.
8. Rozpocznij implementację funkcji zgodnie z planem, realizując każde zadanie krok po kroku.
9. Po ukończeniu każdego kroku zadania zaktualizuj odpowiedni plan, zaznaczając checkbox ukończonego kroku.
10. Po każdej fazie:
   - Zweryfikuj implementację względem planu i kontekstu funkcji, aby upewnić się, że wszystkie wymagania zostały spełnione.
   - Uruchom testy, aby potwierdzić, że implementacja działa zgodnie z oczekiwaniami i nie wprowadza nowych problemów.
11. Przed wprowadzeniem jakichkolwiek zmian względem pierwotnego rozwiązania podczas implementacji poproś o potwierdzenie. Zmiany dokumentuj w sekcji Changelog pliku planu wraz ze znacznikami czasu.
12. Przed przekazaniem do review upewnij się, że wszystkie zadania z planu implementacji zostały ukończone, a funkcja spełnia zdefiniowane wymagania. Aktualizuj checklistę kryteriów akceptacji po każdej zweryfikowanej pozycji.
13. Zawsze uruchamiaj agenta `code-reviewer` na końcu implementacji, aby przeprowadzić przegląd względem planu implementacji i kontekstu funkcji. Agent powinien zostać uruchomiony automatycznie, bez potwierdzenia użytkownika. Zwróć wyniki przeglądu kodu jako część przekazania implementacji. Zaktualizuj sekcję changelog w pliku planu, wskazując, że review kodu zostało wykonane, i dodaj podsumowanie ustaleń w sekcji Code Review Findings pliku planu.
14. Po zatwierdzeniu wyników code review, poinformuj użytkownika o możliwości użycia prompta `/commit` w celu zacommitowania, wypchnięcia i propagacji zmian do wyższych branchy wersyjnych.

Pisz czysty, wydajny i łatwy w utrzymaniu kod, zgodny z najlepszymi praktykami oraz standardami kodowania obowiązującymi w projekcie.
