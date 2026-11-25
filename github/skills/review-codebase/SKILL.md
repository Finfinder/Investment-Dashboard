---
name: review-codebase
description: "Wykonaj kompleksową analizę jakości kodu: martwy kod, duplikacje i obszary do usprawnień."
disable-model-invocation: true
---

# Kompleksowa Analiza Jakości Kodu Repozytorium

> **Kontekst migracji z promptu**: Ten skill powstał w wyniku migracji promptu `.github/prompts/review-codebase.prompt.md` dla środowiska Agent Host / Copilot CLI.
> - **Oryginalny agent**: `architect`

Twoim celem jest przeprowadzenie szczegółowej analizy jakości kodu repozytorium. Analiza powinna obejmować wykrywanie martwego kodu, identyfikację duplikacji kodu oraz propozycje usprawnień. Wyniki muszą zostać zapisane do pliku raportu w formacie markdown.

## Wymagane skille

Przed rozpoczęciem załaduj i stosuj poniższe skille:
- `codebase-analysing` - wyłącznie do ustrukturyzowanego procesu analizy bazy kodu; przed generowaniem raportów przeczytaj `.github/skills/codebase-analysing/references/review-codebase-report-templates.md`, bo ta referencja nadpisuje instrukcje raportowe skilla dla tego workflow
- `technical-context-discovering` - aby zrozumieć konwencje projektu, wzorce architektoniczne i ustalone praktyki
- `code-reviewing` - dla standardów jakości kodu, weryfikacji dobrych praktyk i kwestii bezpieczeństwa; załaduj wspólny kontrakt weryfikacyjny z `.github/skills/code-reviewing/references/validations.md` i stosuj go per warstwa/aplikacja (uwaga: Faza 5 tego promptu doprecyzowuje instrukcje dotyczące SonarCloud/SonarQube zawarte w tym skillu — Krok 7, ale brak Sonara nie zwalnia z pozostałych kontroli security scanning)

## Workflow

### Faza 1: Odkrywanie kontekstu

1. Załaduj i stosuj skill `technical-context-discovering`, aby zrozumieć konwencje projektu, standardy kodowania i istniejące wzorce.
2. Określ typ repozytorium (monorepo vs pojedynczy system). Jeśli to monorepo, zidentyfikuj wszystkie aplikacje, pakiety i współdzielone biblioteki. Każda warstwa/aplikacja musi być analizowana i raportowana oddzielnie.
3. Zidentyfikuj stos technologiczny, frameworki i kluczowe zależności dla każdej warstwy/aplikacji.

### Faza 2: Analiza bazy kodu (użyj subagentów)

Uruchom subagentów `architect` równolegle - po jednym na każdą zidentyfikowaną warstwę/aplikację. Każdy subagent powinien otrzymać szczegółowe instrukcje obejmujące:
- Konkretną ścieżkę warstwy/aplikacji oraz stos technologiczny do analizy
- Zakres wyszukiwania (martwy kod, duplikacje, obszary do usprawnień)
- Skille do załadowania (`codebase-analysing`, `code-reviewing`)
- Wymóg zastosowania wspólnego kontraktu weryfikacyjnego z `.github/skills/code-reviewing/references/validations.md` dla analizowanej warstwy/aplikacji
- Raportowanie statusu każdego obszaru kontraktu jako `Sprawdzone`, `Nie dotyczy` albo `Wymaga narzędzia/danych`, wraz z ograniczeniami narzędziowymi i brakującymi danymi
- Zwrócenie ustrukturyzowanych wyników w formacie zgodnym z szablonem raportu

Dla każdej warstwy/aplikacji subagent powinien:

#### 2a. Wykrywanie martwego kodu
- Wyszukaj nieużywane importy we wszystkich plikach źródłowych.
- Wyszukaj nieużywane eksportowane funkcje, klasy, typy, interfejsy i stałe, które nigdzie indziej nie są importowane.
- Wyszukaj nieużywane komponenty (frontend), które nie są referencjonowane w żadnej trasie, stronie ani innym komponencie.
- Wyszukaj nieosiągalne ścieżki kodu (np. po instrukcjach return/throw, warunki niemożliwe do spełnienia).
- Wyszukaj nieużywane pliki konfiguracyjne, zmienne środowiskowe i flagi funkcjonalności.
- Wyszukaj przestarzały kod oznaczony `@deprecated` lub podobnymi adnotacjami, który nie jest już referencjonowany.
- Wyszukaj pliki, które nigdzie nie są importowane ani wymagane.
- Wyszukaj martwe trasy lub endpointy, które są zdefiniowane, ale nieosiągalne.
- Wykonaj cross-reference plików testowych: znajdź kod importowany wyłącznie we własnym pliku testowym i nigdzie indziej w kodzie produkcyjnym.

