import { useEffect, useState, useCallback } from 'react';
import { categoryService, type Category } from '../services/category.service';

const TYPE_META = {
    INCOME: { label: 'Ingreso', bg: 'bg-income-bg', text: 'text-income-text', border: 'border-income-DEFAULT/20', dot: 'bg-income-DEFAULT' },
    EXPENSE: { label: 'Gasto', bg: 'bg-expense-bg', text: 'text-expense-text', border: 'border-expense-DEFAULT/20', dot: 'bg-expense-DEFAULT' },
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    default: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
    ),
};

// ─── Category Card ────────────────────────────────────────────────────────────

function CategoryCard({ category }: { category: Category }) {
    const meta = TYPE_META[category.type as keyof typeof TYPE_META] ?? TYPE_META.EXPENSE;

    return (
        <div className={`bg-white rounded-2xl p-5 shadow-card border ${meta.border} hover:shadow-card-hover transition-all duration-300 group`}>
            <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${meta.bg} ${meta.text}`}>
                    {CATEGORY_ICONS.default}
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${meta.bg} ${meta.text}`}>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${meta.dot}`} />
                    {meta.label}
                </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 truncate">{category.name}</h3>
            <p className="text-xs text-slate-400 mt-1 truncate">ID: {category.id.slice(0, 8)}…</p>
        </div>
    );
}

// ─── Category Modal ───────────────────────────────────────────────────────────

function CategoryModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
    const [form, setForm] = useState({ name: '', type: 'EXPENSE' as 'INCOME' | 'EXPENSE' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) { setForm({ name: '', type: 'EXPENSE' }); setError(''); }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) { setError('Ingresá un nombre'); return; }
        setLoading(true);
        try {
            await categoryService.create({ name: form.name.trim(), type: form.type });
            onSuccess();
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error al crear categoría');
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
                        <h2 className="text-lg font-bold text-slate-900">Nueva categoría</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Organizá tus transacciones</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
                    {/* Type */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de categoría</label>
                        <div className="grid grid-cols-2 gap-2">
                            {(['INCOME', 'EXPENSE'] as const).map((type) => {
                                const isActive = form.type === type;
                                const meta = TYPE_META[type];
                                return (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setForm((f) => ({ ...f, type }))}
                                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all duration-200
                      ${isActive ? `${meta.bg} border-current ${meta.text}` : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                                    >
                                        <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
                                        {meta.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre</label>
                        <input
                            type="text"
                            placeholder="Ej: Alimentación, Sueldo, Entretenimiento..."
                            required
                            value={form.name}
                            onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setError(''); }}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all text-slate-900 text-sm"
                        />
                    </div>

                    {error && (
                        <div className="bg-expense-bg border border-expense/20 text-expense-text rounded-xl px-4 py-3 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-60 shadow-md">
                            {loading ? 'Guardando...' : 'Crear categoría'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [filter, setFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const cats = await categoryService.getAll();
            setCategories(cats);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const filtered = categories.filter((c) => filter === 'ALL' || c.type === filter);
    const incomeCount = categories.filter((c) => c.type === 'INCOME').length;
    const expenseCount = categories.filter((c) => c.type === 'EXPENSE').length;

    return (
        <div className="space-y-5 animate-slide-up">
            {/* Header bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex gap-3">
                    {/* Stats badges */}
                    <div className="bg-income-bg border border-income-DEFAULT/20 rounded-xl px-4 py-2.5 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-income-DEFAULT" />
                        <span className="text-sm font-semibold text-income-text">{incomeCount} ingresos</span>
                    </div>
                    <div className="bg-expense-bg border border-expense-DEFAULT/20 rounded-xl px-4 py-2.5 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-expense-DEFAULT" />
                        <span className="text-sm font-semibold text-expense-text">{expenseCount} gastos</span>
                    </div>
                </div>
                <button
                    onClick={() => setModalOpen(true)}
                    className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all active:scale-[0.98] shadow-md whitespace-nowrap"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Nueva categoría
                </button>
            </div>

            {/* Filter tabs */}
            <div className="flex bg-white rounded-xl p-1 border border-slate-100 shadow-card w-fit gap-1">
                {(['ALL', 'INCOME', 'EXPENSE'] as const).map((type) => (
                    <button
                        key={type}
                        onClick={() => setFilter(type)}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${filter === type ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        {type === 'ALL' ? `Todas (${categories.length})` : type === 'INCOME' ? `Ingresos (${incomeCount})` : `Gastos (${expenseCount})`}
                    </button>
                ))}
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-white rounded-2xl p-5 shadow-card border border-slate-100 animate-pulse">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 mb-4" />
                            <div className="h-5 bg-slate-100 rounded w-3/4 mb-2" />
                            <div className="h-3 bg-slate-100 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl p-16 shadow-card border border-slate-100 flex flex-col items-center text-slate-400">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-slate-300 mb-4">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                        <line x1="7" y1="7" x2="7.01" y2="7" />
                    </svg>
                    <p className="text-base font-semibold text-slate-600 mb-1">Sin categorías</p>
                    <p className="text-sm mb-4">Creá tu primera categoría para organizar tus finanzas</p>
                    <button
                        onClick={() => setModalOpen(true)}
                        className="flex items-center gap-2 bg-brand-600 text-white font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-brand-700 transition-all"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Crear categoría
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filtered.map((cat) => (
                        <CategoryCard key={cat.id} category={cat} />
                    ))}

                    {/* Add card */}
                    <button
                        onClick={() => setModalOpen(true)}
                        className="bg-white rounded-2xl p-5 shadow-card border-2 border-dashed border-slate-200 hover:border-brand-300 hover:bg-brand-50/30 transition-all duration-300 flex flex-col items-center justify-center gap-3 group min-h-[140px]"
                    >
                        <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-brand-100 flex items-center justify-center text-slate-400 group-hover:text-brand-500 transition-all">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                        </div>
                        <span className="text-sm font-semibold text-slate-400 group-hover:text-brand-500 transition-colors">Nueva categoría</span>
                    </button>
                </div>
            )}

            <CategoryModal open={modalOpen} onClose={() => setModalOpen(false)} onSuccess={load} />
        </div>
    );
}