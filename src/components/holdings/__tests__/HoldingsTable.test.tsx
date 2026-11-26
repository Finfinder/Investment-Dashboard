import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HoldingsTable } from '../HoldingsTable';
import { HoldingPosition, Transaction } from '../../../types/portfolio';

const mockWriteFile = vi.fn();
vi.mock('xlsx', async (importOriginal) => {
  const actual = await importOriginal<typeof import('xlsx')>();
  return {
    ...actual,
    writeFile: (...args: unknown[]) => mockWriteFile(...args)
  };
});

const mockHoldings: HoldingPosition[] = [
  {
    ticker: 'CDR.PL',
    name: 'CD PROJEKT',
    category: 'Akcje GPW',
    currency: 'PLN',
    quantity: 10,
    averageBuyPricePLN: 120.0,
    averageBuyPriceOriginal: 120.0,
    currentPricePLN: 150.0,
    currentPriceOriginal: 150.0,
    currentPriceTime: '17:00',
    totalValuePLN: 1500.0,
    totalCostPLN: 1200.0,
    unrealizedProfitPLN: 300.0,
    unrealizedProfitPercent: 25.0,
    dailyChangePercent: 2.5,
    dailyProfitPLN: 37.5,
    portfolioSharePercent: 60.0,
    investmentPeriodDays: 45,
    firstBuyDate: '2025-01-01'
  },
  {
    ticker: 'VWCE.DE',
    name: 'Vanguard All-World',
    category: 'ETF',
    currency: 'EUR',
    quantity: 2,
    averageBuyPricePLN: 450.0,
    averageBuyPriceOriginal: 100.0,
    currentPricePLN: 500.0,
    currentPriceOriginal: 110.0,
    currentPriceTime: '17:30',
    totalValuePLN: 1000.0,
    totalCostPLN: 900.0,
    unrealizedProfitPLN: 100.0,
    unrealizedProfitPercent: 11.11,
    dailyChangePercent: -1.2,
    dailyProfitPLN: -12.0,
    portfolioSharePercent: 40.0,
    investmentPeriodDays: 20,
    firstBuyDate: '2025-01-15'
  }
];

const mockTransactions: Transaction[] = [
  {
    id: 'tx-1',
    portfolioId: 'p1',
    type: 'BUY',
    ticker: 'CDR.PL',
    date: '2025-01-01T10:00:00Z',
    quantity: 10,
    price: 120,
    currency: 'PLN',
    commission: 0,
    tax: 0,
    totalValue: 1200
  }
];

let currentMockHoldings = mockHoldings;

vi.mock('../../../context/PortfolioContext', () => ({
  usePortfolio: () => ({
    holdings: currentMockHoldings,
    transactions: mockTransactions
  })
}));

