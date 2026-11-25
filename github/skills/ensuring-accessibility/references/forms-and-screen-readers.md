# Formularze i Czytniki Ekranu

Szczegóły etykiet, opisów, błędów, `aria-describedby`, live regions, screen reader smoke checks i formularzy wieloetapowych. Używaj tej referencji przy budowie lub audycie formularzy, walidacji, komunikatów statusu i krytycznych flow dla czytników ekranu.

## Etykiety i opisy pól

- Każde pole formularza ma widoczną etykietę; placeholder nie zastępuje etykiety.
- Preferuj `<label for="field-id">` + `id` pola albo natywny mechanizm biblioteki, który renderuje takie powiązanie.
- Tekst pomocy i błędu łącz z polem przez `aria-describedby`.
- Jeśli pole ma wiele opisów, `aria-describedby` może wskazywać kilka `id` rozdzielonych spacją.
- Wymagane pola oznacz wizualnie i tekstowo; `required` albo `aria-required` musi odpowiadać faktycznej walidacji.

## Błędy formularza

- Pole z błędem oznacz `aria-invalid="true"`.
- Komunikat błędu musi być widoczny, konkretny i powiązany z polem.
- Podsumowanie błędów na górze formularza pomaga w długich formularzach; linki w podsumowaniu powinny przenosić fokus do pól.
- Po nieudanym submit ustaw fokus na podsumowaniu błędów albo pierwszym błędnym polu.
- Nie komunikuj błędu wyłącznie kolorem, ikoną bez nazwy albo toastem znikającym automatycznie.

## Live Regions

| Mechanizm | Kiedy używać | Uwagi |
| --- | --- | --- |
| `role="status"` | Niepilne statusy, loading, liczba wyników | Domyślnie polite |
| `aria-live="polite"` | Zmiany ważne, ale nieblokujące | Nie przerywa zwykle czytania |
| `role="alert"` | Błędy i pilne komunikaty | Domyślnie assertive |
| `aria-live="assertive"` | Krytyczne zmiany wymagające natychmiastowej uwagi | Używaj oszczędnie |

Live region musi istnieć w DOM przed aktualizacją tekstu, jeśli chcesz niezawodnego ogłoszenia.

## Screen Reader Smoke Checks

Dla krytycznych flow wykonaj krótki smoke test z NVDA/JAWS/VoiceOver albo dostępnym czytnikiem ekranu:

1. Przejdź do widoku i sprawdź, czy tytuł strony, landmarki i nagłówki tworzą sensowną mapę.
2. Przejdź po kontrolkach formularza i potwierdź nazwę, rolę, stan oraz opis.
3. Wywołaj walidację i sprawdź, czy błąd jest ogłoszony oraz powiązany z polem.
4. Wykonaj happy path i potwierdź, że status sukcesu albo następny krok jest ogłoszony.
5. Wróć lub zamknij flow i sprawdź, czy fokus trafia w logiczne miejsce.

Nie zastępuj smoke testu samym axe-core; automaty potrafią wykryć brak etykiety, ale nie potwierdzą sensu komunikatu ani kolejności narracji.

## Formularze wieloetapowe

- Każdy krok ma czytelny tytuł i informację o postępie, np. "Krok 2 z 4".
- Zmiana kroku powinna przenieść fokus na nagłówek kroku albo pierwszy błąd.
- Błędy walidacji blokujące przejście muszą być widoczne i ogłoszone.
- Przyciski "Dalej", "Wstecz" i "Zapisz" powinny mieć stabilne nazwy i zachowanie klawiatury.
- Zachowaj dane użytkownika przy powrocie do poprzedniego kroku, jeśli proces na to pozwala.

## Dynamiczne statusy i toasty

- Toast informacyjny powinien mieć live region, ale nie powinien przejmować fokusu bez powodu.
- Toast z akcją musi być osiągalny klawiaturą albo mieć równoważną akcję w głównym UI.
- Komunikat znikający automatycznie nie może być jedynym nośnikiem krytycznej informacji.
- Status ładowania powinien być zrozumiały jako tekst, nie tylko spinner.

## Minimalny raport z testu czytnika

```text
Screen reader smoke:
- Flow: rejestracja użytkownika
- Czytnik/przeglądarka: NVDA + Firefox
- Sprawdzone: landmarki, nazwy kontrolek, błędy, live regiony, fokus powrotny
- Wynik: PASS / FAIL
- Findings: brak krytycznych ustaleń albo lista selektorów/komponentów do poprawy
```
