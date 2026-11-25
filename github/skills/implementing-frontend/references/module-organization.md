# Organizacja Modułów - Implementing Frontend

Reguły organizacji publicznego API folderów, barrel files, named exports i grupowania komponentów. Wczytaj tę referencję, gdy zmiana dotyka struktury katalogów, eksportów albo granic feature.

## Spis treści

- [Public API folderu](#public-api-folderu)
- [Barrel files w TypeScript](#barrel-files-w-typescript)
- [Named exports](#named-exports)
- [Kiedy nie tworzyć barrel file](#kiedy-nie-tworzyć-barrel-file)
- [Granice feature](#granice-feature)
- [Blazor feature grouping](#blazor-feature-grouping)

## Public API folderu

Folder eksportowany poza swój moduł powinien mieć świadome public API. Publiczne są tylko komponenty, typy i helpery, które konsumenci mają importować bez znajomości wewnętrznej struktury.

Reguły:

- eksportuj komponenty stabilne i nazwane domenowo;
- trzymaj prywatne podkomponenty blisko komponentu nadrzędnego;
- nie wystawiaj plików `internal`, adapterów, mocków i helperów jednego komponentu;
- unikaj importów z głębokich ścieżek, jeśli repo ma publiczne granice modułów;
- nie przenoś pliku tylko dla estetyki, jeśli złamie lokalne konwencje feature.

## Barrel files w TypeScript

Barrel file `index.ts` twórz tylko na granicy publicznego API folderu konsumowanego przez inne moduły.

Zalecany wzorzec:

```ts
export { Button } from "./Button";
export type { ButtonProps } from "./Button";
```

Reguły:

- używaj named re-exports;
- oddziel eksport typów przez `export type`, jeśli projekt używa TypeScript;
- utrzymuj jeden barrel na publiczny folder komponentowy;
- sprawdź, czy barrel nie re-eksportuje ciężkich komponentów w sposób psujący code splitting;
- aktualizuj testy i importy tylko w zakresie dotkniętego modułu.

## Named exports

Named exports ułatwiają refaktoryzację, tree shaking i spójne importy. Dla komponentów React/TS preferuj:

```ts
export function PriceCard(props: PriceCardProps) {}
```

albo:

```ts
export const PriceCard = memo(function PriceCard(props: PriceCardProps) {});
```

Default export stosuj tylko wtedy, gdy repo lub frameworkowa konwencja tego wymaga, np. niektóre pliki routingu.

## Kiedy nie tworzyć barrel file

Nie twórz `index.ts`, gdy folder jest prywatnym zapleczem jednego komponentu albo gdy barrel tylko ukrywa niejasną strukturę.

Unikaj:

- `export * from "..."` bez selekcji publicznego API;
- barrel files w folderach helperów z jednym konsumentem;
- re-eksportu komponentów lazy loaded, jeśli psuje split point;
- cyklicznych importów przez barrel;
- automatycznego eksportowania każdego nowego pliku.

## Granice feature

Feature powinien grupować komponenty, hooki/composables, typy, adaptery i testy wokół zachowania użytkownika, a nie tylko wokół technologii. Granica feature jest dobra, gdy można zrozumieć publiczne komponenty bez czytania prywatnych adapterów.

Przykładowy układ:

```text
feature-name/
  components/
  hooks/
  model/
  api/
  index.ts
```

Nie narzucaj tego układu, jeśli repo ma inną konsekwentną konwencję. Najpierw dopasuj się do istniejącej struktury.

## Blazor feature grouping

Dla Blazor UI grupuj komponenty per feature lub per obszar UI zgodnie z lokalną konwencją projektu. Przy rosnącej złożoności rozdziel widok i logikę:

```text
Orders/
  OrderList.razor
  OrderList.razor.cs
  OrderListItem.razor
  OrderFilters.razor
```

Reguły Blazor:

- trzymaj `[Parameter]` i `EventCallback<T>` czytelnie w kontrakcie komponentu;
- przenieś logikę biznesową do `.razor.cs`, serwisu DI albo warstwy aplikacyjnej;
- nie nadużywaj `CascadingValue` do lokalnego stanu;
- utrzymuj spójne namespace i nazewnictwo komponentów;
- dla prywatnych fragmentów UI rozważ lokalne komponenty zamiast globalnego public API.
