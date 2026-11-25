---
name: technical-context-discovering
description: Odkrywaj kontekst techniczny przed implementacją — sprawdzaj instrukcje, wzorce kodu i dokumentację zewnętrzną.
---

# Odkrywanie Kontekstu Technicznego

Ta umiejętność zapewnia systematyczne podejście do zrozumienia kontekstu technicznego projektu przed wprowadzeniem jakichkolwiek zmian w kodzie. Zapewnia spójność z istniejącymi wzorcami i zapobiega wprowadzaniu sprzecznych konwencji.

## Kiedy Używać

- Przed implementacją dowolnej funkcji lub poprawki
- Przed pisaniem testów (jednostkowych, integracyjnych, E2E)
- Przed podejmowaniem decyzji architektonicznych wpływających na istniejący kod
- Podczas wdrażania się w nowy obszar bazy kodu

## Proces Odkrywania Kontekstu Technicznego

Użyj poniższej checklisty i śledź postęp:

```
Postęp odkrywania:
- [ ] Krok 1: Sprawdź pliki instrukcji Copilot
- [ ] Krok 2: Przeanalizuj istniejące wzorce bazy kodu
- [ ] Krok 3: Skonsultuj dokumentację zewnętrzną (w razie potrzeby)
- [ ] Krok 4: Zastosuj regułę implementacji
```

**Krok 1: Sprawdź Pliki Instrukcji Copilot**

**ZAWSZE najpierw sprawdź**, czy w projekcie istnieją instrukcje Copilot:

- Szukaj pliku `.github/copilot-instructions.md` w katalogu głównym repozytorium.
- Szukaj plików `*.instructions.md` w odpowiednich katalogach (np. `src/`, `tests/`, `e2e/`, `backend/`, foldery specyficzne dla funkcji).
- Szukaj katalogu `.copilot/` z plikami konfiguracyjnymi.

Jeśli pliki instrukcji istnieją, są one **głównym źródłem prawdy** dla:

- Standardów kodowania i konwencji
- Wzorców architektonicznych i struktury projektu
- Szczegółów stosu technologicznego i wymagań wersji
- Strategii i wzorców testowania
- Konwencji nazewnictwa i organizacji plików
- Strategii locatorów (dla testów E2E)
- Podejść do zarządzania danymi testowymi
- Konfiguracji środowiska

**Krok 2: Przeanalizuj Istniejące Wzorce Bazy Kodu**

Jeśli nie znaleziono instrukcji Copilot albo nie obejmują one konkretnych aspektów, **przeanalizuj istniejącą bazę kodu**, aby zrozumieć i odtworzyć ustalone wzorce:

- **Wzorce architektoniczne**: Zbadaj strukturę folderów, warstwowanie (kontrolery, serwisy, repozytoria) oraz organizację modułów.
- **Styl kodu**: Przeanalizuj istniejące pliki pod kątem konwencji nazewnictwa, formatowania i stosowanych idiomów.
- **Obsługa błędów**: Sprawdź, jak wyjątki są przechwytywane, logowane i zwracane do klientów.
- **Wzorce walidacji**: Sprawdź, jak zaimplementowano walidację wejścia (dekoratory, middleware, ręczne sprawdzenia).
- **Wzorce testowania**: Przejrzyj istniejące testy, aby zrozumieć strukturę, strategie mockowania, style asercji, fixture'y i zarządzanie danymi testowymi.
- **Wzorce bazodanowe**: Zbadaj istniejące migracje, encje/modele oraz wzorce zapytań.
- **Wzorce API**: Przeanalizuj istniejące endpointy pod kątem formatów odpowiedzi, kodów statusu i stylu dokumentacji.
- **Konfiguracja**: Sprawdź, jak zarządzane są zmienne środowiskowe, flagi funkcji i konfiguracja.
- **Kontekst .NET/C#**: Jeśli repozytorium zawiera `.sln`, `.csproj`, `global.json`, `Directory.Build.props`, `Directory.Packages.props`, `Directory.Build.targets`, `.editorconfig`, `nuget.config`, Roslyn analyzers albo projekty testowe, potraktuj je jako główne źródła wersji SDK, docelowego frameworka, stylu, zależności i bramek walidacyjnych.
- **Polityka zależności i licencji**: Przed zmianami pakietów lub architektury sprawdź lokalne instrukcje, README, pliki centralnego zarządzania pakietami, politykę pakietów zakazanych/ograniczonych, licencje oraz wymagany audyt bezpieczeństwa właściwy dla ekosystemu.

**Używaj narzędzi `search` i `vscode/listCodeUsages`**, aby znajdować podobne implementacje w bazie kodu i stosować to samo podejście.

**Krok 3: Skonsultuj Dokumentację Zewnętrzna**

Jeśli ani instrukcje Copilot, ani wystarczające istniejące wzorce w bazie kodu nie są dostępne (np. nowy projekt, funkcja greenfield albo pierwsza implementacja konkretnego wzorca), **użyj dokumentacji zewnętrznej i branżowych dobrych praktyk**:

- **Użyj narzędzia `context7`**, aby wyszukać oficjalną dokumentację używanego frameworka/biblioteki (najpierw sprawdź konfigurację projektu pod kątem dokładnych wersji).
- Zastosuj **branżowe dobre praktyki** odpowiednie dla danego stosu technologicznego.
- Przestrzegaj **wytycznych bezpieczeństwa OWASP** dla bezpiecznych praktyk kodowania.
- Zastosuj **zasady SOLID** i wzorce czystej architektury.
- Używaj **dobrze ugruntowanych wzorców projektowych** odpowiednich dla danego przypadku użycia.

**WAŻNE**: Gdy stosujesz dobre praktyki w scenariuszu greenfield, dokumentuj decyzje w komentarzach kodu lub w README, aby ustanowić wzorce dla przyszłego rozwoju.

**Krok 4: Zastosuj Regułę Implementacji**

Na podstawie tego, co odkryto, zastosuj poniższą hierarchię decyzji:

| Dostępny Kontekst | Działanie |
|---|---|
| Istnieją pliki instrukcji | Stosuj je ściśle. Instrukcje mają pierwszeństwo nad ogólnymi dobrymi praktykami. |
| Brak instrukcji, ale baza kodu ma wzorce | Odwzoruj istniejące wzorce dokładnie. Spójność z istniejącym kodem > teoretyczne najlepsze praktyki. |
| Brak instrukcji i brak istniejących wzorców | Zastosuj dobre praktyki oparte na dokumentacji i standardach branżowych. Udokumentuj decyzje na potrzeby przyszłych odniesień. |

**Krytyczna reguła**: Nigdy nie wprowadzaj nowych wzorców, chyba że użytkownik wyraźnie o to poprosi lub zostanie to określone w planie implementacji.
