import React, { useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { useTradeStore } from '@/stores/useTradeStore';
import { useAccountStore } from '@/stores/useAccountStore';
import { useStrategyStore } from '@/stores/useStrategyStore';
import { computeDurationSeconds, formatDuration } from '@/lib/trade-utils';
import { compressImage } from '@/lib/image-utils';
import { exportAsCSV, exportAsZip } from '@/lib/export-utils';
import { Plus, Pencil, Trash2, ArrowUpRight, ArrowDownRight, X, ChevronUp, ChevronDown, ChevronRight, Clock, Filter, RotateCcw, ImagePlus, Image as ImageIcon, Target, Download, FileSpreadsheet, Archive, MoreHorizontal } from 'lucide-react';

const EMPTY_TRADE = {
  symbol: '', direction: 'long', entryPrice: '', exitPrice: '', entryDate: '', exitDate: '',
  positionSize: '', strategyId: '', accountId: '', tags: [], notes: '', takeProfits: [], pnl: '',
  fees: '', commissions: '', tradeDuration: null, images: [],
};

const DEFAULT_TAG_SUGGESTIONS = ['breakout', 'earnings', 'mean-reversion', 'momentum', 'swing', 'scalp', 'gap-play', 'revenge-trade', 'FOMO', 'news'];

function TagInput({ tags, onAdd, onRemove, allTrades }) {
  const [input, setInput] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const allExistingTags = useMemo(() => {
    const set = new Set(DEFAULT_TAG_SUGGESTIONS);
    allTrades.forEach(t => t.tags?.forEach(tag => set.add(tag)));
    return [...set].sort();
  }, [allTrades]);

  const filtered = useMemo(() => {
    const q = input.trim().toLowerCase();
    return allExistingTags
      .filter(t => !tags.includes(t))
      .filter(t => !q || t.includes(q));
  }, [input, allExistingTags, tags]);

  const handleAdd = (tag) => {
    const t = (tag || input).trim().toLowerCase();
    if (t && !tags.includes(t)) onAdd(t);
    setInput('');
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (input.trim()) handleAdd();
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const handleBlur = (e) => {
    if (dropdownRef.current?.contains(e.relatedTarget)) return;
    setTimeout(() => setShowDropdown(false), 150);
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-xs">Tags</Label>
      <div className="flex flex-wrap gap-1 mb-1">
        {tags.map((t) => (
          <Badge key={t} variant="secondary" className="text-xs gap-1 cursor-pointer" onClick={() => onRemove(t)}>
            {t} <X className="h-3 w-3" />
          </Badge>
        ))}
      </div>
      <div className="relative">
        <div className="flex gap-1">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => { setInput(e.target.value); setShowDropdown(true); }}
            onFocus={() => setShowDropdown(true)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="Type to search or add tag..."
            className="h-7 text-xs flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs px-2 shrink-0"
            disabled={!input.trim()}
            onClick={() => handleAdd()}
          >
            <Plus className="h-3 w-3 mr-0.5" /> Add
          </Button>
        </div>
        {showDropdown && filtered.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-50 top-full left-0 right-0 mt-1 max-h-36 overflow-y-auto bg-popover border rounded-md shadow-lg"
          >
            {filtered.slice(0, 15).map((tag) => (
              <button
                key={tag}
                type="button"
                className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-accent transition-colors flex items-center justify-between"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleAdd(tag)}
              >
                <span>{input.trim() ? highlightMatch(tag, input.trim()) : tag}</span>
                {!allExistingTags.includes(tag) && <span className="text-[10px] text-muted-foreground">new</span>}
              </button>
            ))}
            {input.trim() && !allExistingTags.some(t => t === input.trim().toLowerCase()) && (
              <button
                type="button"
                className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-accent transition-colors text-emerald-400 border-t"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleAdd()}
              >
                + Create "{input.trim().toLowerCase()}"
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function highlightMatch(text, query) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="font-semibold text-foreground">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
}

function ImageUpload({ images, onAdd, onRemove }) {
  const fileRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewIdx, setPreviewIdx] = useState(null);
  const maxImages = 2;
  const isFull = images.length >= maxImages;

  const handleFiles = async (files) => {
    for (const file of files) {
      if (images.length >= maxImages) break;
      if (!file.type.startsWith('image/')) continue;
      try {
        const dataUrl = await compressImage(file);
        onAdd(dataUrl);
      } catch { /* skip bad files */ }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) handleFiles([...e.dataTransfer.files]);
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-xs flex items-center gap-1.5">
        <ImageIcon className="h-3 w-3" /> Chart Screenshots <span className="text-muted-foreground font-normal">({images.length}/{maxImages})</span>
      </Label>

      {images.length > 0 && (
        <div className="flex gap-2">
          {images.map((img, i) => (
            <div key={i} className="relative group">
              <img
                src={img}
                alt={`Chart ${i + 1}`}
                className="h-20 w-32 object-cover rounded-md border cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setPreviewIdx(i)}
              />
              <button
                type="button"
                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onRemove(i)}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        className={`border-2 border-dashed rounded-md p-3 text-center cursor-pointer transition-colors ${dragOver ? 'border-emerald-500 bg-emerald-500/10' : 'border-muted-foreground/25 hover:border-muted-foreground/50'} ${isFull ? 'opacity-40 pointer-events-none' : ''}`}
        onClick={() => !isFull && fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <ImagePlus className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
        <p className="text-[10px] text-muted-foreground">
          {isFull ? 'Maximum 2 images attached' : 'Click or drag & drop chart screenshots'}
        </p>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => { if (e.target.files.length) handleFiles([...e.target.files]); e.target.value = ''; }}
      />

      {previewIdx !== null && (
        <Dialog open onOpenChange={() => setPreviewIdx(null)}>
          <DialogContent className="max-w-3xl p-2">
            <img src={images[previewIdx]} alt="Chart preview" className="w-full rounded" />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function TradeDetail({ trade: t, strategyName, accountName }) {
  const [previewImg, setPreviewImg] = useState(null);
  const images = t.images || [];
  const tps = t.takeProfits || [];
  const hasFees = (t.fees || 0) > 0 || (t.commissions || 0) > 0;

  return (
    <div className="px-6 py-4 space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Entry Price</p>
          <p className="text-sm font-mono font-semibold">${t.entryPrice?.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Exit Price</p>
          <p className="text-sm font-mono font-semibold">${t.exitPrice?.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Position Size</p>
          <p className="text-sm font-mono font-semibold">{t.positionSize}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Duration</p>
          <p className="text-sm font-mono font-semibold">{formatDuration(t.tradeDuration)}</p>
        </div>
        {hasFees && (
          <>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Fees</p>
              <p className="text-sm font-mono">${(t.fees || 0).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Commissions</p>
              <p className="text-sm font-mono">${(t.commissions || 0).toFixed(2)}</p>
            </div>
          </>
        )}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Entry Time</p>
          <p className="text-xs font-mono text-muted-foreground">{t.entryDate?.replace('T', ' ')}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Exit Time</p>
          <p className="text-xs font-mono text-muted-foreground">{t.exitDate?.replace('T', ' ')}</p>
        </div>
      </div>

      {tps.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
            <Target className="h-3 w-3" /> Take-Profit Levels
          </p>
          <div className="flex flex-wrap gap-2">
            {tps.map((tp, j) => (
              <div key={j} className="rounded-md border px-3 py-1.5 text-xs font-mono bg-background">
                <span className="text-muted-foreground">TP{j + 1}</span>{' '}
                <span className="font-semibold">${Number(tp.price).toFixed(2)}</span>{' '}
                <span className="text-muted-foreground">x{tp.quantity}</span>
                {tp.date && <span className="text-muted-foreground ml-1.5">({tp.date.split('T')[0]})</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {t.notes && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Notes</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{t.notes}</p>
        </div>
      )}

      {images.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
            <ImageIcon className="h-3 w-3" /> Chart Screenshots
          </p>
          <div className="flex gap-3">
            {images.map((img, j) => (
              <img
                key={j}
                src={img}
                alt={`Chart ${j + 1}`}
                className="h-28 w-44 object-cover rounded-md border cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setPreviewImg(img)}
              />
            ))}
          </div>
        </div>
      )}

      {previewImg && (
        <Dialog open onOpenChange={() => setPreviewImg(null)}>
          <DialogContent className="max-w-3xl p-2">
            <img src={previewImg} alt="Chart preview" className="w-full rounded" />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function TradeForm({ initial, onSave, onCancel, accounts, strategies, allTrades }) {
  const [form, setForm] = useState(() => {
    const base = initial || { ...EMPTY_TRADE };
    return { ...EMPTY_TRADE, ...base, images: base.images || [] };
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const computedPnl = useMemo(() => {
    const entry = parseFloat(form.entryPrice);
    const exit = parseFloat(form.exitPrice);
    const size = parseFloat(form.positionSize);
    if (isNaN(entry) || isNaN(exit) || isNaN(size)) return null;
    return form.direction === 'long' ? (exit - entry) * size : (entry - exit) * size;
  }, [form.entryPrice, form.exitPrice, form.positionSize, form.direction]);

  const autoDuration = useMemo(() => {
    return computeDurationSeconds(form.entryDate, form.exitDate);
  }, [form.entryDate, form.exitDate]);

  const handleSubmit = () => {
    const pnl = form.pnl !== '' && form.pnl !== null ? parseFloat(form.pnl) : computedPnl ?? 0;
    const tradeDuration = autoDuration ?? (form.tradeDuration ? parseInt(form.tradeDuration) : null);
    onSave({
      ...form,
      entryPrice: parseFloat(form.entryPrice),
      exitPrice: parseFloat(form.exitPrice),
      positionSize: parseFloat(form.positionSize),
      pnl,
      fees: parseFloat(form.fees) || 0,
      commissions: parseFloat(form.commissions) || 0,
      tradeDuration,
    });
  };

  const addTakeProfit = () => set('takeProfits', [...form.takeProfits, { price: '', quantity: '', date: '' }]);
  const updateTP = (i, field, val) => {
    const tps = [...form.takeProfits];
    tps[i] = { ...tps[i], [field]: val };
    set('takeProfits', tps);
  };
  const removeTP = (i) => set('takeProfits', form.takeProfits.filter((_, j) => j !== i));

  return (
    <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-10rem)] pr-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Symbol *</Label>
          <Input value={form.symbol} onChange={(e) => set('symbol', e.target.value.toUpperCase())} placeholder="AAPL" className="h-8 text-sm font-mono" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Direction</Label>
          <div className="flex gap-1">
            <Button type="button" size="sm" variant={form.direction === 'long' ? 'default' : 'outline'} className={`flex-1 h-8 text-xs ${form.direction === 'long' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`} onClick={() => set('direction', 'long')}>Long</Button>
            <Button type="button" size="sm" variant={form.direction === 'short' ? 'default' : 'outline'} className={`flex-1 h-8 text-xs ${form.direction === 'short' ? 'bg-red-600 hover:bg-red-700' : ''}`} onClick={() => set('direction', 'short')}>Short</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Entry Price</Label>
          <Input type="number" step="0.01" value={form.entryPrice} onChange={(e) => set('entryPrice', e.target.value)} className="h-8 text-sm font-mono" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Exit Price</Label>
          <Input type="number" step="0.01" value={form.exitPrice} onChange={(e) => set('exitPrice', e.target.value)} className="h-8 text-sm font-mono" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Entry Date/Time</Label>
          <Input type="datetime-local" value={form.entryDate?.slice(0, 16)} onChange={(e) => set('entryDate', e.target.value)} className="h-8 text-xs" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Exit Date/Time</Label>
          <Input type="datetime-local" value={form.exitDate?.slice(0, 16)} onChange={(e) => set('exitDate', e.target.value)} className="h-8 text-xs" />
        </div>
      </div>

      {autoDuration && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          Duration: {formatDuration(autoDuration)}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Position Size</Label>
          <Input type="number" value={form.positionSize} onChange={(e) => set('positionSize', e.target.value)} className="h-8 text-sm font-mono" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">PNL {computedPnl !== null && <span className="text-muted-foreground">(auto: ${computedPnl.toFixed(2)})</span>}</Label>
          <Input type="number" step="0.01" value={form.pnl} onChange={(e) => set('pnl', e.target.value)} placeholder="Auto-calculated" className="h-8 text-sm font-mono" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Fees</Label>
          <Input type="number" step="0.01" value={form.fees} onChange={(e) => set('fees', e.target.value)} placeholder="0.00" className="h-8 text-sm font-mono" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Commissions</Label>
          <Input type="number" step="0.01" value={form.commissions} onChange={(e) => set('commissions', e.target.value)} placeholder="0.00" className="h-8 text-sm font-mono" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Account</Label>
          <Select value={form.accountId} onValueChange={(v) => set('accountId', v)}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>{accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Strategy</Label>
          <Select value={form.strategyId} onValueChange={(v) => set('strategyId', v)}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>{strategies.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <TagInput
        tags={form.tags}
        onAdd={(tag) => set('tags', [...form.tags, tag])}
        onRemove={(tag) => set('tags', form.tags.filter(x => x !== tag))}
        allTrades={allTrades}
      />

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Take-Profit Levels</Label>
          <Button type="button" variant="ghost" size="sm" className="h-6 text-xs" onClick={addTakeProfit}><Plus className="h-3 w-3 mr-1" />Add TP</Button>
        </div>
        {form.takeProfits.map((tp, i) => (
          <div key={i} className="flex gap-2 items-end">
            <div className="flex-1 space-y-1"><Label className="text-[10px] text-muted-foreground">Price</Label><Input type="number" step="0.01" value={tp.price} onChange={(e) => updateTP(i, 'price', e.target.value)} className="h-7 text-xs font-mono" /></div>
            <div className="flex-1 space-y-1"><Label className="text-[10px] text-muted-foreground">Qty</Label><Input type="number" value={tp.quantity} onChange={(e) => updateTP(i, 'quantity', e.target.value)} className="h-7 text-xs font-mono" /></div>
            <div className="flex-1 space-y-1"><Label className="text-[10px] text-muted-foreground">Date</Label><Input type="datetime-local" value={tp.date?.slice(0, 16)} onChange={(e) => updateTP(i, 'date', e.target.value)} className="h-7 text-[10px]" /></div>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeTP(i)}><X className="h-3 w-3" /></Button>
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Notes</Label>
        <Textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={3} className="text-sm" placeholder="Trade rationale, lessons learned..." />
      </div>

      <ImageUpload
        images={form.images || []}
        onAdd={(img) => set('images', [...(form.images || []), img])}
        onRemove={(idx) => set('images', (form.images || []).filter((_, i) => i !== idx))}
      />

      <div className="flex gap-2 pt-2">
        <Button onClick={handleSubmit} className="flex-1 h-8 text-xs bg-emerald-600 hover:bg-emerald-700">Save Trade</Button>
        <Button variant="outline" onClick={onCancel} className="h-8 text-xs">Cancel</Button>
      </div>
    </div>
  );
}

export default function TradeLog() {
  const { trades, addTrade, updateTrade, deleteTrade } = useTradeStore();
  const { accounts } = useAccountStore();
  const { strategies } = useStrategyStore();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [selected, setSelected] = useState(new Set());

  const toggleExpand = (id) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const [sortKey, setSortKey] = useState('entryDate');
  const [sortDir, setSortDir] = useState('desc');
  const [filterSymbol, setFilterSymbol] = useState('');
  const [filterDirection, setFilterDirection] = useState('all');
  const [filterResult, setFilterResult] = useState('all');
  const [filterStrategy, setFilterStrategy] = useState('all');
  const [filterTag, setFilterTag] = useState('all');
  const [filterAccount, setFilterAccount] = useState('all');

  const allTags = useMemo(() => {
    const set = new Set();
    trades.forEach(t => t.tags?.forEach(tag => set.add(tag)));
    return [...set].sort();
  }, [trades]);

  const hasActiveFilters = filterSymbol || filterDirection !== 'all' || filterResult !== 'all' || filterStrategy !== 'all' || filterTag !== 'all' || filterAccount !== 'all';

  const clearFilters = () => {
    setFilterSymbol('');
    setFilterDirection('all');
    setFilterResult('all');
    setFilterStrategy('all');
    setFilterTag('all');
    setFilterAccount('all');
  };

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  };
  const SortIcon = ({ col }) => sortKey === col ? (sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : null;

  const sorted = useMemo(() => {
    let t = [...trades];
    if (filterSymbol) t = t.filter((tr) => tr.symbol.toLowerCase().includes(filterSymbol.toLowerCase()));
    if (filterDirection !== 'all') t = t.filter(tr => tr.direction === filterDirection);
    if (filterResult === 'win') t = t.filter(tr => tr.pnl > 0);
    if (filterResult === 'loss') t = t.filter(tr => tr.pnl < 0);
    if (filterStrategy !== 'all') t = t.filter(tr => tr.strategyId === filterStrategy);
    if (filterTag !== 'all') t = t.filter(tr => tr.tags?.includes(filterTag));
    if (filterAccount !== 'all') t = t.filter(tr => tr.accountId === filterAccount);
    t.sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey];
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return t;
  }, [trades, sortKey, sortDir, filterSymbol, filterDirection, filterResult, filterStrategy, filterTag, filterAccount]);

  const selectedTrades = useMemo(() => sorted.filter(t => selected.has(t.id)), [sorted, selected]);

  const toggleSelectAll = () => {
    if (selected.size === sorted.length && sorted.length > 0) setSelected(new Set());
    else setSelected(new Set(sorted.map(t => t.id)));
  };

  const handleSave = (data) => {
    if (editingTrade) updateTrade(editingTrade.id, data);
    else addTrade(data);
    setSheetOpen(false);
    setEditingTrade(null);
  };

  const handleBulkDelete = async () => {
    for (const id of selected) await deleteTrade(id);
    setSelected(new Set());
    setBulkDeleteOpen(false);
  };

  const openEdit = (trade) => { setEditingTrade(trade); setSheetOpen(true); };
  const openNew = () => { setEditingTrade(null); setSheetOpen(true); };

  const strategyName = (id) => strategies.find((s) => s.id === id)?.name ?? '—';
  const accountName = (id) => accounts.find((a) => a.id === id)?.name ?? '—';

  return (
    <div className="p-6 space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap flex-1">
            <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <Input value={filterSymbol} onChange={(e) => setFilterSymbol(e.target.value)} placeholder="Symbol..." className="h-8 w-32 text-xs" />
            <Select value={filterDirection} onValueChange={setFilterDirection}>
              <SelectTrigger className="h-8 w-[110px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Directions</SelectItem>
                <SelectItem value="long">Long</SelectItem>
                <SelectItem value="short">Short</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterResult} onValueChange={setFilterResult}>
              <SelectTrigger className="h-8 w-[100px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Win / Loss</SelectItem>
                <SelectItem value="win">Winners</SelectItem>
                <SelectItem value="loss">Losers</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStrategy} onValueChange={setFilterStrategy}>
              <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Strategies</SelectItem>
                {strategies.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterAccount} onValueChange={setFilterAccount}>
              <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
              </SelectContent>
            </Select>
            {allTags.length > 0 && (
              <Select value={filterTag} onValueChange={setFilterTag}>
                <SelectTrigger className="h-8 w-[110px] text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {allTags.map((tag) => <SelectItem key={tag} value={tag}>{tag}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground" onClick={clearFilters}>
                <RotateCcw className="h-3 w-3 mr-1" /> Clear
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {(hasActiveFilters || selected.size > 0) && (
              <span className="text-xs text-muted-foreground">
                {selected.size > 0
                  ? <>{selected.size} selected <button className="underline ml-1 hover:text-foreground" onClick={() => setSelected(new Set())}>clear</button></>
                  : <>{sorted.length} of {trades.length} trades</>}
              </span>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-8 text-xs">
                  <MoreHorizontal className="h-3 w-3 mr-1" />Actions
                  {selected.size > 0 && <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">{selected.size}</Badge>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {selected.size > 0 && (
                  <>
                    <DropdownMenuItem onClick={() => exportAsCSV(selectedTrades, strategies, accounts)} className="text-xs font-medium">
                      <FileSpreadsheet className="h-3.5 w-3.5 mr-2" /> Export Selected CSV ({selected.size})
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportAsZip(selectedTrades, strategies, accounts)} className="text-xs font-medium">
                      <Archive className="h-3.5 w-3.5 mr-2" /> Export Selected Backup ({selected.size})
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setBulkDeleteOpen(true)} className="text-xs font-medium text-red-400 focus:text-red-400">
                      <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Selected ({selected.size})
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={() => exportAsCSV(sorted, strategies, accounts)} className="text-xs">
                  <FileSpreadsheet className="h-3.5 w-3.5 mr-2" /> Export CSV {hasActiveFilters ? `(${sorted.length} trades)` : '(all)'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportAsZip(trades, strategies, accounts)} className="text-xs">
                  <Archive className="h-3.5 w-3.5 mr-2" /> Full Backup (.zip)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={openNew} className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700"><Plus className="h-3 w-3 mr-1" />Add Trade</Button>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8 px-2">
                  <Checkbox
                    checked={sorted.length > 0 && selected.size === sorted.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-8"></TableHead>
                <TableHead className="cursor-pointer text-xs" onClick={() => toggleSort('entryDate')}>Date <SortIcon col="entryDate" /></TableHead>
                <TableHead className="cursor-pointer text-xs" onClick={() => toggleSort('symbol')}>Symbol <SortIcon col="symbol" /></TableHead>
                <TableHead className="cursor-pointer text-xs" onClick={() => toggleSort('direction')}>Dir <SortIcon col="direction" /></TableHead>
                <TableHead className="cursor-pointer text-xs text-right" onClick={() => toggleSort('pnl')}>PNL <SortIcon col="pnl" /></TableHead>
                <TableHead className="cursor-pointer text-xs text-right hidden sm:table-cell" onClick={() => toggleSort('tradeDuration')}>Duration <SortIcon col="tradeDuration" /></TableHead>
                <TableHead className="text-xs hidden lg:table-cell">Strategy</TableHead>
                <TableHead className="text-xs hidden md:table-cell">Tags</TableHead>
                <TableHead className="text-xs text-right">Account</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.length === 0 && (
                <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground py-8 text-sm">No trades yet. Click "Add Trade" to get started.</TableCell></TableRow>
              )}
              {sorted.map((t) => {
                const isExpanded = expandedRows.has(t.id);
                return (
                  <React.Fragment key={t.id}>
                    <TableRow className={`group cursor-pointer ${selected.has(t.id) ? 'bg-accent/30' : ''}`} onClick={() => toggleExpand(t.id)}>
                      <TableCell className="w-8 px-2" onClick={e => e.stopPropagation()}>
                        <Checkbox checked={selected.has(t.id)} onCheckedChange={() => toggleSelect(t.id)} />
                      </TableCell>
                      <TableCell className="w-8 px-2">
                        {isExpanded
                          ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                          : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                      </TableCell>
                      <TableCell className="text-xs font-mono">{t.entryDate?.split('T')[0]}</TableCell>
                      <TableCell className="font-mono font-semibold text-sm">{t.symbol}</TableCell>
                      <TableCell>
                        {t.direction === 'long'
                          ? <Badge variant="outline" className="text-[10px] border-emerald-500/50 text-emerald-400"><ArrowUpRight className="h-3 w-3 mr-0.5" />Long</Badge>
                          : <Badge variant="outline" className="text-[10px] border-red-500/50 text-red-400"><ArrowDownRight className="h-3 w-3 mr-0.5" />Short</Badge>}
                      </TableCell>
                      <TableCell className={`text-right font-mono font-semibold text-sm ${t.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {t.pnl >= 0 ? '+' : ''}${t.pnl?.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground font-mono hidden sm:table-cell">
                        {formatDuration(t.tradeDuration)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{strategyName(t.strategyId)}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex gap-1 flex-wrap">{t.tags?.map((tag) => <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>)}</div>
                      </TableCell>
                      <TableCell className="text-right relative" onClick={(e) => e.stopPropagation()}>
                        <span className="text-xs text-muted-foreground group-hover:invisible">{accountName(t.accountId)}</span>
                        <div className="absolute inset-0 flex gap-1 items-center justify-end pr-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEdit(t)}><Pencil className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-300" onClick={() => setDeleteDialog(t)}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableCell colSpan={10} className="p-0">
                          <TradeDetail trade={t} strategyName={strategyName} accountName={accountName} />
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingTrade ? 'Edit Trade' : 'New Trade'}</SheetTitle>
            <SheetDescription>{editingTrade ? `Editing ${editingTrade.symbol}` : 'Enter your trade details'}</SheetDescription>
          </SheetHeader>
          <div className="py-4">
            <TradeForm
              initial={editingTrade ? { ...editingTrade, entryPrice: String(editingTrade.entryPrice), exitPrice: String(editingTrade.exitPrice), positionSize: String(editingTrade.positionSize), pnl: String(editingTrade.pnl), fees: String(editingTrade.fees ?? ''), commissions: String(editingTrade.commissions ?? '') } : null}
              onSave={handleSave}
              onCancel={() => { setSheetOpen(false); setEditingTrade(null); }}
              accounts={accounts}
              strategies={strategies}
              allTrades={trades}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Trade</DialogTitle>
            <DialogDescription>Are you sure you want to delete this {deleteDialog?.symbol} trade? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)} className="text-xs">Cancel</Button>
            <Button variant="destructive" className="text-xs" onClick={() => { deleteTrade(deleteDialog.id); setDeleteDialog(null); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {selected.size} Trade{selected.size !== 1 ? 's' : ''}</DialogTitle>
            <DialogDescription>Are you sure you want to delete {selected.size} selected trade{selected.size !== 1 ? 's' : ''}? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDeleteOpen(false)} className="text-xs">Cancel</Button>
            <Button variant="destructive" className="text-xs" onClick={handleBulkDelete}>Delete {selected.size} Trade{selected.size !== 1 ? 's' : ''}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
