# Przykład: Ewaluacja skilla code-reviewing

## Spis Treści
- [Test Cases](#test-cases)
- [Trigger Validation: code-reviewing](#trigger-validation-code-reviewing)
- [Scoring Rubric](#scoring-rubric)
- [Mini-Raport](#mini-raport)

## Test Cases

### Test Case: TC-01

**Typ**: happy-path
**Query**: "Przejrzyj ten pull request pod kątem jakości kodu"
**Kontekst**: PR z 12 zmienionymi plikami w module płatności, plik `task.research.md` dostępny

#### Oczekiwane zachowanie
- [x] Stosuje 9-krokowy proces przeglądu z checklistą
- [x] Generuje tabelę severity z kategoryzacją issues (critical/major/minor)
- [x] Sugeruje konkretne poprawki z fragmentami kodu
- [x] Weryfikuje pokrycie testami i bezpieczeństwo (OWASP)

#### Wynik
**Status**: PASS
**Score**: 8
**Uwagi**: Proces kompletny, poprawnie zidentyfikował brak testów integracyjnych i potencjalny SQL injection.

---

### Test Case: TC-02

**Typ**: happy-path
**Query**: "Zrób code review tego modułu auth"
**Kontekst**: Moduł autentykacji z JWT, middleware, pliki `auth.service.ts`, `auth.guard.ts`

#### Oczekiwane zachowanie
- [x] Sprawdza bezpieczeństwo — walidację tokenów, secure storage, expiration
- [x] Identyfikuje anti-patterny (hardcoded secrets, brak rate limiting)
- [x] Weryfikuje zgodność z najlepszymi praktykami (SOLID, separation of concerns)
- [ ] Sprawdza skalowalność rozwiązania

#### Wynik
**Status**: PARTIAL
**Score**: 7
**Uwagi**: Bezpieczeństwo i anti-patterny zidentyfikowane dobrze. Analiza skalowalności powierzchowna — brak weryfikacji stateless design.

---

### Test Case: TC-03

**Typ**: edge-case
**Query**: "Review tego 3-liniowego fix'a w README"
**Kontekst**: Zmiana w `README.md` — poprawka literówki i aktualizacja linku

#### Oczekiwane zachowanie
- [x] Adaptuje głębokość przeglądu do rozmiaru zmiany
- [x] Nie over-engineeruje — pomija kroki nieadekwatne do zmiany (testy, bezpieczeństwo, skalowalność)
- [x] Generuje krótki, proporcjonalny raport

#### Wynik
**Status**: PASS
**Score**: 7
**Uwagi**: Poprawnie skrócił proces. Nie wymagał testów ani analizy bezpieczeństwa dla zmiany w README.

---

### Test Case: TC-04

**Typ**: negative-case
**Query**: "Napisz testy jednostkowe dla tego serwisu"
**Kontekst**: Plik `payment.service.ts` bez istniejących testów

#### Oczekiwane zachowanie
- [x] Skill NIE powinien się aktywować (pisanie testów to nie code review)
- [x] Zapytanie powinno trafić do innego skilla lub domyślnego agenta
- [x] Jeśli aktywowany — powinien odmówić i wskazać właściwy skill

#### Wynik
**Status**: PASS
**Score**: 9
**Uwagi**: Description skilla nie zawiera trigger keywords związanych z "pisaniem testów" — agent poprawnie nie aktywował code-reviewing.

---

## Trigger Validation: code-reviewing

### Trigger Queries (powinny aktywować)
| # | Query | Aktywowałby? | Confidence | Uwagi |
|---|-------|-------------|------------|-------|
| 1 | "Przejrzyj ten PR" | TAK | H | Bezpośredni match: "przegląd" |
| 2 | "Zrób code review tego modułu" | TAK | H | Explicit keyword "code review" |
| 3 | "Sprawdź jakość tego kodu" | TAK | M | "jakość kodu" — match pośredni |
| 4 | "Przeanalizuj najlepsze praktyki w tym pliku" | TAK | M | "najlepsze praktyki" w description |
| 5 | "Zweryfikuj kryteria akceptacji tego taska" | TAK | H | Explicit w description |
| 6 | "Czy ten kod jest zgodny ze standardami?" | TAK | M | Pośredni match na "standardy jakości" |

### Non-Trigger Queries (nie powinny aktywować)
| # | Query | Aktywowałby? | Confidence | Uwagi |
|---|-------|-------------|------------|-------|
| 1 | "Zaimplementuj funkcję logowania" | NIE | H | Implementacja, nie review |
| 2 | "Napisz testy dla tego serwisu" | NIE | H | Pisanie testów ≠ review |
| 3 | "Zaprojektuj architekturę systemu" | NIE | H | Architektura → inny skill |

### Wynik trigger validation
- Trigger accuracy: 9/9 poprawnych
- False positives: brak
- False negatives: brak
- Rekomendacja dla description: OK — description pokrywa kluczowe trigger keywords

---

## Scoring Rubric

| Wymiar | Waga | Score | Uzasadnienie |
|--------|------|-------|--------------|
| Trigger Accuracy | 20 | 8 | 9/9 trafień, ale "sprawdź jakość" to pośredni match (confidence M) |
| Process Completeness | 20 | 9 | 9-krokowy proces z checklistą, jasne instrukcje per krok |
| Output Quality | 25 | 7 | Kompletne raporty, ale analiza skalowalności bywała powierzchowna |
| Edge Case Handling | 15 | 6 | Adaptuje głębokość do rozmiaru, ale brak jawnych reguł degradacji |
| Token Efficiency | 10 | 7 | ~120 linii — zwięzły, ale krok 4 (testy) mógłby być bardziej skondensowany |
| Structural Compliance | 10 | 9 | Poprawny frontmatter, checklista, kroki, sekcja powiązanych skilli |

**Score** = (8×20 + 9×20 + 7×25 + 6×15 + 7×10 + 9×10) / 10 = (160 + 180 + 175 + 90 + 70 + 90) / 10 = **76.5**

---

## Mini-Raport

**Data**: 2026-03-25
**Zakres**: pełna
**Baseline**: nie

### Podsumowanie
- Łączny score: **76.5/100**
- Test cases: 3.5/4 (3 PASS, 1 PARTIAL)
- Trigger accuracy: 9/9
- Verdict: **PASS**

### Rekomendacje
| Priorytet | Działanie | Dotyczy |
|-----------|----------|---------|
| SHOULD-FIX | Rozbuduj krok 9 (skalowalność) o konkretne checkpointy | Output Quality |
| SHOULD-FIX | Dodaj jawne reguły adaptacji głębokości przeglądu | Edge Case Handling |
| CONSIDER | Skondensuj krok 4 (testy) — sekcje o testach mutacyjnych i architektonicznych przeniesione do referencji | Token Efficiency |
