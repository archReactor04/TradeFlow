import { computeDurationSeconds } from './trade-utils';

export function mergeScaleOuts(trades) {
  const groups = {};

  for (const trade of trades) {
    const day = trade._tradeDay || trade.entryDate?.split('T')[0] || 'unknown';
    const key = `${trade.symbol}|${trade.direction}|${day}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(trade);
  }

  const merged = [];
  let scaleOutCount = 0;

  for (const group of Object.values(groups)) {
    if (group.length === 1) {
      const t = { ...group[0] };
      delete t._tradeDay;
      delete t._account;
      merged.push(t);
      if (t.takeProfits?.length > 1) scaleOutCount++;
      continue;
    }

    scaleOutCount++;
    const sorted = group.sort((a, b) => new Date(a.entryDate) - new Date(b.entryDate));
    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    const totalSize = sorted.reduce((s, t) => s + (t.positionSize || 0), 0);
    const totalPnl = sorted.reduce((s, t) => s + (t.pnl || 0), 0);
    const totalFees = sorted.reduce((s, t) => s + (t.fees || 0), 0);
    const totalCommissions = sorted.reduce((s, t) => s + (t.commissions || 0), 0);

    const weightedExitPrice = totalSize > 0
      ? sorted.reduce((s, t) => s + (t.exitPrice || 0) * (t.positionSize || 0), 0) / totalSize
      : 0;

    const takeProfits = sorted.map((t) => ({
      price: t.exitPrice,
      quantity: t.positionSize,
      date: t.exitDate,
    }));

    const exitDate = last.exitDate || '';
    const tradeDuration = computeDurationSeconds(first.entryDate, exitDate);

    const mergedTrade = {
      symbol: first.symbol,
      direction: first.direction,
      entryPrice: first.entryPrice,
      exitPrice: Math.round(weightedExitPrice * 100) / 100,
      entryDate: first.entryDate,
      exitDate,
      positionSize: totalSize,
      pnl: Math.round(totalPnl * 100) / 100,
      fees: Math.round(totalFees * 100) / 100,
      commissions: Math.round(totalCommissions * 100) / 100,
      tradeDuration,
      tags: [],
      takeProfits,
      notes: '',
    };

    merged.push(mergedTrade);
  }

  return { trades: merged, scaleOutCount };
}
