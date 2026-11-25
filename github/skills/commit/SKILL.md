---
name: commit
description: "Commituj, pushuj i propaguj zmiany do wyższych branchy wersyjnych."
disable-model-invocation: true
---

# Commit i Propagacja Zmian

> **Kontekst migracji z promptu**: Ten skill powstał w wyniku migracji promptu `.github/prompts/commit.prompt.md` dla środowiska Agent Host / Copilot CLI.
> - **Oryginalny agent**: `software-engineer`

Twoim celem jest zacommitowanie zmian, wypchnięcie ich do repozytorium i propagacja do wyższych branchy wersyjnych zgodnie z konwencjami projektu.

Przed rozpoczęciem upewnij się, że implementacja przeszła code review i wszystkie uwagi zostały rozwiązane.

Jeśli startujesz z brancha taskowego w kanonicznym formacie `<feat|fix|tests|chore|task>/<semver>/Issue/<number>`, potraktuj semver z nazwy jako docelowy branch wersyjny. Zachowaj kompatybilność wsteczną dla legacy branchy `feature/<semver>/Issue-<number>`, `bugfix/<semver>/Issue-<number>` oraz `task/<semver>/Issue-<number>`: `/commit` ma je rozpoznać i obsłużyć tak samo, ale nowych branchy nie twórz już w tym formacie.

Jeśli `/commit` jest uruchomiony bezpośrednio z brancha wersyjnego, zachowaj dotychczasowe zachowanie jako fallback. Nie zgaduj numeru Issue ani docelowej wersji, gdy kontekst nie pozwala ich ustalić jednoznacznie.

Jeśli startujesz z brancha taskowego w nowym albo legacy formacie, `/commit` nie wykonuje bezpośredniego merge branch taskowy -> branch wersyjny. Po commicie i pushu ma użyć Pull Request do docelowego brancha wersyjnego `<semver>`.

Jeśli commit utrwala otwarcie nowego brancha wersyjnego, traktuj aktualizację kanonicznego pliku wersji projektu (lub wszystkich kanonicznych źródeł wersji) oraz `README.md` jako część obowiązkowego zakresu tej zmiany, a nie jako opcjonalny follow-up.

Jeśli użytkownik chce wykonać lokalny release-prep dla wersji, w szczególności archiwizację plików `.github/Issue` albo sprawdzenie downstream `release.yml`, nie realizuj tego w `/commit`. W takim przypadku wykonaj lub zasugeruj osobny workflow `/release`, a `/commit` traktuj wyłącznie jako krok commit/push/merge-forward. Jeśli docelowe repo wersjonuje `.github/Issue` albo `.github/release/next-version.json`, rekomenduj uruchomienie `/release` przed finalnym `/commit`, tak aby archiwum i manifest weszły do świadomie utrwalonych zmian.

## Wymagane skille

Przed rozpoczęciem załaduj i stosuj następujące skille:
- `technical-context-discovering` - aby zrozumieć konwencje projektu i strukturę branchy
- `git-workflow-managing` - aby poprawnie rozpoznać branch taskowy, branch wersyjny i lifecycle GitHub Issue

## Przebieg pracy

1. Sprawdź aktualny stan repozytorium: aktualny branch, status zmian (`git status`). Zanim ustalisz kolejkę merge-forward, odśwież refy (`git fetch` albo równoważnie) i zbuduj listę branchy wersyjnych z lokalnych oraz zdalnych refów, a nie tylko z lokalnego `git branch`. Nie kończ merge-forward na podstawie niepełnego lokalnego widoku branchy. Rozpoznaj, czy startujesz z brancha taskowego w nowym formacie, z brancha legacy, czy bezpośrednio z brancha wersyjnego. Zapamiętaj branch startowy, docelowy branch wersyjny i numer Issue, jeśli są zakotwiczone w nazwie brancha.
2. Jeśli startujesz z brancha taskowego, wyciągnij semver i numer Issue z nazwy brancha. Gdy nie da się tego zrobić jednoznacznie, zatrzymaj się i zapytaj użytkownika. Jeśli startujesz z brancha wersyjnego, zachowaj dotychczasowe zachowanie fallback i nie zgaduj Issue bez jednoznacznego kontekstu.
3. Zweryfikuj, czy dokumentacja wymaga aktualizacji:
   - Jeśli commit dotyczy otwarcia nowego brancha wersyjnego: zaktualizuj kanoniczny plik wersji projektu oraz `README.md` przed commitem
   - `README.md` — jeśli zmiana wpływa na dokumentację użytkownika (nowe narzędzia, zmiana konfiguracji, zmiana wymagań)
   - `CHANGELOG.md` — dodaj wpis w sekcji `[Unreleased]` opisujący zmianę (format Keep a Changelog)
   - Inne pliki dokumentacji istniejące w repozytorium — jeśli zmiana wpływa na ich treść
   - Jeśli potrzebna jest aktualizacja, wprowadź ją przed commitem.
