# <nazwa-zadania> - Analiza Rozwiązań

## Podsumowanie

| Pole | Wartość |
|---|---|
| Zadanie | <nazwa-lub-id-zadania> |
| Oceniona złożoność | <S / M / L / XL> |
| Liczba przeanalizowanych źródeł | <liczba> |
| Rekomendowane rozwiązanie | <nazwa-rekomendowanego-rozwiązania> |
| Powiązany Research | <link-do-pliku-research> |
| Data analizy | <data> |

## Pytania Badawcze

Lista pytań, na które analiza odpowiada:

1. <pytanie-badawcze>
2. <pytanie-badawcze>

## Przeanalizowane Źródła

### Repozytoria i Projekty Open-Source

| # | Nazwa | URL | Licencja | Gwiazdki / Aktywność | Kluczowe wnioski | Ocena |
|---|-------|-----|---------|----------------------|------------------|-------|
| 1 | <nazwa> | <url> | <licencja> | <gwiazdki-lub-aktywność> | <wnioski> | 🟢/🟡/🔴 |

### Dokumentacje i API

| # | Nazwa | URL | Typ | Kluczowe wnioski | Ocena |
|---|-------|-----|-----|------------------|-------|
| 1 | <nazwa> | <url> | <docs/API/SDK> | <wnioski> | 🟢/🟡/🔴 |

### Blogi, Artykuły i Case Studies

| # | Tytuł | URL | Źródło | Kluczowe wnioski | Ocena |
|---|-------|-----|--------|------------------|-------|
| 1 | <tytuł> | <url> | <źródło> | <wnioski> | 🟢/🟡/🔴 |

### Rejestry Pakietów

| # | Pakiet | Rejestr | Wersja | Pobrania / Popularność | Kluczowe wnioski | Ocena |
|---|--------|---------|--------|------------------------|------------------|-------|
| 1 | <pakiet> | <NuGet/npm/PyPI> | <wersja> | <popularność> | <wnioski> | 🟢/🟡/🔴 |

## Matryca Porównawcza

| Kryterium | <Rozwiązanie A> | <Rozwiązanie B> | <Rozwiązanie C> |
|---|---|---|---|
| Dopasowanie do wymagań | <ocena> | <ocena> | <ocena> |
| Dojrzałość i stabilność | <ocena> | <ocena> | <ocena> |
| Jakość dokumentacji | <ocena> | <ocena> | <ocena> |
| Licencja i koszty | <ocena> | <ocena> | <ocena> |
| Złożoność integracji | <ocena> | <ocena> | <ocena> |
| Wydajność i skalowalność | <ocena> | <ocena> | <ocena> |
| Bezpieczeństwo | <ocena> | <ocena> | <ocena> |
| Krzywa uczenia się | <ocena> | <ocena> | <ocena> |
| **Ocena ogólna** | <ocena-ogólna> | <ocena-ogólna> | <ocena-ogólna> |

## Analiza Kandydatów

### <Rozwiązanie A>

**Opis**: <krótki-opis-rozwiązania>

**Korzyści**:
- <korzyść-w-kontekście-zadania>

**Wady**:
- <wada-lub-ryzyko>

**Uzasadnienie**: <dlaczego-jest-lub-nie-jest-rekomendowane>

### <Rozwiązanie B>

**Opis**: <krótki-opis-rozwiązania>

**Korzyści**:
- <korzyść-w-kontekście-zadania>

**Wady**:
- <wada-lub-ryzyko>

**Uzasadnienie**: <dlaczego-jest-lub-nie-jest-rekomendowane>

## Rekomendacja

### Wybrane rozwiązanie

<nazwa-rekomendowanego-rozwiązania>

### Uzasadnienie wyboru

<szczegółowe-uzasadnienie-dlaczego-to-rozwiązanie-zostało-wybrane-w-kontekście-zadania>

### Przewaga nad alternatywami

- Względem <Rozwiązanie B>: <dlaczego-lepsze>
- Względem <Rozwiązanie C>: <dlaczego-lepsze>

## Model C4 Context

Diagram kontekstowy systemu w składni Mermaid:

```mermaid
C4Context
    title <tytuł-diagramu-kontekstowego>
    Person(alias, "Nazwa aktora", "Opis roli")
    System(alias, "Nazwa systemu", "Opis systemu")
    System_Ext(alias, "System zewnętrzny", "Opis integracji")
    Rel(from, to, "Opis relacji")
```

### Opis elementów diagramu

| Element | Typ | Opis |
|---------|-----|------|
| <alias> | Person / System / System_Ext | <opis-roli-w-kontekście> |

## Rejestry Decyzji Architektonicznych (ADR)

> Sekcja warunkowa — wypełnij dla złożoności L i XL. Dla S i M wpisz: "Nie dotyczy — złożoność S/M, uzasadnienie decyzji zawarte w sekcji Rekomendacja."

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

### ADR-002: <tytuł-decyzji>

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

## Otwarte Pytania

| # | Pytanie | Status |
|---|---------|--------|
| 1 | <pytanie-wymagające-doprecyzowania> | ❓ Otwarte / ✅ Rozwiązane |

## Następne Kroki

- <rekomendowany-następny-krok-po-zakończeniu-analizy>
