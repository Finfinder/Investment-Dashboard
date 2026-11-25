# <nazwa-zadania> - Plan Implementacji

## Szczegóły Zadania

| Pole | Wartość |
|---|---|
| Tytuł | <tytuł-zadania> |
| Opis | <opis-zadania> |
| Priorytet | <priorytet> |
| Powiązany Research | <link-do-pliku-research> |
| Numer Issue | <numer-issue-lub-puste> |
| Link do Issue | <link-do-issue-lub-puste> |

## Proponowane Rozwiązanie

<opis-proponowanego-rozwiązania>

<niezbędne-diagramy>

## Uzasadnienie Rozwiązania

### Wybrane podejście
<opis-wybranego-rozwiązania-i-główne-argumenty>

### Porównanie z alternatywami
> Jeśli przeprowadzono analizę rozwiązań (`*.solution-research.md`), podsumuj kluczowe wnioski. W przeciwnym razie opisz rozważane opcje.

| Kryterium | <Wybrane rozwiązanie> | <Alternatywa 1> | <Alternatywa 2> |
|---|---|---|---|
| <kryterium> | <ocena> | <ocena> | <ocena> |

### Dlaczego odrzucono alternatywy
- <Alternatywa 1>: <powód-odrzucenia>
- <Alternatywa 2>: <powód-odrzucenia>

## Rejestry Decyzji Architektonicznych (ADR)

> Sekcja warunkowa — wypełnij gdy projekt wymaga istotnych decyzji architektonicznych. Dla prostych zadań bez decyzji architektonicznych wpisz: "Nie dotyczy".

### ADR-001: <tytuł-decyzji>

| Pole | Wartość |
|---|---|
| Status | Proponowany / Zaakceptowany / Odrzucony |
| Data | <data> |
| Kontekst | <dlaczego-ta-decyzja-jest-potrzebna> |

**Rozważane opcje**:
1. <opcja-1> — <krótki-opis>
2. <opcja-2> — <krótki-opis>

**Decyzja**: <wybrana-opcja>

**Uzasadnienie**: <dlaczego-ta-opcja-została-wybrana>

**Konsekwencje**:
- ✅ <pozytywna-konsekwencja>
- ⚠️ <negatywna-konsekwencja-lub-ryzyko>

## Analiza Aktualnej Implementacji

### Już Zaimplementowane
Lista istniejących komponentów, funkcji i narzędzi, które zostaną ponownie użyte (wraz ze ścieżkami do plików):
- <komponent/funkcja> - `<ścieżka-do-pliku>` - <krótki-opis>

### Do Modyfikacji
Lista istniejącego kodu, który wymaga zmian lub rozszerzeń (wraz ze ścieżkami do plików i opisem zmian):
- <komponent/funkcja> - `<ścieżka-do-pliku>` - <co-trzeba-zmienić>

### Do Utworzenia
Lista nowych komponentów, funkcji i narzędzi, które trzeba zbudować od podstaw:
- <komponent/funkcja> - <krótki-opis-co-robi>

## Otwarte Pytania

| # | Pytanie | Odpowiedź | Status |
|---|----------|--------|--------|
| 1 | <pytanie> | <odpowiedź> | ✅ Rozwiązane / ❓ Otwarte |

## Plan Implementacji

### Faza 1: <nazwa-fazy>

#### Zadanie 1.1 - [UTWÓRZ/MODYFIKUJ/UŻYJ PONOWNIE] <nazwa-zadania>
**Opis**: <krótki-opis-zakresu-zadania>

**Definicja Ukończenia (Definition of Done)**:
- [ ] <konkretne-weryfikowalne-kryterium>
- [ ] <konkretne-weryfikowalne-kryterium>

#### Zadanie 1.2 - [UTWÓRZ/MODYFIKUJ/UŻYJ PONOWNIE] <nazwa-zadania>
**Opis**: <krótki-opis>

**Definicja Ukończenia (Definition of Done)**:
- [ ] <konkretne-weryfikowalne-kryterium>

### Faza 2: <nazwa-fazy>

#### Zadanie 2.1 - [UTWÓRZ/MODYFIKUJ/UŻYJ PONOWNIE] <nazwa-zadania>
**Opis**: <krótki-opis>

**Definicja Ukończenia (Definition of Done)**:
- [ ] <konkretne-weryfikowalne-kryterium>

## Aspekty Bezpieczeństwa

- <aspekt-bezpieczeństwa-istotny-dla-tego-zadania>

## Strategia Testowania

### Piramida testów

| Typ testu | Zakres | Szacowana liczba | Pokrycie |
|---|---|---|---|
| Jednostkowe | <logika-biznesowa-algorytmy-walidacja-reguły-domenowe> | <liczba> | ≥80% branch coverage dla ścieżek krytycznych |
| Integracyjne | <interakcje-komponentów-dostęp-do-danych-API> | <liczba> | <zakres-pokrycia> |
| E2E | <kluczowe-ścieżki-użytkownika> | <liczba> | <zakres-pokrycia> |

