import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { AssetCategory, Currency } from '../../types/portfolio';
import { StooqProvider } from '../../services/market/StooqProvider';
import { PortfolioCalculations } from '../../services/analytics/portfolioCalculations';
import { Search, AlertCircle, ArrowRight } from 'lucide-react';

interface SellAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTicker?: string;
  initialCategory?: AssetCategory;
}

const marketProvider = new StooqProvider();

export const SellAssetModal: React.FC<SellAssetModalProps> = ({
  isOpen,
  onClose,
  initialTicker = ''
}) => {
  const { portfolios, selectedPortfolioId, transactions, quotes, addTransaction } = usePortfolio();

  const [targetPortfolioId, setTargetPortfolioId] = useState<string>(
    selectedPortfolioId !== 'ALL' ? selectedPortfolioId : (portfolios[0]?.id || '')
  );

  // Compute active holdings (qty > 0) strictly for the chosen targetPortfolioId
  const portfolioTxs = transactions.filter(t => t.portfolioId === targetPortfolioId);
  const targetHoldings = PortfolioCalculations.calculateHoldings(portfolioTxs, quotes).filter(h => h.quantity > 0);

  const [selectedTicker, setSelectedTicker] = useState<string>(
    initialTicker || (targetHoldings[0]?.ticker || '')
  );
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [hour, setHour] = useState<string>('00');
  const [minute, setMinute] = useState<string>('00');
  const [quantity, setQuantity] = useState<string>('');
  const [currency, setCurrency] = useState<Currency>('PLN');
  const [price, setPrice] = useState<string>('');
  const [commissionType, setCommissionType] = useState<'PCT' | 'VAL'>('VAL');
  const [commission, setCommission] = useState<string>('0');
  const [tax, setTax] = useState<string>('0');
  const [includeInPIT, setIncludeInPIT] = useState<boolean>(true);
  const [comment, setComment] = useState<string>('');
  const [isVerifyingPrice, setIsVerifyingPrice] = useState<boolean>(false);

  // Keep selected ticker valid when targetPortfolioId changes
  useEffect(() => {
    if (targetHoldings.length > 0) {
      const exists = targetHoldings.some(h => h.ticker === selectedTicker);
      if (!exists) {
        const first = targetHoldings[0];
        setSelectedTicker(first.ticker);
        setCurrency(first.currency);
        if (first.currentPriceOriginal > 0) {
          setPrice(first.currentPriceOriginal.toString());
        }
      }
    } else {
      setSelectedTicker('');
    }
  }, [targetPortfolioId, targetHoldings]);

  if (!isOpen) return null;

  const currentHolding = targetHoldings.find(h => h.ticker === selectedTicker);
  const availableQty = currentHolding ? currentHolding.quantity : 0;
  const avgBuyPrice = currentHolding ? currentHolding.averageBuyPricePLN : 0;

  const qtyVal = parseFloat(quantity) || 0;
  const priceVal = parseFloat(price) || 0;
  const estimatedProfit = qtyVal > 0 && priceVal > 0
    ? (priceVal - avgBuyPrice) * qtyVal - (parseFloat(commission) || 0) - (parseFloat(tax) || 0)
    : 0;

  const handleSelectHolding = (ticker: string) => {
    setSelectedTicker(ticker);
    const holding = targetHoldings.find(h => h.ticker === ticker);
    if (holding) {
      setCurrency(holding.currency);
      if (holding.currentPriceOriginal > 0) {
        setPrice(holding.currentPriceOriginal.toString());
      }
    }
  };

  const handleSellAll = () => {
    if (availableQty > 0) {
      setQuantity(availableQty.toString());
    }
  };

  const handleVerifyPrice = async () => {
    if (!selectedTicker) return;
    setIsVerifyingPrice(true);
    try {
      const q = await marketProvider.getQuote(selectedTicker);
      setPrice(q.price.toString());
      setCurrency(q.currency);
    } catch {
      alert('Nie udało się pobrać aktualnych cen waloru.');
    } finally {
      setIsVerifyingPrice(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentHolding) {
      alert('Wybierz walor ze swojego portfela do sprzedaży!');
      return;
    }

    if (!qtyVal || qtyVal <= 0 || qtyVal > availableQty) {
      alert(`Wprowadź poprawną liczbę jednostek do sprzedaży (maksymalnie ${availableQty} szt.)!`);
      return;
    }

    if (!priceVal || priceVal <= 0) {
      alert('Wprowadź cenę sprzedaży!');
      return;
    }

    const commVal = parseFloat(commission) || 0;
    const taxVal = parseFloat(tax) || 0;
    const commAmt = commissionType === 'PCT' ? (qtyVal * priceVal * commVal) / 100 : commVal;
    const totalVal = qtyVal * priceVal - commAmt - taxVal;

    await addTransaction({
      portfolioId: targetPortfolioId,
      type: 'SELL',
      ticker: selectedTicker,
      instrumentName: currentHolding.name,
      assetCategory: currentHolding.category,
      date: `${date}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00`,
      quantity: qtyVal,
      price: priceVal,
      currency,
      commission: commAmt,
      tax: taxVal,
      totalValue: totalVal,
      includeInPIT,
      comment
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: '#091124', borderColor: '#172445' }}>
        <div className="modal-header">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>Sprzedaj walory</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* Target Portfolio */}
          <div className="form-group">
            <label className="form-label">Z portfela</label>
            <select
              value={targetPortfolioId}
              onChange={(e) => setTargetPortfolioId(e.target.value)}
              className="form-select"
            >
              {portfolios.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.currency})</option>
              ))}
            </select>
          </div>

          {/* Target Holdings Dropdown */}
          <div className="form-group">
            <label className="form-label">Wybierz walor z portfela do sprzedaży</label>
            {targetHoldings.length > 0 ? (
              <select
                value={selectedTicker}
                onChange={(e) => handleSelectHolding(e.target.value)}
                className="form-select"
                style={{ fontWeight: 700, color: '#38bdf8' }}
              >
                {targetHoldings.map(h => (
                  <option key={h.ticker} value={h.ticker}>
                    {h.name} ({h.ticker}) — Dostępne: {h.quantity} szt. ({h.totalValuePLN.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} PLN)
                  </option>
                ))}
              </select>
            ) : (
              <div style={{
                padding: '0.85rem 1rem',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#f87171',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem'
              }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>W wybranym portfelu brak jest otwartych pozycji do sprzedaży.</span>
              </div>
            )}
          </div>

          {/* Display Current Holding Summary if selected */}
          {currentHolding && (
            <div style={{
              backgroundColor: '#0d162a',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              padding: '0.65rem 0.85rem',
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.8rem'
            }}>
              <div>
                <span style={{ color: '#94a3b8' }}>Średnia cena zakupu: </span>
                <strong style={{ color: '#f8fafc' }}>{currentHolding.averageBuyPriceOriginal.toFixed(2)} {currentHolding.currency}</strong>
              </div>
              <div>
                <span style={{ color: '#94a3b8' }}>Liczba posiadana: </span>
                <strong style={{ color: '#38bdf8' }}>{availableQty} szt.</strong>
              </div>
            </div>
          )}

          {/* Date & Time */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem' }} className="form-group">
            <div>
              <label className="form-label">Data</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="form-input" />
            </div>
            <div>
              <label className="form-label">Godzina</label>
              <input type="number" min="0" max="23" value={hour} onChange={(e) => setHour(e.target.value)} className="form-input" />
            </div>
            <div>
              <label className="form-label">Minuta</label>
              <input type="number" min="0" max="59" value={minute} onChange={(e) => setMinute(e.target.value)} className="form-input" />
            </div>
          </div>

          {/* Liczba jednostek */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Liczba jednostek do sprzedaży</label>
              {availableQty > 0 && (
                <button
                  type="button"
                  onClick={handleSellAll}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#38bdf8',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  Sprzedaj całość ({availableQty} szt.) <ArrowRight size={12} />
                </button>
              )}
            </div>
            <input
              type="number"
              step="any"
              max={availableQty > 0 ? availableQty : undefined}
              placeholder={`Maksymalnie ${availableQty} szt.`}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="form-input"
              disabled={targetHoldings.length === 0}
            />
          </div>

          {/* Waluta, Cena + Zweryfikuj */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '0.75rem', alignItems: 'end' }} className="form-group">
            <div>
              <label className="form-label">Waluta</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} className="form-select" disabled={targetHoldings.length === 0}>
                <option value="PLN">PLN</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div>
              <label className="form-label">Cena sprzedaży</label>
              <input
                type="number"
                step="any"
                placeholder="Wpisz cenę sprzedaży"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="form-input"
                disabled={targetHoldings.length === 0}
              />
            </div>
            <button
              type="button"
              onClick={handleVerifyPrice}
              disabled={isVerifyingPrice || !selectedTicker}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.55rem 0.85rem' }}
            >
              <Search size={14} />
              Zweryfikuj cenę
            </button>
          </div>

          {/* Podatek & Szacowany zysk */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }} className="form-group">
            <div>
              <label className="form-label">Podatek (PLN)</label>
              <input
                type="number"
                step="any"
                value={tax}
                onChange={(e) => setTax(e.target.value)}
                className="form-input"
                disabled={targetHoldings.length === 0}
              />
            </div>
            <div>
              <label className="form-label">Szacowany zysk (PLN)</label>
              <input
                type="text"
                readOnly
                value={estimatedProfit.toFixed(2)}
                className="form-input"
                style={{
                  fontWeight: 800,
                  color: estimatedProfit >= 0 ? '#10b981' : '#ef4444',
                  backgroundColor: '#0f182e'
                }}
              />
            </div>
          </div>

          {/* PIT toggle */}
          <div className="form-group">
            <label style={{ fontSize: '0.85rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={includeInPIT}
                onChange={(e) => setIncludeInPIT(e.target.checked)}
                disabled={targetHoldings.length === 0}
              />
              Uwzględnij w PIT
            </label>
          </div>

          {/* Komentarz */}
          <div className="form-group">
            <label className="form-label">Komentarz</label>
            <textarea
              rows={2}
              placeholder="Wpisz komentarz do operacji"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="form-textarea"
              disabled={targetHoldings.length === 0}
            />
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0 0', borderTop: 'none' }}>
            <button type="button" onClick={onClose} className="btn btn-outline">Anuluj</button>
            <button
              type="submit"
              className="btn btn-danger"
              style={{ minWidth: '120px' }}
              disabled={targetHoldings.length === 0}
            >
              Sprzedaj
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
