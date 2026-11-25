---
name: review-code
description: "Wykonaj przegląd jakości kodu: potencjalne bugi, code smells, zgodność ze standardami."
disable-model-invocation: true
---

# Przegląd Jakości Kodu

> **Kontekst migracji z promptu**: Ten skill powstał w wyniku migracji promptu `.github/prompts/review-code.prompt.md` dla środowiska Agent Host / Copilot CLI.
> - **Oryginalny agent**: `code-reviewer`

Twoim celem jest analiza jakości kodu — identyfikacja potencjalnych bugów, code smells, zgodność ze standardami kodowania i konwencjami projektu. Wyłącznie jakość kodu — nie weryfikujesz bezpieczeństwa (OWASP) ani kryteriów akceptacji planu.


## Ograniczenie: tryb tylko do odczytu

Ten skill działa w trybie strictly read-only. Nie modyfikuj plików źródłowych, nie uruchamiaj narzędzi formatujących (np. 
uff format, prettier, slint --fix) ani nie wprowadzaj żadnych zmian w kodzie. Zależne skille (np. code-reviewing, nsuring-code-quality) mogą zawierać instrukcje naprawcze — nadpisuj je tym ograniczeniem. Wszelkie ustalenia i rekomendacje zwracaj jako output do raportu; zmiany statusów Sonar Security Hotspots pozostaw człowiekowi.

## Wymagane skille

Przed rozpoczęciem załaduj i stosuj następujące skille:
- `code-reviewing` — do ustrukturyzowanego procesu code review; załaduj wspólny kontrakt weryfikacyjny z `.github/skills/code-reviewing/references/validations.md`
- `technical-context-discovering` — do zrozumienia konwencji projektu i standardów kodowania
- `ensuring-code-quality` — do weryfikacji jakości kodu z wykorzystaniem ekosystemu Sonar (SonarQube for IDE, SonarQube MCP Server, SonarCloud CI) oraz lokalnych analizatorów

## Kontrakt weryfikacyjny

Podczas review wykonaj wspólny kontrakt weryfikacyjny ze skilla `code-reviewing` dla zmienionego kodu, skupiając się na aspektach jakości kodu. Nie ograniczaj się do samego diffu — analizuj przepływ danych, zależności, granice modułów.

## Workflow

1. **Zrozum kontekst**: Załaduj pliki `*.research.md` i `*.plan.md`, aby zrozumieć wymagania i kontekst. Przejrzyj pliki `*.instructions.md` z wytycznymi specyficznymi dla projektu.
2. **Analiza jakości kodu**: Przeanalizuj zmiany pod kątem: potencjalnych bugów (logika, warunki brzegowe, obsługa błędów), code smells (duplikacje, złożoność cyklomatyczna, martwy kod, nieprawidłowe nazewnictwo), zgodności z konwencjami projektu (z `*.instructions.md`), wydajności (wycieki pamięci, N+1 queries, nieoptymalne operacje), testowania (pokrycie, jakość testów).
3. **Weryfikacja SonarQube**: Poproś dewelopera o sprawdzenie panelu Problems w VS Code pod kątem issues wykrytych przez SonarQube for IDE (Connected Mode) — szczególnie bugs, code smells, duplications i coverage. Użyj narzędzi SonarQube MCP do wyszukania issues i metryk jakości. Zweryfikuj status quality gate projektu.
4. **Podsumowanie ustaleń**: Przygotuj podsumowanie ustaleń dotyczących jakości kodu, w tym: zidentyfikowane bugi (z severity), code smells, statusy kontroli z kontraktu weryfikacyjnego, wyniki SonarQube, rekomendacje napraw. Zwróć wyniki jako output — nie edytuj bezpośrednio pliku planu (`*.plan.md`). Orkestrator wykona pojedynczą atomową aktualizację po zebraniu wyników ze wszystkich podpromptów; wyniki trafią do sekcji "Code Quality Review Findings" w pliku planu.
