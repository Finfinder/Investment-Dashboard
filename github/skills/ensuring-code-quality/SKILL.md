---
name: ensuring-code-quality
description: "Weryfikuj jakość kodu przez Sonar (IDE, MCP, Cloud) i lokalne analizatory. Używaj przy sprawdzaniu Quality Gate, issues i konfiguracji narzędzi jakości."
---

# Zapewnianie Jakości Kodu

Ten skill opisuje proces weryfikacji jakości kodu z wykorzystaniem ekosystemu Sonar oraz lokalnych narzędzi analizy statycznej. Obejmuje trzy warstwy: real-time feedback w edytorze (SonarQube for IDE), wyniki CI (SonarCloud) i programatyczny dostęp dla AI agentów (SonarQube MCP Server).

## Ekosystem Narzędzi

| Narzędzie | Cel | Użytkownik | Czas feedbacku |
|---|---|---|---|
| **SonarQube for IDE** | Real-time analiza w edytorze (Connected Mode) | Deweloper (człowiek) | Sekundy |
| **SonarCloud CI** | Analiza na push/PR, Quality Gate, PR decoration | CI/CD pipeline | Minuty |
| **SonarQube MCP Server** | Odpytywanie wyników SonarCloud (narzędzia `sonarqube/*`) | AI agent (Copilot) | Na żądanie |
| **.editorconfig + Roslyn analyzers** | Lokalne reguły formatowania i stylu kodu | Deweloper + agent | Natychmiast |
| **SCA / audyt zależności** | Podatności i licencje zależności zgodnie z ekosystemem oraz polityką repo | CI/CD pipeline + agent | Na żądanie / CI |

## Proces Weryfikacji Jakości Kodu

Użyj poniższej checklisty i śledź postęp:

```
Postęp weryfikacji:
- [ ] Krok 1: Zweryfikuj konfigurację SonarQube for IDE
- [ ] Krok 2: Sprawdź wyniki SonarQube for IDE (analiza lokalna)
- [ ] Krok 3: Sprawdź wyniki SonarCloud CI (analiza serwerowa)
- [ ] Krok 4: Odpytaj SonarQube MCP Server (analiza programatyczna)
- [ ] Krok 5: Zweryfikuj zgodność z lokalnymi analizatorami
- [ ] Krok 6: Wykonaj triage i reaguj na znalezione issues
```

**Krok 1: Zweryfikuj konfigurację SonarQube for IDE**

Upewnij się, że deweloper ma poprawnie skonfigurowane SonarQube for IDE z Connected Mode:

- Rozszerzenie `SonarSource.sonarlint-vscode` jest zainstalowane w VS Code
- Connected Mode jest aktywny (zsynchronizowany z SonarCloud)
- Plik `.sonarlint/connectedMode.json` istnieje w repozytorium (shared binding)

Jeśli deweloper nie ma skonfigurowanego Connected Mode, skieruj go do sekcji "SonarQube for IDE" w README projektu.

**Krok 2: Sprawdź wyniki SonarQube for IDE (analiza lokalna)**

Poproś dewelopera o sprawdzenie panelu **Problems** w VS Code pod kątem issues wykrytych przez SonarQube for IDE. Dotyczy to:

- **Bugs** — potencjalne błędy w logice
- **Vulnerabilities** — luki bezpieczeństwa
- **Code Smells** — problemy z utrzymywalnością kodu
- **Security Hotspots** — fragmenty wymagające manualnej weryfikacji bezpieczeństwa

SonarQube for IDE analizuje kod lokalnie i synchronizuje reguły z SonarCloud (Quality Profile). Issues oznaczone jako Accepted lub False Positive na serwerze są automatycznie tłumione w IDE.

> **Uwaga**: SonarQube for IDE jest narzędziem dla dewelopera (człowieka). Agent nie ma bezpośredniego dostępu do wyników SonarQube for IDE — może jedynie poprosić dewelopera o ich sprawdzenie.

**Krok 3: Sprawdź wyniki SonarCloud CI (analiza serwerowa)**

Zweryfikuj wyniki analizy CI na SonarCloud:

- **Quality Gate** — czy przechodzi? Jeśli nie, zidentyfikuj warunki, które nie zostały spełnione.
- **PR decoration** — jeśli istnieje otwarty PR, sprawdź komentarze SonarCloud z wynikami analizy.
- **New Code** — skup się na issues w nowym kodzie (focus na zmianach, nie na historycznym długu technicznym).

**Krok 4: Odpytaj SonarQube MCP Server (analiza programatyczna)**

Jeśli dostępne jest narzędzie `sonarqube`, odpytaj SonarCloud o:

- **Issues na branchu/PR**: Lista nowych issues (bugs, vulnerabilities, code smells) wprowadzonych przez analizowane zmiany
- **Quality Gate status**: Czy quality gate przechodzi, które warunki nie zostały spełnione
- **Security hotspots**: Hotspoty wymagające manualnego review
- **Metryki**: Coverage, duplications, maintainability rating

Jeśli narzędzie `sonarqube` nie jest dostępne (brak konfiguracji MCP Server), pomiń ten krok.

**Krok 5: Zweryfikuj zgodność z lokalnymi analizatorami**

Sprawdź, czy kod jest zgodny z lokalnymi regułami zdefiniowanymi w:

- **`.editorconfig`** — reguły formatowania i stylu kodu (wcięcia, koniec linii, styl nawiasów)
- **Roslyn analyzers** — reguły specyficzne dla .NET (styl kodu, ostrzeżenia kompilatora)

Te narzędzia uzupełniają analizę Sonar o reguły lokalne, które mogą nie być pokryte przez SonarCloud.

Po zmianach zależności bramka jakości obejmuje także SCA/audyt podatności oraz sprawdzenie licencji właściwe dla ekosystemu projektu i lokalnej polityki repozytorium.

**Krok 6: Wykonaj triage i reaguj na znalezione issues**

Dla każdego znalezionego issue zastosuj odpowiedni workflow:

| Decyzja | Akcja |
|---|---|
| **Napraw** | Zaimplementuj poprawkę zgodnie z rekomendacją narzędzia. Priorytet: Bugs > Vulnerabilities > Security Hotspots > Code Smells. |
| **Suppresuj** | Jeśli issue jest fałszywie pozytywne lub akceptowalne (np. celowy wzorzec), oznacz jako False Positive / Won't Fix na SonarCloud z uzasadnieniem. SonarQube for IDE automatycznie odzwierciedli tę decyzję. |
| **Zgłoś** | Jeśli issue wymaga decyzji architekta lub jest poza zakresem bieżącego zadania, udokumentuj je jako debt techniczny. |

## Powiązane Skille

- `code-reviewing` — przegląd kodu, w tym Krok 7 (narzędzia statycznej analizy) który korzysta z tego samego ekosystemu Sonar
- `codebase-analysing` — analiza bazy kodu, w tym Krok 10 (bezpieczeństwo) który uzupełnia metryki z SonarCloud
- `implementing-dotnet` — szczegółowe reguły .NET/C#, NuGet, Roslyn analyzers i audytu pakietów
- `technical-context-discovering` — odkrywanie kontekstu technicznego, w tym konwencji jakości kodu w projekcie
