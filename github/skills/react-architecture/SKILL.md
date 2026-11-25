---
name: react-architecture
description: "Projektuje architekture React: feature boundaries, state locality, server state, URL state, routing oraz client/server component boundaries."
---
slug: react-architecture

# React: architektura aplikacji i granice stanu

## Short description

Projektuj aplikacje React przez jasne granice feature'ow, danych serwerowych, stanu klienta i UI. Ten skill pomaga dobrac strukture modulow, zarzadzanie stanem, data fetching, routing i podzial komponentow bez nadmiarowej abstrakcji.

## Use cases / When to use

- Projektujesz nowy feature, modul, layout albo flow aplikacji React.
- Refaktoryzujesz globalny state, context, route modules lub feature folders.
- Decydujesz, czy stan ma trafic do URL, server cache, local component state czy global store.
- Ustalasz granice client/server components, data loaders, API clients albo hooks.
- Recenzujesz PR z duzym przesunieciem architektury frontendu.
- Planujesz rozdzielenie domeny, UI, infrastruktury i integracji.

## When NOT to use

- Problem dotyczy pojedynczego komponentu i jego props; uzyj `react-component-design`.
- Problem dotyczy tylko hookow i dependency arrays; uzyj `react-hooks-best-practices`.
- Problem dotyczy wydajnosci renderowania; uzyj `react-performance`.
- Problem dotyczy stylowania i tokenow; uzyj `react-styling-and-css`.
- Problem dotyczy pelnego backendu/API; uzyj `implementing-backend`.

## Key rules and concrete guidance

- Rozdziel rodzaje stanu przed wyborem narzedzia:
  - local UI state: input, open/closed, hover, selected tab,
  - URL state: query, filters, pagination, selected entity w linkowalnym widoku,
  - server state: dane z API, cache, revalidation, loading/error,
  - client global state: auth session, theme, feature flags, draft przeplywu,
  - derived state: wartosc obliczana z innych zrodel.
- Nie trzymaj server state w globalnym store, jesli masz query cache (TanStack Query, RTK Query, Relay, framework loaders).
- Nie trzymaj local UI state w globalnym store, jesli nie jest wspoldzielony poza mala galezia komponentow.
- URL jest dobrym miejscem dla stanu, ktory ma przetrwac refresh, share link i back/forward.

```tsx
const [searchParams, setSearchParams] = useSearchParams();
const page = Number(searchParams.get('page') ?? '1');
const query = searchParams.get('q') ?? '';
```

- Feature folder powinien miec jasna publiczna powierzchnie. Nie importuj z `internal` lub glebokich sciezek, jesli modul ma barrel public API.

```text
features/orders/
  api/
  components/
  hooks/
  model/
  routes/
  index.ts
```

- Komponenty route/page moga orkiestrowac data fetching i layout. Komponenty prezentacyjne powinny dostawac dane przez props.
- Custom hooks sa dobre dla logiki UI i integracji z klientem danych. Nie rob z kazdej funkcji hooka, jesli nie uzywa React state/lifecycle.
- Context jest dobry dla wartosci wolnozmiennych lub konfiguracji: theme, locale, auth shell. Dla czesto zmieniajacych sie danych rozwaz store z selectorami.
- Global store powinien miec jawne slice'y i akcje domenowe. Unikaj jednego obiektu `appState` mutowanego z wielu miejsc.
- Data fetching trzymaj przy granicy widoku lub w dedykowanych query hooks. Nie mieszaj fetchowania, transformacji domenowej i renderingu w jednym komponencie.
- Adapter API powinien walidowac/normalizowac dane z serwera, zanim trafia do UI.
- Dla Next.js/Remix/React Router trzymaj sie frameworkowych mechanizmow loaderow, server/client boundaries i cache.
- Client/server boundary: Server Components przekazuja do Client Components tylko serializowalne props. Nie przekazuj funkcji, klas, klientow SDK ani sekretow.
- Nie importuj modulow client-only (`window`, browser SDK, hooki, store UI) do Server Components. Przenies je za granice `'use client'` albo do adaptera frameworkowego.
- Server Actions, cache i revalidation traktuj jako czesc architektury danych. Po mutacji zaplanuj invalidation/revalidate i nie przenos sekretow do payloadu klienta.
- Error handling: miej lokalne error states dla czesci widoku i globalne error boundaries dla nieoczekiwanych awarii.
- Loading states projektuj per region, nie zawsze jako pelnoekranowy spinner.
- Formularze zlozone trzymaj w bibliotece formularzy lub lokalnym reducerze; nie rozrzucaj pol po wielu globalnych atomach.
- Dla flow z wieloma stanami rozwaz state machine albo discriminated union zamiast wielu boolean flag.

