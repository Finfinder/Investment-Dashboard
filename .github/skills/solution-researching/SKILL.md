---
name: solution-researching
description: Analizuje i porównuje rozwiązania technologiczne, generuje model C4 Context i opcjonalne ADR-y. Głębokość skalowana wg złożoności zadania.
---

# Analiza Rozwiązań

Ten skill pomaga przeprowadzić zewnętrzną analizę rynku, technologii i dostępnych rozwiązań w celu podjęcia świadomej decyzji architektonicznej. Głębokość analizy jest skalowana w zależności od złożoności zadania.

## Kiedy Używać

Używaj tego skilla, gdy zadanie wymaga:
- Wyboru technologii, biblioteki lub podejścia architektonicznego spośród wielu opcji
- Zrozumienia ekosystemu i dostępnych rozwiązań przed projektowaniem
- Porównania projektów open-source, publicznych API lub usług zewnętrznych
- Uzasadnienia decyzji technicznych wobec interesariuszy

Nie używaj, gdy wymagania są jednoznaczne, technologia jest już wybrana, a zadanie polega wyłącznie na implementacji.

## Proces Analizy Rozwiązań

Użyj poniższej checklisty i śledź postęp:

```
Postęp analizy:
- [ ] Krok 1: Oceń złożoność badania
- [ ] Krok 2: Zdefiniuj zakres i pytania badawcze
- [ ] Krok 3: Wyszukaj i przeanalizuj źródła zewnętrzne
- [ ] Krok 4: Porównaj rozwiązania
- [ ] Krok 5: Opracuj model C4 Context
- [ ] Krok 6: Wygeneruj ADR-y (jeśli złożoność >= L)
- [ ] Krok 7: Sfinalizuj raport analizy rozwiązań
```

**Krok 1: Oceń złożoność badania**

Na podstawie opisu zadania, pliku `*.research.md` lub polecenia użytkownika oceń złożoność badania według poniższej skali:

| Złożoność | Opis | Liczba źródeł | C4 | ADR-y | Matryca porównawcza |
|---|---|---|---|---|---|
| **S (Proste)** | Jedno znane rozwiązanie, potrzebna tylko weryfikacja | 2–5 | Nie | Nie | Nie |
| **M (Średnie)** | Kilka opcji w znanej domenie, potrzebne porównanie | 5–15 | Uproszczony | Nie | Tak (2–3 opcje) |
| **L (Złożone)** | Nowa domena lub wiele podejść architektonicznych | 15–50 | Pełny | Tak | Tak (3–5 opcji) |
| **XL (Strategiczne)** | Decyzja o platformie, integracji wielu systemów lub nowym produkcie | 50–200+ | Pełny + rozszerzony | Tak (szczegółowe) | Tak (5+ opcji) |

Zapisz wybraną złożoność — determinuje ona głębokość kolejnych kroków.

**Krok 2: Zdefiniuj zakres i pytania badawcze**

Sformułuj konkretne pytania, na które analiza ma odpowiedzieć. Przykłady:
- Jakie rozwiązania open-source realizują podobną funkcjonalność?
- Jakie publiczne API mogą zostać zintegrowane?
- Jakie wzorce architektoniczne stosują podobne projekty?
- Jakie są ograniczenia licencyjne analizowanych rozwiązań?

Dla złożoności S wystarczą 1–2 pytania. Dla XL przygotuj pełną listę pytań badawczych pogrupowanych tematycznie.

**Krok 3: Wyszukaj i przeanalizuj źródła zewnętrzne**

Systematycznie przeszukuj źródła odpowiednie do złożoności:

- **Repozytoria open-source**: GitHub, GitLab — analizuj README, architekturę, licencje, aktywność, liczbę gwiazdek, ostatnią aktualizację
- **Dokumentacje i API**: Oficjalne docs, OpenAPI/Swagger, SDK, przykłady integracji
- **Blogi i artykuły techniczne**: Porównania, case studies, post-mortemy, benchmarki
- **Rejestry pakietów**: NuGet, npm, PyPI — wersje, popularność, zależności
- **Dyskusje społeczności**: Stack Overflow, GitHub Discussions, Reddit — typowe problemy i obejścia

Używaj narzędzia `web/fetch` do pobierania treści z URL-i. Używaj `context7/*` do dokumentacji bibliotek.

Dla każdego analizowanego źródła notuj:
- Nazwa i URL
- Typ źródła (repo, docs, blog, API, pakiet)
- Kluczowe wnioski
- Ocena przydatności (🟢 wysoka / 🟡 średnia / 🔴 niska)

**Krok 4: Porównaj rozwiązania**

Na podstawie zebranych informacji utwórz matrycę porównawczą kandydatów. Kryteria porównania dobierz do kontekstu, ale rozważ:

