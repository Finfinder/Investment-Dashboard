# Hooki, Composables i Reaktywność

Referencja dla przeglądu reużywalnej logiki UI: hooków Reacta, composables Vue, store selectors, watcherów, lifecycle methods i analogicznych abstrakcji komponentowych. Czytaj ją, gdy PR dotyka zależności efektów, cleanupu, shape zwracanych danych albo reaktywności.

## Spis Treści

- [Zakres](#zakres)
- [Nazewnictwo i Odpowiedzialność](#nazewnictwo-i-odpowiedzialność)
- [Zależności i Przepływ Reaktywności](#zależności-i-przepływ-reaktywności)
- [Cleanup Efektów](#cleanup-efektów)
- [Kształt Zwracanej Wartości](#kształt-zwracanej-wartości)
- [Efekty Uboczne](#efekty-uboczne)
- [Uwagi Frameworkowe](#uwagi-frameworkowe)
- [Checklista](#checklista)

## Zakres

W tej referencji `hook` oznacza każdą reużywalną jednostkę logiki UI, nie tylko React: hooki Reacta, composables Vue, custom stores, watchery, lifecycle helpers, Blazor code-behind i metody cyklu życia komponentu.

Użyj tej referencji razem z `writing-hooks`, gdy problem jest głęboki: API hooka, stabilność referencji, testowanie, zależności efektów lub cykl życia zasobów.

## Nazewnictwo i Odpowiedzialność

Dobra nazwa odpowiada na pytanie: co dostaję po wywołaniu tej abstrakcji?

- React/Vue: zwykle prefiks `use`, np. `useDebounce`, `usePortfolioPositions`.
- Blazor: nazwa code-behind/service powinna opisywać lifecycle lub domenę, np. `OrderGridState`, nie `Helper`.
- Unikaj nazw `useHelper`, `useData`, `useManager`, jeśli nie mówią, jakie dane lub zachowanie są dostarczane.

Hook/composable powinien robić jedną rzecz. Oflaguj abstrakcję, która jednocześnie zarządza formularzem, walidacją, wysyłką, toastami i nawigacją. Jeżeli ma 5+ opcji konfiguracyjnych albo zwraca wiele niepowiązanych pól, zwykle warto rozłożyć ją na mniejsze, składane jednostki.

## Zależności i Przepływ Reaktywności

Zależności muszą odpowiadać wartościom używanym przez efekt, memoizację, watcher albo lifecycle.

Sprawdzaj:

- Czy wszystkie wartości reaktywne są ujęte w tablicy zależności, watcherze lub selectorze?
- Czy istnieje wyciszenie linta dla zależności (`exhaustive-deps`, `rules-of-hooks`, reguły Vue)? Każde wyciszenie to co najmniej `warning` i wymaga uzasadnienia.
- Czy obiekty/tablice w zależnościach są stabilne lub wyniesione poza render?
- Czy closure nie przechowuje starego stanu, który powinien pochodzić z aktualnego callbacka, refa lub reducer action?
- Czy Blazor `OnParametersSet(Async)` obsługuje zmiany parametrów bez nadpisywania stanu użytkownika?

W review nazwij konkretny skutek: stale closure, brak odświeżenia danych, pętla renderowania, zgubiony event albo memory leak.

## Cleanup Efektów

Każdy efekt tworzący zasób poza mechanizmem renderowania musi mieć cleanup. Brak cleanupu dla zasobu długożyjącego to zwykle `critical`, bo prowadzi do wycieków pamięci lub duplikacji zdarzeń.

| Zasób | Cleanup |
| --- | --- |
| `setTimeout` / `setInterval` | `clearTimeout` / `clearInterval`. |
| `addEventListener` | `removeEventListener` tą samą referencją handlera. |
| Fetch/request | `AbortController.abort()` przy odmontowaniu albo zmianie zależności. |
| WebSocket/EventSource | `close()` i odpięcie handlerów. |
| Observable/event bus/store subscription | Funkcja unsubscribe/dispose. |
| `IntersectionObserver` / `ResizeObserver` | `disconnect()` albo `unobserve()`. |
| Object URL | `URL.revokeObjectURL()`. |
| Worker | `terminate()`, jeśli cykl życia jest lokalny dla komponentu. |
| Blazor services/events | `Dispose()` / `DisposeAsync()` i odsubskrybowanie eventów. |

Pytania review:

- Czy cleanup używa tej samej referencji handlera?
- Czy request zależny od propsów anuluje poprzednie żądanie?
- Czy cleanup działa także przy szybkim mount/unmount lub zmianie parametru?
- Czy Strict Mode / podwójny lifecycle w dev nie ujawnia podwójnych subskrypcji?

## Kształt Zwracanej Wartości

Hook/composable powinien zwracać stabilny i czytelny kontrakt.

- Dla prostych 2-wartościowych hooków krotka jest akceptowalna, np. `[value, toggle]`.
- Dla 3+ wartości preferuj obiekt, aby uniknąć niejasności pozycyjnych.
- Callbacki zwracane z hooka powinny być stabilne, jeśli konsumenci używają ich w zależnościach albo memoizowanych dzieciach.
- Nie zwracaj surowych mutable struktur bez opisania właściciela mutacji.
- Nie mieszaj danych domenowych, akcji i elementów UI bez jasnego powodu.

Niestabilny return shape jest zwykle `warning`; jeśli powoduje pętlę efektów u konsumentów, podnieś severity.

## Efekty Uboczne

Render/lifecycle obliczający widok powinien być czysty. Efekty uboczne należą do mechanizmów efektów, handlerów zdarzeń, serwisów albo jawnych operacji async.

Critical red flags:

- `fetch`, zapis do storage, dispatch globalnego eventu albo mutacja store w renderze;
- tworzenie subskrypcji bez cleanupu;
- wywołanie `setState`/`StateHasChanged` w sposób tworzący pętlę;
- zapis surowego HTML lub manipulacja DOM poza bezpiecznym API frameworka bez uzasadnienia;
- synchroniczne blokowanie UI (`.Result`, `.Wait()`, długie pętle) w lifecycle komponentu.

## Uwagi Frameworkowe

- React: po ogólnej kontroli załaduj `./react-patterns.md`, gdy PR dotyka `useEffect`, `useMemo`, `useCallback`, `dangerouslySetInnerHTML`, context providerów albo reguł hooków.
- Blazor: załaduj `./blazor-patterns.md`, gdy PR dotyka lifecycle methods, `@key`, `MarkupString`, `JS interop`, `EventCallback`, `CascadingValue` albo `Dispose`.
- Vue/Svelte/Angular: zastosuj te same zasady reaktywności, cleanupu i czystego renderu przez lokalne API frameworka; jeśli brakuje referencji, oprzyj ustalenia na istniejących wzorcach repo.

## Checklista

```text
- [ ] Nazwa hooka/composable opisuje zachowanie i jest zgodna z konwencją frameworka.
- [ ] Abstrakcja ma jedną odpowiedzialność i nie ukrywa zbyt wielu flow.
- [ ] Zależności efektów/watchers/selectors są kompletne; wyciszenia linta są uzasadnione.
- [ ] Każdy timer, listener, request, subskrypcja, obserwator i worker ma cleanup.
- [ ] Zwracany kontrakt jest czytelny, stabilny i nie wymusza pozycyjnej magii dla 3+ wartości.
- [ ] Render pozostaje czysty; efekty uboczne są w handlerach albo lifecycle/effect API.
- [ ] Załadowano referencję frameworkową, jeśli PR używa React/Blazor API specyficznego dla skilla.
```
