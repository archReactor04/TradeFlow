import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useAccountStore } from '@/stores/useAccountStore';
import { useTradeStore } from '@/stores/useTradeStore';
import { Plus, Pencil, Trash2, Wallet } from 'lucide-react';

export default function Accounts() {
  const { accounts, addAccount, updateAccount, deleteAccount } = useAccountStore();
  const { trades } = useTradeStore();
  const [dialog, setDialog] = useState(null); // 'new' | account obj | null
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [name, setName] = useState('');

  const openNew = () => { setName(''); setDialog('new'); };
  const openEdit = (acc) => { setName(acc.name); setDialog(acc); };

  const handleSave = () => {
    if (!name.trim()) return;
    if (dialog === 'new') addAccount({ name: name.trim() });
    else updateAccount(dialog.id, { name: name.trim() });
    setDialog(null);
  };

  const getAccountStats = (accountId) => {
    const accountTrades = trades.filter((t) => t.accountId === accountId);
    const totalPnl = accountTrades.reduce((s, t) => s + t.pnl, 0);
    return { count: accountTrades.length, pnl: totalPnl };
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Trading Accounts</h2>
          <p className="text-sm text-muted-foreground">Manage your trading accounts</p>
        </div>
        <Button onClick={openNew} className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700"><Plus className="h-3 w-3 mr-1" />Add Account</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {accounts.map((acc) => {
          const s = getAccountStats(acc.id);
          return (
            <Card key={acc.id} className="group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                      <Wallet className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-sm">{acc.name}</CardTitle>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(acc)}><Pencil className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400" onClick={() => setDeleteConfirm(acc)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground">Trades</span>
                    <p className="font-mono font-semibold">{s.count}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total PNL</span>
                    <p className={`font-mono font-semibold ${s.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {s.pnl >= 0 ? '+' : ''}${s.pnl.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {accounts.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-10 text-center text-muted-foreground text-sm">
              No accounts yet. Add one to get started.
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={dialog !== null} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialog === 'new' ? 'New Account' : 'Edit Account'}</DialogTitle>
            <DialogDescription>Enter a name for this trading account.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label className="text-xs">Account Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSave()} placeholder='e.g. "IBKR Main"' className="h-8 text-sm" />
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
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>Are you sure you want to delete "{deleteConfirm?.name}"? Trades linked to this account won't be deleted.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="text-xs">Cancel</Button>
            <Button variant="destructive" className="text-xs" onClick={() => { deleteAccount(deleteConfirm.id); setDeleteConfirm(null); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
