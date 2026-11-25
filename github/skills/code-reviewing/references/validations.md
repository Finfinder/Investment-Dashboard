# Reguły Walidacji Kodu — Code Reviewing

Ten plik zawiera uniwersalny kontrakt weryfikacyjny dla przeglądów kodu, analiz jakościowych i planowania quality gates. Kontrakt stosuj niezależnie od stacku; istniejące reguły detekcji V-xx poniżej mogą być stackowe i odnoszą się głównie do **Python (FastAPI, Pydantic, SQLAlchemy) + React/Next.js (TypeScript) + PostgreSQL**.

**Sposób użycia:** Najpierw oceń obszary wspólnego kontraktu, a następnie uruchom pasujące reguły V-xx przez `grep_search` z regex i `includePattern` odpowiadającym polu „Dotyczy". Trafienia traktuj jako kandydatów — zweryfikuj kontekst.

## Przegląd specyficzny dla .NET i C Sharp

Jeśli recenzja dotyczy .NET/C#, użyj skilla `implementing-dotnet` oraz jego referencji dla standardów C#, audytu NuGet, bezpieczeństwa ASP.NET Core i testów domenowych/integracyjnych. Sprawdź w szczególności lokalne `.editorconfig`, Roslyn analyzers, `.sln`, `.csproj`, `Directory.Packages.props`, politykę licencji i wyniki `dotnet list package --vulnerable --include-transitive`, jeśli zmiana dotyka pakietów.

Listy zakazanych pakietów i licencji traktuj jako politykę repozytorium lub organizacji. Nie blokuj globalnie pakietów bez lokalnej reguły, realnego problemu licencyjnego, podatności bezpieczeństwa albo udokumentowanego ryzyka utrzymaniowego.

## Wspólny kontrakt weryfikacyjny

Ten kontrakt jest obowiązkowy dla przeglądów kodu, analiz jakościowych oraz planowania quality gates. Szczegółowe reguły V-01..V-18 poniżej są warstwą detekcji, ale nie wyczerpują całego zakresu oceny.

### Zasady stosowania

- Każde sprawdzenie wykonuj, jeśli ma sens dla analizowanego repozytorium, warstwy, technologii lub zmiany.
- Nie pomijaj istotnych punktów dlatego, że zmiana jest niewielka, czas jest ograniczony, zakres wygląda prosto albo ryzyko wydaje się oczywiste. Możesz skalować głębokość analizy do ryzyka i zakresu, ale nie wolno rezygnować z adekwatnych obszarów.
- Punkty nieadekwatne oznacz jawnie jako `Nie dotyczy` z krótkim uzasadnieniem.
- Punkty wymagające niedostępnych narzędzi, wyników CI, danych środowiskowych albo konfiguracji oznacz jako `Wymaga narzędzia/danych` i opisz ograniczenie.
- Punkty ocenione oznacz jako `Sprawdzone`; jeśli wykryto problem, opisz go jako ustalenie z rekomendacją naprawy.

### Obszary obowiązkowej oceny

