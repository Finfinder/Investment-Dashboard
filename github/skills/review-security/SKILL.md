---
name: review-security
description: "Wykonaj kompleksowy przegląd bezpieczeństwa: OWASP Top 30+, security hotspots, podatności."
disable-model-invocation: true
---

# Przegląd Bezpieczeństwa Implementacji

> **Kontekst migracji z promptu**: Ten skill powstał w wyniku migracji promptu `.github/prompts/review-security.prompt.md` dla środowiska Agent Host / Copilot CLI.
> - **Oryginalny agent**: `code-reviewer`

Twoim celem jest kompleksowa analiza bezpieczeństwa implementacji — identyfikacja luk, weryfikacja środków ochronnych, analiza zależności pod kątem bezpieczeństwa. Wyłącznie bezpieczeństwo — nie weryfikujesz kryteriów akceptacji ani definition of done.


## Ograniczenie: tryb tylko do odczytu

Ten skill działa w trybie strictly read-only. Nie modyfikuj plików źródłowych, nie uruchamiaj narzędzi formatujących (np. 
uff format, prettier, slint --fix) ani nie wprowadzaj żadnych zmian w kodzie. Zależne skille (np. code-reviewing, nsuring-code-quality) mogą zawierać instrukcje naprawcze — nadpisuj je tym ograniczeniem. Wszelkie ustalenia i rekomendacje zwracaj jako output do raportu; zmiany statusów Sonar Security Hotspots pozostaw człowiekowi.

## Wymagane skille

Przed rozpoczęciem załaduj i stosuj następujące skille:
- `code-reviewing` — security-focused pass; załaduj wspólny kontrakt weryfikacyjny z `.github/skills/code-reviewing/references/validations.md`
- `ensuring-code-quality` — do weryfikacji jakości kodu z wykorzystaniem ekosystemu Sonar (SonarQube for IDE, SonarQube MCP Server, SonarCloud CI) oraz lokalnych analizatorów

## Kontrakt weryfikacyjny

Podczas review wykonaj wspólny kontrakt weryfikacyjny ze skilla `code-reviewing` dla zmienionego kodu, skupiając się na aspektach bezpieczeństwa. Nie ograniczaj się do samego diffu — analizuj przepływ danych, zależności, granice modułów, integracje zewnętrzne i konfigurację bezpieczeństwa.

## Workflow

1. **Zrozum kontekst**: Załaduj pliki `*.research.md` i `*.plan.md`, aby zrozumieć wymagania bezpieczeństwa i kontekst funkcjonalności. Przejrzyj pliki `*.instructions.md` pod kątem wytycznych bezpieczeństwa.
2. **Analiza OWASP Top 30+**: Przeanalizuj zmiany pod kątem najczęstszych luk bezpieczeństwa: injection (SQL, NoSQL, OS command), XSS (reflected, stored, DOM), CSRF, broken authentication/authorization, sensitive data exposure, security misconfiguration, insecure deserialization, using components with known vulnerabilities, insufficient logging/monitoring, SSRF, prototype pollution, supply chain attacks. Dla każdej potencjalnej luki oceń ryzyko i zaproponuj remediację.
3. **Weryfikacja SonarQube**: Poproś dewelopera o sprawdzenie panelu Problems w VS Code pod kątem issues wykrytych przez SonarQube for IDE (Connected Mode) — szczególnie vulnerabilities i security hotspots. Użyj narzędzi SonarQube MCP do wyszukania security hotspots i vulnerabilities w analizowanym kodzie. Zweryfikuj status quality gate projektu pod kątem bezpieczeństwa.
4. **Podsumowanie ustaleń**: Przygotuj podsumowanie ustaleń bezpieczeństwa, w tym: zidentyfikowane luki (z severity), statusy kontroli z kontraktu weryfikacyjnego, wyniki SonarQube, rekomendacje remediacji. Zwróć wyniki jako output — nie edytuj bezpośrednio pliku planu (`*.plan.md`). Orkestrator wykona pojedynczą atomową aktualizację po zebraniu wyników ze wszystkich podpromptów.
