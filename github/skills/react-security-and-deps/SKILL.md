---
name: react-security-and-deps
description: "Zabezpiecza React na granicach HTML, markdown, URL, public env vars, SSR payload, CSP/Trusted Types i zaleznosci npm."
---
slug: react-security-and-deps

# React: bezpieczenstwo i zarzadzanie zaleznosciami

## Short description

Zabezpieczaj aplikacje React na granicach danych, DOM, linkow, zaleznosci i konfiguracji builda. Ten skill obejmuje XSS, `dangerouslySetInnerHTML`, sanitizacje, URL validation, sekrety, CSP, supply chain i bezpieczny review paczek.

## Use cases / When to use

- Renderujesz HTML, markdown, rich text albo dane od uzytkownika.
- Dodajesz nowa zaleznosc npm lub aktualizujesz paczki frontendu.
- Debugujesz audit, CVE, transitive dependency albo dependency confusion risk.
- Projektujesz linki zewnetrzne, iframe, pliki, uploady lub integracje third-party.
- Recenzujesz PR dotykajacy env vars, auth UI, storage, cookies albo tokenow.
- Chcesz ustalic bezpieczne zasady dla `dangerouslySetInnerHTML`, CSP i sanitizacji.

## When NOT to use

- Problem dotyczy backend auth, RBAC, rate limiting lub sesji serwerowej; uzyj `implementing-backend`.
- Problem dotyczy zarzadzania sekretami w chmurze/Kubernetes; uzyj `managing-secrets`.
- Problem dotyczy ogolnych zaleznosci Node runtime; uzyj `node-backend-guidelines`.
- Problem dotyczy tylko wersjonowania pakietow i struktury TS; uzyj `ts-project-structure`.

## Key rules and concrete guidance

- React domyslnie escapuje tekst w JSX. Najwieksze ryzyko XSS pojawia sie przy `dangerouslySetInnerHTML`, parserach markdown/rich text, URL, iframe i bibliotekach manipulujacych DOM.
- Nigdy nie przekazuj niezweryfikowanego HTML do `dangerouslySetInnerHTML`. Sanitizuj zaufana biblioteka, np. DOMPurify przez SSR-safe wrapper, i ogranicz dozwolone tagi/atrybuty.
- Gdy stack to wspiera, lacz sanitizacje z Trusted Types i CSP. Sanitizer ma byc jedyna droga tworzenia HTML, a polityka CSP powinna blokowac przypadkowe inline script.

```tsx
import DOMPurify from 'isomorphic-dompurify';

function SafeHtml({ html }: { html: string }) {
  const sanitized = React.useMemo(
    () => DOMPurify.sanitize(html, { ALLOWED_TAGS: ['p', 'strong', 'em', 'a'] }),
    [html]
  );
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
```

- Markdown nie jest automatycznie bezpieczny. Skonfiguruj renderer tak, aby blokowal raw HTML i sanitizowal/allowlistowal linki oraz atrybuty, albo sanitizuj wynik przed renderowaniem.
- Waliduj URL przed uzyciem w `href`, `src`, redirectach i `window.open`. Blokuj `javascript:`, podejrzane schematy i hosty spoza allowlist.

```ts
function getSafeExternalUrl(value: string, allowedHosts: readonly string[]) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !allowedHosts.includes(url.host)) return null;
    return url.toString();
  } catch {
    return null;
  }
}
```

