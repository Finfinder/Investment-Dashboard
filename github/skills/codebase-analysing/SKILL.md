---
name: codebase-analysing
description: Przeanalizuj bazę kodu systemu. Sprawdź zależności. Zrozum implementację logiki biznesowej. Wyszukaj duplikacje.
---

# Analiza Bazy Kodu

Ten skill pomaga analizować bazę kodu w ustrukturyzowany sposób, aby uzyskać maksymalną wartość z analizy. Skupia się na architekturze, wzorcach, stylu kodu, podziale modułów, podejściu do testowania, zależnościach i infrastrukturze.

Przy analizie bezpieczeństwa, jakości kodu, architektury, martwego kodu, duplikacji i usprawnień korzystaj ze wspólnego kontraktu weryfikacyjnego z `../code-reviewing/references/validations.md`. Nie twórz równoległej pełnej checklisty w tym skillu; odwołuj się do kontraktu i raportuj ograniczenia narzędziowe lub punkty nieadekwatne.

## Proces Analizy Bazy Kodu

Użyj poniższej checklisty i śledź postęp:

```
Postęp analizy:
- [ ] Krok 1: Sprawdź strukturę repozytorium
- [ ] Krok 2: Sprawdź zależności
- [ ] Krok 3: Sprawdź dostępne skrypty
- [ ] Krok 4: Sprawdź architekturę wysokiego poziomu
- [ ] Krok 5: Sprawdź kod backendu
- [ ] Krok 6: Sprawdź kod frontendu
- [ ] Krok 7: Sprawdź kod infrastruktury
- [ ] Krok 8: Sprawdź integracje z podmiotami trzecimi
- [ ] Krok 9: Sprawdź podejście do testowania
- [ ] Krok 10: Sprawdź podejście do bezpieczeństwa
- [ ] Krok 11: Wyszukaj potencjalne usprawnienia
- [ ] Krok 12: Sprawdź martwy kod i duplikacje
```

**Krok 1: Sprawdź strukturę repozytorium**

Przejrzyj całe repozytorium, aby zidentyfikować i zrozumieć jego strukturę.
Ustal, z jakim typem repozytorium pracujemy. Czy to monorepo, czy repozytorium pojedynczego systemu.
Ustal, jakie typy systemów zawiera: aplikacje frontendowe, backendowe, pakiety współdzielone, infrastrukturę itp.
Ustal, gdzie przechowywane są zależności i pliki skryptów.
Ustal, gdzie znajdują się testy (e2e, jednostkowe, integracyjne).
Ustal, które katalogi są najważniejsze dla każdego systemu.

**Krok 2: Sprawdź zależności**

Przeanalizuj wszystkie zależności.
Upewnij się, że w pełni rozumiesz, jakie frameworki, biblioteki, systemy uwierzytelniania itp. są używane.
Zanotuj, które zależności są przestarzałe i mogą powodować problemy w przyszłości.

**Krok 3: Sprawdź dostępne skrypty**

Sprawdź wszystkie dostępne skrypty.
Ustal, jakie mamy skrypty uruchamiania aplikacji.
Ustal, jakie mamy skrypty zapewniania jakości (testy, lintowanie, formatowanie itp.).
Zrozum działanie pozostałych skryptów.

**Krok 4: Sprawdź architekturę wysokiego poziomu**

Zrozum, jak wygląda architektura aplikacji na podstawie usług, integracji i bibliotek.
Stwórz diagram architektury, który da się odtworzyć na podstawie samego kodu.
Upewnij się, że rozumiesz stosowane wzorce i praktyki komunikacji wewnętrznej oraz zewnętrznej.

**Krok 5: Sprawdź kod backendu**

Sprawdź:
- Stos technologiczny: framework, architektura kodu (MVC/CQRS/DDD/warstwowa/heksagonalna), podział modułowy vs według odpowiedzialności.
- Bazę danych: schemat, wzorzec dostępu (ORM/SQL), bibliotekę komunikacji.
- Bezpieczeństwo i wdrażanie: uwierzytelnianie, autoryzację, sposób deploymentu.

**Krok 6: Sprawdź kod frontendu**

Sprawdź:
- Stos technologiczny: framework, biblioteki UI, wzorzec komunikacji (REST/WebSocket/GraphQL), dodatkowe biblioteki (auth, queries).
- Architekturę kodu: organizacja komponentów (atomic design itp.), sposób deploymentu.

**Krok 7: Sprawdź kod infrastruktury**

Sprawdź, jak zarządzamy infrastrukturą (IaC czy ręcznie). Jakiej technologii używamy do infrastruktury?
Jak wdrażana jest aplikacja? Chmura, on-premise itp.
Zrozum, czy aplikacja jest konteneryzowana.
Upewnij się, że rozumiesz, na ile skalowalna jest infrastruktura.

