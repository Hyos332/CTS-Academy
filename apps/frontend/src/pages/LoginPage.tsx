import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await apiClient.post('/auth/login', {
        email,
        contrasena,
      });

      const { accessToken, usuario, redirectTo } = response.data;
      login(accessToken, usuario, redirectTo);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Error al conectar con el servidor de autenticación.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Encabezado Institucional Grupo FUNIBER SD */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex p-3 bg-[#01579B] text-white rounded-lg shadow-funiber mb-3 border border-[#004174]">
          <div className="w-10 h-10 flex items-center justify-center font-black text-lg tracking-wider">
            CTS
          </div>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <h1 className="text-2xl font-black text-[#212121] tracking-tight">
            CTS Academy
          </h1>
          <span className="text-[10px] font-black uppercase tracking-wider bg-[#E6EFF5] text-[#01579B] px-2 py-0.5 rounded border border-[#CCDDEB]">
            Grupo FUNIBER
          </span>
        </div>
        <p className="mt-1 text-xs text-[#757575] font-medium">
          Sistema de Admisión, Evaluación & Formación PROFER
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        {/* Tarjeta de Inicio de Sesión Oficial FUNIBER SD */}
        <div className="bg-white py-8 px-6 shadow-funiber rounded-lg sm:px-10 border border-[#E0E0E0]">
          <div className="mb-6 pb-4 border-b border-[#EEEEEE]">
            <h2 className="text-base font-bold text-[#212121]">
              Iniciar Sesión
            </h2>
            <p className="text-xs text-[#757575] mt-0.5">
              Ingresa tus credenciales corporativas o de postulante
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-[#FFEBEE] border border-[#FFCDD2] rounded-lg flex items-start space-x-2 text-[#D32F2F] text-xs font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#D32F2F]" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#424242] mb-1">
                Correo Electrónico Institucional
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9E9E9E]">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@ctdesarrollo.org"
                  className="block w-full pl-9 pr-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#01579B] focus:border-[#01579B] text-xs text-[#212121] placeholder-[#BDBDBD] bg-[#FFFFFF] transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#424242]">
                  Contraseña
                </label>
              </div>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9E9E9E]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-9 pr-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#01579B] focus:border-[#01579B] text-xs text-[#212121] placeholder-[#BDBDBD] bg-[#FFFFFF] transition-all"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-xs text-xs font-bold text-white bg-[#01579B] hover:bg-[#004174] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#01579B] disabled:opacity-50 transition-colors uppercase tracking-wider"
              >
                {isLoading ? (
                  <span className="flex items-center space-x-2">
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Autenticando...</span>
                  </span>
                ) : (
                  <span>Acceder al Portal</span>
                )}
              </button>
            </div>
          </form>

          {/* Enlace para aspirantes sin cuenta */}
          <div className="mt-6 pt-4 border-t border-[#EEEEEE] text-center">
            <p className="text-xs text-[#757575]">
              ¿Aún no has registrado tu candidatura?
            </p>
            <Link
              to="/postular"
              className="mt-1.5 inline-flex items-center space-x-1 text-xs font-bold text-[#01579B] hover:text-[#004174] transition-colors"
            >
              <span>Completar Formulario de Admisión Pública</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Pie de página corporativo */}
        <div className="mt-6 text-center text-[11px] text-[#9E9E9E]">
          <span>Grupo FUNIBER • Universidad Europea del Atlántico (UNEATLANTICO)</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
