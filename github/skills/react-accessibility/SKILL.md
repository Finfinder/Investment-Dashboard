---
name: react-accessibility
description: "Buduje dostepne komponenty React przez JSX semantics, accessible props, useId, refs/focus, portals/dialogs i RTL a11y queries."
---
slug: react-accessibility

# React: dostepnosc i wzorce a11y

## Short description

Buduj komponenty React dostepne z klawiatury, czytnikow ekranu i roznych preferencji uzytkownika. Ten skill obejmuje semantyke JSX, accessible props, `useId`, refs/focus, portals/dialogs, formularze i RTL a11y queries.

## Use cases / When to use

- Tworzysz interaktywny komponent: dialog, menu, tabs, combobox, tooltip, accordion, toast.
- Poprawiasz formularze, walidacje, komunikaty bledow i focus po submit.
- Recenzujesz semantyke HTML, role, labels, keyboard navigation albo focus trap.
- Debugujesz problem z czytnikiem ekranu, tab order albo aria attributes.
- Dodajesz testy a11y do komponentow React.
- Projektujesz zachowanie dla reduced motion, contrast i zoom.

## When NOT to use

- Problem dotyczy ogolnych standardow WCAG poza React; uzyj `ensuring-accessibility`.
- Problem dotyczy pelnego audytu WCAG, polityk kontrastu, standardow cross-framework albo wymagan organizacyjnych a11y; uzyj `ensuring-accessibility`.
- Problem dotyczy API komponentu bez aspektu a11y; uzyj `react-component-design`.
- Problem dotyczy testow RTL/MSW ogolnie; uzyj `react-testing`.
- Problem dotyczy stylowania tokenow bez a11y; uzyj `react-styling-and-css`.

## Key rules and concrete guidance

- Zacznij od semantycznego HTML. `button`, `a`, `label`, `fieldset`, `legend`, `input`, `select`, `dialog` sa lepsze niz `div role=...`, gdy natywny element pasuje.
- Element klikalny musi byc dostepny z klawiatury. Jesli cos zachowuje sie jak button, uzyj `<button type="button">`.

```tsx
// Dobrze
<button type="button" onClick={onClose}>Close</button>

// Slabo
<div onClick={onClose}>Close</div>
```

- Kazde pole formularza musi miec dostepna nazwe: `label`, `aria-label` albo `aria-labelledby`. Preferuj widoczny label.
- W komponentach wielokrotnego uzycia generuj stabilne relacje `id`/`htmlFor`/`aria-describedby` przez `React.useId`, gdy konsument nie przekazuje `id`.

```tsx
<label htmlFor={id}>Email</label>
<input id={id} name="email" type="email" autoComplete="email" />
```

- Komunikaty bledow formularza lacz przez `aria-describedby` i oznacz pole `aria-invalid`.

```tsx
<input aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} />
{error ? <p id={`${id}-error`} role="alert">{error}</p> : null}
```

- ARIA nie naprawia zlej semantyki. Uzywaj jej do doprecyzowania stanu, relacji i wzorcow, nie jako zamiennika HTML.
- `aria-hidden="true"` ukrywa element przed assistive tech. Nie stosuj go na elemencie focusowalnym ani rodzicu aktywnego elementu.
- Focus management jest obowiazkowy dla modali, drawerow, menu, popoverow i route changes.
- Po otwarciu dialogu przenies focus do dialogu lub pierwszego sensownego elementu. Po zamknieciu wroc focus do triggera.
- Dla focus management w React uzywaj refow jawnie: trigger ref do powrotu focusu, content ref do poczatkowego focusu i kontrolowany cleanup po unmount.
- Modal renderowany przez portal powinien miec `role="dialog"`, `aria-modal="true"`, label (`aria-label` lub `aria-labelledby`), focus trap, obsluge Escape i powrot focusu do triggera.
- Dla komponentow z klawiatura stosuj znane wzorce WAI-ARIA: tabs, menu, listbox, combobox, accordion. Nie wymyslaj wlasnych skrotow.
- Roving tabIndex jest odpowiedni dla grup, w ktorych jeden element jest aktywny, np. tabs lub toolbar.

```tsx
<button role="tab" tabIndex={selected ? 0 : -1} aria-selected={selected}>
  {label}
</button>
```

- Live regions (`role="status"`, `role="alert"`, `aria-live`) stosuj dla zmian, ktore musza byc ogloszone bez przenoszenia focusu.
- Nie uzywaj `role="alert"` dla zwyklych informacji. Alert przerywa uzytkownikowi.
- Obrazy dekoracyjne powinny miec `alt=""`. Obrazy informacyjne potrzebuja konkretnego alt opisujacego znaczenie, nie wyglad.
- Link musi prowadzic do miejsca. Button wykonuje akcje. Nie mieszaj tych semantyk.
- Kolor nie moze byc jedynym nosnikiem informacji. Dodaj tekst, ikone z label, pattern albo status.
- Zachowaj widoczny focus. Uzywaj `:focus-visible`, nie usuwaj outline bez zamiennika.
- Respektuj `prefers-reduced-motion` i unikaj animacji wywolujacych chorobe lokomocyjna.
- Testuj klawiatura: Tab, Shift+Tab, Enter, Space, Escape i strzalki zgodnie ze wzorcem.
- W testach React Testing Library preferuj a11y queries: `getByRole` z `name`, `getByLabelText`, `findByRole` dla komunikatow dynamicznych i `userEvent.setup()` dla klawiatury.

## Typical mistakes / anti-patterns to avoid

- `div` lub `span` jako button bez roli, tabIndex i obslugi klawiatury.
- Ikona bez dostepnej nazwy w przycisku.
- Placeholder jako jedyny label pola formularza.
- `aria-label` niezgodny z widocznym tekstem albo dublujacy nazwe.
- Focus znika po zamknieciu modala albo zmianie route.
- Modal bez focus trap i bez `aria-modal`.
- Elementy ukryte wizualnie pozostaja focusowalne.
- `role="alert"` naduzywany dla kazdego toastu.
- Usuwanie outline w CSS.
- Kolor jako jedyny sygnal bledu lub statusu.

## Checklist for PR reviews

- [ ] Uzyto natywnych elementow HTML tam, gdzie pasuja.
- [ ] Interaktywne elementy sa osiagalne i obslugiwane klawiatura.
- [ ] Kontrolki formularzy maja label i powiazane komunikaty bledow.
- [ ] Modal/popover/menu zarzadza focusem i powrotem focusu.
- [ ] Role i aria attributes odpowiadaja rzeczywistemu zachowaniu.
- [ ] Przyciski ikon maja dostepna nazwe.
- [ ] Stany focus, disabled, selected, expanded i invalid sa widoczne i oglaszane.
- [ ] Live regions sa uzyte tylko dla waznych zmian dynamicznych.
- [ ] UI nie polega wylacznie na kolorze.
- [ ] Dodano test klawiatury lub a11y dla zlozonego komponentu.

## Example snippets

```tsx
function IconButton({ label, children, onClick }: IconButtonProps) {
  return (
    <button type="button" aria-label={label} onClick={onClick}>
      {children}
    </button>
  );
}
```

```tsx
function Field({ id, label, error }: FieldProps) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} />
      {error ? <p id={errorId} role="alert">{error}</p> : null}
    </div>
  );
}
```

```tsx
function StatusMessage({ saved }: { saved: boolean }) {
  return <p role="status">{saved ? 'Saved' : 'Saving...'}</p>;
}
```

## Trigger description

React a11y: JSX semantics, accessible props, useId, refs/focus, portals/dialogs, formularze i RTL a11y queries.
