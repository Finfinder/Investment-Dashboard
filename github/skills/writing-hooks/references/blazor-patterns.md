# Wzorce Blazor UI

Wzorce specyficzne dla Blazor dla umiejętności `writing-hooks`. Załaduj to odniesienie, gdy projekt używa Blazor UI.

## Spis treści

- [Mapowanie hooków na Blazor](#mapowanie-hooków-na-blazor)
- [Cykl życia i odświeżanie UI](#cykl-życia-i-odświeżanie-ui)
- [Czyszczenie zasobów](#czyszczenie-zasobów)
- [Wydajność i stabilność API](#wydajność-i-stabilność-api)
- [Testowanie z bUnit](#testowanie-z-bunit)

## Mapowanie hooków na Blazor

Blazor nie ma hooków w sensie Reacta, ale ma równoważny wzorzec: wielokrotnego użytku logikę przenoś do serwisów, bazowych klas komponentów albo małych obiektów stanu wstrzykiwanych przez DI.

| Koncepcja z `writing-hooks` | Odpowiednik Blazor | Zastosowanie |
| --- | --- | --- |
| Hook atomowy | Lokalny stan komponentu (`@code`) lub mały serwis scoped | Proste interakcje UI, lokalne przełączniki, filtrowanie |
| Hook molekuła | Kompozycja 2+ serwisów w komponencie/bazowej klasie | Koordynacja logiki UI bez fetchingu |
| Hook organizm | Serwis domenowy + klient API + cache | Logika danych, mutacje, synchronizacja stanu |

Preferuj małe, jawne kontrakty API serwisów:

```csharp
public sealed class CounterState
{
    public int Value { get; private set; }

    public void Increment() => Value++;
    public void Reset() => Value = 0;
}
```

## Cykl życia i odświeżanie UI

W Blazor odświeżanie komponentu wynika z cyklu życia (`OnInitialized[Async]`, `OnParametersSet[Async]`, `OnAfterRender[Async]`) oraz wywołania `StateHasChanged`.

**Zasady**:

- Używaj `OnInitializedAsync` do jednorazowej inicjalizacji danych.
- Używaj `OnParametersSetAsync`, gdy logika zależy od parametrów wejściowych komponentu.
- Nie uruchamiaj długotrwałych operacji bez możliwości anulowania.
- Gdy aktualizacja przychodzi spoza kontekstu UI (np. event z serwisu), odświeżaj przez `InvokeAsync(StateHasChanged)`.

```csharp
@implements IDisposable

@code {
    private CancellationTokenSource? profileLoadCts;

    protected override async Task OnParametersSetAsync()
    {
        profileLoadCts?.Cancel();
        profileLoadCts?.Dispose();

        if (UserId is null)
        {
            Profile = null;
            profileLoadCts = null;
            return;
        }

        profileLoadCts = new CancellationTokenSource();
        var token = profileLoadCts.Token;

        try
        {
            var profile = await UserService.GetProfileAsync(UserId.Value, token);
            token.ThrowIfCancellationRequested();
            Profile = profile;
        }
        catch (OperationCanceledException) when (token.IsCancellationRequested)
        {
        }
    }

    public void Dispose()
    {
        profileLoadCts?.Cancel();
        profileLoadCts?.Dispose();
    }
}
```

## Czyszczenie zasobów

Czyszczenie w Blazor realizuje `IDisposable` lub `IAsyncDisposable` na komponencie albo serwisie stanu.

```csharp
@implements IDisposable

@code {
    protected override void OnInitialized()
    {
        Notifications.Changed += HandleChanged;
    }

    private void HandleChanged()
        => InvokeAsync(StateHasChanged);

    public void Dispose()
    {
        Notifications.Changed -= HandleChanged;
    }
}
```

Dla operacji asynchronicznych stosuj `CancellationTokenSource` i anulowanie przy `Dispose`.

## Wydajność i stabilność API

| Cel | Mechanizm Blazor | Kiedy |
| --- | --- | --- |
| Ograniczenie zbędnych renderów | `ShouldRender()` | Gdy komponent renderuje kosztowne drzewo i dane nie zmieniły się semantycznie |
| Stabilny przepływ danych | Niezmiennicze modele wejściowe + małe DTO | Gdy komponenty potomne reagują na zmiany referencji |
| Render dużych list | `<Virtualize>` | Dla długich list i tabel |
| Unikanie efektu lawiny eventów | Debounce/throttle w serwisie stanu | Dla wyszukiwarek i wejścia tekstowego |

Nie nadużywaj `ShouldRender()`. Najpierw mierz problem, potem optymalizuj.

## Testowanie z bUnit

Logikę Blazor UI testuj przez:

1. Testy serwisów stanu (czysta logika, bez renderowania).
2. Testy komponentów w bUnit (render, interakcje, asercje HTML).
3. Testy cleanupu (`Dispose`) dla subskrypcji i anulowania operacji.

```csharp
using Bunit;
using Xunit;

public class CounterTests : TestContext
{
    [Fact]
    public void IncrementButton_UpdatesCount()
    {
        var cut = RenderComponent<Counter>();

        cut.Find("button.increment").Click();

        cut.Markup.Contains("Current count: 1");
    }
}
```

Jeśli komponent wymaga DI, zarejestruj zależności w `TestContext.Services` przed renderem.
