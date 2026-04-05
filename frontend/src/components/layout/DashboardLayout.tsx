import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const pageTitles: Record<string, string> = {
    '/': 'Resumen',
    '/transactions': 'Transacciones',
    '/categories': 'Categorías',
    '/budgets': 'Presupuestos',
};

export default function DashboardLayout() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { pathname } = useLocation();
    const title = pageTitles[pathname] ?? 'Dashboard';

    return (
        <div className="flex h-screen overflow-hidden bg-surface">
            <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Header onMenuToggle={() => setMobileOpen(v => !v)} title={title} />
                <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6">
                    <div className="max-w-7xl mx-auto animate-fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}