4. Przygotuj commit z opisem w języku angielskim (krótki, imperatywny opis zmian, bez prefiksów typu `feat:`, `fix:`).
5. Zacommituj i wypchnij zmiany na aktualny branch startowy.
6. Jeśli startujesz z brancha taskowego w nowym albo legacy formacie:
   - Po commicie i pushu wyciągnij docelowy branch wersyjny `<semver>` z nazwy brancha taskowego i sprawdź, czy istnieje dokładnie jeden otwarty pasujący PR z bieżącego brancha taskowego do tego brancha wersyjnego.
   - Jeśli istnieje jeden otwarty pasujący PR, nie twórz nowego: użyj istniejącego PR.
   - Jeśli nie istnieje żaden pasujący otwarty PR, utwórz nowy PR do docelowego brancha wersyjnego.
   - Jeśli istnieje więcej niż jeden pasujący PR albo kontekst jest niejednoznaczny, zatrzymaj się i zapytaj użytkownika.
   - W obu przypadkach pokaż użytkownikowi podstawowe dane PR: numer PR, branch źródłowy, branch docelowy i informację, czy PR został utworzony czy znaleziony.
   - Traktuj repo jako podpięte pod Sonar tylko wtedy, gdy masz twarde sygnały z repo albo od użytkownika, np. `sonar-project.properties`, konfigurację scannerów, workflow CI lub jawnie przekazane dane projektu/PR. Nie zgaduj project key ani identyfikatora PR.
   - Jeśli repo nie jest podpięte pod Sonar według powyższej detekcji, pomiń kontrolę quality gate dla PR. Jeśli repo jest podpięte pod Sonar i da się sprawdzić status PR, odpytaj bezpośrednio narzędzie `sonarqube` dla tego PR i ponów próbę kilkukrotnie, gdy analiza nie jest jeszcze gotowa.
   - Jeśli quality gate dla PR nie jest zielony albo analiza nie jest gotowa po kilku próbach, zatrzymaj się z informacją o statusie i nie przechodź do merge automatycznie.
   - Jeśli repo wygląda na spięte z Sonar, ale nie możesz potwierdzić statusu PR z powodu braku narzędzia lub danych, jawnie zgłoś to użytkownikowi i zatrzymaj merge zamiast milcząco pomijać krok.
   - Dopiero po pokazaniu danych PR i, jeśli dotyczy, zielonego quality gate dla PR zapytaj użytkownika, czy zatwierdza merge tego PR do docelowego brancha wersyjnego.
   - Jeśli użytkownik nie zatwierdzi merge PR, zatrzymaj się po podsumowaniu bez merge-forward.
   - Jeśli użytkownik zatwierdzi merge PR, wykonaj merge PR na GitHubie do docelowego brancha wersyjnego. Merge PR na GitHubie automatycznie zamyka PR, więc nie twórz osobnej ścieżki „zamknij bez merge”.
   - Po udanym merge odśwież refy, przejdź na zaktualizowany docelowy branch wersyjny i usuń branch źródłowy po stronie zdalnej oraz lokalnej, jeśli to możliwe. Jeśli któregoś usunięcia nie da się wykonać, zgłoś to w podsumowaniu zamiast wracać do usuwanego brancha.
   - Merge-forward do wyższych branchy wersyjnych wykonuj dopiero z tego docelowego brancha wersyjnego po przełączeniu, a nie z brancha taskowego przeznaczonego do usunięcia.
   - Następnie ustal deterministyczną kolejkę merge-forward wywołując skrypt `scripts/get-version-branch-queue.ps1 -TargetVersion <semver>` (oraz opcjonalnie `-AsJson`; skrypt akceptuje także `-TargetBranch` jako alias). Skrypt ten jest kanonicznym mechanizmem ustalania kolejki, dystrybuowanym do repozytoriów konsumenckich przez `.github/workflow-sync/mirror-contract.json` (w rodzinach wersyjnych obok `release-script-common.ps1`): pobiera pełen widok lokalnych i zdalnych refów (odświeżonych uprzednio przez `git fetch` albo równoważnie), normalizuje prefiksy (ignoruje `origin/`), filtruje wyłącznie branche w formacie `X.Y.Z` (pomija branche taskowe, `main`, `vX.Y.Z`) i sortuje je numerycznie po `Major`, `Minor`, `Patch` (dzięki czemu branche takie jak `0.10.0` czy `0.11.0` są prawidłowo pozycjonowane wyżej niż `0.9.0`, a nie leksykograficznie przed nim).
   - *Fallback w repozytorium konsumenckim*: Jeśli skrypt `scripts/get-version-branch-queue.ps1` nie istnieje jeszcze w danym repozytorium (np. przed synchronizacją mirrorów), wykonaj deterministyczne filtrowanie i sortowanie numeryczne semver lokalnie: pobierz listę branchy z `git branch -a`, odetnij prefiksy `origin/` i `refs/heads/`, zachowaj wyłącznie wersje pasujące do wzorca `X.Y.Z`, posortuj je numerycznie po `[int]Major, [int]Minor, [int]Patch`, odfiltruj wersje mniejsze lub równe wersji docelowej i dołącz `main` na końcu łańcucha merge-forward.
   - Zwrócone przez skrypt (lub wyznaczone przez fallback) pole `MergeChain` zawiera uporządkowaną listę wyższych branchy wersyjnych, a na końcu `main`. Merguj zmiany kolejno do każdego brancha z tej listy, pushując po każdym udanym merge.
   - Jeśli pole `Warnings` zwrócone przez skrypt zawiera ostrzeżenia o wykrytej luce wersji (np. brak pośredniego minor/patch), wyświetl ostrzeżenie użytkownikowi w podsumowaniu bez przerywania merge-forward.
   Jeśli startujesz bezpośrednio z brancha wersyjnego, potraktuj go jako źródło merge-forward (TargetVersion), wyznacz kolejkę za pomocą `scripts/get-version-branch-queue.ps1 -TargetVersion <semver>` (lub powyższego fallbacku) i zachowaj dotychczasowe zachowanie.
