import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useTradeStore } from '@/stores/useTradeStore';
import { useAccountStore } from '@/stores/useAccountStore';
import { useStrategyStore } from '@/stores/useStrategyStore';
import {
  TrendingUp, Target, BarChart3, Calendar as CalIcon, Trophy, Skull, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, ResponsiveContainer } from 'recharts';

function KpiCard({ title, value, icon: Icon, trend }) {
  const isPositive = typeof value === 'number' ? value >= 0 : true;
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</span>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className={`text-2xl font-bold font-mono ${trend === 'money' ? (isPositive ? 'text-emerald-400' : 'text-red-400') : 'text-foreground'}`}>
          {trend === 'money' ? `${value >= 0 ? '+' : ''}$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : trend === 'percent' ? `${value.toFixed(1)}%` : trend === 'ratio' ? (value === Infinity ? '∞' : value.toFixed(2)) : value}
        </div>
      </CardContent>
    </Card>
  );
}

const MONTH_NAMES_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatPnlShort(pnl) {
  const abs = Math.abs(pnl);
  if (abs >= 1000) return `${pnl >= 0 ? '+' : '-'}$${(abs / 1000).toFixed(1)}k`;
  return `${pnl >= 0 ? '+' : '-'}$${abs.toFixed(0)}`;
}

function CalendarMonth({ year, month, pnlByDay }) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDow = new Date(year, month, 1).getDay();

  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const getColor = (pnl) => {
    if (pnl === undefined) return 'bg-muted/20';
    if (pnl > 500) return 'bg-emerald-500/90';
    if (pnl > 200) return 'bg-emerald-500/60';
    if (pnl > 0) return 'bg-emerald-500/30';
    if (pnl > -200) return 'bg-red-500/30';
    if (pnl > -500) return 'bg-red-500/60';
    return 'bg-red-500/90';
  };

  const monthPnl = useMemo(() => {
    let total = 0;
    let tradingDays = 0;
    let wins = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      if (pnlByDay[dateStr] !== undefined) {
        total += pnlByDay[dateStr];
        tradingDays++;
        if (pnlByDay[dateStr] > 0) wins++;
      }
    }
    return { total, tradingDays, wins };
  }, [pnlByDay, year, month, daysInMonth]);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-sm font-semibold">{MONTH_NAMES_FULL[month]} {year}</span>
          <span className="text-xs text-muted-foreground ml-2">{monthPnl.tradingDays} trading days</span>
        </div>
        {monthPnl.tradingDays > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{monthPnl.wins}W / {monthPnl.tradingDays - monthPnl.wins}L</span>
            <span className={`text-sm font-mono font-bold ${monthPnl.total >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {monthPnl.total >= 0 ? '+' : ''}${monthPnl.total.toFixed(2)}
            </span>
          </div>
        )}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground pb-1 uppercase tracking-wider">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const pnl = pnlByDay[dateStr];
          const hasPnl = pnl !== undefined;
          return (
            <div
              key={dateStr}
              className={`rounded-md p-1 min-h-[3.2rem] flex flex-col items-center justify-center cursor-default transition-colors ${getColor(pnl)} ${hasPnl ? 'ring-1 ring-inset ring-white/10' : ''}`}
              title={hasPnl ? `${dateStr}: $${pnl.toFixed(2)}` : dateStr}
            >
              <span className={`text-[10px] font-medium ${hasPnl ? 'text-foreground' : 'text-muted-foreground/60'}`}>{day}</span>
              {hasPnl && (
                <span className={`text-[9px] font-mono font-bold leading-none mt-0.5 ${pnl >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                  {formatPnlShort(pnl)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CalendarHeatmap({ trades }) {
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());

  const pnlByDay = useMemo(() => {
    const map = {};
    trades.forEach((t) => {
      const d = t.entryDate?.split('T')[0];
      if (d) map[d] = (map[d] || 0) + t.pnl;
    });
    return map;
  }, [trades]);

  const goPrev = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); }
    else setCalMonth((m) => m - 1);
  };

  const goNext = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); }
    else setCalMonth((m) => m + 1);
  };

  const goToday = () => {
    setCalYear(now.getFullYear());
    setCalMonth(now.getMonth());
  };

  const isCurrentMonth = calYear === now.getFullYear() && calMonth === now.getMonth();

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CalIcon className="h-4 w-4" />
            Trading Calendar
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={goPrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs px-3" onClick={goToday} disabled={isCurrentMonth}>
              Today
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={goNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CalendarMonth year={calYear} month={calMonth} pnlByDay={pnlByDay} />
      </CardContent>
    </Card>
  );
}

function PnlBySymbolChart({ trades }) {
  const data = useMemo(() => {
    const map = {};
    trades.forEach((t) => {
      if (t.symbol) map[t.symbol] = (map[t.symbol] || 0) + t.pnl;
    });
    return Object.entries(map)
      .map(([symbol, pnl]) => ({ symbol, pnl: Math.round(pnl * 100) / 100 }))
      .sort((a, b) => b.pnl - a.pnl);
  }, [trades]);

  if (!data.length) return null;

  const chartConfig = { pnl: { label: 'PNL', color: 'hsl(160, 60%, 45%)' } };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">PNL by Symbol</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 0 }} layout="vertical" barSize={20}>
            <defs>
              <linearGradient id="symbolGainGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(160, 60%, 35%)" stopOpacity={0.6} />
                <stop offset="100%" stopColor="hsl(160, 60%, 50%)" stopOpacity={0.95} />
              </linearGradient>
              <linearGradient id="symbolLossGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(0, 70%, 55%)" stopOpacity={0.95} />
                <stop offset="100%" stopColor="hsl(0, 70%, 40%)" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/40" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10 }} className="text-muted-foreground" tickFormatter={(v) => `$${v}`} />
            <YAxis type="category" dataKey="symbol" tick={{ fontSize: 11, fontWeight: 600 }} className="text-muted-foreground" width={55} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="pnl" radius={[0, 8, 8, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.pnl >= 0 ? 'url(#symbolGainGrad)' : 'url(#symbolLossGrad)'} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function PnlByStrategyChart({ trades, strategies }) {
  const data = useMemo(() => {
    const map = {};
    trades.forEach((t) => {
      const name = strategies.find((s) => s.id === t.strategyId)?.name || 'Unassigned';
      map[name] = (map[name] || 0) + t.pnl;
    });
    return Object.entries(map)
      .map(([strategy, pnl]) => ({ strategy, pnl: Math.round(pnl * 100) / 100 }))
      .sort((a, b) => b.pnl - a.pnl);
  }, [trades, strategies]);

  if (!data.length) return null;

  const chartConfig = { pnl: { label: 'PNL', color: 'hsl(210, 60%, 50%)' } };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">PNL by Strategy</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 0 }} layout="vertical" barSize={20}>
            <defs>
              <linearGradient id="stratGainGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(210, 60%, 40%)" stopOpacity={0.6} />
                <stop offset="100%" stopColor="hsl(210, 60%, 55%)" stopOpacity={0.95} />
              </linearGradient>
              <linearGradient id="stratLossGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(0, 70%, 55%)" stopOpacity={0.95} />
                <stop offset="100%" stopColor="hsl(0, 70%, 40%)" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/40" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10 }} className="text-muted-foreground" tickFormatter={(v) => `$${v}`} />
            <YAxis type="category" dataKey="strategy" tick={{ fontSize: 10 }} className="text-muted-foreground" width={115} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="pnl" radius={[0, 8, 8, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.pnl >= 0 ? 'url(#stratGainGrad)' : 'url(#stratLossGrad)'} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function WinLossChart({ trades }) {
  const data = useMemo(() => {
    const wins = trades.filter((t) => t.pnl > 0).length;
    const losses = trades.filter((t) => t.pnl < 0).length;
    const breakeven = trades.filter((t) => t.pnl === 0).length;
    return [
      { name: 'Wins', count: wins },
      { name: 'Losses', count: losses },
      ...(breakeven > 0 ? [{ name: 'B/E', count: breakeven }] : []),
    ];
  }, [trades]);

  if (!trades.length) return null;

  const chartConfig = { count: { label: 'Trades', color: 'hsl(160, 60%, 45%)' } };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Win / Loss</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }} barSize={40}>
            <defs>
              <linearGradient id="winGrad" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="hsl(160, 60%, 35%)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="hsl(160, 60%, 50%)" stopOpacity={0.95} />
              </linearGradient>
              <linearGradient id="lossGrad" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="hsl(0, 70%, 35%)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="hsl(0, 70%, 55%)" stopOpacity={0.95} />
              </linearGradient>
              <linearGradient id="beGrad" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="hsl(45, 80%, 35%)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="hsl(45, 80%, 55%)" stopOpacity={0.95} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/40" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600 }} className="text-muted-foreground" />
            <YAxis tick={{ fontSize: 10 }} className="text-muted-foreground" allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {data.map((d, i) => {
                const fills = ['url(#winGrad)', 'url(#lossGrad)', 'url(#beGrad)'];
                return <Cell key={i} fill={fills[i]} />;
              })}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const RANGE_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: '1w', label: '1 Week' },
  { value: '1m', label: '1 Month' },
  { value: '3m', label: '3 Months' },
  { value: 'ytd', label: 'YTD' },
];

function filterByRange(trades, range) {
  if (range === 'all') return trades;
  const now = new Date();
  let cutoff;
  if (range === '1w') cutoff = new Date(now - 7 * 86400000);
  else if (range === '1m') cutoff = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  else if (range === '3m') cutoff = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
  else if (range === 'ytd') cutoff = new Date(now.getFullYear(), 0, 1);
  else return trades;
  return trades.filter((t) => new Date(t.entryDate) >= cutoff);
}

const cumulativeChartConfig = {
  pnl: { label: 'Cumulative PNL', color: 'hsl(160, 60%, 45%)' },
};

export default function Dashboard() {
  const { trades, stats } = useTradeStore();
  const { accounts } = useAccountStore();
  const { strategies } = useStrategyStore();
  const [range, setRange] = useState('all');
  const [accountFilter, setAccountFilter] = useState('all');

  const filtered = useMemo(() => {
    let t = filterByRange(trades, range);
    if (accountFilter !== 'all') t = t.filter((tr) => tr.accountId === accountFilter);
    return t;
  }, [trades, range, accountFilter]);

  const filteredStats = useMemo(() => {
    if (!filtered.length) return { totalPnl: 0, winRate: 0, profitFactor: 0, totalTrades: 0, bestDay: null, worstDay: null };
    const wins = filtered.filter((t) => t.pnl > 0);
    const losses = filtered.filter((t) => t.pnl < 0);
    const totalWins = wins.reduce((s, t) => s + t.pnl, 0);
    const totalLosses = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
    const byDay = {};
    filtered.forEach((t) => {
      const day = t.entryDate?.split('T')[0];
      if (day) byDay[day] = (byDay[day] || 0) + t.pnl;
    });
    const dayEntries = Object.entries(byDay);
    const bestDay = dayEntries.length ? dayEntries.reduce((a, b) => (b[1] > a[1] ? b : a)) : null;
    const worstDay = dayEntries.length ? dayEntries.reduce((a, b) => (b[1] < a[1] ? b : a)) : null;
    return {
      totalPnl: filtered.reduce((s, t) => s + t.pnl, 0),
      winRate: filtered.length ? (wins.length / filtered.length) * 100 : 0,
      profitFactor: totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0,
      totalTrades: filtered.length,
      bestDay: bestDay ? { date: bestDay[0], pnl: bestDay[1] } : null,
      worstDay: worstDay ? { date: worstDay[0], pnl: worstDay[1] } : null,
    };
  }, [filtered]);

  const cumulativeData = useMemo(() => {
    const sorted = [...filtered].sort((a, b) => new Date(a.entryDate) - new Date(b.entryDate));
    let cumulative = 0;
    return sorted.map((t) => {
      cumulative += t.pnl;
      return { date: t.entryDate?.split('T')[0], pnl: cumulative, trade: t.symbol };
    });
  }, [filtered]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {RANGE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={accountFilter} onValueChange={setAccountFilter}>
          <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue placeholder="All Accounts" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Accounts</SelectItem>
            {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard title="Total PNL" value={filteredStats.totalPnl} icon={TrendingUp} trend="money" />
        <KpiCard title="Win Rate" value={filteredStats.winRate} icon={Target} trend="percent" />
        <KpiCard title="Profit Factor" value={filteredStats.profitFactor} icon={BarChart3} trend="ratio" />
        <KpiCard title="Total Trades" value={filteredStats.totalTrades} icon={BarChart3} trend="count" />
        <KpiCard title="Best Day" value={filteredStats.bestDay?.pnl ?? 0} icon={Trophy} trend="money" />
        <KpiCard title="Worst Day" value={filteredStats.worstDay?.pnl ?? 0} icon={Skull} trend="money" />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Cumulative PNL</CardTitle>
        </CardHeader>
        <CardContent>
          {cumulativeData.length > 0 ? (
            <ChartContainer config={cumulativeChartConfig} className="h-[300px] w-full">
              <AreaChart data={cumulativeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(160, 60%, 45%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(160, 60%, 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 10 }} className="text-muted-foreground" tickFormatter={(v) => `$${v}`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="pnl" stroke="hsl(160, 60%, 45%)" fill="url(#pnlGrad)" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">No trade data for selected filters</div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <PnlBySymbolChart trades={filtered} />
        <PnlByStrategyChart trades={filtered} strategies={strategies} />
        <WinLossChart trades={filtered} />
      </div>

      <CalendarHeatmap trades={filtered} />
    </div>
  );
}
