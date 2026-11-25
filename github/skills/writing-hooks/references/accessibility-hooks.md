# Hooki Wspierające Dostępność

Wzorce dla hooków/composables pomagających obsługiwać fokus, klawiaturę i komunikaty asystujące. Ładuj tę referencję, gdy reużywalna logika UI dotyka focus trap, route focus, Escape, roving tabindex albo live regions; pełny audyt WCAG deleguj do `ensuring-accessibility`.

## Spis Treści

- [Granica odpowiedzialności](#granica-odpowiedzialności)
- [Focus trap helpers](#focus-trap-helpers)
- [Route focus](#route-focus)
- [Escape i zamykanie](#escape-i-zamykanie)
- [Roving tabindex](#roving-tabindex)
- [Live regions](#live-regions)
- [Kiedy delegować](#kiedy-delegować)

## Granica odpowiedzialności

Hook dostępnościowy powinien dostarczać mechanikę, nie ukrywać wymagań semantycznych komponentu. Komponent nadal odpowiada za poprawny element HTML/Razor, nazwę dostępną, role, etykiety i widoczny stan.

Dobry hook zwraca nazwane propsy/handlery albo funkcje rejestracji elementów. Nie powinien domyślnie renderować JSX/Razor, jeśli zaciera granicę między logiką a komponentem.

## Focus trap helpers

Focus trap musi:

- aktywować się tylko wtedy, gdy modal/dialog jest otwarty;
- przenieść fokus do sensownego elementu startowego;
- zatrzymać Tab/Shift+Tab wewnątrz kontenera;
- przywrócić fokus do triggera po zamknięciu;
- usunąć listenery i obserwatory przy cleanupie.

Własny helper stosuj tylko wtedy, gdy repo nie ma już sprawdzonego komponentu dialogu lub biblioteki focus management.

## Route focus

Po zmianie trasy aplikacja SPA powinna przenieść fokus w przewidywalne miejsce, zwykle na główny nagłówek albo kontener `main` z `tabIndex="-1"`. Hook route focus musi reagować na właściwą zależność routingu i czyścić subskrypcje routera.

Nie przechwytuj fokusu przy każdej drobnej zmianie stanu. Fokus po trasie to zachowanie nawigacyjne, nie mechanizm maskowania renderowania.

## Escape i zamykanie

Hook obsługujący Escape powinien:

- działać tylko w aktywnym zakresie, np. otwarty dialog/menu;
- respektować zagnieżdżone warstwy i nie zamykać tła spod aktywnego modala;
- czyścić listener przy deaktywacji;
- nie blokować natywnych skrótów pól tekstowych bez powodu.

## Roving tabindex

Roving tabindex stosuj w złożonych widgetach, gdzie wiele elementów zachowuje się jak jedna grupa klawiaturowa. Hook powinien zarządzać aktywnym indeksem, kierunkami klawiszy, disabled items i rejestracją elementów.

Zwracaj nazwane propsy lub funkcje `getItemProps`, aby komponent jasno kontrolował semantykę roli, etykiet i struktury DOM.

## Live regions

Hook live region powinien kontrolować częstotliwość i treść komunikatów. Nie spamuj czytnika ekranu przy każdej zmianie stanu technicznego.

- `polite` dla statusów niepilnych;
- `assertive` tylko dla pilnych komunikatów wymagających natychmiastowej uwagi;
- czyść timery i subskrypcje odpowiedzialne za opóźnione komunikaty.

## Kiedy delegować

Deleguj do `ensuring-accessibility`, gdy zadanie wymaga pełnej polityki WCAG, semantyki ARIA, kontrastu, zarządzania fokusem całego flow lub walidacji z czytnikiem ekranu. Ten plik pomaga napisać mechanikę hooka, ale nie zastępuje audytu dostępności komponentu.
