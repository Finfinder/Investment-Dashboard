# Lifecycle i Reaktywność Hooków

Szczegóły zależności, watcherów, stale closures, czystego renderowania, stabilnych tożsamości i cleanupu. Ładuj tę referencję, gdy implementacja dotyka efektów, cyklu życia, reaktywności albo zasobów wymagających zwolnienia.

## Spis Treści

- [Pełne śledzenie zależności](#pełne-śledzenie-zależności)
- [Stale closures i race conditions](#stale-closures-i-race-conditions)
- [Czysty render](#czysty-render)
- [Stabilne tożsamości](#stabilne-tożsamości)
- [Cleanup właściciela zasobu](#cleanup-właściciela-zasobu)
- [Blazor lifecycle i dispose](#blazor-lifecycle-i-dispose)

## Pełne śledzenie zależności

Każda wartość reaktywna użyta w efekcie, watcherze, memoizacji, selectorze albo lifecycle musi być śledzona przez mechanizm frameworka:

- React: kompletna tablica zależności dla `useEffect`, `useMemo`, `useCallback` i podobnych API.
- Vue: jawne źródła w `watch`, świadome użycie `watchEffect`, `computed` dla wartości pochodnych.
- Blazor: właściwa metoda lifecycle (`OnInitialized[Async]`, `OnParametersSet[Async]`, `OnAfterRender[Async]`) dobrana do tego, czy logika zależy od parametrów.

Nie wyciszaj reguł `exhaustive-deps`, `rules-of-hooks` ani analogicznych reguł bez lokalnego uzasadnienia i testu pokrywającego ryzyko.

## Stale closures i race conditions

Stale closure powstaje, gdy efekt lub callback widzi starą wartość, bo zależność nie została ujęta albo callback został ustabilizowany z niepełnym zestawem zależności. Race condition powstaje, gdy starsza operacja asynchroniczna kończy się po nowszej i nadpisuje aktualny stan.

Naprawiaj przyczynę:

- uzupełnij zależności i przebuduj kod, jeśli tworzą pętlę;
- użyj funkcyjnej aktualizacji stanu, gdy nowa wartość zależy od poprzedniej;
- dla async zależnego od parametrów stosuj anulowanie lub ignorowanie wyniku starszej operacji;
- nie traktuj `useRef` jako sposobu na ukrycie brakujących zależności, jeśli wartość wpływa na UI.

## Czysty render

Render, funkcje computed i ciało composable powinny być czyste: bez requestów, zapisów do storage, subskrypcji, dispatchy, timerów i mutacji globalnego stanu. Efekty uboczne należą do lifecycle/effect API albo handlerów zdarzeń.

Dopuszczalne w renderze są deterministyczne obliczenia z aktualnych wejść. Kosztowne obliczenia memoizuj dopiero wtedy, gdy ich koszt lub wpływ na referencje jest realny.

## Stabilne tożsamości

Obiekty, tablice i funkcje tworzone inline zmieniają referencję przy każdym renderze. To ma znaczenie, gdy trafiają do:

- tablic zależności efektów;
- provider values lub context values;
- memoizowanych dzieci;
- watcherów porównujących referencje;
- dużych list lub kosztownych komponentów.

Wynoś stałe do zakresu modułu, memoizuj wartości pochodne albo upraszczaj API. Nie stabilizuj każdej wartości tylko dlatego, że istnieje `useMemo` lub odpowiednik frameworka.

## Cleanup właściciela zasobu

Kod, który tworzy zasób, odpowiada za jego zwolnienie. Cleanup musi wykonać się przy unmount/dispose oraz przy zmianie zależności, jeśli stary zasób przestaje być aktualny.

Zasoby wymagające cleanupu:

- timery i interwały;
- listenery DOM, event bus, media query listeners;
- subskrypcje store, obserwatory, WebSockety, workery;
- requesty i długie operacje asynchroniczne przez `AbortController`, `CancellationTokenSource` albo równoważny mechanizm;
- focus traps, roving tabindex registries i live region subscriptions.

## Blazor lifecycle i dispose

W Blazor odpowiednikiem hookowej dyscypliny lifecycle jest dobór metody cyklu życia oraz `IDisposable`/`IAsyncDisposable`.

- `OnInitialized[Async]` służy do inicjalizacji niezależnej od późniejszych zmian parametrów.
- `OnParametersSet[Async]` służy do pracy zależnej od parametrów.
- `OnAfterRender[Async]` stosuj tylko dla integracji wymagających wyrenderowanego DOM lub JS interop.
- Zmiany przychodzące spoza kontekstu UI odświeżaj przez `InvokeAsync(StateHasChanged)`.
- Subskrypcje, listenery i anulowalne operacje zamykaj w `Dispose` albo `DisposeAsync`.
