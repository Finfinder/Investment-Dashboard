---
name: react-component-design
description: "Projektuje API komponentow React: props, refy, controlled/uncontrolled, kompozycje i stabilne kontrakty wielokrotnego uzycia."
---
slug: react-component-design

# React: projektowanie komponentow i stabilne API

## Short description

Projektuj komponenty React tak, aby ich API bylo male, jawne i stabilne w czasie. Ten skill prowadzi przez kontrakty props, kompozycje, refy, tryby controlled/uncontrolled oraz review zmian w publicznej powierzchni komponentu.

## Use cases / When to use

- Tworzysz komponent aplikacyjny, komponent biblioteczny albo element design systemu.
- Refaktoryzujesz komponent z wieloma flagami, ukrytym stanem lub niejasnym API.
- Projektujesz propsy, eventy, sloty, refy albo warianty wizualne.
- Ustalasz, czy komponent ma byc controlled, uncontrolled czy hybrydowy.
- Recenzujesz PR zmieniajacy publiczne API komponentow.
- Przygotowujesz komponent do uzycia w wielu feature'ach lub produktach.

## When NOT to use

- Problem dotyczy glownie hookow i efektow; uzyj `react-hooks-best-practices`.
- Problem dotyczy wydajnosci renderowania; uzyj `react-performance`.
- Problem dotyczy stylowania, tokenow lub organizacji CSS; uzyj `react-styling-and-css`.
- Problem dotyczy testow komponentow; uzyj `react-testing`.
- Komponent jest jednorazowym prototypem i nie tworzy kontraktu dla innych zespolow.

## Key rules and concrete guidance

- Zacznij od kontraktu uzycia. Najpierw zapisz przyklad JSX, ktory chcialbys zobaczyc w produkcie, potem dopiero implementuj.
- Prop ma reprezentowac intencje uzytkownika komponentu, nie detal implementacji. `variant="danger"` jest lepsze niz `red border shadow` jako zestaw flag.
- Uzywaj TypeScript do publicznego kontraktu. Eksportuj typ props tylko wtedy, gdy konsumenci maja go skladac lub rozszerzac.

```tsx
type ButtonVariant = 'primary' | 'secondary' | 'danger';

export type ButtonProps = {
  children: React.ReactNode;
  variant?: ButtonVariant;
  disabled?: boolean;
  onPress?: () => void;
};

export function Button({ children, variant = 'primary', disabled = false, onPress }: ButtonProps) {
  return (
    <button data-variant={variant} disabled={disabled} onClick={onPress}>
      {children}
    </button>
  );
}
```

- Preferuj `children`, nazwane sloty i kompozycje zamiast duzej liczby boolean props.
- Nie modeluj wariantow jako niezaleznych flag, jesli sa wzajemnie wykluczajace sie. Uzyj union albo jednego prop `variant`.
- Event callbacki powinny zwracac wartosc domenowa, gdy to mozliwe. Nie przeciekaj eventu DOM, jesli konsument potrzebuje tylko `value`.

```tsx
type SearchInputProps = {
  value: string;
  onValueChange: (value: string) => void;
};

function SearchInput({ value, onValueChange }: SearchInputProps) {
  return <input value={value} onChange={event => onValueChange(event.currentTarget.value)} />;
}
```

- Tryb controlled: rodzic jest zrodlem prawdy, komponent dostaje `value` i emituje `onChange`.
- Tryb uncontrolled: komponent trzyma stan lokalnie, rodzic moze ustawic `defaultValue`.
- Tryb hybrydowy wymaga jawnego rozroznienia i testu. Nie przelaczaj trybu w trakcie zycia komponentu bez ostrzezenia.
- Dla formularzy trzymaj nazwy spokrewnione z natywnymi inputami: `value`, `defaultValue`, `checked`, `defaultChecked`, `onChange`.
- W kodzie React 19-first trzymaj sie lokalnej konwencji dla `ref` jako zwyklego prop. Uzywaj `forwardRef`, gdy repo wspiera React 18, tworzysz biblioteke albo kod ma dzialac cross-version.
- Uzywaj ref tylko wtedy, gdy komponent jest semantycznym wrapperem na element DOM, ktory konsument musi focusowac albo mierzyc.
- Wariant React 18 / cross-version / library-compatible z `forwardRef`:

```tsx
export type TextFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, id, ...inputProps }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;

    return (
      <label htmlFor={inputId}>
        <span>{label}</span>
        <input id={inputId} ref={ref} {...inputProps} />
      </label>
    );
  }
);
TextField.displayName = 'TextField';
```

