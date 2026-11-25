---
name: git-workflow-managing
description: "Git workflow semver: branchowanie (wersyjne/taskowe/main), bootstrap task brancha, commit/push/PR, merge-forward, Sonar quality gate, tworzenie wersji, lifecycle Issue. Używaj przy commitowaniu, branchach, mergowaniu, PR, propagacji, nowej wersji lub gdy kontekst dotyczy git workflow, merge-forward, semver, task branch, Issue lifecycle."
---

# Zarządzanie Git Workflow

Prowadzi agenta przez workflow Git oparty na branchach semver z propagacją merge-forward. Ten skill jest kanonicznym nośnikiem reguł strategii branchowania; listę aktywnych repozytoriów i ich ścieżek roboczych utrzymuje `.github/workflow-sync/repository-profiles.json` w repozytorium AI_Instruction.

## Strategia Branchowania

Trzy typy branchy:

| Typ | Format nazwy | Cel |
|---|---|---|
| Wersyjny | `<semver>` (np. `1.0.0`, `0.0.4`) | Codzienna praca — aktywny branch deweloperski |
| Zadaniowy | `<feat\|fix\|tests\|chore\|task>/<semver>/Issue/<number>` | Izolowana praca nad zadaniem, tworzony z brancha wersyjnego |
| Legacy zadaniowy | `feature\|bugfix\|task/<semver>/Issue-<number>` | Tylko kompatybilność wsteczna przy `/commit`; nie twórz nowych branchy w tym formacie |
| `main` | `main` | Gałąź integracyjna — nigdy nie commituj bezpośrednio |

**Branch zadaniowy** — tworzony z brancha wersyjnego i domykany przez PR do odpowiadającego brancha wersyjnego po zakończeniu CR. Nowe branche twórz wyłącznie w kanonicznym formacie `<feat|fix|tests|chore|task>/<semver>/Issue/<number>` (np. `feat/1.2.0/Issue/5`). Jeśli zmiana ma własny Issue i nie istnieje jeszcze branch taskowy, nie zaczynaj implementacji na `main` ani bezpośrednio na branchu wersyjnym.

## Bootstrap Implementacji

Ta sekcja dotyczy promptów implementacyjnych i startu pracy przed pierwszą zmianą w repo. Nie opisuje ścieżki `/commit`, jeśli branch taskowy już istnieje.

Przed pierwszą zmianą w repo:

1. Ustal repozytorium docelowe, aktualny branch i docelową wersję rozwojową. Preferuj aktywny branch wersyjny albo jednoznaczny aktywny cykl rozwojowy repo. Jeśli wersja nie jest jednoznaczna — zapytaj użytkownika.
2. Ustal numer GitHub Issue z kontekstu zadania. Jeśli Issue jest niejednoznaczny albo go brakuje — zapytaj użytkownika.
3. Dobierz typ brancha: `feat`, `fix`, `tests`, `chore`, a gdy nadal niejednoznaczne użyj `task`.
4. Utwórz albo przełącz się na branch taskowy `<feat|fix|tests|chore|task>/<semver>/Issue/<number>` z docelowego brancha wersyjnego `<semver>`.
5. Przed właściwą implementacją spróbuj ustawić status Issue na `In Progress` / `W realizacji` albo najbliższy odpowiednik. Preferuj workflow statusów w GitHub Project/boardzie, potem repo-local status labels, a przy ich braku zostaw komentarz sygnalizujący rozpoczęcie pracy. Jeśli kilka opcji jest równie prawdopodobnych — zapytaj użytkownika.

## Reguły mapowania typu zadania → prefix brancha

Poniższe reguły są kanonicznym przewodnikiem dla wyboru prefixu brancha taskowego. Stosuj je konsekwentnie w promptach implementacyjnych i podczas bootstrapu branchy.

