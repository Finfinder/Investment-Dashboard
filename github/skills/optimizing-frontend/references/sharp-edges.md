# Sharp Edges — Optymalizacja Frontendu

Znane pułapki, które powodują regresje wydajności i zmarnowany wysiłek optymalizacyjny. Każdy wpis opisuje sytuację, przyczynę bólu, rozwiązanie i symptomy. Lista jest komplementarna wobec anty-wzorców w SKILL.md — nie powielaj ich.

## Spis treści

- [SE-01: Optymalizacja złej rzeczy](#se-01-optymalizacja-złej-rzeczy)
- [SE-02: Blokowanie głównego wątku](#se-02-blokowanie-głównego-wątku)
- [SE-03: Nadmierna memoizacja](#se-03-nadmierna-memoizacja)
- [SE-04: Layout thrashing w pętli](#se-04-layout-thrashing-w-pętli)
- [SE-05: Bugi cache invalidation](#se-05-bugi-cache-invalidation)
- [SE-06: Eksplozja rozmiaru bundla](#se-06-eksplozja-rozmiaru-bundla)
- [SE-07: Wycieki pamięci w SPA](#se-07-wycieki-pamięci-w-spa)

---

### SE-01: Optymalizacja złej rzeczy

**Severity:** CRITICAL | **Stack:** Universal

**Sytuacja:** Spędzasz tydzień optymalizując zapytania bazodanowe. Wydajność się nie poprawia. Bottleneck to wywołanie third-party API trwające 2 sekundy per request.

**Dlaczego to boli:** Intuicja o wydajności jest zwykle błędna. Bez profilowania zgadujesz. Większość czasu optymalizacji marnuje się na rzeczy bez wpływu.

**Rozwiązanie:** ZAWSZE mierz najpierw. Optymalizuj TYLKO to, co dane wskazują jako wolne.

**Frontend:** Chrome DevTools → Performance tab → kliknij Record → wykonaj akcję → Stop. Szukaj: długich tasków (>50ms), dużych drzew renderowania, wolnych requestów sieciowych. Uzupełnij o Lighthouse (Performance score, Core Web Vitals).

**Co mierzyć:**

- Czas odpowiedzi: P50, P95, P99
- TTFB (Time to First Byte)
- Liczba i czas zapytań DB
- Zużycie pamięci i CPU

**Backend:** Patrz sekcja „Profilowanie backendu" w skillu `implementing-backend` — komendy `node --prof`, `python -m cProfile`, `pg_stat_statements`.

**Symptomy:**

- "Zoptymalizowałem X ale nic się nie poprawiło"
- Problemy wydajnościowe utrzymują się po optymalizacji
- Skupienie na mikro-optymalizacjach zamiast na bottlenecku

**Regex detekcji:** nie dotyczy

---

### SE-02: Blokowanie głównego wątku

**Severity:** HIGH | **Stack:** Browser/Universal

**Sytuacja:** Użytkownik klika przycisk i UI zamraża się na 3 sekundy. Przycisk nawet nie pokazuje stanu ładowania. Przetwarzasz duży zbiór danych synchronicznie na głównym wątku.

**Dlaczego to boli:** JavaScript jest jednowątkowy. Podczas wykonywania kodu przeglądarka nie może reagować na input ani aktualizować UI. Każda operacja >50ms blokuje odczuwalnie.

**Rozwiązanie:** Przenieś ciężkie obliczenia do Web Workera lub rozbij na chunki.

```javascript
// Web Worker — ciężkie obliczenia poza głównym wątkiem
// worker.js
self.onmessage = ({ data }) => {
  const result = heavyComputation(data);
  self.postMessage(result);
};

// main.js
const worker = new Worker('worker.js');
worker.postMessage(largeDataset);
worker.onmessage = ({ data }) => {
  setResult(data);
};
```

```javascript
// Rozbijanie na chunki — oddaj kontrolę przeglądarce między iteracjami
async function processInChunks(items, chunkSize = 100) {
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    processChunk(chunk);
    await new Promise(resolve => setTimeout(resolve, 0)); // oddaj kontrolę
  }
}
```

Alternatywnie: przenieś ciężkie przetwarzanie na serwer.

**Symptomy:**

- UI zamraża się na kliknięcie
- Brak feedbacku ładowania
- Ostrzeżenie przeglądarki "strona nie odpowiada"
- INP > 200ms

**Regex detekcji:** nie dotyczy

---

### SE-03: Nadmierna memoizacja

**Severity:** HIGH | **Stack:** React

**Sytuacja:** Memoujesz każdy komponent i opakowujesz każdą funkcję w `useCallback`. Wydajność się pogarsza. Zużycie pamięci rośnie. Kod staje się nieczytelny. React DevTools pokazuje ciągłe re-rendery mimo to.

**Dlaczego to boli:** Memoizacja ma narzut. Porównywanie propsów kosztuje czas. Przechowywanie zbuforowanych wartości kosztuje pamięć. Jeśli komponent jest tani do renderowania, memoizacja kosztuje więcej niż re-render.

**Rozwiązanie:** Używaj strategicznie. Profiling first — React DevTools Profiler → nagraj sesję → znajdź kosztowne rendery (>16ms) → memoizuj TYLKO te.

**Powiązane antywzorce:** memoizowanie każdego komponentu, cache'owanie błahych obliczeń, stabilizowanie handlerów nieprzekazywanych dalej, memoizacja wartości, której zależności zmieniają się przy każdym renderze.

```javascript
// TAK: Kosztowny render + często te same propsy
const ExpensiveChart = memo(function Chart({ data }) {
  return <svg>...</svg>; // złożone renderowanie SVG
});

// TAK: Callback przekazywany do memoizowanego dziecka
const handleClick = useCallback((id) => {
  setSelected(id);
}, []);

// NIE: Tani komponent — memo kosztuje więcej niż re-render
const Button = memo(function Button({ children }) {
  return <button>{children}</button>;
});

// NIE: Propsy zawsze się zmieniają — memo bezużyteczne
const Display = memo(function Display({ data }) {
  return <div>{data.value}</div>; // rodzic zawsze tworzy nowy obiekt
});
```

**Symptomy:**

- Wydajność gorsza po dodaniu memoizacji
- Nieaktualne dane lub callbacki
- Rosnące zużycie pamięci

**Regex detekcji:** nie dotyczy (patrz tabela decyzyjna memoizacji w SKILL.md)

---

### SE-04: Layout thrashing w pętli

**Severity:** HIGH | **Stack:** Browser

**Sytuacja:** Animacja zacina się na 10fps. DevTools pokazuje "Forced reflow". Odczytujesz właściwości layoutu (`offsetHeight`) i natychmiast piszesz style w pętli.

**Dlaczego to boli:** Odczyt właściwości layoutu wymusza przeliczenie layoutu. Jeśli piszesz style, a potem odczytujesz layout w pętli, przeglądarka nie może zbatchować pracy. Każda iteracja wymusza pełne przeliczenie.

**Rozwiązanie:** Zbatchuj odczyty osobno od zapisów. Używaj CSS transforms zamiast właściwości triggerujących layout.

**Powiązane antywzorce:** animowanie `top`/`left`/`width`/`height`, stałe `will-change`, głęboki DOM z wieloma wrapperami, fallback lazy loadingu bez stabilnych wymiarów.

```javascript
// ŹLE: Wzorzec read-write-read-write
elements.forEach(el => {
  const height = el.offsetHeight;  // wymusza layout
  el.style.height = height + 10 + 'px';  // zapis
  // następna iteracja wymusi layout ponownie
});

// DOBRZE: Zbatchuj odczyty, potem zapisy
const heights = elements.map(el => el.offsetHeight);  // wszystkie odczyty
elements.forEach((el, i) => {
  el.style.height = heights[i] + 10 + 'px';  // wszystkie zapisy
});
```

```javascript
// ŹLE: triggeruje layout
element.style.left = x + 'px';
element.style.top = y + 'px';

// DOBRZE: akceleracja GPU, bez layoutu
element.style.transform = `translate(${x}px, ${y}px)`;
```

**Symptomy:**

- Szarpane animacje
- "Forced reflow" w DevTools
- Wysokie czasy paint/layout

**Regex detekcji:** `offsetHeight|offsetWidth|getBoundingClientRect`

---

### SE-05: Bugi cache invalidation

**Severity:** MEDIUM | **Stack:** Universal

**Sytuacja:** Użytkownik aktualizuje profil, ale nadal widzi stare dane. Odświeżenie strony pokazuje nowe dane. Czasem dane poprawne, czasem stale. Użytkownicy raportują "losowe" bugi znikające po odświeżeniu.

**Dlaczego to boli:** Cache bez właściwej invalidacji tworzy stale dane. Różne warstwy cache (przeglądarka, CDN, Redis, ORM) mają różne TTL. Gdy dane się zmieniają, nie wszystkie cache'e są unieważniane.

**Rozwiązanie:**

**Frontend (client-side):** Przy mutacji danych invaliduj cache kliencki:

- React Query: `queryClient.invalidateQueries({ queryKey: ['users'] })`
- SWR: `mutate('/api/users')`
- Service Worker: `caches.delete('api-cache')`

**Server-side patterns** (patrz też skill `implementing-backend`, sekcja Cachowanie):

```javascript
// Explicit invalidation
async function updateUser(id, data) {
  await db.user.update({ where: { id }, data });
  // Unieważnij powiązane cache'e
  await cache.del(`user:${id}`);
  await cache.del(`user:${id}:profile`);
  await cache.del(`users:list`); // unieważnij też listę
}
```

```javascript
// Cache tags (grupowa invalidacja)
await cache.set(`user:${id}`, data, { tags: ['users', `user:${id}`] });
await cache.invalidateTag('users'); // czyści wszystkie cache'e użytkowników
```

```text
// Krótki TTL + stale-while-revalidate
Cache-Control: public, max-age=60, stale-while-revalidate=3600
```

**Symptomy:**

- Stale dane po aktualizacji
- "Działa po odświeżeniu"
- Niespójne zachowanie między użytkownikami

**Regex detekcji:** nie dotyczy

---

### SE-06: Eksplozja rozmiaru bundla

**Severity:** MEDIUM | **Stack:** Universal/React/Next.js

**Sytuacja:** Ładowanie strony trwa 8 sekund. DevTools pokazuje 2MB JavaScript do pobrania. Dodawano `npm install` po `npm install` bez kontroli. Sam moment.js waży 300KB.

**Dlaczego to boli:** Każdy `npm install` dodaje do bundla. Wiele bibliotek jest większych niż się wydaje. Bez monitoringu bundle rośnie niezauważalnie aż użytkownicy zaczną narzekać.

**Rozwiązanie:** Analizuj bundle, zamieniaj ciężkie biblioteki, lazy loaduj duże komponenty.

**Powiązane antywzorce:** wildcard imports, baryłki re-eksportujące cały folder, pełny framework CSS bez purge, wiele wersji tej samej zależności, niekrytyczne third-party scripts ładowane na starcie.

```javascript
// Analizuj co jest w bundlu
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
module.exports = withBundleAnalyzer({});
// Uruchom: ANALYZE=true npm run build
```

```javascript
// Zamień ciężkie biblioteki na lżejsze

// ŹLE: moment.js — 300KB
import moment from 'moment';
// DOBRZE: date-fns — tree-shakeable, bierz co potrzebujesz
import { format } from 'date-fns';

// ŹLE: cały lodash — 70KB
import _ from 'lodash';
// DOBRZE: pojedynczy import
import debounce from 'lodash/debounce';
// NAJLEPIEJ: natywna implementacja
function debounce(fn, ms) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}
```

```javascript
// Lazy load ciężkie komponenty
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('./Chart'), { ssr: false });
```

**Symptomy:**

- Wolne ładowanie strony
- Spadający wynik Lighthouse
- Rosnący czas pobierania JS

**Regex detekcji:** `from ['"]moment['"]|from ['"]lodash['"]`

---

### SE-07: Wycieki pamięci w SPA

**Severity:** MEDIUM | **Stack:** React/Browser

**Sytuacja:** SPA działa dobrze na początku. Po godzinie używania staje się powolne. Tab crashuje po dłuższym użyciu. Memory profiler w DevTools pokazuje stały wzrost.

**Dlaczego to boli:** Event listenery bez cleanup. Closures trzymające referencje do dużych obiektów. Setki komponentów akumulujących stan. Timery działające po odmontowaniu komponentu.

**Rozwiązanie:** ZAWSZE cleanup w `useEffect`. Debuguj z Chrome DevTools Memory tab.

**Powiązane antywzorce:** efekt bez funkcji cleanup, interwał bez `clearInterval`, request bez `AbortController`, obserwator bez `disconnect()`, WebSocket bez `close()`, object URL bez `URL.revokeObjectURL()`.

```javascript
// ZAWSZE cleanup w useEffect
useEffect(() => {
  const handler = (e) => handleResize(e);
  window.addEventListener('resize', handler);

  const interval = setInterval(fetchData, 5000);

  const controller = new AbortController();
  fetch('/api/data', { signal: controller.signal });

  return () => {
    window.removeEventListener('resize', handler);
    clearInterval(interval);
    controller.abort();
  };
}, []);

// Debugowanie: Chrome DevTools → Memory tab → Heap Snapshot
// Porównaj snapshoty w czasie. Sprawdź "Retainers" by znaleźć co trzyma referencje.
```

**Symptomy:**

- Zużycie pamięci rośnie w czasie
- Aplikacja zwalnia po dłuższym użyciu
- Tab crashuje

**Regex detekcji:** `addEventListener|setInterval|setTimeout`
