# Szablony Raportów `/review-codebase`

Referencja zawiera kontrakt raportowania dla promptu `.github/prompts/review-codebase.prompt.md`. Załaduj ją przed generowaniem raportów `code-quality-report.md` i `sonar-report.md`.

## Kontrakt Wyniku

- `code-quality-report.md` powstaje zawsze w katalogu głównym analizowanego repozytorium.
- `sonar-report.md` powstaje tylko wtedy, gdy narzędzie MCP `sonarqube` jest dostępne oraz da się ustalić project key i organizację/projekt z repozytorium, konfiguracji CI albo danych użytkownika.
- Jeśli `sonarqube` nie jest dostępne albo brakuje danych projektu, pomiń raport SonarCloud i oznacz go w `code-quality-report.md` jako `Wymaga narzędzia/danych` z krótkim powodem.
- Jeśli `sonarqube` jest dostępne, pobierz dane wykrytego lub wskazanego projektu SonarCloud/SonarQube i oznacz raport Sonar jako `✅ Wygenerowany`.
- W monorepo organizuj ustalenia według warstw/aplikacji. Nie mieszaj ustaleń z różnych warstw.

## Poziomy Istotności

| Poziom | Znaczenie |
| --- | --- |
| 🔴 **Krytyczne** | Musi zostać naprawione; powoduje błędy, problemy bezpieczeństwa lub istotne obciążenie utrzymaniowe. |
| 🟡 **Ważne** | Powinno zostać naprawione; poprawia jakość, czytelność lub utrzymywalność. |
| 🟢 **Nice to Have** | Usprawnienia opcjonalne; dopracowanie i optymalizacja. |

## Szablon `code-quality-report.md`

```markdown
# Raport Jakości Kodu - <nazwa-repozytorium>

## Przegląd

| Pole | Wartość |
|---|---|
| Repozytorium | <nazwa> |
| Typ repozytorium | Monorepo / Pojedynczy system |
| Data | <data> |
| Analizowane warstwy/aplikacje | <lista> |

## Podsumowanie wykonawcze

<2-3 akapity podsumowania ogólnego stanu jakości kodu, kluczowych ustaleń i rekomendowanych priorytetów>

---

## Ustalenia według warstwy/aplikacji

### <Nazwa warstwy/aplikacji> (`<ścieżka>`)

#### Status wspólnego kontraktu weryfikacyjnego

| Obszar | Status | Uzasadnienie / ograniczenie |
|---|---|---|
| OWASP TOP 30+ — Wymaganie krytyczne [Docs/OWASP_TOP_30_PLUS.md](Docs/OWASP_TOP_30_PLUS.md) | `Sprawdzone` / `Nie dotyczy` / `Wymaga narzędzia/danych` | <krótkie uzasadnienie albo link do ustalenia> |
| Clean Architecture | `Sprawdzone` / `Nie dotyczy` / `Wymaga narzędzia/danych` | <krótkie uzasadnienie albo link do ustalenia> |
| Secure by Design | `Sprawdzone` / `Nie dotyczy` / `Wymaga narzędzia/danych` | <krótkie uzasadnienie albo link do ustalenia> |
| C#/.NET best practices | `Sprawdzone` / `Nie dotyczy` / `Wymaga narzędzia/danych` | <krótkie uzasadnienie albo link do ustalenia> |
| Python best practices | `Sprawdzone` / `Nie dotyczy` / `Wymaga narzędzia/danych` | <krótkie uzasadnienie albo link do ustalenia> |
| KISS/SOLID | `Sprawdzone` / `Nie dotyczy` / `Wymaga narzędzia/danych` | <krótkie uzasadnienie albo link do ustalenia> |
| Performance | `Sprawdzone` / `Nie dotyczy` / `Wymaga narzędzia/danych` | <krótkie uzasadnienie albo link do ustalenia> |
| Reliability | `Sprawdzone` / `Nie dotyczy` / `Wymaga narzędzia/danych` | <krótkie uzasadnienie albo link do ustalenia> |
| Martwy kod/importy/using | `Sprawdzone` / `Nie dotyczy` / `Wymaga narzędzia/danych` | <krótkie uzasadnienie albo link do ustalenia> |
| Zero Trust | `Sprawdzone` / `Nie dotyczy` / `Wymaga narzędzia/danych` | <krótkie uzasadnienie albo link do ustalenia> |
| SAST | `Sprawdzone` / `Nie dotyczy` / `Wymaga narzędzia/danych` | <narzędzie/wynik albo ograniczenie> |
| SCA | `Sprawdzone` / `Nie dotyczy` / `Wymaga narzędzia/danych` | <narzędzie/wynik albo ograniczenie> |
| Sekrety | `Sprawdzone` / `Nie dotyczy` / `Wymaga narzędzia/danych` | <narzędzie/wynik albo ograniczenie> |
| IaC | `Sprawdzone` / `Nie dotyczy` / `Wymaga narzędzia/danych` | <narzędzie/wynik albo ograniczenie> |

#### Martwy kod

| # | Istotność | Typ | Lokalizacja | Opis |
|---|---|---|---|---|
| 1 | 🔴/🟡/🟢 | <typ> | `<plik:linia>` | <opis> |

#### Duplikacje

| # | Istotność | Typ | Lokalizacje | Opis | Rekomendacja |
|---|---|---|---|---|---|
| 1 | 🔴/🟡/🟢 | <typ> | `<ścieżka1>`, `<ścieżka2>` | <opis> | <działanie> |

#### Obszary do usprawnień

| # | Istotność | Kategoria | Lokalizacja | Opis | Rekomendacja |
|---|---|---|---|---|---|
| 1 | 🔴/🟡/🟢 | <kategoria> | `<plik:linia>` | <opis> | <działanie> |

<!-- Powtórz dla każdej warstwy/aplikacji -->

---

## Obserwacje architektoniczne

<ustalenia-architektoniczne-i-rekomendacje>

## Podsumowanie

| Kategoria | 🔴 Krytyczne | 🟡 Ważne | 🟢 Nice to Have | Razem |
|---|---|---|---|---|
| Martwy kod | <liczba> | <liczba> | <liczba> | <liczba> |
| Duplikacje | <liczba> | <liczba> | <liczba> | <liczba> |
| Usprawnienia | <liczba> | <liczba> | <liczba> | <liczba> |
| **Razem** | <liczba> | <liczba> | <liczba> | <liczba> |

## Rekomendowany plan działań

### Natychmiastowe (Krytyczne)
1. <pozycja-działania>

### Krótkoterminowe (Ważne)
1. <pozycja-działania>

### Długoterminowe (Nice to Have)
1. <pozycja-działania>

## Powiązane raporty

| Raport | Opis | Status |
|---|---|---|
| [sonar-report.md](sonar-report.md) | Analiza SonarCloud/SonarQube — Quality Gate, metryki, issues, security hotspots | ✅ Wygenerowany / Wymaga narzędzia/danych / ⏭️ Pominięty (nie dotyczy) |
```

