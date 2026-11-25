---
name: testing-ts-js
description: "Stabilizuje testy TypeScript/JavaScript: unit, integration, contract tests, test doubles, mock boundaries, fake timers, async race conditions. Używaj przy pisaniu, naprawianiu lub review testów TS/JS; pełne przepływy E2E kieruj do testing-e2e."
---

# Testowanie TS/JS

Prowadzi tworzenie testów TypeScript i JavaScript, które są szybkie, deterministyczne i dobrze dobrane do ryzyka zmiany. Test ma opisywać zachowanie i kontrakt, nie utrwalać przypadkowych szczegółów implementacji.

## Kiedy używać

- Piszesz testy unit, integration, contract albo async dla kodu TS/JS.
- Wybierasz między Vitest, Jest albo lokalnym runnerem repozytorium.
- Stabilizujesz flaky tests, race conditions, fake timers, retry albo zależności od czasu.
- Projektujesz fixtures, test doubles, mock boundaries albo kontrakty API.
- Recenzujesz snapshoty, asynchroniczne testy, mocki i pokrycie krytycznych ścieżek.

## Kiedy nie używać

- Zadanie dotyczy głównie typowania produkcyjnego; użyj `typescript-best-practices`.
- Zadanie dotyczy pełnego E2E, Playwright flows, lokatorów dostępności albo stabilizacji scenariuszy przeglądarkowych; użyj `testing-e2e`.
- Zadanie dotyczy backendowego lifecycle, shutdown, health checks albo config validation; użyj `node-backend-guidelines`.
- Problem dotyczy wydajności aplikacji, nie testów; użyj `performance-and-memory-js`.

## Piramida Decyzyjna

- Unit tests: czysta logika, parsery, walidatory, mapping, edge cases, małe moduły bez I/O.
- Integration tests: współpraca kilku modułów, adaptery, baza/test container, API boundary, kolejka, filesystem w temp dir.
- Boundary smoke E2E: minimalne styki z prawdziwym runtime, routingiem albo auth; pełne przepływy Playwright prowadź przez `testing-e2e`.
- Contract tests: stabilność API, schema compatibility, event payloads, public package API, mocks dla zewnętrznych usług.
- Smoke tests CI: minimalne komendy potwierdzające, że build/test runner/app startuje po zmianie.

Nie przesuwaj wszystkiego do E2E. Nie udawaj integracji przez unit test z pięcioma mockami, jeśli ryzyko leży w połączeniu warstw.

## Zasady Wysokiego Priorytetu

- Testuj zachowanie widoczne dla konsumenta modułu, nie prywatne kroki implementacji.
- Mockuj na granicy systemu: sieć, czas, storage, filesystem, proces, losowość, zewnętrzny SDK. Nie mockuj każdego wewnętrznego helpera.
- Fixtures typuj tak samo rygorystycznie jak kod produkcyjny; test data builder powinien ujawniać wymagane pola i rozsądne defaulty.
- Każdy async test musi oczekiwać na rezultat: `await`, `return`, `expect(...).resolves/rejects`, polling helper albo Playwright auto-wait.
- Fake timers resetuj po teście i łącz ostrożnie z promise microtasks.
- Snapshoty stosuj oszczędnie: dla stabilnych struktur i kontraktów, nie dla dużych drzew UI zmieniających się przy każdym refaktorze.
- Race conditions testuj przez kontrolowane promise, fake timers, `AbortController` albo deterministyczne scheduler helpers.
- Testy integracyjne muszą izolować stan: osobna baza/schema/temp dir/storage/user/session na test lub worker.
- CI smoke test ma być krótki, deterministyczny i uruchamiany na minimalnej macierzy, która wykrywa złamany build.

## Test Doubles I Mock Boundaries

Wybierz dubler według ryzyka:

- Fake: prosta implementacja w pamięci, dobra dla repozytorium, cache, busa, clocka.
- Stub: zwraca znaną odpowiedź, dobry dla klienta API w unit testach.
- Spy: obserwuje wywołania, gdy zachowanie obejmuje efekt uboczny.
- Mock: oczekuje konkretnej interakcji; używaj ostrożnie, bo łatwo wiąże test z implementacją.
- Contract fake: fake zgodny ze schematem zewnętrznego API, testowany osobno wobec kontraktu.

Dobra granica mockowania:

```typescript
const api = createFakeBillingApi({
  charge: async () => ({ status: 'paid', receiptId: 'r_123' })
});

const result = await checkout({ api, cart });

expect(result.status).toBe('paid');
```

Słaba granica mockowania:

```typescript
vi.mock('./calculate-tax');
vi.mock('./create-invoice');
vi.mock('./save-order');
vi.mock('./send-email');
```

Jeśli test musi mockować większość modułu, prawdopodobnie potrzebuje lepszej granicy albo testu integracyjnego.

## Typed Fixtures

Buduj fixtures tak, aby domyślne dane były poprawne, a test nadpisywał tylko istotny szczegół:

```typescript
type User = {
  id: string;
  email: string;
  role: 'admin' | 'member';
};

function userFixture(overrides: Partial<User> = {}): User {
  return {
    id: 'user_1',
    email: 'user@example.test',
    role: 'member',
    ...overrides
  };
}
```