| Obszar | Co sprawdzić |
| --- | --- |
| OWASP TOP 30+ — Wymaganie krytyczne [Docs/OWASP_TOP_30_PLUS.md](Docs/OWASP_TOP_30_PLUS.md) | Injection, broken access control, authentication/session risks, security misconfiguration, vulnerable components, logging/monitoring gaps oraz inne adekwatne kategorie OWASP dla technologii i powierzchni ataku. |
| Clean Architecture | Kierunek zależności, separację warstw, brak przecieków infrastruktury do domeny, poprawne granice modułów i brak cykli zależności. |
| Secure by Design | Domyślne ograniczenia uprawnień, walidację na granicach systemu, bezpieczne wartości domyślne, jawne modelowanie zagrożeń i minimalizację powierzchni ataku. |
| Najlepsze praktyki C#/.NET i Python | Idiomatyczne API, asynchroniczność, zarządzanie zasobami, walidację danych, typowanie, konfigurację, obsługę wyjątków i zgodność z lokalnymi instrukcjami projektu. |
| KISS i SOLID | Prostotę rozwiązania, SRP, rozsądne granice abstrakcji, brak nadmiernej generalizacji, łatwość testowania i utrzymania. |
| Performance | Złożoność obliczeniową, N+1 queries, blokujące I/O, nadmiarowe renderowania, rozmiar bundla, caching, indeksy, batchowanie i ścieżki krytyczne SLA. |
| Reliability | Obsługę błędów, logowanie, retry mechanisms, timeouts, idempotencję, transakcje, race conditions, degradację awaryjną i spójność stanu. |
| Martwy i zbędny kod | Niepotrzebne lub nieużywane funkcje, metody, klasy, komponenty, endpointy, importy, `using`, eksporty, flagi i konfiguracje. |
| Zero Trust dla danych zewnętrznych | Traktowanie jako niezaufanych danych z API, zewnętrznych serwisów, wejścia użytkownika, plików, eventów, komunikatów z kolejek, webhooków i procesów wsadowych; walidację, sanityzację, autoryzację oraz ograniczenia schematów. |
| Security scanning | SAST, SCA/dependency audit, secret scanning i IaC scanning. Jeśli narzędzia nie są dostępne, sprawdź konfigurację repozytorium/CI oraz odnotuj brak, ograniczenie lub wymagane dane zamiast milczeć. |
| Sygnały ostrzegawcze bezpieczeństwa | Poświadczenia wpisane w kod, dane wrażliwe w tekście jawnym, surowy SQL lub konkatenacja zapytań, publiczne endpointy bez auth/rate limit, dane wrażliwe w logach, stos wywołań albo ścieżki wewnętrzne w odpowiedziach oraz arbitralna deserializacja obiektów. |

### Minimalny format statusu

W raporcie użyj krótkiej tabeli lub listy statusów:

| Obszar | Status | Uzasadnienie / ograniczenie |
| --- | --- | --- |
| OWASP TOP 30+ — Wymaganie krytyczne [Docs/OWASP_TOP_30_PLUS.md](Docs/OWASP_TOP_30_PLUS.md) | `Sprawdzone` / `Nie dotyczy` / `Wymaga narzędzia/danych` | Krótkie uzasadnienie albo link do ustalenia. |

---

## Podsumowanie reguł

| ID   | Nazwa                                    | Severity | Stack      |
| ---- | ---------------------------------------- | -------- | ---------- |
| V-01 | SQL Injection via String Concatenation   | ERROR    | Python     |
| V-02 | Hardcoded Secret in Source               | ERROR    | General    |
| V-03 | CORS Allow All Origins                   | WARNING  | Python     |
| V-04 | Dangerously Set Inner HTML               | ERROR    | TypeScript |
| V-05 | Async Function Without Error Handling    | WARNING  | Python     |
| V-06 | React useEffect Missing Cleanup          | WARNING  | TypeScript |
| V-07 | Unchecked API Response                   | WARNING  | TypeScript |
| V-08 | Missing Database Transaction             | WARNING  | Python     |
| V-09 | N+1 Query Pattern                        | ERROR    | Python     |
| V-10 | Large Bundle Import                      | WARNING  | TypeScript |
| V-11 | Synchronous I/O in Async Context         | ERROR    | Python     |
| V-12 | Magic Number in Business Logic           | INFO     | General    |
| V-13 | Console.log Left in Production Code      | WARNING  | TypeScript |
| V-14 | TODO/FIXME Without Issue Reference       | INFO     | General    |
| V-15 | Pydantic Model Without Field Validation  | INFO     | Python     |
| V-16 | God Function (50+ lines)                 | WARNING  | General    |
| V-17 | Deep Nesting (4+ levels)                 | WARNING  | General    |
| V-18 | Star Import (from module import *)       | WARNING  | Python     |

