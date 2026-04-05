import { useEffect, useState, useCallback } from 'react';
import { budgetService, type Budget } from '../services/budget.service';
import { categoryService, type Category } from '../services/category.service';
import { transactionService, type Transaction } from '../services/transaction.service';

function formatARS(n: number) {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
}

function ProgressBar({ pct }: { pct: number }) {
    const color = pct >= 90 ? '#F43F5E' : pct >= 70 ? '#F59E0B' : '#10B981';
    return (
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, pct)}%`, backgroundColor: color }}
            />
        </div>
    );
}

interface BudgetModalProps {
    open: boolean;
    onClose: () => void;
    onSave: () => void;
    month: number;
    year: number;
    editBudget: Budget | null;
    expenseCategories: Category[];
    existingCategoryIds: Set<string>;
}

function BudgetModal({ open, onClose, onSave, month, year, editBudget, expenseCategories, existingCategoryIds }: BudgetModalProps) {
    const [categoryId, setCategoryId] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            setCategoryId(editBudget?.categoryId ?? '');
            setAmount(editBudget ? String(editBudget.amount) : '');
            setError('');
        }
    }, [open, editBudget]);

    const availableCategories = expenseCategories.filter(
        c => c.id === editBudget?.categoryId || !existingCategoryIds.has(c.id)
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const parsed = parseFloat(amount);
        if (!categoryId) { setError('Seleccioná una categoría'); return; }
        if (isNaN(parsed) || parsed <= 0) { setError('El monto debe ser mayor a 0'); return; }

        setLoading(true);
        try {
            await budgetService.upsert({ categoryId, amount: parsed, month, year });
            onSave();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al guardar');
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
            <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl animate-slide-up overflow-hidden">
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">{editBudget ? 'Editar presupuesto' : 'Nuevo presupuesto'}</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Definí un límite de gasto mensual</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    {editBudget ? (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Categoría</label>
                            <div className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700">
                                {editBudget.category.name}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Categoría de gasto</label>
                            {availableCategories.length === 0 ? (
                                <p className="text-xs text-slate-400 bg-slate-50 rounded-xl px-4 py-3 border border-dashed border-slate-200">
                                    Todas las categorías ya tienen presupuesto este mes.
                                </p>
                            ) : (
                                <select
                                    required
                                    value={categoryId}
                                    onChange={e => setCategoryId(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all text-slate-900 text-sm bg-white"
                                >
                                    <option value="">Seleccioná una categoría</option>
                                    {availableCategories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Monto presupuestado</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold num text-sm">$</span>
                            <input
                                type="number"
                                min="1"
                                step="1"
                                placeholder="0"
                                required
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all text-slate-900 num text-sm font-medium"
                            />
                        </div>
                    </div>
                    {error && (
                        <div className="bg-expense-bg border border-expense-DEFAULT/20 text-expense-text rounded-xl px-4 py-3 text-sm">{error}</div>
                    )}
                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all">
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || (!editBudget && availableCategories.length === 0)}
                            className="flex-1 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-60 shadow-md"
                        >
                            {loading ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export default function BudgetsPage() {
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [b, t, cats] = await Promise.all([
                budgetService.getAll(month, year),
                transactionService.getAll({ month, year }),
                categoryService.getAll(),
            ]);
            setBudgets(b);
            setTransactions(t);
            setExpenseCategories(cats.filter(c => c.type === 'EXPENSE'));
        } finally {
            setLoading(false);
        }
    }, [month, year]);

    useEffect(() => { load(); }, [load]);

    const navigateMonth = (dir: -1 | 1) => {
        let m = month + dir;
        let y = year;
        if (m > 12) { m = 1; y++; }
        if (m < 1) { m = 12; y--; }
        setMonth(m);
        setYear(y);
    };

    // Spending per category
    const spendingMap = transactions.reduce<Record<string, number>>((acc, t) => {
        acc[t.categoryId] = (acc[t.categoryId] ?? 0) + t.amount;
        return acc;
    }, {});

    const existingCategoryIds = new Set(budgets.map(b => b.categoryId));

    // Summary
    const totalBudgeted = budgets.reduce((s, b) => s + b.amount, 0);
    const totalSpent = budgets.reduce((s, b) => s + (spendingMap[b.categoryId] ?? 0), 0);
    const remaining = totalBudgeted - totalSpent;

    // Categories without budget (for "add" cards)
    const unbugeted = expenseCategories.filter(c => !existingCategoryIds.has(c.id));

    const handleEdit = (budget: Budget) => { setEditingBudget(budget); setModalOpen(true); };
    const handleAdd = () => { setEditingBudget(null); setModalOpen(true); };
    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar este presupuesto?')) return;
        await budgetService.delete(id);
        load();
    };

    return (
        <div className="space-y-5 animate-slide-up">
            {/* Month navigator */}
            <div className="flex items-center justify-between bg-white rounded-2xl px-6 py-4 shadow-card border border-slate-100">
                <button onClick={() => navigateMonth(-1)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-all">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                <div className="text-center">
                    <h2 className="text-base font-bold text-slate-900">{MONTH_NAMES[month - 1]} {year}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">{budgets.length} presupuesto{budgets.length !== 1 ? 's' : ''} configurado{budgets.length !== 1 ? 's' : ''}</p>
                </div>
                <button onClick={() => navigateMonth(1)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-all">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
            </div>

            {/* Summary */}
            {budgets.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Presupuestado', value: totalBudgeted, color: 'text-brand-600', bg: 'bg-brand-50' },
                        { label: 'Gastado', value: totalSpent, color: 'text-expense-DEFAULT', bg: 'bg-expense-bg' },
                        { label: 'Disponible', value: Math.max(0, remaining), color: remaining >= 0 ? 'text-income-DEFAULT' : 'text-expense-DEFAULT', bg: remaining >= 0 ? 'bg-income-bg' : 'bg-expense-bg' },
                    ].map(({ label, value, color, bg }) => (
                        <div key={label} className={`${bg} rounded-2xl p-4 border border-transparent`}>
                            <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
                            <p className={`text-lg font-bold num ${color}`}>{formatARS(value)}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Budget cards grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-2xl p-5 shadow-card border border-slate-100 animate-pulse h-36" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Budget cards */}
                    {budgets.map(budget => {
                        const spent = spendingMap[budget.categoryId] ?? 0;
                        const pct = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
                        const statusColor = pct >= 90 ? 'text-expense-DEFAULT' : pct >= 70 ? 'text-amber-500' : 'text-income-DEFAULT';

                        return (
                            <div key={budget.id} className="bg-white rounded-2xl p-5 shadow-card border border-slate-100 hover:shadow-card-hover transition-all duration-300 group">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-xl bg-expense-bg flex items-center justify-center">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" strokeWidth="2">
                                                <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
                                            </svg>
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-900 truncate max-w-[120px]">{budget.category.name}</h3>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEdit(budget)} className="p-1.5 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-brand-50 transition-all">
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                        </button>
                                        <button onClick={() => handleDelete(budget.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-expense-DEFAULT hover:bg-expense-bg transition-all">
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6M9 6V4h6v2" /></svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <ProgressBar pct={pct} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-500 num">
                                        {formatARS(spent)} <span className="text-slate-400">de</span> {formatARS(budget.amount)}
                                    </span>
                                    <span className={`text-xs font-bold num ${statusColor}`}>{pct.toFixed(0)}%</span>
                                </div>
                            </div>
                        );
                    })}

                    {/* Unbudgeted categories (ghost cards) */}
                    {unbugeted.slice(0, 3).map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => { setEditingBudget(null); setModalOpen(true); }}
                            className="bg-white rounded-2xl p-5 shadow-card border-2 border-dashed border-slate-200 hover:border-brand-300 hover:bg-brand-50/30 transition-all group text-left"
                        >
                            <div className="flex items-center gap-2.5 mb-3">
                                <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-brand-100 flex items-center justify-center transition-colors">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-400 group-hover:text-brand-500 transition-colors">
                                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                </div>
                                <h3 className="text-sm font-bold text-slate-400 group-hover:text-slate-600 transition-colors truncate max-w-[120px]">{cat.name}</h3>
                            </div>
                            <p className="text-xs text-slate-400 group-hover:text-brand-500 font-medium transition-colors">Establecer presupuesto →</p>
                        </button>
                    ))}

                    {/* Add new budget button */}
                    <button
                        onClick={handleAdd}
                        className="bg-white rounded-2xl p-5 shadow-card border-2 border-dashed border-slate-200 hover:border-brand-300 hover:bg-brand-50/30 transition-all group flex flex-col items-center justify-center gap-2 min-h-[130px]"
                    >
                        <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-brand-100 flex items-center justify-center transition-colors">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-400 group-hover:text-brand-500 transition-colors">
                                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                        </div>
                        <span className="text-xs font-semibold text-slate-400 group-hover:text-brand-500 transition-colors">Nuevo presupuesto</span>
                    </button>
                </div>
            )}

            {/* Empty state */}
            {!loading && budgets.length === 0 && expenseCategories.length === 0 && (
                <div className="bg-white rounded-2xl p-16 shadow-card border border-slate-100 flex flex-col items-center text-slate-400">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-slate-300 mb-4">
                        <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                    <p className="text-base font-semibold text-slate-600 mb-1">Sin categorías de gasto</p>
                    <p className="text-sm">Primero creá categorías de tipo "Gasto" para poder presupuestarlas.</p>
                </div>
            )}

            <BudgetModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={load}
                month={month}
                year={year}
                editBudget={editingBudget}
                expenseCategories={expenseCategories}
                existingCategoryIds={existingCategoryIds}
            />
        </div>
    );
}