---
name: create-plan
description: "Przygotuj szczegółowy plan implementacji dla danej funkcji."
disable-model-invocation: true
---

# Plan Implementacji Funkcji

> **Kontekst migracji z promptu**: Ten skill powstał w wyniku migracji promptu `.github/prompts/create-plan.prompt.md` dla środowiska Agent Host / Copilot CLI.
> - **Oryginalny agent**: `architect`

Przeanalizuj plik kontekstu funkcji dla podanego zadania lub numeru GitHub Issue. Na tej podstawie przygotuj szczegółowy plan implementacji, który inżynier oprogramowania będzie mógł realizować krok po kroku, aby dostarczyć funkcję.

Wynikiem powinien być plik Markdown nazwany na podstawie nazwy zadania zapisanej małymi literami, bez polskich znaków i spacji zamienionych na myślniki (np. Logowanie użytkownika → logowanie-uzytkownika.plan.md), z sufiksem .plan.md. Plik powinien zostać umieszczony w katalogu .github/Issue.

Pliki `*.plan.md` ZAWSZE twórz w języku polskim.

## Wymagane umiejętności

Przed rozpoczęciem załaduj i stosuj poniższe skille (skille oznaczone jako „warunkowo” załaduj tylko wtedy, gdy ich kryteria są spełnione):
- `architecture-designing` - do procesu projektowania architektury oraz szablonu wyniku (`plan.example.md`)
- `codebase-analysing` - do analizy istniejącej bazy kodu
- `implementation-gap-analysing` - do weryfikacji, co już istnieje, a co należy zbudować
- `technical-context-discovering` - do zrozumienia konwencji i wzorców projektu
- `code-reviewing` - jako źródło wspólnego kontraktu weryfikacyjnego z `.github/skills/code-reviewing/references/validations.md`, aby zaplanować adekwatne quality gates, kryteria review i walidacje bez wykonywania review na etapie planowania
- `engineering-databases` - gdy funkcja obejmuje projektowanie schematu bazy danych, zmiany modelu danych, migracje lub implementację opartą o intensywne zapytania
- `system-modularising` - warunkowo, gdy plan dotyczy bounded contexts, granic modułów, agregatów, kontraktu domenowego albo dekompozycji monolitu
- `react-architecture`, `react-component-design`, `react-hooks-best-practices`, `react-styling-and-css`, `react-performance`, `react-accessibility`, `react-security-and-deps` - warunkowo przy planowaniu frontendowych zmian React
- `typescript-best-practices`, `ts-project-structure`, `testing-ts-js`, `node-backend-guidelines`, `javascript-modern-patterns` - warunkowo przy planowaniu systemów TypeScript/JavaScript, Node.js albo testów TS/JS

## Przepływ pracy

1. **Analiza kontekstu**: Dokładnie przejrzyj plik kontekstu funkcji (`.research.md`), aby zrozumieć wymagania i zakres. Jeśli plik kontekstu funkcji `.research.md` nie istnieje lub jest pusty, zatrzymaj planowanie i poproś użytkownika o podanie ścieżki do pliku albo o wymagania, zanim utworzysz plik `*.plan.md`. Zweryfikuj wymagania względem najlepszych praktyk branżowych, domenowych i firmowych.
2. **Dane Issue**: Jeśli użytkownik podał link lub numer Issue w kontekście promptu (np. w rozmowie przed wywołaniem `/create-plan`), wyodrębnij te dane i umieść w generowanym pliku `*.plan.md` w sekcji „Szczegóły Zadania" pod polami **Numer Issue** i **Link do Issue**. Jeśli użytkownik nie podał danych Issue, zostaw pola puste.
3. **Analiza stosu technologicznego**: Zrozum stos technologiczny projektu, branżę i domenę, aby zidentyfikować najlepsze praktyki implementacyjne.
4. **Weryfikacja obecnej implementacji**: Przed planowaniem przeprowadź szczegółową analizę istniejącej bazy kodu:
   - Użyj wyszukiwania semantycznego, aby znaleźć komponenty, funkcje, hooki, utility lub pliki powiązane z wymaganiami funkcji.
   - Zidentyfikuj, co jest już zaimplementowane i działa poprawnie.
   - Zidentyfikuj, co istnieje, ale wymaga modyfikacji lub rozszerzenia.
   - Zidentyfikuj, co trzeba utworzyć od zera.
   - Udokumentuj ustalenia w sekcji „Current Implementation Analysis”.