---

## Security

### Dodatkowe wzorce przeglądu bezpieczeństwa

Sygnały ostrzegawcze wymagające priorytetowego sprawdzenia:

- Poświadczenia wpisane na stałe, tokeny, klucze API, connection stringi lub sekrety w kodzie, konfiguracji, fixtures testowych i przykładach.
- Dane wrażliwe przechowywane albo przekazywane w tekście jawnym bez uzasadnionej ochrony transportu, spoczynku i dostępu.
- Surowy SQL, interpolacja stringów lub konkatenacja zapytań bez parametryzacji.
- Publiczne endpointy bez jawnej decyzji o auth, rate limit, limitach rozmiaru requestu i ograniczeniach paginacji/batch.
- Dane wrażliwe, tokeny, pełne payloady, stos wywołań, ścieżki wewnętrzne lub sekrety w logach i odpowiedziach API.
- Deserializacja do arbitralnych typów lub modeli przyjmujących nieograniczone pola bez walidacji schematu.

Przy review poświadczeń i API keys sprawdź: przechowywanie hashy zamiast plaintext, porównanie stałoczasowe, scope, właściciela, datę wygaśnięcia, mechanizm revocation, rotację, `last-used` tracking oraz audyt udanych i nieudanych prób auth.

Przy review obsługi błędów sprawdź, czy produkcyjne odpowiedzi są neutralne, stabilne i nie ujawniają sekretów, ścieżek, stosów ani szczegółów infrastruktury. Pełny kontekst techniczny powinien trafić do logów z redakcją danych wrażliwych i correlation ID.

Kategorie testów bezpieczeństwa dobieraj do powierzchni zmiany: invalid auth, payloady injection, XSS/raw HTML, unauthorized access, brak sekretów w logach oraz brak szczegółów wewnętrznych w odpowiedziach błędów.

### V-01: SQL Injection via String Concatenation

**Severity:** ERROR | **Stack:** Python | **Dotyczy:** `**/*.py`

**Opis:** Raw SQL budowany przez konkatenację stringów — umożliwia SQL injection.

**Regex detekcji:** `["']\s*\+\s*\w+\s*\+\s*["'].*(?:SELECT|INSERT|UPDATE|DELETE)`

**Akcja naprawcza:** Użyj parametryzowanych zapytań (`bindparams()`, `:param`, `$1`).

---

### V-02: Hardcoded Secret in Source

**Severity:** ERROR | **Stack:** General | **Dotyczy:** `**/*.py **/*.ts **/*.tsx **/*.env.example`

**Opis:** Hasła, tokeny lub klucze zapisane bezpośrednio w kodzie źródłowym.

**Regex detekcji:** `(password|secret|api_key|token|private_key)\s*[:=]\s*["'][^"']{8,}["']`

**Akcja naprawcza:** Przenieś do zmiennej środowiskowej lub secrets managera.

---

### V-03: CORS Allow All Origins

**Severity:** WARNING | **Stack:** Python | **Dotyczy:** `**/*.py`

**Opis:** `allow_origins=["*"]` otwiera wektor CSRF w produkcji.

**Regex detekcji:** `allow_origins.*\[.*"\*".*\]`

**Akcja naprawcza:** Zdefiniuj jawną listę origins ze zmiennej środowiskowej.

---

### V-04: Dangerously Set Inner HTML

**Severity:** ERROR | **Stack:** TypeScript | **Dotyczy:** `**/*.tsx **/*.jsx`

**Opis:** `dangerouslySetInnerHTML` bez sanityzacji tworzy wektor XSS.

**Regex detekcji:** `dangerouslySetInnerHTML`

**Akcja naprawcza:** Zastosuj `DOMPurify.sanitize(html)` lub unikaj raw HTML.

---

## Reliability

### V-05: Async Function Without Error Handling

