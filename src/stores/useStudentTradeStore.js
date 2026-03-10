import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db';
import { useCallback, useMemo } from 'react';

export function useStudentTradeStore(studentId) {
  const trades = useLiveQuery(
    () => studentId ? db.studentTrades.where('studentId').equals(studentId).toArray() : [],
    [studentId],
    []
  );

  const deleteStudentTrade = useCallback(async (id) => {
    await db.studentTrades.delete(id);
  }, []);

  const stats = useMemo(() => {
    if (!trades.length) return { totalPnl: 0, winRate: 0, profitFactor: 0, totalTrades: 0, totalFees: 0, totalCommissions: 0, netPnl: 0, avgDuration: null };
    const wins = trades.filter(t => t.pnl > 0);
    const losses = trades.filter(t => t.pnl < 0);
    const totalWins = wins.reduce((s, t) => s + t.pnl, 0);
    const totalLosses = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
    const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
    const totalFees = trades.reduce((s, t) => s + (t.fees || 0), 0);
    const totalCommissions = trades.reduce((s, t) => s + (t.commissions || 0), 0);
    const durations = trades.filter(t => t.tradeDuration != null).map(t => t.tradeDuration);
    const avgDuration = durations.length > 0 ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length) : null;

    return {
      totalPnl,
      winRate: (wins.length / trades.length) * 100,
      profitFactor: totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0,
      totalTrades: trades.length,
      totalFees,
      totalCommissions,
      netPnl: totalPnl - totalFees - totalCommissions,
      avgDuration,
    };
  }, [trades]);

  return { trades, deleteStudentTrade, stats };
}
