# Reguły Walidacji — Implementing Frontend

Reguły walidacji specyficzne dla stacku **React 18+/Next.js 14+ (App Router) + TypeScript + TradingView Lightweight Charts**. Uzupełniają uniwersalne reguły z `code-reviewing/references/validations.md` — nie powielają ich.

**Sposób użycia:** Dla każdej reguły uruchom `grep_search` z podanym wzorcem regex i wzorcem `includePattern` odpowiadającym polu „Dotyczy". Traktuj trafienia jako kandydatów — zweryfikuj kontekst przed zgłoszeniem.

## Podsumowanie reguł

| ID   | Nazwa                                      | Severity | Kategoria                    |
| ---- | ------------------------------------------ | -------- | ---------------------------- |
| V-01 | 'use client' on Page Component             | WARNING  | Next.js App Router           |
| V-02 | Server Component Using Client Hooks        | ERROR    | Next.js App Router           |
| V-03 | Fetch Without Revalidation Strategy        | WARNING  | Next.js App Router           |
| V-04 | Missing Loading/Error Boundary             | INFO     | Next.js App Router           |
| V-05 | Inline Object/Array in JSX Props           | WARNING  | React Patterns               |
| V-06 | Missing React.memo on Expensive Component  | INFO     | React Patterns               |
| V-07 | Prop Type 'any'                            | ERROR    | React Patterns               |
| V-08 | Missing Key in Dynamic List                | ERROR    | React Patterns               |
| V-09 | TradingView Chart Without Cleanup          | ERROR    | TradingView & Financial UI   |
| V-10 | Financial Number Without Formatting        | WARNING  | TradingView & Financial UI   |
| V-11 | Hardcoded Chart Dimensions                 | WARNING  | TradingView & Financial UI   |
| V-12 | WebSocket Without Reconnection             | WARNING  | TradingView & Financial UI   |

---

## Next.js App Router

### V-01: 'use client' on Page Component

**Severity:** WARNING
**Dotyczy:** `**/app/**/page.tsx`

**Opis:** Page z `'use client'` traci korzyści SSR/streaming — cała strona trafia do client bundle, brak progressive rendering i brak server-side data fetching.

**Regex detekcji:**
```
'use client'.*export\s+(default\s+)?function\s+\w*Page
```

**Akcja naprawcza:** Page powinien być Server Component. Wydziel interaktywne części do osobnych Client Components i importuj je w Server Component page.

---

### V-02: Server Component Using Client Hooks

**Severity:** ERROR
**Dotyczy:** `**/app/**/*.tsx`

**Opis:** Użycie `useState`, `useEffect`, `useRef` lub `useCallback` w pliku bez dyrektywy `'use client'` powoduje runtime error — Server Components nie obsługują hooków React.

**Regex detekcji:**
```
(?:useState|useEffect|useRef)\(
```

> **Uwaga:** Sprawdź ręcznie, czy plik ma `'use client'` na górze. Regex wykrywa użycie hooków — brak dyrektywy oznacza błąd.

**Akcja naprawcza:** Dodaj `'use client'` na początku pliku lub wydziel logikę interaktywną do osobnego Client Component.

---

### V-03: Fetch Without Revalidation Strategy

**Severity:** WARNING
**Dotyczy:** `**/app/**/*.tsx **/app/**/*.ts`

**Opis:** Server-side `fetch()` bez opcji `next: { revalidate }` ani `cache` — domyślne zachowanie cache zależy od wersji Next.js, co prowadzi do nieprzewidywalnych wyników.

**Regex detekcji:**
```
fetch\([^)]+\)(?!.*revalidate|.*cache|.*no-store)
```

**Akcja naprawcza:** Jawnie ustaw strategię: `{ next: { revalidate: 60 } }` dla ISR lub `{ cache: 'no-store' }` dla danych real-time.

---

### V-04: Missing Loading/Error Boundary

**Severity:** INFO
**Dotyczy:** `**/app/**/page.tsx`

**Opis:** Katalog z `page.tsx` bez towarzyszącego `loading.tsx` lub `error.tsx` — brak graceful fallback podczas ładowania i obsługi błędów.

**Regex detekcji:**
```
(Brak regex — sprawdź istnienie plików loading.tsx i error.tsx obok page.tsx)
```

**Akcja naprawcza:** Dodaj `loading.tsx` z komponentem Skeleton i `error.tsx` z UI odzyskiwania po błędzie (`reset()` callback).

---

## React Patterns

### V-05: Inline Object/Array in JSX Props

**Severity:** WARNING
**Dotyczy:** `**/*.tsx`