### Podejście do testowania
- [ ] Test-first (TDD) dla złożonej logiki biznesowej
- [ ] Testy regresji dla naprawianych defektów
- [ ] Mocki/stuby dla zależności zewnętrznych w testach jednostkowych

### Testy wydajnościowe
> Sekcja warunkowa — wypełnij gdy rozwiązanie zawiera API, przetwarzanie danych lub ścieżki krytyczne pod kątem SLA. W przeciwnym razie wpisz: "Nie dotyczy".

- Budżety wydajności: <czas-odpowiedzi-throughput-zasoby>
- Narzędzia: <np. BenchmarkDotNet, k6, JMeter>
- Benchmarkowane ścieżki: <lista-ścieżek-krytycznych>

### Testy dostępności
> Sekcja warunkowa — wypełnij gdy rozwiązanie zawiera UI. W przeciwnym razie wpisz: "Nie dotyczy".

- [ ] Automatyczne testy axe-core w pipeline CI/CD
- [ ] Testy nawigacji klawiaturą
- [ ] Zgodność z WCAG 2.1 AA (referencja: skill `ensuring-accessibility`)

### Testy architektoniczne
> Sekcja warunkowa — wypełnij gdy rozwiązanie definiuje granice modułów lub reguły zależności. W przeciwnym razie wpisz: "Nie dotyczy".

- Narzędzie: <np. NetArchTest (.NET), ArchUnit (Java), dependency-cruiser (JS/TS)>
- Reguły do egzekwowania:
  - [ ] Kierunek zależności między warstwami
  - [ ] Brak zależności cyklicznych
  - [ ] Izolacja modułów zgodna z domain.md (jeśli istnieje z wyników modularyzacji)

### Testy mutacyjne
> Sekcja warunkowa — wypełnij gdy projekt zawiera krytyczną logikę biznesową lub algorytmy wymagające wysokiej pewności co do jakości testów. NIE stosuj do: operacji CRUD, prostych DTO, kodu „klejącego". W przeciwnym razie wpisz: "Nie dotyczy".

- Narzędzie: <np. Stryker (.NET/JS/TS), PIT (Java), mutmut (Python)>
- Zakres: <logika-biznesowa-algorytmy-krytyczne-fragmenty>
- Cel mutation score: <próg — ustal proporcjonalnie do krytyczności kodu>

## Zapewnienie Jakości

Lista kontrolna kryteriów akceptacji do weryfikacji, że implementacja spełnia zdefiniowane wymagania:

- [ ] <kryterium-akceptacji-1>
- [ ] <kryterium-akceptacji-2>
- [ ] <kryterium-akceptacji-3>

### Planowane quality gates z kontraktu `code-reviewing`

> Sekcja planistyczna — wskaż walidacje i kryteria kontroli przewidziane dla implementacji oraz review. Nie raportuj tutaj wyników wykonania przeglądu.

| Obszar | Planowana kontrola | Kryterium akceptacji |
| --- | --- | --- |
| Bezpieczeństwo | OWASP TOP 30+ — Wymaganie krytyczne [Docs/OWASP_TOP_30_PLUS.md](Docs/OWASP_TOP_30_PLUS.md), Zero Trust, SAST/SCA/sekrety/IaC albo uzasadnienie braku | Kryteria przejścia skanerów albo lista wymaganych danych/narzędzi |
| Architektura i jakość | Clean Architecture, KISS/SOLID, martwy kod/importy/using | Kryterium kontroli architektury i jakości |
| Operacyjność | Performance, Reliability | Budżet, próg albo wymagane sprawdzenie |

## Usprawnienia (Poza Zakresem)

Potencjalne usprawnienia zidentyfikowane podczas planowania, które nie są częścią bieżącego zadania:

### Usprawnienie 1: <nazwa-usprawnienia>

- **Opis**: <co-dokladnie-warto-usprawnic>
- **Uzasadnienie**: <dlaczego-to-usprawnienie-ma-sens-poza-zakresem-biezacego-zadania>
- **Korzyści**: <jakie-konkretne-korzysci-przyniesie-wdrozenie-w-przyszlosci>

### Usprawnienie 2: <nazwa-usprawnienia>

- **Opis**: <co-dokladnie-warto-usprawnic>
- **Uzasadnienie**: <dlaczego-to-usprawnienie-ma-sens-poza-zakresem-biezacego-zadania>
- **Korzyści**: <jakie-konkretne-korzysci-przyniesie-wdrozenie-w-przyszlosci>

## Changelog

| Data | Opis Zmiany |
|------|-------------------|
| <data> | Utworzono wstępny plan |