```ts
type CheckoutState =
  | { step: 'cart' }
  | { step: 'address'; addressId?: string }
  | { step: 'payment'; addressId: string }
  | { step: 'done'; orderId: string };
```

- Granice architektury maja pomagac w zmianach. Jesli warstwa wymaga duzej ilosci passthrough wrappers bez logiki, uprosc ja.

## Typical mistakes / anti-patterns to avoid

- Wszystko w globalnym store: inputy, modale, hover i dane z API.
- Wszystko w props drilling, mimo ze kilka odleglych galezi potrzebuje tej samej konfiguracji.
- Context z duzym, czesto zmieniajacym sie obiektem i wieloma konsumentami.
- Feature importujacy z wewnetrznych plikow innego feature'u bez kontraktu.
- Route component z setkami linii: data fetching, walidacja, transformacja, UI, modale i efekty naraz.
- Derived state zapisywany i synchronizowany recznie, co tworzy race conditions.
- Duza abstrakcja `useApi` bez typow, cache, abort i error semantics.
- Przenoszenie logiki domenowej do komponentow prezentacyjnych.
- Framework server/client boundary omijana przez przypadkowe importy.

## Checklist for PR reviews

- [ ] Stan jest przypisany do wlasciwej kategorii: local, URL, server cache, global albo derived.
- [ ] Feature ma jasna publiczna powierzchnie i nie importuje cudzych internal files.
- [ ] Data fetching ma kontrolowane loading/error/retry i nie duplikuje server cache.
- [ ] Context nie przenosi czesto zmieniajacego sie duzego obiektu bez selectorow.
- [ ] Komponent route orkiestruje, a komponenty prezentacyjne renderuja przez props.
- [ ] Derived values sa obliczane, a nie synchronizowane przez efekty bez potrzeby.
- [ ] Granice server/client sa zgodne z frameworkiem i nie przeciekaja sekretow.
- [ ] Error boundaries i fallbacki sa na sensownych poziomach.
- [ ] Testy pokrywaja kluczowy flow, nie tylko izolowane detale.

## Example snippets

```tsx
function OrdersRoute() {
  const { page, query } = useOrdersSearchParams();
  const ordersQuery = useOrdersQuery({ page, query });

  if (ordersQuery.isLoading) return <OrdersSkeleton />;
  if (ordersQuery.isError) return <ErrorPanel retry={ordersQuery.refetch} />;

  return <OrdersTable orders={ordersQuery.data.items} page={page} />;
}
```

```tsx
function useOrdersSearchParams() {
  const [params, setParams] = useSearchParams();

  return {
    page: Number(params.get('page') ?? '1'),
    query: params.get('q') ?? '',
    setQuery: (query: string) => setParams({ q: query, page: '1' })
  };
}
```

```tsx
type WizardAction =
  | { type: 'next' }
  | { type: 'back' }
  | { type: 'setAddress'; addressId: string };

function checkoutReducer(state: CheckoutState, action: WizardAction): CheckoutState {
  switch (action.type) {
    case 'next':
      return state.step === 'cart' ? { step: 'address' } : state;
    case 'setAddress':
      return { step: 'payment', addressId: action.addressId };
    case 'back':
      return { step: 'cart' };
  }
}
```

## Trigger description

Architektura React: feature boundaries, state locality, server state, URL state i routing.
