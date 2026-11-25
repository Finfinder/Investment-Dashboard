# Jakość Danych i Interwały

Referencja dla pobierania, normalizacji i walidacji danych OHLCV oraz wyrównywania wielu interwałów. Ładuj ją, gdy zadanie dotyczy źródeł danych, warmupu, missing candles, adjusted/raw prices albo multi-timeframe.

## Spis Treści

- [Źródła Danych](#źródła-danych)
- [Kontrakt OHLCV](#kontrakt-ohlcv)
- [Adjusted vs Raw](#adjusted-vs-raw)
- [Warmup i Minimalna Historia](#warmup-i-minimalna-historia)
- [Missing Data i Kalendarze](#missing-data-i-kalendarze)
- [Crypto i Forex](#crypto-i-forex)
- [Multi-Timeframe Alignment](#multi-timeframe-alignment)
- [Checklista](#checklista)

## Źródła Danych

| Źródło | Zakres | Uwaga |
| --- | --- | --- |
| `yfinance` | Akcje, ETF, indeksy | Szybki research; waliduj splity, dywidendy, luki i opóźnienia. |
| Polygon.io | Akcje, opcje, forex, crypto | Lepsza granularność; sprawdź limity planu i corporate actions. |
| Alpaca Data | US equities, paper/live ecosystem | Przydatne przy prototypach, ale strategię przekazuj do trading skill. |
| CCXT | Crypto na wielu giełdach | Ujednolica API, ale symbole, wolumen i fee różnią się per giełda. |
| OANDA / brokerzy FX | Forex/CFD | Spread, rollover i sesje zależą od konta i brokera. |
| Dane instytucjonalne | Multi-asset, tick, depth | Wymagają licencji i kontroli praw do użycia. |

Źródło danych jest częścią wyniku analizy. Raport powinien zapisać vendor, zakres dat, interwał, timezone, price mode i moment pobrania.

## Kontrakt OHLCV

Minimalna walidacja przed wskaźnikami:

- kolumny `open`, `high`, `low`, `close`, `volume` istnieją i są numeryczne;
- timestamp jest monotoniczny, timezone-aware i bez duplikatów;
- `high >= open`, `high >= close`, `low <= open`, `low <= close`, `high >= low`;
- ceny nie są zerowe ani ujemne, chyba że instrument i vendor mają jawny wyjątkowy format;
- wolumen jest nieujemny, a zero volume jest oznaczone jako realny brak obrotu albo błąd danych;
- brakujące świece są rozróżnione od weekendów, świąt i przerw sesyjnych.

```python
def validate_ohlcv(frame):
    required = {"open", "high", "low", "close", "volume"}
    missing = required.difference(frame.columns)
    if missing:
        raise ValueError(f"Brak kolumn OHLCV: {sorted(missing)}")

    invalid_range = (
        (frame["high"] < frame[["open", "close"]].max(axis=1))
        | (frame["low"] > frame[["open", "close"]].min(axis=1))
        | (frame["high"] < frame["low"])
    )
    if invalid_range.any():
        raise ValueError("Niespójne relacje high/low/open/close")
```

## Adjusted vs Raw

Wybierz jeden tryb ceny przed obliczeniami:

| Tryb | Użyj gdy | Ryzyko |
| --- | --- | --- |
| Raw OHLC | Wizualizacja rzeczywistych historycznych cen i poziomów z wykresu. | Splity tworzą sztuczne luki i fałszywe sygnały. |
| Adjusted Close | Analiza stóp zwrotu po splitach/dywidendach. | Nie pasuje bezpośrednio do raw `high/low` i markerów na wykresie. |
| Fully adjusted OHLC | Wskaźniki i formacje mają być porównywalne po corporate actions. | Wykres nie pokazuje nominalnych historycznych cen. |

Najczęstszy błąd to liczenie sygnału na `Adj Close`, a rysowanie markerów i S/R na raw OHLC. Jeśli raport pokazuje oba tryby, oznacz je jawnie i nie mieszaj poziomów.

## Warmup i Minimalna Historia

Warmup nie jest opcjonalny: pierwsze wartości wskaźnika są mniej stabilne albo `NaN`.

| Wskaźnik | Lookback | Minimalna historia praktyczna |
| --- | ---: | ---: |
| RSI(14) | 14 | 40-60 świec |
| ATR(14) | 14 | 40-60 świec |
| Bollinger(20) | 20 | 60+ świec |
| MACD(12,26,9) | 26 + signal | 80+ świec |
| SMA(50) | 50 | 150+ świec |
| SMA(200) | 200 | 250-600 świec zależnie od celu |

Przy niedostatecznej historii degraduj gracefully: krótszy wskaźnik, analiza price action + volume, ograniczenie zakresu raportu albo prośba o dłuższy dataset. Nie maskuj warmupu przez forward/back fill z przyszłości.

## Missing Data i Kalendarze

- Dla akcji weekendy i święta są oczekiwanymi przerwami, ale brak świecy w środku sesji intraday jest problemem.
- Dane dzienne muszą znać giełdowy kalendarz sesji; `UTC day` nie zawsze odpowiada dniowi sesyjnemu.
- Dla intraday sprawdź early close, daylight saving time i przerwy sesyjne.
- Przy resamplingu zapisuj regułę agregacji: open pierwszej świecy, high max, low min, close ostatniej, volume suma.
- Nie wypełniaj brakujących świec sztuczną ceną, jeśli sygnał zależy od zmienności, wolumenu lub formacji.

## Crypto i Forex

Crypto zwykle działa 24/7, ale giełdy mają maintenance, różne pary, różny wolumen i możliwe luki API. Dla danych z CCXT zapisz giełdę, symbol, quote currency i czy wolumen jest base czy quote volume.

Forex ma handel 24/5, weekendowe przerwy, rollover, zmienny spread i różne godziny otwarcia brokerów. Dla świec daily określ, czy dzień zamyka się według New York close, UTC czy czasu brokera.

## Multi-Timeframe Alignment

Wyższy interwał jest filtrem kontekstu, nie źródłem przyszłości.

```python
higher["trend_signal"] = higher["trend_signal"].shift(1)
aligned = pd.merge_asof(
    lower.sort_values("datetime"),
    higher[["datetime", "trend_signal"]].sort_values("datetime"),
    on="datetime",
    direction="backward",
)
```

Zasady:

- sygnał daily nie jest znany przed daily close;
- sygnał weekly nie jest znany przed zamknięciem tygodnia;
- niższy interwał może używać ostatniego zamkniętego wyższego interwału;
- nie resampluj danych intraday do daily i nie używaj świecy daily w trakcie jej budowania;
- zapisuj regułę timestampu: początek świecy, koniec świecy albo exchange close.

## Checklista

```text
- [ ] Źródło danych, timezone, kalendarz i price mode są jawne.
- [ ] OHLCV przechodzi walidację relacji cen, typów, duplikatów i braków.
- [ ] Corporate actions nie mieszają adjusted close z raw high/low bez decyzji.
- [ ] Warmup najdłuższego wskaźnika jest zachowany albo analiza degraduje gracefully.
- [ ] Missing candles są odróżnione od normalnych przerw sesyjnych.
- [ ] Crypto/forex mają opisane sesje, wolumen, timezone i caveats brokera/giełdy.
- [ ] Multi-timeframe używa tylko zamkniętych świec wyższego interwału.
```
