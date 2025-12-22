'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// --- DEFINICIÓN DE USUARIO COMPLETA ---
export interface User {
  id: number;
  username: string;
  email: string;
  affiliate_number?: string;
  rank?: string;
  ogs_username?: string;
  pandanet_username?: string;
  is_editor?: boolean;      // Permiso para Blog/Editor
  is_organizer?: boolean;   // Permiso para Torneos/Brackets (Nuevo)
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (jwt: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>; // Nueva función para actualizar datos sin re-loguear
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
  refreshUser: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem('user');
      const storedJwt = localStorage.getItem('jwt');
      
      if (storedUser && storedJwt) {
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  // Función para pedir a Strapi los datos más frescos del usuario actual
  const refreshUser = async () => {
    const jwt = localStorage.getItem('jwt');
    if (!jwt || !user) return;

    try {
      const res = await fetch(`http://localhost:1337/api/users/me`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (res.ok) {
        const freshData = await res.json();
        localStorage.setItem('user', JSON.stringify(freshData));
        setUser(freshData);
      }
    } catch (error) {
      console.error("Error al refrescar usuario:", error);
    }
  };

  const login = (jwt: string, userData: User) => {
    localStorage.setItem('jwt', jwt);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    router.push('/'); 
  };

  const logout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);