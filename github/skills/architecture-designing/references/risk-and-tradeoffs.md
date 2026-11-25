# Ryzyka i Trade-offy

Materiał referencyjny dla identyfikowania ryzyk, dokumentowania kompromisów, unikania overengineeringu i zapisywania założeń w planach architektonicznych.

## Kategorie Ryzyk

Sprawdź kategorie proporcjonalnie do zakresu zmiany:

- Wymagania: niejasny cel, sprzeczne kryteria akceptacji, brak ownera decyzji.
- Granice systemu: rozmyte odpowiedzialności, zależności cykliczne, mieszanie domen.
- Dane: migracje, integralność, retencja, źródło prawdy, spójność eventual/strong.
- Integracje: awarie dostawców, retry storms, idempotencja, kontrakty API, rate limits.
- Security: dane wrażliwe, sekrety, uprawnienia, audyt, compliance, supply chain.
- Performance: brak budżetów, koszt zapytań, payloady, kolejki, cold start, memory pressure.
- Operacje: observability, rollback, backup, feature flags, support, runbooks.
- Maintainability: zbyt wiele wzorców, brak testów, trudny onboarding, ukryte sprzężenie.
- Dostępność UI: fokus, klawiatura, semantyka, kontrast, błędy formularzy.
- Organizacja: brak kompetencji zespołu, koszt licencji, zależność od pojedynczego dostawcy.

## Format Trade-offu

Opisuj kompromis krótko, ale decyzyjnie:

```markdown
**Trade-off:** Co zyskujemy i co tracimy.

**Opcje:**
- Opcja A: zalety, wady, ryzyka.
- Opcja B: zalety, wady, ryzyka.

**Decyzja:** Wybrany wariant.

**Uzasadnienie:** Kryteria, które zdecydowały.

**Konsekwencje:** Wpływ na security, scalability, maintainability, performance, accessibility i operacje.

**Warunek rewizji:** Kiedy wrócić do decyzji.
```

## Alternatywy

Każda istotna decyzja powinna mieć realne alternatywy:

- Status quo, jeśli obecny system może zostać utrzymany.
- Najprostszy wariant spełniający wymagania.
- Wariant docelowy lub bardziej skalowalny, jeśli wymagają tego NFR.
- Wariant odrzucony z powodem, gdy może wrócić w review.

Nie twórz pozornych alternatyw tylko po to, aby uzasadnić wcześniej wybraną decyzję. Jeśli istnieje tylko jeden sensowny wariant, zapisz dlaczego.

## Overengineering

Sygnały ostrzegawcze:

- Nowy framework lub warstwa bez konkretnego wymagania, NFR albo ryzyka.
- CQRS, event sourcing, microservices, service mesh albo DDD tactical patterns dla prostego CRUD.
- Komponenty, które nie mają ownera, testów ani jasnego publicznego API.
- Diagramy i ADR-y powtarzające oczywiste decyzje lokalne.
- Abstrakcje zaprojektowane pod hipotetyczne warianty bez planu walidacji.
- Quality gates cięższe niż ryzyko zmiany.

Gdy widzisz overengineering, zaproponuj mniejszy wariant i warunek przejścia do bardziej złożonej architektury.

## Underengineering

Sygnały przeciwne:

- Brak granic modułów mimo rosnącej liczby zależności.
- Pominięcie autoryzacji, audytu, migracji danych albo rollbacku.
- Brak testów dla ścieżki krytycznej lub kontraktu integracyjnego.
- Zapisanie decyzji tylko w kodzie, mimo że wpływa na wiele zespołów lub modułów.
- Brak observability dla procesu, który może zawieść po wdrożeniu.

## Założenia

Założenie jest dopuszczalne, jeśli jest jawne i ma plan weryfikacji:

- Co zakładamy.
- Dlaczego nie można tego teraz potwierdzić.
- Jaki wpływ ma błędne założenie.
- Kiedy i jak zostanie zweryfikowane.
- Jaka decyzja zmieni się po weryfikacji.

Nie chowaj założeń w opisie rozwiązania. Umieść je w sekcji planu, ryzyk albo ADR.

## Konsekwencje Decyzji

Dla istotnych decyzji opisz konsekwencje w pięciu wymiarach:

- Security: nowe granice zaufania, dane wrażliwe, sekrety, audyt.
- Scalability: limit wzrostu, bottlenecks, koszt skalowania.
- Maintainability: złożoność, zależności, testowalność, onboarding.
- Performance: latency, throughput, payload, zużycie zasobów.
- Accessibility: wpływ na UI, interakcję klawiaturą i user journeys.

Dodaj konsekwencje operacyjne: monitoring, alerty, backup, rollback, support i dokumentacja.

## Walidacja Ryzyk

Przed finalizacją sprawdź:

```text
- [ ] Każde ryzyko ma ownera, mitigację albo świadomą akceptację.
- [ ] Istotne decyzje mają alternatywy i trade-offy.
- [ ] Założenia są jawne i mają warunek weryfikacji.
- [ ] Plan unika zarówno overengineeringu, jak i pominięcia krytycznych guard raili.
- [ ] Ryzyka są powiązane z fazami, quality gates, ADR albo pytaniami do użytkownika.
```
