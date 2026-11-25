# Wzorce Testów E2E dla Blazor

Wzorce specyficzne dla Blazor dla umiejętności `testing-e2e`. Załaduj to odniesienie, gdy projekt używa Blazor (Server/WebAssembly/Auto).

## Spis treści
- [Specyfika Blazor w testach Playwright](#specyfika-blazor-w-testach-playwright)
- [Czekanie na gotowość Blazor](#czekanie-na-gotowość-blazor)
- [Enhanced Navigation (.NET 8+)](#enhanced-navigation-net-8)
- [Obsługa reconnect (Blazor Server)](#obsługa-reconnect-blazor-server)
- [Page Object z Blazor](#page-object-z-blazor)
- [Selektory i lokatory](#selektory-i-lokatory)
- [Antywzorce E2E z Blazor](#antywzorce-e2e-z-blazor)

## Specyfika Blazor w testach Playwright

| Aspekt | Blazor Server | Blazor WASM | Blazor Auto (SSR+interaktywne) |
|---|---|---|---|
| Czas do interaktywności | Po nawiązaniu SignalR (~0.5-2s) | Po pobraniu .NET runtime (~2-5s pierwsza wizyta) | SSR natychmiast, interaktywność po hydration |
| Czekanie na gotowość | `[blazor-connected]` na `<html>` lub brak `blazor-error-ui` | Zniknięcie loadera / `window.Blazor` dostępne | `[blazor-connected]` po Enhanced Navigation |
| Reconnect | Overlay `components-reconnect-modal` | N/A | Zależy od trybu |
| Enhanced Navigation | Tak (.NET 8+) | Tak (.NET 8+) | Tak |

## Czekanie na gotowość Blazor

```typescript
// Helper: czekaj na gotowość Blazor
async function waitForBlazorReady(page: Page): Promise<void> {
  // Czekaj na nawiązanie połączenia (Server/Auto)
  await page.waitForFunction(() => {
    return document.querySelector('html')?.hasAttribute('blazor-connected')
      || document.readyState === 'complete';
  }, { timeout: 10000 });

  // Upewnij się, że reconnect overlay nie jest widoczny
  await expect(page.locator('#components-reconnect-modal')).not.toBeVisible();
}

// Użycie w teście
test('powinno wyświetlić dashboard po zalogowaniu', async ({ page }) => {
  await page.goto('/login');
  await waitForBlazorReady(page);

  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Hasło').fill('password');
  await page.getByRole('button', { name: 'Zaloguj' }).click();

  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});
```

## Enhanced Navigation (.NET 8+)

Blazor 8+ używa Enhanced Navigation — kliknięcia w linki nie przeładowują strony, a Playwright `page.goto()` może nie wyzwolić pełnego ładowania.

```typescript
// Po Enhanced Navigation — czekaj na aktualizację DOM
async function navigateAndWait(page: Page, url: string): Promise<void> {
  await page.goto(url);
  // Enhanced nav może zaktualizować DOM bez zdarzenia load
  await page.waitForLoadState('networkidle');
  await waitForBlazorReady(page);
}

// Nawigacja przez kliknięcie linku (Enhanced Navigation)
test('powinno nawigować do ustawień', async ({ page }) => {
  await page.goto('/');
  await waitForBlazorReady(page);

  await page.getByRole('link', { name: 'Ustawienia' }).click();

  // Czekaj na nową zawartość — nie na przeładowanie strony
  await expect(page.getByRole('heading', { name: 'Ustawienia' })).toBeVisible();
});
```

## Obsługa reconnect (Blazor Server)

```typescript
test('powinno odzyskać po utracie połączenia', async ({ page }) => {
  await page.goto('/');
  await waitForBlazorReady(page);

  // Symuluj utratę połączenia
  await page.context().setOffline(true);

  // Czekaj na pojawienie się overlaya
  await expect(page.locator('#components-reconnect-modal')).toBeVisible();

  // Przywróć połączenie
  await page.context().setOffline(false);

  // Czekaj na automatyczną rekonekcję
  await expect(page.locator('#components-reconnect-modal')).not.toBeVisible({ timeout: 15000 });
});
```

## Page Object z Blazor

```typescript
export class DashboardPage {
  constructor(private page: Page) {}

  // Nawigacja z czekaniem na Blazor
  async navigate(): Promise<void> {
    await this.page.goto('/dashboard');
    await waitForBlazorReady(this.page);
  }

  // Selektory — używaj accessible locators, nie Blazor-specyficznych
  get heading() { return this.page.getByRole('heading', { name: 'Dashboard' }); }
  get addButton() { return this.page.getByRole('button', { name: 'Dodaj' }); }

  // Akcje
  async addItem(name: string): Promise<void> {
    await this.addButton.click();
    await this.page.getByLabel('Nazwa').fill(name);
    await this.page.getByRole('button', { name: 'Zapisz' }).click();

    // Czekaj na zaktualizowany DOM (Blazor rerenders async)
    await expect(this.page.getByText(name)).toBeVisible();
  }
}
```

## Selektory i lokatory

| Praktyka | Zalecenie |
|---|---|
| Preferuj | `getByRole`, `getByLabel`, `getByText` — accessible locators |
| `data-testid` | Używaj jako fallback — w Blazor dodawaj w `.razor`: `data-testid="asset-list"` |
| Unikaj | `_blazor` internal attributes, `blazor:*` event handlers — niestabilne |
| `id` w Blazor | Ustawiaj jawnie: `<div id="asset-grid">` — Blazor nie generuje automatycznych id |

## Antywzorce E2E z Blazor

| Antywzorzec | Problem | Rozwiązanie |
|---|---|---|
| Brak czekania na SignalR | Kliknięcia przed interaktywnością — nic się nie dzieje | `waitForBlazorReady()` |
| `waitForTimeout(3000)` zamiast selektora | Flaky — czas połączenia jest zmienny | Czekaj na konkretny element/atrybut |
| Testowanie wewnętrznych atrybutów Blazor | Atrybuty `_blazor` zmieniają się między wersjami | Używaj accessible locators |
| Brak obsługi reconnect overlay | Test zawisa na overlay | Sprawdź brak overlaya po nawigacji |
| `page.goto()` między stronami Blazor | Enhanced Navigation nie wyzwala pełnego load | Klikaj linki naturalnie + czekaj na DOM |
| Hardcoded czasy oczekiwania | Niestabilność w CI (wolniejszy serwer) | Timeouty w konfiguracji + adaptive waits |
