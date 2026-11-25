---
name: typescript-best-practices
description: "Zaawansowane praktyki TypeScript — strict typing, unknown, branded types, discriminated unions, runtime validation i API boundaries. Do implementacji i review kodu TS."
---

# Najlepsze Praktyki TypeScript

Prowadzi implementację TypeScript, w której typy redukują realne ryzyko produkcyjne i dokumentują kontrakty kodu. Nie chodzi o maksymalnie sprytny system typów, tylko o czytelne granice, bezpieczną ewolucję API i szybkie wykrywanie błędów.

## Kiedy używać

- Piszesz lub refaktoryzujesz kod TypeScript w aplikacji, bibliotece, backendzie Node albo pakiecie współdzielonym.
- Uszczelniasz typy po włączeniu `strict` albo po migracji z JavaScript.
- Projektujesz publiczne API, DTO, warstwę integracji, klienta HTTP, eventy albo model domenowy.
- Zastępujesz `any`, nieuzasadnione `as`, non-null assertions albo kruche typy indeksowane.
- Recenzujesz PR pod kątem jakości typów, bezpieczeństwa granic i utrzymywalności.

## Kiedy nie używać

- Zadanie dotyczy głównie formatowania, importów albo konfiguracji ESLint; użyj `ts-styling-and-linting`.
- Zadanie dotyczy struktury monorepo, `tsconfig` layering, package exports albo project references; użyj `ts-project-structure`.
- Zadanie dotyczy testów; użyj `testing-ts-js`.
- Problem jest czysto runtime performance albo memory leak; użyj `performance-and-memory-js`.

## Zasada nadrzędna

Typ ma być użytecznym kontraktem, nie dekoracją. Jeśli typ nie zmniejsza ryzyka, nie upraszcza refaktoryzacji, nie dokumentuje granicy albo nie eliminuje klasy błędów, prawdopodobnie jest zbyt teatralny.

Dobre typowanie zwykle:

- zawęża dane na granicach systemu,
- utrzymuje domenowe rozróżnienia tam, gdzie pomyłka jest kosztowna,
- pozwala kompilatorowi wykryć brak obsługi wariantu,
- nie wymaga od czytelnika mentalnego debugowania pięciu poziomów conditional types.

## Konfiguracja bazowa

Preferuj `strict` jako punkt wyjścia. Dla nowych albo dojrzałych projektów rozważ też:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "useUnknownInCatchVariables": true
  }
}
```

Znaczenie praktyczne:

- `strict` wymusza spójne zawężanie i jawne kontrakty.
- `noImplicitOverride` chroni przed przypadkowym cieniem metod klas bazowych.
- `exactOptionalPropertyTypes` rozróżnia brak pola od `undefined`.
- `noUncheckedIndexedAccess` przypomina, że indeksowanie tablicy lub mapy może zwrócić brak wartości.
- `useUnknownInCatchVariables` wymusza bezpieczne odczytywanie błędów.

## Zasady Wysokiego Priorytetu

- Używaj `unknown` dla danych, których jeszcze nie zweryfikowano: odpowiedzi HTTP, `JSON.parse`, payloady eventów, storage, `postMessage`, parametry CLI i dane z procesu.
- `any` dopuszczaj tylko jako izolowany most migracyjny z komentarzem zakresu albo w typach testowych, gdy repo ma taką lokalną konwencję.
- Nie używaj `as` do uciszania kompilatora. Najpierw zawężaj typ przez parser, type guard, discriminant, kontrolę `in`, `typeof` albo `instanceof`.
- Non-null assertion `!` traktuj jak dług techniczny. Bezpieczniejszy jest warunek, wczesny return, `asserts`, invariant albo zmiana modelu danych.
- Modeluj warianty przez discriminated unions zamiast luźnych obiektów z opcjonalnymi polami.
- Używaj branded types dla identyfikatorów i wartości, których nie wolno mieszać mimo tego samego typu prymitywnego.
- Używaj `satisfies`, gdy chcesz sprawdzić zgodność obiektu bez utraty precyzyjnych literałów.
- Używaj `as const` dla map konfiguracji, list statusów i tablic literalnych, które mają generować wąskie typy.
- Utility types stosuj do transformacji istniejących kontraktów, nie do ukrywania braku nazwanego modelu domenowego.
- Dane zewnętrzne waliduj w runtime. TypeScript nie sprawdza JSON, formularzy, headers, env ani danych z bazy.

## Granice API I Runtime Validation

Granica systemu to miejsce, gdzie typy kompilatora przestają wystarczać. Każda taka granica powinna mieć warstwę walidacji lub jawny adapter:

- HTTP request/response, webhooki, WebSocket, kolejki i event bus.
- `process.env`, pliki konfiguracyjne, local/session storage.
- `JSON.parse`, dynamic imports, pluginy, extension APIs, `postMessage`.
- Dane z bazy, jeśli zapytanie omija ORM albo zwraca projekcję nietypowaną.

Wzorzec:

1. Odbierz dane jako `unknown`.
2. Zweryfikuj strukturę parserem, schematem albo type guardem.
3. Dopiero wynik parsera traktuj jako typ domenowy.
4. Przy błędzie zwróć kontrolowany rezultat, nie losowy wyjątek w środku flow.

```typescript
type UserDto = {
  id: string;
  email: string;
};

