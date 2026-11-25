# Raportowanie i Severity

Referencja dla klasyfikowania ustaleń w review frontendu oraz formatowania raportu. Czytaj ją przed przygotowaniem finalnych findings albo gdy severity jest sporne.

## Spis Treści

- [Zasada Priorytetu](#zasada-priorytetu)
- [Mapowanie Severity](#mapowanie-severity)
- [Format Ustalenia](#format-ustalenia)
- [Przykłady Ustaleń](#przykłady-ustaleń)
- [Ton i Kolejność Raportu](#ton-i-kolejność-raportu)
- [Checklista](#checklista)

## Zasada Priorytetu

W review frontendu poprawność, dostępność, bezpieczeństwo, rendering i wycieki pamięci mają pierwszeństwo przed stylem. Review powinien pomóc bezpiecznie mergować UI, nie wymuszać preferencji estetycznych bez ryzyka użytkownika.

Severity podnoś, gdy problem:

- blokuje klawiaturę lub czytnik ekranu;
- powoduje błędne dane, utratę stanu, mieszanie wierszy albo stale UI;
- tworzy XSS lub inne ryzyko bezpieczeństwa;
- wycieka zasoby po nawigacji, remount albo długiej sesji;
- dotyka krytycznego flow użytkownika: login, checkout, formularz, modal potwierdzenia, trading/order flow, operacje finansowe.

## Mapowanie Severity

### Critical

Musi zostać naprawione przed merge.

| Kategoria | Przykłady |
| --- | --- |
| Dostępność | Niesemantyczne elementy interaktywne bez klawiatury; modal bez focus management; brak lub błędny focus trap w modalu; krytyczne pole formularza bez etykiety. |
| Rendering | Index-as-key w dynamicznej liście; brak kluczy przy lokalnym stanie; efekt uboczny w renderze; losowy key generowany per render. |
| Pamięć | Timer, listener, WebSocket, request lub subskrypcja bez cleanupu w długowiecznym komponencie. |
| Bezpieczeństwo | `dangerouslySetInnerHTML`, `MarkupString`, `innerHTML` lub surowy HTML z danych użytkownika bez sanityzacji. |
| Poprawność | Pętla renderowania, utrata danych formularza, stale closure powodujący zapis błędnych danych. |

### Warning

Powinno zostać naprawione, chyba że zespół świadomie akceptuje ryzyko.

- Nadmiar propsów, niejasny kontrakt komponentu, brak typów albo zbyt ogólne nazwy.
- Brak loading/error/empty dla komponentu zależnego od danych.
- Wyciszone reguły zależności hooków bez uzasadnienia.
- Hook/composable przeciążony wieloma odpowiedzialnościami.
- Placeholder jako jedyna etykieta, pomijane poziomy nagłówków, stan oparty wyłącznie na kolorze.
- Stan pochodny przechowywany w stanie reaktywnym bez potrzeby.
- Context/provider z niestabilną wartością powodujący re-rendery szerokiego drzewa.
- Ciężka biblioteka lub komponent dodany do initial bundle bez lazy loadingu.

### Suggestion

Warto rozważyć jako usprawnienie, ale nie blokuje merge bez dodatkowego ryzyka.

- Lepsza kompozycja przez `children`/sloty albo compound components.
- Wydzielenie podkomponentu dla czytelności.
- Uporządkowanie zagnieżdżonych ternary i guard clauses.
- Memoizacja referencji, gdy brak dowodu regresji, ale wzorzec może rosnąć.
- Zamiana default export na named export, jeśli repo preferuje named exports.
- Drobna poprawa nazewnictwa bez wpływu na kontrakt publiczny.

## Format Ustalenia

Każde ustalenie powinno zawierać lokalizację, opis problemu, skutek i rekomendowaną poprawkę.

```text
[SEVERITY] path/to/file.tsx#L10-L25
Issue: <co jest nie tak i jaki ma skutek dla użytkownika/systemu>
Fix: <konkretna rekomendacja naprawy>
```

Jeśli używasz odpowiedzi code-review, findings idą jako pierwsze. Nie ukrywaj critical pod długim podsumowaniem.

## Przykłady Ustaleń

```text
[CRITICAL] components/Modal.tsx#L45-L52
Issue: Zamknięcie modala jest renderowane jako <div onClick>, więc nie ma natywnej obsługi klawiatury, roli ani focus styles.
Fix: Zastąp element przez <button type="button" aria-label="Zamknij" onClick={onClose}> i zachowaj focus management modala.
```

```text
[CRITICAL] components/OrderRows.tsx#L33
Issue: Dynamiczna lista zamówień używa indexu jako key. Po sortowaniu lub usunięciu wiersza React może przenieść lokalny stan i fokus na inne zamówienie.
Fix: Użyj stabilnego identyfikatora zamówienia, np. key={order.id}.
```

```text
[WARNING] hooks/useUserData.ts#L18-L24
Issue: Efekt pobierający dane wycisza regułę zależności, co może zostawić stale closure dla userId.
Fix: Uwzględnij userId w zależnościach albo przebuduj hook tak, aby używał stabilnego callbacka i anulowania requestu.
```

```text
[WARNING] components/SearchPanel.tsx#L62-L80
Issue: Komponent zależny od danych nie renderuje stanu błędu ani empty state; przy błędzie API użytkownik widzi pusty panel.
Fix: Dodaj jawne widoki error i empty zgodne z lokalnym wzorcem komponentów danych.
```

```text
[SUGGESTION] components/OrderList.tsx#L120-L145
Issue: Trzypoziomowy ternary utrudnia review statusów renderowania i przyszłe zmiany.
Fix: Zastosuj guard clauses albo wydziel komponenty dla loading/error/ready.
```

## Ton i Kolejność Raportu

- Najpierw findings od najwyższej severity, potem pytania i krótkie podsumowanie.
- Nie zgłaszaj preferencji jako blockerów. Nazwij ryzyko lub obniż severity.
- Unikaj ogólników typu "zły komponent". Wskaż konkretny mechanizm: focus, key, cleanup, stale closure, bundle.
- Jeśli ustalenie zależy od konwencji repo, odwołaj się do istniejącego wzorca w kodzie.
- Jeśli nie ma issues, powiedz to jasno i wskaż ewentualne test gaps albo obszary, których nie dało się zweryfikować.

## Checklista

```text
- [ ] Critical dotyczy realnego blokera: poprawność, a11y, rendering, security albo memory leak.
- [ ] Warning opisuje ryzyko, które warto naprawić lub świadomie zaakceptować.
- [ ] Suggestion nie blokuje merge i nie udaje problemu bezpieczeństwa.
- [ ] Każde ustalenie ma lokalizację, skutek i konkretny fix.
- [ ] Findings są posortowane od najwyższej severity.
- [ ] Raport nie miesza preferencji stylu z ryzykiem użytkownika.
```
