# Formularze Wieloetapowe

Wzorce wizardów i formularzy wielokrokowych: walidacja per krok, zachowanie draftu, postęp, nawigacja i final submit. Ładuj, gdy formularz rozciąga się na kilka ekranów, kart albo etapów procesu.

## Kiedy robić multi-step

Multi-step ma sens, gdy pojedynczy formularz jest zbyt długi, wymaga progresywnego ujawniania danych, zależy od decyzji z wcześniejszych kroków albo odpowiada rzeczywistemu procesowi biznesowemu.

Nie dziel formularza tylko dla estetyki, jeśli użytkownik musi stale porównywać pola z różnych kroków. Wtedy lepsze mogą być sekcje na jednej stronie, akordeony albo układ z podsumowaniem.

## Model kroków

Każdy krok powinien mieć:

- nazwę i cel zrozumiały dla użytkownika;
- listę pól należących do kroku;
- schemat walidacji kroku albo fragment schematu globalnego;
- decyzję, czy krok można pominąć;
- warunek wejścia i wyjścia;
- informację, czy dane kroku wpływają na następne kroki.

Ostateczny formularz nadal ma jeden kontrakt końcowy. Walidacja per krok poprawia UX, ale final submit powinien walidować komplet danych.

## Walidacja per krok

- Waliduj tylko pola bieżącego kroku przy przejściu dalej.
- Nie blokuj powrotu do poprzedniego kroku przez błędy w kroku bieżącym, chyba że proces wymaga innego zachowania.
- Jeśli zmiana wcześniejszego kroku unieważnia późniejsze dane, pokaż to jawnie i zresetuj tylko zależne fragmenty.
- Błędy pokazuj na bieżącym kroku oraz w summary, jeśli użytkownik wraca do finalnego przeglądu.
- Kroki warunkowe powinny mieć jasne reguły czyszczenia danych, gdy przestają dotyczyć użytkownika.

## Zachowanie draftu i stanu

Użytkownik nie może tracić danych przy przechodzeniu między krokami. Stan wizardu trzymaj w jednym właścicielu: formularzu nadrzędnym, lokalnym store, hooku/composable albo draft API.

Zasady:

- Nie używaj parametrów URL jako jedynego storage danych formularza.
- Przy długich flow rozważ auto-save draftu, ale pokaż status zapisu i błędy zapisu.
- Przy odświeżeniu strony zdecyduj, czy draft ma się odtworzyć, czy zostać świadomie porzucony.
- Przy danych wrażliwych ogranicz storage lokalny i uwzględnij politykę bezpieczeństwa.
- Reset wizardu powinien czyścić dane, dirty/touched i aktywny krok zgodnie z intencją użytkownika.

## Nawigacja i progress indicator

Progress indicator powinien mówić, gdzie użytkownik jest, ile kroków zostało i które kroki wymagają uwagi.

Wzorce:

- Stepper dla małej, znanej liczby kroków.
- Progress bar dla dłuższego flow bez potrzeby skakania po krokach.
- Sekcja review na końcu dla formularzy wysokiego ryzyka.
- Linki do kroków tylko wtedy, gdy skakanie nie łamie walidacji i zależności danych.

Przy nawigacji klawiaturą focus po przejściu powinien trafić w przewidywalne miejsce: nagłówek kroku, pierwszy błąd albo pierwsze pole, zależnie od wyniku akcji.

## Final submit

Ostatni krok składa pełne dane z wszystkich kroków:

1. Zwaliduj pełny schemat końcowy.
2. Pokaż błędy w kroku, którego dotyczą, i pozwól użytkownikowi szybko do niego wrócić.
3. Przetransformuj dane do jednego payloadu albo sekwencji mutacji zgodnej z API.
4. Chroń double-submit tak samo jak w prostym formularzu.
5. Po sukcesie wyczyść draft albo oznacz go jako zrealizowany.

## Checklista wizardu

```text
- [ ] Każdy krok ma cel, pola i reguły walidacji.
- [ ] Przejście dalej waliduje bieżący krok.
- [ ] Powrót nie gubi danych ani dirty/touched.
- [ ] Zmiany wcześniejszych kroków świadomie unieważniają zależne dane.
- [ ] Progress indicator pokazuje pozycję i błędy wymagające uwagi.
- [ ] Draft ma właściciela, politykę resetu i ewentualną persystencję.
- [ ] Final submit waliduje pełny kontrakt i mapuje błędy do właściwych kroków.
```
