# Discovery i Wymagania Architektoniczne

Materiał referencyjny do ładowania, gdy projekt architektury wymaga pełnego odkrycia celu, ograniczeń, granic systemu, NFR, dokumentów zewnętrznych albo decyzji o external research.

## Źródła Wejściowe

Sprawdź źródła proporcjonalnie do ryzyka zadania:

- Rozmowa z użytkownikiem, opis zadania, kryteria akceptacji i oczekiwany wynik.
- `*.research.md` jako opis problemu, kontekstu biznesowego, luk i wstępnych wymagań.
- `*.solution-research.md` jako wynik researchu: rekomendacja, matryca opcji, C4 Context i ADR drafts.
- Dokumenty PDF, specyfikacje API, wymagania zgodności, dokumentacja integracji i dokumenty architektoniczne.
- Aktualny codebase, README, instrukcje repozytorium, testy, CI, changelog i istniejące plany.
- Istniejące quality gates: lint, testy architektury, accessibility checks, performance budgets, kontrakty importów.

## Minimalny Kontrakt Discovery

Przed decyzją architektoniczną ustal:

- Cel biznesowy i problem użytkownika.
- Zakres in/out, granice systemu i odpowiedzialności modułów.
- Aktorów, role, integracje zewnętrzne i przepływy danych.
- Dane wrażliwe, wymagania prywatności, autoryzacji, audytu i zgodności.
- Ograniczenia technologiczne, organizacyjne, budżetowe, licencyjne i operacyjne.
- Model wdrożenia, środowiska, observability, backup, rollback i migracje.
- NFR: security, scalability, maintainability, performance i accessibility.
- Założenia, niewiadome, ryzyka i decyzję, czy potrzebny jest external research.

## Pytania Do Użytkownika

Pytaj tylko o informacje, których nie da się bezpiecznie wywnioskować i które wpływają na architekturę. Grupuj pytania w krótki pakiet:

- Jakie zachowanie jest krytyczne biznesowo, a co jest poza zakresem?
- Jakie są wolumeny danych, liczba użytkowników, SLA, latency target albo peak load?
- Jakie dane są wrażliwe i jakie reguły dostępu, audytu lub retencji obowiązują?
- Jakie systemy zewnętrzne są źródłem prawdy i kto odpowiada za ich dostępność?
- Czy istnieją narzucone technologie, licencje, platformy, regiony albo koszty graniczne?
- Jakie są wymagania dostępności, wsparcia urządzeń, języków i ról użytkowników?
- Jakie ryzyka akceptujemy, a których nie wolno przenieść do implementacji?

Jeśli użytkownik nie może odpowiedzieć od razu, zapisz jawne założenie, jego wpływ i warunek weryfikacji.

## Obecny Codebase

Dla istniejącego systemu rozpoznaj:

- Architektoniczne warstwy, moduły, bounded contexts, publiczne API i punkty integracji.
- Kierunek zależności, zależności cykliczne, miejsca obejścia reguł i granice importów.
- Wzorce już używane w repozytorium, lokalne helpery, style testowania i konwencje konfiguracji.
- Miejsca migracji danych, kompatybilności wstecznej, feature flags i rollbacku.
- Testy i bramki jakości, które powinny potwierdzić projekt po implementacji.

Użyj `technical-context-discovering`, gdy trzeba szybko poznać konwencje, oraz `codebase-analysing`, gdy decyzja wymaga głębokiej mapy komponentów i zależności.

## Dokumenty PDF i Materiały Zewnętrzne

Gdy zadanie odwołuje się do PDF lub dokumentu zewnętrznego:

- Wyodrębnij wymagania, ograniczenia, definicje pojęć, API, compliance i niejawne założenia.
- Odróżnij wymaganie twarde od rekomendacji, przykładu lub opisu stanu obecnego.
- Zapisz wpływ dokumentu na granice systemu, NFR, ryzyka i decyzje.
- Nie kopiuj długich fragmentów dokumentu do planu; przenieś tylko decyzje i wymagania istotne dla architektury.

## Kryteria External Research

Uruchom `solution-researching`, gdy:

- Trzeba wybrać framework, bibliotekę, usługę chmurową, broker, bazę danych, standard integracji lub narzędzie.
- Aktualność API, licencji, kosztów, ograniczeń dostawcy albo bezpieczeństwa wpływa na decyzję.
- Decyzja ma duży blast radius, jest trudna do odwrócenia lub tworzy vendor lock-in.
- Brakuje porównania opcji, benchmarków, przykładów produkcyjnych albo dojrzałości ekosystemu.
- Ryzyko compliance, accessibility, performance lub operacyjne zależy od zewnętrznego rozwiązania.

Research nie jest zwykle potrzebny, gdy zadanie mieści się w ustalonym stosie repozytorium, istnieje lokalny wzorzec i decyzja nie zmienia granic systemu ani NFR.

## Wynik Discovery

Przed projektowaniem miej krótką, jawną listę:

- Wymagania funkcjonalne i NFR.
- Ograniczenia i granice systemu.
- Założenia oraz pytania otwarte.
- Kryteria oceny wariantów.
- Decyzję: external research wymagany, wykorzystany istniejący research albo research pominięty z uzasadnieniem.
