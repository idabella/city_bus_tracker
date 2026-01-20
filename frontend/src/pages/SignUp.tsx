import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth, RoleKey } from '../context/AuthContext';
import { api } from '../utils/api';

const normalize = (value?: string | null) => (value ? value.trim().toLowerCase() : '');
const normalizePhone = (value?: string | null) => (value ? value.replace(/\D/g, '') : '');
const getStringValue = (source: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string') return value;
  }
  return '';
};

const departmentRoleMap: Record<string, RoleKey> = {
  driver: 'role_chauffeur_consultation',
  operations: 'role_gestionnaire',
  maintenance: 'role_maintenance',
  commercial: 'role_commercial',
  analytics: 'role_consultation',
  admin: 'role_administrateur',
};

const departmentOptions = [
  { value: 'driver', title: 'Chauffeur' },
  { value: 'operations', title: 'Gestionnaire' },
  { value: 'maintenance', title: 'Maintenance' },
  { value: 'commercial', title: 'Commercial' },
  { value: 'analytics', title: 'Analyste' },
  { value: 'admin', title: 'Administrateur' },
];

interface SignupFormState {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  department: string;
  licenseNumber: string;
  password: string;
  confirmPassword: string;
}

export default function SignUpPage() {
  const navigate = useNavigate();
  const { registerUser } = useAuth();

  const [form, setForm] = useState<SignupFormState>({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    department: 'driver',
    licenseNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectionNote, setDetectionNote] = useState<string | null>(null);

  const detectRole = async (
    profile: SignupFormState,
  ): Promise<{ role: RoleKey; note: string }> => {
    if (profile.department === 'driver') {
      const { data, error } = await api.from('drivers').select('*');
      if (error) {
        throw new Error("Impossible de vérifier la table des chauffeurs. Réessayez plus tard.");
      }
      const drivers = Array.isArray(data) ? data : [];
      if (drivers.length === 0) {
        throw new Error('Aucun chauffeur enregistré dans Oracle. Contactez votre administrateur.');
      }

      const targetName = normalize(profile.fullName);
      const targetEmail = normalize(profile.email);
      const targetLicense = normalize(profile.licenseNumber);
      const targetPhone = normalizePhone(profile.phone);

      const driverMatch = drivers.find((record) => {
        const source = record as Record<string, unknown>;
        const recordName = normalize(getStringValue(source, ['name', 'NAME']));
        const recordEmail = normalize(getStringValue(source, ['email', 'EMAIL']));
        const recordLicense = normalize(getStringValue(source, ['license_number', 'LICENSE_NUMBER']));
        const recordPhone = normalizePhone(getStringValue(source, ['phone', 'PHONE']));

        return (
          (!!targetLicense && recordLicense === targetLicense) ||
          (!!targetEmail && recordEmail === targetEmail) ||
          (!!targetPhone && !!recordPhone && recordPhone === targetPhone) ||
          (!!targetName && !!recordName && recordName === targetName)
        );
      });

      if (!driverMatch) {
        throw new Error("Nous n'avons trouvé aucun chauffeur correspondant à ces informations.");
      }

      const driverSource = driverMatch as Record<string, unknown>;
      const driverId =
        driverSource.id_driver ||
        driverSource.ID_DRIVER ||
        driverSource.id ||
        driverSource.ID ||
        'N/A';

      return {
        role: 'role_chauffeur_consultation',
        note: `Chauffeur confirmé (ID ${driverId}).`,
      };
    }

    const role = departmentRoleMap[profile.department] ?? 'role_consultation';
    return {
      role,
      note: 'Attribution basée sur le service déclaré.',
    };
  };

  const handleChange = (field: keyof SignupFormState, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setDetectionNote(null);

    if (!form.fullName.trim()) {
      setError('Merci de renseigner votre nom complet.');
      return;
    }
    if (form.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (form.department === 'driver' && !form.licenseNumber.trim()) {
      setError('Le numéro de licence chauffeur est requis pour validation.');
      return;
    }

    setLoading(true);

    try {
      const detection = await detectRole(form);
      await registerUser({
        username: form.username.trim(),
        displayName: form.fullName.trim(),
        password: form.password,
        email: form.email.trim(),
        phone: form.phone.trim(),
        role: detection.role,
        metadata: {
          department: form.department,
          detectionNote: detection.note,
        },
      });

      setDetectionNote(detection.note);

      navigate('/login', {
        replace: true,
        state: {
          registered: true,
          role: detection.role,
          note: detection.note,
        },
      });
    } catch (submissionError: any) {
      setError(submissionError?.message || 'Inscription impossible. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12 text-white">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <ShieldCheck className="mx-auto h-10 w-10 text-blue-400" />
          <h1 className="text-2xl font-semibold">Créer un compte BusManager</h1>
          <p className="text-sm text-slate-400">
            Le rôle final est déterminé automatiquement à partir des données Oracle.
          </p>
          <Link to="/login" className="text-sm text-blue-300 hover:text-blue-100">
            Déjà inscrit ? Se connecter
          </Link>
        </div>

        <form className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-slate-300" htmlFor="fullName">
              Nom complet
            </label>
            <input
              id="fullName"
              type="text"
              value={form.fullName}
              onChange={(event) => handleChange('fullName', event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-4 py-2.5 text-white focus:border-blue-400 focus:outline-none"
              placeholder="ex: Sofia Diop"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-300" htmlFor="username">
                Nom d’utilisateur
              </label>
              <input
                id="username"
                type="text"
                value={form.username}
                onChange={(event) => handleChange('username', event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-4 py-2.5 text-white focus:border-blue-400 focus:outline-none"
                placeholder="Identifiant unique"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300" htmlFor="department">
                Service / Profil
              </label>
              <select
                id="department"
                value={form.department}
                onChange={(event) => handleChange('department', event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-4 py-2.5 text-white focus:border-blue-400 focus:outline-none"
              >
                {departmentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-300" htmlFor="email">
                Email professionnel
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(event) => handleChange('email', event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-4 py-2.5 text-white focus:border-blue-400 focus:outline-none"
                placeholder="prenom.nom@entreprise.com"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300" htmlFor="phone">
                Numéro de téléphone
              </label>
              <input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(event) => handleChange('phone', event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-4 py-2.5 text-white focus:border-blue-400 focus:outline-none"
                placeholder="+33 6 01 02 03 04"
                required
              />
            </div>
          </div>

          {form.department === 'driver' && (
            <div>
              <label className="text-sm font-medium text-slate-300" htmlFor="license">
                Numéro de licence chauffeur
              </label>
              <input
                id="license"
                type="text"
                value={form.licenseNumber}
                onChange={(event) => handleChange('licenseNumber', event.target.value)}
                className="mt-2 w-full rounded-xl border border-blue-400/40 bg-blue-500/10 px-4 py-2.5 text-white focus:border-blue-400 focus:outline-none"
                placeholder="ex: BUS-DRV-2024-001"
                required
              />
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-300" htmlFor="password">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={form.password}
                onChange={(event) => handleChange('password', event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-4 py-2.5 text-white focus:border-blue-400 focus:outline-none"
                placeholder="********"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300" htmlFor="confirmPassword">
                Confirmation
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={(event) => handleChange('confirmPassword', event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-4 py-2.5 text-white focus:border-blue-400 focus:outline-none"
                placeholder="********"
                required
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
              {error}
            </div>
          )}

          {detectionNote && (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
              {detectionNote}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-center text-base font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Vérification en cours...
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                Créer mon accès
              </>
            )}
          </button>
        </form>

        {detectionNote && (
          <p className="text-center text-xs text-slate-400">Attribué: {detectionNote}</p>
        )}
      </div>
    </div>
  );
}




