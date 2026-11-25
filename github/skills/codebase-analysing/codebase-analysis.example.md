# Raport z analizy kodu źródłowego - <nazwa-repozytorium>

## Przegląd ogólny

| Pole | Wartość |
|---|---|
| Repozytorium | <nazwa-repozytorium> |
| Typ repozytorium | Monorepo / Pojedynczy system |
| Data | <data> |
| Analizowane przez | <agent-lub-użytkownik> |

## Struktura repozytorium

### Typ i układ

<opis-typu-repozytorium-i-ogólnego-układu>

### Kluczowe katalogi

| Katalog | Przeznaczenie | Warstwa/Aplikacja |
|---|---|---|
| `<ścieżka>` | <przeznaczenie> | <nazwa-warstwy-lub-aplikacji> |

### Rozmieszczenie elementów

| Zagadnienie | Lokalizacja |
|---|---|
| Zależności | `<ścieżka>` |
| Skrypty | `<ścieżka>` |
| Testy jednostkowe | `<ścieżka>` |
| Testy integracyjne | `<ścieżka>` |
| Testy E2E | `<ścieżka>` |
| Infrastruktura | `<ścieżka>` |

## Analiza zależności

### Podstawowe zależności

| Zależność | Wersja | Przeznaczenie | Aktualna? |
|---|---|---|---|
| <zależność> | <wersja> | <przeznaczenie> | ✅ / ⚠️ Nieaktualna / ❌ Krytyczna |

### Nieaktualne / ryzykowne zależności

| Zależność | Aktualna wersja | Najnowsza wersja | Poziom ryzyka | Uwagi |
|---|---|---|---|---|
| <zależność> | <aktualna> | <najnowsza> | Niski/Średni/Wysoki | <uwagi> |

## Dostępne skrypty

### Skrypty aplikacji

| Skrypt | Polecenie | Opis |
|---|---|---|
| <nazwa> | `<polecenie>` | <opis> |

### Skrypty zapewnienia jakości

| Skrypt | Polecenie | Opis |
|---|---|---|
| <nazwa> | `<polecenie>` | <opis> |

### Pozostałe skrypty

| Skrypt | Polecenie | Opis |
|---|---|---|
| <nazwa> | `<polecenie>` | <opis> |

## Architektura wysokiego poziomu

### Diagram architektury

<diagram-mermaid-lub-tekstowy-architektury-systemu>

### Wzorce komunikacji

| Wzorzec | Stosowany między | Protokół/Biblioteka |
|---|---|---|
| <wzorzec> | <komponenty> | <protokół> |

## Analiza backendu

| Aspekt | Szczegóły |
|---|---|
| Technologia | <technologia> |
| Framework | <framework> |
| Wzorzec architektoniczny | MVC / CQRS / DDD / Hexagonal / Warstwowy / Inny |
| Organizacja kodu | Modułowa / Oparta na odpowiedzialności |
| Baza danych | <baza-danych> |
| ORM / Wzorzec zapytań | <orm-lub-wzorzec> |
| Uwierzytelnianie | <podejście-do-uwierzytelniania> |
| Autoryzacja | <podejście-do-autoryzacji> |
| Wdrożenie | <podejście-do-wdrożenia> |

### Moduły/serwisy backendu

| Moduł/Serwis | Ścieżka | Odpowiedzialność |
|---|---|---|
| <moduł> | `<ścieżka>` | <opis> |

## Analiza frontendu

| Aspekt | Szczegóły |
|---|---|
| Framework | <framework> |
| Wzorzec komunikacji | REST / GraphQL / WebSocket / Inny |
| Biblioteka UI | <biblioteka-ui> |
| Zarządzanie stanem | <zarządzanie-stanem> |
| Biblioteka uwierzytelniania | <biblioteka-auth> |
| Biblioteka zapytań | <biblioteka-zapytań> |
| Wzorzec architektoniczny | Atomic Design / Oparty na funkcjach / Inny |
| Wdrożenie | <podejście-do-wdrożenia> |

### Aplikacje/pakiety frontendowe

| Aplikacja/Pakiet | Ścieżka | Odpowiedzialność |
|---|---|---|
| <aplikacja> | `<ścieżka>` | <opis> |

## Analiza infrastruktury