- `feat`: Nowa funkcja lub widoczna zmiana UX/API. Przykłady: "Dodaj ekran ustawień oszczędności", "Eksport CSV listy transakcji".
- `fix`: Naprawa błędu lub niepoprawnego zachowania (bugfix). Przykłady: "Napraw błąd logowania przy pustym tokenie", "Popraw obsługę błędów 500 w endpointzie /users".
- `tests`: Zmiany wyłącznie w testach, fixture'ach, mockach lub konfiguracji testów. Przykłady: "Dodaj testy jednostkowe dla parsowania", "Zaktualizuj fixture logowania w testach E2E".
- `chore`: Prace porządkowe i utrzymaniowe niezwiązane bezpośrednio z funkcjonalnością (aktualizacje zależności, CI, skrypty build). Przykłady: "Zaktualizuj wersję GitHub Action", "Usuń przestarzały skrypt build".
- `task`: Fallback dla prac mieszanych lub niejednoznacznych; użyj, gdy zmiana łączy wiele kategorii lub nie pasuje do powyższych. Przykłady: "Migracja bazy + drobne poprawki interfejsu", "Refaktoring modułu + aktualizacja testów".

Procesowo:

- ZAWSZE: przed rozpoczęciem implementacji agent musi jawnie potwierdzić wybrany prefix i numer Issue (forma: `issue/<number>`).
- Format gałęzi taskowej: `<prefix>/<target-version-or-branch>/Issue/<number>` (np. `feat/1.2.0/Issue/42`).
- Jeśli zadanie łączy typy (np. migracja + feature), preferuj `task` i zapytaj użytkownika o preferencję. Jeśli użytkownik wskaże inny prefix — zastosuj jego wybór i udokumentuj w planie.

## Proces Merge-Forward

Dla branchy taskowych `/commit` przechodzi przez PR do docelowego brancha wersyjnego. Merge-forward startuje dopiero po merge tego PR. Jeśli startujesz bezpośrednio z brancha wersyjnego, pomiń ścieżkę PR i potraktuj aktywny branch jako źródło merge-forward.

Integrację Sonar dla ścieżki PR rozpoznawaj tylko po twardych sygnałach: `sonar-project.properties`, konfiguracji scannerów, workflow CI albo jawnie przekazanych danych projektu/PR od użytkownika. Nie zgaduj project key ani identyfikatora PR.

