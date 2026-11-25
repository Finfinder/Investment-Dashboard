---
name: release-github
description: "Opublikuj release przez GitHub Actions po lokalnym release-prep: wypchnij tag, monitoruj Release i nowy branch."
argument-hint: "[repozytorium, release_version i next_version, np. TravianBot 0.7.0 0.8.0]"
disable-model-invocation: true
---

# Publikacja Release przez GitHub Actions

> **Kontekst migracji z promptu**: Ten skill powstał w wyniku migracji promptu `.github/prompts/release-github.prompt.md` dla środowiska Agent Host / Copilot CLI.
> - **Oryginalny agent**: `devops-engineer`
> - **Oryginalny model**: `Owl Alpha (openrouter)`
> - **Wskazówka argumentu**: `[repozytorium, release_version i next_version, np. TravianBot 0.7.0 0.8.0]`
> - **Oryginalna nazwa promptu**: `ReleaseGitHub`

<goal>

Twoim celem jest opublikowanie release wybranego repozytorium workspace przez istniejacy workflow GitHub Actions `Release`, po uprzednio wykonanym lokalnym release-prep `/release <repozytorium> <release_version> <next_version>` i utrwaleniu jego widocznych zmian w commicie przeznaczonym do tagowania.



Standardowa sciezka publikacji to push taga `v<release_version>`, ktory uruchamia `.github/workflows/release.yml`. Po sukcesie workflow ma opublikowac GitHub Release oraz artefakty/assets zdefiniowane przez repozytorium, w tym artefakt `next-version-request`. Nastepnie workflow `Open Next Version Branch` albo repo-specyficzny odpowiednik `open-next-version-branch` ma otworzyc branch kolejnego cyklu dla `next_version` i wykonac repozytoryjny kontrakt aktualizacji wersji.



Ten prompt moze wykonac dzialania publikujace, ale przed utworzeniem taga i pushem taga musi zatrzymac sie, pokazac plan publikacji i uzyskac jawne potwierdzenie uzytkownika.

</goal>



<input-requirements>

Przed uruchomieniem tego workflow upewnij sie, ze masz:



1. **Repozytorium docelowe** - nazwe repozytorium z `AI_Instruction/.github/workflow-sync/repository-profiles.json`, aktywny folder workspace albo jednoznaczna sciezke repozytorium z tego workspace

2. **Release version** - wersje release w formacie semver; dopuszczalny jest prefiks `v`, ale tag publikacyjny ma miec postac `v<release_version>`

3. **Next version** - wersje kolejnego brancha w formacie semver; dopuszczalny jest prefiks `v`, ale wartosc porownywana z manifestem ma byc znormalizowana bez prefiksu



Jesli brakuje repozytorium, `release_version` albo `next_version`: STOP i uzupelnij brakujace dane pytaniem do uzytkownika. Nie zgaduj `next_version`.

</input-requirements>



<required-skills>

## Wymagane Skille



Przed rozpoczeciem zaladuj i stosuj nastepujace skille:

- `technical-context-discovering` - aby ustalic repozytorium, workflow, konwencje wersjonowania i istniejaca automatyzacje release

- `git-workflow-managing` - aby obsluzyc branche semver, tagowanie zweryfikowanego commita, merge-forward i branch kolejnego cyklu

- `write-docs` - aby skontrolowac `CHANGELOG.md`, `README.md` i release notes publikowane przez workflow

- `implementing-ci-cd` - aby zweryfikowac GitHub Actions, artefakty, status workflow i guard raile publikacji

</required-skills>



<workflow>

## Workflow



1. **Ustal repozytorium i wersje**: Odczytaj `AI_Instruction/.github/workflow-sync/repository-profiles.json`, znajdz repozytorium docelowe, ustal `release_version`, `next_version` oraz tag `v<release_version>`. Normalizuj wersje do semver bez prefiksu `v` tam, gdzie porownujesz je z manifestem.

2. **Zweryfikuj lokalny release-prep**: Sprawdz, ze w repozytorium docelowym istnieje `.github/release/next-version.json`, a pola `release_version` i `next_version` pasuja do danych wejsciowych. Zweryfikuj, ze ewentualne widoczne zmiany release-prep sa juz utrwalone w commicie, ktory ma zostac otagowany. Dodatkowo sprawdz, czy `CHANGELOG.md` zawiera sekcje `## [<release_version>]` (a nie tylko `## [Unreleased]`) - jesli brakuje, STOP i wskaz, ze nalezy najpierw uruchomic `/release <repozytorium> <release_version> <next_version>`, ktory wywoluje `scripts/prepare-release.ps1` przenoszacy sekcje Unreleased pod wersjonowany naglowek. Nie wywoluj `prepare-release.ps1` z tego promptu - to etap lokalnego `/release`.

