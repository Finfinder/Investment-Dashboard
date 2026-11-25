---
name: create-research
description: "Przygotuj kontekst dla konkretnego zadania lub funkcji z perspektywy inżynierii kontekstu."
disable-model-invocation: true
---

# Research Kontekstu Zadania

> **Kontekst migracji z promptu**: Ten skill powstał w wyniku migracji promptu `.github/prompts/research.prompt.md` dla środowiska Agent Host / Copilot CLI.
> - **Oryginalny agent**: `context-engineer`
> - **Oryginalny model**: `GPT-5.5`

Przeprowadź research zadania na podstawie podanego numeru lub linku GitHub Issue (`gh`) albo opisu zadania.

Wynikiem powinien być plik Markdown nazwany na podstawie slug zadania lub numeru Issue w formacie kebab-case (np. `user-authentication.research.md`). Plik powinien zostać umieszczony w katalogu `.github/Issue`.

Pliki `*.research.md` ZAWSZE twórz w języku polskim.

Powinien zawierać wszystkie istotne informacje potrzebne do zbudowania kompletnego kontekstu dla zadania lub funkcji.

## Wymagane umiejętności

Przed rozpoczęciem załaduj i stosuj poniższe skille:
- `task-analysing` - do ustrukturyzowanego procesu researchu oraz szablonu wyniku
- `technical-context-discovering` - do rozpoznania konwencji projektu i istniejących wzorców technicznych istotnych dla zadania
- `codebase-analysing` - do analizy istniejącej bazy kodu w kontekście wymagań zadania
- `system-modularising` - stosuj warunkowo wyłącznie do rozpoznania sygnałów, że przed planowaniem może być potrzebna modularyzacja
- `solution-researching` - do analizy rynku, porównania rozwiązań zewnętrznych i technologii (stosuj warunkowo — gdy zadanie wymaga wyboru podejścia)

## Przepływ pracy

1. Zbierz wszystkie informacje związane z zadaniem z bazy kodu, GitHub Issues (`gh issue view`), dokumentacji projektu oraz innych istotnych źródeł.
2. Dokładnie przeanalizuj zadanie, w tym jego elementy nadrzędne i podzadania (jeśli dotyczy), aby uzyskać pełny obraz wymagań.
3. Przeanalizuj stos technologiczny, branżę i domenę projektu, aby zrozumieć najlepsze praktyki, które należy zastosować podczas implementacji.
4. Oceń sygnały modularyzacji przed planowaniem: nowy bounded context, dekompozycja monolitu, niejasna własność modułów, zależności cykliczne, potrzeba kontraktu domenowego `domain.md`, własność danych między modułami, granice agregatów/modułów albo wiele podsystemów z niejasnymi granicami. Nie uruchamiaj automatycznie `/modularise`; zapisz rekomendację dla `/create-plan` w formacie `modularization: not-needed | use-existing-domain | run-modularise-first | include-in-plan` wraz ze zwięzłym uzasadnieniem. Dla `run-modularise-first` wskaż użytkownikowi uruchomienie `/modularise` przed planowaniem.
5. Oceń, czy zadanie wymaga analizy zewnętrznych rozwiązań (nowa technologia, wybór biblioteki, integracja z systemem zewnętrznym). Jeśli tak, zastosuj skill `solution-researching` i zapisz wynik jako osobny plik `<nazwa>.solution-research.md` w katalogu `.github/Issue`. Plik ten ma charakter czysto lokalny (ignorowany w repozytorium przez `.gitignore`), a w raporcie badawczym umieść streszczenie wniosków zamiast bezpośredniego linku do pliku lokalnego.
6. Sprawdź wszystkie zewnętrzne linki dodane do zadania. Jeśli jakiekolwiek pliki załączników (PDF, DOCX itp.) są dołączone, wskazane lub podlinkowane, użyj narzędzia `markitdown` (np. `markitdown_convert_to_markdown`), aby przekonwertować je na Markdown i przeanalizować ich treść.
7. Przeanalizuj, czy w opisie zadania występują niejasności lub braki informacyjne. Jeśli tak, poproś o doprecyzowanie przed finalizacją kontekstu.
8. Nie podawaj szczegółów implementacyjnych; skup się na zebraniu wymagań, historyjek użytkownika, kryteriów akceptacji i kluczowych przepływów.
9. Zapisz zebrane informacje zgodnie z szablonem `research.example.md` ze skilla `task-analysing`.
10. Upewnij się, że plik researchu jest klarowny, zwięzły i dostosowany do potrzeb zespołu deweloperskiego.

Ściśle przestrzegaj struktury szablonu i konwencji nazewnictwa, aby zapewnić przejrzystość i spójność.

W przypadku niejasności lub brakujących informacji w opisie zadania poproś o doprecyzowanie przed finalizacją kontekstu.

Aktualizuj plik researchu po każdej interakcji, jeśli pojawią się nowe informacje.
