import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { LogOut, ClipboardList, Menu } from 'lucide-react';
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
          <span className="bg-white text-[#01579B] text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs border border-white/40 uppercase tracking-wider">
            Tech Leader
          </span>
        );
      case RolUsuario.GESTOR:
        return (
          <span className="bg-[#FFF3E0] text-[#E65100] text-[10px] font-bold px-2 py-0.5 rounded border border-[#FFE0B2] uppercase tracking-wider">
            Gestor Admisiones
          </span>
        );
      case RolUsuario.ALUMNO:
        return (
          <span className="bg-[#E8F5E9] text-[#1B5E20] text-[10px] font-bold px-2 py-0.5 rounded border border-[#C8E6C9] uppercase tracking-wider">
            Alumno PROFER
          </span>
        );
      case RolUsuario.CANDIDATO:
        return (
          <span className="bg-[#E6EFF5] text-[#01579B] text-[10px] font-bold px-2 py-0.5 rounded border border-[#CCDDEB] uppercase tracking-wider">
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
    <header className="bg-[#01579B] border-b border-[#004174] sticky top-0 z-50 shadow-xs text-white no-print">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Lado Izquierdo: Botón Hamburguesa, Logotipo y Marca Grupo FUNIBER */}
        <div className="flex items-center space-x-3">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className={`p-2 rounded-lg text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 transition-colors cursor-pointer ${
                isSidebarOpen ? 'bg-white/15' : ''
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
            <div className="w-10 h-10 rounded-lg bg-[#004174] text-white flex items-center justify-center font-black text-sm tracking-wider shadow-2xs border border-white/20">
              CTS
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base text-white tracking-tight leading-none">
                  CTS Academy
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-white/15 text-[#E6EFF5] px-1.5 py-0.5 rounded border border-white/20">
                  Grupo FUNIBER
                </span>
              </div>
              <span className="text-[11px] text-[#CCDDEB] block mt-0.5 leading-none">
                Sistema de Evaluación & Formación PROFER
              </span>
            </div>
          </Link>

          {/* Candidato: acceso a sus baterías */}
          {usuario?.rol === RolUsuario.CANDIDATO && (
            <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-white/20 h-8">
              <button
                onClick={() => navigate('/evaluacion/panel')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  location.pathname.startsWith('/evaluacion')
                    ? 'bg-white/20 text-white shadow-2xs'
                    : 'text-[#E6EFF5] hover:text-white hover:bg-white/10'
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
                  <p className="text-xs font-semibold text-white leading-tight">
                    {usuario.nombre} {usuario.apellidos}
                  </p>
                  {getRoleBadge(usuario.rol)}
                </div>
                <p className="text-[11px] text-[#CCDDEB] truncate max-w-[220px]">
                  {usuario.email}
                </p>
              </div>

              {/* Avatar Circular FUNIBER */}
              <div className="w-9 h-9 rounded-full bg-[#004174] border-2 border-white/60 text-white font-bold text-xs flex items-center justify-center shadow-2xs shrink-0">
                {iniciales}
              </div>
            </div>

            <button
              onClick={logout}
              title="Cerrar sesión segura"
              className="p-2 text-[#CCDDEB] hover:text-white hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/20 cursor-pointer"
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