1. Jeśli startujesz z brancha taskowego w nowym albo legacy formacie: commituj i pushuj na aktualny branch taskowy
2. Wyciągnij docelowy branch wersyjny `<semver>` z nazwy brancha taskowego i sprawdź otwarte PR z tego brancha taskowego do tego brancha wersyjnego
3. Jeśli istnieje dokładnie jeden otwarty pasujący PR, użyj go; jeśli nie istnieje żaden pasujący otwarty PR, utwórz nowy; jeśli istnieje więcej niż jeden pasujący PR albo kontekst jest niejednoznaczny — zapytaj użytkownika
4. Pokaż użytkownikowi co najmniej numer PR, branch źródłowy, branch docelowy oraz informację, czy PR został znaleziony czy utworzony
5. Jeśli repo jest podpięte pod Sonar według powyższej detekcji i da się sprawdzić status PR, potwierdź zielony quality gate tego PR przed pytaniem o merge; jeśli gate nie jest zielony albo analiza nie jest gotowa po kilku próbach — zatrzymaj się z informacją o statusie. Jeśli repo wygląda na spięte z Sonar, ale nie możesz potwierdzić statusu z powodu braku narzędzia lub danych, zgłoś to użytkownikowi i nie przechodź dalej automatycznie. Jeśli repo nie jest podpięte pod Sonar według powyższej detekcji, pomiń ten krok
6. Zapytaj użytkownika, czy zatwierdza merge tego PR do docelowego brancha wersyjnego
7. Po akceptacji użytkownika merguj PR do docelowego brancha wersyjnego. Merge PR automatycznie zamyka PR
8. Odśwież refy, przejdź na zaktualizowany docelowy branch wersyjny i usuń branch źródłowy po stronie zdalnej oraz lokalnej, jeśli to możliwe
9. Merguj zmiany do WSZYSTKICH wyższych branchy wersyjnych, w kolejności rosnącej, już z tego docelowego brancha wersyjnego. Do ustalenia kolejki użyj skryptu `scripts/get-version-branch-queue.ps1 -TargetVersion <semver>` (skrypt obsługuje również alias `-TargetBranch` i jest dystrybuowany do repozytoriów konsumenckich przez `.github/workflow-sync/mirror-contract.json`). Kolejka musi stosować sortowanie numeryczne semver (`Major`, `Minor`, `Patch`), a nie leksykograficzne (np. `0.10.0` i `0.11.0` są wyżej niż `0.9.0`), oraz normalizować prefiksy `origin/`. Jeśli w repozytorium konsumenckim skrypt nie jest jeszcze zsynchronizowany, zastosuj fallback: odczytaj branche z `git branch -a`, znormalizuj prefiksy (odetnij `origin/` i `refs/heads/`), zachowaj wyłącznie wersje pasujące do `X.Y.Z`, posortuj je numerycznie po `[int]Major, [int]Minor, [int]Patch`, odfiltruj wersje mniejsze bądź równe docelowej i dołącz `main` na końcu
10. Ostatni (najwyższy) branch wersyjny merguj dodatkowo do `main` (pole `MergeChain` ze skryptu automatycznie zawiera wyższe wersje oraz `main` na końcu)
11. Dodaj komentarz do Issue i ustaw końcowy status Issue zgodny z workflow repo albo, jeśli brak jawnego mechanizmu, zostaw co najmniej komentarz
12. Jeśli branch taskowy został usunięty po merge, zakończ pracę na docelowym branchu wersyjnym; jeśli merge nie nastąpił i branch startowy nadal istnieje, możesz wrócić na branch startowy

Przy `/commit` nie powtarzaj bootstrapu implementacji: nie ustawiaj ponownie statusu startowego Issue i nie twórz ponownie brancha taskowego, jeśli branch już istnieje. `/commit` koncentruje się na rozpoznaniu branchy, rozstrzygnięciu właściwego PR do brancha wersyjnego według reguły dokładnie jeden/żaden/wiele, merge-forward, komentarzu do Issue i końcowym statusie.

### Przykład

Praca na `feat/1.0.0/Issue/7`, istniejące branche wersyjne: `1.0.0`, `1.0.1`, `1.1.0`

```
Push do feat/1.0.0/Issue/7
Jeśli istnieje dokładnie jeden pasujący PR #123: użyj go; jeśli nie istnieje żaden pasujący PR: utwórz nowy
Po akceptacji użytkownika merge PR #123 do 1.0.0
git fetch, checkout 1.0.0
Usuń branch źródłowy zdalnie i lokalnie, jeśli to możliwe
Merge 1.0.0 → 1.0.1, push 1.0.1
Merge 1.0.1 → 1.1.0, push 1.1.0
Merge 1.1.0 → main, push main
Komentarz i status na Issue #7
Zakończ na 1.0.0, jeśli branch taskowy został usunięty; w przeciwnym razie checkout feat/1.0.0/Issue/7
```

## Tworzenie Nowej Wersji

Gdy aktywny branch wersyjny jest gotowy do zamknięcia:

1. Propaguj wszystkie zmiany w górę (merge-forward) do `main`
2. Utwórz nowy branch wersyjny z `main` (np. kolejna wersja semver)
3. W tym samym kroku zaktualizuj kanoniczny plik wersji projektu oraz widoczną wersję w `README.md`; jeśli projekt ma więcej niż jedno kanoniczne źródło wersji, zaktualizuj wszystkie z nich
4. Nigdy nie commituj bezpośrednio na `main`

