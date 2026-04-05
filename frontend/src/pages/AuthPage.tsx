import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { authService } from '../services/auth.service';

type Mode = 'login' | 'register';

export default function AuthPage() {
    const { login } = useContext(AuthContext);
    const [mode, setMode] = useState<Mode>('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({ name: '', email: '', password: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (mode === 'login') {
                const res = await authService.login({ email: form.email, password: form.password });
                login(res.user, res.token);
            } else {
                const res = await authService.register({ name: form.name, email: form.email, password: form.password });
                login(res.user, res.token);
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Ocurrió un error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface flex">
            {/* Left panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-sidebar flex-col justify-between p-12">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <span className="text-white font-bold text-xl tracking-tight">Finanzas</span>
                </div>

                <div className="space-y-6">
                    <h1 className="text-4xl font-bold text-white leading-tight">
                        Toma el control<br />
                        <span className="text-brand-200">de tu dinero</span>
                    </h1>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        Registra ingresos, gastos y categorías en un solo lugar. Visualiza tu progreso y toma mejores decisiones financieras.
                    </p>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                        {[
                            { label: 'Usuarios activos', value: '12,000+' },
                            { label: 'Transacciones', value: '500K+' },
                            { label: 'Categorías', value: 'Ilimitadas' },
                            { label: 'Disponibilidad', value: '99.9%' },
                        ].map(({ label, value }) => (
                            <div key={label} className="bg-sidebar-hover rounded-xl p-4 border border-white/5">
                                <p className="text-2xl font-bold text-white num">{value}</p>
                                <p className="text-slate-400 text-sm mt-1">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-slate-500 text-sm">© 2025 Dashboard Finanzas. Todos los derechos reservados.</p>
            </div>

            {/* Right panel - form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-md animate-fade-in">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-8">
                        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <span className="text-slate-900 font-bold text-xl tracking-tight">Finanzas</span>
                    </div>

                    <h2 className="text-3xl font-bold text-slate-900 mb-1">
                        {mode === 'login' ? 'Bienvenido de vuelta' : 'Crear cuenta'}
                    </h2>
                    <p className="text-slate-500 mb-8">
                        {mode === 'login'
                            ? 'Ingresá tus datos para continuar'
                            : 'Completá el formulario para empezar'}
                    </p>

                    {/* Mode toggle */}
                    <div className="flex bg-surface-muted rounded-xl p-1 mb-8">
                        {(['login', 'register'] as Mode[]).map((m) => (
                            <button
                                key={m}
                                onClick={() => { setMode(m); setError(''); }}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${mode === m
                                        ? 'bg-white shadow-card text-slate-900'
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === 'register' && (
                            <InputField
                                label="Nombre completo"
                                name="name"
                                type="text"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Juan Pérez"
                                required
                            />
                        )}
                        <InputField
                            label="Email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="juan@ejemplo.com"
                            required
                        />
                        <InputField
                            label="Contraseña"
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                        />

                        {error && (
                            <div className="bg-expense-bg border border-expense/20 text-expense-text rounded-xl px-4 py-3 text-sm animate-fade-in">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Procesando...
                                </span>
                            ) : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

function InputField({
    label,
    name,
    type,
    value,
    onChange,
    placeholder,
    required,
}: {
    label: string;
    name: string;
    type: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
    required?: boolean;
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
            <input
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all duration-200 text-sm"
            />
        </div>
    );
}