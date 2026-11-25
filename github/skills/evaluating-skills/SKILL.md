---
name: evaluating-skills
description: "Ewaluuje jakość skilli (SKILL.md) poprzez testy, walidację triggerów i scoring. Używaj przy audycie, porównywaniu wersji i weryfikacji skuteczności skilli."
---

# Ewaluacja Skilli

Systematyczny proces oceny jakości skilli Copilota poprzez mierzalne test cases, walidację trigger description i scoring rubric. Zapewnia, że skille działają skutecznie w rzeczywistych scenariuszach użycia.

<principles>

<evidence-over-opinion>
Oceniaj skill na podstawie mierzalnych wyników test cases, nie subiektywnych wrażeń. Każde stwierdzenie "skill jest dobry/zły" musi być poparte konkretnymi asercjami pass/fail.
</evidence-over-opinion>

<baseline-comparison>
Przy modyfikacji istniejącego skilla zawsze porównuj z wersją bazową. Poprawa bez baseline to zgadywanie. Jeśli w `.github/Docs/Evaluations/{skill-name}.eval.md` istnieje zapisana ostatnia ewaluacja, użyj jej jako baseline zamiast ponownego uruchamiania test cases na starej wersji. W przeciwnym wypadku uruchom te same test cases na starej i nowej wersji, mierz różnicę. Przy nowym skillu lub audycie — porównuj z scoring rubric.
</baseline-comparison>

<trigger-accuracy>
Description to bramka skilla. Skill może być doskonały, ale jeśli nie aktywuje się na właściwe zapytania (lub aktywuje na niewłaściwe), jest bezużyteczny. Testuj trigger osobno od treści.
</trigger-accuracy>

<progressive-improvement>
Ewaluacja to pętla, nie jednorazowy audyt. Po każdej modyfikacji: re-eval → porównaj → iteruj. Ogranicz cykle do 2-3 iteracji na zmianę.
</progressive-improvement>

</principles>

## Proces Ewaluacji Skilla

Użyj poniższej checklisty i śledź postęp:

```
Postęp ewaluacji:
- [ ] Krok 1: Zdefiniuj zakres ewaluacji
- [ ] Krok 2: Przygotuj test cases
- [ ] Krok 3: Przeprowadź trigger validation
- [ ] Krok 4: Wykonaj ewaluację (+ baseline comparison przy modyfikacji)
- [ ] Krok 5: Oceń wyniki scoring rubric
- [ ] Krok 6: Wygeneruj raport i rekomendacje
- [ ] Krok 7: Zapisz ewaluację do `.github/Docs/Evaluations/`
```

**Krok 1: Zdefiniuj zakres ewaluacji**

Określ co ewaluujesz:
- Pojedynczy skill vs kolekcja skilli
- Nowa wersja po modyfikacji vs audit istniejącego
- Pełna ewaluacja (trigger + treść + output) vs punktowa (tylko trigger / tylko output)

Zbierz kontekst:
- Przeczytaj SKILL.md i wszystkie pliki referencyjne
- Zidentyfikuj cel skilla, target persona, oczekiwane zachowania
- Sprawdź czy skill ma zdefiniowany proces krokowy i jakie outputy generuje

**Krok 2: Przygotuj test cases**

Dla każdego skilla przygotuj minimum 4 test cases:
- 2x **happy path** — typowe, oczekiwane scenariusze użycia
- 1x **edge case** — nietypowy scenariusz (minimalny input, graniczny przypadek, niekompletne dane)
- 1x **negative case** — scenariusz gdy skill NIE powinien się aktywować lub powinien odmówić

Każdy test case zawiera:

```
## Test Case: [TC-ID]

**Typ**: happy-path | edge-case | negative-case
**Query**: [dokładne zapytanie użytkownika które wyzwala test]
**Kontekst**: [pliki/dane w workspace potrzebne do testu]

### Oczekiwane zachowanie
- [ ] [Asercja 1 — co output MUSI zawierać]
- [ ] [Asercja 2 — jaki proces MUSI być zastosowany]
- [ ] [Asercja 3 — czego output NIE MOŻE zawierać]

### Wynik
**Status**: PASS | FAIL | PARTIAL
**Score**: [0-10]
**Uwagi**: [obserwacje]
```

> Wzorcowy przykład test case: `references/eval-test-case.example.md`

**Krok 3: Przeprowadź trigger validation**

Testuj czy description skilla skutecznie kieruje aktywację.

