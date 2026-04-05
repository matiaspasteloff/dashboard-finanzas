import { useEffect, useState } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from 'recharts';
import { transactionService, type Transaction } from '../services/transaction.service';
import { categoryService, type Category } from '../services/category.service';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatARS(amount: number): string {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount);
}

function formatShort(amount: number): string {
    if (Math.abs(amount) >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
    if (Math.abs(amount) >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
    return `$${amount}`;
}

const CHART_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6', '#06B6D4', '#EC4899'];

// ─── Types ───────────────────────────────────────────────────────────────────

interface MetricCardProps {
    title: string;
    value: string;
    change?: string;
    positive?: boolean;
    icon: React.ReactNode;
    accent: string;
}

// ─── MetricCard ──────────────────────────────────────────────────────────────

function MetricCard({ title, value, change, positive, icon, accent }: MetricCardProps) {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100 hover:shadow-card-hover transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accent}`}>
                    {icon}
                </div>
                {change && (
                    <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${positive ? 'bg-income-bg text-income-text' : 'bg-expense-bg text-expense-text'}`}>
                        {change}
                    </span>
                )}
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
            <p className="text-2xl font-bold text-slate-900 num tracking-tight">{value}</p>
        </div>
    );
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 text-slate-300">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-sm">{message}</p>
        </div>
    );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { fill: string } }> }) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-slate-100 rounded-xl shadow-card-md px-4 py-3">
                <p className="text-sm font-semibold text-slate-800">{payload[0].name}</p>
                <p className="text-sm text-slate-600 num">{formatARS(payload[0].value)}</p>
            </div>
        );
    }
    return null;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([transactionService.getAll(), categoryService.getAll()])
            .then(([txs, cats]) => {
                setTransactions(txs);
                setCategories(cats);
            })
            .finally(() => setLoading(false));
    }, []);

    // ── Metrics ────────────────────────────────────────────────────────────────
    const now = new Date();
    const thisMonth = transactions.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));

    const totalIncome = thisMonth
        .filter((t) => catMap[t.categoryId]?.type === 'INCOME')
        .reduce((s, t) => s + t.amount, 0);

    const totalExpense = thisMonth
        .filter((t) => catMap[t.categoryId]?.type === 'EXPENSE')
        .reduce((s, t) => s + t.amount, 0);

    const balance = totalIncome - totalExpense;

    // ── Pie chart: expense by category ────────────────────────────────────────
    const expenseByCategory = categories
        .filter((c) => c.type === 'EXPENSE')
        .map((c) => ({
            name: c.name,
            value: thisMonth
                .filter((t) => t.categoryId === c.id)
                .reduce((s, t) => s + t.amount, 0),
        }))
        .filter((d) => d.value > 0);

    // ── Bar chart: daily totals (last 7 days) ─────────────────────────────────
    const last7 = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const label = d.toLocaleDateString('es-AR', { weekday: 'short' });
        const dayTxs = transactions.filter((t) => {
            const td = new Date(t.date);
            return td.toDateString() === d.toDateString();
        });
        const income = dayTxs.filter((t) => catMap[t.categoryId]?.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
        const expense = dayTxs.filter((t) => catMap[t.categoryId]?.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
        return { day: label, Ingresos: income, Gastos: expense };
    });

    // ── Recent transactions ───────────────────────────────────────────────────
    const recent = [...transactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 shadow-card border border-slate-100 animate-pulse">
                        <div className="w-11 h-11 rounded-xl bg-slate-100 mb-4" />
                        <div className="h-4 bg-slate-100 rounded w-24 mb-2" />
                        <div className="h-7 bg-slate-100 rounded w-32" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-slide-up">

            {/* ── Metric cards ─────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <MetricCard
                    title="Saldo del mes"
                    value={formatARS(balance)}
                    positive={balance >= 0}
                    change={balance >= 0 ? '▲ Positivo' : '▼ Negativo'}
                    accent="bg-brand-50"
                    icon={
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2">
                            <line x1="12" y1="1" x2="12" y2="23" />
                            <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                        </svg>
                    }
                />
                <MetricCard
                    title="Ingresos del mes"
                    value={formatARS(totalIncome)}
                    positive
                    change={`↑ ${transactions.filter((t) => catMap[t.categoryId]?.type === 'INCOME').length} ops.`}
                    accent="bg-income-bg"
                    icon={
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                            <polyline points="17 6 23 6 23 12" />
                        </svg>
                    }
                />
                <MetricCard
                    title="Gastos del mes"
                    value={formatARS(totalExpense)}
                    positive={false}
                    change={`↓ ${transactions.filter((t) => catMap[t.categoryId]?.type === 'EXPENSE').length} ops.`}
                    accent="bg-expense-bg"
                    icon={
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" strokeWidth="2">
                            <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                            <polyline points="17 18 23 18 23 12" />
                        </svg>
                    }
                />
            </div>

            {/* ── Charts row ───────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

                {/* Bar chart – 3/5 */}
                <div className="lg:col-span-3 bg-white rounded-2xl p-6 shadow-card border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Movimientos últimos 7 días</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Ingresos vs Gastos diarios</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-income-DEFAULT inline-block" />Ingresos</span>
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-expense-DEFAULT inline-block" />Gastos</span>
                        </div>
                    </div>
                    {last7.every((d) => d.Ingresos === 0 && d.Gastos === 0) ? (
                        <EmptyState message="No hay transacciones en los últimos 7 días" />
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={last7} barCategoryGap="30%" barGap={4}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} tickFormatter={formatShort} axisLine={false} tickLine={false} width={48} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
                                <Bar dataKey="Ingresos" fill="#10B981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Gastos" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Donut chart – 2/5 */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-card border border-slate-100">
                    <div className="mb-4">
                        <h3 className="text-base font-bold text-slate-900">Gastos por categoría</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Distribución del mes actual</p>
                    </div>
                    {expenseByCategory.length === 0 ? (
                        <EmptyState message="Sin gastos este mes" />
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={160}>
                                <PieChart>
                                    <Pie
                                        data={expenseByCategory}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={48}
                                        outerRadius={72}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {expenseByCategory.map((_, i) => (
                                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <ul className="space-y-2 mt-2">
                                {expenseByCategory.slice(0, 4).map((d, i) => (
                                    <li key={d.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                                            <span className="text-xs text-slate-600 truncate max-w-[100px]">{d.name}</span>
                                        </div>
                                        <span className="text-xs font-semibold text-slate-800 num">{formatShort(d.value)}</span>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            </div>

            {/* ── Recent transactions ───────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Últimas transacciones</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Los 5 movimientos más recientes</p>
                    </div>
                    <a href="/transactions" className="text-xs text-brand-500 font-semibold hover:underline">Ver todas →</a>
                </div>

                {recent.length === 0 ? (
                    <EmptyState message="Todavía no tenés transacciones registradas" />
                ) : (
                    <div className="space-y-3">
                        {recent.map((t) => {
                            const cat = catMap[t.categoryId];
                            const isIncome = cat?.type === 'INCOME';
                            return (
                                <div key={t.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isIncome ? 'bg-income-bg' : 'bg-expense-bg'}`}>
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={isIncome ? '#10B981' : '#F43F5E'} strokeWidth="2">
                                            {isIncome
                                                ? <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></>
                                                : <><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" /></>
                                            }
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 truncate">{t.description}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            {cat?.name ?? 'Sin categoría'} · {new Date(t.date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                                        </p>
                                    </div>
                                    <p className={`text-sm font-bold num flex-shrink-0 ${isIncome ? 'text-income-DEFAULT' : 'text-expense-DEFAULT'}`}>
                                        {isIncome ? '+' : '-'}{formatARS(t.amount)}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}