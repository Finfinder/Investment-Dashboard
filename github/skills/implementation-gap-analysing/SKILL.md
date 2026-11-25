---
name: implementation-gap-analysing
description: "Analizuje lukę między wymaganiami a kodem. Klasyfikuje elementy, sprawdza testy, generuje raport. Używaj do weryfikacji postępu i planowania pracy."
---

# Analiza Luki Implementacyjnej

Porównuje plan implementacji z aktualnym stanem bazy kodu i klasyfikuje każdy element jako: do zaimplementowania od zera, do modyfikacji lub do ponownego użycia. Produkuje raport umożliwiający priorytetyzację pracy.

<principles>

<code-is-truth>
Kod jest źródłem prawdy. Nie zakładaj, co istnieje — czytaj pliki, szukaj w codebase, weryfikuj. Raportuj tylko to, co potwierdzasz odczytem pliku.
</code-is-truth>

<requirements-first>
Nie analizuj kodu w próżni. Zawsze zaczynaj od zrozumienia wymagań (plik `.research.md`, plan, historia rozmowy). Bez kontekstu wymagań nie jesteś w stanie ocenić, czy dany element jest „kompletny" czy „wymaga modyfikacji".
</requirements-first>

<classify-dont-guess>
Każdy element w raporcie musi być wyraźnie sklasyfikowany: Do Zaimplementowania / Do Modyfikacji / Do Ponownego Użycia. Jeśli nie jesteś pewien — oznacz jako Do Modyfikacji z adnotacją „wymaga weryfikacji".
</classify-dont-guess>

</principles>

## Proces Analizy Luki

Użyj poniższej checklisty i śledź postęp:

```
Postęp analizy:
- [ ] Krok 1: Zbierz kontekst wymagań
- [ ] Krok 2: Przeskanuj bazę kodu
- [ ] Krok 3: Sklasyfikuj elementy
- [ ] Krok 4: Przeanalizuj pokrycie testowe
- [ ] Krok 5: Przygotuj raport
```

**Krok 1: Zbierz kontekst wymagań**

Zrozum CO ma być zaimplementowane, zanim sprawdzisz co MAMY:

- Przeczytaj plik `.research.md` (jeśli istnieje) — to output skilla `task-analysing`
- Przeczytaj plik `.plan.md` (jeśli istnieje) — plan implementacji
- Sprawdź historię rozmowy — wymagania mogły być podane bezpośrednio
- Wyodrębnij listę funkcjonalności/komponentów do implementacji

> Jeśli brak `.research.md` i brak kontekstu w historii — **zatrzymaj się** i zasugeruj użycie skilla `task-analysing` do zebrania wymagań. Nie analizuj kodu bez znajomości celu.

**Krok 2: Przeskanuj bazę kodu**

Systematycznie przeszukaj codebase pod kątem elementów powiązanych z wymaganiami:

- Użyj `grep_search` / `semantic_search` do znalezienia plików powiązanych z każdym wymaganiem
- Przejrzyj strukturę katalogów (`list_dir`) aby zrozumieć organizację kodu
- Przeczytaj kluczowe pliki (`read_file`) aby ocenić stan implementacji
- Sprawdź konfiguracje (package.json, docker-compose, CI pipelines) pod kątem zależności

Dla każdego znalezionego elementu zanotuj:

- Ścieżkę do pliku
- Obecny stan (kompletny / częściowy / placeholder / brak)
- Powiązanie z wymaganiem z kroku 1

**Krok 3: Sklasyfikuj elementy**

Na podstawie kroku 1 (wymagania) i kroku 2 (stan kodu) sklasyfikuj każdy element:

| Klasyfikacja | Definicja | Przykład |
|---|---|---|
| **Do Zaimplementowania** | Nie istnieje w codebase — wymaga stworzenia od zera | Nowy endpoint API, nowy komponent UI |
| **Do Modyfikacji** | Istnieje, ale nie spełnia nowych wymagań | Rozszerzenie istniejącego serwisu o nową metodę |
| **Do Ponownego Użycia** | Istnieje i spełnia wymagania bez zmian | Istniejący middleware, utility, shared component |

Przypisz złożoność: Niska / Średnia / Wysoka — na podstawie rozmiaru zmiany, liczby zależności, ryzyka regresji.

**Krok 4: Przeanalizuj pokrycie testowe**

Dla każdego elementu z kroku 3 sprawdź:

- Czy istnieją testy jednostkowe pokrywające logikę do modyfikacji?
- Czy plan wymaga nowych typów testów (E2E, wydajnościowe, a11y) których brak w projekcie?
- Czy infrastruktura testowa (frameworki, helpery, fixtures) jest wystarczająca?
- Odnotuj luki testowe jako osobne elementy w raporcie: typ testu, co pokrywa, priorytet

**Krok 5: Przygotuj raport**

Wygeneruj raport zgodnie z szablonem `./implementation-gap-analysis.example.md`.

- Nie dodawaj ani nie usuwaj sekcji z szablonu
- Każdy element musi mieć ścieżkę do pliku (jeśli istnieje) lub adnotację „nowy plik"
- Podsumowanie musi zawierać prawidłowe liczby

## Antywzorce

| Antywzorzec | Severity | Symptom | Rozwiązanie |
|---|---|---|---|
| **Analiza kodu bez wymagań** | HIGH | Raport pełen elementów bez powiązania z celem | Zawsze zacznij od kroku 1 — bez kontekstu wymagań raport jest bezwartościowy |
| **Halucynowanie elementów** | HIGH | Raportowanie plików/komponentów bez weryfikacji odczytem | Każdy wpis "Do Modyfikacji" musi mieć potwierdzoną ścieżkę do istniejącego pliku |
| **Brak ścieżek do plików** | MEDIUM | Tabela z ogólnymi nazwami komponentów bez ścieżek | Każdy element "Do Modyfikacji" i "Do Ponownego Użycia" wymaga ścieżki do pliku |
| **Ignorowanie testów** | MEDIUM | Raport bez analizy pokrycia testowego | Krok 4 jest obowiązkowy — luki testowe to elementy do implementacji |
| **Płaska klasyfikacja** | LOW | Wszystko jako "Do Zaimplementowania" bez rozróżnienia modyfikacji vs nowe | Użyj tabeli definicji z kroku 3 do precyzyjnej klasyfikacji |

## Powiązane Skille

- `task-analysing` — produkuje `.research.md` będący inputem dla tego skilla; task-analysing zbiera wymagania, implementation-gap-analysing porównuje je z kodem
- `codebase-analysing` — komplementarny; codebase-analysing bada strukturę i zależności systemu, gap-analysing porównuje stan kodu z konkretnymi wymaganiami
- `code-reviewing` — gap-analysis może być wstępem do code review — wskazuje GDZIE w kodzie będą zmiany
- `architecture-designing` — gdy gap-analysis ujawni potrzebę nowych komponentów, architektura pomaga je zaprojektować