## Kontrakt SonarCloud

Faza SonarCloud/SonarQube jest warunkowa i generyczna: nie zakłada konkretnego project key ani organizacji. Dane projektu wykryj z repozytorium, konfiguracji CI albo danych użytkownika. Jeśli nie da się ich ustalić, oznacz analizę Sonar jako `Wymaga narzędzia/danych` i nadal wykonaj pozostałe kontrole security scanning dostępne w repozytorium/CI.

1. Sprawdź dostępność narzędzia `sonarqube`.
2. Wykryj project key i organizację/projekt z `sonar-project.properties`, konfiguracji scannerów, workflow CI, jawnych zmiennych albo danych użytkownika.
3. Jeśli narzędzie lub dane projektu są niedostępne, nie twórz `sonar-report.md`; wpisz status `Wymaga narzędzia/danych` w `code-quality-report.md` z ograniczeniem.
4. Pobierz Quality Gate status wykrytego lub wskazanego projektu: status `PASSED`/`FAILED` oraz niespełnione warunki.
5. Pobierz metryki ogólne: reliability rating, security rating, maintainability rating, coverage, duplications, lines of code, liczba bugów, vulnerabilities i code smells.
6. Pobierz Security Hotspots: status, kategoria OWASP, plik z numerem linii i opis.
7. Pobierz Issues według severity: `BLOCKER`, `CRITICAL`, `MAJOR`, `MINOR`, `INFO`.
8. Dla każdego severity policz issues pogrupowane po typie: Bug, Vulnerability, Code Smell.
9. Jeśli issues w danym severity jest więcej niż 20, podaj liczby i top 5 najważniejszych przykładów per typ.
10. Jeśli issues w danym severity jest 20 lub mniej, wymień szczegółowo każdy issue: typ, reguła, plik, linia, opis.
11. Zapisz `sonar-report.md` w katalogu głównym repozytorium.
12. Zaktualizuj sekcję „Powiązane raporty” w `code-quality-report.md`.

## Szablon `sonar-report.md`

