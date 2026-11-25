---
name: testing-e2e
description: "Tworzenie, debugowanie i stabilizacja testów E2E z Playwright — lokatory dostępności, izolacja testów, mockowanie zewnętrznych serwisów, wzorce Blazor Server."
---

# Wzorce i praktyki testów E2E

Prowadzi przez tworzenie, debugowanie i stabilizację testów end-to-end z Playwright. Dostarcza 6-krokowy proces od odkrycia kontekstu testowego do gotowości CI.

<principles>

<accessible-locators-first>
Zawsze używaj accessible locators (`getByRole`, `getByLabel`, `getByText`). Nigdy nie używaj selektorów CSS ani XPath — są kruche i nie odzwierciedlają doświadczenia użytkownika.
</accessible-locators-first>

<isolate-tests>
Każdy test jest niezależny — nie zależy od kolejności wykonania ani stanu pozostawionego przez inne testy. Generuje unikalne dane testowe, aby uniknąć kolizji przy równoległym uruchamianiu.
</isolate-tests>

<mock-external-only>
Mockuj wyłącznie zewnętrzne API (`**/api/external/**`). Nigdy nie mockuj wewnętrznych endpointów aplikacji — testy E2E weryfikują pełny przepływ.
</mock-external-only>

<verify-stability>
Test musi przejść 3+ kolejne razy, aby być uznanym za stabilny. Mieszanka przejść i porażek oznacza test flaky — wymaga zbadania.
</verify-stability>

</principles>

## Proces

```
Postęp tworzenia testu E2E:
- [ ] Krok 1: Odkryj kontekst testowy
- [ ] Krok 2: Utwórz Page Object
- [ ] Krok 3: Napisz test
- [ ] Krok 4: Weryfikacja i stabilizacja
- [ ] Krok 5: Obsłuż błędy
- [ ] Krok 6: Sprawdź gotowość CI
```

### Krok 1: Odkryj kontekst testowy

- Sprawdź framework UI (React, Blazor, Vue) — jeśli Blazor, załaduj `./references/blazor-patterns.md`
- Zidentyfikuj flow użytkownika do przetestowania
- Sprawdź istniejące Page Objects w projekcie

> **Blazor:** W Blazor Server czekaj na połączenie SignalR przed interakcją z UI — `await page.waitForSelector('[blazor-connected]')`. W Blazor WASM czekaj na załadowanie środowiska .NET — obserwuj zniknięcie loadera.

### Krok 2: Utwórz Page Object

```typescript
export class FeaturePage {
  constructor(readonly page: Page) {}
  get submitBtn() {
    return this.page.getByRole('button', { name: 'Submit' });
  }
  async navigate() { await this.page.goto('/feature'); }
}
```

### Krok 3: Napisz test

Wzorzec Arrange → Act → Assert z unikalnymi danymi testowymi i mockowaniem zewnętrznych API:

```typescript
test('powinno [zachowanie], gdy [warunek]', async ({ page }) => {
  // Arrange — unikalne dane testowe
  const id = `test-${Date.now()}-${test.info().parallelIndex}`;
  // Mockowanie zewnętrznych API
  await page.route('**/api/external/**', route =>
    route.fulfill({ status: 200, body: '{}' })
  );
  // Act → Assert
});
```

### Krok 4: Weryfikacja i stabilizacja

```
URUCHOM → BŁĄD? → DEBUG (browser_snapshot) → NAPRAW → POWTÓRZ
```

| Reguła | Limit |
|---|---|
| Maks. na test | 5 iteracji → `test.fixme()` |
| Maks. na zestaw | 15 iteracji → zatrzymaj |
| Wykrywanie flaky | Mieszanka 3 przejść/porażek → zbadaj |
| Stabilność | Wymagane 3+ kolejne przejścia |
| Błąd aplikacji | Oznacz `test.fixme('BUG: opis')` |

### Krok 5: Obsłuż błędy

| Błąd | Działanie |
|---|---|
| Timeout | Zwiększ raz → sprawdź selektor → sprawdź, czy element się renderuje |
| Nie znaleziono elementu | Alternatywny lokator → sprawdź DOM → zweryfikuj, czy strona się załadowała |
| Sieć | Ponów próbę → rozważ mock → zweryfikuj backend |
| Flaky | Jawne oczekiwania → sprawdź warunki wyścigu → uruchom 5x |
| Błąd aplikacji | Oznacz `test.fixme('BUG: opis')` — CI przechodzi, chyba że pominięte testy blokują build |

### Krok 6: Sprawdź gotowość CI

- [ ] Przechodzi w trybie headless: `npx playwright test --headed=false`
- [ ] Używa `process.env.BASE_URL`
- [ ] Brak zahardkodowanych poświadczeń
- [ ] Jawnie ustawiony viewport

## Szybka ściąga

**Zawsze**: dostępne lokatory, unikalne dane testowe, 3+ przejścia, mockowanie zewnętrznych API
**Nigdy**: `waitForTimeout()`, selektory CSS, zależności między testami, zahardkodowane poświadczenia

## Antywzorce

| Antywzorzec | Naprawa |
|---|---|
| `waitForTimeout()` | Używaj `waitForSelector`, `expect().toBeVisible()` |
| Selektory CSS/XPath | Accessible locators: `getByRole`, `getByLabel`, `getByText` |
| Zależności między testami | Każdy test niezależny, generuje własne dane |
| Zahardkodowane poświadczenia | `process.env.*` lub fixture |
| Mockowanie wewnętrznych endpointów | Mockuj tylko zewnętrzne API (`**/api/external/**`) |

## Wzorce Specyficzne Dla Frameworka

Powyższe wzorce są niezależne od frameworka. Dla wzorców testowania E2E specyficznych dla frameworka załaduj odpowiednią referencję:

- **Blazor UI**: Zobacz `./references/blazor-patterns.md` — czekanie na SignalR, obsługa reconnect overlay, Enhanced Navigation, tryby renderowania Server/WASM/Auto/SSR, selektory Blazor.

## Powiązane Skille

- `ensuring-code-quality` — integracja testów E2E z pipeline jakości i quality gate
- `implementing-frontend` — kontekst komponentów UI testowanych przez E2E
- `implementing-ci-cd` — konfiguracja testów E2E w pipeline CI/CD
- `ensuring-accessibility` — walidacja a11y w testach E2E (accessible locators)
