---
name: preventing-common-ts-errors
description: "Zapobieganie typowym błędom TypeScript/React/Node — lint, a11y, regex, promisy, złożoność, typowanie."
---

# Zapobieganie typowym błędom TypeScript/React/Node

Składnikowy skill dla generatorów kodu i autorów promptów. Zapewnia konsystentną jakość kodu TS/TSX poprzez zestaw reguł zapobiegających powtarzalnym błędom.

## Kiedy używać

- Generowanie kodu TypeScript / React / Node.js
- Review wygenerowanego kodu pod kątem typowych błędów
- Przygotowywanie promptów i szablonów kodu
- Aktualizacja konfiguracji lintowania i CI

## Kategoria

- **Język**: TypeScript / TSX / Node.js
- **Pliki**: `.ts`, `.tsx`, backend Node/TS
- **Tematy**: lint/typecheck, a11y, regex safety, promise handling, złożoność, typowanie

## Zasady generacyjne

<principles>

<strings>
Preferuj `String.prototype.replaceAll()` dla literalnych zamian. Reguła ESLint: `unicorn/prefer-string-replace-all`. Jeśli docelowe środowisko tego nie wspiera, generuj fallback `split().join()` z komentarzem.
</strings>

<regex-safety>
Nie generuj nieograniczonych, złożonych kwantyfikatorów. Sprawdź wzorzec przy `eslint-plugin-detect-unsafe-regex` lub `eslint-plugin-regexp` (`regexp/no-unsafe-regex`). Dla wzorców z wejścia użytkownika używaj `escapeRegExp()` i ograniczaj długość wejścia.
</regex-safety>

<promises>
Zawsze `await` lub jawnie obsłuż błędy. Reguły: `@typescript-eslint/no-floating-promises`, `@typescript-eslint/no-misused-promises`. Dozwolone wzorce: `void promise` (z komentarzem) lub `promise.catch(...)`.
</promises>

<negations>
Unikaj złożonych negacji w głównych warunkach. Preferuj guard clauses (early return) lub nazwane booleany.
</negations>

<ternary>
Nie zagnieżdżaj operatorów `?:`. Przy złożonej logice wyciągnij do funkcji pomocniczej. Reguła: `sonarjs/no-nested-ternary`.
</ternary>

<complexity>
Jeśli fragment przekracza threshold (np. cognitive complexity > 6), wyciągnij logikę do funkcji pomocniczej i wygeneruj prosty test.
</complexity>

<accessibility>
Preferuj semantyczne elementy (`<button>`, `<a>`). Jeśli używasz `role`, zapewnij wymagane `aria-*`, `tabIndex` i handlery klawiaturowe. Reguły: `jsx-a11y/no-noninteractive-element-to-interactive-role`, `jsx-a11y/interactive-supports-focus`.
</accessibility>

<react-types>
Używaj konkretnych typów eventów (`React.ChangeEvent<HTMLInputElement>`), nie ogólnych `FormEvent`.
</react-types>

<props-immutability>
Oznaczaj `props` jako `readonly` lub `Readonly<...>`; preferuj `@typescript-eslint/prefer-readonly`.
</props-immutability>

<security>
Nie używaj `eval`, `new Function()` ani `new RegExp(userInput)` bez escapowania. Reguły: `security/detect-non-literal-regexp`, `security/detect-object-injection`.
</security>

</principles>

Przykłady (before / after) — krótkie
```ts
// 1) replaceAll
const out = text.replace(/foo/g, 'bar');
// ->
const out = text.replaceAll('foo', 'bar');
```

```ts
// 2) negated condition
if (!(user && user.isActive)) { return; }
// ->
if (!user || !user.isActive) { return; }
```

```ts
// 3) nested ternary
const s = a ? (b ? 'x' : 'y') : 'z';
// ->
function compute(a,b){ if(a) return b ? 'x' : 'y'; return 'z'; }
const s = compute(a,b);
```

