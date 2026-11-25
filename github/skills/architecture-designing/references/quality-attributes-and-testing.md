# Quality Attributes i Testowanie Architektury

Materiał referencyjny dla NFR, strategii testowania i quality gates w planach architektonicznych.

## Atrybuty Jakości

Każdy plan architektury powinien jawnie odnieść się do atrybutów jakości. Nie każdy wymaga osobnej fazy, ale każdy powinien mieć decyzję, wymaganie albo krótkie `Nie dotyczy`.

## Security

Uwzględnij:

- Threat modeling i attack surface mapping na poziomie granic zaufania, aktorów, danych wrażliwych, publicznych endpointów, integracji, kolejek, plików, procesów wsadowych i zależności zewnętrznych.
- Defense in depth oraz granice zaufania między API, aplikacją, domeną, danymi, integracjami i infrastrukturą; każda granica powinna mieć walidację, autoryzację, limity i audyt adekwatne do ryzyka.
- Uwierzytelnianie, autoryzację, least privilege, audyt i logging zdarzeń bezpieczeństwa.
- Klasyfikację danych według wrażliwości oraz konsekwencje dla szyfrowania, logowania, maskowania, retencji, dostępu, eksportu i kopii zapasowych.
- OWASP TOP 30+ (WYMAGANIE: KRYTYCZNE) [Docs/OWASP_TOP_30_PLUS.md](Docs/OWASP_TOP_30_PLUS.md) dla aplikacji web/API oraz bezpieczne zarządzanie sekretami.
- Szyfrowanie w tranzycie i spoczynku, retencję danych, maskowanie i prywatność.
- Walidację wejścia, ochronę przed injection, SSRF, XSS, CSRF i nadużyciami rate limit.
- Incident readiness jako wymaganie architektoniczne: detekcję, eskalację, containment, recovery, preservation of evidence, właściciela runbooka i walidację po incydencie.

Eskaluj do `managing-secrets`, `implementing-backend`, `engineering-databases` albo specjalistycznego review bezpieczeństwa, gdy decyzja dotyka sekretów, danych wrażliwych lub granic zaufania.

## Scalability i Reliability

Uwzględnij:

- Wolumeny, peak load, throughput, latency target i oczekiwany wzrost.
- Stateless/stateful boundary, cache, kolejki, backpressure, retry, idempotencję i rate limiting.
- Strategie degradacji, timeouty, circuit breaker, retry budgets i obsługę częściowej awarii.
- Migracje danych, kompatybilność wsteczną, rollback i feature flags.
- Observability: metryki, logi, tracing, alerty i diagnostykę ścieżek krytycznych.

## Maintainability

Uwzględnij:

- Granice modułów, kierunek zależności, publiczne API i brak cykli.
- Spójność z lokalnymi wzorcami, testowalność, czytelność i koszt onboardingu.
- Konfigurację, wersjonowanie kontraktów, deprecations i dokumentowanie decyzji.
- Miejsca, gdzie prostszy wariant jest lepszy od formalnego wzorca.

## Punkty Decyzyjne i Akceptacja

W planie architektonicznym oznacz decyzje wymagające akceptacji właściciela projektu, architekta albo zespołu. Dotyczy to zwłaszcza:

- nowych zależności i zmian w polityce licencji;
- zmiany mechanizmu auth/authz, ekspozycji publicznego API albo kontraktów integracyjnych;
- migracji danych, zmian schematu i operacji z ryzykiem rollbacku;
- audytu zależności/bezpieczeństwa, gdy wynik wymaga aktualizacji, wyjątku polityki albo akceptacji ryzyka;
- zmiany granic architektonicznych, warstw, bounded contexts lub kierunku zależności.

Audyt zależności dobieraj do ekosystemu: NuGet dla .NET, npm/pnpm/yarn dla JS/TS, pip/uv/poetry dla Python, Maven/Gradle dla JVM i odpowiedniki dla pozostałych stosów. Nie narzucaj jednego narzędzia wszystkim projektom.

## Performance

Stosuj, gdy zadanie dotyka API, UI, przetwarzania danych, raportów, modeli, pipeline'ów, baz danych albo ścieżek SLA:

