---
name: modularise
description: "Przeprowadź modularyzację systemu — dekompozycję na moduły, analizę granic, kontrakty domenowe i testowanie jakości podziału."
disable-model-invocation: true
---

# Modularyzacja Systemu

> **Kontekst migracji z promptu**: Ten skill powstał w wyniku migracji promptu `.github/prompts/modularise.prompt.md` dla środowiska Agent Host / Copilot CLI.
> - **Oryginalny agent**: `architect`

<goal>
Przeprowadź kompleksową modularyzację systemu obejmującą trzy poziomy analizy: modularyzację wysokopoziomową (bounded contexts, subdomeny, diagramy UML/C4), modularyzację niskopoziomową (agregaty, encje, polityki, archetypy biznesowe, jednostki spójności) oraz testowanie jakości podziału (porównanie z alternatywami, rejestr ryzyk, scenariusze ewolucji). Wynikiem jest kontrakt domenowy (domain.md) opisujący granice modułów, modele domenowe, kontrakty między modułami i słownik ubiquitous language.
</goal>

<prerequisites>
> **WYMAGANIE WSTĘPNE**: Przed użyciem tego promptu ZALECANE jest wcześniejsze przygotowanie kontekstu zadania.

- [create-research/SKILL.md](../create-research/SKILL.md) - do zebrania kontekstu biznesowego i wymagań (zalecane, nie wymagane)
- `*.research.md` - kontekst zadania, jeśli istnieje
- Wiedza o: domenie biznesowej, strukturze zespołów, planowanych zmianach, ograniczeniach technicznych
</prerequisites>

<input-requirements>
Przed uruchomieniem workflow upewnij się, że masz:

1. **System do modularyzacji** - nazwa/opis systemu lub wskazanie bazy kodu do analizy
2. **Cel modularyzacji** - greenfield (nowy system), extraction (wydzielanie z monolitu), refinement (ulepszenie istniejących granic)
3. **Kontekst biznesowy** - opis domeny, procesy biznesowe, struktura zespołów (opcjonalne — agent dopyta)

Jeśli brakuje jakiegokolwiek wejścia: agent zadaje pytania uzupełniające przed kontynuacją.
</input-requirements>

<required-skills>
## Wymagane Skille

Przed rozpoczęciem załaduj i stosuj następujące skille:
- `system-modularising` - główny skill definiujący proces modularyzacji, kryteria oceny granic i szablon kontraktu domenowego
- `codebase-analysing` - do analizy istniejącej bazy kodu i zrozumienia obecnej struktury przed dekompozycją
- `technical-context-discovering` - do ustalenia konwencji projektowych, standardów kodowania i istniejących wzorców
</required-skills>

<workflow>
## Workflow

1. **Zbierz kontekst**: Przeanalizuj bazę kodu, istniejącą dokumentację (`*.research.md`, `*.plan.md`) i strukturę systemu. Zadaj pytania uzupełniające o domenę biznesową, strukturę zespołów i cel modularyzacji.
2. **Modularyzacja wysokopoziomowa**: Zidentyfikuj subdomeny (core/supporting/generic), mapuj bounded contexts, utwórz diagram UML pakietów i diagram C4 Container, zdefiniuj macierz odpowiedzialności modułów.
3. **Modularyzacja niskopoziomowa**: Dla każdego modułu zidentyfikuj agregaty, encje, value objects, zdarzenia domenowe, polityki i usługi domenowe. Przeprowadź analizę autonomii i odkrywanie archetypów biznesowych.
4. **Oceń granice**: Zastosuj macierz kryteriów granic z wagami. Uzasadnij wybór wag. Zidentyfikuj najsłabsze granice.
5. **Przetestuj jakość**: Porównaj z min. 2 alternatywnymi dekompozycjami. Udokumentuj ryzyka. Przetestuj scenariuszami ewolucji. Oblicz metryki coupling/cohesion.
6. **Wygeneruj kontrakt domenowy**: Zapisz wynik jako `domain.md` zgodny z szablonem `domain.example.md` ze skilla `system-modularising`.
</workflow>

<output-specification>
## Wynik

Wynik powinien być plikiem markdown o nazwie `<nazwa-systemu>.domain.md` lub `domain.md`.
Plik powinien zostać umieszczony w katalogu głównym projektu lub katalogu dokumentacji.

Stosuj szablon `domain.example.md` ze skilla `system-modularising`.

### Kryteria Sukcesu

- Wszystkie subdomeny zidentyfikowane i sklasyfikowane
- Diagramy UML/C4 kompletne i w poprawnej składni Mermaid
- Każdy moduł ma zdefiniowany model domenowy (agregaty, encje, VO, zdarzenia, polityki)
- Ocena granic zawiera uzasadnienie wag kryteriów
- Porównano min. 2 alternatywne dekompozycje
- Rejestr ryzyk jest kompletny
- Scenariusze ewolucji nie wykazują krytycznych problemów bez mitygacji
</output-specification>

<handoff>
## Automatyczne Działanie Następcze

Po zakończeniu modularyzacji zaproponuj użytkownikowi uruchomienie `/review-modularisation` z agentem `code-reviewer` w celu weryfikacji, czy istniejący kod respektuje nowo zdefiniowane granice modułów.
Nie uruchamiaj automatycznie — poinformuj użytkownika o możliwości.
</handoff>

<constraints>
## Ograniczenia

- Nie implementuj zmian w kodzie — ten prompt dotyczy wyłącznie analizy i projektowania granic.
- Nie pomijaj fazy testowania jakości — porównanie z alternatywami jest obowiązkowe.
- Nie proponuj podziału bez uzasadnienia opartego na mierzalnych kryteriach.
- W przypadku niejasności dotyczących domeny biznesowej ZAWSZE pytaj przed kontynuacją.
- Kontrakt domenowy (domain.md) jest artefaktem wyjściowym — nie opcjonalnym komentarzem.
</constraints>