```ts
// 4) unsafe regex -> limit quantifier
const re = /(a+)+b/; // potencjalny backtracking
// ->
const re = /^(?:a{1,100})+b$/; // ograniczono zakres
```

```tsx
// 5) role misuse
<div role="button" onClick={toggle}>Toggle</div>
// ->
<button type="button" onClick={toggle}>Toggle</button>
```

```ts
// 6) reduce cognitive complexity
function proc(items){ for(const i of items){ if(cond1(i)){ doA(i); } else { if(cond2(i)){ doB(i); } else { doC(i); } } } }
// ->
function handle(i){ if(cond1(i)) return doA(i); if(cond2(i)) return doB(i); return doC(i); }
function proc(items){ for(const i of items) handle(i); }
```

Kiedy eskalować
- Jeśli generator nie może bezpiecznie naprawić regexu, promisa lub złożonej logiki — dodaj `// TODO: human review — <krótki powód>` i eskaluj.
- Jeśli zmiana wymaga zmiany API (breaking) — zawsze eskaluj.

## Proces

```text
Postęp stosowania:
- [ ] Krok 1: Sprawdź, czy istniejący kod łamie którąś z zasad
- [ ] Krok 2: Zastosuj odpowiednią regułę ESLint / poprawkę ręczną
- [ ] Krok 3: Uruchom `eslint --fix` i `tsc --noEmit`
- [ ] Krok 4: Dodaj `// TODO: human review — <powód>` tam, gdzie nie możesz bezpiecznie naprawić
- [ ] Krok 5: Zweryfikuj zmiany w CI (lint + typecheck)
```

## Guard raile

- **Zawsze** stosuj `replaceAll` zamiast `replace` z regex dla literalnych zamian.
- **Zawsze** escapuj wejście użytkownika w regexach (`escapeRegExp`).
- **Zawsze** awaituj promisy lub obsługuj błędy jawne — nigdy nie pozostawiaj pływających promisów.
- **Zawsze** używaj semantycznych elementów HTML zamiast `div role="..."`.
- **Nigdy** nie używaj `eval()` ani `new Function()` z danymi zewnętrznego pochodzenia.
- **Nigdy** nie twórz `new RegExp(userInput)` bez escapowania i limitu długości.
- **Nie zagnieżdżaj** operatorów trójargumentowych — wyciągnij do funkcji.
- **Nie ignoruj** wyników `tsc --noEmit` ani błędów ESLint kategorii `error`.

## Eskalacja

Jeśli generator nie może bezpiecznie naprawić regexu, promisa lub złożonej logiki — dodaj `// TODO: human review — <krótki powód>` i eskaluj do człowieka.

Jeśli zmiana wymaga zmiany API (breaking) — zawsze eskaluj.

## Checklist

Token do wklejenia w promptach: `{{preventing-common-ts-errors-checklist}}`

1. `tsconfig.json`: `strict=true` — włącz `strict` lub dopasuj `tsconfig`.
2. Nie używaj `any` — użyj `unknown` i dodaj guardy/konwersję.
3. Wszystkie publiczne funkcje mają jawny typ zwracany — dopisz `: Type` lub `: Promise<Type>`.
4. Nie używaj `as any` — usuń asercję, utwórz konwerter/guard.
5. Unikaj `!` (non-null assertion) — dodaj walidację/null-check.
6. Awaituj promisy lub obsłuż błędy — reguła: `@typescript-eslint/no-floating-promises`.
7. Waliduj wejścia zewnętrzne (runtime checks) — dodaj `zod`/`io-ts`/prostą walidację + limit długości.
8. Blokuj/napraw `unsafe-regex` — reguły: `detect-unsafe-regex`, `regexp/no-unsafe-regex`.
9. Preferuj `replaceAll` dla literalnej zamiany — reguła: `unicorn/prefer-string-replace-all`.
10. Accessibility: semantyczne elementy lub `aria-*` + keyboard support — reguły: `jsx-a11y/*`.
11. Nie generuj zagnieżdżonych ternary — reguła: `sonarjs/no-nested-ternary`.
12. Przed PR uruchom lokalnie: `npm run lint -- --max-warnings=0` i `npm run typecheck`.

