---
name: ts-styling-and-linting
description: "Konfiguruje styl i linting TypeScript/JavaScript — ESLint, Prettier, import ordering, reguły async/promise, any, readonly, const oraz separacja formatowania od semantyki."
---

# Styl I Linting TS/JS

Prowadzi konfigurację oraz stosowanie reguł stylu TypeScript i JavaScript tak, aby kod był spójny, czytelny i semantycznie bezpieczny. Formatowanie ma być automatyczne, a linting ma łapać klasy błędów, których sam formatter nie rozumie.

## Kiedy używać

- Dodajesz albo poprawiasz konfigurację ESLint, TypeScript ESLint, Prettier lub import sorting.
- Recenzujesz styl TS/JS: importy, eksporty, promises, `any`, `async`, `readonly`, `const` i typy.
- Porządkujesz named/default exports, public API folderów albo niekontrolowane barrel files.
- Chcesz rozdzielić decyzje formatowania od reguł semantycznych.
- Usuwasz niespójności po migracji z JavaScript albo po zmianie narzędzi lintujących.

## Kiedy nie używać

- Problem dotyczy modelowania typów, `unknown`, runtime validation albo `tsconfig strict`; użyj `typescript-best-practices`.
- Problem dotyczy struktury pakietów, project references albo package exports; użyj `ts-project-structure`.
- Problem dotyczy runtime Node, event loop albo graceful shutdown; użyj `node-backend-guidelines`.
- Problem dotyczy wydajności, pamięci albo renderowania; użyj `performance-and-memory-js`.

## Zasada nadrzędna

Formatter odpowiada za wygląd kodu. Linter odpowiada za intencję, bezpieczeństwo i utrzymywalność. Nie używaj ESLint do ręcznego gustu, jeśli Prettier może rozstrzygnąć format automatycznie; nie używaj Prettiera jako wymówki do pominięcia reguł semantycznych.

## Warstwy Narzędzi

- Prettier: whitespace, łamanie linii, cudzysłowy, średniki, trailing commas zgodnie z lokalną konfiguracją.
- ESLint core: ogólne błędy JS, nieużywane zmienne, nieosiągalny kod, podejrzane konstrukcje.
- TypeScript ESLint: reguły wymagające type information, promises, `any`, typy importów, niebezpieczne assertions.
- Import plugin lub sorter: kolejność importów, grupy, duplikaty, cykle i importy z warstw niedozwolonych.
- Lokalny build/typecheck: ostateczna walidacja typów, której lint nie powinien zastępować.

## Zasady Wysokiego Priorytetu

- Włącz reguły promise-aware w kodzie async: `no-floating-promises`, `no-misused-promises`, `await-thenable`, `require-await` tylko jeśli pasuje do stylu repo.
- Wymuszaj `consistent-type-imports`, aby rozdzielić importy typów od runtime imports i zmniejszać ryzyko efektów ubocznych.
- Ustal politykę eksportów: named exports jako domyślny wybór dla bibliotek i modułów; default exports tylko tam, gdzie repo lub framework tego oczekuje.
- Ogranicz barrel files. Są wygodne dla public API, ale szkodzą w hot-pathach, tree shakingu i zależnościach cyklicznych.
- Reguły `any` ustaw jako ostrzegające lub blokujące zależnie od dojrzałości repo, ale zawsze wymagaj lokalnego uzasadnienia dla nowych `any`.
- Preferuj `const`, gdy binding nie jest przepisywany. Dla wartości niemodyfikowalnych w API rozważ `readonly` albo `Readonly<T>`.
- Nie mieszaj automatycznego sortowania importów z ręcznym porządkowaniem, jeśli narzędzie ma jednoznaczną konfigurację.
- Nie wyłączaj reguł inline bez komentarza mówiącego, dlaczego wyjątek jest bezpieczny i kiedy można go usunąć.

## Importy I Eksporty

### Kolejność importów

Typowy porządek grup:

1. Built-in runtime (`node:fs`, `node:path`).
2. Zewnętrzne pakiety.
3. Aliasowane moduły workspace.
4. Importy względne z bieżącego feature.
5. Importy typów jako osobna grupa albo razem z odpowiadającą grupą źródłową, zgodnie z lokalną konfiguracją `consistent-type-imports`.
6. Style/assets, jeśli stack tego wymaga.

Dobre importy:

```typescript
import { readFile } from 'node:fs/promises';

import { z } from 'zod';

import { createLogger } from '@/lib/logger';
import type { UserDto } from '@/users/contracts';

import { mapUser } from './map-user';
```

Słabe importy:

```typescript
import { mapUser } from './map-user';
import { z } from 'zod';
import { UserDto } from '@/users/contracts';
import * as everything from '@/index';
```

### Named/default exports policy

Preferuj named exports, gdy:

- moduł eksportuje więcej niż jedną rzecz,
- zależy ci na refaktoryzacji i wyszukiwaniu użyć,
- tworzysz publiczne API pakietu albo biblioteki.

Default export akceptuj, gdy:

- framework wymaga konkretnego default exportu,
- moduł reprezentuje jedną główną funkcję i repo ma taki wzorzec,
- kompatybilność z istniejącym API jest ważniejsza niż zmiana stylu.

### Barrel files

Barrel file może być dobry jako jawna powierzchnia publiczna:

```typescript
export { createClient } from './client';
export type { ClientOptions } from './types';
```

Unikaj barrel file, który eksportuje wszystko:

```typescript
export * from './client';
export * from './internal-cache';
export * from './test-utils';
```

Ryzyka barrel files:

- przypadkowe zwiększenie bundle size,
- ukryte zależności cykliczne,
- ładowanie modułów z efektami ubocznymi,
- trudniejsze rozdzielenie public/private API,
- wolniejsze cold start w hot-pathach backendu.

## Reguły Async I Promise

- Każda obietnica jest `await`, `return`, `void` z intencją fire-and-forget albo dołączona do kontrolowanego batcha.
- Handler async przekazywany do API, które oczekuje `void`, wymaga jawnego wrappera i obsługi błędu.
- Nie używaj `Array.prototype.forEach` z async callbackiem do sekwencji lub batcha.
- Fire-and-forget wymaga loggera, error boundary albo kolejki, nie samego `void` dla uciszenia reguły.

```typescript
// Dobrze: kontrolowany batch i obsługa wyniku.
await Promise.all(users.map(user => sendInvite(user)));

// Dobrze: świadome fire-and-forget z obsługą błędu.
void refreshCache().catch(error => logger.warn({ error }, 'Cache refresh failed'));

// Źle: promise odpływa poza kontrolę.
users.forEach(async user => {
  await sendInvite(user);
});
```

## Reguły Dla `any`, `readonly` I `const`

- `no-explicit-any`: preferuj `unknown`, typ generyczny z ograniczeniem albo named interface.
- `no-unsafe-assignment`, `no-unsafe-member-access`, `no-unsafe-call`: włączaj stopniowo w legacy repo, blokuj w nowych modułach.
- `prefer-const`: traktuj jako podstawową higienę.
- `readonly` stosuj dla inputów, których funkcja nie mutuje, oraz dla kolekcji zwracanych jako publiczne API.
- Nie zamieniaj całego kodu na deep readonly bez potrzeby; zbyt dużo readonly potrafi utrudnić proste transformacje.

## Granice Formatowania I Semantyki

Formatter może zmienić wygląd, ale nie powinien zmieniać znaczenia. Linter może wymuszać semantykę, ale nie powinien generować walki z formatterem.

Dobre rozdzielenie:

- Prettier ustawia długość linii i trailing commas.
- ESLint wymusza brak floating promises.
- TypeScript wykrywa niezgodność typów.
- Testy wykrywają regresję zachowania.

Złe rozdzielenie:

- ESLint wymusza ręczną estetykę sprzeczną z Prettierem.
- Prettier jest uruchamiany jako substytut lintingu.
- `eslint-disable` usuwa regułę na całym pliku, bo jeden fragment wymaga wyjątku.

## Antywzorce

- Globalne wyłączanie `@typescript-eslint/no-floating-promises`, bo testy czasem wymagają `void`.
- Importowanie typów jako wartości, co dokłada runtime import albo efekt uboczny.
- `export *` z folderu feature bez rozdzielenia public i internal.
- Default exports wszędzie, przez co nazwy importów dryfują między plikami.
- Sortowanie importów ręcznie wbrew skonfigurowanemu sorterowi.
- `eslint-disable-next-line` bez powodu i bez najwęższego zakresu.
- Reguły `any` ustawione tak ostro w legacy repo, że zespół zaczyna obchodzić narzędzie zamiast poprawiać kod.

## Workflow

1. Sprawdź lokalny stack: ESLint flat config czy legacy config, TypeScript ESLint, Prettier, import sorter, package manager i komendy CI.
2. Ustal, które reguły wymagają type information i czy projekt ma szybki tryb lintingu dla dev.
3. Rozdziel formatowanie od semantyki: Prettier dla formatowania, ESLint dla reguł bezpieczeństwa i stylu kodu.
4. Wprowadź import ordering i `consistent-type-imports` zgodnie z istniejącą strukturą modułów.
5. Ustal named/default exports policy i wyjątki frameworkowe.
6. Ogranicz barrel files do public API; usuń albo omijaj je w hot-pathach i miejscach z cyklami.
7. Dodaj reguły promise-aware i popraw floating promises przez `await`, `return`, batch albo świadome `void` z `.catch`.
8. Uruchom `lint`, `format:check`, `typecheck` i najwęższe testy dotknięte zmianą.

## Walidacja I Smoke Testy

- `eslint` przechodzi bez nowych błędów i bez szerokich wyłączeń reguł.
- `prettier --check` albo lokalny odpowiednik nie zgłasza zmian.
- `tsc --noEmit` przechodzi, jeśli reguły lint wymagają type-aware konfiguracji.
- Nowy albo zmieniony `eslint-disable` ma najwęższy zakres i uzasadnienie.
- Importy typów nie generują niepotrzebnych runtime imports w emit/bundlu.
- Fire-and-forget promises mają jawne logowanie błędu albo kontrolowany lifecycle.

## Checklista Końcowa

```text
- [ ] Formatter i linter mają rozdzielone odpowiedzialności.
- [ ] Import ordering jest deterministyczny i zgodny z lokalną konfiguracją.
- [ ] `consistent-type-imports` nie łamie runtime imports wymaganych przez side effects.
- [ ] Promise handling nie zostawia floating promises ani async callbacków w API `void` bez wrappera.
- [ ] Polityka named/default exports jest spójna z repo i wyjątkami frameworka.
- [ ] Barrel files są jawne i nie trafiają do hot-pathów ani cyklicznych zależności.
- [ ] Nowe `any` i disable comments są lokalne, uzasadnione i możliwe do usunięcia.
```

## Powiązane Skille

- `typescript-best-practices` — rygor typów, `unknown`, unions i runtime validation.
- `ts-project-structure` — public API, internal modules, path aliases i project references.
- `testing-ts-js` — lint/test integration, async tests i smoke checks w CI.
- `performance-and-memory-js` — wpływ importów, barrel files i bundle/runtime hot paths na wydajność.