```markdown
# Raport SonarCloud - <nazwa-repozytorium>

## Przegląd

| Pole | Wartość |
|---|---|
| Repozytorium | <nazwa> |
| Projekt SonarCloud | <project-key> |
| Organizacja/projekt SonarCloud | <organization/project albo Nie dotyczy> |
| Data analizy | <data> |

## Quality Gate

| Status | Warunki niespełnione |
|---|---|
| ✅ PASSED / ❌ FAILED | <lista warunków, które nie zostały spełnione — jeśli PASSED, wpisz "Brak"> |

## Metryki ogólne

| Metryka | Wartość | Rating |
|---|---|---|
| Reliability | <liczba bugów> | <A/B/C/D/E> |
| Security | <liczba vulnerabilities> | <A/B/C/D/E> |
| Maintainability | <liczba code smells> | <A/B/C/D/E> |
| Coverage | <procent>% | — |
| Duplications | <procent>% | — |
| Lines of Code | <liczba> | — |

## Security Hotspots

| # | Status | Kategoria | Plik | Opis |
|---|---|---|---|---|
| 1 | To Review / Reviewed / Safe | <kategoria OWASP> | `<plik:linia>` | <opis> |

> Jeśli brak Security Hotspots, wpisz: "Brak Security Hotspots do przeglądu."

## Issues

### Podsumowanie

| Severity | Bug | Vulnerability | Code Smell | Razem |
|---|---|---|---|---|
| BLOCKER | <n> | <n> | <n> | <n> |
| CRITICAL | <n> | <n> | <n> | <n> |
| MAJOR | <n> | <n> | <n> | <n> |
| MINOR | <n> | <n> | <n> | <n> |
| INFO | <n> | <n> | <n> | <n> |
| **Razem** | <n> | <n> | <n> | <n> |

### BLOCKER

<!-- Jeśli >20 issues: pogrupuj po typie z liczbami i top 5 przykładów per typ -->
<!-- Jeśli ≤20 issues: wymień szczegółowo -->

| # | Typ | Reguła | Plik | Linia | Opis |
|---|---|---|---|---|---|
| 1 | Bug/Vulnerability/Code Smell | <rule-key> | `<plik>` | <linia> | <opis> |

### CRITICAL

<!-- Jeśli >20 issues: pogrupuj po typie z liczbami i top 5 przykładów per typ -->
<!-- Jeśli ≤20 issues: wymień szczegółowo -->

| # | Typ | Reguła | Plik | Linia | Opis |
|---|---|---|---|---|---|
| 1 | Bug/Vulnerability/Code Smell | <rule-key> | `<plik>` | <linia> | <opis> |

### MAJOR

<!-- Jeśli >20 issues: pogrupuj po typie z liczbami i top 5 przykładów per typ -->
<!-- Jeśli ≤20 issues: wymień szczegółowo -->

| # | Typ | Reguła | Plik | Linia | Opis |
|---|---|---|---|---|---|
| 1 | Bug/Vulnerability/Code Smell | <rule-key> | `<plik>` | <linia> | <opis> |

### MINOR

<!-- Analogicznie jak MAJOR -->

| # | Typ | Reguła | Plik | Linia | Opis |
|---|---|---|---|---|---|
| 1 | Bug/Vulnerability/Code Smell | <rule-key> | `<plik>` | <linia> | <opis> |

### INFO

<!-- Analogicznie jak MAJOR -->

| # | Typ | Reguła | Plik | Linia | Opis |
|---|---|---|---|---|---|
| 1 | Bug/Vulnerability/Code Smell | <rule-key> | `<plik>` | <linia> | <opis> |

---

## Podsumowanie i rekomendacje

<2-3 akapity podsumowania stanu projektu w SonarCloud: ogólna ocena jakości, kluczowe problemy, porównanie z Quality Gate, rekomendacje priorytetyzowane od najważniejszych>

### Natychmiastowe działania
1. <pozycja>

### Krótkoterminowe
1. <pozycja>

## Powiązane raporty

| Raport | Opis |
|---|---|
| [code-quality-report.md](code-quality-report.md) | Raport jakości kodu — martwy kod, duplikacje, usprawnienia, architektura |
```

## Wytyczne Raportowania

- Zawsze podawaj ścieżki plików i numery linii przy ustaleniach.
- Każde ustalenie musi zawierać wykonalną rekomendację naprawy.
- Unikaj false positive: weryfikuj nieużywany kod przez wszystkie ścieżki importów, importy dynamiczne i re-eksporty.
- Dla monorepo oddziel ustalenia każdej warstwy/aplikacji.
- Raport końcowy musi być samowystarczalny i zrozumiały bez dodatkowego kontekstu.
