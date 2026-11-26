import React from 'react';
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { webcrypto } from 'node:crypto';

// Ensure Web Crypto API with SubtleCrypto is available in test environment
if (!globalThis.crypto?.subtle) {
  Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
    writable: true,
    configurable: true
  });
}

// Ensure URL.createObjectURL and URL.revokeObjectURL exist for export tests
if (!globalThis.URL.createObjectURL) {
  globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
}
if (!globalThis.URL.revokeObjectURL) {
  globalThis.URL.revokeObjectURL = vi.fn();
}

// Global fetch mock to prevent live network calls to Stooq in tests
globalThis.fetch = vi.fn().mockImplementation(() => {
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({
      symbols: [
        {
          symbol: 'mock',
          close: '100.00',
          open: '98.00'
        }
      ]
    })
  } as unknown as Response);
});

// Mock Chart.js and react-chartjs-2 to prevent HTMLCanvasElement 2D context errors in happy-dom
vi.mock('react-chartjs-2', () => ({
  Doughnut: (props: React.HTMLAttributes<HTMLDivElement>) => React.createElement('div', { 'data-testid': 'doughnut-chart-mock', ...props }),
  Line: (props: React.HTMLAttributes<HTMLDivElement>) => React.createElement('div', { 'data-testid': 'line-chart-mock', ...props }),
  Bar: (props: React.HTMLAttributes<HTMLDivElement>) => React.createElement('div', { 'data-testid': 'bar-chart-mock', ...props }),
  Pie: (props: React.HTMLAttributes<HTMLDivElement>) => React.createElement('div', { 'data-testid': 'pie-chart-mock', ...props })
}));

vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn()
  },
  ArcElement: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  PointElement: vi.fn(),
  LineElement: vi.fn(),
  Title: vi.fn(),
  Filler: vi.fn()
}));

// Automatic cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  if (typeof localStorage !== 'undefined' && localStorage.clear) {
    localStorage.clear();
  }
});
