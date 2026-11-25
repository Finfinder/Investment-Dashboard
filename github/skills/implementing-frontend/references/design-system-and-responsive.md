# Design System i Responsywność - Implementing Frontend

Szczegółowe reguły mapowania projektu UI na tokeny, komponenty systemowe i responsywne zachowanie. Wczytaj tę referencję, gdy implementacja dotyka kolorów, spacingu, typografii, breakpointów, layoutu albo wariantów wizualnych.

## Spis treści

- [Design-system-first](#design-system-first)
- [Mapowanie tokenów](#mapowanie-tokenów)
- [Brakujący token](#brakujący-token)
- [Breakpointy i responsywność](#breakpointy-i-responsywność)
- [Stany interakcji](#stany-interakcji)
- [Zakazy hardcoded values](#zakazy-hardcoded-values)

## Design-system-first

Implementację zaczynaj od istniejących prymitywów: komponentów, wariantów, tokenów, utility classes, zmiennych CSS, theme object albo lokalnych mixinów. Nowy CSS lub nowy token jest ostatnim krokiem, nie pierwszym.

Sprawdź:

- katalog komponentów wspólnych i feature components;
- konfigurację Tailwind, theme, CSS variables, SCSS maps albo design tokens;
- lokalne wzorce wariantów (`variant`, `size`, `intent`, `tone`);
- dokumentację systemu projektowego, Storybook albo testy wizualne, jeśli istnieją;
- reguły dla dark mode, density, reduced motion i high contrast.

## Mapowanie tokenów

Dla każdej wartości wizualnej wykonaj mapowanie:

1. Wyodrębnij surową wartość z projektu UI lub opisu, np. `#3B82F6`, `16px`, `0.75rem`, `shadow-lg`.
2. Znajdź dokładny token albo istniejącą klasę odpowiadającą tej wartości.
3. Jeśli dokładny token istnieje, użyj go bez tworzenia nowej wartości.
4. Jeśli nie ma dokładnego dopasowania, znajdź najbliższy istniejący token i nazwij odchylenie w komentarzu zadania, PR albo odpowiedzi.
5. Jeśli wartość jest naprawdę nowa, zapytaj użytkownika lub opisz decyzję jako wymagającą review design systemu.

Kategorie tokenów, które zwykle wymagają sprawdzenia:

- kolory: background, foreground, border, semantic states, chart colors;
- spacing: padding, gap, margin, grid gutters;
- typografia: font size, line height, weight, letter spacing;
- kształt i głębia: radius, shadow, border width;
- motion: duration, easing, transition property;
- warstwy: z-index, overlay, modal, popover.

## Brakujący token

Nie wymyślaj nazwy tokenu ani wartości wizualnej tylko dlatego, że projekt wygląda podobnie. Brakujący token oznacza decyzję systemową.

Bezpieczne opcje:

- użyj najbliższego istniejącego tokenu i wskaż różnicę;
- skonsultuj nowy token z użytkownikiem;
- ogranicz zmianę do komponentu feature, jeśli to jednorazowe odchylenie zaakceptowane w projekcie;
- dodaj nowy token tylko wtedy, gdy repo ma jasny wzorzec i zadanie obejmuje aktualizację design systemu.

## Breakpointy i responsywność

Responsywność to zachowanie, nie tylko media query. Ustal, co dzieje się z układem, kolejnością treści, overflow, hit targetami, gęstością danych i elementami ukrywanymi.

Mapuj breakpointy na istniejące konwencje projektu:

- Tailwind/config theme, CSS custom media, Sass variables albo framework grid;
- nazwy typu `sm`, `md`, `lg`, `xl` zamiast magicznych wartości px;
- container queries, jeśli projekt już ich używa;
- stabilne constraints: `min/max`, `aspect-ratio`, grid tracks, container-relative sizing.

Przy fixed-format UI, np. toolbary, tabele, boardy, kafle, liczniki, wykresy i przyciski ikonowe, ustaw stabilne wymiary albo ograniczenia, aby hover, loading text i dynamiczne dane nie przesuwały layoutu.

## Stany interakcji

Każdy interaktywny komponent powinien mieć komplet stanów zgodny z design systemem:

- default, hover, focus, active, disabled;
- loading, error i empty dla danych asynchronicznych;
- selected/current/expanded/open, jeśli komponent ma stan wyboru albo nawigacji;
- reduced motion, jeśli animacja jest istotna.

Widoczny focus nie jest dekoracją. Jeśli design nie opisuje focus state, zastosuj lokalny wzorzec komponentów systemowych i przekaż brak jako ryzyko do `ensuring-accessibility`.

## Zakazy hardcoded values

Unikaj:

- surowych kolorów hex/rgb/hsl w komponentach, gdy istnieją tokeny;
- magicznych spacingów typu `13px`, jeśli system używa skali;
- inline styles do tematyzacji;
- nowych breakpointów bez związku z konfiguracją projektu;
- custom z-index poza skalą warstw;
- jednostkowych font-size bez sprawdzenia typografii systemu;
- jednorazowych wartości chartów lub canvasów, które łamią resize.

Hardcoded value jest dopuszczalne tylko jako integracja techniczna z zewnętrzną biblioteką albo świadome, opisane odchylenie. Wtedy zamknij je blisko adaptera, a nie rozlewaj po komponentach.
