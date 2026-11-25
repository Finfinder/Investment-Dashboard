---
name: review-modularisation
description: "Zweryfikuj jakość podziału modularnego i zgodność kodu z granicami modułów zdefiniowanymi w kontrakcie domenowym (domain.md)."
disable-model-invocation: true
---

# Przegląd Podziału Modularnego

> **Kontekst migracji z promptu**: Ten skill powstał w wyniku migracji promptu `.github/prompts/review-modularisation.prompt.md` dla środowiska Agent Host / Copilot CLI.
> - **Oryginalny agent**: `code-reviewer`

<goal>
Przeprowadź recenzję jakości podziału modularnego systemu. Zweryfikuj, czy istniejący lub zmieniony kod respektuje granice modułów zdefiniowane w kontrakcie domenowym (domain.md). Sprawdź, czy nie występują naruszenia granic: zabronione zależności między modułami, zależności cykliczne, użycie wewnętrznych API innych modułów, łamanie reguł kierunku zależności. Oceń, czy podział modularny zachowuje swoją jakość w kontekście bieżących zmian.
</goal>

<prerequisites>
> **WYMAGANIE WSTĘPNE**: Przed użyciem tego promptu MUSISZ mieć kontrakt domenowy.

- [modularise.prompt.md](../modularise/SKILL.md) - do wygenerowania kontraktu domenowego, jeśli nie istnieje
- `domain.md` lub `*.domain.md` - kontrakt domenowy definiujący granice modułów, kontrakty i reguły zależności
</prerequisites>

<input-requirements>
Przed uruchomieniem workflow upewnij się, że masz:

1. **Kontrakt domenowy** - plik `domain.md` lub `*.domain.md` zawierający zdefiniowane granice modułów
2. **Zakres recenzji** - wskazanie co recenzować: cała baza kodu, konkretne pliki, lub zmiany od ostatniego commitu

Jeśli brakuje kontraktu domenowego: STOP i poleć użytkownikowi uruchomienie `/modularise` najpierw.
</input-requirements>

<required-skills>
## Wymagane Skille

Przed rozpoczęciem załaduj i stosuj następujące skille:
- `system-modularising` - do zrozumienia kryteriów oceny granic modułów, metryk coupling/cohesion i reguł walidacji zależności
- `code-reviewing` - do ustrukturyzowanego procesu przeglądu kodu obejmującego poprawność, jakość i najlepsze praktyki
- `technical-context-discovering` - do ustalenia konwencji projektowych i istniejących wzorców
</required-skills>

<workflow>
## Workflow

1. **Załaduj kontrakt domenowy**: Przeczytaj `domain.md` / `*.domain.md`. Zrozum zdefiniowane granice modułów, kontrakty, reguły kierunku zależności i publiczne API każdego modułu.
2. **Zidentyfikuj zakres recenzji**: Ustal które pliki/zmiany podlegają recenzji. Mapuj je na moduły zdefiniowane w kontrakcie.
3. **Weryfikuj granice modułów**: Dla każdego modułu objętego recenzją sprawdź:
   - Czy import/zależności odwołują się tylko do publicznych kontraktów innych modułów?
   - Czy nie ma zależności cyklicznych między modułami?
   - Czy kierunek zależności jest zgodny z regułami (od niestabilnych do stabilnych)?
   - Czy dane są własności odpowiedniego modułu (nie są współdzielone bez kontraktu)?
4. **Oceń jakość podziału**: Przelicz metryki coupling/cohesion na podstawie aktualnego kodu. Porównaj z wartościami z kontraktu. Zidentyfikuj degradację granic.
5. **Generuj raport recenzji**: Uporządkuj wyniki wg krytyczności: naruszenia granic (krytyczne), degradacja metryk (ostrzeżenia), rekomendacje usprawnień (informacyjne).
</workflow>

<output-specification>
## Wynik

Raport recenzji powinien zawierać:

### Struktura raportu
1. **Podsumowanie** - ogólna ocena (✅ Zgodny / ⚠️ Częściowo zgodny / ❌ Naruszenia)
2. **Naruszenia granic** (krytyczne) - lista: plik, moduł źródłowy, moduł docelowy, typ naruszenia, linia kodu
3. **Degradacja metryk** (ostrzeżenia) - porównanie aktualnych vs. zdefiniowanych metryk coupling/cohesion
4. **Rekomendacje** (informacyjne) - propozycje usprawnień granic, refaktoryzacji, nowych kontraktów

### Kryteria Sukcesu
- Każde naruszenie granicy zidentyfikowane i opisane
- Metryki coupling/cohesion przeliczone i porównane z kontraktem
- Brak fałszywych pozytywów — każde naruszenie zweryfikowane
</output-specification>

<constraints>
## Ograniczenia

- Nie modyfikuj kodu — to recenzja, nie naprawa.
- Nie modyfikuj kontraktu domenowego — to dokument referencyjny.
- Każde zgłoszone naruszenie musi wskazywać konkretny plik i linię kodu.
- W przypadku braku kontraktu domenowego STOP — nie zgaduj granic.
- Recenzja dotyczy wyłącznie granic modularnych — inne aspekty jakości kodu (styl, wydajność) pokrywa standardowy `/review`.
</constraints>
