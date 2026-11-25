---
name: review
description: "Orkestrator przeglądu kodu — deleguje do wyspecjalizowanych podpromptów (/review-it, /review-security, /review-code) wykonywanych przez subagenta code-reviewer."
disable-model-invocation: true
---

# Koordynacja Przeglądu Kodu

> **Kontekst migracji z promptu**: Ten skill powstał w wyniku migracji promptu `.github/prompts/review.prompt.md` dla środowiska Agent Host / Copilot CLI.
> - **Oryginalny agent**: `software-engineer`

Twoim celem jest koordynacja przeglądu kodu poprzez delegowanie do trzech wyspecjalizowanych podpromptów wykonywanych przez subagenta `code-reviewer`. Nie wykonuj przeglądu bezpośrednio — zamiast tego uruchom jako subagenty `code-reviewer`.

## Podprompty do wykonania

Uruchom trzy podprompty jako niezależne subagenty `code-reviewer` **sekwencyjnie — jeden po drugim**. Każdy podprompt musi zakończyć się i zwrócić raport, zanim uruchomiony zostanie kolejny.

1. **`/review-it`** — IT/Business Review
   - Weryfikuje implementację względem planu (`.plan.md`)
   - Sprawdza definition of done i kryteria akceptacji
   - Nie analizuje bezpieczeństwa ani jakości kodu

2. **`/review-security`** — Security Review
   - Kompleksowa analiza bezpieczeństwa: OWASP Top 30+, security hotspots
   - Weryfikacja SonarQube vulnerabilities/hotspots
   - Sprawdza injection, XSS, CSRF, auth bypass, secrets exposure

3. **`/review-code`** — Code Quality Review
   - Analiza jakości kodu: bugi, code smells, zgodność ze standardami
   - Weryfikacja SonarQube bugs, code smells, duplications, coverage
   - Sprawdza zgodność z `*.instructions.md`

## Agregacja wyników

Po zakończeniu wszystkich trzech podpromptów:
1. Każdy podprompt zwraca wyniki (findings) jako output — nie zapisuje ich bezpośrednio do pliku planu (`*.plan.md`). Wyjątek: `/review-it` zaznacza w trakcie wykonania checkboxy Definition of Done i kryteriów akceptacji w pliku planu. Orkestrator może wtedy wykonać jedną spójną aktualizację, w której wszystkie sekcje zachowują jednolity format.
2. Orkestrator zbiera zwrócone wyniki z każdego podpromptu i wykonuje **pojedynczą atomową aktualizację** pliku planu (sekcje "Code Review Findings", "Security Review Findings", "Code Quality Review Findings").
3. Przygotuj podsumowanie ustaleń dla dewelopera.
4. Zaktualizuj changelog w pliku planu (informacja o wykonanym przeglądzie).

## Ograniczenia

- Nie powtarzaj pracy wykonanej przez podprompty
- Jeśli którykolwiek podprompt zawiedzie, spróbuj ponownie z doprecyzowanym promptem
- Maksymalnie 2-3 iteracje ponawiania na podprompt
