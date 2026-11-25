---
name: review-it
description: "Sprawdź implementację względem planu i kontekstu funkcji — weryfikacja IT/biznesowa."
disable-model-invocation: true
---

# Przegląd Implementacji IT / Biznesowy

> **Kontekst migracji z promptu**: Ten skill powstał w wyniku migracji promptu `.github/prompts/review-it.prompt.md` dla środowiska Agent Host / Copilot CLI.
> - **Oryginalny agent**: `code-reviewer`

Twoim celem jest przegląd implementacji względem dostarczonego planu implementacji i kontekstu funkcji. Wyłącznie weryfikacja IT/biznesowa — nie analizujesz bezpieczeństwa ani jakości kodu (code smells, bugs, duplikacje).

## Wymagane skille

Przed rozpoczęciem załaduj i stosuj następujące skille:
- `implementation-gap-analysing` — do porównania wdrożonego rozwiązania z planem i weryfikacji kompletności
- `technical-context-discovering` — do zrozumienia konwencji projektu i standardów kodowania

## Zakres

Review-it wykonuje wyłącznie weryfikację IT/biznesową względem planu i kontekstu funkcji. Nie analizujesz bezpieczeństwa (OWASP, injection, XSS, CSRF) ani jakości kodu (code smells, bugs, duplikacje, coverage). Te obszary są obsługiwane przez osobne podprompty: `/review-security` i `/review-code`.

## Workflow

1. **Zrozum kontekst**: Załaduj pliki `*.research.md` i `*.plan.md`, aby zrozumieć wymagania zadania oraz plan implementacji. Upewnij się, że przeglądasz także pliki `*.instructions.md` z wytycznymi specyficznymi dla projektu.
2. **Zweryfikuj definition of done**: Sprawdź każdy element z definition of done zdefiniowany w fazach planu zadania. Gdy definition of done jest spełnione, zaznacz checkbox przy ukończonym elemencie w dokumencie planu. Jeśli zadanie jest powiązane z GitHub Issue (numer znany z pola `issue:` we frontmatterze `*.plan.md`, URL-a GitHub Issue w treści planu lub wzorca `Issue/<number>` albo `Issue-<number>` w nazwie aktywnego brancha), pobierz treść Issue i sprawdź, czy zawiera sekcję "Definition of Done" z checkboxami. Jeśli tak: dla każdego checkboxa zweryfikuj, czy implementacja spełnia dany warunek — jeśli tak, zaznacz checkbox w treści Issue (edytując Issue body). Niespełnione warunki odnotuj w zwracanych wynikach (findings) — to one trafią do sekcji "Code Review Findings" pliku planu. Nie zamykaj Issue ani nie zmieniaj jego statusu — to należy do kroku `/commit`. Jeśli numeru Issue nie da się ustalić jednoznacznie z tych źródeł, pomiń ten podpunkt — nie zgaduj numeru.
3. **Zweryfikuj kryteria akceptacji**: Sprawdź każdy element z checklisty kryteriów akceptacji w pliku planu. Gdy kryterium akceptacji jest spełnione, zaznacz checkbox przy ukończonym elemencie w pliku planu.
4. **Podsumuj ustalenia**: Przygotuj podsumowanie ustaleń, w tym wykryte problemy i rekomendacje usprawnień. Zwróć wyniki (findings) jako output — nie zapisuj ich bezpośrednio do pliku planu (`*.plan.md`); jedyną dozwoloną bezpośrednią edycją pliku planu jest zaznaczanie checkboxów Definition of Done i kryteriów akceptacji (kroki 2–3). Orkestrator wykona pojedynczą atomową aktualizację sekcji "Code Review Findings" po zebraniu wyników ze wszystkich podpromptów. Uwzględnij wynik weryfikacji Definition of Done z GitHub Issue (które checkboxy zaznaczono, które pozostały niespełnione).
