import React, { useState, useMemo, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useStudentStore } from '@/stores/useStudentStore';
import { useStudentTradeStore } from '@/stores/useStudentTradeStore';
import { useStudentStrategyStore } from '@/stores/useStudentStrategyStore';
import { formatDuration } from '@/lib/trade-utils';
import { importForStudent } from '@/lib/import-utils';
import {
  GraduationCap, Plus, ArrowLeft, Pencil, Trash2, Upload, Archive,
  ArrowUpRight, ArrowDownRight, ChevronUp, ChevronDown, ChevronRight,
  Filter, RotateCcw, CheckCircle2, AlertTriangle, Target, Image as ImageIcon,
  Users, TrendingUp,
} from 'lucide-react';

function StudentCard({ student, tradeCount, pnl, winRate, onClick, onEdit, onDelete }) {
  return (
    <Card className="cursor-pointer hover:border-emerald-500/50 transition-colors group" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-violet-500/10 text-violet-400 flex items-center justify-center text-sm font-bold">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-sm">{student.name}</p>
              {student.notes && <p className="text-[10px] text-muted-foreground line-clamp-1">{student.notes}</p>}
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onEdit}><Pencil className="h-3 w-3" /></Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-300" onClick={onDelete}><Trash2 className="h-3 w-3" /></Button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t">
          <div className="text-center">
            <p className="text-xs font-bold">{tradeCount}</p>
            <p className="text-[10px] text-muted-foreground">Trades</p>
          </div>
          <div className="text-center">
            <p className={`text-xs font-bold font-mono ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {pnl >= 0 ? '+' : ''}${pnl.toFixed(0)}
            </p>
            <p className="text-[10px] text-muted-foreground">PNL</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold">{winRate.toFixed(0)}%</p>
            <p className="text-[10px] text-muted-foreground">Win Rate</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StudentFormDialog({ open, onOpenChange, onSave, initial }) {
  const [name, setName] = useState(initial?.name || '');
  const [notes, setNotes] = useState(initial?.notes || '');

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), notes: notes.trim() });
    setName('');
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit Student' : 'Add Student'}</DialogTitle>
          <DialogDescription>{initial ? `Editing ${initial.name}` : 'Add a new student to mentor'}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Name *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Student name" className="h-8 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Notes</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes..." rows={2} className="text-sm" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="text-xs" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="text-xs bg-emerald-600 hover:bg-emerald-700" disabled={!name.trim()} onClick={handleSave}>
            {initial ? 'Save Changes' : 'Add Student'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StudentTradeTable({ studentId }) {
  const { trades, stats } = useStudentTradeStore(studentId);
  const { strategies } = useStudentStrategyStore(studentId);
  const [sortKey, setSortKey] = useState('entryDate');
  const [sortDir, setSortDir] = useState('desc');
  const [filterSymbol, setFilterSymbol] = useState('');
  const [filterDirection, setFilterDirection] = useState('all');
  const [filterResult, setFilterResult] = useState('all');
  const [filterStrategy, setFilterStrategy] = useState('all');
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [previewImg, setPreviewImg] = useState(null);

  const hasActiveFilters = filterSymbol || filterDirection !== 'all' || filterResult !== 'all' || filterStrategy !== 'all';

  const clearFilters = () => {
    setFilterSymbol('');
    setFilterDirection('all');
    setFilterResult('all');
    setFilterStrategy('all');
  };

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };
  const SortIcon = ({ col }) => sortKey === col ? (sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : null;

  const toggleExpand = (id) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const sorted = useMemo(() => {
    let t = [...trades];
    if (filterSymbol) t = t.filter(tr => tr.symbol.toLowerCase().includes(filterSymbol.toLowerCase()));
    if (filterDirection !== 'all') t = t.filter(tr => tr.direction === filterDirection);
    if (filterResult === 'win') t = t.filter(tr => tr.pnl > 0);
    if (filterResult === 'loss') t = t.filter(tr => tr.pnl < 0);
    if (filterStrategy !== 'all') t = t.filter(tr => tr.strategyId === filterStrategy);
    t.sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey];
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return t;
  }, [trades, sortKey, sortDir, filterSymbol, filterDirection, filterResult, filterStrategy]);

  const strategyName = (id) => strategies.find(s => s.id === id)?.name ?? '—';

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center">
          <p className="text-lg font-bold">{stats.totalTrades}</p>
          <p className="text-[10px] text-muted-foreground">Total Trades</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className={`text-lg font-bold font-mono ${stats.totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {stats.totalPnl >= 0 ? '+' : ''}${stats.totalPnl.toFixed(2)}
          </p>
          <p className="text-[10px] text-muted-foreground">Total PNL</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-lg font-bold">{stats.winRate.toFixed(1)}%</p>
          <p className="text-[10px] text-muted-foreground">Win Rate</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-lg font-bold">{stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2)}</p>
          <p className="text-[10px] text-muted-foreground">Profit Factor</p>
        </CardContent></Card>
      </div>

      {trades.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <Input value={filterSymbol} onChange={e => setFilterSymbol(e.target.value)} placeholder="Symbol..." className="h-8 w-28 text-xs" />
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
          {strategies.length > 0 && (
            <Select value={filterStrategy} onValueChange={setFilterStrategy}>
              <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Strategies</SelectItem>
                {strategies.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          {hasActiveFilters && (
            <>
              <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground" onClick={clearFilters}>
                <RotateCcw className="h-3 w-3 mr-1" /> Clear
              </Button>
              <span className="text-xs text-muted-foreground">{sorted.length} of {trades.length} trades</span>
            </>
          )}
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead className="cursor-pointer text-xs" onClick={() => toggleSort('entryDate')}>Date <SortIcon col="entryDate" /></TableHead>
                <TableHead className="cursor-pointer text-xs" onClick={() => toggleSort('symbol')}>Symbol <SortIcon col="symbol" /></TableHead>
                <TableHead className="cursor-pointer text-xs" onClick={() => toggleSort('direction')}>Dir <SortIcon col="direction" /></TableHead>
                <TableHead className="cursor-pointer text-xs text-right" onClick={() => toggleSort('pnl')}>PNL <SortIcon col="pnl" /></TableHead>
                <TableHead className="cursor-pointer text-xs text-right hidden sm:table-cell" onClick={() => toggleSort('tradeDuration')}>Duration <SortIcon col="tradeDuration" /></TableHead>
                <TableHead className="text-xs hidden lg:table-cell">Strategy</TableHead>
                <TableHead className="text-xs hidden md:table-cell">Tags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8 text-sm">No trades yet. Import a backup to get started.</TableCell></TableRow>
              )}
              {sorted.map(t => {
                const isExpanded = expandedRows.has(t.id);
                return (
                  <React.Fragment key={t.id}>
                    <TableRow className="cursor-pointer" onClick={() => toggleExpand(t.id)}>
                      <TableCell className="w-8 px-2">
                        {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
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
                        <div className="flex gap-1 flex-wrap">{t.tags?.map(tag => <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>)}</div>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableCell colSpan={8} className="p-0">
                          <TradeDetailPanel trade={t} strategyName={strategyName} onPreviewImg={setPreviewImg} />
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

function TradeDetailPanel({ trade: t, strategyName, onPreviewImg }) {
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
                onClick={() => onPreviewImg(img)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StudentDetail({ student, onBack }) {
  const { trades } = useStudentTradeStore(student.id);
  const [importDrag, setImportDrag] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState(null);

  const handleImportFile = useCallback(async (file) => {
    if (!file) return;
    setImporting(true);
    setImportError(null);
    setImportResult(null);
    try {
      const result = await importForStudent(file, student.id);
      setImportResult(result);
    } catch (err) {
      setImportError(err.message);
    } finally {
      setImporting(false);
    }
  }, [student.id]);

  const openFilePicker = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.zip';
    input.onchange = (e) => handleImportFile(e.target.files[0]);
    input.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="h-10 w-10 rounded-full bg-violet-500/10 text-violet-400 flex items-center justify-center text-sm font-bold">
            {student.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-sm font-semibold">{student.name}</h3>
            {student.notes && <p className="text-[10px] text-muted-foreground">{student.notes}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {importResult && (
            <Badge variant="outline" className="text-[10px] border-emerald-500/50 text-emerald-400 gap-1">
              <CheckCircle2 className="h-3 w-3" />
              {importResult.trades} trades, {importResult.strategies} strategies imported
              {importResult.skipped > 0 && ` (${importResult.skipped} skipped)`}
            </Badge>
          )}
          {importError && (
            <Badge variant="outline" className="text-[10px] border-red-500/50 text-red-400 gap-1">
              <AlertTriangle className="h-3 w-3" /> {importError}
            </Badge>
          )}
          <Button
            variant="outline"
            className="h-8 text-xs"
            onClick={openFilePicker}
            disabled={importing}
            onDragOver={(e) => { e.preventDefault(); setImportDrag(true); }}
            onDragLeave={() => setImportDrag(false)}
            onDrop={(e) => { e.preventDefault(); setImportDrag(false); handleImportFile(e.dataTransfer.files[0]); }}
          >
            <Upload className="h-3 w-3 mr-1" />
            {importing ? 'Importing...' : 'Import Backup'}
          </Button>
        </div>
      </div>

      <StudentTradeTable studentId={student.id} />
    </div>
  );
}

function StudentList({ students, studentStats, onSelect, onAdd, onEdit, onDelete }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{students.length} student{students.length !== 1 ? 's' : ''}</span>
        </div>
        <Button onClick={onAdd} className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-3 w-3 mr-1" />Add Student
        </Button>
      </div>

      {students.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <GraduationCap className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="font-medium text-sm">No students yet</p>
            <p className="text-xs text-muted-foreground mt-1">Add a student and import their trading journal backup to start reviewing.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {students.map(s => {
            const st = studentStats[s.id] || { totalTrades: 0, totalPnl: 0, winRate: 0 };
            return (
              <StudentCard
                key={s.id}
                student={s}
                tradeCount={st.totalTrades}
                pnl={st.totalPnl}
                winRate={st.winRate}
                onClick={() => onSelect(s)}
                onEdit={() => onEdit(s)}
                onDelete={() => onDelete(s)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Mentor() {
  const { students, addStudent, updateStudent, deleteStudent } = useStudentStore();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(null);

  const allStudentTrades = useLiveQuery(() => db.studentTrades.toArray(), [], []);

  const studentStats = useMemo(() => {
    const map = {};
    students.forEach(s => { map[s.id] = { totalTrades: 0, totalPnl: 0, winRate: 0 }; });
    allStudentTrades.forEach(t => {
      if (!map[t.studentId]) return;
      map[t.studentId].totalTrades++;
      map[t.studentId].totalPnl += t.pnl || 0;
      if (t.pnl > 0) map[t.studentId]._wins = (map[t.studentId]._wins || 0) + 1;
    });
    Object.values(map).forEach(s => {
      s.winRate = s.totalTrades > 0 ? ((s._wins || 0) / s.totalTrades) * 100 : 0;
      delete s._wins;
    });
    return map;
  }, [students, allStudentTrades]);

  const handleAddOrEdit = async (data) => {
    if (editingStudent) {
      await updateStudent(editingStudent.id, data);
    } else {
      await addStudent(data);
    }
    setFormOpen(false);
    setEditingStudent(null);
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;
    await deleteStudent(deleteDialog.id);
    setDeleteDialog(null);
    if (selectedStudent?.id === deleteDialog.id) setSelectedStudent(null);
  };

  return (
    <div className="p-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <GraduationCap className="h-5 w-5" /> Mentor Mode
        </h2>
        <p className="text-sm text-muted-foreground">Manage students and review their trading journals</p>
      </div>

      {selectedStudent ? (
        <StudentDetail
          student={selectedStudent}
          onBack={() => setSelectedStudent(null)}
        />
      ) : (
        <StudentList
          students={students}
          studentStats={studentStats}
          onSelect={setSelectedStudent}
          onAdd={() => { setEditingStudent(null); setFormOpen(true); }}
          onEdit={(s) => { setEditingStudent(s); setFormOpen(true); }}
          onDelete={setDeleteDialog}
        />
      )}

      <StudentFormDialog
        open={formOpen}
        onOpenChange={(open) => { setFormOpen(open); if (!open) setEditingStudent(null); }}
        onSave={handleAddOrEdit}
        initial={editingStudent}
      />

      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Student</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deleteDialog?.name}? This will also delete all their trades and strategies. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)} className="text-xs">Cancel</Button>
            <Button variant="destructive" className="text-xs" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
