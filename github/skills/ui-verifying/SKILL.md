---
name: ui-verifying
description: Weryfikacja zgodności implementacji UI z projektem — struktura, układ, wymiary, wygląd i tolerancje.
---

# Weryfikacja UI

Proces weryfikacji, kryteria i tolerancje do porównywania implementacji UI z projektami UI.

## Proces Weryfikacji

Użyj poniższej listy kontrolnej i śledź postęp:

```
Postęp:
- [ ] Krok 1: Walidacja danych wejściowych
- [ ] Krok 2: Pobranie OCZEKIWANEGO z projektu UI
- [ ] Krok 3: Pobranie AKTUALNEGO z implementacji
- [ ] Krok 4: Porównanie według kategorii weryfikacji
- [ ] Krok 5: Wygenerowanie raportu
```

**Krok 1: Walidacja danych wejściowych**

Przed rozpoczęciem weryfikacji potwierdź:

- Przy pierwszej weryfikacji w sesji **zapytaj użytkownika o potwierdzenie** URL serwera deweloperskiego (np. „Wykryłem port 3001 z package.json — czy aplikacja działa pod http://localhost:3001?"). Użytkownik może go poprawić w razie potrzeby.
- Używaj potwierdzonego URL we wszystkich kolejnych weryfikacjach w tej samej sesji
- Serwer deweloperski działa i strona jest dostępna pod tym URL
- Jeśli brakuje jakichkolwiek danych wejściowych, zatrzymaj się i zapytaj użytkownika — nie kontynuuj bez wszystkich trzech (potwierdzony URL serwera deweloperskiego, dostępna strona)

**Krok 2: Pobranie OCZEKIWANEGO z projektu UI**

Wyodrębnienij ze specyfikacji projektu:

- Hierarchia warstw i struktura komponentów
- Kierunek układu, wyrównanie, odstępy
- Szerokości ramek względem strony — określają czy kontenery powinny być wąskie/wyśrodkowane czy pełnej szerokości
- Typografia, kolory, promienie, cienie
- Warianty komponentów i stany

**Krok 3: Pobranie AKTUALNEGO z implementacji**

Użyj `playwright` do przechwycenia działającej implementacji. MUSISZ zebrać **wszystkie trzy** typy danych — weryfikacja pomijająca którykolwiek typ jest niekompletna:

1. **Struktura i zawartość** — hierarchia elementów, kolejność, grupowanie (przez zrzut drzewa dostępności)
2. **Rzeczywiste wyrenderowane wymiary** — obliczone szerokości, wysokości, paddingi, marginesy, odstępy każdego głównego kontenera (przez ewaluację JavaScript obliczonych stylów). To najczęściej pomijany krok — bez niego nie możesz wykryć różnic w rozmiarach/układzie.
3. **Wygląd wizualny** — zrzut ekranu całej strony do porównania z projektem

> **KRYTYCZNE**: Drzewo dostępności NIE zawiera wymiarów CSS. Kontener pełnej szerokości i wąski wyśrodkowany kontener dają identyczne drzewa dostępności. Jeśli zebrałeś tylko strukturę bez mierzenia rzeczywistych wyrenderowanych wymiarów, weryfikacja jest NIEWAŻNA — oznacz pewność jako NISKA i zgłoś czego brakuje.

**Krok 4: Porównanie według kategorii weryfikacji**

Porównaj OCZEKIWANE (projekt UI) z AKTUALNYM (implementacja) zgodnie z Kolejnością Weryfikacji i Kategoriami poniżej. Projekt UI jest **źródłem prawdy** dla każdego porównania. W razie wątpliwości projekt wygrywa.

**Krok 5: Wygenerowanie raportu**

Wygeneruj ustrukturyzowany raport zgodnie z Formatem Raportu poniżej. Dołącz dokładne wartości zarówno z projektu UI jak i implementacji dla każdej znalezionej różnicy.

## Kolejność Weryfikacji

Zawsze weryfikuj w tej kolejności — zatrzymaj się i zgłoś przy pierwszym błędzie KRYTYCZNYM:

1. **Struktura** (KRYTYCZNA)
2. **Układ** (KRYTYCZNY)
3. **Wymiary** (KRYTYCZNE)
4. **Wygląd wizualny** (KRYTYCZNY)
5. **Komponenty**

## Kategorie Weryfikacji

### Struktura (KRYTYCZNA)

| Sprawdzenie                  | Opis                                                               |
| ---------------------------- | ------------------------------------------------------------------ |
| **Hierarchia kontenerów**    | Czy struktura DOM odpowiada hierarchii warstw projektu UI?               |
| **Głębokość zagnieżdżenia**  | Czy elementy są zagnieżdżone na tym samym poziomie co w projekcie UI?    |
| **Grupowanie**               | Czy powiązane elementy są zgrupowane razem jak w projekcie UI?        |
| **Kolejność elementów**      | Czy wizualna kolejność elementów jest taka sama jak w projekcie UI?                   |
| **Elementy opakowujące**     | Czy są nadmiarowe/brakujące wrappery div zmieniające układ?        |
| **Obecność sekcji**          | Czy WSZYSTKIE sekcje z projektu UI są obecne w implementacji?            |

### Układ (KRYTYCZNY)

| Sprawdzenie                  | Opis                                                         |
| ---------------------------- | ------------------------------------------------------------ |
| **Kierunek Flex/Grid**       | row vs column, zachowanie zawijania                          |
| **Wyrównanie**               | wartości justify-content, align-items                        |
| **Rozkład**                  | Jak przestrzeń jest rozkładana między elementami             |
| **Pozycjonowanie**           | relative, absolute, fixed — zgodność z zamierzeniem projektu |
| **Wyśrodkowanie**            | Czy zawartość jest wyśrodkowana jak w projekcie UI?             |

### Wymiary (KRYTYCZNE)

| Sprawdzenie                        | Opis                                              |
| ---------------------------------- | ------------------------------------------------- |
| **Szerokość kontenera**            | Ograniczenia max-width, stała szerokość           |
| **Granice karty/panelu**           | Czy karta ma taką samą szerokość jak w projekcie UI?    |
| **Obszar treści vs viewport**      | Stosunek szerokości treści do dostępnej przestrzeni |
| **Szerokość/Wysokość**             | Stała, procentowa, auto, ograniczenia min/max     |
| **Odstępy**                        | Padding, margin, gap między elementami            |
| **Przerwy**                        | Przestrzeń między dziećmi flex/grid               |

> **OSTRZEŻENIE**: Drzewo dostępności NIE zawiera wymiarów CSS. Kontener pełnej szerokości i wąski wyśrodkowany wyglądają identycznie w drzewie dostępności. Musisz zmierzyć rzeczywiste obliczone style, żeby wykryć różnice w szerokości/rozmiarach.

### Wygląd Wizualny

| Sprawdzenie      | Opis                                                   |
| ---------------- | ------------------------------------------------------ |
| **Typografia**   | font-family, rozmiar, grubość, line-height, letter-spacing |
| **Kolory**       | Kolory tekstu, tła, obramowania                        |
| **Promienie**    | Wartości border-radius                                 |
| **Cienie**       | box-shadow, drop-shadow                                |
| **Tła**          | Jednolite, gradientowe, obrazkowe                      |

### Komponenty

| Sprawdzenie             | Opis                                                  |
| ----------------------- | ----------------------------------------------------- |
| **Poprawne warianty**   | Czy używany jest właściwy wariant komponentu?         |
| **Tokeny projektowe**   | Czy używane są poprawne tokeny (nie zakodowane na stałe wartości)? |
| **Stany**               | Stany hover, focus, active, disabled                  |

## Tolerancje

| Kategoria        | Tolerancja      | Uwagi                                              |
| ---------------- | --------------- | -------------------------------------------------- |
| Struktura        | **Brak**        | Każda różnica strukturalna = BŁĄD                  |
| Kierunek układu  | **Brak**        | row vs column musi dokładnie odpowiadać            |
| Wyrównanie       | **Brak**        | Wyśrodkowanie, justify, align musi odpowiadać      |
| Wymiary          | **1-2px**       | Tylko dla wariancji renderowania przeglądarki      |
| Kolory           | **Dokładne**    | Muszą używać poprawnych tokenów projektowych       |
| Typografia       | **Dokładne**    | Właściwości czcionki muszą odpowiadać              |
| Odstępy          | **1-2px**       | Tylko dla wariancji renderowania przeglądarki      |

## Definicje Poziomów Ważności

| Poziom ważności  | Opis                                                          | Działanie                           |
| ---------------- | ------------------------------------------------------------- | ----------------------------------- |
| **Krytyczny**    | Różnice struktury/układu, użyty nieprawidłowy komponent       | Należy naprawić natychmiast         |
| **Poważny**      | Wymiary różnią się o >2px, nieprawidłowe kolory/typografia    | Należy naprawić przed mergem        |
| **Drobny**       | Wariancja renderowania przeglądarki 1-2px                     | Akceptowalne, dokumentuj jeśli nawracające |

## Lista Kontrolna Weryfikacji

Przed zgłoszeniem PASS:

- [ ] Zweryfikowano CAŁĄ stronę (przewinięto od góry do dołu)
- [ ] Wszystkie sekcje z projektu UI są obecne w implementacji
- [ ] Hierarchia kontenerów odpowiada warstwom projektu UI
- [ ] Kierunek flex/grid jest poprawny
- [ ] Wyrównanie (justify/align) odpowiada projektowi
- [ ] Kolejność elementów odpowiada projektowi
- [ ] Brak nadmiarowych/brakujących elementów opakowujących zmieniających układ
- [ ] Rzeczywiste obliczone szerokości kontenerów zmierzone (nie wywnioskowane z drzewa dostępności)
- [ ] Zrzut ekranu całej strony wykonany i wizualnie porównany z projektem UI

## Format Raportu

```markdown
## Wynik Weryfikacji: [PASS | FAIL]

### Komponent: [nazwa]

**Pewność:** [WYSOKA | ŚREDNIA | NISKA]

### Różnice

| Właściwość | Oczekiwane (projekt UI) | Aktualne (Implementacja) | Poziom ważności |
| ---------- | ------------------ | ------------------------ | --------------- |
| [właściwość] | [oczekiwane]     | [aktualne]               | [poziom]        |

### Zalecane Naprawy

- [konkretna naprawa z dokładnymi wartościami]
```

**Poziomy pewności:**

- **WYSOKA** — Dane zarówno z projektu UI jak i implementacji kompletne, porównanie jest wiarygodne
- **ŚREDNIA** — Nie udało się wyodrębnić niektórych wartości, zalecany ręczny przegląd
- **NISKA** — Wystąpiły błędy narzędzi, wymagana ręczna weryfikacja przed wprowadzeniem zmian

## Powiązane Umiejętności

- `implementing-frontend` - do implementacji poprawek zgodnie ze wzorcami systemu projektowego
- `technical-context-discovering` - do rozumienia konwencji tokenów projektowych w projekcie