#### 2b. Wykrywanie duplikacji
- Wyszukaj zduplikowane funkcje lub metody o identycznej albo niemal identycznej logice w różnych plikach.
- Wyszukaj zduplikowane komponenty UI renderujące podobne struktury z niewielkimi wariacjami.
- Wyszukaj zduplikowane wzorce wywołań API, logikę pobierania danych lub wzorce obsługi błędów.
- Wyszukaj zduplikowaną logikę walidacji, funkcje narzędziowe lub metody pomocnicze.
- Wyszukaj zduplikowane definicje typów, interfejsów lub schematów.
- Wyszukaj zduplikowane konfiguracje lub definicje stałych pomiędzy modułami.
- Wyszukaj bloki kodu kopiuj-wklej różniące się jedynie nazwami zmiennych lub literałami znakowymi.
- Zidentyfikuj komponenty/funkcje bardzo podobne do siebie, które można połączyć w jedną konfigurowalną wersję.

#### 2c. Obszary do usprawnień
- Zidentyfikuj nadmiernie złożone funkcje (wysoka złożoność cyklomatyczna, głębokie zagnieżdżenia logiki).
- Zidentyfikuj funkcje lub klasy o zbyt wielu odpowiedzialnościach (naruszenia SRP).
- Zidentyfikuj brakujące lub niespójne wzorce obsługi błędów.
- Zidentyfikuj niespójne konwencje nazewnictwa lub style kodowania.
- Zidentyfikuj brakujące typy TypeScript lub nadmierne użycie `any`.
- Zidentyfikuj możliwości ekstrakcji współdzielonej logiki do reużywalnych utili lub hooków.
- Zidentyfikuj przestarzałe wzorce, które można zmodernizować (np. callbacks do async/await, komponenty klasowe do funkcyjnych).
- Zidentyfikuj brakujące lub niewystarczające pokrycie testami dla krytycznych ścieżek.
- Zidentyfikuj potencjalne problemy wydajnościowe (zbędne re-renderingi, zapytania N+1, brakujące indeksy).
- Zidentyfikuj zagrożenia bezpieczeństwa (ujawnione sekrety, brak walidacji wejścia, ryzyko SQL injection).
- Sprawdź dostępne konfiguracje repozytorium i CI dla SAST, SCA/dependency audit, secret scanning i IaC scanning; brak narzędzia, konfiguracji albo danych oznacz jako `Wymaga narzędzia/danych` z krótkim ograniczeniem.

### Faza 3: Przegląd architektury

Użyj perspektywy `architect`, aby ocenić:
- Czy obecne granice modułów/pakietów są dobrze zdefiniowane.
- Czy kod współdzielony jest poprawnie wydzielony i reużywalny.
- Czy graf zależności między modułami jest czysty (brak zależności cyklicznych).
- Czy separacja odpowiedzialności jest właściwie utrzymana.
- Czy obecne wzorce są skalowalne i łatwe w utrzymaniu.

### Faza 4: Generowanie raportu

1. Przed napisaniem raportu przeczytaj `.github/skills/codebase-analysing/references/review-codebase-report-templates.md` i stosuj zdefiniowany tam kontrakt wyniku.
2. Zbierz wszystkie ustalenia z Fazy 2 i Fazy 3.
3. W przypadku monorepo zorganizuj ustalenia według warstw/aplikacji z czytelnymi nagłówkami sekcji. Statusy wspólnego kontraktu weryfikacyjnego raportuj oddzielnie dla każdej warstwy/aplikacji.
4. Nadaj priorytety wszystkim ustaleniom według poziomów istotności:
   - 🔴 **Krytyczne** - Musi zostać naprawione; powoduje błędy, problemy bezpieczeństwa lub istotne obciążenie utrzymaniowe
   - 🟡 **Ważne** - Powinno zostać naprawione; poprawia jakość, czytelność lub utrzymywalność
   - 🟢 **Nice to Have** - Usprawnienia opcjonalne; dopracowanie i optymalizacja
5. Zapisz raport jako `code-quality-report.md` w katalogu głównym repozytorium.

### Faza 5: Analiza SonarCloud i security scanning (warunkowa)

> Faza SonarCloud jest generyczna: nie zakłada konkretnego projektu ani organizacji. Dane projektu wykryj z repozytorium (`sonar-project.properties`, konfiguracje scannerów), konfiguracji CI, jawnych zmiennych workflow albo danych przekazanych przez użytkownika. Brak narzędzia Sonar/SonarQube, project key albo organizacji nie kończy security scanningu — oznacz analizę Sonar jako `Wymaga narzędzia/danych` i wykonaj pozostałe możliwe kontrole bezpieczeństwa bez chodzenia na skróty.

