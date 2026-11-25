# Wzorce Formularzy Blazor

Wzorce specyficzne dla Blazor dla umiejętności `implementing-forms`. Załaduj to odniesienie, gdy projekt używa Blazor (Server/WebAssembly).

## Spis treści

- [Mapowanie wzorców ogólnych na Blazor](#mapowanie-wzorców-ogólnych-na-blazor)
- [EditForm — podstawowy wzorzec](#editform--podstawowy-wzorzec)
- [Model z DataAnnotations](#model-z-dataannotations)
- [FluentValidation — alternatywa](#fluentvalidation--alternatywa)
- [Komponent pola (Field Wrapper)](#komponent-pola-field-wrapper)
- [Wieloetapowe formularze (Wizard)](#wieloetapowe-formularze-wizard)
- [Obsługa błędów serwera](#obsługa-błędów-serwera)
- [Moment walidacji w Blazor](#moment-walidacji-w-blazor)
- [Antywzorce Blazor (formularze)](#antywzorce-blazor-formularze)

## Mapowanie wzorców ogólnych na Blazor

| Wzorzec ogólny | Blazor | Uwagi |
| --- | --- | --- |
| Schema (Zod/Yup) | `DataAnnotations` / `FluentValidation` | Adnotacje na modelu lub reguły w klasie walidatora |
| `<form novalidate>` | `<EditForm Model="@model">` | `EditForm` automatycznie wyłącza natywną walidację HTML |
| `onSubmit` handler | `OnValidSubmit` / `OnInvalidSubmit` / `OnSubmit` | `OnValidSubmit` odpala się tylko po pomyślnej walidacji |
| Schema → TypeScript type | Model klasy C# (`class`/`record`) | Typ modelu = schemat = jedno źródło prawdy |
| Field wrapper component | Komponent opakowujący `InputBase<T>` | Łączy `InputText`/`InputNumber` z etykietą, błędem, opisem |
| Form state library (react-hook-form) | `EditContext` | Automatycznie śledzi stan pól, walidację, zdarzenia |
| Validation message per field | `<ValidationMessage For="@(() => model.Field)" />` | Renderuje komunikat błędu powiązany z polem |
| Validation summary | `<ValidationSummary />` | Lista wszystkich błędów na górze formularza |

## EditForm — podstawowy wzorzec

```razor
<EditForm Model="@model" OnValidSubmit="@HandleValidSubmit" FormName="example-form">
    <DataAnnotationsValidator />
    <ValidationSummary />

    <div class="field">
        <label for="name">Nazwa</label>
        <InputText id="name" @bind-Value="model.Name" />
        <ValidationMessage For="@(() => model.Name)" />
    </div>

    <button type="submit" disabled="@isSubmitting">Zapisz</button>
</EditForm>

@code {
    private ExampleModel model = new();
    private bool isSubmitting;

    private async Task HandleValidSubmit()
    {
        isSubmitting = true;
        try
        {
            await SaveAsync(model);
        }
        finally
        {
            isSubmitting = false;
        }
    }
}
```

## Model z DataAnnotations

```csharp
public class ExampleModel
{
    [Required(ErrorMessage = "Nazwa jest wymagana")]
    [StringLength(100, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress(ErrorMessage = "Nieprawidłowy adres e-mail")]
    public string Email { get; set; } = string.Empty;

    [Range(1, 1000)]
    public decimal Amount { get; set; }
}
```

## FluentValidation — alternatywa

```csharp
public class ExampleModelValidator : AbstractValidator<ExampleModel>
{
    public ExampleModelValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Nazwa jest wymagana")
            .Length(2, 100);

        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress();

        RuleFor(x => x.Amount)
            .InclusiveBetween(1, 1000);
    }
}
```

Wymaga pakietu `Blazored.FluentValidation` i komponentu `<FluentValidationValidator />` zamiast `<DataAnnotationsValidator />`.

## Komponent pola (Field Wrapper)

```razor
@typeparam TValue

<div class="form-field @(HasError ? "has-error" : "")">
    <label for="@Id">@Label</label>
    @ChildContent
    <ValidationMessage For="@ValidationFor" />
    @if (!string.IsNullOrEmpty(HelpText))
    {
        <span class="help-text" id="@($"{Id}-help")">@HelpText</span>
    }
</div>

@code {
    [Parameter] public string Id { get; set; } = string.Empty;
    [Parameter] public string Label { get; set; } = string.Empty;
    [Parameter] public string? HelpText { get; set; }
    [Parameter] public RenderFragment? ChildContent { get; set; }
    [Parameter] public Expression<Func<TValue>>? ValidationFor { get; set; }

    [CascadingParameter] private EditContext? EditContext { get; set; }

    private bool HasError =>
        ValidationFor is not null
        && EditContext?.GetValidationMessages(FieldIdentifier.Create(ValidationFor)).Any() == true;
}
```

Użycie:

```razor
<FormField TValue="string" Id="name" Label="Nazwa" ValidationFor="@(() => model.Name)">
    <InputText id="name" @bind-Value="model.Name" />
</FormField>
```

## Wieloetapowe formularze (Wizard)

| Aspekt | Wzorzec |
| --- | --- |
| Stan między krokami | Serwis DI `Scoped` przechowujący model + bieżący krok |
| Walidacja per krok | Osobny model/walidator per krok LUB walidacja warunkowa w `FluentValidation` |
| Nawigacja | Przyciski Wstecz/Dalej walidują bieżący krok przed przejściem |
| Persystencja Draft | Zapisz w `localStorage` przez `IJSRuntime` lub w `ProtectedSessionStorage` |
| Stan UI wizualizacji | Komponent `<StepIndicator CurrentStep="@step" TotalSteps="5" />` |

```razor
@inject WizardStateService State

<EditForm Model="@State.CurrentStepModel" OnValidSubmit="@NextStep">
    <DataAnnotationsValidator />

    @switch (State.CurrentStep)
    {
        case 1: <Step1Form /> break;
        case 2: <Step2Form /> break;
        case 3: <Step3Form /> break;
    }

    <div class="wizard-nav">
        @if (State.CurrentStep > 1)
        {
            <button type="button" @onclick="PrevStep">Wstecz</button>
        }
        <button type="submit">@(State.IsLastStep ? "Wyślij" : "Dalej")</button>
    </div>
</EditForm>
```

## Obsługa błędów serwera

```csharp
private async Task HandleValidSubmit()
{
    serverErrors.Clear();
    isSubmitting = true;

    try
    {
        var result = await ApiClient.SubmitAsync(model);
        if (!result.IsSuccess)
        {
            var messageStore = new ValidationMessageStore(editContext);
            messageStore.Clear();
            foreach (var error in result.Errors)
            {
                messageStore.Add(editContext.Field(error.Field), error.Message);
            }
            editContext.NotifyValidationStateChanged();
        }
    }
    catch (HttpRequestException)
    {
        serverErrors.Add("Błąd połączenia z serwerem. Spróbuj ponownie.");
    }
    finally
    {
        isSubmitting = false;
    }
}
```

## Moment walidacji w Blazor

| Moment | Implementacja |
| --- | --- |
| Submit | `OnValidSubmit` / `OnSubmit` + ręczne `EditContext.Validate()` |
| Blur (opuszczenie pola) | `EditContext.OnFieldChanged` + custom logic lub `<ObjectGraphDataAnnotationsValidator />` |
| On-change | Domyślne w `@bind-Value` — walidacja przy każdej zmianie wartości |
| Mieszany (blur → on-change) | Custom `EditContext` event handling — `NotifyFieldChanged` + flaga „pole było odwiedzone" |

## Antywzorce Blazor (formularze)

| Antywzorzec | Problem | Rozwiązanie |
| --- | --- | --- |
| `<form>` zamiast `<EditForm>` | Brak integracji z `EditContext`, walidacją, binding | Zawsze `<EditForm>` |
| Brak `FormName` w SSR | Static SSR nie identyfikuje formularza | Dodaj `FormName="unique-name"` |
| Walidacja w submit handler | Duplikacja logiki walidacji | Użyj `DataAnnotationsValidator` / `FluentValidation` |
| Ręczny `@onchange` zamiast `@bind-Value` | Brak integracji z `EditContext` | Użyj `@bind-Value` na komponentach `Input*` |
| Mutowanie modelu poza formularzem | `EditContext` nie wie o zmianach | Stan formularza wyłącznie przez `EditForm`/binding |
| Brak `disabled` na submit button | Podwójne wysłanie formularza | Flaga `isSubmitting` + `disabled="@isSubmitting"` |
