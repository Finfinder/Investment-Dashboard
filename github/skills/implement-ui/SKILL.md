---
name: implement-ui
description: "Implementuj funkcję UI zgodnie z planem, z iteracyjną weryfikacją wizualną i dostępności."
disable-model-invocation: true
---

# Implementacja UI Funkcji

> **Kontekst migracji z promptu**: Ten skill powstał w wyniku migracji promptu `.github/prompts/implement-ui.prompt.md` dla środowiska Agent Host / Copilot CLI.
> - **Oryginalny agent**: `software-engineer`

> **WARUNEK WSTĘPNY**: Zanim zaczniesz używać ten prompt, MUSISZ najpierw przeczytać i zrozumieć [implement.prompt.md](../implement/SKILL.md). Ten prompt rozszerza bazowy przepływ pracy implementacji – wykonasz wszystkie kroki z bazowego przepływu pracy, z dodatkami specyficznymi dla UI opisanymi poniżej.

Zaimplementuj funkcję UI zgodnie z **kontekstem badań** i **planem implementacji**, z ciągłą weryfikacją wizualną względem specyfikacji projektu / baseline aż do momentu, gdy implementacja będzie zgodna z projektem w ramach ustalonej tolerancji.

## Wymagane umiejętności

Przed rozpoczęciem załaduj i postępuj zgodnie z tymi umiejętnościami:

- `implementing-frontend` - wzorce komponentów, wykorzystanie systemu projektowego, kompozycja i wytyczne wydajnościowe
- `ui-verifying` - zrozumienie kryteriów weryfikacji, tolerancji i co stanowi ZALICZENIE/NIEZALICZENIE
- `ensuring-accessibility` - zgodność z WCAG 2.1 AA, semantyczny HTML, ARIA i automatyczna weryfikacja axe-core
- `technical-context-discovering` - ustalenie konwencji projektu przed implementacją
- `react-architecture`, `react-component-design`, `react-hooks-best-practices`, `react-styling-and-css`, `react-accessibility`, `react-performance`, `react-security-and-deps`, `react-testing` - warunkowo przy implementacji lub testowaniu UI w React
- `typescript-best-practices`, `ts-styling-and-linting`, `testing-ts-js`, `performance-and-memory-js` - warunkowo przy pracy z TypeScript/JavaScript, helperami testowymi lub problemami wydajności/pamięci
- `typescript-best-practices`, `ts-styling-and-linting`, `testing-ts-js`, `performance-and-memory-js` - warunkowo przy pracy z TypeScript/JavaScript, helperami testowymi lub problemami wydajności/pamięci
- `preventing-common-ts-errors` - podczas generowania lub modyfikowania kodu TypeScript/React/Node; dostarcza checklistę i reguły zapobiegające typowym błędom (replaceAll, negacje, ternary, regex, a11y, promisy, typy).
Ten prompt **rozszerza i nie zastępuje** bazowy przepływ pracy implementacji zdefiniowany w [implement.prompt.md](../implement/SKILL.md).

---

## Zależność od bazowego przepływu pracy

- **WAŻNE**: Najpierw przeczytaj i w pełni zrozumiej [implement.prompt.md](../implement/SKILL.md) – definiuje on kompletne kroki bazowego przepływu pracy
- MUSISZ wykonać **wszystkie kroki** z `implement.prompt.md`, łącznie z **ostatecznym przeglądem kodu przez agent `code-reviewer`**.
- Dotyczy to również obowiązkowego bootstrapu brancha taskowego `<feat|fix|tests|chore|task>/<semver>/Issue/<number>` oraz ustawienia statusu GitHub Issue przed pierwszą zmianą w repo.
- Sprawdź, czy w katalogu `.github/Issue` istnieje wygenerowany plik `*.plan.md` dla tego zadania. Jeśli zawiera on numer Issue (pole 'Numer Issue') lub link do Issue (pole 'Link do Issue'), użyj tych danych. Jeśli pliku nie ma lub pola są puste, ustal numer GitHub Issue z kontekstu zadania.
- Traktuj ten prompt jako **rozszerzenie skupiające się na UI i weryfikacji wizualnej** – dodawaj zachowania specyficzne dla UI, ale nie usuwaj i nie zastępuj kroków bazowego przepływu pracy.
- Wszystkie ograniczenia z `research.prompt.md` i `plan.prompt.md` pozostają ważne: nie wychodzę poza zakres, nie ponownie wdrażam istniejących rozwiązań i zawsze aktualizuję plan/listy kontrolne zamiast dyskretnie zmieniać zakres.