Przygotuj dwa zestawy queries:
- **Trigger queries** (5-8) — zapytania, które POWINNY aktywować ten skill
- **Non-trigger queries** (3-5) — zapytania, które NIE POWINNY aktywować

Dla każdego query oceń:
- Czy skill byłby wybrany przez agenta na podstawie samego description?
- Czy słowa kluczowe w query pokrywają się z trigger keywords w description?
- Czy inne skille mogłyby "przechwycić" to query (conflict detection)?

> Sprawdź opisy 3-5 skilli najbliższych tematycznie. Jeśli >2 mogłoby się aktywować na ten sam query, zanotuj potencjalny konflikt i zasugeruj doprecyzowanie description.

Format wyniku:

```
## Trigger Validation: [skill-name]

### Trigger Queries (powinny aktywować)
| # | Query | Aktywowałby? | Confidence | Uwagi |
|---|-------|-------------|------------|-------|
| 1 | "..." | TAK/NIE     | H/M/L      |       |

### Non-Trigger Queries (nie powinny aktywować)
| # | Query | Aktywowałby? | Confidence | Uwagi |
|---|-------|-------------|------------|-------|
| 1 | "..." | TAK/NIE     | H/M/L      |       |

### Wynik trigger validation
- Trigger accuracy: [X/Y poprawnych]
- False positives: [lista]
- False negatives: [lista]
- Rekomendacja dla description: [zmiana/ok]
```

**Krok 4: Wykonaj ewaluację (+ baseline comparison przy modyfikacji)**

Uruchom test cases. Flow zależy od kontekstu ewaluacji:

**A) Modyfikacja istniejącego skilla** (baseline comparison WYMAGANY):
1. Sprawdź czy istnieje zapisana ewaluacja w `.github/Docs/Evaluations/{skill-name}.eval.md`:
   - **Jeśli TAK**: odczytaj zapisaną ewaluację i użyj jej jako baseline (nie trzeba uruchamiać test cases na starej wersji)
   - **Jeśli NIE**: PRZED modyfikacją uruchom test cases na OBECNEJ wersji (baseline) → zapisz wyniki
2. Wykonaj modyfikację skilla
3. Uruchom te same test cases na NOWEJ wersji → zapisz wyniki
4. Porównaj side-by-side: które asercje zmieniły status? Czy score wzrósł/spadł?
5. Jeśli score spadł — wycofaj zmianę lub iteruj (maks. 2-3 cykle)

**B) Ewaluacja nowo utworzonego skilla** (bez baseline):
1. Uruchom test cases → zapisz wyniki
2. Porównuj z scoring rubric — oczekiwany verdict: PASS (≥70)
3. Jeśli verdict to FAIL lub NEEDS-IMPROVEMENT — napraw i powtórz ewaluację

**C) Audit istniejącego skilla** (bez baseline):
1. Uruchom test cases → zapisz wyniki
2. Brak baseline — porównuj z scoring rubric

> W każdym wariancie: uruchamiaj test case jako symulację — przedstaw query agentowi korzystającemu ze skilla i oceń output względem asercji.

**Krok 5: Oceń wyniki scoring rubric**

Zastosuj scoring rubric (tabela poniżej) do wyników z kroku 4. Oblicz łączny wynik.

**Krok 6: Wygeneruj raport i rekomendacje**

Format raportu:

```
## Raport Ewaluacji: [skill-name]

**Data**: [YYYY-MM-DD]
**Zakres**: [pełna / trigger-only / content-only]
**Baseline**: [tak — wersja X / nie]

### Podsumowanie
- Łączny score: [X/100]
- Test cases: [passed/total]
- Trigger accuracy: [X/Y]
- Verdict: PASS (≥70) | NEEDS-IMPROVEMENT (40-69) | FAIL (<40)

### Wyniki Test Cases
| TC-ID | Typ | Status | Score | Kluczowe obserwacje |
|-------|-----|--------|-------|---------------------|

### Definicje Test Cases
| TC-ID | Typ | Query | Asercje |
|-------|-----|-------|--------|

### Wyniki Trigger Validation
[Podsumowanie z kroku 3]

### Baseline Comparison (jeśli dotyczy)
| Metryka | Baseline | Current | Delta |
|---------|----------|---------|-------|

### Rekomendacje
| Priorytet | Działanie | Dotyczy |
|-----------|----------|---------|
| MUST-FIX  | ...      | ...     |
| SHOULD-FIX| ...      | ...     |
| CONSIDER  | ...      | ...     |
```
**Krok 7: Zapisz ewaluację**

