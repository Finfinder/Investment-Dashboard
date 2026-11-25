# Kontrast i Stany Wizualne

Szczegóły kontrastu WCAG 2.1 AA, wskaźników fokusu, komunikacji stanów, zoom/reflow, reduced motion, RTL i regresji wizualnych. Używaj tej referencji, gdy zadanie dotyczy kolorów, tokenów design systemu, motywów albo stanów UI.

## Progi kontrastu

| Element | Minimalny kontrast | Przykłady |
| --- | --- | --- |
| Zwykły tekst | 4.5:1 | body text, etykiety, małe linki, podpisy |
| Duży tekst | 3:1 | tekst co najmniej 24px albo 19px bold |
| UI indicators | 3:1 | focus ring, obramowania inputów, suwaki, ikony statusu |
| Nietekstowe informacje | 3:1 | segmenty wykresów, ikony, badge, aktywny stan |

Stany disabled są wyjątkiem WCAG dla kontrastu, ale nadal powinny być rozróżnialne i nie mogą ukrywać ważnej informacji.

## Focus Indicators

- Nie usuwaj `outline` bez widocznego zamiennika.
- Własny focus indicator powinien mieć kontrast minimum 3:1 względem sąsiednich kolorów.
- Fokus musi być widoczny w jasnym i ciemnym motywie.
- Wskaźnik fokusu nie może być zasłonięty przez overflow, sticky header, transformacje albo clipping.
- Zachowaj spójność focus state dla przycisków, linków, pól, zakładek, kart i custom widgets.

## Kolor nie jako jedyny kanał

- Błędy formularzy wymagają tekstu i powiązania z polem, nie tylko czerwonej ramki.
- Statusy wymagają etykiety albo tekstu alternatywnego, nie tylko kolorowej kropki.
- Wykresy wymagają legend, tekstu, patternów lub tooltipów dostępnych klawiaturą.
- Aktywna pozycja w nawigacji powinna mieć `aria-current`, tekst lub kształt, nie tylko kolor.
- Trendy pozytywny/negatywny powinny mieć znak, etykietę albo ikonę z nazwą dostępną.

## Stany komponentów

Dla elementów interaktywnych sprawdź: default, hover, focus, active, pressed/selected, disabled, loading, error i success.

- `disabled` usuwa element z kolejności fokusu; jeśli potrzebujesz wyjaśnienia niedostępności, rozważ aktywny element z `aria-disabled="true"` i obsługą blokady akcji.
- `aria-busy="true"` może wspierać regiony, które aktualizują dane.
- Loading nie może usuwać nazwy przycisku; preferuj tekst typu "Zapisywanie" albo zachowaj accessible name.
- Stan selected/current powinien być dostępny semantycznie (`aria-selected`, `aria-current`) tam, gdzie wzorzec tego wymaga.

## Zoom, reflow i responsywność

- Przy 200% zoom treść powinna pozostać czytelna bez utraty funkcjonalności.
- Przy 400% zoom lub szerokości 320px treść powinna się przełożyć bez poziomego przewijania poza wyjątkami typu tabela danych.
- Tekst nie powinien być obcinany przez stałe wysokości, `overflow: hidden` albo zbyt ciasne grid tracks.
- Cele dotykowe 44x44 CSS px są dobrą praktyką dla ergonomii, choć WCAG 2.1 AA nie wymaga ich dla każdego przypadku.
- Ukrywanie treści na mobile nie może usuwać jedynej drogi wykonania zadania.

## Reduced Motion

- Szanuj `prefers-reduced-motion` dla animacji, parallax, auto-scroll i przejść.
- Nie używaj animacji jako jedynego sygnału zmiany stanu.
- Dla animacji niezbędnych do zrozumienia UI zapewnij równoważny tekstowy lub statyczny sygnał.
- Unikaj migania i szybkich zmian mogących naruszać bezpieczeństwo użytkowników wrażliwych na światło.

## RTL i tekst dwukierunkowy

| Zasada | Opis |
| --- | --- |
| Logiczne właściwości CSS | `margin-inline-start` zamiast `margin-left`, `padding-inline-end` zamiast `padding-right` |
| Kierunek z DOM | Ustaw `dir="rtl"` albo `dir="auto"` tam, gdzie potrzebne; nie odwracaj całego layoutu ręcznie |
| Ikony kierunkowe | Strzałki i progress mogą wymagać odbicia w RTL |
| Test danych mieszanych | Sprawdź numery, tickery, waluty i tekst LTR wewnątrz RTL |

## Visual Regression Checks

- Porównaj jasny i ciemny motyw, jeśli istnieją.
- Sprawdź hover/focus/active w screenshotach lub storybooku.
- Zweryfikuj overflow, obcinanie tekstu i overlap przy długich etykietach.
- Dla zmian tokenów uruchom najwęższą lokalną walidację UI albo screenshot diff, jeśli repo ją ma.
