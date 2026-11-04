import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  LogOut,
  ClipboardList,
  Menu,
} from 'lucide-react';
import { RolUsuario } from '@cts/shared-types';

interface NavbarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  isSidebarOpen,
}) => {
  const { usuario, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const getRoleBadge = (rol?: string) => {
    switch (rol) {
      case RolUsuario.LIDER_EQUIPO:
        return (
          <span className="bg-white/95 text-[#01579B] text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-2xs border border-white/40 uppercase tracking-wider">
            Tech Leader
          </span>
        );
      case RolUsuario.GESTOR:
        return (
          <span className="bg-amber-100 text-amber-900 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-2xs border border-amber-300 uppercase tracking-wider">
            Gestor Admisiones
          </span>
        );
      case RolUsuario.ALUMNO:
        return (
          <span className="bg-emerald-100 text-emerald-900 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-2xs border border-emerald-300 uppercase tracking-wider">
            Alumno PROFER
          </span>
        );
      case RolUsuario.CANDIDATO:
        return (
          <span className="bg-blue-100 text-blue-900 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-2xs border border-blue-300 uppercase tracking-wider">
            Postulante
          </span>
        );
      default:
        return null;
    }
  };

  const iniciales = usuario
    ? `${usuario.nombre?.[0] || ''}${usuario.apellidos?.[0] || ''}`.toUpperCase() || 'U'
    : 'U';

  return (
    <header className="bg-[#01579B] border-b border-[#004174] sticky top-0 z-50 shadow-md text-white no-print">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Lado Izquierdo: Botón Hamburguesa, Logotipo y Marca Grupo FUNIBER */}
        <div className="flex items-center space-x-3">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className={`p-2 rounded-lg text-white hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors cursor-pointer ${
                isSidebarOpen ? 'bg-white/10' : ''
              }`}
              title="Alternar barra lateral de navegación"
              aria-label="Alternar menú lateral"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link
            to="/"
            className="flex items-center space-x-3 group hover:opacity-95 transition-opacity"
          >
            <div className="w-10 h-10 rounded-lg bg-[#004174] text-white flex items-center justify-center font-black text-sm tracking-wider shadow-xs border border-white/20">
              CTS
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg text-white tracking-tight leading-none">
                  CTS Academy
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider bg-white/15 text-blue-100 px-1.5 py-0.5 rounded border border-white/20">
                  Grupo FUNIBER
                </span>
              </div>
              <span className="text-[11px] text-blue-100 block mt-0.5 leading-none">
                Sistema de Evaluación & Formación PROFER
              </span>
            </div>
          </Link>

          {/* Candidato: acceso a sus baterías */}
          {usuario?.rol === RolUsuario.CANDIDATO && (
            <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-white/20 h-8">
              <button
                onClick={() => navigate('/evaluacion/panel')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  location.pathname.startsWith('/evaluacion')
                    ? 'bg-white/20 text-white shadow-xs'
                    : 'text-blue-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Mis Baterías de Admisión</span>
              </button>
            </nav>
          )}
        </div>

        {/* Lado Derecho: Chip de Rol, Usuario y Cierre de Sesión */}
        {usuario && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <div className="flex items-center justify-end space-x-2">
                  <p className="text-xs font-bold text-white leading-tight">
                    {usuario.nombre} {usuario.apellidos}
                  </p>
                  {getRoleBadge(usuario.rol)}
                </div>
                <p className="text-[11px] text-blue-100 truncate max-w-[220px]">
                  {usuario.email}
                </p>
              </div>

              {/* Avatar Circular FUNIBER */}
              <div className="w-9 h-9 rounded-full bg-[#004174] border-2 border-white/60 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                {iniciales}
              </div>
            </div>

            <button
              onClick={logout}
              title="Cerrar sesión segura"
              className="p-2 text-blue-100 hover:text-white hover:bg-white/15 rounded-lg transition-colors border border-transparent hover:border-white/20 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
