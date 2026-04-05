import { NavLink } from 'react-router-dom';

type NavItem = { to: string; label: string; icon: React.ReactNode };

const navItems: NavItem[] = [
    {
        to: '/', label: 'Resumen',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
        ),
    },
    {
        to: '/transactions', label: 'Transacciones',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 16V4m0 0L3 8m4-4l4 4" /><path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
            </svg>
        ),
    },
    {
        to: '/categories', label: 'Categorías',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
        ),
    },
    {
        to: '/budgets', label: 'Presupuestos',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
            </svg>
        ),
    },
];

interface SidebarProps { mobileOpen: boolean; onClose: () => void }

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
    return (
        <>
            {mobileOpen && <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={onClose} />}
            <aside className={`fixed top-0 left-0 z-30 h-full w-60 bg-sidebar flex flex-col transition-transform duration-300 ease-out lg:translate-x-0 lg:static lg:z-auto ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
                    <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <span className="text-white font-bold text-lg tracking-tight">Finanzas</span>
                </div>
                <nav className="flex-1 px-3 py-5 space-y-1">
                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest px-3 mb-3">Principal</p>
                    {navItems.map(({ to, label, icon }) => (
                        <NavLink key={to} to={to} end={to === '/'} onClick={onClose}
                            className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive ? 'bg-brand-500/15 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                            {({ isActive }) => (
                                <>
                                    <span className={`transition-colors duration-200 ${isActive ? 'text-brand-200' : 'text-slate-500 group-hover:text-slate-300'}`}>{icon}</span>
                                    {label}
                                    {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400" />}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>
                <div className="px-3 py-4 border-t border-white/5">
                    <div className="bg-white/5 rounded-xl p-4">
                        <p className="text-slate-300 text-xs font-medium mb-1">Tip del día</p>
                        <p className="text-slate-500 text-xs leading-relaxed">Registrar gastos diariamente mejora tu control financiero en un 40%.</p>
                    </div>
                </div>
            </aside>
        </>
    );
}