## Checklista Przed Commitem

Przed każdym commitem sprawdź:

- [ ] Jeśli pracujesz na branchu taskowym: docelowy branch wersyjny i numer Issue są jednoznacznie ustalone
- [ ] Jeśli pracujesz na branchu taskowym: sprawdź, czy istnieje dokładnie jeden otwarty pasujący PR do docelowego brancha wersyjnego; użyj go tylko w tym przypadku, jeśli nie istnieje żaden pasujący PR utwórz nowy, a przy więcej niż jednym albo wieloznaczności zapytaj użytkownika
- [ ] Jeśli ścieżka `/commit` idzie przez PR: rozpoznaj integrację Sonar tylko po twardych przesłankach (`sonar-project.properties`, konfiguracja scannerów, workflow CI, dane użytkownika); nie zgaduj project key ani identyfikatora PR
- [ ] Jeśli repo jest podpięte pod Sonar i ścieżka `/commit` idzie przez PR: przed pytaniem o merge potwierdź zielony quality gate PR albo jawnie zgłoś brak możliwości potwierdzenia statusu
- [ ] Jeśli commit utrwala otwarcie nowego brancha wersyjnego: zaktualizuj kanoniczny plik wersji projektu (lub wszystkie kanoniczne źródła wersji) oraz `README.md`
- [ ] `README.md` — zaktualizuj, jeśli zmiana wpływa na dokumentację użytkownika
- [ ] `CHANGELOG.md` — dodaj wpis w sekcji `[Unreleased]` (format Keep a Changelog)
- [ ] Inne pliki dokumentacji istniejące w repozytorium — jeśli zmiana wpływa na ich treść
- [ ] Po merge PR odśwież refy, przejdź na docelowy branch wersyjny, usuń branch źródłowy zdalnie i lokalnie, jeśli to możliwe, i dopiero potem wykonuj merge-forward
- [ ] Po merge przygotuj komentarz do Issue i końcowy status zgodny z workflow repo albo plan komentarza fallback

## Konwencje Komunikatów Commitów

Język i format komunikatów commitów **różnią się między projektami**. Przed napisaniem komunikatu commita sprawdź sekcję dotyczącą commitów w instrukcjach projektu (pliki `.instructions.md`) i zastosuj tam zdefiniowane reguły (język, format, prefiksy).

Wspólne zasady (niezależne od projektu):

- Tryb rozkazujący (imperatywny)
- Zwięzłość — krótki opis w jednej linii
- Nie używaj prefiksów typu `feat:`, `fix:`
- Przy większych zmianach dodaj ciało commita z opisem co i dlaczego

## Workflow Krok po Kroku

Użyj poniższej checklisty przy realizacji operacji Git:

```
Postęp:
- [ ] Krok 1: Zidentyfikuj aktualny branch i kontekst
- [ ] Krok 2: Zbootstrapuj albo potwierdź branch taskowy i status startowy Issue
- [ ] Krok 3: Wykonaj zmiany, commituj i merguj do brancha wersyjnego
- [ ] Krok 4: Przeprowadź merge-forward
- [ ] Krok 5: Zweryfikuj propagację i domknij lifecycle Issue
```

**Krok 1: Zidentyfikuj aktualny branch i kontekst**

- Sprawdź aktualny branch (`git branch --show-current`)
- Wylistuj istniejące branche wersyjne, aby ustalić kolejność propagacji (od najniższego do najwyższego → `main`)
- Jeśli aktywny branch jest taskowy, rozpoznaj czy jest w nowym formacie czy legacy i wyciągnij z niego `<semver>` oraz numer Issue

**Krok 2: Zbootstrapuj albo potwierdź branch taskowy i status startowy Issue**

