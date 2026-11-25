---
name: write-docs
description: "Tworzenie i utrzymywanie dokumentacji technicznej: README, API docs, tutoriale, changelogi, komentarze w kodzie, technical writing z progressive disclosure."
argument-hint: "[typ dokumentu: readme|api|tutorial|comments|changelog|guide]"
disable-model-invocation: true
---

# Tworzenie i Aktualizacja Dokumentacji Technicznej

Tworzy i utrzymuje dokumentację techniczną jako kontrakt z działającym kodem: README, dokumentację API, tutoriale, przewodniki developerskie, komentarze w kodzie i changelogi. Aktywny tier prowadzi decyzje i walidację; pełne struktury, narzędzia, antywzorce i kontrakty współpracy znajdują się w `references/`.

<goal>
Twoim celem jest utworzenie lub aktualizacja dokumentacji technicznej dla projektu. Dokumentacja powinna być zorientowana na użytkownika, zawierać działające przykłady kodu i stosować progressive disclosure (proste rzeczy najpierw, szczegóły na żądanie).

Wynikiem jest plik (lub pliki) dokumentacji w formacie Markdown, których lokalizacja zależy od typu dokumentu — README.md w katalogu głównym, tutoriale i przewodniki w katalogu docs/, komentarze inline w plikach źródłowych, changelog w katalogu głównym.
</goal>

<input-requirements>
Przed uruchomieniem tego workflow upewnij się, że masz:

1. **Typ dokumentu** — jeden z: readme, api, tutorial, comments, changelog, guide
2. **Kontekst projektu** (opcjonalnie) — opis projektu, grupa docelowa, zakres dokumentacji

Jeśli typ dokumentu nie został podany: STOP i zapytaj użytkownika o typ dokumentu do utworzenia.
</input-requirements>

<principles>

<docs-as-contract>
Dokumentacja opisuje zachowanie, które istnieje w kodzie, testach albo zatwierdzonym kontrakcie API. Nie obiecuj funkcji, parametrów, gwarancji wydajności, wsparcia ani kompatybilności, których nie da się zweryfikować w repozytorium lub źródle prawdy.
</docs-as-contract>

<progressive-disclosure>
Proste najpierw, szczegóły później. README i getting started mają dać szybki, działający wynik; API reference, architektura, warianty i edge cases trafiają niżej albo do osobnych stron.
</progressive-disclosure>

<audience-first>
Najpierw ustal odbiorcę i sytuację czytania: szybkie uruchomienie, wykonanie zadania, debugowanie błędu, onboarding, review API albo migracja. Dobierz poziom szczegółu do tego problemu, nie do pełnej wiedzy autora.
</audience-first>

<examples-are-tests>
Przykłady, komendy i outputy są częścią kontraktu. Snippety muszą być kompletne, możliwe do uruchomienia i sprawdzone lokalnie albo jasno oznaczone jako niezweryfikowane z powodem.
</examples-are-tests>

<maintenance-by-default>
Aktualizacja docs jest częścią Definition of Done. Gdy zmienia się kod, API, CLI, konfiguracja lub proces, dokumentacja i changelog zmieniają się w tym samym PR; gdy możliwe, generuj z OpenAPI, JSDoc, Sphinx albo podobnego źródła.
</maintenance-by-default>

</principles>

<required-skills>
## Wymagane Skille

Przed rozpoczęciem załaduj i stosuj następujące skille:
- `technical-context-discovering` — konwencje projektu, istniejąca dokumentacja, stos technologiczny
- `code-reviewing` — jakość przykładów kodu w dokumentacji, weryfikacja poprawności składni
</required-skills>

<workflow>
## Workflow

