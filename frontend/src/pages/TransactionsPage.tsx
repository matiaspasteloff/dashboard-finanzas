import { useEffect, useState, useCallback } from 'react';
import { transactionService, type Transaction, type PaginatedTransactions } from '../services/transaction.service';
import { categoryService, type Category } from '../services/category.service';
import TransactionModal from '../components/transactions/TransactionModal';

function formatARS(amount: number): string {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount);
}

function SkeletonRow() {
    return (
        <tr className="animate-pulse">
            {[1, 2, 3, 4, 5].map(i => <td key={i} className="px-5 py-4"><div className="h-4 bg-slate-100 rounded w-3/4" /></td>)}
        </tr>
    );
}

const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const RECURRENCE_LABELS: Record<string, string> = { WEEKLY: 'Semanal', MONTHLY: 'Mensual', YEARLY: 'Anual' };

type SortKey = 'date' | 'amount' | 'description';
type SortDir = 'asc' | 'desc';

export default function TransactionsPage() {
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [result, setResult] = useState<PaginatedTransactions | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
    const [sortKey, setSortKey] = useState<SortKey>('date');
    const [sortDir, setSortDir] = useState<SortDir>('desc');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [paginated, cats] = await Promise.all([
                transactionService.getPaginated({ page, limit, month, year }),
                categoryService.getAll(),
            ]);
            setResult(paginated);
            setCategories(cats);
        } finally {
            setLoading(false);
        }
    }, [page, limit, month, year]);

    useEffect(() => { load(); }, [load]);

    const navigateMonth = (dir: -1 | 1) => {
        let m = month + dir;
        let y = year;
        if (m > 12) { m = 1; y++; }
        if (m < 1) { m = 12; y--; }
        setMonth(m);
        setYear(y);
        setPage(1);
    };

    const catMap = Object.fromEntries(categories.map(c => [c.id, c]));
    const transactions: Transaction[] = result?.data ?? [];
    const pagination = result?.pagination;

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar esta transacción?')) return;
        setDeletingId(id);
        try {
            await transactionService.delete(id);
            load();
        } finally {
            setDeletingId(null);
        }
    };

    const handleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('desc'); }
    };

    // Client-side filter + sort (within current page)
    const filtered = transactions
        .filter(t => {
            if (filterType !== 'ALL' && catMap[t.categoryId]?.type !== filterType) return false;
            if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
            return true;
        })
        .sort((a, b) => {
            let cmp = 0;
            if (sortKey === 'date') cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
            if (sortKey === 'amount') cmp = a.amount - b.amount;
            if (sortKey === 'description') cmp = a.description.localeCompare(b.description);
            return sortDir === 'asc' ? cmp : -cmp;
        });

    const SortIcon = ({ col }: { col: SortKey }) => (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            className={`inline ml-1 transition-transform ${sortKey === col ? 'text-brand-500' : 'text-slate-300'} ${sortKey === col && sortDir === 'asc' ? 'rotate-180' : ''}`}>
            <polyline points="6 9 12 15 18 9" />
        </svg>
    );

    return (
        <div className="space-y-4 animate-slide-up">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-white rounded-2xl px-5 py-4 shadow-card border border-slate-100">
                {/* Month navigator */}
                <div className="flex items-center gap-2 bg-slate-50 rounded-xl border border-slate-100 px-2 py-1">
                    <button onClick={() => navigateMonth(-1)} className="p-1.5 rounded-lg hover:bg-white text-slate-500 hover:text-slate-700 transition-all">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
                    </button>
                    <span className="text-sm font-semibold text-slate-700 w-36 text-center">{MONTH_NAMES[month - 1]} {year}</span>
                    <button onClick={() => navigateMonth(1)} className="p-1.5 rounded-lg hover:bg-white text-slate-500 hover:text-slate-700 transition-all">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
                    <div className="relative flex-1 min-w-0">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input type="text" placeholder="Buscar en esta página..." value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all" />
                    </div>
                    <div className="flex bg-slate-50 rounded-xl p-1 border border-slate-100">
                        {(['ALL', 'INCOME', 'EXPENSE'] as const).map(type => (
                            <button key={type} onClick={() => setFilterType(type)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${filterType === type ? 'bg-white shadow-card text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>
                                {type === 'ALL' ? 'Todos' : type === 'INCOME' ? 'Ingresos' : 'Gastos'}
                            </button>
                        ))}
                    </div>
                </div>

                <button onClick={() => setModalOpen(true)}
                    className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all active:scale-[0.98] shadow-md whitespace-nowrap">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Nueva transacción
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-4 cursor-pointer hover:text-slate-600 transition-colors whitespace-nowrap" onClick={() => handleSort('date')}>
                                    Fecha <SortIcon col="date" />
                                </th>
                                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-4 cursor-pointer hover:text-slate-600 transition-colors" onClick={() => handleSort('description')}>
                                    Descripción <SortIcon col="description" />
                                </th>
                                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-4">Categoría</th>
                                <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-4 cursor-pointer hover:text-slate-600 transition-colors" onClick={() => handleSort('amount')}>
                                    Monto <SortIcon col="amount" />
                                </th>
                                <th className="px-5 py-4 w-12" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading
                                ? [1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)
                                : filtered.length === 0
                                    ? (
                                        <tr>
                                            <td colSpan={5} className="py-16 text-center text-slate-400 text-sm">
                                                <div className="flex flex-col items-center gap-2">
                                                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-300">
                                                        <path d="M7 16V4m0 0L3 8m4-4l4 4" /><path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
                                                    </svg>
                                                    <p>No hay transacciones en {MONTH_NAMES[month - 1].toLowerCase()} {year}</p>
                                                    <button onClick={() => setModalOpen(true)} className="text-brand-500 font-semibold mt-1 hover:underline">Crear la primera →</button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                    : filtered.map(t => {
                                        const cat = catMap[t.categoryId];
                                        const isIncome = cat?.type === 'INCOME';
                                        return (
                                            <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group">
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <span className="text-xs text-slate-500 num">
                                                        {new Date(t.date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isIncome ? 'bg-income-bg' : 'bg-expense-bg'}`}>
                                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={isIncome ? '#10B981' : '#F43F5E'} strokeWidth="2.5">
                                                                {isIncome ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <span className="text-sm font-medium text-slate-800">{t.description}</span>
                                                            {t.isRecurring && (
                                                                <span className="ml-2 text-xs bg-brand-50 text-brand-600 px-1.5 py-0.5 rounded-md font-medium">
                                                                    ↻ {t.recurrenceFrequency ? RECURRENCE_LABELS[t.recurrenceFrequency] ?? t.recurrenceFrequency : 'Recurrente'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    {cat ? (
                                                        <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-lg ${isIncome ? 'bg-income-bg text-income-text' : 'bg-expense-bg text-expense-text'}`}>
                                                            {cat.name}
                                                        </span>
                                                    ) : <span className="text-xs text-slate-300">—</span>}
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <span className={`text-sm font-bold num ${isIncome ? 'text-income-DEFAULT' : 'text-expense-DEFAULT'}`}>
                                                        {isIncome ? '+' : '-'}{formatARS(t.amount)}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <button onClick={() => handleDelete(t.id)} disabled={deletingId === t.id}
                                                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-300 hover:text-expense-DEFAULT hover:bg-expense-bg transition-all disabled:opacity-50">
                                                        {deletingId === t.id ? (
                                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                            </svg>
                                                        ) : (
                                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6M9 6V4h6v2" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                        </tbody>
                    </table>
                </div>

                {/* Footer with pagination */}
                {pagination && pagination.total > 0 && (
                    <div className="px-5 py-3 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                            Página <span className="font-semibold text-slate-600">{pagination.page}</span> de <span className="font-semibold text-slate-600">{pagination.totalPages}</span>
                            {' '}· <span className="font-semibold text-slate-600">{pagination.total}</span> transacciones
                        </span>
                        <div className="flex items-center gap-2">
                            <button disabled={!pagination.hasPrev} onClick={() => setPage(p => p - 1)}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                                ← Anterior
                            </button>
                            <button disabled={!pagination.hasNext} onClick={() => setPage(p => p + 1)}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                                Siguiente →
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <TransactionModal open={modalOpen} onClose={() => setModalOpen(false)} onSuccess={load} onCreate={transactionService.create} />
        </div>
    );
}