# Wzorce Optymalizacji Blazor UI

Wzorce specyficzne dla Blazor w ramach skilla `optimizing-frontend`. Wczytaj tę referencję, gdy projekt używa Blazor (Server lub WebAssembly).

## Spis Treści

- [Profilowanie Blazor](#profilowanie-blazor)
- [Kontrola Re-renderowania](#kontrola-re-renderowania)
- [Podział Kodu](#podział-kodu)
- [Pola dla Wartości Niereaktywnych](#pola-dla-wartości-niereaktywnych)
- [Typowe Wzorce Marnotrawstwa Renderowania](#typowe-wzorce-marnotrawstwa-renderowania)
- [Zarządzanie Pamięcią i Cleanup](#zarządzanie-pamięcią-i-cleanup)
- [Praca Poza UI Thread](#praca-poza-ui-thread)

## Profilowanie Blazor

- Blazor Server: sprawdź Network/Timeline w DevTools, logi aplikacji/Kestrel i koszt synchronicznych operacji blokujących SignalR circuit.
- Blazor WebAssembly: użyj Chrome Performance oraz `dotnet-trace`, jeśli projekt ma skonfigurowane profilowanie runtime.
- Szukaj nadmiernych wywołań `StateHasChanged()`, długich `OnParametersSet`/`OnAfterRender`, ciężkich renderów list i pobierania dużych asemblii przy starcie.
- Mierz przed `ShouldRender()` lub cache; błędne pominięcie renderu łatwo tworzy stale UI.

## Kontrola Re-renderowania

| Ogólna koncepcja (ze skilla) | API Blazor | Użycie |
| --- | --- | --- |
| Memoizacja komponentu | Nadpisanie `ShouldRender()` | Zwróć `false`, aby pominąć re-render gdy stan nie zmienił się |
| Własne porównanie propsów | `ShouldRender()` + porównanie pól | Porównaj pola ręcznie; zwróć `true` tylko gdy wartość faktycznie się zmieniła |
| Stabilizacja callbacka | `EventCallback` / `EventCallback<T>` | Automatycznie stabilne; nie twórz `Action` lambda inline w parametrach komponentu |
| Buforowanie obliczeń | Pole + `IMemoryCache` / `MemoryCache` | Cache'uj kosztowne wyniki w polu lub przez wstrzyknięty `IMemoryCache` |
| Mutowalny ref (niereaktywny) | Pole prywatne klasy (`private int _counter;`) | Pole nie wywołuje re-renderu; wywołaj `StateHasChanged()` ręcznie gdy potrzeba |
| Stabilny klucz elementu listy | Dyrektywa `@key` | `@key` musi być **unikalnym ID z bazy** — nigdy indeksem tablicy |

### ShouldRender — pominięcie niepotrzebnego re-renderu

```csharp
@code {
    [Parameter] public IReadOnlyList<decimal> Prices { get; set; } = [];

    private IReadOnlyList<decimal> _previousPrices = [];

    protected override bool ShouldRender()
    {
        // Ponownie renderuj tylko gdy lista referencyjnie się zmieniła
        if (ReferenceEquals(Prices, _previousPrices)) return false;
        _previousPrices = Prices;
        return true;
    }
}
```

> **Uwaga**: `ShouldRender()` **nie jest** wywoływane przy pierwszym renderowaniu komponentu — to tylko optymalizacja dla kolejnych re-renderów.

### StateHasChanged — ręczne wyzwalanie re-renderu

Wywołuj `StateHasChanged()` tylko gdy komponent otrzymuje dane spoza normalnego cyklu Blazor (np. z callbacku timera, subskrypcji eventu, wiadomości SignalR):

```csharp
@implements IDisposable
@inject IStockFeed StockFeed

@code {
    private decimal _price;

    protected override void OnInitialized()
    {
        StockFeed.PriceChanged += OnPriceChanged;
    }

    private void OnPriceChanged(decimal newPrice)
    {
        _price = newPrice;
        // Powiadamiamy Blazor o zmianie spoza jego cyklu
        InvokeAsync(StateHasChanged);
    }

    public void Dispose()
    {
        StockFeed.PriceChanged -= OnPriceChanged;
    }
}
```

> **Pułapka**: Nadużywanie `StateHasChanged()` (np. wywoływanie w pętli lub w każdym ticku timera) spowoduje nadmierną liczbę renderowań. Wyznacz lokalny stan i renderuj tylko przy rzeczywistej zmianie.

### EventCallback zamiast Action lambda

`EventCallback` jest zamiennikiem `Action` / `Func` i jest automatycznie stabilne referencyjnie – nie powoduje zbędnego re-renderu komponentu potomnego:

```razor
@* Źle — nowa instancja Action przy każdym re-renderze rodzica *@
<Button OnClick="@(() => HandleClick(item.Id))" />

@* Dobrze — EventCallback jest stabilny; Blazor sam zarządza cyklem *@
<Button OnClick="@(EventCallback.Factory.Create(this, () => HandleClick(item.Id)))" />
```

Gdy typ parametru komponentu to `EventCallback` (a nie `Action`), Blazor automatycznie wywołuje `StateHasChanged()` po jej wykonaniu. Definiuj parametry callbacków zawsze jako `EventCallback` / `EventCallback<T>`.

```csharp
// W komponencie potomnym — parametr jako EventCallback
[Parameter] public EventCallback<Guid> OnItemSelected { get; set; }
```

## Podział Kodu

Blazor WebAssembly obsługuje lazy loading asemblii. Blazor Server ładuje komponenty po stronie serwera — podział kodu dotyczy asemblii po stronie klienta i zasobów JS.

### Lazy Loading Asemblii (Blazor WebAssembly)

```csharp
// Program.cs — zarejestruj lazy assemblies w routerze
<Router AppAssembly="@typeof(App).Assembly"
        AdditionalAssemblies="@_lazyLoadedAssemblies">
    ...
</Router>

@code {
    private List<Assembly> _lazyLoadedAssemblies = [];

    [Inject] private LazyAssemblyLoader AssemblyLoader { get; set; } = default!;

    private async Task OnNavigateAsync(NavigationContext context)
    {
        if (context.Path.StartsWith("heavy-module", StringComparison.OrdinalIgnoreCase))
        {
            var assemblies = await AssemblyLoader
                .LoadAssembliesAsync(["HeavyModule.dll"]);
            _lazyLoadedAssemblies.AddRange(assemblies);
        }
    }
}
```

Dodaj asemblię do `BlazorWebAssemblyLazyLoad` w pliku `.csproj`:

```xml
<ItemGroup>
  <BlazorWebAssemblyLazyLoad Include="HeavyModule.dll" />
</ItemGroup>
```

### Dynamiczne Komponenty (`DynamicComponent`)

Gdy typ komponentu jest znany dopiero w czasie wykonania, użyj `DynamicComponent` zamiast ładowania całego zestawu komponentów statycznie:

```razor
<DynamicComponent Type="@widgetType" Parameters="@widgetParams" />

@code {
    private Type widgetType = typeof(DefaultWidget);
    private Dictionary<string, object> widgetParams = new() { ["Title"] = "Widżet" };
}
```

### Komponenty Warunkowe zamiast `display: none`

Nie ukrywaj ciężkich komponentów przez CSS — powoduje to ich renderowanie i wykonywanie logiki. Używaj `@if`:

```razor
@* Źle — komponent jest zamontowany i renderuje się *@
<HeavyChart style="display: @(isVisible ? "block" : "none")" />

@* Dobrze — komponent jest odmontowany gdy niewidoczny *@
@if (isVisible)
{
    <HeavyChart />
}
```

## Pola dla Wartości Niereaktywnych

W Blazor pola prywatne klasy komponentu pełnią rolę odpowiednika `useRef` z Reacta — przechowują stan między renderowaniami bez wywoływania re-renderu:

```csharp
@implements IDisposable

@code {
    // Pole prywatne — nie wywołuje re-renderu
    private System.Threading.Timer? _pollingTimer;
    private CancellationTokenSource? _cts;

    protected override void OnInitialized()
    {
        _cts = new CancellationTokenSource();
        _pollingTimer = new System.Threading.Timer(
            _ => InvokeAsync(FetchDataAsync),
            state: null,
            dueTime: TimeSpan.Zero,
            period: TimeSpan.FromSeconds(30));
    }

    private async Task FetchDataAsync()
    {
        if (_cts is null || _cts.IsCancellationRequested) return;
        // logika pobierania danych...
        StateHasChanged();
    }

    public void Dispose()
    {
        _cts?.Cancel();
        _cts?.Dispose();
        _pollingTimer?.Dispose();
    }
}
```

### Referencja do Elementu DOM (`@ref`)

`@ref` to odpowiednik `useRef` do uchwytów elementów DOM lub komponentów:

```razor
<canvas @ref="_chartCanvas" width="800" height="400" />

@code {
    private ElementReference _chartCanvas;
    private IJSObjectReference? _chartModule;

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender)
        {
            _chartModule = await JS.InvokeAsync<IJSObjectReference>(
                "import", "./js/chart.js");
            await _chartModule.InvokeVoidAsync("init", _chartCanvas);
        }
    }
}
```

> **Pułapka**: Nie odczytuj ani nie używaj `ElementReference` przed `OnAfterRenderAsync` — element DOM nie istnieje wcześniej. Dostępny jest dopiero po pierwszym renderze.

## Typowe Wzorce Marnotrawstwa Renderowania

| Wzorzec | Problem | Rozwiązanie w Blazor |
| --- | --- | --- |
| `style="margin: 8px"` inline w Razor | Bez problemu — to zwykły string, nie obiekt | Ok |
| `Parameters="@(new Dictionary<...>{ ... })"` inline | Nowy obiekt przy każdym re-renderze rodzica | Wynieś do pola lub `@code { private readonly ... _params }` |
| `OnClick="@(() => Handle(item.Id))"` (lambda `Action`) | Nowa lambda przy każdym renderze; pomija optymalizacje | Użyj `EventCallback.Factory.Create` lub wydziel metodę |
| Brak `@key` na elementach listy | Blazor nie może śledzić tożsamości; pełne re-rendery | Dodaj `@key="item.Id"` (stabilne ID, nie indeks) |
| `CascadingValue` ze złożonym obiektem bez `IsFixed` | Każda zmiana re-renderuje wszystkich konsumentów | Dodaj `IsFixed="true"` jeśli wartość nie zmienia się |
| Subskrypcja z brakującym `Dispose()` | Wyciek pamięci; eventy na martwym komponencie | Implementuj `IDisposable` / `IAsyncDisposable` |
| `OnParametersSet` z kosztowną operacją synchroniczną | Blokuje rendering przy każdej zmianie parametrów | Przenieś do `OnParametersSetAsync` i cache'uj wynik |
| Użycie `StateHasChanged()` w każdym ticku timera | Ciągłe niepotrzebne re-rendery | Renderuj tylko gdy dane faktycznie się zmieniły |

## Zarządzanie Pamięcią i Cleanup

Blazor komponenty mogą implementować `IDisposable` lub `IAsyncDisposable`. Cleanup jest wywoływany gdy komponent jest odmontowywany z drzewa komponentów.

### Wzorzec Cleanup

```csharp
@implements IAsyncDisposable

@code {
    private readonly CancellationTokenSource _cts = new();
    private HubConnection? _hubConnection;
    private IJSObjectReference? _jsModule;

    protected override async Task OnInitializedAsync()
    {
        // Subskrypcja SignalR
        _hubConnection = new HubConnectionBuilder()
            .WithUrl(Navigation.ToAbsoluteUri("/assetshub"))
            .Build();

        _hubConnection.On<AssetUpdate>("ReceiveUpdate", update =>
        {
            // obsługa aktualizacji...
            InvokeAsync(StateHasChanged);
        });

        await _hubConnection.StartAsync(_cts.Token);

        // Moduł JS
        _jsModule = await JS.InvokeAsync<IJSObjectReference>(
            "import", "./js/chart.js");
    }

    public async ValueTask DisposeAsync()
    {
        // Zawsze anuluj token, zatrzymaj połączenia i zwolnij JS moduły
        await _cts.CancelAsync();
        _cts.Dispose();

        if (_hubConnection is not null)
            await _hubConnection.DisposeAsync();

        if (_jsModule is not null)
            await _jsModule.DisposeAsync();
    }
}
```

### Wirtualizacja Długich List (`Virtualize`)

Wbudowany komponent `Virtualize` renderuje tylko widoczne wiersze — odpowiednik windowing/virtualization z Reacta:

```razor
<Virtualize Items="@_assets" Context="asset" OverscanCount="5">
    <ItemContent>
        <AssetRow Asset="@asset" @key="asset.Id" />
    </ItemContent>
    <Placeholder>
        <AssetRowSkeleton />
    </Placeholder>
</Virtualize>

@code {
    private IReadOnlyList<Asset> _assets = [];
}
```

Dla dużych zbiorów danych po stronie serwera użyj `ItemsProvider` zamiast wczytywania całej kolekcji do pamięci:

```razor
<Virtualize ItemsProvider="@LoadAssetsAsync" Context="asset">
    <AssetRow Asset="@asset" @key="asset.Id" />
</Virtualize>

@code {
    private async ValueTask<ItemsProviderResult<Asset>> LoadAssetsAsync(
        ItemsProviderRequest request)
    {
        var result = await AssetsService.GetPageAsync(
            request.StartIndex, request.Count, request.CancellationToken);
        return new ItemsProviderResult<Asset>(result.Items, result.TotalCount);
    }
}
```

## Praca Poza UI Thread

- Blazor Server: długie CPU-bound operacje przenoś do osobnego `Task` albo background service, aby nie blokować circuit. Aktualizację UI wykonuj przez `InvokeAsync(StateHasChanged)`.
- Blazor WebAssembly: ciężkie obliczenia dziel na partie i używaj `await Task.Yield()` między partiami, jeśli Web Worker lub backend nie są dostępne.
- Operacje I/O implementuj asynchronicznie; synchroniczne czekanie (`.Result`, `.Wait()`) w lifecycle komponentu traktuj jako czerwoną flagę.
- Dla długich operacji zawsze pokaż stan ładowania i obsłuż anulowanie przez `CancellationTokenSource` zwalniany w `Dispose()`/`DisposeAsync()`.
