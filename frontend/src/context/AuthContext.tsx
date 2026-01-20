import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { api } from '../utils/api';

// Types
export type RoleKey =
    | 'role_administrateur'
    | 'role_gestionnaire'
    | 'role_chauffeur_consultation'
    | 'role_maintenance'
    | 'role_commercial'
    | 'role_consultation';

export type PermissionAction = 'view' | 'create' | 'update' | 'delete';

export interface RoleDefinition {
    label: string;
    routes: string[];
    permissions: Record<string, PermissionAction[]>;
}

export interface User {
    id: string;
    username: string;
    displayName: string;
    email?: string;
    phone?: string;
    role: RoleKey;
    metadata?: Record<string, unknown>;
}

export interface RegisterUserData {
    username: string;
    displayName: string;
    password: string;
    email?: string;
    phone?: string;
    role: RoleKey;
    metadata?: Record<string, unknown>;
}

// Role Definitions
export const ROLE_DEFINITIONS: Record<RoleKey, RoleDefinition> = {
    role_administrateur: {
        label: 'Administrateur',
        routes: ['/dashboard', '/cities', '/stations', '/bus-lines', '/buses', '/drivers', '/trips', '/tickets', '/subscriptions', '/maintenance', '/incidents'],
        permissions: {
            dashboard: ['view'],
            cities: ['view', 'create', 'update', 'delete'],
            stations: ['view', 'create', 'update', 'delete'],
            busLines: ['view', 'create', 'update', 'delete'],
            buses: ['view', 'create', 'update', 'delete'],
            drivers: ['view', 'create', 'update', 'delete'],
            trips: ['view', 'create', 'update', 'delete'],
            tickets: ['view', 'create', 'update', 'delete'],
            subscriptions: ['view', 'create', 'update', 'delete'],
            maintenance: ['view', 'create', 'update', 'delete'],
            incidents: ['view', 'create', 'update', 'delete'],
        },
    },
    role_gestionnaire: {
        label: 'Gestionnaire',
        routes: ['/dashboard', '/cities', '/stations', '/bus-lines', '/buses', '/drivers', '/trips', '/tickets', '/subscriptions'],
        permissions: {
            dashboard: ['view'],
            cities: ['view', 'create', 'update'],
            stations: ['view', 'create', 'update'],
            busLines: ['view', 'create', 'update'],
            buses: ['view', 'create', 'update'],
            drivers: ['view', 'create', 'update'],
            trips: ['view', 'create', 'update', 'delete'],
            tickets: ['view', 'create', 'update'],
            subscriptions: ['view', 'create', 'update'],
        },
    },
    role_chauffeur_consultation: {
        label: 'Chauffeur',
        routes: ['/dashboard', '/trips', '/incidents'],
        permissions: {
            dashboard: ['view'],
            trips: ['view'],
            incidents: ['view', 'create'],
        },
    },
    role_maintenance: {
        label: 'Maintenance',
        routes: ['/dashboard', '/buses', '/maintenance', '/incidents'],
        permissions: {
            dashboard: ['view'],
            buses: ['view'],
            maintenance: ['view', 'create', 'update', 'delete'],
            incidents: ['view', 'create', 'update'],
        },
    },
    role_commercial: {
        label: 'Commercial',
        routes: ['/dashboard', '/tickets', '/subscriptions', '/trips'],
        permissions: {
            dashboard: ['view'],
            tickets: ['view', 'create', 'update'],
            subscriptions: ['view', 'create', 'update'],
            trips: ['view'],
        },
    },
    role_consultation: {
        label: 'Consultation',
        routes: ['/dashboard'],
        permissions: {
            dashboard: ['view'],
        },
    },
};

// Context
interface AuthContextType {
    user: User | null;
    roleDefinition: RoleDefinition | null;
    login: (username: string, password: string) => Promise<{ nextRoute: string }>;
    logout: () => void;
    registerUser: (data: RegisterUserData) => Promise<void>;
    hasAccess: (route: string) => boolean;
    can: (entity: string, action: PermissionAction) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    // Load user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('busmanager_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Error loading user from localStorage:', error);
                localStorage.removeItem('busmanager_user');
            }
        }
    }, []);

    const roleDefinition = user ? ROLE_DEFINITIONS[user.role] : null;

    const login = async (username: string, password: string): Promise<{ nextRoute: string }> => {
        try {
            // Query users table
            const { data, error } = await api.from('users').select('*').eq('username', username);

            if (error) {
                throw new Error('Erreur de connexion à la base de données.');
            }

            if (!data || data.length === 0) {
                throw new Error('Nom d\'utilisateur ou mot de passe incorrect.');
            }

            const userRecord = data[0] as Record<string, unknown>;

            // Simple password check (in production, use proper hashing)
            const storedPassword = userRecord.password || userRecord.PASSWORD;
            if (storedPassword !== password) {
                throw new Error('Nom d\'utilisateur ou mot de passe incorrect.');
            }

            // Extract user data
            const userId = String(userRecord.id_user || userRecord.ID_USER || userRecord.id || userRecord.ID || '');
            const userRole = String(userRecord.role || userRecord.ROLE || 'role_consultation') as RoleKey;
            const displayName = String(userRecord.display_name || userRecord.DISPLAY_NAME || userRecord.username || userRecord.USERNAME || '');
            const email = userRecord.email || userRecord.EMAIL;
            const phone = userRecord.phone || userRecord.PHONE;

            const authenticatedUser: User = {
                id: userId,
                username,
                displayName,
                email: email ? String(email) : undefined,
                phone: phone ? String(phone) : undefined,
                role: userRole,
            };

            setUser(authenticatedUser);
            localStorage.setItem('busmanager_user', JSON.stringify(authenticatedUser));

            return { nextRoute: '/dashboard' };
        } catch (error) {
            throw error;
        }
    };

    const registerUser = async (data: RegisterUserData): Promise<void> => {
        try {
            // Check if username already exists
            const { data: existingUsers, error: checkError } = await api
                .from('users')
                .select('*')
                .eq('username', data.username);

            if (checkError) {
                throw new Error('Erreur lors de la vérification du nom d\'utilisateur.');
            }

            if (existingUsers && existingUsers.length > 0) {
                throw new Error('Ce nom d\'utilisateur est déjà pris.');
            }

            // Insert new user
            const { error: insertError } = await api.from('users').insert({
                username: data.username,
                display_name: data.displayName,
                password: data.password, // In production, hash this!
                email: data.email,
                phone: data.phone,
                role: data.role,
            });

            if (insertError) {
                throw new Error('Erreur lors de la création du compte.');
            }
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('busmanager_user');
    };

    const hasAccess = (route: string): boolean => {
        if (!user || !roleDefinition) return false;
        return roleDefinition.routes.includes(route);
    };

    const can = (entity: string, action: PermissionAction): boolean => {
        if (!user || !roleDefinition) return false;
        const entityPermissions = roleDefinition.permissions[entity];
        if (!entityPermissions) return false;
        return entityPermissions.includes(action);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                roleDefinition,
                login,
                logout,
                registerUser,
                hasAccess,
                can,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// Hook
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
