---
name: release
description: "Przygotuj lokalny release-prep: zarchiwizuj pliki Issue, zapisz manifest i wskaż handoff do /release-github."
argument-hint: "[repozytorium, release_version i next_version, np. TravianBot 0.7.0 0.8.0]"
disable-model-invocation: true
---

# Przygotowanie Release (Lokalny Release-Prep)

> **Kontekst migracji z promptu**: Ten skill powstał w wyniku migracji promptu `.github/prompts/release.prompt.md` dla środowiska Agent Host / Copilot CLI.
> - **Oryginalny agent**: `software-engineer`
> - **Wskazówka argumentu**: `[repozytorium, release_version i next_version, np. TravianBot 0.7.0 0.8.0]`

<goal>
Twoim celem jest wykonanie lokalnego release-prep dla wybranego repozytorium z workspace. Workflow ma zarchiwizować pliki `.research.md` i `.plan.md` z głównego katalogu `.github/Issue/` do `.github/Issue/Archiwum/<wersja>/` przy użyciu wspólnego skryptu `AI_Instruction/scripts/archive-issue-files.ps1`, a następnie zapisać manifest `.github/release/next-version.json` zawierający `release_version` i `next_version` dla automatyki otwarcia kolejnego brancha wersyjnego.

Wynikiem ma być czytelne podsumowanie lokalnej archiwizacji: docelowe repozytorium, numer wersji release, numer kolejnego brancha wersyjnego, liczba przeniesionych plików, katalog archiwum, ścieżka manifestu oraz informacja, czy dane repo ma istniejący downstream workflow publikacji release w `.github/workflows/release.yml`. Jeśli repo zawiera niezmigrowaną historię (`archiwalne/`, płaskie `Archiwum/` albo historyczne root `release-*`), prompt ma to jednoznacznie zasygnalizować i przekazać użytkownika do maintenance workflow `AI_Instruction/scripts/migrate-issue-archive-history.ps1`, zamiast próbować migrować historię samodzielnie. Ten prompt odpowiada tylko za lokalne przygotowanie aktywnych artefaktów Issue i manifestu `next_version` przed finalnym utrwaleniem release-prep albo jako lokalny housekeeping po `/commit`, zależnie od tego, czy `.github/Issue` jest wersjonowane, a nie za tagowanie, push ani uruchamianie CI.

Ten prompt nie redefiniuje reguły otwierania kolejnego brancha wersyjnego. Jeśli po release użytkownik otwiera nowy branch semver, nadal obowiązuje centralna zasada aktualizacji kanonicznego pliku wersji projektu oraz `README.md` w tym samym kroku. Formalnym dalszym etapem po utrwaleniu release-prep jest `/release-github <repozytorium> <release_version> <next_version>`.
</goal>

<input-requirements>
Przed uruchomieniem tego workflow upewnij się, że masz:

1. **Repozytorium docelowe** - nazwę repo z `.github/workflow-sync/repository-profiles.json`, aktywny folder workspace albo jednoznacznie wskazaną ścieżkę repozytorium z tego workspace
2. **Release version** — wersję release w formacie semver; dopuszczalny jest prefiks `v`, jeśli użytkownik tak podaje wersję
3. **Next version** — wersję kolejnego brancha w formacie semver; dopuszczalny jest prefiks `v`, jeśli użytkownik tak podaje wersję

Jeśli brakuje repozytorium, `release_version` albo `next_version`: STOP i uzupełnij brakujące dane pytaniem do użytkownika.
</input-requirements>

<required-skills>
## Wymagane Skille

Przed rozpoczęciem załaduj i stosuj następujące skille:
- `technical-context-discovering` — aby ustalić aktywne repozytorium, konwencje workspace i istniejące wzorce release-prep przed wykonaniem zmian
</required-skills>

<workflow>
## Workflow