- Dopasowanie do wymagań funkcjonalnych
- Dojrzałość i stabilność (wersja, aktywność, community)
- Jakość dokumentacji i wsparcia
- Licencja i koszty
- Złożoność integracji
- Wydajność i skalowalność
- Bezpieczeństwo
- Krzywa uczenia się zespołu

Dla każdego kandydata wymień:
- **Korzyści** — konkretne zalety w kontekście zadania
- **Wady** — ograniczenia, ryzyka, brakujące funkcje
- **Uzasadnienie** — dlaczego jest lub nie jest rekomendowany

Wskaż rekomendowane rozwiązanie z uzasadnieniem wyboru względem odrzuconych alternatyw.

**Krok 5: Opracuj model C4 Context**

Przygotuj diagram C4 na poziomie Context w składni Mermaid, pokazujący:
- System będący przedmiotem analizy (w centrum)
- Aktorów zewnętrznych (użytkownicy, inne systemy)
- Zależności i przepływy danych

Dla złożoności M wystarczy uproszczony diagram z głównymi elementami.
Dla złożoności L i XL uwzględnij wszystkie zidentyfikowane integracje, systemy zewnętrzne i przepływy.

Format diagramu:
```mermaid
C4Context
    title <tytuł-diagramu>
    Person(alias, "Nazwa", "Opis")
    System(alias, "Nazwa", "Opis")
    System_Ext(alias, "Nazwa zewnętrzna", "Opis")
    Rel(from, to, "Opis relacji")
```

**Krok 6: Wygeneruj ADR-y (jeśli złożoność >= L)**

Dla zadań o złożoności L i XL wygeneruj listę Architecture Decision Records. Każdy ADR powinien zawierać:

- **Tytuł**: Zwięzły opis decyzji
- **Status**: Proponowany / Zaakceptowany / Odrzucony
- **Kontekst**: Dlaczego ta decyzja jest potrzebna
- **Rozważane opcje**: Lista rozpatrywanych alternatyw (z odniesieniem do matrycy porównawczej)
- **Decyzja**: Wybrana opcja
- **Uzasadnienie**: Dlaczego ta opcja została wybrana
- **Konsekwencje**: Pozytywne i negatywne następstwa decyzji

Dla złożoności S i M pomiń ten krok — wystarczy matryca porównawcza i uzasadnienie z Kroku 4.

**Krok 7: Sfinalizuj raport analizy rozwiązań**

Wygeneruj raport zgodnie ze strukturą `./solution-research.example.md`. Pliki `*.solution-research.md` ZAWSZE twórz w języku polskim w katalogu `.github/Issue`.

> **Ważne — lokalny charakter pliku**: Plik `*.solution-research.md` ma charakter czysto lokalny (roboczy) i jest ignorowany przez `.gitignore` (`.github/Issue/*.solution-research.md`), więc nie trafia do zdalnego repozytorium. W głównym raporcie badawczym `*.research.md` (oraz w planie) umieść zwięzłe streszczenie wniosków, matrycy i rekomendacji zamiast odnośnika do pliku nieobecnego w repozytorium.

Upewnij się, że:
- Głębokość odpowiada ocenionej złożoności (Krok 1)
- Wszystkie pytania badawcze (Krok 2) mają odpowiedzi
- Matryca porównawcza jest kompletna
- C4 Context jest poprawny składniowo (Mermaid)
- ADR-y (jeśli wymagane) są kompletne

Nie dodawaj ani nie usuwaj sekcji z szablonu. Sekcje oznaczone jako warunkowe wypełniaj tylko gdy złożoność tego wymaga — w przeciwnym razie wpisz "Nie dotyczy — złożoność S/M".

## Powiązane Skille

- `task-analysing` - dostarcza kontekst zadania i wymagania jako dane wejściowe do analizy rozwiązań
- `codebase-analysing` - do zrozumienia obecnego systemu przed porównaniem z rozwiązaniami zewnętrznymi
- `architecture-designing` - konsumuje wyniki analizy rozwiązań przy projektowaniu architektury docelowej
- `analyzing-technicals` - wiedza domenowa o analizie technicznej rynków finansowych (wskaźniki, formacje, wizualizacja); konsultuj przy badaniu bibliotek i rozwiązań do analizy technicznej
- `analyzing-fundamentals` - wiedza domenowa o analizie fundamentalnej (wskaźniki finansowe, modele wyceny, screening); konsultuj przy badaniu narzędzi do analizy fundamentalnej i wyceny spółek
- `implementing-trading-strategies` - wiedza domenowa o systemach handlowych (backtesting, koszty transakcyjne, deployment); konsultuj przy badaniu frameworków do tradingu algorytmicznego
