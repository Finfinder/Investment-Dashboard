# Wizualizacje Analizy Technicznej

Referencja dla wykresów OHLC, wolumenu, wskaźników, markerów sygnałów i etykiet danych. Ładuj ją, gdy zadanie dotyczy `mplfinance`, `plotly`, `lightweight-charts`, paneli, timezone albo price mode labels.

## Spis Treści

- [Biblioteki](#biblioteki)
- [Układ Paneli](#układ-paneli)
- [Markery i Adnotacje](#markery-i-adnotacje)
- [Timezone i Sesje](#timezone-i-sesje)
- [Price Mode Labels](#price-mode-labels)
- [Przykłady](#przykłady)
- [Checklista](#checklista)

## Biblioteki

| Biblioteka | Użyj gdy | Uważaj na |
| --- | --- | --- |
| `mplfinance` | Statyczne wykresy świecowe, raporty, szybkie notebooki. | Mniej interakcji; pilnuj paneli i nazw kolumn. |
| `plotly` | Interaktywne dashboardy, hover, zoom, web reports. | Duży bundle po stronie frontendu; rozważ lazy loading. |
| `matplotlib` | Pełna kontrola w raportach offline. | Więcej ręcznej pracy przy świecach i panelach. |
| TradingView Lightweight Charts | Web UI w stylu TradingView, szybkie interakcje. | Timezone, UTC epoch seconds i format danych są krytyczne. |
| `bokeh` / `altair` | Specyficzne dashboardy lub raporty. | Sprawdź wsparcie świec, wolumenu i deploymentu. |

Przy aplikacji frontendowej ciężkie biblioteki chartingowe mogą wymagać `optimizing-frontend`, jeśli zwiększają initial bundle albo psują interakcję.

## Układ Paneli

Typowy układ:

- główny panel: OHLC/świece, strefy S/R, trendlines, VWAP, ważne poziomy;
- panel wolumenu: wolumen jako histogram, volume SMA albo kolory według kierunku świecy;
- panel momentum: RSI/Stochastic z poziomami kontekstowymi;
- panel MACD: MACD, signal, histogram;
- panel volatility: ATR, Bollinger width, realized volatility;
- legenda: źródło danych, timezone, interwał, price mode, zakres i data generacji.

Nie nakładaj zbyt wielu wskaźników na panel ceny. Jeśli użytkownik nie może odczytać świec, wizualizacja nie spełnia funkcji analitycznej.

## Markery i Adnotacje

Markery powinny rozróżniać stan sygnału:

- `candidate`: warunek techniczny wykryty, brak pełnego potwierdzenia;
- `confirmed`: warunek przeszedł walidację techniczną;
- `invalidated`: pattern lub poziom został unieważniony;
- `filtered_out`: sygnał odrzucony przez reżim, wolumen, warmup albo MTF.

Unikaj etykiet sugerujących rekomendacje transakcyjne, jeśli analiza nie przeszła do skilla strategii. Markery muszą trafiać w ten sam price mode, którego używa panel ceny.

## Timezone i Sesje

- Backend powinien wysyłać timestampy jednoznacznie: UTC epoch seconds albo ISO z timezone.
- UI musi wiedzieć, czy świeca jest oznaczona początkiem czy końcem interwału.
- Daily candle zależy od sesji rynku; dla FX i crypto jawnie opisz regułę close.
- Lightweight Charts renderuje czas w kontekście konfiguracji chartu i przeglądarki, więc testuj przesunięcia strefy.
- Przy multi-market dashboardach nie mieszaj giełd bez wskazania lokalnej sesji.

## Price Mode Labels

Każdy wykres i raport powinien oznaczać tryb ceny:

```json
{
  "symbol": "AAPL",
  "timeframe": "1D",
  "timezone": "America/New_York",
  "price_mode": "fully_adjusted_ohlc",
  "data_source": "polygon",
  "warmup_bars": 250
}
```

Jeśli panel pokazuje raw OHLC, a wskaźnik liczony jest z adjusted close, dodaj osobną legendę i ostrzeżenie. Najlepiej jednak ujednolicić tryb.

## Przykłady

`mplfinance` z panelem RSI:

```python
import mplfinance as mpf

rsi_panel = mpf.make_addplot(df["RSI_14"], panel=2, ylabel="RSI")
mpf.plot(
    df,
    type="candle",
    volume=True,
    addplot=[rsi_panel],
    title="AAPL 1D - price_mode=fully_adjusted_ohlc",
)
```

Payload dla Lightweight Charts:

```javascript
const candle = {
  time: Math.floor(Date.parse(row.datetimeUtc) / 1000),
  open: row.open,
  high: row.high,
  low: row.low,
  close: row.close,
};
```

## Checklista

```text
- [ ] Wykres pokazuje OHLC, wolumen i wskaźniki w czytelnych panelach.
- [ ] Markery rozróżniają candidate/confirmed/invalidated/filtered_out.
- [ ] Etykiety nie sugerują rekomendacji tradingowej bez strategii.
- [ ] Timezone, interwał, sesja i sposób oznaczania świecy są jawne.
- [ ] Price mode jest widoczny i spójny między świecami, markerami i wskaźnikami.
- [ ] Wykres nie ukrywa warmupu ani odrzuconych sygnałów.
- [ ] Ciężka biblioteka frontendowa ma plan lazy loadingu lub walidacji performance.
```
