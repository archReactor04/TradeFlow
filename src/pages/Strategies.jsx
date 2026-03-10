import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useStrategyStore } from '@/stores/useStrategyStore';
import { useTradeStore } from '@/stores/useTradeStore';
import { Plus, Pencil, Trash2, Lightbulb } from 'lucide-react';

export default function Strategies() {
  const { strategies, addStrategy, updateStrategy, deleteStrategy } = useStrategyStore();
  const { trades } = useTradeStore();
  const [dialog, setDialog] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });

  const openNew = () => { setForm({ name: '', description: '' }); setDialog('new'); };
  const openEdit = (s) => { setForm({ name: s.name, description: s.description || '' }); setDialog(s); };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (dialog === 'new') addStrategy(form);
    else updateStrategy(dialog.id, form);
    setDialog(null);
  };

  const getStrategyStats = (id) => {
    const st = trades.filter((t) => t.strategyId === id);
    const wins = st.filter((t) => t.pnl > 0).length;
    return { count: st.length, pnl: st.reduce((s, t) => s + t.pnl, 0), winRate: st.length ? ((wins / st.length) * 100).toFixed(0) : 0 };
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Strategies</h2>
          <p className="text-sm text-muted-foreground">Define and track your trading strategies</p>
        </div>
        <Button onClick={openNew} className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700"><Plus className="h-3 w-3 mr-1" />Add Strategy</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {strategies.map((strat) => {
          const s = getStrategyStats(strat.id);
          return (
            <Card key={strat.id} className="group">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                      <Lightbulb className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-sm">{strat.name}</CardTitle>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(strat)}><Pencil className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400" onClick={() => setDeleteConfirm(strat)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {strat.description && <p className="text-xs text-muted-foreground line-clamp-3">{strat.description}</p>}
                <div className="flex gap-3 text-xs">
                  <div><span className="text-muted-foreground">Trades</span><p className="font-mono font-semibold">{s.count}</p></div>
                  <div><span className="text-muted-foreground">Win Rate</span><p className="font-mono font-semibold">{s.winRate}%</p></div>
                  <div><span className="text-muted-foreground">PNL</span><p className={`font-mono font-semibold ${s.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>${s.pnl.toFixed(2)}</p></div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {strategies.length === 0 && (
          <Card className="col-span-full"><CardContent className="py-10 text-center text-muted-foreground text-sm">No strategies yet. Define your first trading strategy.</CardContent></Card>
        )}
      </div>

      <Dialog open={dialog !== null} onOpenChange={() => setDialog(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{dialog === 'new' ? 'New Strategy' : 'Edit Strategy'}</DialogTitle>
            <DialogDescription>Define your trading strategy rules and criteria.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Strategy Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder='e.g. "Opening Range Breakout"' className="h-8 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Description / Rules</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={5} className="text-sm" placeholder="Entry criteria, exit rules, conditions..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)} className="text-xs">Cancel</Button>
            <Button onClick={handleSave} className="text-xs bg-emerald-600 hover:bg-emerald-700">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Strategy</DialogTitle>
            <DialogDescription>Are you sure you want to delete "{deleteConfirm?.name}"?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="text-xs">Cancel</Button>
            <Button variant="destructive" className="text-xs" onClick={() => { deleteStrategy(deleteConfirm.id); setDeleteConfirm(null); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