3. **Zweryfikuj git i zdalne repo**: Sprawdz aktualny branch, SHA commita, remote, czystosc worktree, brak rozbieznosci wzgledem remote, brak istniejacego lokalnego i zdalnego taga `v<release_version>` oraz brak istniejacego GitHub Release o tej nazwie. Jesli tag albo release istnieje, STOP i zapytaj uzytkownika o swiadomy tryb aktualizacji albo zakoncz z diagnoza.

4. **Zweryfikuj kontrakt publikacji**: Sprawdz `.github/workflows/release.yml`, workflow otwierajacy branch (`open-next-version-branch.yml`, `Open Next Version Branch` albo repo-specyficzny odpowiednik), deskryptory `.github/versioning/*` jesli istnieja, `CHANGELOG.md`, `README.md` oraz oczekiwane artefakty/assets wynikajace z `release.yml`. Interpretuj "pelne artefakty" repo-specyficznie na podstawie tego workflow.

5. **Zatrzymaj sie przed publikacja**: Pokaz plan publikacji: repozytorium, branch, SHA do tagowania, tag, remote, workflow `Release`, oczekiwane assets/artefakty, `next_version` i branch kolejnego cyklu. STOP i popros o jawne potwierdzenie przed `git tag` i `git push`.

6. **Opublikuj tag po potwierdzeniu**: Po jednoznacznym potwierdzeniu utworz tag `v<release_version>` na zweryfikowanym commicie i wypchnij tag do remote, aby uruchomic GitHub Actions `Release`.

7. **Monitoruj workflow `Release`**: Przez GitHub CLI albo dostepne narzedzia GitHub znajdz run uruchomiony przez push taga, monitoruj jego status i zapisz URL runa. Jesli workflow nie wystartuje albo zakonczy sie bledem, STOP z diagnoza i nie probuj publikowac release recznie.

8. **Potwierdz GitHub Release i artefakty**: Po sukcesie workflow potwierdz istnienie GitHub Release dla taga, notki release z `CHANGELOG.md` oraz repo-specyficzne assets/artefakty publikowane przez `release.yml`.

9. **Potwierdz `next-version-request`**: Zweryfikuj artefakt workflow `next-version-request`, jego `release_version`, `next_version` i powiazanie z zakonczonym runem `Release`.

10. **Monitoruj kolejny branch**: Monitoruj workflow `Open Next Version Branch`, `open-next-version-branch` albo repo-specyficzny odpowiednik uruchomiony po sukcesie `Release`. Potwierdz utworzenie remote brancha kolejnego cyklu `next_version` oraz aktualizacje kanonicznego pliku wersji i `README.md` albo badge, jesli repo ma taki kontrakt.

11. **Zakoncz raportem**: Podaj repozytorium, tag, SHA, URL GitHub Release, URL-e runow workflow, liste potwierdzonych artefaktow/assets, branch `next_version`, status aktualizacji wersji/README oraz ewentualne reczne dzialania pozostale po publikacji.

</workflow>



<output-specification>

Wynik koncowy ma zawierac:



- repozytorium i remote

- branch i SHA otagowanego commita

- tag `v<release_version>`

- URL runa workflow `Release` i jego status

- URL GitHub Release oraz status notek release

- liste potwierdzonych assets/artefaktow, w tym `next-version-request`

- URL/status workflow `Open Next Version Branch` albo repo-specyficznego odpowiednika

- nazwe remote brancha kolejnego cyklu `next_version`

- informacje, czy kanoniczny plik wersji i `README.md`/badge zostaly zaktualizowane zgodnie z kontraktem repo

- liste blokad, diagnoz albo recznych dzialan, jesli workflow nie mogl zostac domkniety automatycznie

</output-specification>



<constraints>

## Ograniczenia



- Nie uruchamiaj `workflow_dispatch` jako podstawowej sciezki; standard to push taga `v*`.

- Nie tworz lokalnie GitHub Release przez `gh release create`, jesli repo ma workflow `Release`; publikacja ma isc przez GitHub Actions.

- Nie taguj niezatwierdzonych zmian ani brancha z rozbieznoscia wzgledem remote.

- Nie zgaduj `next_version`; dopytaj, jesli brak.

- Nie kontynuuj bez jawnego potwierdzenia uzytkownika przed `git tag` i `git push`.

- Nie pomijaj weryfikacji istniejacego taga ani istniejacego GitHub Release przed publikacja.

- Interpretuj "pelne artefakty" repo-specyficznie na podstawie `.github/workflows/release.yml`.

</constraints>