- Ten krok dotyczy promptów implementacyjnych i startu pracy. Jeśli zadanie ma własny Issue i nie ma jeszcze brancha taskowego: utwórz go w formacie `<feat|fix|tests|chore|task>/<semver>/Issue/<number>` z docelowego brancha wersyjnego `<semver>`
- Jeśli wersja docelowa, numer Issue albo status startowy są niejednoznaczne — zatrzymaj się i zapytaj użytkownika
- Spróbuj ustawić status Issue na `In Progress` / `W realizacji` albo najbliższy odpowiednik zgodny z workflow repo
- W ścieżce `/commit` ten krok służy wyłącznie do potwierdzenia istniejącego kontekstu; nie powtarzaj ustawiania statusu startowego Issue ani bootstrapu task brancha, jeśli branch już istnieje

**Krok 3: Wykonaj zmiany, commituj i merguj do brancha wersyjnego**

- Przejdź checklistę z sekcji „Checklista Przed Commitem"
- Sprawdź konwencje komunikatów commitów w instrukcjach projektu (pliki `.instructions.md`)
- Commituj i pushuj na aktualny branch
- Jeśli startujesz z brancha taskowego, znajdź właściwy PR do docelowego brancha wersyjnego `<semver>` zgodnie z regułą dokładnie jeden/żaden/wiele, pokaż dane PR, sprawdź zielony quality gate PR tam, gdzie repo jest podpięte pod Sonar według twardych przesłanek, zapytaj użytkownika o akceptację merge, a po akceptacji merguj PR
- Jeśli startujesz bezpośrednio z brancha wersyjnego, zachowaj dotychczasowy fallback bez obowiązkowej ścieżki PR
- W ścieżce `/commit` to jest główny punkt wejścia: użyj rozpoznania branchy jako podstawy dalszego merge-forward zamiast wracać do bootstrapu implementacji

**Krok 4: Przeprowadź merge-forward**

- Po merge PR odśwież refy, przejdź na zaktualizowany docelowy branch wersyjny i usuń branch źródłowy po stronie zdalnej oraz lokalnej, jeśli to możliwe
- Ustal kolejkę merge-forward skryptem `scripts/get-version-branch-queue.ps1 -TargetVersion <semver>` (lub aliasem `-TargetBranch`). Skrypt deterministycznie filtruje wersje `X.Y.Z`, normalizuje prefiksy `origin/` i sortuje wersje numerycznie (np. `0.10.0` wyżej niż `0.9.0`), zwracając uporządkowany łańcuch `MergeChain` zakończony `main`. Skrypt jest dystrybuowany przez `mirror-contract.json`; jeśli nie istnieje w repozytorium konsumenckim, użyj lokalnego fallbacku sortowania numerycznego semver
- Merguj zmiany kolejno do każdego wyższego brancha wersyjnego z `MergeChain` i pushuj po każdym merge, już z tego docelowego brancha wersyjnego
- Na końcu merguj najwyższy branch wersyjny do `main` i pushuj (zgodnie z `MergeChain`)

**Krok 5: Zweryfikuj propagację i domknij lifecycle Issue**

- Upewnij się, że wszystkie wyższe branche wersyjne i `main` zawierają zmiany
- Dodaj komentarz do Issue z SHA commita, nazwą brancha taskowego, docelowego brancha wersyjnego oraz informacją o merge i pushu
- Ustaw końcowy status Issue zgodny z workflow repo (`Done`, `Merged`, `Ready for Review`, `Ready for Test`, `Resolved` albo zamknięcie Issue); jeśli status jest niejednoznaczny — zapytaj użytkownika
- Jeśli branch taskowy został usunięty po merge, zakończ pracę na docelowym branchu wersyjnym; jeśli merge nie nastąpił i branch startowy nadal istnieje, możesz wrócić na branch startowy

## Powiązane Skille

- `code-reviewing` — przegląd kodu przed commitem
- `write-docs` — aktualizacja README.md i CHANGELOG.md zgodnie z checklistą przed commitem
