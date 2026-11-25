---
name: javascript-modern-patterns
description: "Wzorce nowoczesnego JS/TS (ES2020+): ESM/CJS, immutability, destructuring, optional chaining, nullish coalescing, iteratory, generatory, async iterables, promises, top-level await, this/binding, klasy vs prototypy, unikanie magic mutation. Używaj przy implementacji lub review idiomatycznego JS/TS niezależnego od frameworka."
---

# Nowoczesne Wzorce JavaScript

Prowadzi stosowanie współczesnego JavaScript w sposób czytelny, przewidywalny i zgodny z runtime projektu. Skupia się na semantyce języka i pułapkach ES2020+, a nie na konkretnym frameworku.

## Kiedy używać

- Piszesz albo recenzujesz kod JavaScript/TypeScript, w którym ważne są wzorce języka i runtime.
- Migrujesz kod z CommonJS do ESM albo mieszasz pakiety ESM/CJS.
- Projektujesz API modułów, promises, async iterables, klasy, prototypy albo funkcje pomocnicze.
- Poprawiasz ukrytą mutację, binding `this`, optional chaining pitfalls albo błędne użycie `||`.
- Chcesz używać nowoczesnych konstrukcji bez utraty czytelności i kompatybilności.

## Kiedy nie używać

- Zadanie dotyczy rygoru typów TypeScript; użyj `typescript-best-practices`.
- Zadanie dotyczy lintingu, import ordering albo Prettiera; użyj `ts-styling-and-linting`.
- Zadanie dotyczy struktury pakietów, `exports` i `tsconfig`; użyj `ts-project-structure`.
- Zadanie dotyczy wydajności lub pamięci; użyj `performance-and-memory-js`.

## Zasada nadrzędna

Nowoczesny JavaScript jest wartościowy, gdy upraszcza intencję. Nie używaj konstrukcji tylko dlatego, że są nowsze; wybieraj wzorzec, który jasno pokazuje dane wejściowe, efekty uboczne, kolejność asynchroniczną i granice modułu.

## ESM I CommonJS

ESM i CJS różnią się semantyką ładowania, named/default exports, top-level await i sposobem interpretowania plików przez Node oraz bundlery.

Zasady:

- Sprawdź `type` w `package.json`, rozszerzenia `.mjs`/`.cjs`/`.js` oraz konfigurację bundlera/test runnera.
- Nie mieszaj przypadkowo `require` i `import` w tym samym module.
- Dla bibliotek projektuj jasny public API przez `exports`, a nie przez importowanie głębokich ścieżek.
- Pamiętaj, że ESM imports są statyczne i hoistowane; dynamiczne ładowanie wymaga `import()`.
- Interop default/named między CJS i ESM bywa zależny od narzędzi. Testuj realny sposób konsumpcji.

```javascript
// ESM
import { readFile } from 'node:fs/promises';
export async function loadText(path) {
  return readFile(path, 'utf8');
}
```

```javascript
// CJS
const { readFile } = require('node:fs/promises');
module.exports.loadText = async function loadText(path) {
  return readFile(path, 'utf8');
};
```

## Immutability I Magic Mutation

Preferuj jawne transformacje danych, szczególnie na granicach modułów. Lokalna mutacja w krótkiej funkcji bywa akceptowalna; ukryta mutacja inputu publicznego API jest ryzykowna.

Dobrze:

```javascript
function renameUser(user, name) {
  return { ...user, name };
}
```

Ryzykownie:

```javascript
function renameUser(user, name) {
  user.name = name;
  return user;
}
```

Mutacja jest akceptowalna, gdy:

- obiekt jest lokalny i nieuciekający,
- hot path ma potwierdzony profil,
- API jasno mówi, że mutuje input,
- używasz struktury danych zaprojektowanej do mutacji, np. buildera.

## Destructuring

Destructuring poprawia czytelność, jeśli odsłania istotne pola. Może szkodzić, jeśli ukrywa źródło wartości albo rozbija obiekt przed walidacją.

Dobrze:

```javascript
function sendEmail({ to, subject, body }) {
  return mailer.send({ to, subject, body });
}
```

Ostrożnie:

```javascript
function handlePayload({ user: { email } }) {
  return email.toLowerCase();
}
```

Drugi przykład zakłada pełną strukturę payloadu. Dla danych zewnętrznych najpierw waliduj, potem destructuring.

## Optional Chaining I Nullish Coalescing

`?.` jest dobre dla opcjonalnej ścieżki, ale może ukryć błąd invariant. `??` zachowuje poprawnie wartości falsy takie jak `0`, `false` i pusty string.

```javascript
const pageSize = input.pageSize ?? 20;
```

Unikaj:

```javascript
const pageSize = input.pageSize || 20;
```

Jeśli `0` jest poprawną wartością, `||` zmieni semantykę.

Optional chaining jest podejrzany, gdy dana wartość powinna istnieć:

```javascript
// Może ukrywać błąd, jeśli user musi być zalogowany.
const tenantId = session.user?.tenantId;
```

W takim przypadku lepszy jest jawny invariant albo kontrolowany błąd.

## Iterators, Generators I Async Iterables

Iteratory i generatory są użyteczne dla leniwego przetwarzania, dużych danych i strumieni zdarzeń.

```javascript
function* chunks(items, size) {
  for (let index = 0; index < items.length; index += size) {
    yield items.slice(index, index + size);
  }
}
```

Async iterables pasują do strumieni danych:

```javascript
for await (const event of eventStream) {
  await handleEvent(event);
}
```

