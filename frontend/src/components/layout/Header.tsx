import { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';

interface HeaderProps {
    onMenuToggle: () => void;
    title: string;
}

export default function Header({ onMenuToggle, title }: HeaderProps) {
    const { user, logout } = useContext(AuthContext);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const initials = user?.name
        ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
        : 'U';

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Buenos días';
        if (h < 18) return 'Buenas tardes';
        return 'Buenas noches';
    };

    return (
        <header className="h-16 bg-white border-b border-slate-100 px-4 lg:px-8 flex items-center justify-between flex-shrink-0 sticky top-0 z-10">
            <div className="flex items-center gap-4">
                {/* Mobile menu button */}
                <button
                    onClick={onMenuToggle}
                    className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all"
                    aria-label="Abrir menú"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                </button>

                <div>
                    <h1 className="text-lg font-bold text-slate-900 leading-none">{title}</h1>
                    <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">
                        {greeting()}, {user?.name?.split(' ')[0] ?? 'usuario'} 👋
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Date badge */}
                <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 text-sm text-slate-500">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>

                {/* User dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen((v) => !v)}
                        className="flex items-center gap-2.5 hover:bg-slate-50 rounded-xl px-3 py-1.5 transition-all group"
                    >
                        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {initials}
                        </div>
                        <div className="hidden sm:block text-left">
                            <p className="text-sm font-semibold text-slate-800 leading-none">{user?.name}</p>
                            <p className="text-xs text-slate-400 mt-0.5 leading-none">{user?.email}</p>
                        </div>
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className={`text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                        >
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </button>

                    {dropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-card-md border border-slate-100 overflow-hidden animate-slide-up z-50">
                            <div className="px-4 py-3 border-b border-slate-50">
                                <p className="text-xs text-slate-400">Conectado como</p>
                                <p className="text-sm font-semibold text-slate-800 truncate">{user?.email}</p>
                            </div>
                            <button
                                onClick={() => { setDropdownOpen(false); logout(); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-expense-DEFAULT hover:bg-expense-bg transition-colors"
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                                    <polyline points="16 17 21 12 16 7" />
                                    <line x1="21" y1="12" x2="9" y2="12" />
                                </svg>
                                Cerrar sesión
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}