- React 19-first w lokalnym kodzie aplikacji: dodaj `ref?: React.Ref<HTMLInputElement>` do props i destrukturyzuj `ref` jak zwykly prop; nie owijaj komponentu w `forwardRef`, jesli nie potrzebujesz kompatybilnosci React 18 albo bibliotecznej.

- Nie wystawiaj imperatywnego API przez ref, jesli wystarczy prop. Imperative handle zostaw dla focus, scroll, pomiaru lub integracji z nie-Reactowym widgetem.
- Stabilnosc API ma pierwszenstwo przed wygoda implementacji. Zmieniaj implementacje pod spodem bez zmiany props, jesli to mozliwe.
- Deprecate zamiast usuwac. Dodaj nowy prop, obsluz stary przez okres migracji i oznacz go w typie lub dokumentacji.
- Jesli komponent ma wiele wariantow wizualnych, mapuj je w jednym miejscu. Nie rozrzucaj warunkow po JSX.
- Dla list wymagaj stabilnego `key`. Nie generuj kluczy losowo w renderze.
- Domyslne wartosci trzymaj blisko destrukturyzacji props albo w stalej konfiguracyjnej.
- Nie kopiuj props do state, chyba ze implementujesz uncontrolled state lub masz jawny mechanizm synchronizacji.
- Komponenty wysokopoziomowe moga skladac komponenty niskopoziomowe, ale nie powinny wymagac znajomosci ich wewnetrznych klas i struktury DOM.

## Typical mistakes / anti-patterns to avoid

- Komponent z kilkunastoma boolean props, ktore tworza niejawna macierz wariantow.
- `onChange(event)` jako publiczne API, gdy konsument potrzebuje tylko wartosci.
- Mieszanie controlled i uncontrolled bez ostrzezen, testow i jasnego kontraktu.
- `props as any`, aby przepchnac niezgodnosc typow do komponentu bazowego.
- Losowe `key={Math.random()}` albo `key={index}` dla list zmieniajacych kolejnosc.
- Globalny context jako ukryty input komponentu, ktory utrudnia testy i reuse.
- Ref forwardowany do innego elementu niz dokumentuje nazwa komponentu.
- Warianty wygladu zalezne od przypadkowych kombinacji klas rodzica.
- Breaking change w propsach bez migracji, fallbacku albo changeloga.

## Checklist for PR reviews

- [ ] Publiczny typ props jest maly, czytelny i nie zawiera niepotrzebnych detali implementacji.
- [ ] Warianty sa modelowane przez union lub `variant`, a nie przez konfliktujace flagi.
- [ ] Controlled/uncontrolled state ma jedno zrodlo prawdy i testy dla glownego przeplywu.
- [ ] Callbacki przekazuja wartosci na odpowiednim poziomie abstrakcji.
- [ ] `forwardRef` ma poprawny typ, stabilny target i `displayName`.
- [ ] Klucze list sa stabilne i pochodza z danych.
- [ ] Komponent nie kopiuje props do state bez uzasadnienia.
- [ ] API jest backward compatible albo ma opis migracji.
- [ ] Komponent ma podstawowe testy renderowania, interakcji i a11y.

## Example snippets

Szkice `Dialog` i `Tabs` ponizej pokazuja API komponentu, nie pelny wzorzec a11y. Przy implementacji focus trap, powrot focusu, obsluge Escape/strzalek i komplet relacji ARIA sprawdz `react-accessibility`.

```tsx
type DialogProps = {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onOpenChange: (open: boolean) => void;
};

export function Dialog({ open, title, children, onOpenChange }: DialogProps) {
  const titleId = React.useId();

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
      <h2 id={titleId}>{title}</h2>
      <button type="button" onClick={() => onOpenChange(false)}>Close</button>
      {children}
    </div>
  );
}
```

```tsx
type FieldState =
  | { status: 'idle' }
  | { status: 'invalid'; message: string }
  | { status: 'valid' };

type FieldProps = {
  state?: FieldState;
};
```

```tsx
type TabsProps = {
  value: string;
  items: ReadonlyArray<{ id: string; label: string }>;
  onValueChange: (id: string) => void;
};

export function Tabs({ value, items, onValueChange }: TabsProps) {
  return (
    <div role="tablist">
      {items.map(item => (
        <button
          key={item.id}
          id={`tab-${item.id}`}
          role="tab"
          aria-controls={`panel-${item.id}`}
          aria-selected={item.id === value}
          tabIndex={item.id === value ? 0 : -1}
          onClick={() => onValueChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
```

## Trigger description

Projektowanie komponentow React: props, refy, controlled/uncontrolled i stabilne API.