7. Zakończ pracę na odpowiednim branchu:
   - jeśli branch taskowy został usunięty po merge PR, zakończ pracę na docelowym branchu wersyjnym, na który przełączyłeś się po odświeżeniu refów
   - jeśli merge PR nie nastąpił i branch startowy nadal istnieje, możesz wrócić na branch startowy
   - jeśli startowałeś bezpośrednio z brancha wersyjnego, zachowaj dotychczasowe zachowanie fallback
8. Po udanym merge-forward i domknięciu ścieżki `/commit`:
   - Jeśli numer Issue jest znany, pobierz aktualną treść Issue i sprawdź, czy zawiera sekcję „Definition of Done" z checkboxami. Jeśli taka sekcja istnieje: przejrzyj każdy niezaznaczony checkbox i zweryfikuj, czy odpowiadający warunek jest spełniony przez wdrożoną zmianę — jeśli tak, zaznacz go w treści Issue (edytując Issue body). Jeśli któryś wymagany warunek DoD nie jest spełniony lub nie możesz potwierdzić jego spełnienia, wylistuj te pozycje i zapytaj użytkownika, czy mimo to chce kontynuować zamknięcie Issue. Komentarz z SHA commita dodaj zawsze niezależnie od odpowiedzi użytkownika — wyłącznie zmianę statusu Issue pomiń, jeśli użytkownik zdecyduje o niezamykaniu.
   - Jeśli numer Issue jest znany, dodaj komentarz w odpowiednim GitHub Issue z minimum: numerem lub SHA commita, nazwą brancha taskowego, nazwą docelowego brancha wersyjnego i informacją, że zmiana została zmergowana i wypchnięta.
   - Następnie spróbuj zmienić status Issue na stan końcowy zgodny z workflow repo. Preferuj istniejący workflow statusów w GitHub Project/boardzie, potem repo-local status labels, a następnie najbliższy końcowy odpowiednik (`Done`, `Merged`, `Ready for Review`, `Ready for Test`, `Resolved` albo zamknięcie Issue).
   - Jeśli mechanizm statusów jest niejednoznaczny, zatrzymaj się i zapytaj użytkownika. Jeśli repo nie ma jawnego mechanizmu statusów, co najmniej zostaw komentarz.
9. Wyświetl podsumowanie wykonanych operacji: stan PR (numer PR, branch źródłowy, branch docelowy, informacja czy PR został utworzony czy znaleziony, wynik pytania o merge i ewentualnego merge), lista branchy, do których wypchnięto zmiany, branch startowy, docelowy branch wersyjny, SHA commita, wynik komentarza i zmiany statusu Issue, wynik usunięcia brancha źródłowego lokalnie i zdalnie, ewentualnie konflikty merge, wynik weryfikacji SonarQube quality gate dla PR albo informację, że repo nie było podpięte pod Sonar, oraz wynik weryfikacji Definition of Done z GitHub Issue (czy sekcja DoD istniała, które checkboxy zaznaczono, które pozostały niespełnione).

Jeśli po zakończeniu `/commit` użytkownik chce jeszcze wykonać lokalne przygotowanie wydania, wskaż `/release` jako następny, osobny krok procesu tylko wtedy, gdy archiwum i manifest mają pozostać lokalne albo użytkownik świadomie planuje osobny, kolejny `/commit`. Nie duplikuj tutaj instrukcji archiwizacji ani logiki release-prep.

W przypadku konfliktu merge zatrzymaj się i poproś użytkownika o instrukcje rozwiązania konfliktu. Nie rozwiązuj konfliktów automatycznie.