1. **Załaduj skille**: Załaduj i stosuj skill `technical-context-discovering`. Skill `code-reviewing` stosuj podczas weryfikacji przykładów kodu.
2. **Określ typ dokumentu i grupę docelową**: Na podstawie danych wejściowych użytkownika określ typ dokumentu (readme, api, tutorial, comments, changelog, guide). Zidentyfikuj grupę docelową — deweloperzy, użytkownicy końcowi, nowi członkowie zespołu. Jeśli typ nie został podany, zapytaj użytkownika.
3. **Przeanalizuj istniejącą dokumentację**: Przeszukaj projekt pod kątem istniejącej dokumentacji — pliki README, katalog docs/, komentarze w kodzie, changelogi. Zidentyfikuj luki, nieaktualną treść i niespójności. Zbadaj konwencje projektu (nazewnictwo, struktura katalogów, styl pisania).
4. **Zaprojektuj strukturę dokumentu**: Zaprojektuj strukturę z zastosowaniem progressive disclosure — najważniejsze informacje na początku, szczegóły techniczne w dalszych sekcjach. Dopasuj strukturę do typu dokumentu zgodnie ze wzorcami z `./references/document-types-and-structures.md`.
5. **Napisz treść z działającymi przykładami kodu**: Napisz dokumentację z konkretnymi, działającymi przykładami kodu. Każdy blok kodu musi mieć poprawną składnię i oznaczony język. Przykłady powinny być kompletne i gotowe do uruchomienia (lub skopiowania). Nie używaj hardcoded secrets — stosuj placeholdery oznaczone jako `<YOUR_...>`.
6. **Zweryfikuj jakość**: Sprawdź kompletność dokumentacji — czy wszystkie sekcje są wypełnione, linki działają, terminologia jest spójna. Zweryfikuj poprawność składni bloków kodu i zgodność z antywzorcami z `./references/sharp-edges.md`.
</workflow>

<output-specification>
## Wynik

Lokalizacja pliku wynikowego zależy od typu dokumentu:
- **readme** → `README.md` w katalogu głównym repozytorium
- **api** → `docs/api.md` lub dedykowany katalog dokumentacji API
- **tutorial** → `docs/` z opisową nazwą w kebab-case (np. `docs/getting-started.md`)
- **guide** → `docs/` z opisową nazwą w kebab-case (np. `docs/developer-guide.md`)
- **comments** → bezpośrednio w plikach źródłowych jako komentarze inline
- **changelog** → `CHANGELOG.md` w katalogu głównym repozytorium

### Kryteria Sukcesu

- Dokumentacja jest kompletna i odpowiada na potrzeby grupy docelowej
- Wszystkie bloki kodu mają poprawną składnię i oznaczony język
- Przykłady kodu są działające i gotowe do użycia
- Struktura stosuje progressive disclosure
- Brak hardcoded secrets w przykładach
</output-specification>

<constraints>
## Ograniczenia i Guard Raile

- Priorytet: działające przykłady kodu > ładne formatowanie.
- Nigdy nie zostawiaj hardcoded secrets w przykładach — stosuj placeholdery `<YOUR_...>`.
- Zawsze oznaczaj język w blokach kodu i weryfikuj poprawność składni.
- Nie dokumentuj oczywistości — skupiaj się na "dlaczego" i "jak".
- Nie publikuj dokumentacji niezgodnej z kodem, testami, OpenAPI/Swagger, CLI help albo innym źródłem prawdy.
- Nie zostawiaj niezweryfikowanych komend, snippetów, outputów lub wersji bez wyraźnej informacji, czego nie udało się sprawdzić.
- Nie zostawiaj martwych linków, linków do nieistniejących plików ani opisów nawigacji, której repo nie zawiera.
- W przypadku niejasności dotyczących zakresu lub grupy docelowej zapytaj użytkownika przed kontynuowaniem.
</constraints>

## Referencje

- Typy dokumentów i szablony struktur: `./references/document-types-and-structures.md`
- Walidacja przykładów i narzędzia: `./references/examples-validation-and-tooling.md`
- Antywzorce i pułapki (Sharp Edges): `./references/sharp-edges.md`
- Analiza odbiorców i utrzymanie dokumentacji: `./references/audience-and-maintenance.md`
- Kontrakty współpracy ze skillami: `./references/collaboration.md`
