---
name: react-testing
description: "Testuje React przez React Testing Library, user-event, a11y queries, mocki API, providers, async UI i custom hooks."
---
slug: react-testing

# React: testowanie komponentow i integracji

## Short description

Testuj komponenty React przez zachowanie widoczne dla uzytkownika, nie przez prywatna implementacje. Ten skill obejmuje React Testing Library, user-event, dostepne query, mockowanie API, testy integracyjne, async UI i ograniczenia snapshotow.

## Use cases / When to use

- Piszesz testy komponentow, hookow lub przeplywow UI.
- Zastepujesz kruche testy snapshotowe testami zachowania.
- Mockujesz API, router, feature flags, storage albo provider aplikacyjny.
- Debugujesz flaky testy async, timery albo React act warnings.
- Recenzujesz PR zmieniajacy interakcje, formularze, walidacje lub data fetching.
- Budujesz wspolny `renderWithProviders` dla testow aplikacji.

## When NOT to use

- Problem dotyczy pelnych przeplywow w realnej przegladarce; uzyj `testing-e2e`.
- Problem dotyczy ogolnych testow TS/JS poza React; uzyj `testing-ts-js`.
- Problem dotyczy a11y implementacji komponentu; uzyj `react-accessibility`.
- Problem dotyczy struktury stanu lub modulow; uzyj `react-architecture`.

## Key rules and concrete guidance

- Testuj to, co uzytkownik moze zobaczyc, uslyszec albo zrobic. Preferuj queries po roli, nazwie i labelu.

```tsx
const user = userEvent.setup();

render(<LoginForm />);
await user.type(screen.getByLabelText(/email/i), 'user@example.com');
await user.click(screen.getByRole('button', { name: /sign in/i }));
expect(screen.getByText(/welcome/i)).toBeInTheDocument();
```

- Kolejnosc query: `getByRole`, `getByLabelText`, `getByPlaceholderText` tylko gdy placeholder jest prawdziwym elementem UX, `getByText`, `getByTestId` jako ostatni escape hatch.
- Uzywaj `@testing-library/user-event` dla interakcji. `fireEvent` zostaw dla niskopoziomowych zdarzen, ktorych user-event nie obsluguje.
- Testuj async UI przez `findBy...` albo `waitFor`, nie przez arbitralne sleep.

```tsx
const user = userEvent.setup();

await user.click(screen.getByRole('button', { name: /save/i }));
expect(await screen.findByRole('status')).toHaveTextContent(/saved/i);
```

- Mockuj siec na granicy HTTP przez MSW albo lokalny mock klienta API, zgodnie z repo. Nie mockuj wewnetrznych hookow, jesli celem jest integracja UI + data fetching.
- Provider wrapper powinien odwzorowywac minimalny runtime aplikacji: router, query client, i18n, theme, auth context.

```tsx
function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}
```

- Izoluj testy. Kazdy test powinien miec swiezy store/query client/router history.
- Dla formularzy testuj sciezke sukcesu, blad walidacji, disabled/loading i submit payload.
- Dla komponentow dostepnych testuj role, label, focus i keyboard, nie tylko tekst.
- Snapshoty stosuj oszczednie: male, stabilne struktury lub serializowane configi. Nie snapshotuj calego drzewa UI jako glowny test.
- Testuj custom hook przez komponent testowy albo `renderHook`, jesli repo wspiera te API.
- Fake timers wlaczaj lokalnie i zawsze przywracaj. Pamietaj, ze user-event moze wymagac konfiguracji z timerami.
- Unikaj asercji na klasy CSS, jesli testujesz zachowanie. Klasy testuj tylko dla kontraktu wariantu albo integracji stylingu.
- Nie testuj `useState` ani prywatnych funkcji. Testuj wynik widoczny w DOM albo efekt na zewnetrznej granicy.
- Dla error boundary testuj fallback oraz raportowanie bledu przez kontrolowany mock loggera.

## Typical mistakes / anti-patterns to avoid

- `container.querySelector` jako domyslny sposob szukania elementow.
- Testy snapshotowe jako jedyne pokrycie komponentu.
- Mockowanie hooka, ktory jest glowna logika testowanego przeplywu.
- Oczekiwanie na async przez `setTimeout` lub sleep helper.
- Wspolny globalny query client/store miedzy testami.
- Testy zalezne od kolejnosci wykonania albo od danych pozostawionych w localStorage.
- Asercje na wewnetrzny state komponentu.
- Nadmierne `act(...)` recznie, gdy testing-library potrafi obsluzyc interakcje.
- `getByTestId` dla elementow, ktore maja role lub label.

## Checklist for PR reviews

- [ ] Testy uzywaja dostepnych queries i `user-event` dla interakcji.
- [ ] Testy sprawdzaja zachowanie uzytkownika, nie prywatna implementacje.
- [ ] Async UI jest obslugiwane przez `findBy` lub `waitFor` bez sleep.
- [ ] Mocki sieci sa na stabilnej granicy (MSW/API client), a nie w srodku komponentu.
- [ ] Kazdy test ma izolowany store, query client, router i localStorage.
- [ ] Formularze maja test sukcesu, walidacji i disabled/loading, jesli dotyczy.
- [ ] Snapshoty sa ograniczone i nie sa jedynym pokryciem.
- [ ] Testy klawiatury/focus sa obecne dla komponentow interaktywnych.
- [ ] Brak nowych act warnings i flaky timing assumptions.

## Example snippets

```tsx
it('submits email and password', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();

  render(<LoginForm onSubmit={onSubmit} />);

  await user.type(screen.getByLabelText(/email/i), 'user@example.com');
  await user.type(screen.getByLabelText(/password/i), 'secret123');
  await user.click(screen.getByRole('button', { name: /sign in/i }));

  expect(onSubmit).toHaveBeenCalledWith({ email: 'user@example.com', password: 'secret123' });
});
```

```tsx
it('shows server error', async () => {
  const user = userEvent.setup();
  server.use(http.post('/api/login', () => HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })));

  renderWithProviders(<LoginPage />);

  await user.click(screen.getByRole('button', { name: /sign in/i }));

  expect(await screen.findByRole('alert')).toHaveTextContent(/invalid credentials/i);
});
```

```tsx
it('moves focus with keyboard', async () => {
  const user = userEvent.setup();
  render(<Tabs items={items} value="a" onValueChange={vi.fn()} />);

  screen.getByRole('tab', { name: /first/i }).focus();
  await user.keyboard('{ArrowRight}');

  expect(screen.getByRole('tab', { name: /second/i })).toHaveFocus();
});
```

## Trigger description

Testowanie React: RTL, user-event, mocki API, async UI, providers i a11y queries.
