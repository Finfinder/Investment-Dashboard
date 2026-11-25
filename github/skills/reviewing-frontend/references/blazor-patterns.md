# Wzorce Przeglądu Blazor UI

Kryteria przeglądu specyficzne dla Blazor dla umiejętności `reviewing-frontend`. Załaduj to odniesienie podczas przeglądu kodu Blazor UI.

## Spis Treści

- [Przegląd Cyklu Życia i Stanu Blazor](#przegląd-cyklu-życia-i-stanu-blazor)
- [Antywzorce Specyficzne dla Blazor](#antywzorce-specyficzne-dla-blazor)
- [Przegląd Renderowania i Wydajności](#przegląd-renderowania-i-wydajności)
- [Bezpieczeństwo: MarkupString i JS Interop](#bezpieczeństwo-markupstring-i-js-interop)

## Przegląd Cyklu Życia i Stanu Blazor

Podczas przeglądu komponentów Blazor sprawdź poniższe kwestie specyficzne dla Blazor, oprócz ogólnego przeglądu hooków/composables z umiejętności:

| Sprawdzenie | Na co zwrócić uwagę | Waga |
| --- | --- | --- |
| `async void` poza event handlerem | `async void` w metodach cyklu życia lub usługach | Krytyczne - błędy są nieobsługiwalne i trudne do diagnozy |
| Brak guard `firstRender` w `OnAfterRenderAsync` | Inicjalizacja JS lub ciężka logika uruchamiana przy każdym renderze | Krytyczne - ryzyko pętli renderowania i degradacji wydajności |
| Brak cleanup subskrypcji | Eventy/subskrypcje bez `IDisposable`/`IAsyncDisposable` | Krytyczne - wyciek pamięci i duplikacja zdarzeń |
| Blokowanie async (`.Result`, `.Wait()`) | Wywołania synchroniczne na taskach w komponentach | Krytyczne - ryzyko deadlocków i freeze UI |
| Stan pochodny ustawiany w metodach cyklu życia | Nadpisywanie stanu, który można obliczyć przy renderze | Ostrzeżenie - zbędne renderowania i niespójność stanu |

### Lista Kontrolna Przeglądu Blazor

Zastosuj tę listę kontrolną **oprócz** ogólnej listy kontrolnej hooków/composables z głównej umiejętności:

```markdown
Blazor:

- [ ] Parametry `[Parameter]` i `OnParametersSet(Async)` nie nadpisują bezwarunkowo stanu użytkownika
- [ ] `OnAfterRender(Async)` używa guarda `firstRender` dla inicjalizacji, która ma wykonać się raz
- [ ] Brak `async void` poza obsługą zdarzeń UI
- [ ] Brak blokujących wywołań `.Result` / `.Wait()` w komponencie
- [ ] Subskrypcje eventów/listenerów są zwalniane w `Dispose` / `DisposeAsync`
- [ ] `EventCallback` i `EventCallback<T>` używane zamiast niestabilnych delegatów tam, gdzie komponent emituje zdarzenia
- [ ] Dynamiczne listy mają stabilne `@key` (nie indeks), gdy elementy mogą zmieniać kolejność
- [ ] Wartość `CascadingValue` nie jest tworzona jako nowy obiekt inline przy każdym renderze
- [ ] `StateHasChanged` nie jest wywoływane bezwarunkowo w pętli renderowania
- [ ] JS interop (`IJSRuntime`) uruchamiany po renderze i z uwzględnieniem trybu prerenderingu
```

## Antywzorce Specyficzne dla Blazor

| Antywzorzec | Waga | Poprawka |
| --- | --- | --- |
| `(MarkupString)userInput` lub `builder.AddMarkupContent(..., userInput)` | Krytyczne | Sanityzuj HTML przed renderem lub preferuj renderowanie danych strukturalnych |
| `async void` w metodach innych niż handler zdarzenia | Krytyczne | Zmień na `async Task` |
| `.Result` / `.Wait()` na taskach z I/O | Krytyczne | Użyj pełnego przepływu async/await |
| Brak `Dispose` przy subskrypcji eventów serwisów | Krytyczne | Dodaj `IDisposable`/`IAsyncDisposable` i wypisz subskrypcje |
| Brak `@key` na dynamicznej liście z lokalnym stanem elementów | Ostrzeżenie | Dodaj stabilny klucz oparty o ID encji |
| Duży komponent `.razor` łączący logikę i UI bez separacji | Sugestia | Rozdziel na mniejsze komponenty lub code-behind (`.razor.cs`) |

## Przegląd Renderowania i Wydajności

Podczas przeglądu wydajności Blazor sprawdź:

| Wzorzec | Sprawdzenie | Poprawka, jeśli błędne |
| --- | --- | --- |
| `StateHasChanged()` | Czy nie jest wołane bezwarunkowo po każdej mutacji i w cyklu `OnAfterRender`? | Ogranicz wywołania i unikaj pętli renderu |
| `ShouldRender()` | Czy użyte świadomie przy drogich poddrzewach UI? | Dodaj warunek tylko jeśli faktycznie ogranicza koszt renderu |
| `@key` w pętlach | Czy stabilizuje tożsamość elementów przy zmianie kolejności? | Użyj klucza opartego o trwałe ID |
| `CascadingValue Value="new ..."` | Czy nie tworzy nowej referencji przy każdym renderze? | Wynieś obiekt do pola i aktualizuj tylko przy zmianach |
| Częste wywołania JS interop | Czy nie są uruchamiane wielokrotnie bez potrzeby? | Debounce/throttle lub cache wyników i wywołań |

## Bezpieczeństwo: MarkupString i JS Interop

`MarkupString` i `AddMarkupContent` to główne wektory XSS w Blazor UI:

- **Nigdy** nie renderuj niesanityzowanego inputu użytkownika jako HTML.
- Jeśli surowy HTML jest wymagany, wykonaj sanityzację po stronie serwera lub klienta przed przekazaniem do UI.
- Preferuj renderowanie danych strukturalnych zamiast wstrzykiwania surowego HTML.
- Każde użycie `MarkupString` oznacz do ręcznego przeglądu bezpieczeństwa.

JS interop (`IJSRuntime`) wymaga dodatkowych kontroli:

- Nie wywołuj JS interop przed pierwszym renderem komponentu.
- Dla aplikacji z prerenderingiem zabezpiecz wywołania JS przed fazą bez aktywnego runtime przeglądarki.
- Waliduj dane wejściowe przekazywane do JS i ogranicz dynamiczne budowanie skryptów.