## Reguły mapowania typu zadania → prefix brancha

- `feat`: Nowa funkcja lub widoczna zmiana UX/API. Przykład: "Dodaj ekran ustawień oszczędności".
- `fix`: Naprawa błędu lub niepoprawnego zachowania. Przykład: "Napraw błąd logowania przy pustym tokenie".
- `tests`: Zmiany wyłącznie w testach, fixture'ach lub konfiguracji testów. Przykład: "Dodaj testy jednostkowe dla parsowania".
- `chore`: Prace porządkowe i utrzymaniowe (aktualizacje zależności, CI, skrypty build). Przykład: "Zaktualizuj wersję GitHub Action".
- `task`: Fallback dla prac mieszanych lub niejednoznacznych; użyj gdy nie pasuje do powyższych. Przykład: "Migracja bazy + drobne poprawki".

- Przed implementacją agent musi potwierdzić wybrany prefix i numer Issue (forma: `issue/<number>`), a gałąź taskowa powinna mieć format: `<prefix>/<target-version-or-branch>/Issue/<number>`.
- Jeśli zadanie łączy typy (np. migracja + feature), preferuj `task` i zapytaj użytkownika o preferencję.

---

## Odniesienia do projektów z badań i planu

Zawsze traktuj pliki **badań** i **planu** jako jedyne źródło prawdy dla linków do projektów:

- Przed rozpoczęciem implementacji (podczas kroków 1-2 bazowego przepływu pracy):
  - Otwórz plik **badań** (`*.research.md`) i szukaj:
    - Referencji projektowych i specyfikacji UI w sekcji `Relevant Links`.
    - Wszystkich linków do komponentów/widoków wspomnianych w `Gathered Information`.
  - Otwórz plik **planu** (`*.plan.md`) i szukaj:
    - Referencji do projektów i specyfikacji UI w `Task details`.
    - Jeśli istnieje, ustrukturyzowaną sekcję „Design References" mapującą widoki/komponenty na referencje projektowe lub identyfikatory widoków.

### Gdy brakuje referencji projektowej lub baseline UI

Jeśli nie możesz znaleźć referencji projektowej dla komponentu/sekcji, którą masz zamiar weryfikować:

1. **Zatrzymaj pętlę weryfikacji** dla tego komponentu
2. **Poproś użytkownika** o podanie referencji projektowej lub specyfikacji UI dla określonej sekcji, którą musisz weryfikować
3. **Czekaj na referencję** przed przystąpieniem do weryfikacji
4. **Dodaj referencję** do planu po otrzymaniu (w `Task details` lub `Design References`)

NIE RÓB:

- Nie pomijaj weryfikacji ze względu na brakującą referencję
- Nie zgaduj, jak powinien wyglądać projekt
- Nie przystępuj do implementacji bez odniesienia do specyfikacji projektu lub baseline UI

Gdy odkryjesz brakujące lub zaktualizowane linki do projektów podczas implementacji, dodaj je do odpowiednich sekcji w **planie** w `Task details` (i w razie potrzeby zauważ je w Changelog).

---

## Dodatkowa konfiguracja (przed rozpoczęciem implementacji)

Po bootstrapie branch/Issue z bazowego przepływu pracy, ale przed wejściem w implementację UI, upewnij się:

- Lokalny serwer deweloperski jest uruchomiony.
- Możesz uzyskać dostęp do strony, którą wdrażasz (uwierzytelniona jeśli potrzeba).
- Zidentyfikowałeś i otworzyłeś wszystkie istotne referencje projektowe i widoki z plików badań/planu.
- Rozumiesz tokeny systemu projektowego i komponenty dostępne w projekcie.

---

## Modyfikacje kroków bazowego przepływu pracy

Ten prompt modyfikuje określone kroki z [implement.prompt.md](../implement/SKILL.md). Wszystkie pozostałe kroki pozostają niezmienione.

### Zmodyfikowany krok 7: Implementuj z weryfikacją wizualną UI

Podczas wdrażania komponentu/sekcji UI z planu:

