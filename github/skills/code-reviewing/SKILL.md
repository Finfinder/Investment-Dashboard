---
name: code-reviewing
description: Przeprowadź przegląd kodu. Analizę jakości. Weryfikację kryteriów akceptacji. Przegląd najlepszych praktyk.
---

# Przegląd kodu

Ten skill pomaga zweryfikować, czy zaimplementowany kod spełnia wszystkie najlepsze praktyki i standardy jakości.

Każdy przegląd kodu MUSI stosować wspólny kontrakt weryfikacyjny z `./references/validations.md`. Załaduj tę referencję przed oceną jakości, bezpieczeństwa, architektury i ryzyk technologicznych; nie kopiuj pełnej checklisty do aktywnego workflow.

## Proces przeglądu kodu

Użyj poniższej listy kontrolnej i śledź swój postęp:

```
Postęp analizy:
- [ ] Krok 1: Zrozum opis zadania
- [ ] Krok 2: Zrozum plan implementacji zadania
- [ ] Krok 3: Przeanalizuj zaimplementowane rozwiązanie i porównaj je z opisem zadania oraz planem implementacji
- [ ] Krok 4: Zweryfikuj, czy rozwiązanie zawiera wszystkie niezbędne testy
- [ ] Krok 5: Uruchom dostępne testy
- [ ] Krok 6: Zweryfikuj, czy rozwiązanie przestrzega najlepszych praktyk
- [ ] Krok 7: Uruchom narzędzia do statycznej analizy kodu i formatowania
- [ ] Krok 8: Zweryfikuj, czy rozwiązanie jest bezpieczne
- [ ] Krok 9: Zweryfikuj, czy rozwiązanie jest skalowalne
```

**Krok 1: Zrozum opis zadania**

Poszukaj pliku `*.research.md`, aby w pełni zrozumieć cel biznesowy zadania.
Jeśli zadanie jest powiązane z narzędziem do zarządzania zadaniami, skorzystaj z niego, aby uzyskać dodatkowy kontekst.

W przypadku braku pliku research, podążaj za rozmową, aby zrozumieć cel.

**Krok 2: Zrozum plan implementacji zadania**

Poszukaj pliku `*.plan.md`, aby zrozumieć planowaną implementację rozwiązania.

W przypadku jego braku, podążaj za rozmową, aby zrozumieć cel.

**Krok 3: Przeanalizuj zaimplementowane rozwiązanie i porównaj je z opisem zadania oraz planem implementacji**

Na podstawie planu implementacji i opisu zadania porównaj je z faktyczną implementacją.

Skup się nie tylko na plikach, które zostały faktycznie zmienione lub dodane, ale również na tych, które rzekomo były już zaimplementowane.

Przejdź przez wspólny kontrakt weryfikacyjny z `./references/validations.md` dla zmienionego kodu oraz powiązanych obszarów ryzyka. Jeśli przepływ danych, zależności lub granice modułów wskazują na szerszy wpływ, rozszerz analizę poza sam diff.

**Krok 4: Zweryfikuj, czy rozwiązanie zawiera wszystkie niezbędne testy**

Upewnij się, że wszystkie krytyczne ścieżki rozwiązania są w pełni pokryte kombinacją różnych testów – e2e, jednostkowych, integracyjnych.

Zweryfikuj jakość testów, nie tylko ich obecność:
- Czy testy pokrywają ścieżki krytyczne (logikę biznesową, algorytmy, walidację, reguły domenowe)?
- Czy testy weryfikują zachowanie, a nie implementację (np. brak nadmiernego mockowania, brak assertów na internal state)?
- Czy testy regresji towarzyszą naprawianym defektom?
- Czy nazwy testów jasno opisują testowany scenariusz?

Dodatkowe wymiary testowania (weryfikuj gdy dotyczy):
- **Testy wydajnościowe**: Czy ścieżki krytyczne pod kątem SLA mają benchmarki lub testy obciążeniowe?
- **Testy dostępności** (dla zmian UI): Czy istnieją automatyczne testy a11y (axe-core)? Czy nawigacja klawiaturą działa poprawnie? (referencja: skill `ensuring-accessibility`)
- **Testy architektoniczne**: Czy reguły zależności między modułami/warstwami są egzekwowane automatycznie (np. NetArchTest, ArchUnit, dependency-cruiser)?
- **Testy mutacyjne** (dla kodu krytycznego): Czy efektywność testów jednostkowych jest weryfikowana poza line coverage? Rozważ sugestię testów mutacyjnych wyłącznie dla: logiki biznesowej, algorytmów, krytycznych fragmentów systemu — nie dla CRUD, prostych DTO ani kodu „klejącego".

**Krok 5: Uruchom dostępne testy**

Upewnij się, że wszystkie testy działają poprawnie.

**Krok 6: Zweryfikuj, czy rozwiązanie przestrzega najlepszych praktyk**

Sprawdź zaimplementowane rozwiązanie. Upewnij się, że stosuje najlepsze praktyki programistyczne.

Weź pod uwagę standardy projektowe i praktyki takie jak SOLID, SRP, DDD, DRY, KISS, Atomic Design.

Upewnij się, że rozwiązanie nie jest nadmiernie skomplikowane. Utrzymuj niską złożoność kognitywną.

Nie pomijaj istotnych punktów kontraktu tylko dlatego, że zmiana jest mała, czas jest ograniczony albo zakres wygląda prosto. Skaluj głębokość analizy do ryzyka i zakresu, ale każdy punkt adekwatny dla repozytorium, warstwy, technologii lub zmiany musi zostać oceniony.

**Krok 7: Uruchom narzędzia do statycznej analizy kodu i formatowania**

