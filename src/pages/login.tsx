import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, UserCircle2, BadgeCheck, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { ROLE_DEFINITIONS, useAuth, RoleKey } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { from?: string; registered?: boolean; role?: RoleKey; note?: string } | undefined;
  const from = locationState?.from;

  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { nextRoute } = await login(username.trim(), password);
      navigate(from || nextRoute, { replace: true });
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Connexion impossible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center rounded-full bg-blue-500/10 p-3">
            <Shield className="h-6 w-6 text-blue-300" />
          </div>
          <h1 className="text-2xl font-semibold text-white">Connexion BusManager</h1>
          <p className="text-sm text-slate-400">Identifiez-vous avec vos identifiants Oracle</p>
        </div>

        {locationState?.registered && (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-300" />
            <div>
              <p className="font-semibold">
                Compte créé avec le rôle&nbsp;
                <span className="text-white">
                  {ROLE_DEFINITIONS[locationState.role ?? 'role_consultation'].label}
                </span>
              </p>
              {locationState.note && <p className="text-xs text-emerald-100/70 mt-1">{locationState.note}</p>}
            </div>
          </div>
        )}

        <form className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium text-slate-300">
              Nom d’utilisateur
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-3 py-2 focus-within:border-blue-400">
              <UserCircle2 className="h-5 w-5 text-slate-400" />
              <input
                id="username"
                type="text"
                className="w-full bg-transparent text-white focus:outline-none"
                placeholder="ex: admin_transport"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-slate-300">
              Mot de passe
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-3 py-2 focus-within:border-blue-400">
              <BadgeCheck className="h-5 w-5 text-slate-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="w-full bg-transparent text-white focus:outline-none"
                placeholder="Mot de passe"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-slate-400 transition hover:text-white"
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-center text-base font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400">
          Besoin d’un accès ?{' '}
          <Link to="/sign-up" className="text-blue-300 hover:text-blue-200">
            Créer un compte
          </Link>
        </p>
        <button
          onClick={() => navigate('/')}
          className="mx-auto block text-sm text-slate-500 hover:text-white transition"
        >
          Retour à l’accueil
        </button>
      </div>
    </div>
  );
}

