import { computeDurationSeconds } from './trade-utils';

const FUTURES_MULTIPLIERS = {
  MNQ: 2,
  MES: 5,
  MYM: 0.5,
  M2K: 5,
  NQ: 20,
  ES: 50,
  YM: 5,
  RTY: 50,
  MCL: 100,
  CL: 1000,
  GC: 100,
  MGC: 10,
  SI: 5000,
  SIL: 1000,
  ZB: 1000,
  ZN: 1000,
  ZF: 1000,
  HE: 400,
  LE: 400,
  ZC: 50,
  ZS: 50,
  ZW: 50,
  NG: 10000,
  MNG: 1000,
};

function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const rows = lines.slice(1).map((line) => {
    const values = [];
    let current = '';
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === ',' && !inQuotes) { values.push(current.trim()); current = ''; continue; }
      current += ch;
    }
    values.push(current.trim());
    const row = {};
    headers.forEach((h, i) => { row[h] = values[i] ?? ''; });
    return row;
  });
  return { headers, rows };
}

function toISO(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toISOString().slice(0, 19);
}

const topstepXParser = {
  name: 'topstepx',
  label: 'TopstepX',
  parse(text) {
    const { rows } = parseCSV(text);
    return rows
      .filter((r) => r.ContractName)
      .map((r) => {
        const entryDate = toISO(r.EnteredAt);
        const exitDate = toISO(r.ExitedAt);
        return {
          symbol: r.ContractName || '',
          direction: (r.Type || '').trim().toLowerCase() === 'buy' ? 'long' : 'short',
          entryPrice: parseFloat(r.EntryPrice) || 0,
          exitPrice: parseFloat(r.ExitPrice) || 0,
          entryDate,
          exitDate,
          positionSize: parseInt(r.Size) || 0,
          pnl: parseFloat(r.PnL) || 0,
          fees: parseFloat(r.Fees) || 0,
          commissions: parseFloat(r.Commissions) || 0,
          tradeDuration: computeDurationSeconds(entryDate, exitDate),
          tags: [],
          takeProfits: [],
          notes: '',
          _tradeDay: r.TradeDay || entryDate?.split('T')[0] || '',
        };
      });
  },
};

const tradovateParser = {
  name: 'tradovate',
  label: 'Tradovate',
  parse(text) {
    const { rows } = parseCSV(text);

    const filledOrders = rows
      .filter((r) => (r.Status || '').trim() === 'Filled')
      .map((r) => ({
        contract: (r.Contract || '').trim(),
        product: (r.Product || '').trim(),
        side: (r['B/S'] || '').trim(),
        price: parseFloat(r['Avg Fill Price'] || r.avgPrice) || 0,
        qty: parseInt(r['Filled Qty'] || r.filledQty) || 0,
        fillTime: toISO(r['Fill Time'] || r.Timestamp),
        account: (r.Account || '').trim(),
      }))
      .sort((a, b) => new Date(a.fillTime) - new Date(b.fillTime));

    const byContract = {};
    for (const order of filledOrders) {
      if (!byContract[order.contract]) byContract[order.contract] = [];
      byContract[order.contract].push(order);
    }

    const trades = [];

    for (const [contract, orders] of Object.entries(byContract)) {
      let netPosition = 0;
      let entryDirection = null;
      let entryPrice = 0;
      let entryQty = 0;
      let entryDate = '';
      let exitFills = [];
      let account = '';
      const product = orders[0]?.product || contract;

      for (const order of orders) {
        const signedQty = order.side === 'Buy' ? order.qty : -order.qty;
        const prevPos = netPosition;
        netPosition += signedQty;

        if (prevPos === 0 && netPosition !== 0) {
          entryDirection = netPosition > 0 ? 'long' : 'short';
          entryPrice = order.price;
          entryQty = Math.abs(netPosition);
          entryDate = order.fillTime;
          exitFills = [];
          account = order.account;
        } else if (prevPos !== 0) {
          const isClosing = (entryDirection === 'long' && signedQty < 0) ||
                            (entryDirection === 'short' && signedQty > 0);

          if (isClosing) {
            exitFills.push({
              price: order.price,
              quantity: order.qty,
              date: order.fillTime,
            });
          } else {
            entryQty += order.qty;
            entryPrice = ((entryPrice * (entryQty - order.qty)) + (order.price * order.qty)) / entryQty;
          }
        }

        if (netPosition === 0 && prevPos !== 0) {
          const multiplier = FUTURES_MULTIPLIERS[product] ?? 1;
          let totalPnl = 0;
          for (const fill of exitFills) {
            const diff = entryDirection === 'long'
              ? fill.price - entryPrice
              : entryPrice - fill.price;
            totalPnl += diff * fill.quantity * multiplier;
          }

          const lastExit = exitFills[exitFills.length - 1];
          const totalExitQty = exitFills.reduce((s, f) => s + f.quantity, 0);
          const weightedExitPrice = exitFills.reduce((s, f) => s + f.price * f.quantity, 0) / totalExitQty;

          const takeProfits = exitFills.length > 1
            ? exitFills.map((f) => ({ price: f.price, quantity: f.quantity, date: f.date }))
            : [];

          const tradeDuration = computeDurationSeconds(entryDate, lastExit?.date);

          trades.push({
            symbol: contract,
            direction: entryDirection,
            entryPrice,
            exitPrice: Math.round(weightedExitPrice * 100) / 100,
            entryDate,
            exitDate: lastExit?.date || '',
            positionSize: entryQty,
            pnl: Math.round(totalPnl * 100) / 100,
            fees: 0,
            commissions: 0,
            tradeDuration,
            tags: [],
            takeProfits,
            notes: '',
            _tradeDay: entryDate?.split('T')[0] || '',
            _account: account,
          });

          entryDirection = null;
          entryPrice = 0;
          entryQty = 0;
          entryDate = '';
          exitFills = [];
        }
      }
    }

    return trades;
  },
};

export const BROKERS = [topstepXParser, tradovateParser];

export function getBroker(name) {
  return BROKERS.find((b) => b.name === name);
}
