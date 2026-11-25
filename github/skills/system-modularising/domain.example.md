# <nazwa-systemu> - Kontrakt Domenowy

## Szczegóły Analizy

| Pole | Wartość |
|---|---|
| System | <nazwa-systemu> |
| Data analizy | <data> |
| Cel modularyzacji | <greenfield / extraction / refinement> |
| Powiązany Research | <link-do-pliku-research-jeśli-istnieje> |

## Mapa Subdomen

| Subdomena | Typ | Opis | Odpowiedzialność |
|---|---|---|---|
| <nazwa> | Core / Supporting / Generic | <opis> | <główna odpowiedzialność> |

## Bounded Contexts

### <Nazwa Bounded Context>

| Pole | Wartość |
|---|---|
| Typ subdomeny | Core / Supporting / Generic |
| Odpowiedzialność | <opis odpowiedzialności> |
| Zespół właściciel | <nazwa-zespołu-lub-TBD> |
| Strategia integracji | <ACL / Shared Kernel / Conformist / OHS+PL> |

**Ubiquitous Language**:
| Termin | Definicja |
|---|---|
| <termin> | <definicja w kontekście tego bounded context> |

## Diagram Modułów (UML Package)

```mermaid
%% Diagram pakietów UML pokazujący moduły i kierunki zależności
```

## Diagram C4 Container

```mermaid
C4Container
    title <tytuł>
```

## Macierz Odpowiedzialności Modułów

| Moduł | Zdolności Biznesowe | Agregaty | Zdarzenia Publikowane | Zdarzenia Konsumowane |
|---|---|---|---|---|
| <moduł> | <lista zdolności> | <lista agregatów> | <lista zdarzeń> | <lista zdarzeń> |

## Model Domenowy — Szczegóły Modułów

### Moduł: <nazwa-modułu>

**Agregaty**:
| Agregat (Root) | Encje | Value Objects | Invarianty |
|---|---|---|---|
| <nazwa> | <lista encji> | <lista VO> | <reguły biznesowe> |

**Zdarzenia Domenowe**:
| Zdarzenie | Publikowane przez | Konsumowane przez | Opis |
|---|---|---|---|
| <nazwa> | <agregat> | <moduły> | <co oznacza> |

**Polityki / Reguły Biznesowe**:
| Polityka | Wyzwalacz | Akcja | Opis |
|---|---|---|---|
| <nazwa> | <co wyzwala> | <co się dzieje> | <uzasadnienie biznesowe> |

**Usługi Domenowe**:
| Usługa | Operacja | Opis |
|---|---|---|
| <nazwa> | <co robi> | <dlaczego nie przynależy do encji> |

**Archetypy Biznesowe**:
| Element | Archetyp | Uzasadnienie |
|---|---|---|
| <element> | Party / Place / Thing / Description / Role / Moment-Interval | <dlaczego> |

## Analiza Autonomii

| Moduł | Autonomia Zmian | Autonomia Decyzji | Autonomia Deploymentu | Wynik |
|---|---|---|---|---|
| <moduł> | ⬤⬤⬤○○ | ⬤⬤⬤⬤○ | ⬤⬤○○○ | <komentarz> |

## Ocena Granic Modułów

### Uzasadnienie Wag Kryteriów
<Dlaczego wybrano te wagi — kontekst biznesowy i techniczny>

### Macierz Ocen

| Granica (A↔B) | Coupling (w:X) | Cohesion (w:X) | Zmiana (w:X) | Zespół (w:X) | Deploy (w:X) | Dane (w:X) | Komunikacja (w:X) | Wynik Ważony |
|---|---|---|---|---|---|---|---|---|
| <moduł-A> ↔ <moduł-B> | | | | | | | | |

### Najsłabsze Granice
| Granica | Wynik | Problem | Rekomendacja |
|---|---|---|---|
| <granica> | <wynik> | <co jest nie tak> | <merge / split / refactor> |

## Testowanie Jakości Podziału

### Porównanie z Alternatywami

| Kryterium | Wybrany Podział | Alternatywa 1: <nazwa> | Alternatywa 2: <nazwa> |
|---|---|---|---|
| Opis | <opis> | <opis> | <opis> |
| Zalety | <zalety> | <zalety> | <zalety> |
| Wady | <wady> | <wady> | <wady> |
| Ryzyko | <ryzyko> | <ryzyko> | <ryzyko> |

**Uzasadnienie wyboru**: <dlaczego wybrany podział jest lepszy>

### Rejestr Ryzyk

| # | Ryzyko | Dotkliwość | Prawdopodobieństwo | Mitygacja | Status |
|---|---|---|---|---|---|
| 1 | <ryzyko> | Krytyczne / Wysokie / Średnie / Niskie | Wysokie / Średnie / Niskie | <mitygacja> | Zaakceptowane / Zmitigowane |

### Scenariusze Ewolucji

| Scenariusz | Wpływ na Moduły | Liczba Zmian | Ocena |
|---|---|---|---|
| Nowa zdolność biznesowa: <opis> | <które moduły> | <ile zmian> | ✅ OK / ⚠️ Ryzyko / ❌ Problem |
| Restrukturyzacja zespołu: <opis> | <wpływ> | <ile> | |
| Spike ruchu: <opis> | <wpływ> | <ile> | |
| Nowa integracja: <opis> | <wpływ> | <ile> | |

### Metryki Coupling/Cohesion

| Moduł | Ca (afferent) | Ce (efferent) | I (instability) | A (abstractness) | D (distance) |
|---|---|---|---|---|---|
| <moduł> | <wartość> | <wartość> | <wartość> | <wartość> | <wartość> |

**Walidacja zależności**:
- [ ] Brak zależności cyklicznych
- [ ] Stable Abstractions Principle spełniona
- [ ] Kierunek zależności: od niestabilnych do stabilnych

## Kontrakty Między Modułami

### <Moduł A> → <Moduł B>

| Pole | Wartość |
|---|---|
| Typ integracji | Synchroniczna / Asynchroniczna / Event-driven |
| Protokół | REST / gRPC / Message Queue / Direct reference |
| Kontrakt | <opis publicznego API lub event schema> |
| Strategia | ACL / Shared Kernel / Conformist / OHS+PL |
| Właściciel kontraktu | <moduł upstream> |

## Słownik Ubiquitous Language

| Termin | Bounded Context | Definicja |
|---|---|---|
| <termin> | <kontekst> | <definicja> |

## Otwarte Pytania

| # | Pytanie | Odpowiedź | Status |
|---|---|---|---|
| 1 | <pytanie> | <odpowiedź> | ✅ Rozwiązane / ❓ Otwarte |

## Usprawnienia (Poza Zakresem)

- <potencjalne usprawnienie zidentyfikowane podczas analizy>

## Changelog

| Data | Opis Zmiany |
|------|-------------------|
| <data> | Utworzono wstępny kontrakt domenowy |