function isUserDto(value: unknown): value is UserDto {
  return typeof value === 'object'
    && value !== null
    && typeof (value as Record<string, unknown>).id === 'string'
    && typeof (value as Record<string, unknown>).email === 'string';
}

async function fetchUser(id: string): Promise<UserDto> {
  const response = await fetch(`/api/users/${id}`);
  const data: unknown = await response.json();

  if (!isUserDto(data)) {
    throw new Error('Invalid user response');
  }

  return data;
}
```

## Modelowanie Domeny

### Discriminated unions

Preferuj warianty z jednoznacznym polem rozróżniającym:

```typescript
type PaymentResult =
  | { status: 'paid'; receiptId: string }
  | { status: 'declined'; reason: string }
  | { status: 'pending'; retryAfterMs: number };

function assertNever(value: never): never {
  throw new Error(`Unhandled variant: ${JSON.stringify(value)}`);
}

function nextStep(result: PaymentResult) {
  switch (result.status) {
    case 'paid':
      return result.receiptId;
    case 'declined':
      return result.reason;
    case 'pending':
      return result.retryAfterMs;
    default:
      return assertNever(result);
  }
}
```

Unikaj modelu, w którym wszystko jest opcjonalne i poprawność zależy od pamięci programisty:

```typescript
type WeakPaymentResult = {
  paid?: boolean;
  receiptId?: string;
  reason?: string;
  retryAfterMs?: number;
};
```

### Branded types

Używaj brandów, gdy pomylenie dwóch stringów/liczb jest realistycznym błędem:

```typescript
type Brand<T, Name extends string> = T & { readonly __brand: Name };

type UserId = Brand<string, 'UserId'>;
type OrderId = Brand<string, 'OrderId'>;

function loadUser(id: UserId) {
  return id;
}
```

Nie branduj wszystkiego. Brand ma sens dla identyfikatorów, walut, jednostek, tenantów i security-sensitive values.

## `satisfies`, `as const` I Utility Types

`satisfies` zachowuje literalne wartości, a jednocześnie sprawdza kontrakt:

```typescript
type RouteConfig = Record<string, { auth: boolean; title: string }>;

const routes = {
  dashboard: { auth: true, title: 'Dashboard' },
  login: { auth: false, title: 'Login' }
} satisfies RouteConfig;

