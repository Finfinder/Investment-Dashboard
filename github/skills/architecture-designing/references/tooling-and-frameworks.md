# Narzędzia i Frameworki Architektoniczne

Materiał referencyjny do wyboru narzędzi diagramowania, dokumentowania decyzji i frameworków architektonicznych.

## Zasada Doboru

Domyślnie wybieraj najlżejsze narzędzie zgodne z repozytorium. Nie wprowadzaj nowego frameworka dokumentacyjnego, jeśli Mermaid, ADR i plan implementacji wystarczą do decyzji.

## Diagramy i Modele

| Narzędzie | Użyj gdy | Unikaj gdy |
| --- | --- | --- |
| Mermaid | Diagramy C4/UML w Markdown, szybkie review, version control | Repo ma twardy standard innego narzędzia albo diagram wymaga zaawansowanej notacji |
| PlantUML | Potrzebne są rozbudowane UML, sequence diagrams, legacy tooling lub istniejący standard repo | Prosty C4 w planie wystarczy |
| Structurizr | C4 model-as-code, wiele widoków, workspace architektoniczny, długoterminowe utrzymanie modelu | Jednorazowy plan albo mały projekt |
| draw.io | Szybkie szkice, whiteboard collaboration, dokumenty dla nietechnicznych interesariuszy | Diagram ma być tekstowy, recenzowalny i łatwy do diffowania |
| Excalidraw | Warsztat, ideacja, koncepcja wysokiego poziomu | Dokument finalny wymaga precyzyjnego modelu i kontroli wersji |

## Frameworki Dokumentacji

| Framework | Użyj gdy | Unikaj gdy |
| --- | --- | --- |
| ADR | Trzeba utrwalić istotną decyzję, alternatywy i konsekwencje | Decyzja jest lokalna, oczywista i łatwa do odwrócenia |
| C4 | Trzeba wyjaśnić kontekst, kontenery, komponenty i granice systemu | Diagram powtarza tylko strukturę katalogów |
| Arc42 | Potrzebna pełna, ustrukturyzowana dokumentacja architektury dla większego systemu | Mały plan implementacji lub pojedyncza zmiana |
| TOGAF | Enterprise Architecture, governance wielu systemów, standard organizacyjny | Pojedynczy projekt, mały zespół, brak wymagań enterprise governance |
| RFC | Potrzebna asynchroniczna dyskusja, komentarze i formalna akceptacja propozycji | Plan ma już wystarczający zakres i ownera decyzji |

## Mermaid jako Domyślny Format

W planach preferuj Mermaid, bo:

- Jest tekstowy i działa w Markdown.
- Dobrze poddaje się review i diffom.
- Nie wymaga dodatkowych binariów ani eksportów.
- Wystarcza dla C4 Context, Container, Component oraz prostych sequence diagrams.

Używaj prostych nazw, krótkich relacji i ogranicz liczbę elementów. Jeśli diagram robi się nieczytelny, podziel go na Context, Container i Component zamiast powiększać jeden widok.

## PlantUML

Wybierz PlantUML, gdy repozytorium już go używa albo potrzebujesz:

- Dokładniejszych sequence diagrams.
- UML class/component/deployment diagrams.
- Integracji z istniejącym generowaniem dokumentacji.
- Standaryzacji wyglądu diagramów w organizacji.

Nie wprowadzaj PlantUML tylko dla jednego prostego C4.

## Structurizr

Wybierz Structurizr, gdy architektura ma być utrzymywana jako model:

- Wiele systemów, zespołów albo produktów.
- Potrzeba wielu widoków z jednego źródła prawdy.
- Długoterminowy workspace C4 i publikacja diagramów.
- Review architektury obejmuje zależności między systemami.

Unikaj go dla jednorazowego planu, jeśli utrzymanie modelu będzie większym kosztem niż wartością.

## draw.io i Excalidraw

Użyj jako narzędzia warsztatowego, gdy trzeba szybko uzgodnić kształt z interesariuszami. Do finalnego planu przenieś decyzje i uproszczony diagram tekstowy, jeśli repozytorium preferuje diagram-as-code.

## Arc42 i TOGAF

Arc42 wybierz dla większej dokumentacji architektury produktu, gdy trzeba opisać cele, ograniczenia, widoki, decyzje, ryzyka i jakość w spójnym szablonie.

TOGAF stosuj tylko wtedy, gdy organizacja tego wymaga. Nie jest właściwym domyślnym frameworkiem dla małych zespołów i pojedynczych funkcji.

## Walidacja Narzędzi

Przed wyborem sprawdź:

```text
- [ ] Narzędzie jest zgodne z istniejącym stylem repozytorium.
- [ ] Koszt utrzymania jest proporcjonalny do wartości.
- [ ] Wynik da się recenzować w PR albo łatwo odtworzyć.
- [ ] Diagramy i dokumenty służą decyzji, nie tylko kompletności formalnej.
- [ ] Nie dodano nowej zależności narzędziowej bez potrzeby.
```
