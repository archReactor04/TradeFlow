import { db } from './db';

const SEED_TRADES = [
  { id: '1', symbol: 'AAPL', direction: 'long', entryPrice: 178.50, exitPrice: 185.20, entryDate: '2025-02-03T09:30:00', exitDate: '2025-02-03T15:45:00', positionSize: 100, strategyId: '1', accountId: '1', tags: ['breakout', 'earnings'], notes: 'Strong breakout above resistance after earnings beat.', takeProfits: [{ price: 182.00, quantity: 50, date: '2025-02-03T12:00:00' }, { price: 185.20, quantity: 50, date: '2025-02-03T15:45:00' }], pnl: 670.00, fees: 0, commissions: 0, tradeDuration: 22500, images: [] },
  { id: '2', symbol: 'TSLA', direction: 'short', entryPrice: 245.00, exitPrice: 238.50, entryDate: '2025-02-04T10:00:00', exitDate: '2025-02-04T14:30:00', positionSize: 50, strategyId: '2', accountId: '1', tags: ['mean-reversion'], notes: 'Faded the gap up at resistance.', takeProfits: [{ price: 238.50, quantity: 50, date: '2025-02-04T14:30:00' }], pnl: 325.00, fees: 0, commissions: 0, tradeDuration: 16200, images: [] },
  { id: '3', symbol: 'NVDA', direction: 'long', entryPrice: 890.00, exitPrice: 875.00, entryDate: '2025-02-05T09:35:00', exitDate: '2025-02-05T11:00:00', positionSize: 20, strategyId: '1', accountId: '2', tags: ['breakout'], notes: 'Failed breakout, stopped out.', takeProfits: [], pnl: -300.00, fees: 0, commissions: 0, tradeDuration: 5100, images: [] },
  { id: '4', symbol: 'META', direction: 'long', entryPrice: 475.00, exitPrice: 492.30, entryDate: '2025-02-06T09:30:00', exitDate: '2025-02-07T10:00:00', positionSize: 40, strategyId: '3', accountId: '1', tags: ['swing', 'earnings'], notes: 'Swing trade into earnings, held overnight.', takeProfits: [{ price: 485.00, quantity: 20, date: '2025-02-06T15:00:00' }, { price: 492.30, quantity: 20, date: '2025-02-07T10:00:00' }], pnl: 692.00, fees: 0, commissions: 0, tradeDuration: 88200, images: [] },
  { id: '5', symbol: 'SPY', direction: 'short', entryPrice: 502.00, exitPrice: 505.50, entryDate: '2025-02-07T13:00:00', exitDate: '2025-02-07T15:30:00', positionSize: 200, strategyId: '2', accountId: '1', tags: ['revenge-trade'], notes: 'Forced trade, should have waited for confirmation.', takeProfits: [], pnl: -700.00, fees: 0, commissions: 0, tradeDuration: 9000, images: [] },
  { id: '6', symbol: 'AMD', direction: 'long', entryPrice: 165.00, exitPrice: 172.80, entryDate: '2025-02-10T09:30:00', exitDate: '2025-02-10T15:00:00', positionSize: 80, strategyId: '1', accountId: '2', tags: ['breakout'], notes: 'Clean breakout on volume.', takeProfits: [{ price: 170.00, quantity: 40, date: '2025-02-10T12:00:00' }, { price: 172.80, quantity: 40, date: '2025-02-10T15:00:00' }], pnl: 624.00, fees: 0, commissions: 0, tradeDuration: 19800, images: [] },
  { id: '7', symbol: 'AMZN', direction: 'long', entryPrice: 185.50, exitPrice: 189.00, entryDate: '2025-02-11T10:00:00', exitDate: '2025-02-12T11:00:00', positionSize: 60, strategyId: '3', accountId: '1', tags: ['swing'], notes: 'Gap fill play, held overnight for target.', takeProfits: [{ price: 189.00, quantity: 60, date: '2025-02-12T11:00:00' }], pnl: 210.00, fees: 0, commissions: 0, tradeDuration: 90000, images: [] },
  { id: '8', symbol: 'GOOGL', direction: 'short', entryPrice: 155.00, exitPrice: 152.00, entryDate: '2025-02-12T09:30:00', exitDate: '2025-02-12T14:00:00', positionSize: 100, strategyId: '2', accountId: '1', tags: ['mean-reversion'], notes: 'Short at upper Bollinger band rejection.', takeProfits: [{ price: 153.00, quantity: 50, date: '2025-02-12T12:00:00' }, { price: 152.00, quantity: 50, date: '2025-02-12T14:00:00' }], pnl: 300.00, fees: 0, commissions: 0, tradeDuration: 16200, images: [] },
  { id: '9', symbol: 'MSFT', direction: 'long', entryPrice: 410.00, exitPrice: 406.00, entryDate: '2025-02-13T09:30:00', exitDate: '2025-02-13T11:30:00', positionSize: 30, strategyId: '1', accountId: '2', tags: ['breakout'], notes: 'Weak follow-through, cut early.', takeProfits: [], pnl: -120.00, fees: 0, commissions: 0, tradeDuration: 7200, images: [] },
  { id: '10', symbol: 'NFLX', direction: 'long', entryPrice: 880.00, exitPrice: 910.00, entryDate: '2025-02-14T09:30:00', exitDate: '2025-02-14T15:30:00', positionSize: 15, strategyId: '3', accountId: '1', tags: ['momentum', 'earnings'], notes: 'Post-earnings momentum continuation.', takeProfits: [{ price: 895.00, quantity: 8, date: '2025-02-14T12:00:00' }, { price: 910.00, quantity: 7, date: '2025-02-14T15:30:00' }], pnl: 450.00, fees: 0, commissions: 0, tradeDuration: 21600, images: [] },
];

const SEED_ACCOUNTS = [
  { id: '1', name: 'IBKR Main' },
  { id: '2', name: 'Funded Account #1' },
];

const SEED_STRATEGIES = [
  { id: '1', name: 'Opening Range Breakout', description: 'Wait for the first 15-min range to form, then trade the breakout direction with volume confirmation. Stop below the range low/high.' },
  { id: '2', name: 'Mean Reversion', description: 'Fade extended moves at key support/resistance levels using Bollinger Bands and RSI divergence for entry timing.' },
  { id: '3', name: 'Gap and Go', description: 'Trade momentum continuation on stocks gapping up/down on news or earnings. Enter on the first pullback to VWAP.' },
];

function tryParseLocalStorage(key) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  return null;
}

export async function seedDatabase() {
  const tradesCount = await db.trades.count();
  const accountsCount = await db.accounts.count();
  const strategiesCount = await db.strategies.count();

  if (tradesCount === 0) {
    const migrated = tryParseLocalStorage('tradeflow_trades');
    await db.trades.bulkAdd(migrated || SEED_TRADES);
  }

  if (accountsCount === 0) {
    const migrated = tryParseLocalStorage('tradeflow_accounts');
    await db.accounts.bulkAdd(migrated || SEED_ACCOUNTS);
  }

  if (strategiesCount === 0) {
    const migrated = tryParseLocalStorage('tradeflow_strategies');
    await db.strategies.bulkAdd(migrated || SEED_STRATEGIES);
  }

  window.localStorage.removeItem('tradeflow_trades');
  window.localStorage.removeItem('tradeflow_accounts');
  window.localStorage.removeItem('tradeflow_strategies');
}