**Opis:** Inline obiekty (`style={{color:'red'}}`) i tablice (`data={[1,2,3]}`) w propsach JSX tworzą nową referencję przy każdym renderze — powodują niepotrzebne re-rendery komponentów potomnych.

**Regex detekcji:**
```
<\w+[^>]*(?:style|data|options|config)=\{\{|<\w+[^>]*=\{\[[^\]]*\]\}
```

**Akcja naprawcza:** Użyj `useMemo` do memoizacji obiektów/tablic lub wyciągnij je do stałej poza komponent.

---

### V-06: Missing React.memo on Expensive Component

**Severity:** INFO
**Dotyczy:** `**/components/**/*.tsx`

**Opis:** Komponent renderujący chart, table, list lub grid bez `React.memo` — re-renderuje się przy każdej zmianie rodzica, nawet gdy propsy się nie zmieniły.

**Regex detekcji:**
```
export\s+(default\s+)?function\s+\w*(Chart|Table|List|Grid|Dashboard)\b(?!.*memo)
```

**Akcja naprawcza:** Opakuj w `React.memo`: `export const Chart = React.memo(function Chart(...) { ... })`.

---

### V-07: Prop Type 'any'

**Severity:** ERROR
**Dotyczy:** `**/*.tsx **/*.ts`

**Opis:** Props z typem `any` eliminują type safety TypeScript — błędy typów przechodzą do runtime zamiast być wychwycone przez kompilator.

**Regex detekcji:**
```
:\s*any\b|<any>|as\s+any\b
```

**Akcja naprawcza:** Zdefiniuj jawny typ. Jeśli typ jest naprawdę nieznany, użyj `unknown` z type guard.

---

### V-08: Missing Key in Dynamic List

**Severity:** ERROR
**Dotyczy:** `**/*.tsx`

**Opis:** `.map()` bez prop `key` lub z index jako key na liście, która może być sortowana/filtrowana — powoduje błędy reconciliation i utratę stanu komponentów.

**Regex detekcji:**
```
\.map\([^)]*\)\s*=>\s*(?:<\w+(?!\s+key=)|<\w+\s+key=\{(?:i|index|idx)\})
```

**Akcja naprawcza:** Użyj stabilnego unique ID jako key (`item.id`). Nigdy index na liście z sortowaniem/filtrowaniem.

---

## TradingView & Financial UI

### V-09: TradingView Chart Without Cleanup

**Severity:** ERROR
**Dotyczy:** `**/*.tsx **/*.ts`

**Opis:** Wywołanie `createChart()` bez `chart.remove()` w cleanup function `useEffect` — powoduje memory leak, szczególnie przy nawigacji między stronami.

**Regex detekcji:**
```
createChart\((?![\s\S]*?return[\s\S]*?\.remove\(\))
```

**Akcja naprawcza:** Zawsze cleanup: `useEffect(() => { const chart = createChart(...); return () => chart.remove(); }, [])`.

---

### V-10: Financial Number Without Formatting

**Severity:** WARNING
**Dotyczy:** `**/*.tsx`

**Opis:** Surowa wartość liczbowa (price, amount, balance) wyświetlana w JSX bez formatowania — brak separatorów tysięcy, symbolu waluty, kontroli miejsc dziesiętnych.

**Regex detekcji:**
```
\{(?:price|amount|value|balance|total|cost|pnl|return)\}(?!.*format|.*toFixed|.*Intl)
```

**Akcja naprawcza:** Użyj formattera: `Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' })` lub custom `formatCurrency()`.

---

### V-11: Hardcoded Chart Dimensions

**Severity:** WARNING
**Dotyczy:** `**/*.tsx **/*.ts`

**Opis:** `createChart()` z hardcoded `width`/`height` — chart nie jest responsywny, psuje layout na urządzeniach mobilnych i przy resize okna.

**Regex detekcji:**
```
createChart\(\{[^}]*width:\s*\d+|createChart\(\{[^}]*height:\s*\d+
```

**Akcja naprawcza:** Użyj `ResizeObserver` + `chart.resize()` lub opcji `autoSize: true` w konfiguracji chartu.

---

### V-12: WebSocket Without Reconnection

**Severity:** WARNING
**Dotyczy:** `**/*.tsx **/*.ts`

**Opis:** `new WebSocket()` bez logiki reconnection — przy utracie połączenia dane przestają płynąć, a użytkownik nie wie o problemie.

**Regex detekcji:**
```
new WebSocket\((?!.*reconnect|.*retry|.*backoff)
```

**Akcja naprawcza:** Zaimplementuj reconnection z exponential backoff, heartbeat/ping-pong i wskaźnik stanu połączenia w UI.
