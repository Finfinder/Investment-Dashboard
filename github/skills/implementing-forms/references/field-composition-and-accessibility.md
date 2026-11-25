# Kompozycja Pól i Dostępność

Szczegóły budowania field wrapperów, etykiet, tekstu pomocniczego, błędów, pól plikowych oraz podstaw keyboard/focus. Ta referencja nie zastępuje pełnego audytu `ensuring-accessibility`.

## Field wrapper

Field wrapper łączy bibliotekę formularzy z komponentem UI i utrzymuje spójny kontrakt dla każdego pola.

Powinien renderować:

- widoczną etykietę powiązaną z kontrolką;
- kontrolkę formularza lub slot/children z kontrolką design systemu;
- opcjonalny help text przed błędem lub obok pola zgodnie z lokalnym wzorcem;
- tekstowy error message powiązany z polem;
- stan required, disabled, readonly, dirty, touched i invalid;
- stabilne `id` dla inputa, help text i error text.

Wrapper nie powinien zakładać jednego typu kontrolki. Ten sam wzorzec ma działać dla text, select, checkbox, radio, textarea, date, number i custom controls.

## Label, help text i error text

- Label jest widoczny. Placeholder może doprecyzować format, ale nie zastępuje etykiety.
- Help text wyjaśnia wymagania przed błędem, np. format, limit, konsekwencję wyboru.
- Error text mówi, co poprawić, nie tylko że pole jest niepoprawne.
- Stan błędu nie może opierać się wyłącznie na kolorze lub ikonie.
- Summary błędów może pomóc po submit, ale nie zastępuje błędów inline przy polach.

## Atrybuty dostępności

Stosuj semantyczny HTML i lokalne komponenty formularzy. Gdy budujesz wrapper ręcznie, zadbaj o:

| Potrzeba | Wzorzec |
| --- | --- |
| Powiązanie labela | `label for` + `input id` albo poprawne zagnieżdżenie |
| Powiązanie opisu i błędu | `aria-describedby` wskazuje help/error elementy |
| Oznaczenie błędu | `aria-invalid="true"` tylko gdy pole ma aktywny błąd |
| Pole wymagane | Widoczny marker i semantyczne oznaczenie wymagania |
| Ogłoszenie błędu | `role="alert"` albo live region zgodnie z lokalnym wzorcem |

Nie dodawaj ARIA jako dekoracji. Jeśli natywny element lub komponent design systemu już zapewnia semantykę, nie dubluj jej sprzecznymi atrybutami.

## Pola plikowe

File upload wymaga osobnego kontraktu UI i walidacji:

- pokaż wybrane pliki, rozmiar, typ i akcję usunięcia;
- waliduj typ, rozmiar, liczbę plików i wymaganie pola przed uploadem;
- nie wysyłaj pliku, który schemat już odrzucił;
- obsłuż anulowanie wyboru i ponowny wybór tego samego pliku;
- zadbaj o dostępny przycisk/label wyzwalający natywny picker;
- dla uploadu asynchronicznego pokaż progress, błąd i możliwość retry/removal.

Nie ukrywaj natywnego inputa w sposób usuwający go z dostępności. Jeśli stylujesz własny trigger, powiąż go z realnym inputem i zachowaj obsługę klawiatury.

## Keyboard i focus

- Formularz powinien wysyłać się klawiszem Enter zgodnie z natywnym zachowaniem.
- Tab order ma odpowiadać strukturze wizualnej i logicznej.
- Po nieudanym submit fokus przechodzi na pierwsze pole z błędem lub summary prowadzące do błędów.
- Custom controls muszą obsługiwać oczekiwane klawisze dla swojej roli.
- Dynamicznie dodane pola nie powinny gubić fokusu ani resetować danych użytkownika bez intencji.

Przy złożonym focus management, dialogach, keyboard traps lub screen reader validation załaduj `ensuring-accessibility`.

## Checklista pola

```text
- [ ] Pole ma widoczny label i stabilne ID.
- [ ] Help text i error text są tekstowe i powiązane z polem.
- [ ] Dirty/touched/error state jest odzwierciedlony w UI.
- [ ] Required/disabled/readonly są widoczne i semantyczne.
- [ ] File upload ma walidację typu/rozmiaru/liczby oraz dostępny trigger.
- [ ] Keyboard submit, Tab order i fokus po błędzie działają przewidywalnie.
```