**Krok 8: Sprawdź integracje z podmiotami trzecimi**

Sprawdź, jakich podmiotów trzecich używamy.
Wypisz wszystkie biblioteki zewnętrzne i ich rolę w systemie.
Zrozum, jak silnie są zintegrowane z systemem i jak trudno będzie je wymienić w przyszłości.

**Krok 9: Sprawdź podejście do testowania**

Sprawdź, jakie typy testów mamy (e2e, jednostkowe, integracyjne, kontraktowe itp.).
Zrozum strategię testowania. Czy testujemy wszystko, tylko kontrolery, tylko endpointy, tylko backend, tylko frontend itp.
Zrozum obecne pokrycie testami.

**Krok 10: Sprawdź podejście do bezpieczeństwa**

Sprawdź, jakie podejście do bezpieczeństwa ma repozytorium.
Zrozum, jak zaimplementowano uwierzytelnianie i autoryzację.
Sprawdź, jakich zewnętrznych narzędzi i bibliotek bezpieczeństwa używamy.
Sprawdź, jak zabezpieczone są baza danych i endpointy.
Ustal, które endpointy są publicznie dostępne.
Oceń ogólne podejście do bezpieczeństwa.

Jeśli dostępne jest narzędzie `sonarqube`, uzupełnij analizę o metryki z SonarCloud:
- **Metryki jakości**: Pobierz rating bezpieczeństwa (security rating), niezawodności (reliability rating) i utrzymywalności (maintainability rating).
- **Coverage i duplikacje**: Sprawdź % pokrycia kodu testami oraz % duplikacji kodu.
- **Issues**: Pobierz podsumowanie otwartych issues według typu (bug, vulnerability, code smell) i severity.
- **Quality gate**: Sprawdź status quality gate i warunki, które nie zostały spełnione.

Uwzględnij te metryki w sekcjach raportu dotyczących bezpieczeństwa (Krok 10) i potencjalnych usprawnień (Krok 11).

Jeśli narzędzie `sonarqube` nie jest dostępne, pomiń i kontynuuj analizę bez danych Sonar.

Dodatkowo, jeśli deweloper korzysta z **SonarQube for IDE** (Connected Mode), poproś o sprawdzenie panelu Problems w VS Code pod kątem issues wykrytych lokalnie. SonarQube for IDE zapewnia real-time feedback o bugs, vulnerabilities i code smells, uzupełniając dane z SonarCloud o bieżącą analizę lokalną (referencja: skill `ensuring-code-quality`).

**Krok 11: Wyszukaj potencjalne usprawnienia**

Na podstawie wszystkich ustaleń zaproponuj potencjalne usprawnienia.
Podziel je na: Krytyczne, Do wdrożenia ale niekrytyczne, Nice to have.

**Krok 12: Sprawdź martwy kod i duplikacje**

Przeanalizuj importy i zależności, aby sprawdzić, czy w bazie kodu występuje martwy kod lub duplikacje.
Wyszukaj nieużywane importy, funkcje, komponenty, pliki itp.
Wyszukaj zduplikowany kod, funkcje, komponenty itp., które można wyekstrahować do wspólnego miejsca i ponownie wykorzystać.
Wyszukaj komponenty bardzo podobne do siebie, które można połączyć w jeden z użyciem konfiguracji.
Wyszukaj kod używany wyłącznie we własnych plikach testowych i przenieś go tam albo usuń, jeśli nie jest używany poza testami.

## Duża Baza Kodu

Proces może zająć trochę czasu, dlatego utwórz dokument zawierający sekcję dla każdego kroku.

W trakcie pracy regularnie aktualizuj ten dokument.

## Raport

Gdy używasz tego skilla samodzielnie (lub gdy użytkownik wyraźnie prosi o osobny raport z analizy bazy kodu), zapisz wyniki analizy jako osobny dokument zgodny z szablonem `./codebase-analysis.example.md`.
Gdy ten skill jest wywołany przez inny prompt lub workflow, który definiuje własny wymagany plik wyjściowy lub szablon, osadź odpowiednie wnioski w wymaganym wyniku tego wywołania zamiast tworzyć osobny raport z analizy bazy kodu, chyba że użytkownik wyraźnie o to poprosi.

W samodzielnych raportach zgodnych z `./codebase-analysis.example.md` nie dodawaj ani nie usuwaj żadnych sekcji z szablonu. Ściśle trzymaj się struktury i konwencji nazewnictwa, aby zachować przejrzystość i spójność.
Dla repozytoriów typu monorepo zduplikuj odpowiednie sekcje (Analiza Backendu, Analiza Frontendu itp.) dla każdej aplikacji lub paczki, gdy znacząco się różnią, i wyraźnie oznacz je nazwą aplikacji lub paczki.
