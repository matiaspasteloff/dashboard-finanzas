import { useState, useEffect } from 'react';
import { categoryService, type Category } from '../../services/category.service';

interface TransactionModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onCreate: (data: { amount: number; description: string; categoryId: string }) => Promise<unknown>;
}

export default function TransactionModal({ open, onClose, onSuccess, onCreate }: TransactionModalProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [form, setForm] = useState({ amount: '', description: '', categoryId: '', type: 'EXPENSE' as 'INCOME' | 'EXPENSE' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            categoryService.getAll().then(setCategories);
            setForm({ amount: '', description: '', categoryId: '', type: 'EXPENSE' });
            setError('');
        }
    }, [open]);

    useEffect(() => {
        setForm((f) => ({ ...f, categoryId: '' }));
    }, [form.type]);

    const filtered = categories.filter((c) => c.type === form.type);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.categoryId) { setError('Seleccioná una categoría'); return; }
        const amount = parseFloat(form.amount);
        if (isNaN(amount) || amount <= 0) { setError('El monto debe ser mayor a 0'); return; }

        setLoading(true);
        setError('');
        try {
            await onCreate({ amount, description: form.description, categoryId: form.categoryId });
            onSuccess();
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error al crear la transacción');
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl animate-slide-up overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Nueva transacción</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Registrá un ingreso o gasto</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
                    {/* Type selector */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Tipo</label>
                        <div className="grid grid-cols-2 gap-2">
                            {(['INCOME', 'EXPENSE'] as const).map((type) => {
                                const isActive = form.type === type;
                                const isIncome = type === 'INCOME';
                                return (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setForm((f) => ({ ...f, type }))}
                                        className={`
                      flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all duration-200
                      ${isActive
                                                ? isIncome
                                                    ? 'bg-income-bg border-income-DEFAULT text-income-text'
                                                    : 'bg-expense-bg border-expense-DEFAULT text-expense-text'
                                                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                            }
                    `}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            {isIncome
                                                ? <polyline points="18 15 12 9 6 15" />
                                                : <polyline points="6 9 12 15 18 9" />
                                            }
                                        </svg>
                                        {isIncome ? 'Ingreso' : 'Gasto'}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Monto</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold num text-sm">$</span>
                            <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                placeholder="0.00"
                                required
                                value={form.amount}
                                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                                className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all text-slate-900 num text-sm font-medium"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción</label>
                        <input
                            type="text"
                            placeholder="Ej: Supermercado, Sueldo, Netflix..."
                            required
                            value={form.description}
                            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all text-slate-900 text-sm"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Categoría</label>
                        {filtered.length === 0 ? (
                            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 rounded-xl px-4 py-3 border border-dashed border-slate-200">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                No hay categorías de tipo {form.type === 'INCOME' ? 'ingreso' : 'gasto'}. Creá una primero.
                            </div>
                        ) : (
                            <select
                                required
                                value={form.categoryId}
                                onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all text-slate-900 text-sm bg-white"
                            >
                                <option value="">Seleccionar categoría</option>
                                {filtered.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    {error && (
                        <div className="bg-expense-bg border border-expense/20 text-expense-text rounded-xl px-4 py-3 text-sm animate-fade-in flex items-center gap-2">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || filtered.length === 0}
                            className="flex-1 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Guardando...
                                </span>
                            ) : 'Guardar transacción'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}