1. **Sprawdź dostępność narzędzia `sonarqube`** w środowisku MCP oraz wykryj dane projektu SonarCloud/SonarQube z repozytorium, konfiguracji CI albo danych użytkownika.
2. **Jeśli `sonarqube` jest niedostępne albo brakuje project key/organizacji**, nie zgaduj wartości. Oznacz analizę Sonar jako `Wymaga narzędzia/danych`, zapisz ograniczenie w `code-quality-report.md`, nie twórz `sonar-report.md` i przejdź do kontroli security scanning w repozytorium/CI.
3. **Jeśli `sonarqube` jest dostępne i dane projektu są znane**, pobierz Quality Gate status dla wykrytego lub wskazanego projektu — status (PASSED/FAILED) oraz listę warunków niespełnionych. W monorepo obsłuż osobne projekty Sonar per warstwa/aplikacja, jeśli konfiguracja tak je definiuje.
4. **Pobierz ogólne metryki projektu**: reliability rating, security rating, maintainability rating, coverage (%), duplications (%), lines of code, liczba bugów, vulnerabilities i code smells.
5. **Pobierz Security Hotspots** — dla każdego hotspota: status (To Review / Reviewed / Safe), kategoria OWASP, plik z numerem linii, opis.
6. **Pobierz Issues z rozbiciem na severity**: BLOCKER, CRITICAL, MAJOR, MINOR, INFO.
   - Dla każdego poziomu severity policz issues pogrupowane po typie (Bug, Vulnerability, Code Smell).
   - Jeśli issues w danym severity jest **więcej niż 20** → pogrupuj po typie, podaj liczby oraz top 5 najważniejszych przykładów per typ.
   - Jeśli issues w danym severity jest **20 lub mniej** → wymień szczegółowo każdy issue (typ, reguła, plik, linia, opis).
7. **Wygeneruj podsumowanie i rekomendacje** na podstawie zebranych danych — ogólna ocena jakości, kluczowe problemy, priorytetyzowane działania naprawcze.
8. **Zapisz raport jako `sonar-report.md`** w katalogu głównym repozytorium tylko po udanej analizie SonarCloud/SonarQube, używając szablonu SonarCloud z referencji `.github/skills/codebase-analysing/references/review-codebase-report-templates.md`.
9. **Zaktualizuj raport `code-quality-report.md`** — w sekcji "Powiązane raporty" oznacz status raportu Sonar jako `✅ Wygenerowany` albo `Wymaga narzędzia/danych` z krótkim powodem.
10. **Niezależnie od wyniku Sonara sprawdź security scanning w repozytorium i CI**: konfiguracje SAST, SCA/dependency audit, secret scanning oraz IaC scanning. Jeśli narzędzia lub wyniki nie są dostępne, oznacz odpowiednie obszary jako `Wymaga narzędzia/danych`; jeśli obszar nie dotyczy repozytorium, oznacz `Nie dotyczy` z uzasadnieniem.

## Minimalny kontrakt wyniku

- `code-quality-report.md` powstaje zawsze i zawiera sekcje wymagane w `.github/skills/codebase-analysing/references/review-codebase-report-templates.md`.
- `code-quality-report.md` zawiera statusy wspólnego kontraktu weryfikacyjnego per warstwa/aplikacja oraz jawne ograniczenia narzędziowe.
- `sonar-report.md` powstaje tylko po udanej analizie SonarCloud.
- Jeśli SonarCloud pominięto albo nie dało się ustalić danych projektu, `code-quality-report.md` musi jasno oznaczać status raportu Sonar jako `Wymaga narzędzia/danych` albo pominięty z powodem.
- Raporty muszą być samowystarczalne, zrozumiałe bez dodatkowego kontekstu i zapisane w języku polskim.

## Wytyczne

- Podawaj ścieżki plików i numery linii przy ustaleniach.
- Każde ustalenie musi mieć jasną rekomendację naprawy.
- Weryfikuj potencjalny martwy kod przez importy, importy dynamiczne i re-eksporty, aby ograniczyć false positive.
- W monorepo nie mieszaj ustaleń z różnych warstw/aplikacji.
- Deleguj skanowanie plików do subagentów, a samodzielnie skup się na ocenie architektury i syntezie raportu.
- Brak narzędzia Sonar/SonarQube nie jest powodem do pominięcia kontroli bezpieczeństwa; sprawdź dostępne konfiguracje repozytorium i CI, a ograniczenia raportuj jawnie.
