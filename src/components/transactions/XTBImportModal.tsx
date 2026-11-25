import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Upload, FileSpreadsheet, CheckCircle, AlertTriangle } from 'lucide-react';

interface XTBImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const XTBImportModal: React.FC<XTBImportModalProps> = ({ isOpen, onClose }) => {
  const { portfolios, importXTBFile } = usePortfolio();

  const [targetPortfolioId, setTargetPortfolioId] = useState<string>(portfolios[0]?.id || 'port-xtb');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setImportStatus(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setImportStatus(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    setIsImporting(true);
    setImportStatus(null);
    try {
      const res = await importXTBFile(selectedFile, targetPortfolioId);
      setImportStatus(res);
      if (res.success) {
        setTimeout(() => {
          onClose();
          setSelectedFile(null);
          setImportStatus(null);
        }, 1800);
      }
    } catch (err: any) {
      setImportStatus({ success: false, message: err.message || 'Błąd importu pliku.' });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: '#091124', borderColor: '#172445' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileSpreadsheet size={22} color="#10b981" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>Import transakcji z XTB</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
        </div>

        <div className="modal-body">
          {/* Target Portfolio */}
          <div className="form-group">
            <label className="form-label">Wybierz portfel docelowy dla transakcji</label>
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

          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            style={{
              border: '2px dashed #1e2e54',
              borderRadius: '10px',
              padding: '2rem 1rem',
              textAlign: 'center',
              backgroundColor: '#0b1429',
              cursor: 'pointer',
              marginBottom: '1.25rem',
              transition: 'all 0.2s ease'
            }}
          >
            <Upload size={36} color="#38bdf8" style={{ marginBottom: '0.75rem' }} />
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
              Przeciągnij i upuść raport z XTB (XLSX lub CSV)
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem', marginBottom: '1rem' }}>
              Obsługuje oficjalny format raportu XTB (Operacje gotówkowe / Pozycje zamknięte)
            </div>

            <label className="btn btn-secondary" style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
              Wybierz plik z komputera
              <input
                type="file"
                accept=".xlsx, .xls, .csv, .txt"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          {/* Selected File Details */}
          {selectedFile && (
            <div style={{
              backgroundColor: '#0f1b36',
              border: '1px solid #1a2747',
              borderRadius: '6px',
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <strong style={{ fontSize: '0.85rem', color: '#38bdf8' }}>{selectedFile.name}</strong>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{(selectedFile.size / 1024).toFixed(1)} KB</div>
              </div>
              <button onClick={() => setSelectedFile(null)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>Usuń</button>
            </div>
          )}

          {/* Status Message */}
          {importStatus && (
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              marginBottom: '1rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: importStatus.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: importStatus.success ? '#10b981' : '#ef4444',
              border: `1px solid ${importStatus.success ? '#10b981' : '#ef4444'}`
            }}>
              {importStatus.success ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
              {importStatus.message}
            </div>
          )}

          <div className="modal-footer" style={{ padding: '1rem 0 0 0', borderTop: 'none' }}>
            <button type="button" onClick={onClose} className="btn btn-outline">Zamknij</button>
            <button
              type="button"
              disabled={!selectedFile || isImporting}
              onClick={handleImport}
              className="btn btn-success"
              style={{ minWidth: '140px' }}
            >
              {isImporting ? 'Importowanie...' : 'Zaimportuj raport'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