type RouteName = keyof typeof routes;
```

`as const` jest dobre dla zamkniętych słowników:

```typescript
const statuses = ['idle', 'loading', 'success', 'error'] as const;
type Status = (typeof statuses)[number];
```

Utility types używaj świadomie:

- `Pick` i `Omit` do projekcji API, gdy źródłowy typ jest stabilny.
- `Partial` tylko dla rzeczywiście częściowych danych, nie jako sposób na pominięcie walidacji.
- `Readonly` dla kontraktów niemodyfikowanych przez konsumenta.
- `Record` dla pełnych map o znanym kluczu; dla map dynamicznych rozważ `Map`.
- `NonNullable` przy wyniku zawężenia, nie jako plaster na źle zamodelowany nullable state.

## Antywzorce

- `JSON.parse(...) as MyType` bez walidacji.
- `error as Error` w `catch` bez sprawdzenia kształtu.
- `foo!.bar!.baz` zamiast kontroli wariantu albo invariant.
- `Partial<Everything>` jako typ inputu do aktualizacji bez walidacji dozwolonych pól.
- Rozbudowane conditional/mapped types, które dają mniej czytelności niż dwa nazwane typy.
- `as unknown as TargetType` poza izolowanym adapterem migracyjnym.
- Typy DTO używane bezpośrednio jako model domeny, gdy domena ma dodatkowe invariants.
- Publiczne API biblioteki zależne od prywatnych typów frameworka albo zbyt szerokich generyków.

## Workflow

1. Włącz albo uszanuj lokalne `strict` i sprawdź aktywne opcje `tsconfig`.
2. Zidentyfikuj granice danych zewnętrznych i przyjmij tam `unknown`.
3. Nazwij typy domenowe i DTO oddzielnie, jeśli mają różne reguły życia.
4. Zamodeluj warianty jako discriminated unions i sprawdź exhaustiveness w `switch`.
5. Usuń nieuzasadnione `any`, `as` i `!`, zastępując je zawężaniem albo walidacją.
6. Użyj `satisfies` i `as const` dla konfiguracji, map i statusów, gdzie literały są częścią kontraktu.
7. Dodaj testy albo smoke check dla parserów, type guardów i krytycznych transformacji.
8. Uruchom `tsc --noEmit` lub lokalny odpowiednik build/typecheck.

## Walidacja I Smoke Testy

- `tsc --noEmit` przechodzi bez nowych błędów.
- Linter nie raportuje nowego `any`, floating promises ani nieuzasadnionych assertions.
- Parser danych zewnętrznych ma test dla poprawnego payloadu i minimum jednego payloadu błędnego.
- Zmiana publicznego typu ma test kontraktu, fixture albo przykładowe użycie kompilowane w CI.
- Dla discriminated unions smoke check polega na dodaniu tymczasowego wariantu i sprawdzeniu, że exhaustive switch z `assertNever` zgłasza błąd kompilacji w miejscach wymagających aktualizacji.

## Checklista Końcowa

```text
- [ ] Nie dodano `any` poza jawnie uzasadnionym adapterem lub migracją.
- [ ] Dane zewnętrzne są przyjmowane jako `unknown` i walidowane przed użyciem.
- [ ] Nie ma nowego `as` ani `!`, które tylko ucisza kompilator.
- [ ] Warianty stanu są discriminated unions zamiast luźnych opcjonalnych pól.
- [ ] `satisfies`, `as const` i utility types upraszczają kontrakt, a nie maskują chaosu.
- [ ] Typy publiczne są stabilne, nazwane i zrozumiałe dla konsumenta API.
- [ ] Typecheck/build/test potwierdza zmianę.
```

## Powiązane Skille

- `ts-styling-and-linting` — ESLint, Prettier, importy, reguły promise i styl kodu.
- `ts-project-structure` — struktura pakietów, public API, project references i `tsconfig` layering.
- `testing-ts-js` — testy parserów, kontraktów API i zachowań asynchronicznych.
- `node-backend-guidelines` — walidacja env, błędy, timeouts i backendowe granice runtime.
