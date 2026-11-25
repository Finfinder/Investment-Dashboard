# Typy Dokumentów i Struktury — Writing Docs

Referencja dla wyboru struktury dokumentu i pełniejszych checklist. Używaj jej, gdy aktywny proces wymaga konkretnego szablonu README, API docs, tutoriala, przewodnika developerskiego, komentarzy w kodzie albo changeloga.

## README

README jest pierwszym kontraktem projektu z użytkownikiem. Ma szybko odpowiedzieć: co to jest, dla kogo, jak uruchomić, jak zweryfikować sukces i gdzie iść dalej.

### Struktura README

1. Nazwa projektu i jednozdaniowy opis wartości.
2. Status projektu, wymagania i obsługiwane wersje.
3. Quick start: instalacja, minimalny przykład, oczekiwany wynik.
4. Najczęstsze użycie i podstawowa konfiguracja.
5. Testy, lint, build, uruchomienie lokalne.
6. Linki do pełnej dokumentacji, troubleshooting, changeloga, contribution guide i security policy.

### Checklista README

- [ ] Quick start działa od czystego checkoutu albo jasno opisuje wymagane zależności.
- [ ] Komendy mają katalog roboczy, wymagane wersje i oczekiwany rezultat.
- [ ] Linki prowadzą do istniejących plików albo stabilnych adresów.
- [ ] README nie obiecuje funkcji, których nie ma w kodzie.
- [ ] Sekrety są placeholderami, a konfiguracja produkcyjna nie uczy złych wzorców.

## Dokumentacja API

API docs opisują publiczny kontrakt, nie intencje implementacji. Źródłem prawdy powinien być OpenAPI/Swagger, schemat GraphQL, test kontraktowy albo kod publicznego SDK.

### Struktura Dokumentacji API

1. Base URL, wersjonowanie, autentykacja i wymagane nagłówki.
2. Limity, paginacja, idempotencja, timeouts i zasady kompatybilności.
3. Endpointy lub operacje: opis, parametry, request, response, status codes.
4. Przykłady curl/fetch/SDK z oczekiwanym outputem.
5. Kody błędów, retry policy, rate limit handling i troubleshooting.
6. Webhooki, eventy, migration notes i changelog API, jeśli dotyczy.

### Checklista Dokumentacji API

- [ ] Każdy endpoint ma przykład request i response dla sukcesu oraz istotnych błędów.
- [ ] Parametry mają typ, wymaganie, domyślną wartość, limit i informację o wersji, jeśli się zmieniały.
- [ ] Przykłady są zgodne z aktualnym schematem i testami kontraktowymi.
- [ ] Błędy są opisane przez przyczynę, diagnostykę i działanie naprawcze.
- [ ] Dokumentacja jasno mówi, co jest stabilnym API, a co szczegółem implementacji.

## Tutoriale

Tutorial prowadzi użytkownika przez jedno zadanie od zera do wyniku. Nie jest pełną referencją i nie powinien rozgałęziać się na wiele wariantów.

### Struktura Tutoriala

1. Cel, czas wykonania, wymagania wstępne i oczekiwany wynik.
2. Przygotowanie środowiska z komendami do weryfikacji.
3. Kroki wykonywane w kolejności, każdy z krótkim wyjaśnieniem i checkpointem.
4. Oczekiwane outputy, zrzuty lub widoczne stany, jeśli pomagają zweryfikować sukces.
5. Najczęstsze błędy i szybkie naprawy.
6. Co dalej: linki do referencji, wariantów i zadań zaawansowanych.

### Checklista Tutoriala

- [ ] Tutorial ma jeden cel i nie miesza kilku ścieżek użytkownika.
- [ ] Każdy krok da się wykonać w opisanym środowisku.
- [ ] Po krytycznych krokach istnieje checkpoint sukcesu.
- [ ] Warianty i edge cases są linkowane, nie wpychane do głównej ścieżki.
- [ ] Tutorial nie wymaga wiedzy, której nie podał albo nie zalinkował.

## Przewodniki Developerskie

Developer guide wspiera utrzymanie projektu: onboarding, lokalne środowisko, architekturę, testy, release i operacje.

### Struktura Przewodnika Developerskiego

1. Zakres przewodnika i rola odbiorcy.
2. Setup lokalny, sekrety developerskie, migracje i dane testowe.
3. Architektura wysokiego poziomu i granice modułów.
4. Typowe workflow: testy, lint, build, debug, release, rollback.
5. Konwencje kodu, importów, konfiguracji i obserwowalności.
6. Troubleshooting, runbooki i linki do ADR-ów.

### Checklista Przewodnika Developerskiego

- [ ] Przewodnik opisuje realne komendy repo, nie ogólne komendy frameworka.
- [ ] Sekrety i dostępy są opisane przez proces pozyskania, nie przez wartości.
- [ ] Architektura jest zgodna z aktualnym kodem i testami granic.
- [ ] Runbook zawiera objawy, diagnozę, działania i kryterium zakończenia.
- [ ] Dokument ma właściciela albo jasny proces aktualizacji.

## Komentarze w Kodzie

Komentarz ma wyjaśniać powód, kontrakt lub ryzyko, którego nie widać z samego kodu. Dokumentowanie oczywistych instrukcji zwiększa szum i koszty utrzymania.

### Dobre miejsca na komentarz

- Nietypowa decyzja wynikająca z ograniczenia API, wydajności, bezpieczeństwa albo kompatybilności.
- Algorytm, którego poprawność wymaga kontekstu domenowego.
- Publiczny kontrakt, precondition, invariant albo edge case.
- Temporary workaround z linkiem do issue i warunkiem usunięcia.

### Checklista Komentarzy

- [ ] Komentarz odpowiada na „dlaczego”, „kiedy” albo „jakie ryzyko”, nie na „co robi ta linia”.
- [ ] Komentarz nie kłamie po zmianie kodu obok.
- [ ] Publiczny komentarz API jest zgodny z testami i typami.
- [ ] Workaround ma kontekst, właściciela albo kryterium usunięcia.

## Changelog

Changelog opisuje zmianę z perspektywy użytkownika. W tym repo trzymaj format Keep a Changelog i wpisy w sekcji `[Unreleased]`, dopóki release nie zostanie przygotowany.

### Struktura Changeloga

1. `[Unreleased]` z kategoriami `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`, gdy są potrzebne.
2. Krótkie wpisy opisujące efekt, nie tylko nazwę pliku.
3. Migration notes przy breaking changes.
4. Link do dokumentu szczegółowego, gdy zmiana jest większa niż jeden wpis.

### Checklista Changeloga

- [ ] Wpis opisuje zmianę zachowania, procesu albo dokumentacji z perspektywy odbiorcy.
- [ ] Breaking change ma instrukcję migracji albo link do niej.
- [ ] Changelog nie dubluje pełnego opisu implementacji.
- [ ] Sekcja `[Unreleased]` pozostaje aktualna przed commitem i release.
