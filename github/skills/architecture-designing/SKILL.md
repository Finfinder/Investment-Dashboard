---
name: architecture-designing
description: Projektowanie architektury - wymagania, decyzje, C4, ADR, plan implementacji.
---

# Projektowanie Architektury

Ten skill prowadzi projektowanie architektury od wymagań i granic systemu do decyzji, C4, ADR-ów i planu implementacji. Aktywny tier zawiera proces i guard raile; szczegóły są w `references/`.

## Kiedy używać

- Projektowanie funkcji, modułu, integracji, migracji, architektury danych albo przepływu UI/API przekraczającego prostą zmianę lokalną.
- Tworzenie lub aktualizacja `*.plan.md`, gdy potrzebne są decyzje architektoniczne, fazy, quality gates, C4 albo ADR.
- Porządkowanie wymagań, ograniczeń, granic systemu, NFR, ryzyk i kompromisów przed implementacją.
- Wybór wzorca architektonicznego lub integracyjnego w istniejącym codebase.

<principles>

<requirements-first>
Architektura musi wynikać z celu biznesowego, wymagań, ograniczeń i granic systemu. Nie projektuj rozwiązania, jeśli brakuje informacji wpływających na decyzje; zadaj krótki pakiet pytań albo zapisz jawne założenia.
</requirements-first>

<research-decision>
Zawsze zdecyduj, czy potrzebny jest zewnętrzny research przez `solution-researching`. Uruchom go, gdy decyzja zależy od wyboru frameworka, usługi, biblioteki, standardu, kosztów, vendor lock-in, bezpieczeństwa, wydajności albo aktualności ekosystemu.
</research-decision>

<proportional-design>
Projekt ma być proporcjonalny: prosty dla małych zmian, ale kompletny dla zmian systemowych. Unikaj przeinżynierowania, duplikacji pracy i wzorców, których zespół nie będzie w stanie utrzymać.
</proportional-design>

<nfr-by-default>
Każdy projekt architektury uwzględnia NFR: security, scalability, maintainability, performance i accessibility. Jeśli atrybut nie dotyczy zadania, zapisz to krótko zamiast go przemilczeć.
</nfr-by-default>

<decision-records>
Istotne decyzje wymagają alternatyw, trade-offów, konsekwencji i ryzyk. ADR twórz dla decyzji, które trudno odwrócić, wpływają na wiele modułów, zmieniają technologię, granice systemu albo koszt utrzymania.
</decision-records>

</principles>

## Proces

```text
Postęp architektury:
- [ ] Krok 1: Odkryj wymagania, ograniczenia, granice systemu i NFR
- [ ] Krok 2: Podejmij decyzję o external research przez solution-researching
- [ ] Krok 3: Przeanalizuj aktualną architekturę i istniejące wzorce
- [ ] Krok 4: Zaprojektuj rozwiązanie, warianty, trade-offy i ryzyka
- [ ] Krok 5: Przygotuj C4 Context/Container, Component gdy potrzebny, oraz ADR-y
- [ ] Krok 6: Utwórz plan implementacji zgodny z ./plan.example.md
```

**Krok 1: Discovery wymagań i granic**

Przeczytaj rozmowę, `*.research.md`, istniejący `*.solution-research.md`, dokumenty zewnętrzne i istotny kod. Ustal cel, aktorów, zakres in/out, dane, integracje, ograniczenia technologiczne, operacyjne, prawne i organizacyjne oraz NFR: security, scalability, maintainability, performance i accessibility.

**Krok 2: Decyzja o researchu**

Jeśli istnieje lokalny plik `*.solution-research.md` (plik roboczy, ignorowany przez `.gitignore`), wykorzystaj jego rekomendację, matrycę porównawczą, C4 Context i ADR drafts; pamiętaj, że w `*.research.md` znajduje się streszczenie wniosków zamiast odnośnika do pliku lokalnego. Jeśli decyzja wymaga aktualnego porównania opcji zewnętrznych, przekaż problem, ograniczenia i kryteria do `solution-researching`.

**Krok 3: Analiza aktualnej architektury**

Dla istniejącego systemu odkryj moduły, zależności, przepływy danych, konwencje, quality gates i miejsca ryzyka. Użyj `technical-context-discovering` dla szybkiego rozpoznania i `codebase-analysing`, gdy potrzebna jest głęboka mapa komponentów.

