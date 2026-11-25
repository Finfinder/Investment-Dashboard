---
name: react-styling-and-css
description: "Organizuje stylowanie React: CSS Modules, utility CSS, design tokens, theming, specificity, class composition i SSR-safe style."
---
slug: react-styling-and-css

# React: style, theming i organizacja CSS

## Short description

Organizuj style React tak, aby byly przewidywalne, lokalne, latwe do override i bezpieczne dla SSR. Ten skill obejmuje CSS Modules, utility CSS, design tokens, theming, class composition, specificity i typowe pulapki stylowania komponentow.

## Use cases / When to use

- Wybierasz sposob stylowania komponentu lub feature'u.
- Porzadkujesz CSS Modules, Tailwind, CSS-in-JS, global CSS albo tokeny.
- Projektujesz theming, dark mode, density, responsive behavior lub warianty komponentow.
- Debugujesz konflikt klas, przeciek stylow, zbyt wysoka specificity albo hydration mismatch klas.
- Recenzujesz PR zmieniajacy system stylowania, design tokens albo strukture CSS.

## When NOT to use

- Problem dotyczy semantyki komponentu i publicznych props; uzyj `react-component-design`.
- Problem dotyczy dostepnosci wizualnej lub ARIA; uzyj `react-accessibility`.
- Problem dotyczy render performance niezaleznie od CSS; uzyj `react-performance`.
- Problem dotyczy konfiguracji ogolnego ESLint/Prettier; uzyj `ts-styling-and-linting`.

## Key rules and concrete guidance

- Uzyj lokalnej konwencji repo. Nie mieszaj CSS Modules, Tailwind, styled-components i inline styles bez powodu.
- Style komponentu powinny byc lokalne. Global CSS zostaw dla resetu, fontow, tokenow, layout root i integracji z bibliotekami.
- Publiczne warianty stylu modeluj przez props albo data attributes. Unikaj wymagania, aby konsument znal strukture DOM komponentu.

```tsx
type BadgeProps = {
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
  children: React.ReactNode;
};

export function Badge({ tone = 'neutral', children }: BadgeProps) {
  return <span data-tone={tone}>{children}</span>;
}
```

- Tokeny design systemu trzymaj w CSS variables albo centralnej mapie. Nie hardcoduj tych samych kolorow i spacingow w wielu komponentach.

```css
:root {
  --color-surface: #ffffff;
  --color-text: #111827;
  --space-2: 0.5rem;
}

[data-theme='dark'] {
  --color-surface: #111827;
  --color-text: #f9fafb;
}
```

- Theming powinien dzialac przez atrybut, klase root albo provider, nie przez reczne przepisywanie klas w kazdym komponencie.
- Uzywaj `className` jako escape hatch dla layoutu zewnetrznego, ale nie wymagaj go do naprawiania wewnetrznego wygladu.
- Dla skladania klas uzywaj helpera (`clsx`, `classnames`, lokalny `cn`) zgodnie z repo.

```tsx
import clsx from 'clsx';

function Card({ selected, className, children }: CardProps) {
  return <section className={clsx('card', selected && 'cardSelected', className)}>{children}</section>;
}
```

- CSS Modules sa dobre dla lokalnych klas i unikniecia kolizji nazw. Eksportuj klasy przez import `styles` i unikaj stringow globalnych.
- Utility CSS jest dobre dla layoutu i szybkich kompozycji, ale nie powinno ukrywac zlozonego stanu komponentu w dlugim lancuchu klas.
- CSS-in-JS wymaga kontroli SSR, cache i insertion order. Bez tego moze powodowac flicker albo hydration mismatch.
- Inline styles stosuj dla dynamicznych wartosci liczbowych, CSS variables albo integracji z canvas/SVG, nie jako domyslny system stylowania.

```tsx
<div style={{ '--progress': `${progress}%` } as React.CSSProperties} />
```

- Preferuj logical properties (`margin-inline`, `padding-block`) dla layoutow wspierajacych RTL.
- Specificity trzymaj nisko. Unikaj `!important`, selektorow po id i zagniezdzen zaleznych od calej struktury strony.
- Responsywnosc projektuj przez container queries, CSS grid/flex i tokeny, a nie przez wiele warunkow JS.
- Stany interakcji (`hover`, `focus-visible`, `disabled`, `aria-selected`, `data-state`) powinny byc widoczne w CSS i zgodne z a11y.
- Dla animacji respektuj `prefers-reduced-motion`.
- Przy SSR upewnij sie, ze nazwy klas i theme initial state sa takie same na serwerze i w pierwszym renderze klienta.

## Typical mistakes / anti-patterns to avoid

- Globalne klasy komponentow, ktore koliduja miedzy feature'ami.
- Inline style jako zamiennik systemu klas i tokenow.
- `!important` zamiast naprawy specificity lub architektury CSS.
- Hardcodowane kolory poza tokenami.
- Komponent, ktorego poprawne uzycie wymaga znajomosci wewnetrznej struktury DOM.
- Zmiana theme po mount, ktora powoduje flash albo hydration mismatch.
- Dlugie lancuchy utility classes bez nazwania wariantu.
- Style focus usuniete bez dostepnego zamiennika.
- CSS-in-JS bez skonfigurowanego SSR cache i order.

## Checklist for PR reviews

- [ ] Stylowanie jest zgodne z dominujaca konwencja repo.
- [ ] Tokeny kolorow, spacingu i typografii nie sa duplikowane lokalnie.
- [ ] Publiczne warianty sa modelowane przez props/data attributes, nie przez ukryte klasy.
- [ ] Specificity pozostaje niska i nie dodano `!important` bez uzasadnienia.
- [ ] `className` jest escape hatch, a nie wymaganym mechanizmem poprawnego wygladu.
- [ ] Dark mode/theme nie powoduje flash ani hydration mismatch.
- [ ] Stany focus/hover/disabled/error sa widoczne i dostepne.
- [ ] Animacje respektuja `prefers-reduced-motion`.
- [ ] CSS nie wymusza zbednych reflow w czestych interakcjach.

## Example snippets

```tsx
import styles from './Alert.module.css';
import { clsx } from 'clsx';

type AlertProps = {
  tone?: 'info' | 'success' | 'error';
  className?: string;
  children: React.ReactNode;
};

export function Alert({ tone = 'info', className, children }: AlertProps) {
  return <div className={clsx(styles.root, styles[tone], className)}>{children}</div>;
}
```

```css
.root {
  color: var(--color-text);
  background: var(--color-surface);
  padding: var(--space-2);
}

.root:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}
```

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
  }
}
```

## Trigger description

React styling: CSS Modules, utility CSS, tokeny, theming, specificity i SSR styles.
