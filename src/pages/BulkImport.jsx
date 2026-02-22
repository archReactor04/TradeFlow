import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { useTradeStore } from '@/stores/useTradeStore';
import { useAccountStore } from '@/stores/useAccountStore';
import { BROKERS, getBroker } from '@/lib/broker-parsers';
import { formatDuration, computeDurationSeconds } from '@/lib/trade-utils';
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, ChevronDown, ChevronRight, Layers, ArrowUpRight, ArrowDownRight, Merge, Undo2, Archive, Calendar } from 'lucide-react';
import { previewZip, importFromZip } from '@/lib/import-utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

function RestoreBackup() {
  const [dragOver, setDragOver] = useState(false);
  const [manifest, setManifest] = useState(null);
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFile = async (f) => {
    if (!f) return;
    setError(null);
    setResult(null);
    try {
      const m = await previewZip(f);
      setManifest(m);
      setFile(f);
    } catch (err) {
      setError(err.message);
      setManifest(null);
      setFile(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setError(null);
    try {
      const res = await importFromZip(file);
      setResult(res);
      setManifest(null);
      setFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  };

  const reset = () => { setManifest(null); setFile(null); setResult(null); setError(null); };

  if (result) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-400 mb-2" />
          <p className="font-medium text-sm">Backup Imported</p>
          <p className="text-xs text-muted-foreground mt-1">
            {result.trades} trades, {result.accounts} accounts, {result.strategies} strategies added
            {result.skipped > 0 && <> ({result.skipped} duplicates skipped)</>}
          </p>
          <Button variant="outline" className="mt-3 text-xs" onClick={reset}>Done</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-1.5"><Archive className="h-4 w-4" /> Restore Backup</CardTitle>
        <CardDescription className="text-xs">Import a TradeFlow backup (.zip) to merge trades into your journal</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && (
          <div className="flex items-center gap-2 text-xs text-red-400">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {error}
          </div>
        )}

        {!manifest && (
          <div
            className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${dragOver ? 'border-emerald-500 bg-emerald-500/5' : 'border-muted'}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.zip';
              input.onchange = (e) => handleFile(e.target.files[0]);
              input.click();
            }}
          >
            <Archive className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
            <p className="text-xs font-medium">Drop a .zip backup here or click to browse</p>
          </div>
        )}

        {manifest && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-md border p-2.5 text-center">
                <p className="text-lg font-bold">{manifest.counts?.trades ?? 0}</p>
                <p className="text-[10px] text-muted-foreground">Trades</p>
              </div>
              <div className="rounded-md border p-2.5 text-center">
                <p className="text-lg font-bold">{manifest.counts?.accounts ?? 0}</p>
                <p className="text-[10px] text-muted-foreground">Accounts</p>
              </div>
              <div className="rounded-md border p-2.5 text-center">
                <p className="text-lg font-bold">{manifest.counts?.strategies ?? 0}</p>
                <p className="text-[10px] text-muted-foreground">Strategies</p>
              </div>
              <div className="rounded-md border p-2.5 text-center">
                <p className="text-lg font-bold">{manifest.counts?.images ?? 0}</p>
                <p className="text-[10px] text-muted-foreground">Images</p>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Exported {new Date(manifest.exportedAt).toLocaleString()}
            </p>
            <div className="flex gap-2">
              <Button onClick={handleImport} disabled={importing} className="text-xs bg-emerald-600 hover:bg-emerald-700">
                {importing ? 'Importing...' : 'Import Backup'}
              </Button>
              <Button variant="outline" className="text-xs" onClick={reset}>Cancel</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function mergeTrades(trades) {
  const sorted = [...trades].sort((a, b) => new Date(a.entryDate) - new Date(b.entryDate));
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

  return {
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
    _merged: true,
    _originalTrades: trades,
  };
}

export default function BulkImport() {
  const { importTrades } = useTradeStore();
  const { accounts } = useAccountStore();
  const [broker, setBroker] = useState('');
  const [accountId, setAccountId] = useState('');
  const [rawText, setRawText] = useState(null);
  const [trades, setTrades] = useState([]);
  const [rawCount, setRawCount] = useState(0);
  const [imported, setImported] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [selected, setSelected] = useState(new Set());
  const [error, setError] = useState(null);
  const [mergeError, setMergeError] = useState(null);

  const parseFile = useCallback((text, brokerName) => {
    setError(null);
    setExpandedRows(new Set());
    setSelected(new Set());
    setMergeError(null);

    try {
      const parser = getBroker(brokerName);
      const parsed = parser.parse(text);
      setTrades(parsed);
      setRawCount(parsed.length);
    } catch (err) {
      setError(`Failed to parse CSV: ${err.message}`);
      setTrades([]);
    }
  }, []);

  const handleFile = useCallback((file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setRawText(e.target.result);
      setImported(false);
      if (broker) parseFile(e.target.result, broker);
    };
    reader.readAsText(file);
  }, [broker, parseFile]);

  const reparse = useCallback((newBroker) => {
    setBroker(newBroker);
    if (rawText) parseFile(rawText, newBroker);
  }, [rawText, parseFile]);

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const toggleSelect = (i) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
    setMergeError(null);
  };

  const toggleSelectAll = () => {
    if (selected.size === trades.length) setSelected(new Set());
    else setSelected(new Set(trades.map((_, i) => i)));
    setMergeError(null);
  };

  const toggleRow = (i) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const canMerge = useMemo(() => {
    if (selected.size < 2) return false;
    const selectedTrades = [...selected].map((i) => trades[i]);
    const symbols = new Set(selectedTrades.map((t) => t.symbol));
    const directions = new Set(selectedTrades.map((t) => t.direction));
    return symbols.size === 1 && directions.size === 1;
  }, [selected, trades]);

  const mergeValidationMessage = useMemo(() => {
    if (selected.size < 2) return null;
    const selectedTrades = [...selected].map((i) => trades[i]);
    const symbols = new Set(selectedTrades.map((t) => t.symbol));
    const directions = new Set(selectedTrades.map((t) => t.direction));
    if (symbols.size > 1) return `Cannot merge: selected trades have different symbols (${[...symbols].join(', ')})`;
    if (directions.size > 1) return `Cannot merge: selected trades have different directions (${[...directions].join(', ')})`;
    return null;
  }, [selected, trades]);

  const handleMerge = () => {
    if (!canMerge) {
      setMergeError(mergeValidationMessage || 'Select 2+ trades with the same symbol and direction');
      return;
    }

    const indices = [...selected].sort((a, b) => a - b);
    const toMerge = indices.map((i) => trades[i]);
    const merged = mergeTrades(toMerge);

    const newTrades = [];
    const indexSet = new Set(indices);
    let inserted = false;
    for (let i = 0; i < trades.length; i++) {
      if (indexSet.has(i)) {
        if (!inserted) {
          newTrades.push(merged);
          inserted = true;
        }
      } else {
        newTrades.push(trades[i]);
      }
    }

    setTrades(newTrades);
    setSelected(new Set());
    setExpandedRows(new Set());
    setMergeError(null);
  };

  const handleUnmerge = (idx) => {
    const trade = trades[idx];
    if (!trade._merged || !trade._originalTrades) return;

    const newTrades = [];
    for (let i = 0; i < trades.length; i++) {
      if (i === idx) {
        newTrades.push(...trade._originalTrades);
      } else {
        newTrades.push(trades[i]);
      }
    }

    setTrades(newTrades);
    setSelected(new Set());
    setExpandedRows(new Set());
  };

  const handleImport = () => {
    if (!trades.length) return;
    const cleaned = trades.map((t) => {
      const { _tradeDay, _account, _merged, _originalTrades, ...rest } = t;
      return { ...rest, accountId: accountId || '' };
    });
    importTrades(cleaned);
    setImported(true);
  };

  const reset = () => {
    setRawText(null);
    setTrades([]);
    setRawCount(0);
    setImported(false);
    setError(null);
    setMergeError(null);
    setExpandedRows(new Set());
    setSelected(new Set());
    setAccountId('');
  };

  const mergedCount = trades.filter((t) => t._merged).length;
  const [backupOpen, setBackupOpen] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Bulk Import</h2>
        <p className="text-sm text-muted-foreground">Import trades from a broker CSV export</p>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3">Broker CSV Import</h3>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="space-y-1.5">
          <Label className="text-xs">Select Broker</Label>
          <Select value={broker} onValueChange={reparse}>
            <SelectTrigger className="h-9 w-64 text-sm">
              <SelectValue placeholder="Choose your broker..." />
            </SelectTrigger>
            <SelectContent>
              {BROKERS.map((b) => (
                <SelectItem key={b.name} value={b.name}>{b.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Import to Account</Label>
          <Select value={accountId} onValueChange={setAccountId}>
            <SelectTrigger className="h-9 w-64 text-sm">
              <SelectValue placeholder="Choose an account..." />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {broker && trades.length === 0 && !imported && !error && (
        <Card
          className={`border-2 border-dashed transition-colors ${dragOver ? 'border-emerald-500 bg-emerald-500/5' : 'border-muted'}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          <CardContent className="py-16 text-center">
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm font-medium mb-1">Drop your {getBroker(broker)?.label} CSV file here</p>
            <p className="text-xs text-muted-foreground mb-4">or click to browse</p>
            <Button variant="outline" className="text-xs" onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.csv';
              input.onchange = (e) => handleFile(e.target.files[0]);
              input.click();
            }}>
              <FileSpreadsheet className="h-3 w-3 mr-1" />Choose File
            </Button>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-500/30">
          <CardContent className="py-6 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto text-red-400 mb-2" />
            <p className="text-sm text-red-400">{error}</p>
            <Button variant="outline" className="mt-3 text-xs" onClick={reset}>Try Again</Button>
          </CardContent>
        </Card>
      )}

      {trades.length > 0 && !imported && (
        <>
          <div className="flex items-center gap-3 flex-wrap text-xs">
            <Badge variant="outline" className="gap-1">
              <FileSpreadsheet className="h-3 w-3" />
              {rawCount} rows parsed
            </Badge>
            <Badge variant="outline" className="gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              {trades.length} trades
            </Badge>
            {mergedCount > 0 && (
              <Badge variant="outline" className="gap-1 border-blue-500/50">
                <Layers className="h-3 w-3 text-blue-400" />
                {mergedCount} merged
              </Badge>
            )}
            {selected.size > 0 && (
              <Badge variant="outline" className="gap-1 border-yellow-500/50">
                {selected.size} selected
              </Badge>
            )}
          </div>

          {selected.size >= 2 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                onClick={handleMerge}
                disabled={!canMerge}
                className="text-xs bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                <Merge className="h-3 w-3 mr-1" />Merge {selected.size} Trades
              </Button>
              {mergeValidationMessage && (
                <span className="text-xs text-red-400">{mergeValidationMessage}</span>
              )}
            </div>
          )}

          {mergeError && (
            <p className="text-xs text-red-400">{mergeError}</p>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Preview ({trades.length} trades)</CardTitle>
              <CardDescription className="text-xs">
                Select trades with checkboxes and click "Merge" to combine scale-outs into a single trade with take-profit levels.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">
                      <Checkbox
                        checked={selected.size === trades.length && trades.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="text-xs w-8"></TableHead>
                    <TableHead className="text-xs">Symbol</TableHead>
                    <TableHead className="text-xs">Dir</TableHead>
                    <TableHead className="text-xs text-right">Entry</TableHead>
                    <TableHead className="text-xs text-right">Exit</TableHead>
                    <TableHead className="text-xs text-right">Size</TableHead>
                    <TableHead className="text-xs text-right">PNL</TableHead>
                    <TableHead className="text-xs text-right">Duration</TableHead>
                    <TableHead className="text-xs text-right">Fees</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trades.map((t, i) => {
                    const hasTP = t.takeProfits?.length > 1;
                    const isExpanded = expandedRows.has(i);
                    const isMerged = t._merged;
                    return (
                      <>
                        <TableRow key={i} className={`${selected.has(i) ? 'bg-accent/30' : ''} ${isMerged ? 'border-l-2 border-l-blue-500' : ''}`}>
                          <TableCell className="w-8">
                            <Checkbox
                              checked={selected.has(i)}
                              onCheckedChange={() => toggleSelect(i)}
                            />
                          </TableCell>
                          <TableCell className="text-center w-8">
                            <div className="flex items-center gap-0.5">
                              {(hasTP || isMerged) ? (
                                <button className="p-0" onClick={() => toggleRow(i)}>
                                  {isExpanded ? <ChevronDown className="h-3 w-3 text-blue-400" /> : <ChevronRight className="h-3 w-3 text-blue-400" />}
                                </button>
                              ) : null}
                              {isMerged && (
                                <Button variant="ghost" size="icon" className="h-5 w-5" title="Unmerge" onClick={(e) => { e.stopPropagation(); handleUnmerge(i); }}>
                                  <Undo2 className="h-3 w-3 text-blue-400" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono font-semibold text-sm">
                            {t.symbol}
                            {(hasTP || isMerged) && <Layers className="h-3 w-3 inline ml-1 text-blue-400" />}
                          </TableCell>
                          <TableCell>
                            {t.direction === 'long'
                              ? <Badge variant="outline" className="text-[10px] border-emerald-500/50 text-emerald-400"><ArrowUpRight className="h-3 w-3 mr-0.5" />Long</Badge>
                              : <Badge variant="outline" className="text-[10px] border-red-500/50 text-red-400"><ArrowDownRight className="h-3 w-3 mr-0.5" />Short</Badge>}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">{t.entryPrice?.toFixed(2)}</TableCell>
                          <TableCell className="text-right font-mono text-xs">{t.exitPrice?.toFixed(2)}</TableCell>
                          <TableCell className="text-right font-mono text-xs">{t.positionSize}</TableCell>
                          <TableCell className={`text-right font-mono font-semibold text-xs ${t.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {t.pnl >= 0 ? '+' : ''}${t.pnl?.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs text-muted-foreground">
                            {formatDuration(t.tradeDuration)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs text-muted-foreground">
                            {(t.fees + t.commissions) > 0 ? `$${(t.fees + t.commissions).toFixed(2)}` : '—'}
                          </TableCell>
                          <TableCell className="text-xs font-mono">{t.entryDate?.split('T')[0]}</TableCell>
                        </TableRow>
                        {(hasTP || isMerged) && isExpanded && t.takeProfits.map((tp, j) => (
                          <TableRow key={`${i}-tp-${j}`} className="bg-muted/30">
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell className="text-[10px] text-muted-foreground pl-4">TP {j + 1}</TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell className="text-right font-mono text-[10px] text-muted-foreground">{tp.price?.toFixed(2)}</TableCell>
                            <TableCell className="text-right font-mono text-[10px] text-muted-foreground">{tp.quantity}</TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell className="text-[10px] font-mono text-muted-foreground">{tp.date?.split('T')[0]}</TableCell>
                          </TableRow>
                        ))}
                      </>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button onClick={handleImport} disabled={trades.length === 0} className="text-xs bg-emerald-600 hover:bg-emerald-700">
              <Upload className="h-3 w-3 mr-1" />Import {trades.length} Trades
            </Button>
            <Button variant="outline" className="text-xs" onClick={reset}>Cancel</Button>
          </div>
        </>
      )}

      {imported && (
        <Card>
          <CardContent className="py-10 text-center">
            <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-400 mb-3" />
            <p className="font-medium">Import Complete!</p>
            <p className="text-sm text-muted-foreground mt-1">{trades.length} trades have been imported.</p>
            <Button variant="outline" className="mt-4 text-xs" onClick={reset}>Import More</Button>
          </CardContent>
        </Card>
      )}

      <div className="border-t pt-4">
        <Collapsible open={backupOpen} onOpenChange={setBackupOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between text-sm">
              <span className="flex items-center gap-2">
                <Archive className="h-4 w-4" />
                Restore from Backup
              </span>
              {backupOpen
                ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <RestoreBackup />
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