**Severity:** WARNING | **Stack:** Python | **Dotyczy:** `**/*.py`

**Opis:** Async endpoint bez `try/except` — nieobsłużony wyjątek zwraca generyczny HTTP 500.

**Regex detekcji:** `async\s+def\s+\w+.*:\s*\n\s+await\b`

**Akcja naprawcza:** Dodaj global exception handler lub explicit `try/except` ze structured error response.

---

### V-06: React useEffect Missing Cleanup

**Severity:** WARNING | **Stack:** TypeScript | **Dotyczy:** `**/*.tsx **/*.ts`

**Opis:** `useEffect` z subskrypcją/intervalem bez cleanup function — memory leaks po odmontowaniu.

**Regex detekcji:** `useEffect\(\(\)\s*=>\s*\{[^}]*(setInterval|addEventListener|WebSocket|subscribe)[^}]*\}(?!.*return)`

**Akcja naprawcza:** Zwróć cleanup function zamykającą subskrypcję / czyszczącą interval.

---

### V-07: Unchecked API Response

**Severity:** WARNING | **Stack:** TypeScript | **Dotyczy:** `**/*.tsx **/*.ts`

**Opis:** `fetch()` bez sprawdzenia statusu — cichy failure psujący stan UI.

**Regex detekcji:** `await\s+fetch\([^)]+\)(?!.*\.ok|.*catch|.*try)`

**Akcja naprawcza:** Sprawdź `response.ok` i obsłuż error states.

---

### V-08: Missing Database Transaction

**Severity:** WARNING | **Stack:** Python | **Dotyczy:** `**/*.py`

**Opis:** Wiele operacji DB bez explicit transaction — partial failure = niespójny stan danych.

**Regex detekcji:** `await\s+session\.execute.*\n\s*await\s+session\.execute`

**Akcja naprawcza:** Owiń powiązane operacje w `async with session.begin()`.

---

## Performance

### V-09: N+1 Query Pattern

**Severity:** ERROR | **Stack:** Python | **Dotyczy:** `**/*.py`

**Opis:** Zapytanie DB wewnątrz pętli `for` — N+1 zapytań zamiast jednego.

**Regex detekcji:** `for\s+\w+\s+in.*:\s*\n\s*.*await.*session\.(execute|get|query)`

**Akcja naprawcza:** Użyj batch query z `WHERE IN` lub eager loading (`joinedload`/`selectinload`).

---

### V-10: Large Bundle Import

**Severity:** WARNING | **Stack:** TypeScript | **Dotyczy:** `**/*.tsx **/*.ts`

**Opis:** Default import całej biblioteki zamiast tree-shakeable named import — zwiększa bundle.

**Regex detekcji:** `import\s+\w+\s+from\s+['"](?:lodash|moment|date-fns|@mui/material|antd)['"]`

**Akcja naprawcza:** Użyj named imports lub dynamic import dla code splitting.

---

### V-11: Synchronous I/O in Async Context

**Severity:** ERROR | **Stack:** Python | **Dotyczy:** `**/*.py`

**Opis:** Synchroniczne I/O (`requests`, `open()`, `time.sleep()`) w async endpoint blokuje event loop.

**Regex detekcji:** `async\s+def.*\n(?:.*\n)*?.*(?:requests\.(get|post|put)|open\(|time\.sleep)`

**Akcja naprawcza:** Zastąp przez `httpx.AsyncClient`, `aiofiles.open()`, `asyncio.sleep()`.

---

## Code Quality

### V-12: Magic Number in Business Logic

**Severity:** INFO | **Stack:** General | **Dotyczy:** `**/*.py **/*.ts **/*.tsx`

**Opis:** Liczbowe literały bez nazwy w logice biznesowej — utrudniają zrozumienie intencji.

**Regex detekcji:** `if.*[><=]+\s*\d{2,}|return.*\*\s*\d{2,}|/\s*\d{2,}(?!.*#|.*//|.*CONST|.*_RATE|.*_LIMIT|.*_MAX|.*_MIN)`