- Linki z `target="_blank"` musza miec `rel="noreferrer noopener"`.
- Frontend nie jest zrodlem autoryzacji. Ukrycie przycisku nie zastepuje kontroli uprawnien na backendzie.
- Nie zapisuj access tokenow w localStorage, jesli threat model obejmuje XSS. Preferuj bezpieczne, httpOnly cookies dla sesji, gdy architektura to wspiera.
- Nie loguj tokenow, cookies, danych PII ani payloadow auth w konsoli lub telemetry.
- Zmienne `NEXT_PUBLIC_*`, `VITE_*`, `REACT_APP_*` sa publiczne w bundlu. Nie umieszczaj tam sekretow.
- CSP powinien ograniczac skrypty, style, obrazy i frame origins. Unikaj `unsafe-inline`, gdy stack pozwala na nonce/hash.
- Iframe powinien miec ograniczony `sandbox`, `allow` i allowlist hostow.
- Uploady i pliki traktuj jako niezaufane. Waliduj typ i rozmiar po stronie serwera; frontend moze tylko pomagac UX.
- Nowa zaleznosc wymaga sprawdzenia: utrzymanie, licencja, bundle size, transitive deps, CVE, popularnosc, alternatywy i potrzeba biznesowa.
- Pinuj lockfile i uzywaj jednego package managera. Nie commituj zmian lockfile niezrozumialych dla zakresu PR.
- Preferuj male, wyspecjalizowane biblioteki z aktywnym maintenance zamiast paczek z duzym transitive tree.
- Audit traktuj jako sygnal ryzyka. Zweryfikuj exploitability w kontekcie bundla frontendowego, ale nie ignoruj high/critical bez uzasadnienia.
- Unikaj pakietow z postinstall scripts, jesli nie sa niezbedne. Przy krytycznych zaleznosciach sprawdz provenance/signatures, gdy narzedzia repo to wspieraja.
- Nie kopiuj kodu z README paczki bez dostosowania do CSP, SSR i typow danych.
- Dla SSR uwazaj na data leakage: nie serializuj sekretow, cookies, server-only config ani pelnych obiektow user/session do klienta.
- Waliduj dane przychodzace z API mimo TypeScript. TS nie chroni przed zlosliwym JSON.

## Typical mistakes / anti-patterns to avoid

- `dangerouslySetInnerHTML` z danymi uzytkownika bez sanitizacji.
- Akceptowanie dowolnego `href` lub `src` z API.
- Brak `rel="noopener noreferrer"` przy `target="_blank"`.
- Sekrety w publicznych env vars frontendu.
- Tokeny w localStorage bez swiadomego threat modelu.
- Poleganie na ukryciu UI jako mechanizmie uprawnien.
- Dodanie duzej zaleznosci dla jednego helpera.
- Ignorowanie zmian lockfile i transitive dependencies.
- Wylaczanie audit/security checks bez opisu ryzyka.
- Serializacja server-only danych do hydration payload.

## Checklist for PR reviews

- [ ] Dane renderowane jako HTML sa sanitizowane albo raw HTML jest zablokowany.
- [ ] URL w `href`, `src`, redirectach i `window.open` sa walidowane.
- [ ] Zewnetrzne linki `_blank` maja `noopener noreferrer`.
- [ ] Publiczne env vars nie zawieraja sekretow ani tokenow.
- [ ] Auth/permissions sa egzekwowane po stronie backendu, nie tylko w UI.
- [ ] Nowa zaleznosc ma uzasadnienie, akceptowalny bundle impact i aktywne maintenance.
- [ ] Lockfile zmienil sie tylko zgodnie z intencja PR.
- [ ] Audit high/critical jest naprawiony albo ma jawne uzasadnienie i plan.
- [ ] SSR nie serializuje server-only danych do klienta.
- [ ] Dane z API sa walidowane na granicy, jesli wplywaja na bezpieczenstwo UI.

## Example snippets

```tsx
function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  const safeHref = getSafeExternalUrl(href, ['example.com']);
  if (!safeHref) return <span>{children}</span>;

  return (
    <a href={safeHref} target="_blank" rel="noreferrer noopener">
      {children}
    </a>
  );
}
```

```tsx
function MarkdownPreview({ markdown }: { markdown: string }) {
  const html = React.useMemo(() => renderSanitizedMarkdownWithoutRawHtml(markdown), [markdown]);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
```

```ts
const publicConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL
};

if (!publicConfig.apiBaseUrl) {
  throw new Error('Missing public API base URL');
}
```

## Trigger description

React security: XSS, safe HTML, URL validation, public env vars, auth UI i npm deps.
