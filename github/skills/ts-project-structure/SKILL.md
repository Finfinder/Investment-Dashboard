---
name: ts-project-structure
description: "Projektuje strukturę projektów TypeScript: granice app/lib/packages, path aliases, project references, tsconfig layering, public API i monorepo."
---

# Struktura Projektu TypeScript

Prowadzi organizację projektów TypeScript tak, aby granice modułów, build, public API i konfiguracja były czytelne oraz skalowalne. Dobra struktura skraca feedback loop, ogranicza zależności cykliczne i ułatwia publikowanie albo współdzielenie kodu.

## Kiedy używać

- Projektujesz lub refaktoryzujesz strukturę aplikacji, biblioteki, pakietu albo monorepo TS/JS.
- Dodajesz path aliases, project references, incremental builds albo layered `tsconfig`.
- Porządkujesz `src`, `app`, `lib`, `packages`, `internal`, generated files i build artifacts.
- Definiujesz public API surface, declaration files, `exports`/`imports` w `package.json`.
- Diagnozujesz wolny typecheck, cykliczne zależności, głębokie importy albo niekontrolowane barrel files.

## Kiedy nie używać

- Zadanie dotyczy modelowania typów w pojedynczym module; użyj `typescript-best-practices`.
- Zadanie dotyczy import ordering i reguł ESLint; użyj `ts-styling-and-linting`.
- Zadanie dotyczy ESM/CJS semantyki w kodzie, nie struktury pakietu; użyj `javascript-modern-patterns`.
- Zadanie dotyczy testowania; użyj `testing-ts-js`.

## Zasada nadrzędna

Struktura projektu jest kontraktem zespołowym. Foldery, aliasy, barrel files i package exports powinny mówić, co jest publiczne, co jest wewnętrzne i w którą stronę mogą płynąć zależności.

## Granice App, Lib I Packages

Typowy podział:

- `app` lub feature folders: kod aplikacyjny, routing, composition, runtime wiring.
- `lib` albo `shared`: małe, stabilne helpery bez zależności od aplikacji.
- `packages/*`: niezależne jednostki z własnym public API, buildem i testami.
- `internal` albo `_internal`: kod niewspierany jako API publiczne.
- `generated`: kod generowany, nieedytowany ręcznie.

Zasady zależności:

- Aplikacja może zależeć od bibliotek i pakietów.
- Pakiety domenowe nie powinny importować z aplikacji.
- Shared/lib nie powinno stać się śmietnikiem dla kodu zależnego od kontekstu.
- Internal modules nie powinny być importowane spoza właściciela.

## Public API Surface

Public API ma być jawne i małe. Konsument powinien importować z udokumentowanego entrypointu, a nie z losowej ścieżki wewnętrznej.

Dobrze:

```typescript
export { createClient } from './client';
export type { ClientOptions, ClientResult } from './types';
```

Ryzykownie:

```typescript
export * from './client';
export * from './cache/internal-store';
export * from './testing/fakes';
```

