import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, ShieldCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { usuario, logout } = useAuth();

  const getRoleBadge = (rol?: string) => {
    switch (rol) {
      case 'LIDER_EQUIPO':
        return <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-purple-300">Tech Leader</span>;
      case 'GESTOR':
        return <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-amber-300">Gestor Admisiones</span>;
      case 'ALUMNO':
        return <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-emerald-300">Alumno Profer</span>;
      case 'CANDIDATO':
        return <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-blue-300">Postulante</span>;
      default:
        return null;
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-brand-600 text-white p-2 rounded-lg font-bold flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">CTS Academy</span>
            <span className="text-xs text-slate-500 block leading-none">Evaluator & Training Platform</span>
          </div>
        </div>

        {usuario && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-right">
              <div>
                <p className="text-sm font-medium text-slate-800">{usuario.nombre} {usuario.apellidos}</p>
                <p className="text-xs text-slate-500">{usuario.email}</p>
              </div>
              <div className="ml-2">
                {getRoleBadge(usuario.rol)}
              </div>
            </div>

            <button
              onClick={logout}
              title="Cerrar sesión"
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
