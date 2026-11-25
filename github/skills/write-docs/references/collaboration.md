# Kontrakty Współpracy — Writing Docs

Materiał referencyjny definiujący granice odpowiedzialności i interfejsy między skillem `writing-docs` a jego kluczowymi partnerami. Każdy kontrakt precyzuje co dostarcza każda ze stron i jak wygląda punkt styku.

## Spis treści

- [Implementing Backend](#implementing-backend)
- [Code Reviewing](#code-reviewing)
- [Architecture Designing](#architecture-designing)
- [Analyzing Fundamentals](#analyzing-fundamentals)
- [Implementing Frontend](#implementing-frontend)
- [Testing E2E](#testing-e2e)
- [Routing i Eskalacje](#routing-i-eskalacje)

## Routing i Eskalacje

| Sytuacja | Eskaluj do | Kontekst do przekazania | Powód |
| --- | --- | --- | --- |
| Projektowanie endpointów, kontraktów API, wersjonowania lub konwencji błędów | `architecture-designing` | Aktualne endpointy, wymagania, kontekst domenowy, ograniczenia kompatybilności | Dokumentacja opisuje kontrakt, ale nie powinna projektować go w izolacji |
| Implementacja backendowa opisywana w docs nie istnieje albo jest niespójna | `implementing-backend` | Wymagania funkcjonalne, istniejący kod, oczekiwane request/response, błędy | Najpierw trzeba ustabilizować zachowanie, potem je udokumentować |
| Komponent UI, Storybook, props albo warianty nie są gotowe | `implementing-frontend` | Komponent, typy props, warianty, stany, wymagania a11y | Docs mają dokumentować działający komponent i jego publiczne API |
| Snippet wygląda nieidiomatycznie, niebezpiecznie albo pomija edge cases | `code-reviewing` | Snippet, cel edukacyjny, audience, kontekst repo | Przykłady w docs są wzorcami kopiowanymi przez użytkowników |
| Przykład wymaga flow przeglądarkowego lub integracyjnego | `testing-e2e` | Kroki użytkownika, oczekiwane outputy, środowisko, dane testowe | Weryfikacja wymaga testu user flow, nie tylko statycznego review |
| Dokument opisuje model finansowy, wskaźnik albo metodologię wyceny | `analyzing-fundamentals` | Wzory, źródła danych, założenia, ograniczenia, odbiorcy | Poprawność merytoryczna domeny jest wejściem dla dokumentacji |

## Implementing Backend

**Ten skill dostarcza:**

- Strukturę i treść dokumentacji API (endpointy, autentykacja, kody błędów)
- Kopiowalne snippety curl/fetch dla każdego endpointu
- Progressive disclosure: quick start → pełna referencyjna dokumentacja
- Szablony changelog i migration guide przy zmianach API

**Partner dostarcza:**

- Działające endpointy REST/GraphQL z rzeczywistymi schematami request/response
- Kody błędów i ich semantykę biznesową
- Wymagania autentykacji i autoryzacji (Bearer, API key, OAuth2 flow)
- Informacje o rate limitach, paginacji i wersjonowaniu API

**Przykład interfejsu:**

Backend dostarcza działający endpoint i schemat, docs tworzy kompletną dokumentację z przykładami.

```python
# Backend dostarcza schemat i endpoint
@router.get("/portfolios/{portfolio_id}/holdings", response_model=list[Holding])
async def get_holdings(portfolio_id: str, page: int = 1, limit: int = 50):
    """Zwraca pozycje portfela z paginacją."""
    return await portfolio_service.get_holdings(portfolio_id, page, limit)

# Docs tworzy snippet do dokumentacji
# ```bash
# curl -H "Authorization: Bearer $TOKEN" \
#   "https://api.example.com/portfolios/pf_8xK2m/holdings?page=1&limit=50"
# ```
# Response 200:
# {"data": [{"symbol": "AAPL", "quantity": 100, "avg_price": 178.50}],
#  "meta": {"page": 1, "total": 12}}
```

## Code Reviewing

**Ten skill dostarcza:**

- Snippety kodu z dokumentacji do weryfikacji jakości
- Kontekst użycia snippetów (audience, cel edukacyjny)
- Komentarze w kodzie do przeglądu (WHY vs WHAT, kompletność)

**Partner dostarcza:**

- Uwagi dot. jakości kodu w przykładach (best practices, wzorce)
- Identyfikację potencjalnych edge cases nieujętych w snippetach
- Weryfikację poprawności wzorców (error handling, resource cleanup)
- Rekomendacje dot. idiomatyczności kodu w przykładach

**Przykład interfejsu:**

Docs pisze snippet edukacyjny, code-reviewing weryfikuje czy przykład jest wzorcowy.

```python
# Docs pisze snippet do tutoriala
async def fetch_stock_data(symbol: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(f"/api/stocks/{symbol}")
        response.raise_for_status()
        return response.json()

# Code review zwraca uwagę:
# - Brak timeout → dodaj timeout=30
# - Brak obsługi HTTPStatusError → pokaż wzorzec try/except
# - Punkt styku: docs poprawia snippet, dodaje sekcję "Error Handling"
```

## Architecture Designing

**Ten skill dostarcza:**

- Dokumentację decyzji architektonicznych w formacie ADR
- Diagramy C4 (Context, Container, Component) w Mermaid/PlantUML
- Przewodniki architektoniczne dla nowych członków zespołu
- Spójną terminologię w dokumentacji architektonicznej

**Partner dostarcza:**

- Decyzje architektoniczne z uzasadnieniem i rozważanymi alternatywami
- Topologię systemu (serwisy, zależności, przepływy danych)
- Wymagania niefunkcjonalne (SLA, skalowalność, bezpieczeństwo)
- Kontekst domenowy wpływający na wybory technologiczne

**Przykład interfejsu:**

Architekt podejmuje decyzję, docs formalizuje ją jako ADR i diagram.

```markdown
<!-- Architekt dostarcza decyzję -->
<!-- Wybrano event-driven architecture z Kafka dla pipeline'u danych rynkowych -->
<!-- Uzasadnienie: real-time processing, replay capability, decoupling -->

<!-- Docs tworzy ADR -->
# ADR-007: Event-Driven Pipeline dla Danych Rynkowych

## Status: Accepted
## Kontekst
Pipeline danych rynkowych wymaga przetwarzania real-time z możliwością replay.
## Decyzja
Kafka jako event bus między data ingestion a processing.
## Konsekwencje
- (+) Replay capability dla backtestów
- (+) Decoupling producerów od consumerów
- (-) Złożoność operacyjna Kafka cluster
```

## Analyzing Fundamentals

**Ten skill dostarcza:**

- Dokumentację metodologii wyceny (DCF, DDM, Comparable Companies)
- Definicje wskaźników finansowych z interpretacją i progami
- Przewodniki po modelu danych finansowych dla developerów
- Szablony raportów inwestycyjnych z opisem sekcji

**Partner dostarcza:**

- Definicje wskaźników (wzory, źródła danych, częstotliwość kalkulacji)
- Założenia modeli wyceny i ich ograniczenia
- Interpretację wyników (co oznacza P/E = 15 w kontekście sektora)
- Metodologię screenerów i kryteria filtrowania spółek

**Przykład interfejsu:**

Analityk definiuje wskaźnik, docs tworzy dokumentację zrozumiałą zarówno dla analityków jak i developerów.

```python
# Analyzing-fundamentals dostarcza definicję
# EV/EBITDA = (Market Cap + Total Debt - Cash) / EBITDA
# Interpretacja: <8 potencjalnie niedowartościowana, >15 potencjalnie przewartościowana
# Ograniczenie: nie stosować do spółek z ujemnym EBITDA

# Docs tworzy dokumentację:
# ## EV/EBITDA — Enterprise Value to EBITDA
# **Wzór:** `(Market Cap + Total Debt - Cash) / EBITDA`
# **Użycie w API:** `GET /api/ratios/ev-ebitda?symbol=AAPL`
# **Interpretacja:**
# | Zakres   | Sygnał                          |
# |----------|---------------------------------|
# | < 8      | Potencjalnie niedowartościowana |
# | 8–15     | Neutralna wycena                |
# | > 15     | Potencjalnie przewartościowana  |
# **Ograniczenie:** Nie stosować do spółek z ujemnym EBITDA.
```

## Implementing Frontend

**Ten skill dostarcza:**

- Dokumentację komponentów UI (props, warianty, przykłady użycia)
- Storybook stories jako interaktywną dokumentację
- Przewodniki po design systemie (tokeny, spacing, typography)
- MDX dokumentację łączącą opis z live preview komponentów

**Partner dostarcza:**

- Działające komponenty z definicjami TypeScript props/types
- Warianty komponentów (size, variant, state)
- Wymagania dostępności (ARIA, keyboard navigation)
- Tokeny projektowe i wytyczne design systemu

**Przykład interfejsu:**

Frontend implementuje komponent, docs tworzy dokumentację z live preview w Storybook.

```tsx
// Frontend dostarcza komponent z typami
interface StockCardProps {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  variant?: 'compact' | 'detailed';
}

// Docs tworzy Storybook story jako dokumentację
// export const Default: Story = {
//   args: {
//     symbol: 'AAPL',
//     price: 178.50,
//     change: 2.35,
//     changePercent: 1.33,
//     variant: 'detailed',
//   },
// };
// Punkt styku: docs dokumentuje props table, warianty i accessibility notes
```

## Testing E2E

**Ten skill dostarcza:**

- Scenariusze dokumentacyjne do przetestowania jako user flow
- Oczekiwane outputy, widoczne stany UI i warunki sukcesu
- Informację, które przykłady są krytyczne dla quick startu albo tutoriala
- Miejsca w docs, które powinny zostać zablokowane przez test regresyjny

**Partner dostarcza:**

- Testy Playwright lub równoważne testy E2E dla opisanych flow
- Stabilne lokatory, setup danych i izolację testów
- Weryfikację, że instrukcja użytkownika prowadzi do opisanego wyniku
- Raport niestabilności, brakujących mocków albo zależności środowiskowych

**Przykład interfejsu:**

Docs opisuje tutorial logowania i stworzenia pierwszego portfela, a testing-e2e zamienia go w test regresyjny.

```text
Docs przekazuje:
- kroki tutoriala
- wymagane dane testowe
- oczekiwane teksty i stan końcowy

Testing-e2e zwraca:
- test Playwright pokrywający flow
- listę kroków niestabilnych
- rekomendację mocków albo setupu danych
```
