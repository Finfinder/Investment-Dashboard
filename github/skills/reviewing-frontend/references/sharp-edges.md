# Sharp Edges - Przegląd Frontendu

Typowe pułapki frontendowe, które często wyglądają jak drobiazgi w diffie, ale prowadzą do regresji dostępności, renderowania, bezpieczeństwa albo pamięci. Używaj tej referencji, gdy aktywny `SKILL.md` wskazuje blocker lub gdy potrzebujesz uzasadnienia severity.

## Spis Treści

- [SE-01: Niesemantyczna Interakcja](#se-01-niesemantyczna-interakcja)
- [SE-02: Modal Bez Focus Management](#se-02-modal-bez-focus-management)
- [SE-03: Index jako Key w Dynamicznej Liście](#se-03-index-jako-key-w-dynamicznej-liście)
- [SE-04: Efekt Bez Cleanupu](#se-04-efekt-bez-cleanupu)
- [SE-05: Efekt Uboczny w Renderze](#se-05-efekt-uboczny-w-renderze)
- [SE-06: Surowy HTML Bez Sanityzacji](#se-06-surowy-html-bez-sanityzacji)
- [SE-07: Placeholder jako Jedyna Etykieta](#se-07-placeholder-jako-jedyna-etykieta)
- [SE-08: Wyciszone Zależności i Stale Closure](#se-08-wyciszone-zależności-i-stale-closure)
- [SE-09: Niestabilna Wartość Providera](#se-09-niestabilna-wartość-providera)
- [SE-10: Stan Pochodny jako Źródło Prawdy](#se-10-stan-pochodny-jako-źródło-prawdy)

---

### SE-01: Niesemantyczna Interakcja

**Severity:** CRITICAL | **Stack:** HTML/React/Vue/Blazor

**Sytuacja:** Element `div` albo `span` obsługuje kliknięcie i wygląda jak przycisk lub link.

**Dlaczego to boli:** Użytkownik klawiatury może nie dotrzeć do akcji. Czytnik ekranu nie dostaje poprawnej roli i nazwy. Fokus może być niewidoczny albo całkowicie niedostępny.

**Rozwiązanie:** Użyj natywnego `<button>` dla akcji i `<a href>` dla nawigacji. Jeżeli nienatywny element jest absolutnie wymagany, dodaj rolę, `tabIndex="0"`, obsługę `Enter`/`Space`, dostępną nazwę i focus styles, ale traktuj to jako fallback.

**Symptomy:** Akcja działa myszą, ale nie klawiaturą; brak focus outline; `role="button"` bez `onKeyDown`; test axe zgłasza interactive element problems.

**Regex detekcji:** `<(div|span)[^>]+onClick|role=["']button["']`

---

### SE-02: Modal Bez Focus Management

**Severity:** CRITICAL | **Stack:** UI Components

**Sytuacja:** Dialog/modal otwiera się wizualnie, ale fokus zostaje na tle albo po zamknięciu nie wraca do elementu wyzwalającego.

**Dlaczego to boli:** Użytkownik klawiatury może poruszać się po tle, zgubić kontekst lub nie wiedzieć, gdzie jest dialog. To psuje krytyczne przepływy potwierdzeń, formularzy i nawigacji.

**Rozwiązanie:** Po otwarciu przenieś fokus do dialogu lub pierwszego sensownego elementu. Zatrzymaj fokus w dialogu, obsłuż `Escape` zgodnie z wymaganiami i po zamknięciu oddaj fokus triggerowi.

**Symptomy:** Tab przechodzi za overlay; screen reader nie ogłasza dialogu; po zamknięciu fokus wraca na początek strony; brak `aria-modal`/roli dialog w custom implementacji.

**Regex detekcji:** `Dialog|Modal|role=["']dialog["']|aria-modal`

---

### SE-03: Index jako Key w Dynamicznej Liście

**Severity:** CRITICAL | **Stack:** React/Blazor/Vue Lists

**Sytuacja:** Lista renderuje elementy z `key={index}`, `@key="index"` albo analogicznym kluczem pozycyjnym, a elementy mogą się zmieniać.

**Dlaczego to boli:** Framework traktuje pozycję jako tożsamość. Przy sortowaniu, filtrowaniu, usunięciu albo insercie lokalny stan i fokus mogą przejść do innego rekordu.

**Rozwiązanie:** Użyj stabilnego ID rekordu. Jeżeli danych nie mają ID, wygeneruj je przy utworzeniu danych, nie przy renderze.

**Symptomy:** Po usunięciu wiersza input zachowuje wartość z poprzedniego rekordu; focus przeskakuje; animacja dotyczy złego elementu; błędy reprodukują się tylko po reorder/delete.

**Regex detekcji:** `key=\{?index\}?|@key\s*=\s*["']?index|:key=["']index["']`

---

### SE-04: Efekt Bez Cleanupu

**Severity:** CRITICAL | **Stack:** React/Vue/Blazor/Browser Runtime

**Sytuacja:** Komponent zakłada timer, listener, subskrypcję, request, observer, WebSocket lub worker bez cleanupu.

**Dlaczego to boli:** Zasób działa po odmontowaniu komponentu. Długie sesje SPA zbierają listenery, requesty i timery, co powoduje memory leak, zdublowane eventy i błędne aktualizacje stanu.

**Rozwiązanie:** Zwróć cleanup z efektu, wywołaj unsubscribe/dispose albo zamknij zasób w lifecycle cleanup. Requesty anuluj przez `AbortController` lub lokalny odpowiednik.

**Symptomy:** Event wywołuje się wielokrotnie po każdej nawigacji; heap rośnie po powrocie na stronę; warning o update na odmontowanym komponencie; WebSocket zostaje otwarty.

**Regex detekcji:** `addEventListener|setInterval|setTimeout|WebSocket|EventSource|subscribe\(|ResizeObserver|IntersectionObserver`

---

### SE-05: Efekt Uboczny w Renderze

**Severity:** CRITICAL | **Stack:** UI Rendering

**Sytuacja:** Render, computed view albo body komponentu wykonuje request, zapisuje do storage, mutuje store, dispatchuje event albo rejestruje subskrypcję.

**Dlaczego to boli:** Render może wykonać się wiele razy, zostać przerwany lub powtórzony. Efekty uboczne w renderze tworzą pętle, podwójne requesty, niespójne dane i błędy SSR/hydration.

**Rozwiązanie:** Przenieś efekt do handlera zdarzenia, `useEffect`/watcher/lifecycle method albo warstwy danych. Render ma być funkcją danych wejściowych.

**Symptomy:** Podwójne requesty w dev, pętla renderowania, zapis do storage przy każdym renderze, event emitowany bez interakcji użytkownika.

**Regex detekcji:** `fetch\(|localStorage\.|sessionStorage\.|dispatch\(|emit\(|StateHasChanged\(`

---

### SE-06: Surowy HTML Bez Sanityzacji

**Severity:** CRITICAL | **Stack:** Security / UI

**Sytuacja:** UI renderuje surowy HTML przez `dangerouslySetInnerHTML`, `innerHTML`, `MarkupString`, `v-html` albo podobne API bez sanityzacji.

**Dlaczego to boli:** Dane użytkownika lub treść z CMS/API mogą wprowadzić XSS. To problem bezpieczeństwa, nawet jeśli obecny przykład danych wygląda zaufanie.

**Rozwiązanie:** Preferuj renderowanie danych strukturalnych. Jeśli surowy HTML jest wymagany, sanityzuj go sprawdzoną biblioteką i ogranicz źródła danych. Oznacz miejsce do security review.

**Symptomy:** HTML pochodzi z API/CMS/user input; brak DOMPurify/sanitize-html lub odpowiednika; brak testu payloadu; reviewer mówi "to trusted teraz".

**Regex detekcji:** `dangerouslySetInnerHTML|innerHTML|MarkupString|v-html|AddMarkupContent`

---

### SE-07: Placeholder jako Jedyna Etykieta

**Severity:** WARNING | **Stack:** Forms / Accessibility

**Sytuacja:** Pole formularza ma tylko placeholder, bez widocznej etykiety ani poprawnie powiązanej nazwy.

**Dlaczego to boli:** Placeholder znika po wpisaniu wartości, ma słabszy kontrast w wielu designach i nie zastępuje etykiety dla technologii asystujących.

**Rozwiązanie:** Dodaj widoczną etykietę powiązaną przez `for`/`id` lub lokalny komponent formularza. Dla przycisków ikonowych użyj dostępnej nazwy.

**Symptomy:** Użytkownik po wpisaniu tekstu nie widzi znaczenia pola; screen reader ogłasza niejasną nazwę; błąd formularza nie wskazuje pola.

**Regex detekcji:** `<input[^>]+placeholder=|<textarea[^>]+placeholder=`

---

### SE-08: Wyciszone Zależności i Stale Closure

**Severity:** WARNING | **Stack:** React/Vue/Reactive Frameworks

**Sytuacja:** Kod wyłącza regułę linta zależności efektów albo celowo pomija zależność bez komentarza i testu.

**Dlaczego to boli:** Efekt może używać starego `id`, callbacka, filtra albo tokenu. Błąd często pojawia się dopiero przy zmianie propsów, szybkim przełączaniu widoków lub ponownym zalogowaniu.

**Rozwiązanie:** Uwzględnij zależności, użyj stabilnego callbacka/refa albo przebuduj przepływ danych tak, aby efekt miał jedno jasne źródło prawdy. Jeżeli wyciszenie jest konieczne, dodaj lokalne uzasadnienie.

**Symptomy:** Dane nie odświeżają się po zmianie parametru; request idzie ze starym filtrem; listener używa starego callbacka.

**Regex detekcji:** `exhaustive-deps|eslint-disable.*hooks|deps|watch\(`

---

### SE-09: Niestabilna Wartość Providera

**Severity:** WARNING | **Stack:** React/Context/State Providers

**Sytuacja:** Provider przekazuje nowy obiekt lub funkcję przy każdym renderze, np. `value={{ user, setUser }}`.

**Dlaczego to boli:** Wszyscy konsumenci contextu renderują się ponownie nawet wtedy, gdy realna wartość się nie zmieniła. W dużych drzewach to ukryta regresja wydajności.

**Rozwiązanie:** Zmemoizuj value, rozdziel contexty według częstotliwości zmian albo przenieś stan bliżej konsumentów. Najpierw sprawdź, czy provider realnie obejmuje szerokie drzewo.

**Symptomy:** Mała zmiana w rodzicu renderuje wiele konsumentów; profiler pokazuje szeroki fan-out; memo dzieci nie pomaga.

**Regex detekcji:** `<.*Provider[^>]+value=\{\{`

---

### SE-10: Stan Pochodny jako Źródło Prawdy

**Severity:** WARNING | **Stack:** UI State

**Sytuacja:** Komponent trzyma w stanie wartość, którą można wyliczyć z propsów lub danych cache, np. `filteredItems`, `total`, `isValid`, a potem synchronizuje ją efektem.

**Dlaczego to boli:** Dwa źródła prawdy rozjeżdżają się przy zmianach asynchronicznych, anulowanych requestach albo szybkim input. Efekt tworzy dodatkowy render i może utrwalić stale data.

**Rozwiązanie:** Wylicz wartość podczas renderu albo memoizuj kosztowne obliczenie z pełnymi zależnościami. Lokalny draft trzymaj osobno tylko wtedy, gdy użytkownik rzeczywiście edytuje niezależną kopię.

**Symptomy:** UI pokazuje starą sumę, filtr nie zgadza się z listą, efekt aktualizuje state po każdej zmianie propsów, test wymaga wielu `waitFor`.

**Regex detekcji:** `set[A-Z].*useEffect|OnParametersSet|filtered|derived|total|isValid`