Dla kodu backendowego (Python) uruchom sprawdzenie formatowania: `ruff format --check app/ tests/` (z katalogu `backend/`). Jeśli polecenie zgłosi pliki wymagające formatowania — uruchom `ruff format app/ tests/` aby je sformatować i uwzględnij te zmiany w przeglądzie. Upewnij się również, że `ruff check app/ tests/` nie zgłasza nowych naruszeń reguł lint.

Upewnij się, że zostały uruchomione lintery, narzędzia do statycznej analizy kodu i narzędzia do formatowania.

Jeśli dostępne jest narzędzie `sonarqube`, najpierw ustal dane projektu SonarCloud/SonarQube z repozytorium (`sonar-project.properties`, konfiguracje scannerów), konfiguracji CI, jawnych zmiennych workflow albo danych użytkownika. Nie zgaduj project key ani organizacji; jeśli nie da się ich ustalić, oznacz analizę Sonar jako `Wymaga narzędzia/danych` i opisz brakujące dane.

Gdy narzędzie i dane projektu są dostępne, odpytaj SonarCloud/SonarQube o:
- **Issues na branchu/PR**: Pobierz listę nowych issues (bugs, vulnerabilities, code smells) wprowadzonych przez analizowane zmiany. Uwzględnij je w raporcie przeglądu.
- **Quality gate status**: Sprawdź, czy quality gate przechodzi. Jeśli nie — zidentyfikuj warunki, które nie zostały spełnione.
- **Security hotspots**: Pobierz security hotspots wymagające manualnego review. Oceń ich krytyczność w kontekście zmian.

Jeśli narzędzie `sonarqube` nie jest dostępne (np. brak konfiguracji MCP Server), nie kończ security scanningu. Oznacz Sonar jako `Wymaga narzędzia/danych`, kontynuuj przegląd bez danych Sonar i sprawdź dostępne konfiguracje repozytorium oraz CI dla pozostałych kategorii skanowania bezpieczeństwa.

Dodatkowo poproś dewelopera o sprawdzenie wyników **SonarQube for IDE** (panel Problems w VS Code). SonarQube for IDE analizuje kod lokalnie w real-time i synchronizuje reguły z SonarCloud (Connected Mode). Issues oznaczone jako Accepted lub False Positive na serwerze są automatycznie tłumione w IDE. Agent nie ma bezpośredniego dostępu do wyników SonarQube for IDE — może jedynie poprosić dewelopera o ich weryfikację (referencja: skill `ensuring-code-quality`).

**Krok 8: Zweryfikuj, czy rozwiązanie jest bezpieczne**

Skup się na bezpieczeństwie. Sprawdź potencjalne problemy z OWASP TOP 30+ (WYMAGANIE: KRYTYCZNE) [Docs/OWASP_TOP_30_PLUS.md](Docs/OWASP_TOP_30_PLUS.md). Sprawdź potencjalne krytyczne kwestie bezpieczeństwa, które umożliwiają innym użytkownikom przejęcie kontroli nad systemem.

Brak SonarCloud/SonarQube, SonarQube for IDE albo wyników CI nie zwalnia z kontroli bezpieczeństwa. Sprawdź dostępne konfiguracje repozytorium i pipeline dla SAST, SCA/dependency audit, secret scanning oraz IaC scanning. Jeśli skaner, konfiguracja albo wynik nie są dostępne, raportuj odpowiedni obszar jako `Wymaga narzędzia/danych`; jeśli obszar nie dotyczy repozytorium, użyj `Nie dotyczy` z uzasadnieniem. Nie idź na skróty: wykonaj ręczne kontrole możliwe na podstawie kodu, zależności i konfiguracji.

**Krok 9: Zweryfikuj, czy rozwiązanie jest skalowalne**

Przeanalizuj, czy zaimplementowane rozwiązanie jest skalowalne. Skup się na takich obszarach jak możliwość skalowania poziomego, brak komponentów stanowych oraz brak kodu o wysokiej złożoności obliczeniowej.

Zweryfikuj granice modułów:
- Czy zmiany respektują ustalone granice modułów i kierunek zależności?
- Czy nie wprowadzono nowych zależności cyklicznych?
- Czy kontrakt domenowy (jeśli istnieje `domain.md`) jest przestrzegany? (referencja: skill `system-modularising`)

## Raportowanie statusu kontroli

W wynikach przeglądu raportuj status obszarów ze wspólnego kontraktu weryfikacyjnego. Używaj polskich statusów, np.:
- `Sprawdzone` - obszar został oceniony i nie wykryto problemu albo problem opisano w ustaleniach.
- `Nie dotyczy` - obszar nie ma sensu dla analizowanego repozytorium, warstwy, technologii lub zmiany; podaj krótki powód.
- `Wymaga narzędzia/danych` - ocena wymaga niedostępnego narzędzia, wyników CI, konfiguracji SAST/SCA/secret/IaC scanning, danych produkcyjnych lub innego brakującego wejścia; opisz ograniczenie.

## Materiały Referencyjne

- `./references/validations.md` - wspólny kontrakt weryfikacyjny oraz szczegółowe reguły walidacji kodu; załaduj przy każdym przeglądzie kodu.

## Powiązane skille

- `implementation-gap-analysing`
- `technical-context-discovering` – do zrozumienia konwencji i standardów projektu, pod kątem których przeprowadzany jest przegląd
- `engineering-databases` – do weryfikacji jakości SQL, pokrycia indeksami, wydajności zapytań, projektu schematu i wzorców użycia ORM
- `ensuring-code-quality` – do weryfikacji jakości kodu z wykorzystaniem ekosystemu Sonar (SonarQube for IDE, MCP Server, SonarCloud CI) i lokalnych analizatorów
