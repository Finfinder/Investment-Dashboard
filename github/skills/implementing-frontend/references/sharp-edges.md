# Sharp Edges — Implementing Frontend

Znane pułapki budując frontend w stacku **React/Next.js (App Router) + TradingView Lightweight Charts + TypeScript**. Lista jest komplementarna wobec anty-wzorców w SKILL.md — nie powielaj ich.

## Spis treści

- [SE-01: Next.js Hydration Mismatch z Dynamic Data](#se-01-nextjs-hydration-mismatch-z-dynamic-data)
- [SE-02: Stale Closure in useEffect/useCallback](#se-02-stale-closure-in-useeffectusecallback)
- [SE-03: Memory Leak w WebSocket/SSE Subscriptions](#se-03-memory-leak-w-websocketsse-subscriptions)
- [SE-04: Server Component vs Client Component Boundary Mistake](#se-04-server-component-vs-client-component-boundary-mistake)
- [SE-05: TradingView Chart Re-render Storm](#se-05-tradingview-chart-re-render-storm)
- [SE-06: Bundle Size Explosion z Financial Libraries](#se-06-bundle-size-explosion-z-financial-libraries)
- [SE-07: Optimistic UI z Race Condition na Order](#se-07-optimistic-ui-z-race-condition-na-order)
- [SE-08: Uncontrolled Re-fetching z React Query / SWR](#se-08-uncontrolled-re-fetching-z-react-query--swr)
- [SE-09: Number Precision Loss w JavaScript](#se-09-number-precision-loss-w-javascript)
- [SE-10: CSS Z-Index War z Overlays i Tooltips](#se-10-css-z-index-war-z-overlays-i-tooltips)

---

### SE-01: Next.js Hydration Mismatch z Dynamic Data

**Severity:** CRITICAL
**Stack:** Next.js

**Sytuacja:** Server Component renderuje cenę `"1234.56"`. Client JS formatuje przez `Intl.NumberFormat` (locale-dependent) na `"1,234.56"`. Hydration mismatch → React wyrzuca warning, UI migocze.

**Dlaczego to boli:** React odrzuca server-rendered HTML i renderuje od zera. Tracisz SSR, user widzi flash niesformatowanych danych, testy E2E niestabilne.

**Rozwiązanie:**

```tsx
// BAD — formatting differs server vs client
function PriceTag({ value }: { value: number }) {
  return <span>{new Intl.NumberFormat("pl-PL").format(value)}</span>;
}

// GOOD — format on client only
"use client";
import { useEffect, useState } from "react";

function useFormattedNumber(value: number, locale = "pl-PL") {
  const [formatted, setFormatted] = useState(String(value));
  useEffect(() => {
    setFormatted(new Intl.NumberFormat(locale).format(value));
  }, [value, locale]);
  return formatted;
}

export function PriceTag({ value }: { value: number }) {
  return <span suppressHydrationWarning>{useFormattedNumber(value)}</span>;
}
```

**Symptomy:**

- Console warnings `"Text content did not match"`
- Migotanie wartości liczbowych/dat po załadowaniu strony
- Testy E2E niestabilne — asercje na tekście losowo failują

**Regex detekcji:** `Intl\.(NumberFormat|DateTimeFormat)(?!.*useEffect|.*'use client')`

---

### SE-02: Stale Closure in useEffect/useCallback

**Severity:** CRITICAL
**Stack:** React

**Sytuacja:** `useCallback` z pustą tablicą deps capture'uje `price` z pierwszego renderowania. WebSocket aktualizuje `price`, ale callback widzi zamrożoną wartość.

**Dlaczego to boli:** Bug cichy — UI wyświetla aktualną cenę, callback operuje na starej. Wymaga sekwencji render → update → action, trudny do odtworzenia.

**Rozwiązanie:**

```tsx
// BAD — price captured at first render
const handleSubmit = useCallback(() => {
  submitOrder({ price }); // always sends initial price
}, []);

// GOOD — price in deps
const handleSubmit = useCallback(() => {
  submitOrder({ price });
}, [price]);

// GOOD — ref for stable callback with fresh value
const priceRef = useRef(price);
useEffect(() => { priceRef.current = price; }, [price]);
const handleSubmit = useCallback(() => {
  submitOrder({ price: priceRef.current });
}, []);
```

**Symptomy:**

- Wysyłane stare wartości w formularzach
- Stan „zamrożony" w callbackach mimo zmiany w UI
- Bug widoczny tylko po zmianie danych

**Regex detekcji:** `useCallback\(\(?.*\)?\s*=>\s*\{[^}]*\b(price|data|value)\b[^}]*\},\s*\[\s*\]\)`

---

### SE-03: Memory Leak w WebSocket/SSE Subscriptions

**Severity:** CRITICAL
**Stack:** React

**Sytuacja:** Komponent dashboardu subskrybuje WebSocket (live prices). Użytkownik przechodzi na inną stronę — subscription nie cleanup. Po 10 nawigacjach: 10 aktywnych WS.

**Dlaczego to boli:** Niezamknięta subskrypcja = pamięć + otwarte połączenie. Limit ~6 połączeń per origin — dojście do limitu blokuje nowe requesty.

**Rozwiązanie:**

```tsx
// BAD — no cleanup
useEffect(() => {
  const ws = new WebSocket("wss://api.example.com/prices");
  ws.onmessage = (e) => setPrice(JSON.parse(e.data));
}, []);

// GOOD — cleanup + AbortController
useEffect(() => {
  const controller = new AbortController();
  const ws = new WebSocket("wss://api.example.com/prices");
  ws.onmessage = (e) => {
    if (!controller.signal.aborted) setPrice(JSON.parse(e.data));
  };
  return () => { controller.abort(); ws.close(); };
}, []);
```

**Symptomy:**

- Rosnący RAM, warning `"Can't perform React state update on unmounted component"`
- Wiele połączeń WS w Network tab po nawigacji

**Regex detekcji:** `new WebSocket\(|EventSource\(.*(?!useEffect.*return|\.close\(\))`

---

### SE-04: Server Component vs Client Component Boundary Mistake

**Severity:** HIGH
**Stack:** Next.js

**Sytuacja:** Dashboard page jako Server Component (default App Router). Importujesz interactive chart → error `"useState is not allowed in Server Components"`. Dodajesz `'use client'` na page — tracisz SSR.

**Dlaczego to boli:** `'use client'` na page-level = cały subtree w JS klienta. Tracisz server-side data fetching, Suspense streaming, bundle rośnie.

**Rozwiązanie:**

```tsx
// BAD — 'use client' on entire page kills SSR
"use client";
export default function DashboardPage() {
  const data = useSWR("/api/prices");
  return <PriceChart data={data} />;
}

// GOOD — server page + client islands
// app/dashboard/page.tsx (Server Component — no 'use client')
export default async function DashboardPage() {
  const prices = await getLatestPrices();
  return <main><PriceChart initialData={prices} /></main>;
}
// components/PriceChart.tsx
"use client"; // ← only the interactive part
export function PriceChart({ initialData }: Props) {
  const [data, setData] = useState(initialData);
}
```

**Symptomy:**

- Runtime error o useState/useEffect w Server Components
- Brak SSR w View Source, nietypowo duży JS bundle

**Regex detekcji:** `'use client'.*export default function.*Page|page\.tsx.*'use client'`

---

### SE-05: TradingView Chart Re-render Storm

**Severity:** HIGH
**Stack:** TradingView

**Sytuacja:** Chart component re-renderuje się przy każdej zmianie state rodzica. Każdy render = `createChart()` + `setData()`. CPU 100%, chart flickers.

**Dlaczego to boli:** `createChart()` tworzy canvas, binduje eventy, parsuje dane. Wywoływanie 60×/s zabija wydajność.

**Rozwiązanie:**

```tsx
// BAD — chart recreated every render
useEffect(() => {
  const chart = createChart(containerRef.current!);
  chart.addCandlestickSeries().setData(data);
  return () => chart.remove();
}); // ← missing deps = runs every render!

// GOOD — create once, update incrementally
const chartRef = useRef<IChartApi | null>(null);
const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

useEffect(() => {
  if (!containerRef.current) return;
  chartRef.current = createChart(containerRef.current, { height: 400 });
  seriesRef.current = chartRef.current.addCandlestickSeries();
  return () => { chartRef.current?.remove(); chartRef.current = null; };
}, []);

useEffect(() => { seriesRef.current?.setData(data); }, [data]);
// + React.memo on wrapper component
```

**Symptomy:**

- CPU spike przy interakcji z dashboardem
- Chart flickering (biały flash)
- Error `"Maximum update depth exceeded"`

**Regex detekcji:** `createChart\(.*\)(?!.*useRef|.*useMemo)`

---

### SE-06: Bundle Size Explosion z Financial Libraries

**Severity:** HIGH
**Stack:** React

**Sytuacja:** `import { SMA } from 'technicalindicators'` — cały pakiet (~200 KB gzipped) w bundlu. Plus `lodash` (70 KB), `moment` (300 KB). Pół MB JS zanim user cokolwiek zobaczy.

**Dlaczego to boli:** Każde 100 KB JS = ~300 ms dłuższy TTI na mobile 4G. LCP > 3 s, Lighthouse < 50.

**Rozwiązanie:**

```tsx
// BAD — entire library in main bundle
import { SMA, EMA, RSI } from "technicalindicators";

// GOOD — dynamic import
const calc = async (data: number[]) => {
  const { SMA } = await import("technicalindicators");
  return SMA.calculate({ period: 14, values: data });
};

// GOOD — tree-shakeable alternatives
import { format } from "date-fns";
import groupBy from "lodash-es/groupBy";

// GOOD — Next.js dynamic for heavy components
const HeavyChart = dynamic(() => import("@/components/HeavyChart"), {
  loading: () => <ChartSkeleton />, ssr: false,
});
```

**Symptomy:**

- LCP > 3 s, bundle > 500 KB gzipped
- `@next/bundle-analyzer`: jedna biblioteka > 30% bundla

**Regex detekcji:** `import.*from ['"](?:moment|lodash|technicalindicators)['"](?!.*\{)`

---

### SE-07: Optimistic UI z Race Condition na Order

**Severity:** CRITICAL
**Stack:** React

**Sytuacja:** Klik „Buy" → UI optymistycznie: „Order submitted". Backend rejectuje (insufficient funds). Stan UI = submitted, realny = rejected.

**Dlaczego to boli:** Rozbieżność UI vs backend w operacjach finansowych = realne straty. Naruszenie zasady rzetelnej prezentacji stanu.

**Rozwiązanie:**

```tsx
// BAD — optimistic success for financial operation
const placeOrder = async (order: Order) => {
  setStatus("submitted"); // ← DANGEROUS for financial ops
  try { await api.post("/orders", order); }
  catch { setStatus("failed"); }
};

// GOOD — explicit loading → confirmed/rejected
const placeOrder = async (order: Order) => {
  setStatus("submitting");
  try {
    await api.post("/orders", order);
    setStatus("confirmed");
  } catch (err) {
    setStatus("rejected");
    setError(parseApiError(err));
  }
};
```

**Symptomy:**

- User widzi „złożone" zlecenia których nie ma w backendzie
- „Order zniknął po odświeżeniu"
- Brak wpisu w historii zleceń mimo komunikatu sukcesu

---

### SE-08: Uncontrolled Re-fetching z React Query / SWR

**Severity:** MEDIUM
**Stack:** React

**Sytuacja:** `useQuery` z `refetchInterval: 1000` dla live price. 10 tabów = 10 req/s → 429 rate limit. `staleTime: 0` + `refetchOnWindowFocus` = fetch przy każdym alt-tab.

**Dlaczego to boli:** Rate limit blokuje dane. Przy metered API każdy request = realny koszt.

**Rozwiązanie:**

```tsx
// BAD — aggressive polling
const { data } = useQuery({
  queryKey: ["prices"], queryFn: fetchPrices,
  refetchInterval: 1000, staleTime: 0, refetchOnWindowFocus: true,
});

// GOOD — sane defaults + WS for real-time
const { data } = useQuery({
  queryKey: ["prices"], queryFn: fetchPrices,
  staleTime: 5_000, refetchOnWindowFocus: false, refetchInterval: 30_000,
});

// BETTER — WS invalidates cache
useEffect(() => {
  const ws = new WebSocket("wss://api.example.com/prices");
  ws.onmessage = () => queryClient.invalidateQueries({ queryKey: ["prices"] });
  return () => ws.close();
}, [queryClient]);
```

**Symptomy:**

- HTTP 429 Too Many Requests
- Network tab zalany identycznymi requestami
- Dane „migają" przy focus/blur okna

**Regex detekcji:** `refetchInterval.*[0-9]{1,3}[^0-9]|staleTime.*0[^0-9]`

---

### SE-09: Number Precision Loss w JavaScript

**Severity:** HIGH
**Stack:** TypeScript

**Sytuacja:** `0.1 + 0.2 = 0.30000000000000004`. Porównanie `price === 0.3` → `false`. Duże wartości (> 2^53) tracą precyzję.

**Dlaczego to boli:** Błąd na 4. miejscu po przecinku przy dużych wolumenach = realne rozbieżności. Stop-loss/limit order mogą nie zadziałać.

**Rozwiązanie:**

```tsx
// BAD — floating point for money
const total = price * quantity; // 0.30000000000000004
if (total === 0.3) { /* never true */ }

// GOOD — Decimal.js
import Decimal from "decimal.js";
const total = new Decimal(price).times(quantity);

// GOOD — string amounts from API
interface PriceDTO { amount: string; currency: string; } // NOT number

// GOOD — epsilon comparison when Decimal.js is overkill
const almostEqual = (a: number, b: number, eps = 1e-8) =>
  Math.abs(a - b) < eps;
```

**Symptomy:**

- Ceny z wieloma miejscami po przecinku w UI
- Porównania cenowe zwracają `false` dla równych wartości
- Zaokrąglenia niezgodne z backendem

**Regex detekcji:** `===.*0\.\d+|parseFloat\(.*price|Number\(.*amount`

---

### SE-10: CSS Z-Index War z Overlays i Tooltips

**Severity:** MEDIUM
**Stack:** React

**Sytuacja:** Tooltip `z-index: 100`, modal `999`, dropdown `50`, toast `10000`. Nowy dev dodaje `99999`. Brak systemu — każdy override wygrywa chwilowo.

**Dlaczego to boli:** Bez ustalonych warstw każda zmiana z-indexu jest loterią. Hotfix (wyższy z-index) pogarsza problem systemowo.

**Rozwiązanie:**

```css
/* GOOD — z-index scale in design tokens */
:root {
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-modal-backdrop: 300;
  --z-modal: 400;
  --z-tooltip: 500;
  --z-toast: 600;
}
.modal { z-index: var(--z-modal); }
.tooltip { z-index: var(--z-tooltip); }

/* GOOD — isolation for stacking contexts */
.chart-container { isolation: isolate; }
```

**Symptomy:**

- Tooltip pod modalem, toast niewidoczny
- „Działa po dodaniu `z-index: 99999`" w PR
- Regresje z-indexu po drobnych zmianach CSS

**Regex detekcji:** `z-index:\s*\d{3,}|zIndex:\s*\d{3,}`
