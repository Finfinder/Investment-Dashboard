# Walidacja Przykładów i Narzędzia — Writing Docs

Referencja dla snippetów, komend, outputów, linków i narzędzi walidacyjnych. Używaj jej przed publikacją docs zawierających kod, terminal, konfigurację, linki lub dane wrażliwe.

## Reguły Snippetów

- Każdy blok kodu ma język w fence, kompletne importy i minimalny kontekst uruchomienia.
- Snippet powinien działać po skopiowaniu albo jasno wskazywać, które wartości użytkownik musi podmienić.
- Dane testowe mają być realistyczne, ale nie mogą wyglądać jak prawdziwe credentials.
- Komentarze w snippetach tłumaczą nietrywialne decyzje, nie każdą linię.
- Output pokazuj bezpośrednio pod komendą albo kodem, gdy pomaga zweryfikować sukces.
- Warianty systemowe oznaczaj jawnie: PowerShell, Bash, Windows, Linux, Docker, CI.

## Walidacja Komend i Outputów

1. Ustal katalog roboczy, wymagane wersje i zależności.
2. Uruchom komendę w środowisku możliwie bliskim użytkownikowi.
3. Sprawdź kod wyjścia, pliki wynikowe, logi i output opisany w docs.
4. Usuń lokalne ścieżki, dane prywatne i niestabilne timestampy z przykładowego outputu.
5. Jeśli nie można uruchomić komendy, napisz w finalnej odpowiedzi albo docs, czego nie zweryfikowano i dlaczego.

## Walidacja Linków

- Preferuj linki względne dla plików w repozytorium.
- Po przeniesieniu strony dodaj redirect albo zaktualizuj wszystkie linki.
- Linki zewnętrzne do dokumentacji vendorów sprawdzaj okresowo; szczególnie wersjonowane API i narzędzia CLI.
- Anchor linki w Markdown sprawdzaj po zmianie nagłówków.

## Narzędzia

| Narzędzie | Sprawdza | Użyj gdy |
| --- | --- | --- |
| `markdownlint` | Format Markdown, headingi, listy, fenced code blocks | Repo ma standard Markdown albo CI docs |
| `Vale` | Styl, terminologię i zakazane frazy | Dokumentacja publiczna wymaga spójnego tonu |
| `markdown-link-check` | Martwe linki i redirecty | Docs zawierają linki wewnętrzne lub zewnętrzne |
| `doctest` / `pytest --doctest-modules` | Przykłady Python w docstringach i Markdown | Snippety Python mają być kontraktem |
| `pytest`, `vitest`, `go test`, `dotnet test` | Przykłady wyciągnięte do plików testowych | Snippet jest zbyt duży na inline doctest |
| `OpenAPI/Swagger validation` | Zgodność schematów API | Dokumentujesz REST API albo publiczny SDK |
| `Storybook` | Przykłady komponentów i stany UI | Dokumentujesz komponenty frontendowe |

## Placeholdery Sekretów

Stosuj placeholdery, które nie wyglądają jak działające sekrety:

- `YOUR_API_KEY`
- `$TOKEN`
- `${DB_PASSWORD}`
- `<connection-string>`
- `example.com`, `localhost`, `127.0.0.1`
- `user@example.com`, `org_test_123`, `pf_example_001`

Unikaj wartości typu `sk_live_...`, `admin123`, realnych domen klientów, prywatnych hostów, prawdziwych tenantów, connection stringów z nazwą produkcyjnej bazy i tokenów z poprawnym prefiksem providera.

## Minimalna Checklista Przed Publikacją

- [ ] Snippety kompilują się albo uruchamiają w opisanym środowisku.
- [ ] Komendy mają katalog roboczy, wymagania i oczekiwany wynik.
- [ ] Outputy są aktualne i nie zawierają prywatnych danych.
- [ ] Linki wewnętrzne i zewnętrzne działają.
- [ ] Wersje narzędzi, bibliotek i API są zgodne z kodem lub opisanym zakresem.
- [ ] Sekrety, hasła, tokeny i connection stringi są placeholderami.
- [ ] Nie ma fałszywych obietnic ani funkcji spoza kodu.
