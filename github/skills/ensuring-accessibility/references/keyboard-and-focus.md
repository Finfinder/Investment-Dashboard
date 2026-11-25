# Klawiatura i Fokus

Szczegółowe wzorce obsługi klawiatury, kolejności fokusu, focus trapów, route focus, skip links i roving tabindex. Używaj tej referencji przy interaktywnych widgetach, modalach, menu, SPA navigation i dynamicznych zmianach fokusu.

## Podstawowy kontrakt klawiatury

- Wszystkie akcje dostępne myszą muszą być dostępne klawiaturą.
- `Tab` przechodzi między grupami i elementami fokusowalnymi w logicznej kolejności.
- `Shift+Tab` cofa fokus bez uwięzienia poza kontrolowanymi modalami.
- `Enter` aktywuje linki i przyciski; `Space` aktywuje przyciski i przełączniki.
- `Escape` zamyka tymczasowe warstwy: dialogi, menu, popover, combobox.
- Klawisze strzałek obsługują nawigację wewnątrz złożonych widgetów, gdy wzorzec tego wymaga.

## Typowe komponenty

| Komponent | Minimalne zachowanie klawiatury |
| --- | --- |
| Przycisk | `Enter` i `Space` aktywują |
| Link | `Enter` aktywuje; link ma realne `href` |
| Menu | Strzałki przechodzą po pozycjach, `Enter` wybiera, `Escape` zamyka |
| Zakładki | Strzałki zmieniają aktywną zakładkę, `Tab` opuszcza grupę |
| Akordeon | `Enter`/`Space` rozwija i zwija; nagłówki są przyciskami |
| Dialog/modal | Fokus wchodzi do dialogu, zostaje uwięziony, `Escape` zamyka, fokus wraca do triggera |
| Combobox/listbox | Strzałki nawigują po opcjach, `Enter` wybiera, `Escape` zamyka bez wyboru |

## Focus Order

- Kolejność fokusu powinna odpowiadać kolejności czytania i strukturze wizualnej.
- Nie używaj `tabindex > 0`; popraw DOM order albo strukturę komponentu.
- `tabindex="0"` dodawaj tylko elementom, które muszą wejść do naturalnej kolejności fokusu.
- `tabindex="-1"` stosuj do programowego fokusu na nagłówku, panelu, komunikacie błędu lub kontenerze po zmianie kontekstu.
- Element ukryty wizualnie, nieaktywny lub poza ekranem nie może pozostać przypadkowo fokusowalny.

## Focus Trap i powrót fokusu

Dla dialogów, modali i krytycznych overlayów:

1. Zapamiętaj element, który otworzył dialog.
2. Po otwarciu ustaw fokus na tytule, pierwszym sensownym polu albo pierwszej akcji.
3. Ogranicz `Tab` i `Shift+Tab` do elementów wewnątrz dialogu.
4. `Escape` zamyka dialog, jeśli nie łamie to bezpieczeństwa operacji.
5. Po zamknięciu przywróć fokus triggerowi albo najbliższemu logicznemu następcy.
6. Ukryj tło przed interakcją myszą i klawiaturą; stosuj `inert`, overlay library albo równoważny mechanizm.

## Route Focus i Skip Links

- W SPA po zmianie trasy ustaw fokus na nowym `<h1>`, `<main tabindex="-1">` albo kontenerze widoku.
- Dodaj skip link do głównej treści, gdy widok ma powtarzalną nawigację przed contentem.
- Skip link powinien być pierwszy w DOM, pojawiać się przy fokusie i prowadzić do stabilnego `id`.
- Nie przenoś fokusu przy każdej drobnej zmianie stanu; rób to tylko przy zmianie kontekstu użytkownika.

## Roving Tabindex

Stosuj w złożonych widgetach, gdzie cała grupa ma jeden punkt wejścia Taba, a strzałki przechodzą po elementach.

- Aktywny element ma `tabindex="0"`, pozostałe `tabindex="-1"`.
- Strzałki aktualizują aktywny element i przenoszą fokus.
- `Home` i `End` mogą przechodzić na początek i koniec listy, jeśli wzorzec jest długi.
- Nie stosuj roving tabindex dla zwykłej listy linków albo formularza, gdzie naturalny Tab order jest lepszy.

## Dynamiczne aktualizacje powiązane z fokusem

- Jeśli pojawia się błąd po submit, ustaw fokus na pierwszym błędnym polu albo podsumowaniu błędów.
- Jeśli filtr zmienia listę wyników, ogłoś liczbę wyników przez `role="status"` albo `aria-live="polite"`.
- Jeśli operacja krytyczna kończy się błędem, użyj widocznego komunikatu i live regionu o odpowiedniej pilności.
- Nie przesuwaj fokusu do toastów informacyjnych, jeśli wystarczy live region.

## Manualny walkthrough

- Przejdź całą ścieżkę samą klawiaturą: wejście, wykonanie akcji, obsługa błędu i powrót.
- Sprawdź widoczność fokusu na każdym kroku.
- Zweryfikuj, że nie ma pułapek fokusu poza kontrolowanymi modalami.
- Potwierdź zamykanie warstw przez `Escape` i powrót fokusu.
