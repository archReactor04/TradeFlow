import { formatDuration } from '@/lib/trade-utils';

const MAX_DETAILED_TRADES = 50;

function fmtMoney(v) {
  if (v == null) return 'N/A';
  return `$${v.toFixed(2)}`;
}

function fmtPct(v) {
  if (v == null) return 'N/A';
  return `${v.toFixed(1)}%`;
}

function computeStreaks(sorted) {
  let maxWin = 0, maxLoss = 0, curWin = 0, curLoss = 0;
  for (const t of sorted) {
    if (t.pnl > 0) { curWin++; curLoss = 0; maxWin = Math.max(maxWin, curWin); }
    else if (t.pnl < 0) { curLoss++; curWin = 0; maxLoss = Math.max(maxLoss, curLoss); }
    else { curWin = 0; curLoss = 0; }
  }
  return { maxWin, maxLoss };
}

function buildSymbolBreakdown(trades) {
  const map = {};
  for (const t of trades) {
    if (!t.symbol) continue;
    if (!map[t.symbol]) map[t.symbol] = { wins: 0, losses: 0, pnl: 0, count: 0 };
    map[t.symbol].count++;
    map[t.symbol].pnl += t.pnl;
    if (t.pnl > 0) map[t.symbol].wins++;
    else if (t.pnl < 0) map[t.symbol].losses++;
  }
  return Object.entries(map)
    .sort((a, b) => b[1].pnl - a[1].pnl)
    .map(([sym, d]) => `  ${sym}: ${d.count} trades, PNL ${fmtMoney(d.pnl)}, WR ${fmtPct(d.count ? (d.wins / d.count) * 100 : 0)}`)
    .join('\n');
}

function buildStrategyBreakdown(trades, strategies) {
  const map = {};
  for (const t of trades) {
    const name = strategies.find(s => s.id === t.strategyId)?.name || 'Unassigned';
    if (!map[name]) map[name] = { wins: 0, losses: 0, pnl: 0, count: 0 };
    map[name].count++;
    map[name].pnl += t.pnl;
    if (t.pnl > 0) map[name].wins++;
    else if (t.pnl < 0) map[name].losses++;
  }
  return Object.entries(map)
    .sort((a, b) => b[1].pnl - a[1].pnl)
    .map(([name, d]) => `  ${name}: ${d.count} trades, PNL ${fmtMoney(d.pnl)}, WR ${fmtPct(d.count ? (d.wins / d.count) * 100 : 0)}`)
    .join('\n');
}

function buildDayOfWeekBreakdown(trades) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const map = {};
  for (const d of days) map[d] = { count: 0, pnl: 0 };
  for (const t of trades) {
    if (!t.entryDate) continue;
    const dow = days[new Date(t.entryDate).getDay()];
    map[dow].count++;
    map[dow].pnl += t.pnl;
  }
  return Object.entries(map)
    .filter(([, d]) => d.count > 0)
    .map(([day, d]) => `  ${day}: ${d.count} trades, PNL ${fmtMoney(d.pnl)}, Avg ${fmtMoney(d.count ? d.pnl / d.count : 0)}`)
    .join('\n');
}

function buildDirectionBreakdown(trades) {
  const longs = trades.filter(t => t.direction === 'long');
  const shorts = trades.filter(t => t.direction === 'short');
  const fmt = (arr, label) => {
    const pnl = arr.reduce((s, t) => s + t.pnl, 0);
    const wins = arr.filter(t => t.pnl > 0).length;
    return `  ${label}: ${arr.length} trades, PNL ${fmtMoney(pnl)}, WR ${fmtPct(arr.length ? (wins / arr.length) * 100 : 0)}`;
  };
  return [fmt(longs, 'Long'), fmt(shorts, 'Short')].join('\n');
}

function formatTrade(t, strategies, accounts) {
  const stratName = strategies.find(s => s.id === t.strategyId)?.name || 'N/A';
  const acctName = accounts.find(a => a.id === t.accountId)?.name || 'N/A';
  const dur = t.tradeDuration != null ? formatDuration(t.tradeDuration) : 'N/A';
  const tps = t.takeProfits?.length
    ? t.takeProfits.map(tp => `${tp.quantity}@${tp.price}`).join(', ')
    : 'none';
  return `  ${t.entryDate?.split('T')[0] || '?'} | ${t.symbol} ${t.direction?.toUpperCase()} | Entry ${t.entryPrice} -> Exit ${t.exitPrice} | Size ${t.positionSize} | PNL ${fmtMoney(t.pnl)} | Fees ${fmtMoney(t.fees || 0)} | Duration ${dur} | Strategy: ${stratName} | Account: ${acctName} | TPs: ${tps}${t.notes ? ' | Notes: ' + t.notes.slice(0, 80) : ''}`;
}

