import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db';
import { useCallback, useMemo } from 'react';

export function useTradeStore() {
  const trades = useLiveQuery(() => db.trades.toArray(), [], []);

  const addTrade = useCallback(async (trade) => {
    const newTrade = { ...trade, id: crypto.randomUUID() };
    await db.trades.add(newTrade);
    return newTrade;
  }, []);

  const updateTrade = useCallback(async (id, updates) => {
    await db.trades.update(id, updates);
  }, []);

  const deleteTrade = useCallback(async (id) => {
    await db.trades.delete(id);
  }, []);

  const importTrades = useCallback(async (newTrades) => {
    const withIds = newTrades.map((t) => ({ ...t, id: t.id || crypto.randomUUID() }));
    await db.trades.bulkAdd(withIds);
  }, []);

  const stats = useMemo(() => {
    if (!trades.length) return { totalPnl: 0, winRate: 0, profitFactor: 0, totalTrades: 0, bestDay: null, worstDay: null, totalFees: 0, totalCommissions: 0, netPnl: 0, avgDuration: null };
    const wins = trades.filter((t) => t.pnl > 0);
    const losses = trades.filter((t) => t.pnl < 0);
    const totalWins = wins.reduce((s, t) => s + t.pnl, 0);
    const totalLosses = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));

    const byDay = {};
    trades.forEach((t) => {
      const day = t.entryDate?.split('T')[0];
      if (day) byDay[day] = (byDay[day] || 0) + t.pnl;
    });
    const dayEntries = Object.entries(byDay);
    const bestDay = dayEntries.length ? dayEntries.reduce((a, b) => (b[1] > a[1] ? b : a)) : null;
    const worstDay = dayEntries.length ? dayEntries.reduce((a, b) => (b[1] < a[1] ? b : a)) : null;

    const totalFees = trades.reduce((s, t) => s + (t.fees || 0), 0);
    const totalCommissions = trades.reduce((s, t) => s + (t.commissions || 0), 0);
    const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);

    const durations = trades.filter((t) => t.tradeDuration != null).map((t) => t.tradeDuration);
    const avgDuration = durations.length > 0 ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length) : null;

    return {
      totalPnl,
      winRate: trades.length ? (wins.length / trades.length) * 100 : 0,
      profitFactor: totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0,
      totalTrades: trades.length,
      bestDay: bestDay ? { date: bestDay[0], pnl: bestDay[1] } : null,
      worstDay: worstDay ? { date: worstDay[0], pnl: worstDay[1] } : null,
      totalFees,
      totalCommissions,
      netPnl: totalPnl - totalFees - totalCommissions,
      avgDuration,
    };
  }, [trades]);

  return { trades, addTrade, updateTrade, deleteTrade, importTrades, stats };
}
