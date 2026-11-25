Token do wklejenia w promptach: {{preventing-common-ts-errors-checklist}}

1. `tsconfig.json`: `strict=true` — Jak naprawić: włącz `strict` lub dopasuj `tsconfig`.
2. Nie używaj `any` — Jak naprawić: użyj `unknown` i dodaj guardy/konwersję.
3. Wszystkie publiczne funkcje mają jawny typ zwracany — Jak naprawić: dopisz `: Type` lub `: Promise<Type>`.
4. Nie używaj `as any` — Jak naprawić: usuń asercję, utwórz konwerter/guard.
5. Unikaj `!` (non-null assertion) — Jak naprawić: dodaj walidację/null-check.
6. Awaituj promisy lub obsłuż błędy — Reguła: `@typescript-eslint/no-floating-promises` — Jak naprawić: `await` lub `.catch()` lub `void`+komentarz.
7. Waliduj wejścia zewnętrzne (runtime checks) — Jak naprawić: dodaj `zod`/`io-ts`/prostą walidację oraz limit długości.
8. Blokuj/napraw `unsafe-regex` — Reguły: `detect-unsafe-regex/detect-unsafe-regex`, `regexp/no-unsafe-regex` — Jak naprawić: escapuj wejście i ogranicz kwantyfikatory.
9. Preferuj `replaceAll` dla literalnej zamiany — Reguła: `unicorn/prefer-string-replace-all` — Jak naprawić: `str.replaceAll('a','b')` lub `split/join` fallback.
10. Accessibility: używaj semantycznych elementów lub zapewnij `aria-*` i keyboard support — Reguły: `jsx-a11y/*` — Jak naprawić: zamień `div role="button"` na `<button>` i dodaj `aria-selected` jeśli wymagane.
11. Nie generuj zagnieżdżonych ternary — Reguła: `sonarjs/no-nested-ternary` — Jak naprawić: rozbij na funkcję pomocniczą.
12. Przed PR uruchom lokalnie: `npm run lint -- --max-warnings=0` i `npm run typecheck` — Jak naprawić: napraw błędy lint/tsc lub dodaj `// TODO: human review`.