5. **Zrozumienie standardów projektu**: Przejrzyj najlepsze praktyki projektu i standardy jakości (sprawdź pliki `*.instructions.md`).
6. **Brama decyzji modularyzacyjnej**: Przed finalnym planem oceń rekomendację z researchu i aktualny stan kodu. W planie zapisz jedną decyzję w formacie `modularization: not-needed | use-existing-domain | run-modularise-first | include-in-plan`, z uzasadnieniem i wpływem na zakres. Dla `run-modularise-first` wskaż użytkownikowi uruchomienie `/modularise` przed implementacją. Użyj `system-modularising` warunkowo, gdy zadanie wymaga bounded contexts, granic modułów, agregatów, kontraktu domenowego lub dekompozycji monolitu.
7. **Przygotowanie planu implementacji**: Opracuj szczegółowe zmiany w kodzie podzielone na fazy.
8. **Definicja zadań**: Dla każdej fazy określ konkretne zadania zawierające:
   - Jasny tytuł
   - Opis zakresu zadania
   - Typ działania: `[CREATE]`, `[MODIFY]` lub `[REUSE]`
   - Definicję ukończenia jako listę checkboxów dla każdego zadania
9. **Routing wykonania**: Wskaż rekomendowany prompt wykonawczy dla faz lub całego planu. Frontend/React/TS UI kieruj do `/implement-ui` i właściwych skillów React/TS; backend/API/Node/TS do `/implement-backend`; CI/CD, obserwowalność, Kubernetes lub IaC do `/implement-pipeline`, `/implement-observability` albo `/deploy-kubernetes`; projektowanie testów E2E do `/implement-e2e`.
10. **Uwzględnienie bezpieczeństwa**: Dodaj aspekty bezpieczeństwa istotne dla implementacji.
11. **Definicja testowania i quality gates**: Zapewnij wytyczne dotyczące testowania i walidacji implementacji. Na podstawie wspólnego kontraktu weryfikacyjnego ze skilla `code-reviewing` zaplanuj adekwatne quality gates, kryteria review i testy dla punktów, które mają sens dla zadania, repozytorium, warstwy i technologii. Punkty nieadekwatne lub wymagające niedostępnych narzędzi/danych oznacz w planie jako założenia albo ograniczenia walidacji.
12. **Zapis planu**: Ściśle stosuj szablon `plan.example.md` ze skilla `architecture-designing`.
13. **Kontrola zakresu**: Skup się WYŁĄCZNIE na zmianach specyficznych dla TEGO zadania. Nie uwzględniaj prac wstępnych ani zależności w krokach implementacji - załóż, że są już wykonane (z wyjątkiem ewentualnego wskazania `/modularise` z kroku 6). Nie planuj funkcji spoza oryginalnych wymagań (udokumentuj je osobno w sekcji „Usprawnienia (Poza Zakresem)”). Każdy wpis w tej sekcji musi obowiązkowo zawierać trzy elementy: **Opis**, **Uzasadnienie**, **Korzyści**. Każde pole musi zawierać co najmniej jedno konkretne zdanie (nie hasło), a pole **Korzyści** musi wskazywać mierzalny lub operacyjny efekt (np. redukcja ryzyka/czasu/kosztu albo poprawa jakości).
14. **Unikanie duplikacji**: Nigdy nie planuj tworzenia komponentów, funkcji ani utili, które już istnieją. Korzystaj z sekcji „Current Implementation Analysis” i planuj ponowne użycie lub modyfikację istniejącego kodu.
15. **Naprawy błędów**: Podczas planowania napraw błędów uwzględnij kroki odtworzenia problemu, analizę przyczyny źródłowej oraz implementację poprawki zweryfikowanej testami.

Nie uwzględniaj w repozytorium planów wdrożenia, instrukcji pushowania kodu ani instrukcji wykonywania code review. Plan może natomiast definiować kryteria review, quality gates i testy, które reviewer ma później zweryfikować.

Ściśle przestrzegaj struktury szablonu i konwencji nazewnictwa, aby zapewnić przejrzystość i spójność.

W przypadku niejasności lub brakujących informacji potrzebnych do planowania poproś o doprecyzowanie przed finalizacją planu.

Aktualizuj plik planu po każdej interakcji, jeśli pojawią się nowe informacje.