**Akcja naprawcza:** Wyekstrahuj nazwaną stałą: `MAX_POSITION_SIZE = 10000`.

---

### V-13: Console.log Left in Production Code

**Severity:** WARNING | **Stack:** TypeScript | **Dotyczy:** `**/*.tsx **/*.ts`

**Opis:** `console.log`/`console.debug` w produkcji — zaśmiecają konsolę i mogą ujawnić dane.

**Regex detekcji:** `console\.(log|debug|info|warn)\(`

**Akcja naprawcza:** Użyj structured loggera (`pino`, `winston`) lub usuń debug statements.

---

### V-14: TODO/FIXME Without Issue Reference

**Severity:** INFO | **Stack:** General | **Dotyczy:** `**/*.py **/*.ts **/*.tsx`

**Opis:** TODO/FIXME bez referencji do ticketa — giną w kodzie i nie zostają rozwiązane.

**Regex detekcji:** `(TODO|FIXME|HACK|XXX)(?!.*#\d|.*GH-|.*issue)`

**Akcja naprawcza:** Dodaj referencję: `TODO(GH-123): description`.

---

### V-15: Pydantic Model Without Field Validation

**Severity:** INFO | **Stack:** Python | **Dotyczy:** `**/models/**/*.py **/schemas/**/*.py`

**Opis:** Pydantic model bez constraints z `Field()` — brak walidacji na wejściu API.

**Regex detekcji:** `class\s+\w+\(BaseModel\):(?:.*\n)*?.*:\s*(?:str|int|float)\s*$`

**Akcja naprawcza:** Dodaj constrainty: `Field(min_length=1)`, `Field(ge=0)` lub `@field_validator`.

---

## Code Smells

### V-16: God Function (50+ lines)

**Severity:** WARNING | **Stack:** General | **Dotyczy:** `**/*.py **/*.ts **/*.tsx`

**Opis:** Funkcja przekracza 50 linii — zbyt wiele odpowiedzialności, trudna do testowania i zrozumienia. Zazwyczaj zawiera mieszaną logikę walidacji, przetwarzania i formatowania.

**Regex detekcji:** nie dotyczy (wymaga zliczania linii — sprawdzaj ręcznie lub narzędziem analizy statycznej)

**Akcja naprawcza:** Rozbij na mniejsze, fokusowane funkcje. Wydziel walidację, transformację danych i side effects do osobnych funkcji. Cel: każda funkcja robi jedną rzecz.

---

### V-17: Deep Nesting (4+ levels)

**Severity:** WARNING | **Stack:** General | **Dotyczy:** `**/*.py **/*.ts **/*.tsx`

**Opis:** Kod z 4+ poziomami zagnieżdżenia (`if` w `for` w `if` w `try`) — trudny do śledzenia flow, podatny na błędy logiczne, utrudnia code review.

**Regex detekcji:** nie dotyczy (wymaga analizy wcięć — sprawdzaj ręcznie lub narzędziem analizy statycznej)

**Akcja naprawcza:** Użyj early return/continue aby odwrócić warunki, wydziel zagnieżdżone bloki do named functions, rozważ guard clauses na początku funkcji.

---

### V-18: Star Import (from module import *)

**Severity:** WARNING | **Stack:** Python | **Dotyczy:** `**/*.py`

**Opis:** `from module import *` — zanieczyszcza namespace, ukrywa pochodzenie symboli, powoduje kolizje nazw i uniemożliwia statyczną analizę (mypy, ruff). Utrudnia refactoring i code review.

**Regex detekcji:** `from\s+\S+\s+import\s+\*`

**Akcja naprawcza:** Importuj jawnie potrzebne symbole: `from module import ClassName, function_name`. Dla wielu importów użyj nawiasów: `from module import (A, B, C)`.
