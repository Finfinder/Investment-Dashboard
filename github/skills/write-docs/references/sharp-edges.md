# Sharp Edges — Writing Docs

Znane pułapki i antywzorce dokumentacji technicznej. Ten plik przejmuje szczegółowe sharp edges i pełniejsze antywzorce z aktywnego `SKILL.md`, aby aktywny tier mógł pozostać krótki.

## Spis treści

- [SE-01: Broken Code Examples in Documentation](#se-01-broken-code-examples-in-documentation)
- [SE-02: Version Drift Between Docs and Code](#se-02-version-drift-between-docs-and-code)
- [SE-03: Missing Error and Troubleshooting Documentation](#se-03-missing-error-and-troubleshooting-documentation)
- [SE-04: No Getting Started — Documentation Without Quick Start](#se-04-no-getting-started--documentation-without-quick-start)
- [SE-05: Copy-Paste Unsafe Examples](#se-05-copy-paste-unsafe-examples)
- [SE-06: Dead Links in Documentation](#se-06-dead-links-in-documentation)
- [SE-07: False Promises in Documentation](#se-07-false-promises-in-documentation)
- [SE-08: Unverified Commands and Outputs](#se-08-unverified-commands-and-outputs)
- [SE-09: Secrets in Examples](#se-09-secrets-in-examples)
- [Antywzorce Operacyjne](#antywzorce-operacyjne)

---

### SE-01: Broken Code Examples in Documentation

**Severity:** CRITICAL | **Stack:** Documentation/CI

**Sytuacja:** Przykłady kodu w dokumentacji nie działają. Napisane zostały ręcznie, bez uruchomienia. W nowej wersji API zmienił się sygnatura funkcji, ale nikt nie zaktualizował snippetów w docs. Użytkownik kopiuje przykład, dostaje błąd, traci zaufanie do całej dokumentacji.

**Dlaczego to boli:** Pierwsze doświadczenie użytkownika z biblioteką to skopiowanie przykładu. Gdy nie działa, pojawia się pytanie: „Jeśli dokumentacja kłamie, co jeszcze jest źle?". Zaufanie raz utracone jest bardzo trudne do odbudowania. Zgłoszenia na GitHub rosną, a utrzymanie marki cierpi.

**Rozwiązanie:** Testuj przykłady automatycznie w CI. Użyj `pytest --doctest-modules` do testowania inline snippetów, wzorca extract-and-run do ekstrakcji bloków kodu z Markdown i ich kompilacji, wersjonowanych przykładów powiązanych z konkretnymi tagami wydania oraz macierzy CI testującej na wielu wersjach.

```yaml
# CI: .github/workflows/docs-test.yml
name: Test Documentation Examples
on: [push, pull_request]
jobs:
  test-examples:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-python@v6
        with:
          python-version: '3.12'
      - run: pip install -r docs/examples/requirements.txt
      - run: pytest --doctest-modules docs/
      - run: python -m py_compile docs/examples/*.py
      # Extract-and-run: wyciągnij bloki kodu z Markdown i uruchom
      - run: |
          grep -Pzo '```python\n([\s\S]*?)```' docs/**/*.md \
            | python -c "import sys; exec(sys.stdin.read())"
```

**Symptomy:** Issues na GitHub typu „example doesn't work", Stack Overflow pytania z wklejonym snippetem z docs, nowy developer nie potrafi uruchomić pierwszego przykładu, rozbieżność między importami w docs a faktycznym API.

**Regex detekcji:** `(?s)python\n.*(?:from|import)\s+\w+`

---

### SE-02: Version Drift Between Docs and Code

**Severity:** HIGH | **Stack:** Documentation/Versioning

**Sytuacja:** Dokumentacja opisuje starą wersję, użytkownicy pracują na nowej. API zmieniło się w v5.2, ale docs nadal pokazują wzorce z v5.0. Parametr `timeout` został przemianowany na `request_timeout`, ale w 40 stronach dokumentacji nikt tego nie zaktualizował.

**Dlaczego to boli:** Użytkownik czyta docs, implementuje wg instrukcji, a potem spędza godziny na debugowaniu „dlaczego ten parametr nie działa". Frustracja rośnie, bo kod wygląda dokładnie jak w dokumentacji. Dryft wersji generuje największą liczbę false-positive zgłoszeń błędów.

**Rozwiązanie:** Wersjonuj dokumentację razem z kodem. Dodawaj badge wersji, adnotacje „since v5.2", wymagaj aktualizacji docs w każdym PR zmieniającym publiczne API. Używaj narzędzi takich jak MkDocs z mike do utrzymywania wielu wersji docs równolegle.

```markdown
<!-- Badge wersji w nagłówku dokumentu -->
# API Reference ![v5.2](https://img.shields.io/badge/since-v5.2-blue)

## `create_client(request_timeout=30)`

> **Since:** v5.2 — W poprzednich wersjach parametr nosił nazwę `timeout`.
> Migracja: zamień `timeout=` na `request_timeout=` w wywołaniach.

| Parametr          | Typ   | Domyślnie | Od wersji |
|--------------------|-------|-----------|-----------|
| `request_timeout`  | `int` | `30`      | v5.2      |
| `max_retries`      | `int` | `3`       | v5.0      |
```

```yaml
# .github/workflows/docs-version-check.yml — wymuszaj aktualizację docs przy zmianie API
name: Docs Version Check
on: [pull_request]
jobs:
  check-docs-updated:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - name: Sprawdź czy PR zmieniający API aktualizuje też docs
        run: |
          API_CHANGED=$(git diff --name-only origin/main | grep -c 'src/api/' || true)
          DOCS_CHANGED=$(git diff --name-only origin/main | grep -c 'docs/' || true)
          if [ "$API_CHANGED" -gt 0 ] && [ "$DOCS_CHANGED" -eq 0 ]; then
            echo "::error::PR zmienia pliki API, ale nie aktualizuje dokumentacji!"
            exit 1
          fi
```

**Symptomy:** Issues typu „docs say X but code does Y", parametry z docs nie istnieją w aktualnym API, import paths w docs prowadzą donikąd, changelog wspomina breaking change ale docs go nie odzwierciedlają.

**Regex detekcji:** `(?:since|deprecated|removed|changed in)\s+v\d+`

---

### SE-03: Missing Error and Troubleshooting Documentation

**Severity:** MEDIUM | **Stack:** Documentation/UX

**Sytuacja:** Brak dokumentacji komunikatów błędów i sekcji troubleshooting. Użytkownik widzi `Error: MemoryStoreFull` — co to znaczy? Co zrobić? Google nic nie znajduje, bo error jest specyficzny dla biblioteki. Jedyna opcja — czytanie source code lub otwarcie issue.

**Dlaczego to boli:** Dobra dokumentacja błędów zapobiega 50% zgłoszeń supportowych. Każdy nieudokumentowany błąd to potencjalne issue na GitHubie, pytanie na Slacku i stracona godzina programisty próbującego zrozumieć co poszło nie tak. Error messages to najczęściej googlowane fragmenty docs.

**Rozwiązanie:** Dokumentuj każdy kod błędu z opisem przyczyny, krokami rozwiązania i linkiem do pełnej dokumentacji. Dodaj sekcję Troubleshooting z najczęstszymi problemami. Linkuj błędy bezpośrednio do docs (np. przez URL w komunikacie błędu).

```markdown
# Troubleshooting

## Error Codes

### `MemoryStoreFull`

**Przyczyna:** Wewnętrzny store przekroczył limit pamięci (domyślnie 512 MB).

**Rozwiązanie:**
1. Zwiększ limit: `config.memory_limit = "2GB"`
2. Włącz automatyczne czyszczenie: `config.auto_evict = True`
3. Sprawdź czy nie masz memory leaku — użyj `store.stats()` do diagnozy

**Powiązane:** [Konfiguracja pamięci](./configuration.md#memory)

### `ConnectionRefused`

**Przyczyna:** Serwer nie jest uruchomiony lub port jest zajęty.

**Rozwiązanie:**
1. Sprawdź czy serwer działa: `curl http://localhost:8080/health`
2. Sprawdź zajętość portu: `lsof -i :8080`
3. Sprawdź logi: `tail -f logs/server.log`
```

```python
# Wzorzec: error message z linkiem do docs
class MemoryStoreFull(Exception):
    def __init__(self, current_usage: int, limit: int):
        url = "https://docs.example.com/troubleshooting#memorystorefull"
        super().__init__(
            f"Memory store full: {current_usage}/{limit} bytes. "
            f"See: {url}"
        )
```

**Symptomy:** Issues z wklejonym error message i pytaniem „co to znaczy?", powtarzające się pytania na Slacku/Discordzie o te same błędy, użytkownicy czytają source code zamiast docs, 30%+ issues to pytania, nie bugi.

**Regex detekcji:** nie dotyczy

---

### SE-04: No Getting Started — Documentation Without Quick Start

**Severity:** HIGH | **Stack:** Documentation/UX

**Sytuacja:** Dokumentacja od razu wchodzi w szczegóły architektury bez quick start. Użytkownik chce spróbować biblioteki — otwiera docs i widzi diagram komponentów, opis wewnętrznych abstrakcji, theory of operation. Gdzie jest „zainstaluj i uruchom w 5 minut"?

**Dlaczego to boli:** Pierwsze 5 minut decyduje o adopcji. Użytkownik ma 10 alternatyw i zerową cierpliwość. Jeśli nie uruchomi czegoś działającego w 5-10 minut, przechodzi do następnej biblioteki. Dokumentacja bez quick start to bariera adopcji, którą łatwo usunąć.

**Rozwiązanie:** Quick start na pierwszej stronie z szacowanym czasem, natychmiastowym sukcesem i progressive disclosure. Struktura: instalacja → minimalny działający przykład → „co dalej?". Docelowy czas: ≤ 5 minut do pierwszego działającego wyniku.

````markdown
# Quick Start

> ⏱️ **Czas:** ~3 minuty | **Wymagania:** Python 3.10+

## 1. Instalacja

```bash
pip install investment-lib
```

## 2. Pierwszy działający przykład

```python
from investment_lib import Client

client = Client()
data = client.get_stock("AAPL")
print(f"Apple: ${data.price}")
# Output: Apple: $187.44
```

## 3. Co dalej?

- 📖 [Pełna dokumentacja API](./api-reference.md)
- 🧪 [Przykłady zaawansowane](./examples/)
- ⚙️ [Konfiguracja](./configuration.md)
````

```yaml
# Checklist dla Quick Start — dodaj do PR template
# docs/PULL_REQUEST_TEMPLATE.md
quick_start_checklist:
  - "[ ] Quick Start jest na pierwszej stronie / w README"
  - "[ ] Czas ukończenia podany (≤5 min)"
  - "[ ] Przykład kopiuj-wklej działa bez modyfikacji"
  - "[ ] Output jest pokazany inline"
  - "[ ] Sekcja 'Co dalej?' z linkami do głębszych docs"
```

**Symptomy:** Wysoki bounce rate na stronie docs, issues z pytaniem „how do I get started?", README bez sekcji Quick Start, pierwsze zdanie docs to „Architecture Overview", nowi użytkownicy od razu otwierają examples/ zamiast czytać docs.

**Regex detekcji:** nie dotyczy

---

### SE-05: Copy-Paste Unsafe Examples

**Severity:** HIGH | **Stack:** Documentation/Security

**Sytuacja:** Przykłady w dokumentacji działają, ale promują wzorce bezpieczne tylko lokalnie: `debug=True`, brak TLS, CORS `*`, dev-only profile albo destrukcyjne komendy bez zabezpieczeń. Użytkownik kopiuje je do produkcji bez zmian.

**Dlaczego to boli:** Ludzie kopiują kod z dokumentacji dosłownie — to jest cały sens example snippetów. Jeśli przykład pokazuje ustawienia wygodne w development, ktoś przeniesie je do produkcji. Każdy insecure example to potencjalna luka bezpieczeństwa, utrata danych albo ryzyko reputacyjne dla projektu.

**Rozwiązanie:** Domyślnie pokazuj wariant produkcyjnie bezpieczny. Jeśli potrzebny jest skrót developerski, oznacz go jako dev-only, pokaż produkcyjny odpowiednik obok i dodaj guard rails dla destrukcyjnych komend.

```python
# ❌ ŹRÓDŁO PROBLEMU: dev-only ustawienia w przykładzie kopiuj-wklej
app = create_app(
    debug=True,
    enforce_tls=False,
    cors_origins=["*"],
    profile="dev",
)

# ✅ BEZPIECZNY WZORZEC: produkcyjne wartości domyślne
app = create_app(
    debug=False,
    enforce_tls=True,
    cors_origins=["https://app.example.com"],
    profile="production",
)
```

```bash
# ❌ ŹRÓDŁO PROBLEMU: destrukcyjna komenda bez scope'u i potwierdzenia
appctl data reset --force --yes

# ✅ BEZPIECZNY WZORZEC: sandbox, dry-run i jawny approval
appctl data reset --environment sandbox --dry-run
```

**Symptomy:** Produkcja z `debug=True`, wildcard CORS w publicznym API, zgłoszenia problemów z TLS bo docs go nie wymagały, przypadkowe kasowanie danych po skopiowaniu komendy administracyjnej, dev-only profile w deploymentach użytkowników.

**Regex detekcji:** `(?:debug\s*=\s*True|verify\s*=\s*False|cors_origins\s*=\s*\["\*"\]|--force|--yes)`

---

### SE-06: Dead Links in Documentation

**Severity:** MEDIUM | **Stack:** Documentation/Maintenance

**Sytuacja:** Linki w dokumentacji prowadzą do stron 404. Podczas refaktoringu przeniesiono `api-reference.md` do `reference/api.md`, ale 15 innych stron nadal linkuje do starej ścieżki. Każdy klik w „więcej informacji" kończy się błędem 404.

**Dlaczego to boli:** Martwe linki to sygnał zaniedbanej dokumentacji. Użytkownik szuka informacji, trafia na 404, traci flow i zaufanie. Problem narasta wykładniczo — im więcej stron docs, tym więcej linków, tym więcej potencjalnych 404 po każdym refaktorze.

**Rozwiązanie:** Sprawdzaj linki w CI narzędziem `markdown-link-check`, preferuj linki względne, skonfiguruj przekierowania dla przeniesionych stron, przeprowadzaj okresowe audyty linków.

```bash
# CI: sprawdzanie linków w dokumentacji
npx markdown-link-check docs/**/*.md --config .markdown-link-check.json

# Okresowy audyt — znajdź wszystkie linki i sprawdź status
grep -roh 'https\?://[^)]*' docs/ | sort -u | \
  xargs -I{} curl -o /dev/null -s -w "%{http_code} {}\n" {} | \
  grep -v "^200"
```

```json
// .markdown-link-check.json
{
  "ignorePatterns": [
    { "pattern": "^https://localhost" }
  ],
  "replacementPatterns": [
    {
      "pattern": "^/docs/",
      "replacement": "{{BASEURL}}/docs/"
    }
  ],
  "aliveStatusCodes": [200, 206, 301, 302],
  "retryOn429": true,
  "timeout": "10s"
}
```

```yaml
# .github/workflows/link-check.yml
name: Check Documentation Links
on:
  schedule:
    - cron: '0 6 * * 1'  # co poniedziałek o 6:00
  push:
    paths: ['docs/**']
jobs:
  link-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: gaurav-nelson/github-action-markdown-link-check@v1
        with:
          folder-path: 'docs/'
          config-file: '.markdown-link-check.json'
```

**Symptomy:** Użytkownicy zgłaszają „link nie działa", Google Search Console raportuje 404, nowo dołączeni do zespołu nie mogą nawigować po docs, po refaktorze struktury docs pojawia się fala zgłoszeń.

**Regex detekcji:** `\[.*?\]\((?!https?://|#|mailto:).*?\.md\)`

---

### SE-07: False Promises in Documentation

**Severity:** HIGH | **Stack:** Documentation/Product Contract

**Sytuacja:** Dokumentacja obiecuje funkcję, wydajność, poziom wsparcia, kompatybilność albo bezpieczeństwo, których kod lub proces nie gwarantuje. Przykłady: „działa offline", „obsługuje wszystkie formaty CSV", „zero downtime migration", „enterprise-grade security" bez testów, konfiguracji i ograniczeń.

**Dlaczego to boli:** Fałszywa obietnica jest trudniejsza do naprawienia niż brak informacji. Użytkownik planuje integrację na podstawie docs, a potem odkrywa, że zachowanie nie istnieje albo działa tylko w wąskim wariancie.

**Rozwiązanie:** Każde twierdzenie o zachowaniu połącz ze źródłem prawdy: kodem, testem, specyfikacją API, limitem konfiguracji, SLO lub decyzją produktową. Używaj zakresu i warunków: „obsługuje CSV UTF-8 bez multiline fields" zamiast „obsługuje CSV".

```markdown
<!-- Źle: obietnica bez kontraktu -->
Importer obsługuje wszystkie formaty CSV i jest odporny na błędy.

<!-- Dobrze: zakres, limit i ścieżka błędu -->
Importer obsługuje CSV UTF-8 z nagłówkiem, przecinkiem jako separatorem
i maksymalnym rozmiarem pliku 50 MB. Wiersze z błędem walidacji trafiają
do raportu `invalid_rows.csv`.
```

**Symptomy:** Issues typu „docs promised X", częste pytania o nieistniejące funkcje, rozjazd między marketingowym opisem a API reference, brak testu dla mocnego twierdzenia w docs.

**Regex detekcji:** `(?:always|never|guarantee|zero downtime|all formats|enterprise-grade|production-ready)`

---

### SE-08: Unverified Commands and Outputs

**Severity:** CRITICAL | **Stack:** Documentation/Validation

**Sytuacja:** Komendy i outputy w dokumentacji zostały napisane z pamięci. Flagi CLI nie istnieją, ścieżki są nieaktualne, output pochodzi ze starej wersji, a instrukcja instalacji pomija wymagane zależności.

**Dlaczego to boli:** Użytkownik traktuje komendę jako najkrótszą ścieżkę do sukcesu. Gdy pierwszy copy-paste nie działa, traci zaufanie i zwykle nie czyta dalej. Niezweryfikowana komenda generuje koszty supportu tak samo jak bug.

**Rozwiązanie:** Uruchom komendy w środowisku możliwie bliskim użytkownikowi. Zapisz wymagany katalog roboczy, system operacyjny, wersje narzędzi i oczekiwany output. Jeśli w obecnym środowisku nie da się komendy wykonać, oznacz ją jako niezweryfikowaną i podaj powód.

````markdown
```bash
# Uruchom z katalogu repozytorium
npm run build
```

Oczekiwany wynik: proces kończy się kodem `0`, a katalog `dist/` zawiera bundel aplikacji.
````

**Symptomy:** Komendy z docs zwracają „unknown option", brak plików wynikowych, output nie pasuje do wersji narzędzia, użytkownicy pytają „z jakiego katalogu to uruchomić?".

**Regex detekcji:** ````(?:bash|powershell|sh)\n(?:.*\n){1,12}````

---

### SE-09: Secrets in Examples

**Severity:** CRITICAL | **Stack:** Documentation/Security

**Sytuacja:** Dokumentacja zawiera prawdziwy lub realistycznie wyglądający token, hasło, connection string, prywatny endpoint, klucz API albo credential testowy, który ktoś może skopiować lub zindeksować.

**Dlaczego to boli:** Przykłady są kopiowane dosłownie. Sekret w dokumentacji szybko trafia do repozytoriów użytkowników, indeksów wyszukiwarek, logów CI albo historii terminala. Nawet nieaktywny sekret uczy złego wzorca.

**Rozwiązanie:** Używaj jednoznacznych placeholderów i zmiennych środowiskowych: `YOUR_API_KEY`, `$TOKEN`, `${DB_PASSWORD}`, `<connection-string>`. Nie pokazuj wartości, która wygląda jak działający sekret. Przy przykładach produkcyjnych pokaż secret manager albo env var.

```python
# Źle
client = Client(api_key="sk_live_1234567890abcdef")

# Dobrze
client = Client(api_key=os.environ["API_KEY"])
```

**Symptomy:** Secret scanners zgłaszają docs, użytkownicy kopiują hasła z przykładów, README zawiera connection string z hostem produkcyjnym, przykłady używają `admin/admin` albo `password123`.

**Regex detekcji:** `(?:api[_-]?key|password|secret|token|connectionstring)\s*[:=]\s*["'][^"']{6,}["']`

## Antywzorce Operacyjne

| Antywzorzec | Dlaczego szkodzi | Zamiast tego |
| --- | --- | --- |
| Dokumentowanie oczywistości | Komentarze powtarzające kod są szumem i szybko się dezaktualizują | Dokumentuj powód, kontrakt, ryzyko, ograniczenie albo nietrywialny edge case |
| Przestarzała dokumentacja | Docs niezgodne z kodem niszczą zaufanie bardziej niż brak docs | Aktualizuj docs z kodem w tym samym PR i generuj z kodu tam, gdzie to możliwe |
| Ściana tekstu | Długie akapity bez przykładów są skanowane powierzchownie albo pomijane | Krótkie wyjaśnienie, działający przykład, oczekiwany wynik, następny krok |
| Zakładanie kontekstu | Nowy użytkownik nie wie, od czego zacząć i odpada przed pierwszym sukcesem | Quick start najpierw, potem konfiguracja, warianty i referencje |
| Wiedza plemienna | Krytyczne informacje żyją tylko w głowach zespołu | Zapisz runbooki, ADR-y, onboarding docs i troubleshooting |
| Brak troubleshooting | Każdy błąd kończy się issue albo pytaniem na czacie | Dokumentuj najczęstsze błędy, przyczyny, diagnostykę i rozwiązania |
| Unsafe copy-paste | Użytkownik przenosi do produkcji lokalne skróty, debug, brak TLS, wildcard CORS albo destrukcyjne komendy | Pokazuj bezpieczny wariant domyślny, oznaczaj dev-only ustawienia i wymagaj guard rails dla operacji ryzykownych |
| Martwe linki | Nawigacja prowadzi do 404 i sugeruje zaniedbane docs | Sprawdzaj linki w CI, preferuj linki względne i dodawaj redirecty po przenosinach |
| Fałszywe obietnice | Użytkownik planuje integrację na podstawie nieprawdziwego kontraktu | Każde mocne twierdzenie oprzyj o kod, test, specyfikację albo decyzję produktową |
| Niezweryfikowane komendy | Pierwszy copy-paste użytkownika kończy się błędem | Uruchamiaj komendy, zapisuj katalog roboczy i oczekiwany output |
| Sekrety w przykładach | Credentials wyciekają przez docs, CI, repo użytkowników i indeksy | Stosuj placeholdery i zmienne środowiskowe, nigdy prawdziwe wartości |