1. **Zbierz kontekst repozytorium**: Odczytaj `AI_Instruction/.github/workflow-sync/repository-profiles.json` i ustal repozytorium docelowe na podstawie nazwy podanej przez użytkownika, aktywnego folderu workspace albo jednoznacznej ścieżki. Nie hardcoduj listy repozytoriów w treści odpowiedzi. Jeśli mapowanie nie jest jednoznaczne, zapytaj użytkownika i zatrzymaj workflow do czasu doprecyzowania.
2. **Ustal wersję release i kolejnego cyklu**: Odczytaj `release_version` i `next_version` z promptu. Jeśli którejkolwiek z tych wartości brakuje, zapytaj o nią użytkownika. Akceptuj zapis z prefiksem `v`, ale zapisuj do manifestu znormalizowaną wartość semver bez prefiksu `v`.
3. **Zweryfikuj warunki lokalne**: Sprawdź, czy repozytorium docelowe istnieje w workspace, czy zawiera `.github/Issue/` oraz czy w repo istnieje `.github/workflows/release.yml`. Brak `.github/Issue/` traktuj jako czytelny błąd końcowy tego workflow. Istnienie lub brak `release.yml` traktuj jako informację do podsumowania, a nie jako warunek blokujący archiwizację.
4. **Uruchom wspólny skrypt archiwizacji**: Wykonaj lokalnie `AI_Instruction/scripts/archive-issue-files.ps1` z parametrami `-RepositoryRoot` i `-Version`, używając PowerShell dostępnego w środowisku. Nie przepisuj logiki archiwizacji do promptu i nie modyfikuj repozytorium inaczej niż przez ten skrypt.
5. **Przygotuj CHANGELOG i wersje (release-prep)**: Jeśli repozytorium docelowe zawiera skrypt `scripts/prepare-release.ps1`, wykonaj go lokalnie z parametrem `-Version <release_version> -Apply` przed utrwaleniem zmian. Skrypt przenosi sekcję `## [Unreleased]` z `CHANGELOG.md` pod wersjonowaną sekcję `## [<release_version>] - <DATA>` oraz bumpuje wersje w deskryptorach (`backend/pyproject.toml`, `frontend/package.json`, badge `README.md`) zgodnie z `.github/versioning/version-targets.json`. Jeśli skrypt nie istnieje w repo, pomiń ten krok i zasygnalizuj to w podsumowaniu. Nie rób tego ręcznie — zawsze przez skrypt.
6. **Zapisz manifest `next_version`**: Utwórz lub nadpisz plik `.github/release/next-version.json` w repozytorium docelowym. Plik ma zawierać obiekt JSON z polami `release_version` i `next_version`, oba zapisane jako znormalizowany semver bez prefiksu `v`. Nie zgaduj wersji automatycznie.
7. **Obsłuż diagnostykę legacy historii**: Jeśli wynik skryptu sygnalizuje `LegacyStructureDetected`, pokaż wykryte układy legacy, liczbę oraz listę pominiętych historycznych root `release-*` i jednoznacznie zaznacz, że `/release` nie migruje historii. Wskaż maintenance workflow `AI_Instruction/scripts/migrate-issue-archive-history.ps1` z trybami `DryRun` i `Apply` jako następny krok dla uporządkowania historii.
8. **Podsumuj wynik release-prep**: Pokaż wynik zwrócony przez skrypt: repozytorium, `release_version`, `next_version`, katalog archiwum, liczbę przeniesionych plików i listę zarchiwizowanych ścieżek. Dodatkowo pokaż ścieżkę `.github/release/next-version.json` i jednoznacznie podaj, czy repo ma istniejący `release.yml` jako downstream etap publikacji release. Jeśli uruchomiono `prepare-release.ps1`, wskaż też zaktualizowane pliki (`CHANGELOG.md`, wersje w deskryptorach).
9. **Doprecyzuj kolejny krok dla danego repo**: Ustal, czy `.github/Issue` oraz `.github/release/next-version.json` pozostają widoczne dla gita, czy są ignorowane lokalnie. Jeśli archiwizacja albo manifest tworzą zmiany widoczne w `git status`, wyraźnie wskaż, że `/release` powinien być wykonany przed finalnym `/commit` utrwalającym release-prep albo że po bieżącym uruchomieniu potrzebny jest jeszcze świadomy `/commit`. Jeśli oba artefakty są ignorowane, zaznacz, że przygotowanie pozostało lokalne i dodatkowy commit nie jest wymagany.
10. **Wskaż etap publikacji**: Jeśli użytkownik chce kontynuować publikację, wyjaśnij zwięźle, że dalszy etap odbywa się poza tym promptem: `/release-github <repozytorium> <release_version> <next_version>` zweryfikuje utrwalony release-prep, poprosi o jawne potwierdzenie publikacji i dopiero potem przeprowadzi publikację przez istniejący workflow `Release`.
</workflow>

<handoff>
## Handoff

Po zakończeniu `/release` nie twórz tagów, nie pushuj i nie uruchamiaj CI. Jeśli `.github/Issue` albo `.github/release/next-version.json` są widoczne w `git status`, najpierw utrwal release-prep świadomym commitem. Dopiero po takim commicie formalny następny krok to:

```text
/release-github <repozytorium> <release_version> <next_version>
```

Przykład:

```text
/release-github TravianBot 0.7.0 0.8.0
```
</handoff>

<constraints>
## Ograniczenia

- Nie twórz tagów, nie wykonuj `git push`, nie uruchamiaj `workflow_dispatch` i nie publikuj release z poziomu tego promptu.
- Nie kopiuj skryptu `archive-issue-files.ps1` do repozytorium docelowego i nie duplikuj jego logiki w promptcie.
- Nie archiwizuj podkatalogów historycznych ani innych plików niż `.research.md` i `.plan.md` z głównego `.github/Issue/`.
- Nie migruj historycznych układów `archiwalne/`, płaskiego `Archiwum/` ani starszych root `release-*` z poziomu `/release`; w takich przypadkach wykonaj wyłącznie handoff do `migrate-issue-archive-history.ps1`.
- Nie wyliczaj `next_version` automatycznie. Jeśli użytkownik nie podał tej wartości, zawsze dopytaj.
- W przypadku niejednoznacznego repozytorium albo braku wersji zawsze pytaj użytkownika przed kontynuowaniem.
</constraints>