Dla `exactOptionalPropertyTypes` uważaj, czy `undefined` oznacza brak pola czy jawne wyczyszczenie wartości.

## Async Tests I Race Conditions

Najczęstsze źródła niestabilności:

- brak `await` przy asercji async,
- test kończy się przed callbackiem,
- fake timers nie opróżniają microtask queue,
- współdzielony globalny mock między testami,
- realny czas, sieć albo losowość,
- Playwright lokator oparty na CSS zamiast roli/tekstu/stanu,
- cleanup zasobów zależny od kolejności testów.

Wzorzec kontrolowanej operacji async:

```typescript
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
```

Używaj takiego helpera do testów cancel/race: najpierw uruchom operację A, potem B, rozwiąż A później i sprawdź, że stary wynik nie nadpisuje stanu.

## Snapshot Discipline

Snapshot ma sens, gdy:

- struktura jest stabilnym kontraktem publicznym,
- diff jest czytelny,
- snapshot jest mały,
- test ma dodatkową asercję intencji.

Snapshot jest ryzykowny, gdy:

- obejmuje całe drzewo UI,
- zawiera losowe ID, daty, kolejność zależną od środowiska,
- zastępuje zrozumiałe asercje,
- jest aktualizowany automatycznie bez review.

Preferuj jawne asercje:

```typescript
expect(response.status).toBe(400);
expect(response.body).toMatchObject({ code: 'INVALID_EMAIL' });
```

## API Contract Tests

Dla API, eventów i pakietów publicznych testuj kontrakt, nie tylko happy path:

- wymagane i opcjonalne pola,
- backwards compatibility,
- błędne payloady,
- statusy błędów i kody domenowe,
- serializacja dat/liczb/enumów,
- wersjonowanie endpointu albo eventu,
- zachowanie przy polach nadmiarowych.

Jeśli produkcja używa runtime validation, testuj parser schematu bezpośrednio i przez adapter API.

## Workflow

1. Sprawdź lokalny runner, komendy CI, konfigurację TypeScript, sposób mockowania i cleanup globalny.
2. Ustal poziom testu według ryzyka: unit, integration, E2E, contract albo smoke.
3. Zdefiniuj obserwowalne zachowanie i minimalną liczbę przypadków: happy path, edge case, error path, async/cancel jeśli dotyczy.
4. Przygotuj typed fixtures i dubler na właściwej granicy systemu.
5. Usuń zależność od realnego czasu, losowości, sieci i współdzielonego stanu.
6. Dodaj asercje intencji; snapshot tylko wtedy, gdy diff będzie stabilny i wartościowy.
7. Uruchom test lokalnie pojedynczo i w grupie, aby wykryć zależność od kolejności.
8. Dodaj albo zaktualizuj CI smoke test, jeśli zmiana dotyczy konfiguracji, builda albo entrypointu.

## Walidacja I Smoke Testy

- Test przechodzi po wielokrotnym uruchomieniu pojedynczo i jako część pliku.
- Brak nieobsłużonych rejection, console errors i floating promises.
- Fake timers, spies, mocks, temp dirs i env variables są resetowane po teście.
- Testy async mają jawny `await` albo `return` dla każdej operacji.
- Snapshoty są małe, czytelne i nie zawierają losowych danych.
- Kontrakty API mają test błędnego payloadu i test kompatybilnego payloadu.
- CI ma krótki smoke test dla zmienionej konfiguracji lub entrypointu.

## Antywzorce

- Test przechodzi tylko dzięki kolejności uruchomienia plików.
- Unit test mockuje wszystkie helpery i nie sprawdza realnego zachowania modułu.
- E2E test czeka przez stałe `sleep`, zamiast czekać na stan aplikacji.
- Snapshot obejmuje duży komponent i jest aktualizowany bez analizy diffu.
- Test używa realnej daty, timezone, losowości albo sieci bez kontroli.
- Mock zewnętrznego API nie jest zgodny z kontraktem produkcyjnym.
- `afterEach` nie czyści listenerów, timerów, serwerów, baz, plików albo env.

## Checklista Końcowa

```text
- [ ] Wybrano najniższy poziom testu, który wykrywa realne ryzyko.
- [ ] Mocki są na granicach systemu, a nie w każdym wewnętrznym helperze.
- [ ] Fixtures są typowane i mają poprawne defaulty.
- [ ] Async, fake timers i cleanup są deterministyczne.
- [ ] Snapshoty są małe albo zastąpione jawnymi asercjami.
- [ ] Testy kontraktów obejmują happy path i błędny payload.
- [ ] Lokalny test oraz właściwy smoke w CI przechodzą bez flaky zachowań.
```

## Powiązane Skille

- `testing-e2e` — głęboki workflow Playwright E2E, lokatory dostępności i stabilizacja przepływów.
- `typescript-best-practices` — typowanie fixtures, parserów, kontraktów i danych zewnętrznych.
- `ts-styling-and-linting` — reguły lint dla promises, test files i importów.
- `node-backend-guidelines` — integration tests dla health checks, shutdown i konfiguracji backendu.