Dla pakietu używaj `package.json` `exports`:

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./testing": {
      "types": "./dist/testing.d.ts",
      "import": "./dist/testing.js"
    }
  }
}
```

Nie eksportuj `./internal/*`, jeśli nie chcesz utrzymywać kompatybilności tego API.

## Package Imports

`package.json` `imports` służy do prywatnych subpath aliases zaczynających się od `#`. Używaj ich dla wewnętrznych skrótów pakietu, gdy mają działać w runtime Node/bundlera, a nie tylko w TypeScript:

```json
{
  "imports": {
    "#internal/*": {
      "types": "./dist/internal/*.d.ts",
      "import": "./dist/internal/*.js"
    }
  }
}
```

`tsconfig paths` pomaga kompilatorowi i IDE, ale sam nie zmienia resolution runtime. Jeśli alias ma przeżyć build, zsynchronizuj `imports`, `paths`, bundler/test runner i sprawdź import po buildzie z outputu pakietu.

## Path Aliases

Aliasy pomagają usuwać kruche `../../..`, ale mogą ukrywać granice warstw.

Dobre aliasy:

- są nieliczne i stabilne,
- mapują do warstw albo pakietów, nie do każdego folderu,
- działają spójnie w TypeScript, bundlerze, test runnerze i runtime,
- nie omijają `exports` pakietu.

Ryzykowne aliasy:

```json
{
  "paths": {
    "@/*": ["src/*"],
    "@internal/*": ["src/**/internal/*"],
    "@everything/*": ["*"]
  }
}
```

Alias `@/*` bywa praktyczny w aplikacji, ale w bibliotece może utrudnić publikację i test realnego importu konsumenta.

## Project References I Incremental Builds

Project references mają sens, gdy repo ma wiele pakietów lub duży typecheck.

Zasady:

- Każdy referencjonowany projekt ma `composite: true`.
- Granice references odpowiadają realnym granicom pakietów albo warstw.
- Build idzie od liści zależności do aplikacji.
- Unikaj cykli między projektami; jeśli występują, granica pakietu jest źle ustawiona.
- Cache `.tsbuildinfo` trzymaj poza źródłami albo w miejscu ignorowanym przez git.

Przykład projektu pakietu:

```json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "references": []
}
```

## Layered Tsconfig

Utrzymuj konfigurację warstwowo:

- `tsconfig.base.json`: wspólne opcje strict, module resolution, target, paths.
- `tsconfig.json`: konfiguracja IDE albo references.
- `tsconfig.build.json`: emit produkcyjny, exclude testów i fixtures.
- `tsconfig.test.json`: typy test runnera, pliki testowe, środowisko testów.
- Pakietowe `tsconfig.json`: lokalne `rootDir`, `outDir`, references.

Nie mieszaj wszystkiego w jednym pliku, jeśli projekt ma różne potrzeby IDE, testów i builda.

## Generated Files I Declaration Files

Kod generowany:

- oznacz folderem i nagłówkiem generacji, jeśli lokalna konwencja na to pozwala,
- nie edytuj ręcznie,
- trzymaj generator i wejściowe schematy w repo, jeśli wynik jest wersjonowany,
- wyklucz z lintingu albo zastosuj osobne reguły, jeśli generator produkuje styl niezgodny z repo,
- zapewnij deterministyczny output.

Declaration files:

- publikuj `.d.ts` dla pakietów TS używanych poza projektem,
- sprawdzaj, czy typy wskazują na public API, nie na wewnętrzne ścieżki,
- nie maskuj braków przez ręcznie pisane deklaracje, jeśli można wygenerować je z kodu źródłowego,
- testuj import z paczki po buildzie, nie tylko z `src`.

## Build Artifacts

Ustal, co jest źródłem, a co artefaktem:

- `src`, schematy, konfiguracje i pliki wejściowe generatorów to źródła.
- `dist`, `build`, `.tsbuildinfo`, coverage i cache zwykle nie trafiają do git.
- Artefakty publikacyjne mogą być wersjonowane tylko, jeśli repo ma taką świadomą politykę.
- Testy powinny importować źródła albo zbudowany pakiet zależnie od celu; nie mieszaj tego przypadkowo.

## Monorepo Considerations

W monorepo:

- każdy pakiet ma jasnego właściciela i public API,
- zależności między pakietami są przez package name, nie głęboką ścieżkę filesystem,
- wersjonowanie i release flow są spójne z narzędziem repo,
- shared tooling jest centralne, ale pakiety mogą mieć lokalne overrides,
- test/build pipeline wykorzystuje affected packages, jeśli repo to wspiera,
- cross-package imports nie omijają `exports`.

## Antywzorce

- `src/utils` jako nieograniczony kosz na wszystko.
- Alias do dowolnego folderu, który pozwala importować internal modules z każdego miejsca.
- Barrel file `export *` jako jedyna definicja public API.
- Testy importujące prywatne moduły pakietu, a potem blokujące refaktor.
- `dist` importowany przez kod źródłowy.
- Generated files edytowane ręcznie.
- Jeden `tsconfig.json` używany do IDE, testów, builda i publikacji mimo sprzecznych potrzeb.
- Project references dodane bez realnych granic i przez to zwiększające złożoność builda.

## Workflow

1. Sprawdź aktualną strukturę: `package.json`, `tsconfig*`, bundler, test runner, workspaces, `exports`, aliasy i build artifacts.
2. Zidentyfikuj granice: aplikacja, biblioteki, pakiety, internal, generated, tests.
3. Ustal dozwolone kierunki importów i public API dla każdego pakietu lub feature.
4. Zaprojektuj aliasy minimalnie; zsynchronizuj je z bundlerem, test runnerem i runtime.
5. Jeśli typecheck/build jest duży, rozważ project references zgodne z granicami pakietów.
6. Rozdziel `tsconfig` dla base, IDE, build i testów, jeśli mają różne role.
7. Oznacz generated files i zdecyduj, czy są wersjonowane czy generowane w pipeline.
8. Dodaj smoke test importu publicznego API i build/typecheck dla dotkniętych pakietów.

## Walidacja I Smoke Testy

- `tsc -b` albo lokalny typecheck przechodzi dla zmienionych references.
- Import z publicznego entrypointu działa po buildzie.
- Głębokie importy do `internal` są zablokowane przez lint, `exports` albo konwencję testowaną w review.
- Prywatne aliasy `#...` z `package.json` `imports` działają po buildzie i są spójne z `tsconfig paths`.
- Path aliases działają w TypeScript, test runnerze, bundlerze i runtime.
- Generated files są deterministyczne i nie wymagają ręcznych poprawek.
- Package `exports` wskazuje poprawne pliki JS i `.d.ts`.
- Build artifacts nie są przypadkowo importowane ani commitowane wbrew polityce repo.

## Checklista Końcowa

```text
- [ ] Foldery odzwierciedlają granice app/lib/packages/internal/generated.
- [ ] Public API jest jawne, małe i testowane przez entrypoint pakietu.
- [ ] Internal modules nie są importowane spoza właściciela.
- [ ] Path aliases są minimalne i spójne we wszystkich narzędziach.
- [ ] Project references odpowiadają realnym granicom i nie tworzą cykli.
- [ ] `tsconfig` jest rozdzielony według roli: base, IDE, build, test.
- [ ] Generated files, declarations i build artifacts mają jasną politykę.
- [ ] Monorepo imports idą przez nazwy pakietów i `exports`, nie przez głębokie ścieżki.
```

## Powiązane Skille

- `typescript-best-practices` — jakość typów wewnątrz modułów i publicznych kontraktów.
- `ts-styling-and-linting` — reguły importów, barrel files i dependency boundaries.
- `javascript-modern-patterns` — ESM/CJS, top-level await i semantyka modułów.
- `testing-ts-js` — smoke tests public API, build output i kontraktów pakietów.
- `performance-and-memory-js` — wpływ struktury importów, barrel files i bundle graph na wydajność.
