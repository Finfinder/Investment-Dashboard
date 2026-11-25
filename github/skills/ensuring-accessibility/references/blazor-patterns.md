# Wzorce Dostępności Blazor

Wzorce specyficzne dla Blazor dla umiejętności `ensuring-accessibility`. Załaduj to odniesienie, gdy projekt używa Blazor (Server/WebAssembly).

## Spis treści
- [Mapowanie wzorców a11y na Blazor](#mapowanie-wzorców-a11y-na-blazor)
- [Zarządzanie fokusem przy nawigacji](#zarządzanie-fokusem-przy-nawigacji)
- [Dostępne formularze Blazor](#dostępne-formularze-blazor)
- [Fokus na pierwszym błędzie po submit](#fokus-na-pierwszym-błędzie-po-submit)
- [Testowanie a11y w bUnit](#testowanie-a11y-w-bunit)
- [Antywzorce a11y w Blazor](#antywzorce-a11y-w-blazor)

## Mapowanie wzorców a11y na Blazor

| Wzorzec a11y | Blazor | Uwagi |
|---|---|---|
| Zarządzanie fokusem przy nawigacji | `NavigationManager.LocationChanged` + `ElementReference.FocusAsync()` | Blazor SPA nie przeładowuje strony — fokus zostaje na starym elemencie |
| `aria-invalid` na polach formularza | Automatyczne w `InputText`, `InputNumber`, itp. | Ustawiane przez `EditContext` po walidacji |
| Etykiety pól (`<label for>`) | Jawne `id` na `<InputText id="name">` + `<label for="name">` | `Input*` NIE generuje `id` automatycznie |
| Komunikat błędu powiązany z polem | `<ValidationMessage For="…" />` | Renderuje `<div class="validation-message">` — dodaj `role="alert"` wrapper jeśli potrzebne |
| Live region dla komunikatów | `<div aria-live="polite">@statusMessage</div>` | Taki sam jak w HTML — Blazor renderuje natywny DOM |
| `role="alert"` dla błędów | Wrapper `<div role="alert">` wokół `<ValidationSummary />` | `ValidationSummary` sam nie dodaje `role="alert"` |
| Skip link | `<a href="#main-content" class="skip-link">Przejdź do treści</a>` | Standardowy HTML — działa w Blazor |
| Obsługa Escape w dialogach | `@onkeydown` + sprawdzenie `KeyboardEventArgs.Key == "Escape"` | Zamknij dialog + przywróć fokus do triggera |
| Trap fokus w modalu | `@onkeydown` + śledzenie focusable elements + redirect Tab/Shift+Tab | Lub gotowa biblioteka (np. Blazored.Modal ze wsparciem a11y) |

## Zarządzanie fokusem przy nawigacji

```razor
@inject NavigationManager Navigation
@implements IDisposable

<main id="main-content" @ref="mainContent" tabindex="-1">
    @Body
</main>

@code {
    private ElementReference mainContent;

    protected override void OnInitialized()
    {
        Navigation.LocationChanged += OnLocationChanged;
    }

    private async void OnLocationChanged(object? sender, LocationChangedEventArgs e)
    {
        await InvokeAsync(async () =>
        {
            await mainContent.FocusAsync();
        });
    }

    public void Dispose()
    {
        Navigation.LocationChanged -= OnLocationChanged;
    }
}
```

## Dostępne formularze Blazor

```razor
<EditForm Model="@model" OnValidSubmit="@HandleSubmit" FormName="accessible-form">
    <DataAnnotationsValidator />

    <div role="alert" aria-live="assertive">
        <ValidationSummary />
    </div>

    <div class="field">
        <label for="username">Nazwa użytkownika</label>
        <InputText id="username"
                   @bind-Value="model.Username"
                   aria-describedby="username-help username-error"
                   aria-required="true" />
        <span id="username-help" class="help-text">Min. 3 znaki</span>
        <div id="username-error">
            <ValidationMessage For="@(() => model.Username)" />
        </div>
    </div>

    <button type="submit">Zapisz</button>
</EditForm>
```

**Kluczowe zasady:**
- Zawsze ustaw jawne `id` na komponentach `Input*` — powiąż z `<label for>`
- Dodaj `aria-describedby` wskazujący na help text i kontener błędu
- Opakuj `<ValidationSummary />` w `role="alert"` — komponent sam tego nie robi
- Dodaj `aria-required="true"` na wymaganych polach — `DataAnnotations` `[Required]` tego nie dodaje automatycznie

## Fokus na pierwszym błędzie po submit

```razor
@code {
    private async Task HandleInvalidSubmit()
    {
        // Po nieudanej walidacji — ustaw fokus na pierwszy błąd
        await JSRuntime.InvokeVoidAsync("focusFirstError");
    }
}
```

```javascript
// wwwroot/js/a11y.js
window.focusFirstError = () => {
    const firstError = document.querySelector('.validation-message');
    if (firstError) {
        const field = firstError.closest('.field')?.querySelector('input, select, textarea');
        field?.focus();
    }
};
```

## Testowanie a11y w bUnit

```csharp
[Fact]
public void Form_ShouldHave_AccessibleLabels()
{
    var cut = RenderComponent<MyForm>();

    // Sprawdź że każdy input ma powiązaną etykietę
    var inputs = cut.FindAll("input[id]");
    foreach (var input in inputs)
    {
        var id = input.GetAttribute("id");
        var label = cut.Find($"label[for='{id}']");
        Assert.NotNull(label);
    }
}

[Fact]
public void Form_ShouldShow_AriaInvalid_OnValidationError()
{
    var cut = RenderComponent<MyForm>();

    // Submit pusty formularz
    cut.Find("form").Submit();

    // Sprawdź aria-invalid na wymaganych polach
    var requiredInput = cut.Find("#username");
    Assert.Equal("true", requiredInput.GetAttribute("aria-invalid"));
}
```

## Antywzorce a11y w Blazor

| Antywzorzec | Problem | Rozwiązanie |
|---|---|---|
| Brak `id` na `InputText` | `<label for>` nie działa | Zawsze jawne `id` |
| `ValidationSummary` bez `role="alert"` | Czytnik ekranu nie ogłasza błędów | Opakuj w `<div role="alert">` |
| Brak fokus management po nawigacji | Użytkownik AT „gubi się" po zmianie trasy | `NavigationManager.LocationChanged` + `FocusAsync()` |
| `@onclick` na `<div>` | Niedostępne dla klawiatury | Użyj `<button>` lub dodaj `role="button"` + `tabindex="0"` + `@onkeydown` |
| Dynamiczna treść bez `aria-live` | Aktualizacje niewidoczne dla AT | Dodaj `aria-live="polite"` na kontenerze |
| Trap fokus przez `display:none` vs `@if` | Blazor re-renderuje DOM — fokus się gubi | Zarządzaj fokusem jawnie po zmianie widoczności |
