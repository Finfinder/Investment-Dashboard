import React, { useState, useRef, useEffect } from 'react';
import { AssetCategory, Currency } from '../../types/portfolio';
import { INSTRUMENT_DATABASE, InstrumentItem } from '../../data/instruments';
import { Search, X, Check, Tag } from 'lucide-react';

interface InstrumentSearchInputProps {
  category: AssetCategory;
  selectedSymbol: string;
  onSelect: (item: { symbol: string; name: string; category: AssetCategory; defaultCurrency: Currency }) => void;
}

export const InstrumentSearchInput: React.FC<InstrumentSearchInputProps> = ({
  category,
  selectedSymbol,
  onSelect
}) => {
  const [query, setQuery] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Find currently selected item if matches database
  const selectedItem = INSTRUMENT_DATABASE.find(i => i.symbol === selectedSymbol);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter instruments by category and/or search query
  const filteredInstruments = INSTRUMENT_DATABASE.filter(item => {
    const cleanQ = query.trim().toLowerCase();

    // If query is present, search globally across all categories
    if (cleanQ.length > 0) {
      return (
        item.symbol.toLowerCase().includes(cleanQ) ||
        item.name.toLowerCase().includes(cleanQ) ||
        (item.market && item.market.toLowerCase().includes(cleanQ)) ||
        item.category.toLowerCase().includes(cleanQ)
      );
    }

    // If no query, filter strictly by current category
    return item.category === category;
  });

  const handleSelectItem = (item: InstrumentItem) => {
    onSelect({
      symbol: item.symbol,
      name: item.name,
      category: item.category,
      defaultCurrency: item.defaultCurrency
    });
    setIsOpen(false);
    setQuery('');
  };

  const handleCustomSymbol = () => {
    const clean = query.trim().toUpperCase();
    if (!clean) return;
    onSelect({
      symbol: clean,
      name: `Walor niestandardowy (${clean})`,
      category: category,
      defaultCurrency: 'PLN'
    });
    setIsOpen(false);
    setQuery('');
  };

  const categoryBadgeColor = (cat: AssetCategory) => {
    switch (cat) {
      case 'Akcje GPW': return '#38bdf8';
      case 'Akcje NewConnect': return '#c084fc';
      case 'Obligacje Catalyst': return '#f59e0b';
      case 'ETF': return '#10b981';
      case 'Akcje NASDAQ': case 'Akcje NYSE': return '#6366f1';
      default: return '#94a3b8';
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {/* Selected Box or Search Input */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          backgroundColor: '#0f182e',
          border: isOpen ? '1px solid #2563eb' : '1px solid #1a2847',
          borderRadius: '8px',
          padding: '0.5rem 0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, overflow: 'hidden' }}>
          <Search size={16} color="#64748b" style={{ flexShrink: 0 }} />
          {isOpen ? (
            <input
              type="text"
              autoFocus
              placeholder="Wpisz nazwę lub ticker (np. PKN, Orlen, EDO0428, Żabka)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'none',
                border: 'none',
                color: '#f8fafc',
                outline: 'none',
                width: '100%',
                fontSize: '0.85rem',
                fontWeight: 600
              }}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap' }}>
                {selectedItem ? selectedItem.name : selectedSymbol || 'Wybierz lub wpisz walor...'}
              </span>
              {selectedItem && (
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: categoryBadgeColor(selectedItem.category),
                  backgroundColor: 'rgba(15, 24, 46, 0.8)',
                  border: `1px solid ${categoryBadgeColor(selectedItem.category)}40`,
                  padding: '0.1rem 0.4rem',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap'
                }}>
                  {selectedItem.category}
                </span>
              )}
            </div>
          )}
        </div>

        {isOpen && query && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setQuery(''); }}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px' }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Dropdown Options List */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '110%',
          left: 0,
          right: 0,
          maxHeight: '280px',
          overflowY: 'auto',
          backgroundColor: '#0d1527',
          border: '1px solid #1a2847',
          borderRadius: '10px',
          boxShadow: '0 15px 35px rgba(0,0,0,0.7)',
          zIndex: 1000,
          padding: '0.4rem'
        }}>
          {filteredInstruments.length > 0 ? (
            filteredInstruments.map((item) => {
              const isSelected = item.symbol === selectedSymbol;
              return (
                <div
                  key={item.symbol}
                  onClick={() => handleSelectItem(item)}
                  style={{
                    padding: '0.55rem 0.75rem',
                    borderRadius: '6px',
                    backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.2)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    marginBottom: '2px',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = '#162340';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                      {item.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.72rem', color: '#64748b' }}>
                      <span style={{ color: '#38bdf8', fontWeight: 600 }}>{item.symbol}</span>
                      {item.market && <span>• {item.market}</span>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      color: categoryBadgeColor(item.category),
                      backgroundColor: `${categoryBadgeColor(item.category)}15`,
                      border: `1px solid ${categoryBadgeColor(item.category)}30`,
                      padding: '0.15rem 0.4rem',
                      borderRadius: '4px'
                    }}>
                      {item.category}
                    </span>
                    {isSelected && <Check size={16} color="#38bdf8" />}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ padding: '0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                Brak pasującego waloru w bazie dla: <strong style={{ color: '#f8fafc' }}>"{query}"</strong>
              </div>
              <button
                type="button"
                onClick={handleCustomSymbol}
                className="btn btn-outline"
                style={{ fontSize: '0.78rem', width: '100%', padding: '0.4rem' }}
              >
                Użyj niestandardowy symbol: <strong style={{ color: '#38bdf8', marginLeft: '4px' }}>{query.toUpperCase()}</strong>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
