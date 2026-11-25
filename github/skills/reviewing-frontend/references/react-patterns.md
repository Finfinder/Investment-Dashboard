# Wzorce Przeglądu React

Kryteria przeglądu specyficzne dla Reacta dla umiejętności `reviewing-frontend`. Załaduj to odniesienie podczas przeglądu kodu React.

## Spis Treści

- [Przegląd Hooków React](#przegląd-hooków-react)
- [Antywzorce Specyficzne dla Reacta](#antywzorce-specyficzne-dla-reacta)
- [Przegląd Memoizacji](#przegląd-memoizacji)
- [Bezpieczeństwo: dangerouslySetInnerHTML](#bezpieczeństwo-dangerouslysetinnerhtml)

## Przegląd Hooków React

Podczas przeglądu hooków Reacta sprawdź poniższe kwestie specyficzne dla Reacta, oprócz ogólnego przeglądu hooków z umiejętności:

- Wyłączenie `exhaustive-deps`
  - Na co zwrócić uwagę: `// eslint-disable-next-line react-hooks/exhaustive-deps`
  - Waga: Ostrzeżenie - ryzyko nieaktualnego closure
- Naruszenie zasad hooków
  - Na co zwrócić uwagę: Hook wywołany w warunku, pętli lub funkcji zagnieżdżonej
  - Waga: Krytyczne - łamie kolejność hooków w React
- `useEffect` bez funkcji cleanup
  - Na co zwrócić uwagę: Utworzono timer, listener lub subskrypcję bez `return () => cleanup()`
  - Waga: Krytyczne - wyciek pamięci
- `useEffect` dla stanu pochodnego
  - Na co zwrócić uwagę: Stan ustawiany w efekcie, który można obliczyć w trakcie renderowania
  - Waga: Ostrzeżenie - niepotrzebny cykl renderowania
- `useState` dla wartości niereaktywnej
  - Na co zwrócić uwagę: Id timera, poprzednia wartość lub ref przechowywane w stanie
  - Waga: Ostrzeżenie - powoduje zbędne renderowania

### Lista Kontrolna Przeglądu Hooków React

Zastosuj tę listę kontrolną **oprócz** ogólnej listy kontrolnej hooków/composables z głównej umiejętności:

```markdown
Hooki React:

- [ ] Wszystkie wartości reaktywne uwzględnione w tablicach zależności
- [ ] Brak eslint-disable dla react-hooks/exhaustive-deps
- [ ] Brak eslint-disable dla react-hooks/rules-of-hooks
- [ ] Obiekty/tablice w deps są memoizowane lub wyniesione do zakresu modułu
- [ ] Brak literałów funkcji/obiektów tworzonych w pozycji zależności
- [ ] useEffect nie jest używany do stanu pochodnego (obliczaj podczas renderowania)
- [ ] useState nie jest używany dla wartości niereaktywnych (użyj useRef)
- [ ] Callbacki przekazywane do memoizowanych dzieci są opakowane w useCallback
- [ ] Kosztowne obliczenia są opakowane w useMemo z poprawnymi deps
- [ ] Wartości providera kontekstu są memoizowane (bez literałów obiektów inline)
```

## Antywzorce Specyficzne dla Reacta

- `dangerouslySetInnerHTML={{ __html: userInput }}`
  - Waga: Krytyczne
  - Poprawka: Sanityzuj za pomocą DOMPurify lub podobnej biblioteki przed wstrzyknięciem
- `dangerouslySetInnerHTML` dla treści kontrolowanej przez użytkownika
  - Waga: Krytyczne
  - Poprawka: Preferuj renderowanie danych strukturalnych; unikaj surowego HTML
- Indeks jako klucz na dynamicznej liście (`key={index}`)
  - Waga: Krytyczne
  - Poprawka: Użyj stabilnego unikalnego ID (ID encji, UUID)
- Komponent klasowy w nowym kodzie
  - Waga: Sugestia
  - Poprawka: Przepisz na komponent funkcyjny z hookami
- Domyślny export komponentu
  - Waga: Sugestia
  - Poprawka: Użyj named export dla spójności

## Przegląd Memoizacji

Podczas przeglądu memoizacji w kodzie React:

- `React.memo(Component)`
  - Sprawdzenie: Czy komponent faktycznie często renderuje się ponownie z tymi samymi propsami?
  - Poprawka, jeśli błędne: Usuń, jeśli rodzic rzadko się renderuje lub propsy zawsze się zmieniają
- `useMemo(() => val, [deps])`
  - Sprawdzenie: Czy obliczenie jest rzeczywiście kosztowne (1000+ elementów, złożona transformacja)?
  - Poprawka, jeśli błędne: Usuń dla trywialnych obliczeń
- `useCallback(fn, [deps])`
  - Sprawdzenie: Czy callback jest przekazywany do dziecka opakowanego w `React.memo`?
  - Poprawka, jeśli błędne: Usuń, jeśli handler nie jest przekazywany dalej
- Brak `useMemo` dla wartości kontekstu
  - Sprawdzenie: Czy `<Provider value={{ a, b }}>` tworzy nowy obiekt przy każdym renderze?
  - Poprawka, jeśli błędne: Opakuj wartość w `useMemo`

## Bezpieczeństwo: dangerouslySetInnerHTML

`dangerouslySetInnerHTML` w React to główny wektor XSS w aplikacjach React:

- **Nigdy** nie przekazuj niesanityzowanego inputu użytkownika do `__html`.
- Jeśli wymagany jest surowy HTML, wykonaj sanityzację biblioteką (DOMPurify, sanitize-html) przed wstrzyknięciem.
- Preferuj renderowanie danych strukturalnych (kompozycja komponentów) zamiast wstrzykiwania surowego HTML.
- Oznacz każde użycie `dangerouslySetInnerHTML` do ręcznego przeglądu bezpieczeństwa - nawet jeśli teraz wygląda bezpiecznie, przyszłe zmiany danych mogą wprowadzić ryzyko.
