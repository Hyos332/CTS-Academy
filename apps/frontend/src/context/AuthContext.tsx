import React, { createContext, useContext, useState, useEffect } from 'react';
import { UsuarioBase } from '@cts/shared-types';
import { apiClient } from '../api/client';

interface AuthContextType {
  usuario: UsuarioBase | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, usuario: UsuarioBase, redirectTo?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<UsuarioBase | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('cts_access_token');
    const savedUser = localStorage.getItem('cts_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUsuario(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('cts_access_token');
        localStorage.removeItem('cts_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUsuario: UsuarioBase, redirectTo?: string) => {
    localStorage.setItem('cts_access_token', newToken);
    localStorage.setItem('cts_user', JSON.stringify(newUsuario));
    setToken(newToken);
    setUsuario(newUsuario);
    if (redirectTo) {
      window.location.href = redirectTo;
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignorar fallo de red en logout
    } finally {
      localStorage.removeItem('cts_access_token');
      localStorage.removeItem('cts_user');
      setToken(null);
      setUsuario(null);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        isAuthenticated: !!token && !!usuario,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
