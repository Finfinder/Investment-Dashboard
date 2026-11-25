# Semantyczny HTML i ARIA

Szczegóły wyboru semantyki, landmarków, ról, accessible names i wzorców ARIA. Używaj tej referencji, gdy zadanie dotyczy struktury HTML, niestandardowych komponentów albo korekty drzewa dostępności.

## Semantyka HTML

- Dobierz element do intencji: `<button>` dla akcji, `<a href>` dla nawigacji, `<input>`, `<select>` i `<textarea>` dla pól formularza.
- Stosuj landmarki do struktury strony: `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`; nie zastępuj ich rolami bez potrzeby.
- Utrzymuj logiczną hierarchię nagłówków: jedno główne `<h1>` na widok, potem kolejne poziomy bez pomijania.
- Używaj `<details>` i `<summary>` dla prostych ujawnień treści, jeśli natywne zachowanie wystarcza.
- Po zmianach w bibliotece komponentów sprawdź wyrenderowany HTML i drzewo dostępności, a nie tylko JSX/Razor/template.

## Landmarki i role

| Potrzeba | Preferowany HTML | ARIA tylko gdy HTML nie wystarcza |
| --- | --- | --- |
| Nawigacja | `<nav>` | `role="navigation"` |
| Główna treść | `<main>` | `role="main"` |
| Treść uzupełniająca | `<aside>` | `role="complementary"` |
| Przycisk | `<button>` | `role="button"` plus `tabindex="0"` i Enter/Space |
| Dialog | natywny `<dialog>` albo komponent dialogu | `role="dialog"`, `aria-modal`, `aria-labelledby` |

Nie dodawaj ról, które powtarzają natywną semantykę, np. `role="button"` na `<button>` albo `role="heading"` na `<h2>`.

## Accessible Names

- Przyciski i linki muszą mieć nazwę wynikającą z tekstu, `aria-label`, `aria-labelledby` albo dostępnego tekstu alternatywnego.
- Przyciski tylko z ikoną wymagają nazwy akcji, np. `aria-label="Zamknij"`, a nie opisu ikony.
- Obrazy informacyjne wymagają znaczącego `alt`; dekoracyjne obrazy powinny mieć `alt=""`.
- Pola formularzy powinny mieć widoczną etykietę powiązaną przez `<label for>` albo równoważny mechanizm komponentu.
- `aria-label` nie naprawia problemów semantyki elementów nieinteraktywnych i może być ignorowane na zwykłym tekście.

## Kiedy ARIA pomaga

- `aria-expanded` na przycisku rozwijającym panel, menu lub akordeon.
- `aria-controls` jako dodatkowe powiązanie triggera z panelem, jeśli framework i AT dobrze je obsługują.
- `aria-current="page"` na aktywnym linku nawigacji.
- `aria-modal="true"`, `aria-labelledby` i opcjonalnie `aria-describedby` dla dialogu.
- `aria-invalid` i `aria-describedby` dla pól z błędem.
- `role="status"`, `role="alert"` albo `aria-live` dla istotnych zmian dynamicznych.
- `role="progressbar"` z `aria-valuemin`, `aria-valuemax` i `aria-valuenow` dla niestandardowego postępu.

## Kiedy ARIA szkodzi

- Gdy maskuje zły element zamiast użycia natywnego HTML.
- Gdy nadpisuje natywną rolę elementu bez jasnej potrzeby.
- Gdy dodaje role bez kompletnego modelu klawiatury dla wzorca.
- Gdy ukrywa element interaktywny przez `aria-hidden="true"`.
- Gdy tworzy niespójne stany, np. `aria-expanded="true"` przy zamkniętym panelu.

## Wzorce i antywzorce

| Wzorzec | Dobrze | Źle |
| --- | --- | --- |
| Akcja | `<button type="button">Zapisz</button>` | `<div onclick="save()">Zapisz</div>` |
| Link | `<a href="/raport">Raport</a>` | `<button onclick="go('/raport')">Raport</button>` |
| Ikona zamknięcia | `<button aria-label="Zamknij">…</button>` | `<button><span aria-hidden="true">X</span></button>` bez nazwy |
| Bieżąca strona | `<a aria-current="page" href="/settings">Ustawienia</a>` | Sam kolor aktywnego linku |
| Rozwijanie | `<button aria-expanded="false" aria-controls="filters">Filtry</button>` | Ikona chevron bez stanu dostępnego |

## Inspekcja

- Sprawdź drzewo dostępności w devtools i zweryfikuj role, nazwy oraz stany.
- Użyj lintera `jsx-a11y` lub odpowiednika frameworka do wyłapania oczywistych błędów.
- Potwierdź ręcznie, że tekst odczytywany przez czytnik ekranu odpowiada intencji UI.
