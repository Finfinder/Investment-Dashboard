---
name: task-analysing
description: "Analizuje zadanie, zbiera kontekst z wielu źródeł (dokumentacja, baza wiedzy), identyfikuje luki i generuje raport badawczy (.research.md). Używaj na początku pracy nad zadaniem."
---

# Analiza Zadania

Ten skill pomaga zebrać i rozszerzyć kontekst dotyczący konkretnego zadania do realizacji, wykrywa luki w opisie zadania i pomaga zrozumieć aktualny stan systemu.

## Proces Analizy Zadania

Użyj poniższej checklisty i śledź postęp:

```
Postęp analizy:
- [ ] Krok 0: Określ źródło wejściowe
- [ ] Krok 1: Wyszukaj dostępne zewnętrzne źródła informacji
- [ ] Krok 2: Zbierz informacje ze wszystkich źródeł
- [ ] Krok 2.5: Oceń potrzebę analizy rozwiązań
- [ ] Krok 3: Zidentyfikuj luki i zadaj pytania doprecyzowujące
- [ ] Krok 4: Na podstawie odpowiedzi i zebranych informacji sfinalizuj raport badawczy
```

**Krok 0: Określ źródło wejściowe**

Przed zebraniem informacji określ, w jaki sposób dostarczono kontekst zadania:

- **Istnieją pliki research i plan** (`*.research.md`, `*.plan.md`): Odczytaj je jako podstawowe źródło wymagań, kryteriów akceptacji, zakresu i definicji ukończenia (Definition of Done).
- **Podano numer/link GitHub Issue lub ID zadania**: Użyj go do pobrania szczegółów zadania z narzędzi zewnętrznych (Krok 1, np. przez `gh issue view`).
- **Kontekst podano bezpośrednio w poleceniu**: Gdy nie ma odniesień do plików ani ID zadania, wyodrębnij wymagania, kryteria akceptacji i zakres z wiadomości użytkownika. Traktuj polecenie jako pojedyncze źródło prawdy. Jeśli brakuje kluczowych informacji, poproś o doprecyzowanie przed kontynuacją.
- **Załączono lub wskazano pliki (PDF, DOCX itp.)**: Użyj narzędzia `markitdown` (np. `markitdown_convert_to_markdown`), aby przekonwertować je na Markdown przed analizą. Traktuj wyodrębnioną treść jako źródło podstawowe obok plików research i GitHub Issues.

To ustalenie wpływa na zakres realizacji Kroków 1–2. Jeśli kontekst jest już w pełni dostarczony w treści polecenia lub w plikach, pomiń zbędne zewnętrzne wyszukiwania.

**Krok 1: Wyszukaj dostępne zewnętrzne źródła informacji**

Sprawdź, jakie narzędzia są dostępne. Źródłem zadań są GitHub Issues (`gh issue view`, narzędzia GitHub). W przypadku załączników (PDF, DOCX itp.) użyj `markitdown`.

Sprawdź, czy dostępne są narzędzia GitHub, i poszukaj Issues pasujących do zadania oraz projektu.

**Krok 2: Zbierz informacje**

Dla każdego dostępnego narzędzia wyszukaj informacje powiązane z zadaniem. Jeśli podano numer Issue lub ID, wyszukuj po ID/numerze, a gdy go brak, szukaj po domenie zadania i po jobach do wykonania. Gdy masz dostęp do narzędzi do zarządzania zadaniami, skup się nie tylko na bieżącym zadaniu, ale też na powiązanych zadaniach i milestone'ach.

Jeśli występują linki zewnętrzne, linki do bazy wiedzy lub dokumentacji, dokładnie je przeanalizuj.

Przeanalizuj bazę kodu w oparciu o wymagania zadania. Znajdź obszary powiązane z danym zadaniem.

W przypadku załączonych lub wskazanych plików (PDF, DOCX itp. — dokumenty wymagań, briefy, opisy procesów, dokumenty zgodności), użyj narzędzia `markitdown`, aby przekonwertować ich treść na Markdown i uwzględnić istotne wnioski w raporcie badawczym.

Znajdź istotne informacje w dokumentacji projektu.

**Krok 2.5: Oceń potrzebę analizy rozwiązań**

Na podstawie zebranych informacji oceń, czy zadanie wymaga analizy zewnętrznych rozwiązań, porównania technologii lub wyboru podejścia architektonicznego. Symptomy wskazujące na potrzebę analizy rozwiązań:

- Zadanie wymaga integracji z nowym systemem zewnętrznym lub API
- Istnieje wiele możliwych podejść technicznych i nie jest jasne, które wybrać
- Zadanie dotyczy nowej domeny, technologii lub kategorii narzędzi
- Wymagane jest uzasadnienie decyzji technicznych wobec interesariuszy

Jeśli analiza rozwiązań jest potrzebna, zastosuj skill `solution-researching` i zapisz jego wynik jako osobny plik `<nazwa-zadania>.solution-research.md` w tym samym katalogu co raport badawczy. Plik ten ma charakter czysto lokalny (ignorowany w repozytorium przez `.gitignore`: `.github/Issue/*.solution-research.md`) i nie trafia do zdalnego repozytorium. W raporcie badawczym `*.research.md` w sekcji „Analiza rozwiązań” umieść zwięzłe streszczenie wniosków, matrycy i rekomendacji zamiast odnośnika do nieistniejącego w repozytorium pliku.

Jeśli analiza rozwiązań nie jest potrzebna (wymagania są jednoznaczne, technologia jest już wybrana), pomiń ten krok i przejdź do Kroku 3.

**Krok 3: Zidentyfikuj luki i zadaj pytania doprecyzowujące**

Na podstawie zebranych informacji i opisu zadania zidentyfikuj niejednoznaczności lub brakujące informacje. Przygotuj pytania i zadaj je użytkownikowi. Nie kontynuuj, dopóki wszystkie pytania nie zostaną wyjaśnione albo dopóki nie otrzymasz bezpośredniej prośby o dalsze działanie.

**Krok 4: Na podstawie odpowiedzi i zebranych informacji sfinalizuj raport badawczy**

Wygeneruj raport zgodnie ze strukturą `./research.example.md`. Pliki `*.research.md` ZAWSZE twórz w języku polskim. Upewnij się, że zawiera wszystkie niezbędne zebrane informacje, wszystkie ustalenia oraz odpowiedzi na wszystkie pytania.

Nie dodawaj ani nie usuwaj sekcji z szablonu. Ściśle trzymaj się struktury i konwencji nazewniczych, aby zachować przejrzystość i spójność.

## Powiązane Skille

- `codebase-analysing` - do analizy istniejącej bazy kodu w kontekście wymagań zadania
- `implementation-gap-analysing` - do zrozumienia, co już istnieje, a co trzeba dopiero zbudować
- `solution-researching` - do analizy rynku, porównania rozwiązań zewnętrznych i technologii, gdy zadanie wymaga wyboru podejścia