1. Napisz kod dla komponentu
2. **Przed oznaczeniem kroku zadania jako zakończonego**, uruchom subagent `ui-reviewer` w celu weryfikacji wizualnej. Przekaż mu: specyfikację/baseline projektu, adres URL strony w uruchomionej aplikacji i nazwę komponentu/sekcji. Subagent ma narzędzie `playwright` – zmierzy rzeczywistą implementację za pośrednictwem automatyzacji przeglądarki i zwróci ustrukturyzowany raport weryfikacji.
3. Jeśli raport mówi ZALICZENIE → oznacz krok jako ukończony, przejdź dalej
4. Jeśli raport mówi NIEZALICZENIE → napraw wszystkie różnice wymienione w raporcie, a następnie uruchom subagent `ui-reviewer` ponownie (maksymalnie 5 iteracji)
5. NIE przechodzę do następnego kroku zadania dopóki weryfikacja się nie powiedzie lub eskalujesz

**NIE WOLNO CI weryfikować UI wyłącznie samodzielnie.** Nie masz pełnego przepływu pracy weryfikacji – ma go `ui-reviewer`. Nie oceniaj wyłącznie „mentalnie" – to pomija wymiary CSS, różnice w układzie i szczegóły wizualne. Zawsze deleguj do subagenta.

Dotyczy to każdego kroku zadania, który tworzy widoczny interfejs użytkownika. Kroki niewizualne (pobieranie danych, zarządzanie stanem, routing) nie wymagają weryfikacji wizualnej UI.

### Zmodyfikowany krok 8: Zaktualizuj plan ze statusem weryfikacji

Po zakończeniu każdego kroku zadania, zaktualizuj plan w zwykły sposób I zanotuj wynik weryfikacji (ZALICZENIE, liczbę iteracji lub eskalację).

### Zmodyfikowany krok 9: Przegląd fazy z sprawdzeniem UI

Oprócz standardowego przeglądu fazy:

- Potwierdź, że każde zadanie UI w fazie przeszło weryfikację (OCZEKIWANE = RZECZYWISTE)
- Ponownie uruchom subagent `ui-reviewer` dla przepływów wysokiego ryzyka w razie potrzeby

### Nowy krok przed 12: Podsumowanie weryfikacji UI

Przed przekazaniem do `code-reviewer`:

- Wymień komponenty/sekcje zweryfikowane przez `ui-reviewer`
- Liczbę iteracji weryfikacji na komponent
- Wszelkie luki projektowe odkryte i sposób ich rozwiązania
- Wszelkie odchylenia od projektu z uzasadnieniem

---

## Reguły weryfikacji

1. **Każdy komponent UI musi być weryfikowany przez subagent `ui-reviewer`** – minimum raz na komponent, bez wyjątków. Nie weryfikuj UI samodzielnie.
2. **Napraw wszystkie zgłoszone różnice** – nie pomijaj i nie racjonalizuj
3. **Ponownie uruchom `ui-reviewer` po każdej naprawie** – nigdy nie zakładaj, że naprawa zadziałała
4. **Maksymalnie 5 iteracji na komponent** – eskaluj w przypadku niepowodzenia
5. **Sprawdź poziom zaufania** – NISKIE zaufanie oznacza, że dane narzędzia mogą być niekompletne, poproś użytkownika przed naprawą

### Gdy `ui-reviewer` zwraca NIEZALICZENIE

1. Odczytaj tabelę różnic z raportu
2. Napraw kod, aby dopasował wartości OCZEKIWANE – WYSOKIE zaufanie: napraw dokładnie; ŚREDNIE: napraw oczywiste, zweryfikuj niejasne; NISKIE: poproś użytkownika przed wprowadzeniem zmian
3. Udokumentuj naprawę w Changelog
4. Ponownie uruchom subagent `ui-reviewer`

### Eskalacja (po 5 iteracjach)

Jeśli nadal zawiedzie po 5 iteracjach, **zatrzymaj się** i:

1. Wymień pozostałe niezgodności ze specyfikacją/baseline projektu
2. Opisz, co próbowałeś w każdej iteracji
3. Podaj podejrzewany pierwotny przyczynę
4. Udokumentuj w Changelog
5. Poproś użytkownika o wskazówki – nie przystępuj bez decyzji człowieka

### Fallback: Gdy subagent zwraca błędy

Jeśli `ui-reviewer` konsekwentnie zwraca NISKIE zaufanie lub błędy narzędzi:

1. Nie kontynuuj pętli ślepo
2. Poproś użytkownika, czy może weryfikować ręcznie (otwórz specyfikację projektu + aplikację obok siebie)
3. Udokumentuj problem w Changelog
4. Przejdź do następnego komponentu lub eskaluj w razie wątpliwości