describe('HoldingsTable Component', () => {
  const onQuickBuy = vi.fn();
  const onQuickSell = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    currentMockHoldings = mockHoldings;
  });

  it('renders table headers and main sections', () => {
    render(<HoldingsTable onQuickBuy={onQuickBuy} onQuickSell={onQuickSell} />);

    expect(screen.getByText('Inwestycje')).toBeInTheDocument();
    expect(screen.getByText(/data pierwszej operacji w portfelu/i)).toBeInTheDocument();
    expect(screen.getByText('Cały Portfel')).toBeInTheDocument();
    expect(screen.getByText(/razem \(2\)/i)).toBeInTheDocument();
  });

  it('renders holdings rows with ticker, name and prices', () => {
    render(<HoldingsTable onQuickBuy={onQuickBuy} onQuickSell={onQuickSell} />);

    expect(screen.getByText('CD PROJEKT (CDR.PL)')).toBeInTheDocument();
    expect(screen.getByText('Vanguard All-World (VWCE.DE)')).toBeInTheDocument();
    expect(screen.getByText('Akcje GPW (1)')).toBeInTheDocument();
    expect(screen.getByText('ETF (1)')).toBeInTheDocument();
  });

  it('toggles group collapse when category row is clicked', async () => {
    render(<HoldingsTable onQuickBuy={onQuickBuy} onQuickSell={onQuickSell} />);

    // Initially holding row is visible
    expect(screen.getByText('CD PROJEKT (CDR.PL)')).toBeInTheDocument();

    // Click category header to collapse
    const categoryHeader = screen.getByText('Akcje GPW (1)').closest('tr')!;
    await userEvent.click(categoryHeader);

    // Holding row should now be hidden
    expect(screen.queryByText('CD PROJEKT (CDR.PL)')).not.toBeInTheDocument();

    // Click again to re-expand
    await userEvent.click(categoryHeader);
    expect(screen.getByText('CD PROJEKT (CDR.PL)')).toBeInTheDocument();
  });

  it('triggers onQuickBuy callback when clicking K button', async () => {
    render(<HoldingsTable onQuickBuy={onQuickBuy} onQuickSell={onQuickSell} />);

    const buyButtons = screen.getAllByRole('button', { name: 'K' });
    await userEvent.click(buyButtons[0]);

    expect(onQuickBuy).toHaveBeenCalledWith('CDR.PL', 'Akcje GPW');
  });

  it('triggers onQuickSell callback when clicking S button', async () => {
    render(<HoldingsTable onQuickBuy={onQuickBuy} onQuickSell={onQuickSell} />);

    const sellButtons = screen.getAllByRole('button', { name: 'S' });
    await userEvent.click(sellButtons[0]);

    expect(onQuickSell).toHaveBeenCalledWith('CDR.PL', 'Akcje GPW');
  });

  it('renders gracefully when holdings list is empty', () => {
    currentMockHoldings = [];
    render(<HoldingsTable onQuickBuy={onQuickBuy} onQuickSell={onQuickSell} />);

    expect(screen.getByText('Inwestycje')).toBeInTheDocument();
    expect(screen.getByText('Cały Portfel')).toBeInTheDocument();
    expect(screen.getByText(/razem \(0\)/i)).toBeInTheDocument();
  });

  it('allows changing currency and calculation dates', async () => {
    render(<HoldingsTable onQuickBuy={onQuickBuy} onQuickSell={onQuickSell} />);

    const currencySelect = screen.getByRole('combobox') as HTMLSelectElement;
    await userEvent.selectOptions(currencySelect, 'USD');
    expect(currencySelect.value).toBe('USD');

    const dateInputs = screen.getAllByDisplayValue(/\d{4}-\d{2}-\d{2}/);
    expect(dateInputs.length).toBeGreaterThanOrEqual(1);
    await userEvent.clear(dateInputs[0]);
    await userEvent.type(dateInputs[0], '2025-06-01');
    expect(dateInputs[0]).toHaveValue('2025-06-01');
  });

  it('triggers export buttons for CSV, XLS, and XML without errors', async () => {
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL');
    const anchorClickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    render(<HoldingsTable onQuickBuy={onQuickBuy} onQuickSell={onQuickSell} />);

    const csvBtn = screen.getByRole('button', { name: /eksport do csv/i });
    const xlsBtn = screen.getByRole('button', { name: /eksport do xls/i });
    const xmlBtn = screen.getByRole('button', { name: /eksport do xml/i });

    await userEvent.click(csvBtn);
    expect(createObjectURLSpy).toHaveBeenCalledWith(expect.any(Blob));
    expect(anchorClickSpy).toHaveBeenCalledTimes(1);

    await userEvent.click(xlsBtn);
    expect(mockWriteFile).toHaveBeenCalledWith(expect.anything(), expect.stringMatching(/inwestycje_.*\.xlsx/));

    await userEvent.click(xmlBtn);
    expect(createObjectURLSpy).toHaveBeenCalledTimes(2); // 1 for CSV, 1 for XML
    expect(anchorClickSpy).toHaveBeenCalledTimes(2);

    anchorClickSpy.mockRestore();
  });
});