**Krok 4: Decyzje projektowe**

Zaproponuj rozwiązanie bez nadmiernej złożoności. Opisz warianty, decyzję, uzasadnienie, trade-offy, ryzyka, założenia, wpływ na NFR i strategię testowania: jednostkową, integracyjną, E2E, wydajnościową, dostępnościową, architektoniczną lub mutacyjną, gdy dotyczy.

**Krok 5: C4 i ADR**

Przygotuj C4 Context i Container; Component dodaj tylko dla kontenerów bezpośrednio zmienianych lub gdy pomaga zrozumieć granice odpowiedzialności. Domyślnie używaj Mermaid. ADR-y twórz dla istotnych decyzji; dla prostych zmian wpisz w planie, że ADR nie dotyczy, wraz z krótkim powodem.

**Krok 6: Plan implementacji**

Zapisz `*.plan.md` po polsku, zgodnie z `./plan.example.md`; nie dodawaj ani nie usuwaj sekcji szablonu. Podziel pracę na małe fazy z checklistami i quality gates po każdej fazie. Uwzględnij `implementation-gap-analysing`, aby nie planować pracy już wykonanej. Ostatnia faza obejmuje pełny code review przez agenta `code-reviewer`. W sekcji „Usprawnienia (Poza Zakresem)” każdy wpis ma obowiązkowy format trzech pól: **Opis**, **Uzasadnienie**, **Korzyści**. Każde pole ma zawierać co najmniej jedno konkretne zdanie (nie hasło), a **Korzyści** mają opisywać mierzalny lub operacyjny efekt (np. redukcję ryzyka/czasu/kosztu albo poprawę jakości).

## Guard Raile

- Nie pomijaj wymagań, ograniczeń, granic systemu, NFR, ryzyk, trade-offów ani decyzji o external research.
- Nie zatrzymuj się na opisie wzorca; pokaż, jak zmienia on moduły, dane, integracje, testy i operacje w tym systemie.
- Nie kopiuj pełnych checklist specjalistycznych skilli do planu; uruchom właściwy skill i przenieś wynik.
- Nie wybieraj technologii tylko dlatego, że jest znana; pokaż kryteria, alternatywy i konsekwencje.
- Nie twórz C4 Component, ADR ani ciężkich frameworków dokumentacyjnych dla małej zmiany, jeśli nie dodają wartości decyzyjnej.
- Nie dodawaj instrukcji pushowania, deploymentu ani repozytoryjnych instrukcji code review poza zakresem planu implementacji.
- Nie zapisuj sekcji „Usprawnienia (Poza Zakresem)” jako listy haseł; każdy wpis musi zawierać **Opis**, **Uzasadnienie** i **Korzyści**, a każde pole musi mieć co najmniej jedno konkretne zdanie.

## Materiały Referencyjne

- `./references/discovery-and-requirements.md` - discovery, granice systemu, NFR i external research.
- `./references/c4-and-adr.md` - C4 Context/Container/Component, Mermaid i ADR.
- `./references/quality-attributes-and-testing.md` - NFR, testy, coverage i quality gates.
- `./references/risk-and-tradeoffs.md` - ryzyka, kompromisy, overengineering i założenia.
- `./references/tooling-and-frameworks.md` - Mermaid, PlantUML, Structurizr, draw.io, Arc42 i TOGAF.
- `./references/collaboration.md` - eskalacje i kontrakty z powiązanymi skillami.
- `./plan.example.md` - szablon do załadowania przy tworzeniu albo aktualizacji `*.plan.md`.

## Powiązane Skille

- `technical-context-discovering`, `codebase-analysing` - konwencje, wzorce, komponenty i zależności.
- `solution-researching` - porównanie opcji zewnętrznych, rekomendacja, C4 Context i ADR draft.
- `implementation-gap-analysing` - weryfikacja elementów istniejących, brakujących i do modyfikacji.
- `system-modularising`, `modeling-domain`, `engineering-databases` - moduły, domena i dane.
- `ensuring-accessibility`, `testing-e2e` - wymagania UI i kluczowe ścieżki użytkownika.