Zasady:

- Zapewnij zakończenie pętli, cancellation albo limit, jeśli źródło może być nieskończone.
- Nie ukrywaj efektów ubocznych w generatorze, jeśli konsument oczekuje czystej sekwencji.
- Dla małych kolekcji zwykła tablica jest prostsza.

## Promises I Async/Await

- `async` funkcja zawsze zwraca promise; nie mieszaj callback i promise bez adaptera.
- Używaj `Promise.all` dla niezależnych operacji, `for...of await` dla sekwencji zależnej od kolejności.
- Ogranicz współbieżność przy dużej liczbie operacji.
- Obsługuj odrzucenia w fire-and-forget.
- Nie łap błędu tylko po to, aby go ponownie rzucić bez kontekstu.

```javascript
const results = await Promise.all(ids.map(id => loadUser(id)));
```

Przy tysiącach `ids` dodaj limit współbieżności zamiast jednego ogromnego `Promise.all`.

## Top-Level Await

Top-level await jest wygodny w ESM, ale wpływa na ładowanie modułu i może opóźnić start całego grafu importów.

Stosuj dla:

- małych skryptów CLI,
- konfiguracji testowej,
- kontrolowanego entrypointu.

Unikaj w:

- bibliotekach publicznych,
- modułach importowanych przez wiele ścieżek,
- hot-pathach startu aplikacji,
- miejscach, gdzie błąd ładowania modułu utrudnia diagnostykę.

Preferuj jawny `start()` w aplikacjach:

```javascript
async function start() {
  const config = await loadConfig();
  await runServer(config);
}

void start().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
```

## `this`, Binding, Prototype I Class

Pułapki `this`:

- metoda przekazana jako callback traci receiver,
- arrow function nie ma własnego `this`,
- `this` w CJS top-level różni się od ESM,
- bound function utrudnia testowanie i dziedziczenie, jeśli stosowana bez planu.

```javascript
class Counter {
  count = 0;

  increment = () => {
    this.count += 1;
  };
}
```

Arrow field stabilizuje binding, ale tworzy funkcję per instancja. Dla wielu instancji i metod bez callbacków zwykła metoda prototypowa może być lepsza.

Klasy są dobre dla obiektów z trwałą tożsamością i invariants. Funkcje i plain objects są często lepsze dla czystych transformacji, konfiguracji i adapterów.

## Antywzorce

- `||` do wartości domyślnej, gdy `0`, `false` albo `''` są poprawnymi wartościami.
- Optional chaining na ścieżce, która powinna być invariantem.
- Ukryta mutacja inputu w helperze brzmiącym jak czysta funkcja.
- Top-level await w bibliotece publicznej bez świadomości wpływu na import graph.
- Dynamic `import()` jako obejście złej struktury modułów.
- Przekazywanie metody klasy jako callback bez bindingu.
- Generator z efektami ubocznymi, którego nazwa sugeruje tylko iterację.
- Mieszanie CJS/ESM bez testu realnej konsumpcji.

## Workflow

1. Sprawdź runtime: Node/browser, ESM/CJS, bundler, test runner i wspierany poziom ECMAScript.
2. Wybierz modułowy styl zgodny z projektem i nie mieszaj go przypadkowo.
3. Zidentyfikuj dane mutowane i zdecyduj, czy mutacja jest lokalna, publiczna czy niezamierzona.
4. Użyj destructuring, optional chaining i `??` tylko tam, gdzie ich semantyka pasuje do kontraktu.
5. Dla sekwencji danych wybierz tablicę, iterator, generator albo async iterable według rozmiaru i lifecycle.
6. Dla async ustal współbieżność, kolejność, cancellation i obsługę błędów.
7. Przy klasach sprawdź binding metod, koszt per instancja i alternatywę funkcji/plain object.
8. Dodaj test dla pułapki, którą zmiana eliminuje: falsy value, missing invariant, ESM/CJS interop, async order albo mutation.

## Walidacja I Smoke Testy

- Testy obejmują wartości falsy, jeśli zmieniono `||` na `??` albo odwrotnie.
- ESM/CJS interop jest sprawdzony przez realny import/require w trybie projektu.
- Mutacja inputów jest jawna w nazwie/API albo usunięta.
- Async flow ma test kolejności, współbieżności lub obsługi błędu.
- Top-level await nie blokuje importów biblioteki ani nie ukrywa błędów startu.
- Callback metod klasy zachowuje poprawne `this` w scenariuszu użycia.

## Checklista Końcowa

```text
- [ ] Konstrukcje ES2020+ upraszczają intencję, a nie pokazują spryt dla sprytu.
- [ ] Styl modułów ESM/CJS jest zgodny z runtime i konfiguracją projektu.
- [ ] Optional chaining nie maskuje złamanego invariant.
- [ ] `??` i `||` są dobrane do znaczenia wartości falsy.
- [ ] Mutacja jest lokalna, jawna albo zastąpiona transformacją niemutującą.
- [ ] Promises mają kontrolowaną współbieżność i obsługę błędów.
- [ ] `this`/binding i class/prototype trade-off są świadomie dobrane.
```

## Powiązane Skille

- `typescript-best-practices` — typowanie nowoczesnych wzorców w TypeScript.
- `ts-project-structure` — package exports/imports, ESM/CJS i public API powierzchni pakietu.
- `testing-ts-js` — testy async, interop modułów i regresje semantyczne.
- `performance-and-memory-js` — koszt mutacji, iteracji, promises i klas w hot pathach.
