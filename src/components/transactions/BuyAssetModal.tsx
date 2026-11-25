import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { AssetCategory, Currency } from '../../types/portfolio';
import { StooqProvider } from '../../services/market/StooqProvider';
import { InstrumentSearchInput } from '../common/InstrumentSearchInput';
import { INSTRUMENT_DATABASE } from '../../data/instruments';
import { Search } from 'lucide-react';

interface BuyAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTicker?: string;
  initialCategory?: AssetCategory;
}

const marketProvider = new StooqProvider();

export const BuyAssetModal: React.FC<BuyAssetModalProps> = ({
  isOpen,
  onClose,
  initialTicker = '',
  initialCategory = 'Akcje GPW'
}) => {
  const { portfolios, selectedPortfolioId, addTransaction } = usePortfolio();

  const [targetPortfolioId, setTargetPortfolioId] = useState<string>(
    selectedPortfolioId !== 'ALL' ? selectedPortfolioId : (portfolios[0]?.id || '')
  );
  const [category, setCategory] = useState<AssetCategory>(initialCategory);
  const [ticker, setTicker] = useState<string>(initialTicker || 'ZAB.PL');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [hour, setHour] = useState<string>('00');
  const [minute, setMinute] = useState<string>('00');
  const [quantity, setQuantity] = useState<string>('');
  const [currency, setCurrency] = useState<Currency>('PLN');
  const [price, setPrice] = useState<string>('');
  const [commissionType, setCommissionType] = useState<'PCT' | 'VAL'>('VAL');
  const [commission, setCommission] = useState<string>('0');
  const [comment, setComment] = useState<string>('');
  const [isVerifyingPrice, setIsVerifyingPrice] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleVerifyPrice = async () => {
    if (!ticker) return;
    setIsVerifyingPrice(true);
    try {
      const q = await marketProvider.getQuote(ticker);
      setPrice(q.price.toString());
      setCurrency(q.currency);
    } catch {
      alert('Nie udało się pobrać aktualnej ceny waloru.');
    } finally {
      setIsVerifyingPrice(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qtyVal = parseFloat(quantity);
    const priceVal = parseFloat(price);

    if (!qtyVal || qtyVal <= 0 || !priceVal || priceVal <= 0) {
      alert('Wprowadź poprawną liczbę jednostek i cenę!');
      return;
    }

    const commVal = parseFloat(commission) || 0;
    const commAmt = commissionType === 'PCT' ? (qtyVal * priceVal * commVal) / 100 : commVal;
    const totalVal = qtyVal * priceVal + commAmt;

    const selectedOption = INSTRUMENT_DATABASE.find(o => o.symbol === ticker);
    const name = selectedOption ? selectedOption.name : ticker;

    await addTransaction({
      portfolioId: targetPortfolioId || portfolios[0]?.id || 'port-xtb',
      type: 'BUY',
      ticker,
      instrumentName: name,
      assetCategory: category,
      date: `${date}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00`,
      quantity: qtyVal,
      price: priceVal,
      currency,
      commission: commAmt,
      tax: 0,
      totalValue: totalVal,
      comment
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: '#091124', borderColor: '#172445' }}>
        <div className="modal-header">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>Kup walory do portfela</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* Target Portfolio */}
          <div className="form-group">
            <label className="form-label">Docelowy portfel</label>
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

          {/* Grupa walorów */}
          <div className="form-group">
            <label className="form-label">Grupa walorów</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as AssetCategory)}
              className="form-select"
            >
              <option value="Akcje GPW">Akcje GPW (Główny Rynek)</option>
              <option value="Akcje NewConnect">Akcje NewConnect</option>
              <option value="Obligacje Catalyst">Obligacje Catalyst & Skarbowe</option>
              <option value="ETF">ETF</option>
              <option value="Akcje NASDAQ">Akcje NASDAQ</option>
              <option value="Akcje NYSE">Akcje NYSE</option>
              <option value="Akcje Europejskie">Akcje Europejskie</option>
              <option value="Surowce">Surowce (Złoto, Srebro)</option>
              <option value="Indeksy">Indeksy</option>
              <option value="Forex">Forex</option>
              <option value="Krypto">Krypto</option>
            </select>
          </div>

          {/* Wybierz walor z dynamicznym wyszukiwaniem */}
          <div className="form-group">
            <label className="form-label">Wybierz walor (Szukaj po nazwie lub symbolu)</label>
            <InstrumentSearchInput
              category={category}
              selectedSymbol={ticker}
              onSelect={(item) => {
                setTicker(item.symbol);
                setCategory(item.category);
                setCurrency(item.defaultCurrency);
              }}
            />
          </div>

          {/* Date, Hour, Minute */}
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
            <label className="form-label">Liczba jednostek</label>
            <input
              type="number"
              step="any"
              placeholder="Wpisz liczbę jednostek"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Waluta, Cena + Zweryfikuj cenę */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '0.75rem', alignItems: 'end' }} className="form-group">
            <div>
              <label className="form-label">Waluta</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} className="form-select">
                <option value="PLN">PLN</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
            <div>
              <label className="form-label">Cena</label>
              <input
                type="number"
                step="any"
                placeholder="Wpisz cenę"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="form-input"
              />
            </div>
            <button
              type="button"
              onClick={handleVerifyPrice}
              disabled={isVerifyingPrice}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.55rem 0.85rem' }}
            >
              <Search size={14} />
              Zweryfikuj cenę
            </button>
          </div>

          {/* Prowizja */}
          <div className="form-group">
            <label className="form-label">Prowizja</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <input
                type="number"
                step="any"
                placeholder="Wpisz prowizję"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                className="form-input"
                style={{ flex: 1 }}
              />
              <label style={{ fontSize: '0.85rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <input type="radio" checked={commissionType === 'PCT'} onChange={() => setCommissionType('PCT')} /> %
              </label>
              <label style={{ fontSize: '0.85rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <input type="radio" checked={commissionType === 'VAL'} onChange={() => setCommissionType('VAL')} /> Wartość (PLN)
              </label>
            </div>
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
            />
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0 0', borderTop: 'none' }}>
            <button type="button" onClick={onClose} className="btn btn-outline">Anuluj</button>
            <button type="submit" className="btn btn-primary" style={{ minWidth: '120px' }}>Kup</button>
          </div>
        </form>
      </div>
    </div>
  );
};