## Konfiguracja ESLint (rekomendowana)

```json
{
  "plugins": [
    "@typescript-eslint",
    "jsx-a11y",
    "unicorn",
    "sonarjs",
    "detect-unsafe-regex",
    "regexp",
    "security",
    "react",
    "react-hooks"
  ],
  "extends": [
    "plugin:@typescript-eslint/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:unicorn/recommended",
    "plugin:sonarjs/recommended",
    "plugin:security/recommended"
  ],
  "rules": {
    "unicorn/prefer-string-replace-all": "error",
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-misused-promises": "error",
    "detect-unsafe-regex/detect-unsafe-regex": "error",
    "regexp/no-unsafe-regex": "error",
    "jsx-a11y/no-noninteractive-element-to-interactive-role": "error",
    "jsx-a11y/interactive-supports-focus": "error",
    "sonarjs/no-nested-ternary": "error",
    "sonarjs/cognitive-complexity": ["warn", { "max": 6 }],
    "@typescript-eslint/prefer-readonly": "error",
    "security/detect-non-literal-regexp": "error",
    "security/detect-object-injection": "error"
  }
}
```

## CI — snippet GitHub Actions

```yaml
name: Lint & Typecheck
on: [push, pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint -- --ext .ts,.tsx --max-warnings=0
      - run: npx tsc --noEmit
```

## Przykłady (before / after)

```ts
// 1) replaceAll
const out = text.replace(/foo/g, 'bar');
// ->
const out = text.replaceAll('foo', 'bar');
```

```ts
// 2) negated condition
if (!(user && user.isActive)) { return; }
// ->
if (!user || !user.isActive) { return; }
```

```ts
// 3) nested ternary
const s = a ? (b ? 'x' : 'y') : 'z';
// ->
function compute(a,b){ if(a) return b ? 'x' : 'y'; return 'z'; }
const s = compute(a,b);
```

```ts
// 4) unsafe regex -> limit quantifier
const re = /(a+)+b/; // potencjalny backtracking
// ->
const re = /^(?:a{1,100})+b$/; // ograniczono zakres
```

```tsx
// 5) role misuse
<div role="button" onClick={toggle}>Toggle</div>
// ->
<button type="button" onClick={toggle}>Toggle</button>
```

```ts
// 6) reduce cognitive complexity
function proc(items){ for(const i of items){ if(cond1(i)){ doA(i); } else { if(cond2(i)){ doB(i); } else { doC(i); } } } }
// ->
function handle(i){ if(cond1(i)) return doA(i); if(cond2(i)) return doB(i); return doC(i); }
function proc(items){ for(const i of items) handle(i); }
```

## Jak używać

- Wstaw `{{preventing-common-ts-errors-checklist}}` do promptu wywołującego generator.
- Jeśli generator potrafi uruchomić eslint/tsc, wykonaj `eslint --fix`, `tsc --noEmit` i zaaplikuj poprawki automatycznie.

## Materiały referencyjne

- `./references/eslint-config.md` — szczegółowa konfiguracja pluginów i reguł ESLint
- `./references/ci-workflow.md` — konfiguracja GitHub Actions dla lint + typecheck
- `./references/checklist-usage.md` — jak używać tokena `{{preventing-common-ts-errors-checklist}}` w promptach

## Powiązane skille

- `code-reviewing` — przegląd kodu z walidacją jakości i bezpieczeństwa
- `implementing-frontend` — komponenty React, wzorce stylowania, organizacja modułów
- `implementing-backend` — backend Node/TS, API, middleware, obsługa błędów
- `react-testing` — testowanie komponentów React, mocki API, custom hooks
- `typescript-best-practices` — zaawansowane praktyki TypeScript, strict typing, utility types
- `react-security-and-deps` — bezpieczeństwo React, CSP, zarządzanie zależnościami
