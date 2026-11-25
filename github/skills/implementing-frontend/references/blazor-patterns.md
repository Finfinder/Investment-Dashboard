# Wzorce implementacyjne Blazor UI

Wzorce specyficzne dla Blazor UI do umiejętności `implementing-frontend`. Wczytaj tę referencję, gdy projekt używa Blazor (Server/WebAssembly).

## Spis treści

- [Kompozycja komponentów](#kompozycja-komponentów)
- [Kontrakty komponentów](#kontrakty-komponentów)
- [Wzorce stanu](#wzorce-stanu)
- [Stany danych](#stany-danych)
- [Obsługa błędów](#obsługa-błędów)
- [Wzorce wydajności](#wzorce-wydajności)
- [Antywzorce](#antywzorce)

## Kompozycja komponentów

Blazor implementuje ogólne wzorce kompozycji w następujący sposób:

- Projekcja treści: `RenderFragment` i `RenderFragment<TValue>`.
- Delegacja renderowania: szablony komponentu, np. `ChildContent`, `HeaderTemplate`, `ItemTemplate`.
- Komponenty złożone: współdzielony kontekst przez `CascadingValue` i podkomponenty.
- Sloty: nazwane parametry typu `RenderFragment`, np. `Header`, `Footer`, `EmptyState`.

Preferuj `ChildContent` przy pojedynczej projekcji treści. Używaj nazwanych fragmentów (`RenderFragment`) przy wielu punktach wstrzyknięcia. Dla ściśle powiązanych grup UI (tabs, accordion, select) stosuj wzorzec parent + child z kontraktem parametrów.

## Kontrakty komponentów

- Definiuj jawne `[Parameter]` i `EventCallback<T>`; unikaj własnych delegatów do typowych zdarzeń UI.
- Dla wymaganych parametrów używaj lokalnej konwencji projektu, np. `[EditorRequired]`, jeśli repo ją stosuje.
- Dla wielu miejsc projekcji treści stosuj nazwane `RenderFragment`, np. `Header`, `Footer`, `EmptyState`.
- Przy rosnącej złożoności rozdziel widok i logikę do `Component.razor` oraz `Component.razor.cs`.
- Utrzymuj logikę biznesową poza `.razor`; komponent ma koordynować UI, nie zastępować service layer.

## Wzorce stanu

Typowe mapowanie stanu w Blazor:

- Stan lokalny: pole lub prywatna właściwość komponentu w `@code` albo `.razor.cs`.
- Stan wyniesiony: `[Parameter]` i `EventCallback<T>` przekazywane między rodzicem i dzieckiem.
- Kontekst / DI: `CascadingParameter`, `CascadingValue` i `@inject`.
- Cache serwera: serwis DI, HttpClient, warstwa API albo lokalny cache aplikacyjny.

Używaj `EventCallback<T>` zamiast własnych delegatów, gdy dziecko ma informować rodzica o zmianie stanu. W przypadku złożonych przejść stanu wydziel logikę do serwisu lub dedykowanego store i utrzymuj komponent prezentacyjny możliwie cienki.

## Stany danych

- Loading: renderuj jawny placeholder, skeleton albo stan `LoadingContent` zgodny z lokalnym wzorcem.
- Error: błędy integracji API obsługuj przez stan komponentu, retry albo serwis danych; `ErrorBoundary` nie zastępuje obsługi requestów.
- Empty: dla pustych kolekcji używaj osobnego fragmentu UI, często jako `RenderFragment EmptyState`.
- Disabled/pending: blokuj akcje wielokrotne, ale zachowuj czytelną informację o trwającej operacji.

## Obsługa błędów

Blazor używa **ErrorBoundary** do przechwytywania błędów renderowania komponentów:

- Owijaj sekcje zależne od danych komponentem `<ErrorBoundary>`.
- Preferuj granice błędów na poziomie funkcjonalności zamiast jednej globalnej.
- Błędy z warstwy asynchronicznej i integracji API obsługuj jawnie (`try/catch`, stan błędu UI, retry).
- Dla boundary z akcją odzyskania sprawdź lokalny wzorzec resetu stanu i ponownego pobrania danych.

## Wzorce wydajności

Typowe narzędzia wydajnościowe Blazor:

- Kontrola renderowania: `ShouldRender()` wtedy, gdy część renderów jest zbędna.
- Stabilne klucze list: `@key` przy dynamicznych listach i zmianie kolejności.
- Wirtualizacja: `<Virtualize Items="...">` dla długich list i tabel.
- Ograniczanie kosztu obliczeń: buforowanie wyniku w stanie komponentu lub serwisie, gdy obliczenia są kosztowne.

**Zasada kciuka**: Najpierw mierz. Nie optymalizuj na zapas. Wprowadzaj `ShouldRender`, `@key` i wirtualizację tam, gdzie profilowanie wskazuje realny koszt.

## Antywzorce

- Ciężka logika biznesowa bezpośrednio w `.razor`: utrudnia testowanie; przenieś ją do `.razor.cs`, serwisu DI albo warstwy aplikacyjnej.
- Nadmiarowe wywołania `StateHasChanged()`: powodują zbędne re-rendery; aktualizuj stan świadomie i renderuj tylko gdy to konieczne.
- Brak `@key` w listach dynamicznych: błędnie mapuje elementy przy reorder/remove; dodaj stabilny, unikalny `@key`.
- Nadużywanie `CascadingValue` dla każdego stanu: tworzy silne sprzężenie; używaj kaskadowania tylko dla stanu przekrojowego.
- Manualne budowanie HTML w stringach: zwiększa ryzyko błędów i XSS; używaj komponentów i `RenderFragment`.
