---
name: review-ui
description: "Jednoprzebiegowa weryfikacja UI: porównaj implementację z projektem UI i zgłoś różnice."
disable-model-invocation: true
---

# Weryfikacja Zgodności UI z Projektem

> **Kontekst migracji z promptu**: Ten skill powstał w wyniku migracji promptu `.github/prompts/review-ui.prompt.md` dla środowiska Agent Host / Copilot CLI.
> - **Oryginalny agent**: `ui-reviewer`

Wykonaj pojedynczy przebieg weryfikacji, porównując obecną implementację z projektem UI. Zgłoś wszystkie znalezione różnice - nie poprawiaj kodu.

Ten prompt może być używany samodzielnie (użytkownik uruchamia go bezpośrednio) albo ta sama weryfikacja jest wykonywana, gdy `ui-reviewer` jest wywoływany jako subagent z `implement-ui`.

## Wymagane umiejętności

Przed rozpoczęciem załaduj i stosuj te umiejętności:

- `ui-verifying` - proces weryfikacji, kryteria, tolerancje, definicje poziomów ważności, format raportu

## Workflow

Postępuj zgodnie z 5-etapowym procesem weryfikacji zdefiniowanym w umiejętności `ui-verifying`. Umiejętność zawiera kompletny workflow obejmujący:

1. Zweryfikuj dane wejściowe (uruchomiony serwer deweloperski)
2. Pobierz EXPECTED z projktu UI - strukturę, wymiary i zrzut ekranu
3. Pobierz ACTUAL z implementacji przez `playwright` - strukturę, rzeczywiste wyrenderowane wymiary i zrzut ekranu
4. Porównaj zgodnie z kategoriami weryfikacji i tolerancjami z umiejętności
5. Wygeneruj ustrukturyzowany raport zgodnie z formatem raportu z umiejętności

Projekt UI jest **źródłem prawdy** dla każdego porównania. W razie wątpliwości nadrzędny jest projekt.