- Zdefiniuj budżety: czas odpowiedzi, throughput, zużycie CPU/RAM, rozmiar payloadu, render time albo cold start.
- Zaplanuj benchmarki i profile: k6/JMeter dla API, BenchmarkDotNet dla .NET, pytest-benchmark dla Python, Lighthouse/Web Vitals dla frontend.
- Wskaż dane testowe i scenariusze obciążenia realistyczne dla systemu.
- Nie optymalizuj ścieżek bez metryki lub ryzyka biznesowego.

## Accessibility

Jeśli rozwiązanie zawiera UI:

- Uwzględnij WCAG 2.1 AA, semantykę, fokus, klawiaturę, kontrast, błędy formularzy i screen readers.
- Zaplanuj automatyczne testy a11y, np. axe-core w E2E lub testach komponentów.
- Dla złożonych przepływów użyj `ensuring-accessibility` przed finalnym planem.
- Dla kluczowych user journeys zaplanuj `testing-e2e` z lokatorami dostępności.

## Piramida Testów

Dobierz mix testów do ryzyka:

- Unit tests dla logiki domenowej, reguł walidacji, mapperów i algorytmów.
- Integration tests dla baz danych, kolejek, API, adapterów i kontraktów zewnętrznych.
- E2E tests dla kluczowych ścieżek użytkownika i regresji integracyjnych.
- Contract tests dla publicznych API, eventów, webhooks i provider/consumer boundaries.
- Smoke tests dla CLI, konfiguracji, health checks i minimalnego przepływu produkcyjnego.

Cele coverage traktuj jako minimalną siatkę bezpieczeństwa, nie dowód jakości. Dla ścieżek krytycznych planuj co najmniej wysoki branch coverage i testy scenariuszy błędów.

## Testy Architektoniczne

Planuj, gdy rozwiązanie definiuje warstwy, moduły, bounded contexts albo reguły zależności:

- .NET: NetArchTest, ArchUnitNET, Roslyn analyzers.
- Java/Kotlin: ArchUnit.
- JS/TS: dependency-cruiser, eslint boundaries, Nx module boundaries.
- Python: import-linter, pytest arch checks, ruff rules tam, gdzie pasują.
- Repo-specific gates: istniejące testy kontraktu, CI, lintery i walidatory workflow.

Reguły powinny weryfikować kierunek zależności, brak cykli, izolację modułów, zakaz importów między warstwami i zgodność publicznych API.

## Testy Mutacyjne

Stosuj selektywnie dla logiki biznesowej, parserów, algorytmów, kalkulacji finansowych, polityk domenowych i krytycznych walidatorów:

- .NET/JS/TS: Stryker.
- Java: PIT.
- Python: mutmut albo cosmic-ray.

Nie planuj mutation testing dla CRUD, DTO, glue code, wygenerowanego kodu ani prostych adapterów bez logiki decyzyjnej.

## Quality Gates

Każda faza planu powinna mieć uruchamialne bramki jakości, np.:

- Format, lint, typecheck, unit tests, integration tests i E2E dla zmienionego zakresu.
- Testy architektury dla granic modułów.
- Accessibility checks dla UI.
- Performance benchmark lub smoke test dla ścieżek SLA.
- Kontrole bezpieczeństwa: ekosystemowy audyt zależności, skan sekretów, SAST, walidacja licencji i polityk.
- Dokumentacja i changelog, gdy zmienia się zachowanie użytkowe lub kontrakt.

## Walidacja Planu

Przed finalizacją sprawdź:

```text
- [ ] NFR są jawnie opisane albo oznaczone jako nieistotne z powodem.
- [ ] Strategia testowania odpowiada ryzyku i blast radius.
- [ ] Każda faza ma quality gates możliwe do uruchomienia po jej zakończeniu.
- [ ] Testy architektoniczne są zaplanowane dla nowych granic zależności.
- [ ] Performance i accessibility mają walidacje, gdy dotykają użytkownika lub SLA.
- [ ] Coverage i mutation testing są stosowane selektywnie, nie mechanicznie.
```