| Aspekt | Szczegóły |
|---|---|
| Narzędzie IaC | <terraform/pulumi/cloudformation/ręczne> |
| Hosting | Chmura / On-premise / Hybrydowy |
| Dostawca chmury | <dostawca> |
| Konteneryzacja | Tak / Nie |
| Orkiestracja kontenerów | <k8s/ecs/inne> |
| Skalowalność | <ocena> |

## Integracje zewnętrzne

| Integracja | Przeznaczenie | Stopień powiązania | Wymienialność |
|---|---|---|---|
| <integracja> | <przeznaczenie> | Ścisłe / Umiarkowane / Luźne | Łatwa / Średnia / Trudna |

## Podejście do testowania

| Typ testu | Obecny | Lokalizacja | Framework | Pokrycie |
|---|---|---|---|---|
| Jednostkowy | ✅ / ❌ | `<ścieżka>` | <framework> | <pokrycie-%> |
| Integracyjny | ✅ / ❌ | `<ścieżka>` | <framework> | <pokrycie-%> |
| E2E | ✅ / ❌ | `<ścieżka>` | <framework> | <pokrycie-%> |
| Kontraktowy | ✅ / ❌ | `<ścieżka>` | <framework> | <pokrycie-%> |

### Ocena strategii testowania

<opis-strategii-testowania-i-luk>

## Ocena bezpieczeństwa

| Aspekt | Implementacja | Ocena |
|---|---|---|
| Uwierzytelnianie | <opis> | 🟢 Dobra / 🟡 Wystarczająca / 🔴 Słaba |
| Autoryzacja | <opis> | 🟢 Dobra / 🟡 Wystarczająca / 🔴 Słaba |
| Walidacja danych | <opis> | 🟢 Dobra / 🟡 Wystarczająca / 🔴 Słaba |
| Zarządzanie sekretami | <opis> | 🟢 Dobra / 🟡 Wystarczająca / 🔴 Słaba |
| Bezpieczeństwo endpointów | <opis> | 🟢 Dobra / 🟡 Wystarczająca / 🔴 Słaba |
| Bezpieczeństwo bazy danych | <opis> | 🟢 Dobra / 🟡 Wystarczająca / 🔴 Słaba |

### Publicznie dostępne endpointy

| Endpoint | Metoda | Przeznaczenie | Ryzyko |
|---|---|---|---|
| <endpoint> | <metoda> | <przeznaczenie> | Niskie/Średnie/Wysokie |

## Martwy kod i duplikacje

### Znaleziony martwy kod

| # | Typ | Lokalizacja | Opis |
|---|---|---|---|
| 1 | Nieużywany import / Funkcja / Komponent / Plik | `<ścieżka-do-pliku>` | <opis> |

### Znalezione duplikacje

| # | Typ | Lokalizacje | Opis | Rekomendacja |
|---|---|---|---|---|
| 1 | Zduplikowana funkcja / Komponent / Logika | `<ścieżka-1>`, `<ścieżka-2>` | <opis> | <wyodrębnij-do/scal-z> |

### Podobne komponenty (kandydaci do scalenia)

| # | Komponenty | Lokalizacje | Podobieństwo | Rekomendacja |
|---|---|---|---|---|
| 1 | <komponent-a>, <komponent-b> | `<ścieżka-a>`, `<ścieżka-b>` | <co-jest-podobne> | <jak-scalić> |

## Proponowane ulepszenia

### 🔴 Krytyczne

| # | Obszar | Opis | Wpływ |
|---|---|---|---|
| 1 | <obszar> | <opis> | <wpływ> |

### 🟡 Do wdrożenia (niekrytyczne)

| # | Obszar | Opis | Wpływ |
|---|---|---|---|
| 1 | <obszar> | <opis> | <wpływ> |

### 🟢 Opcjonalne (nice to have)

| # | Obszar | Opis | Wpływ |
|---|---|---|---|
| 1 | <obszar> | <opis> | <wpływ> |

## Podsumowanie

| Kategoria | Liczba / Status |
|---|---|
| Łączna liczba zależności | <liczba> |
| Nieaktualne zależności | <liczba> |
| Elementy martwego kodu | <liczba> |
| Znalezione duplikacje | <liczba> |
| Krytyczne ulepszenia | <liczba> |
| Niekrytyczne ulepszenia | <liczba> |
| Opcjonalne ulepszenia | <liczba> |
| Ogólna ocena kondycji | 🟢 Dobra / 🟡 Wystarczająca / 🔴 Wymaga uwagi |