Po wygenerowaniu raportu, zapisz wynik ewaluacji do pliku:
- **Ścieżka**: `.github/Docs/Evaluations/{skill-name}.eval.md`
- **Treść**: pełny raport ewaluacji z kroku 6 (ten sam format)
- **Zachowanie**: nadpisz istniejący plik — przechowywana jest zawsze tylko ostatnia ewaluacja

> Zapisana ewaluacja służy jako baseline dla przyszłych modyfikacji tego skilla (patrz Krok 4A).
## Scoring Rubric

| Wymiar | Waga | 0-2 (Słabe) | 3-5 (Przeciętne) | 6-8 (Dobre) | 9-10 (Doskonałe) |
|--------|------|-------------|------------------|--------------|-------------------|
| Trigger Accuracy | 20 | ≤50% trafności | 50-70% | 70-90% | >90% + brak false positives |
| Process Completeness | 20 | Brak procesu | Proces bez checklisty | Kompletny proces z checklistą | + adaptacja do kontekstu |
| Output Quality | 25 | Output bezużyteczny | Częściowo przydatny | Kompletny i poprawny | + przekraczający oczekiwania |
| Edge Case Handling | 15 | Fail na edge casach | Częściowy handling | Poprawna obsługa | + graceful degradation |
| Token Efficiency | 10 | >500 linii, redundancje | W limicie ale verbose | Zwięzły i kompletny | Idealny stosunek |
| Structural Compliance | 10 | Brak frontmatter/procesu | Częściowa zgodność | Pełna zgodność z konwencjami | Wzorcowy |

**Formuła**: `Score = Σ(wymiar_score × waga) / 10`

Progi verdyktu:
- **PASS**: score ≥ 70
- **NEEDS-IMPROVEMENT**: score 40-69
- **FAIL**: score < 40

## Antywzorce Ewaluacji

| Antywzorzec | Severity | Symptom | Rozwiązanie |
|-------------|----------|---------|-------------|
| Ewaluacja bez test cases | HIGH | "Skill wygląda dobrze" bez mierzalnych dowodów | Zawsze pisz min. 4 test case z asercjami |
| Pominięcie trigger validation | HIGH | Skill doskonały, ale agent go nie aktywuje | Testuj description osobno od treści |
| Brak baseline przy modyfikacji | HIGH | "Nowa wersja jest lepsza" bez porównania | Przy modyfikacji sprawdź najpierw `.github/Docs/Evaluations/` — jeśli zapisana ewaluacja istnieje, użyj jej jako baseline; w przeciwnym razie uruchom test cases na starej wersji przed zmianą |
| Test cases tylko happy path | MEDIUM | Skill przechodzi testy, ale failuje na edge casach | Minimum 1 edge case + 1 negative case per skill |
| Subiektywny scoring | MEDIUM | Różni oceniający dają różne wyniki | Używaj rubric z konkretnymi progami per wymiar |
| Nadmierne iteracje | LOW | Nieskończony cykl eval→fix→eval | Ogranicz do 2-3 iteracji per zmianę, potem deploy z udokumentowanymi issues |

## Checklista Walidacyjna

```
Walidacja ewaluacji:
- [ ] Min. 4 test cases (2 happy path, 1 edge case, 1 negative case)
- [ ] Każdy test case ma query, kontekst i min. 3 asercje
- [ ] Trigger validation z min. 5 trigger + 3 non-trigger queries
- [ ] Conflict detection: sprawdzono 3-5 skilli najbliższych tematycznie
- [ ] Scoring rubric zastosowany z uzasadnieniem per wymiar
- [ ] Formuła Score = Σ(wymiar_score × waga) / 10 obliczona poprawnie
- [ ] Raport wygenerowany w pełnym formacie z verdyktem
- [ ] Baseline comparison wykonany (WYMAGANY przy modyfikacji istniejącego skilla)
- [ ] Raport ewaluacji zapisany do `.github/Docs/Evaluations/{skill-name}.eval.md`
```

## Powiązane Skille

- `creating-skills` — konwencje struktury i walidacji, które ewaluacja weryfikuje
- `code-reviewing` — komplementarny skill; code-reviewing ocenia kod, evaluating-skills ocenia skille
- `creating-agents` — ewaluacja trigger validation dotyczy interakcji skill↔agent
- `creating-prompts` — test cases mogą bazować na promptach wyzwalających skill