export function buildTradeContext(trades, strategies, accounts) {
  if (!trades || trades.length === 0) {
    return 'The user has no trades in their journal yet.';
  }

  const sorted = [...trades].sort((a, b) => new Date(a.entryDate) - new Date(b.entryDate));
  const wins = sorted.filter(t => t.pnl > 0);
  const losses = sorted.filter(t => t.pnl < 0);
  const totalPnl = sorted.reduce((s, t) => s + t.pnl, 0);
  const totalWins = wins.reduce((s, t) => s + t.pnl, 0);
  const totalLosses = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
  const totalFees = sorted.reduce((s, t) => s + (t.fees || 0), 0);
  const totalComm = sorted.reduce((s, t) => s + (t.commissions || 0), 0);
  const streaks = computeStreaks(sorted);

  const durations = sorted.filter(t => t.tradeDuration != null).map(t => t.tradeDuration);
  const avgDuration = durations.length > 0 ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length) : null;

  const avgWin = wins.length ? totalWins / wins.length : 0;
  const avgLoss = losses.length ? totalLosses / losses.length : 0;

  const recentTrades = sorted.slice(-MAX_DETAILED_TRADES);
  const olderCount = sorted.length - recentTrades.length;

  const sections = [];

  sections.push(`=== PORTFOLIO SUMMARY ===
Total trades: ${sorted.length}
Date range: ${sorted[0]?.entryDate?.split('T')[0] || '?'} to ${sorted[sorted.length - 1]?.entryDate?.split('T')[0] || '?'}
Total PNL (gross): ${fmtMoney(totalPnl)}
Total fees: ${fmtMoney(totalFees)} | Total commissions: ${fmtMoney(totalComm)}
Net PNL: ${fmtMoney(totalPnl - totalFees - totalComm)}
Wins: ${wins.length} | Losses: ${losses.length} | Breakeven: ${sorted.length - wins.length - losses.length}
Win rate: ${fmtPct(sorted.length ? (wins.length / sorted.length) * 100 : 0)}
Profit factor: ${totalLosses > 0 ? (totalWins / totalLosses).toFixed(2) : 'N/A'}
Avg win: ${fmtMoney(avgWin)} | Avg loss: ${fmtMoney(avgLoss)}
Avg win/loss ratio: ${avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : 'N/A'}
Longest win streak: ${streaks.maxWin} | Longest loss streak: ${streaks.maxLoss}
Avg trade duration: ${avgDuration != null ? formatDuration(avgDuration) : 'N/A'}
Strategies: ${strategies.map(s => s.name).join(', ') || 'None'}
Accounts: ${accounts.map(a => a.name).join(', ') || 'None'}`);

  sections.push(`=== BY SYMBOL ===\n${buildSymbolBreakdown(sorted)}`);
  sections.push(`=== BY STRATEGY ===\n${buildStrategyBreakdown(sorted, strategies)}`);
  sections.push(`=== BY DIRECTION ===\n${buildDirectionBreakdown(sorted)}`);
  sections.push(`=== BY DAY OF WEEK ===\n${buildDayOfWeekBreakdown(sorted)}`);

  if (olderCount > 0) {
    const older = sorted.slice(0, olderCount);
    const olderPnl = older.reduce((s, t) => s + t.pnl, 0);
    const olderWins = older.filter(t => t.pnl > 0).length;
    sections.push(`=== OLDER TRADES SUMMARY (${olderCount} trades, not shown individually) ===
PNL: ${fmtMoney(olderPnl)} | Win rate: ${fmtPct(olderCount ? (olderWins / olderCount) * 100 : 0)}`);
  }

  sections.push(`=== RECENT TRADES (last ${recentTrades.length}) ===\n${recentTrades.map(t => formatTrade(t, strategies, accounts)).join('\n')}`);

  return sections.join('\n\n');
}
