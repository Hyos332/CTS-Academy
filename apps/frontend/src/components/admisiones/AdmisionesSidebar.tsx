import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import {
  Users,
  Building2,
  GraduationCap,
  Calendar,
  PlusCircle,
  UserPlus,
  UploadCloud,
  Pencil,
  Lock,
  RotateCcw,
} from 'lucide-react';

export interface AdmisionesSidebarProps {
  seccionActiva?: 'candidatos' | 'equipos' | 'alumnos' | 'convocatoria';
  onSelectSeccion?: (seccion: 'candidatos' | 'equipos' | 'alumnos' | 'convocatoria') => void;
  filtroConvocatoria?: string;
  onSelectConvocatoria?: (id: string) => void;
  onAperturarModal?: () => void;
  onInscribirModal?: () => void;
  onImportarModal?: () => void;
  onEditarConvocatoria?: (conv: any) => void;
  onCerrarCorteModal?: () => void;
  onReabrirConvocatoria?: (id: string) => void;
}

export const AdmisionesSidebar: React.FC<AdmisionesSidebarProps> = ({
  seccionActiva,
  onSelectSeccion,
  filtroConvocatoria: propFiltroConvocatoria,
  onSelectConvocatoria,
  onAperturarModal,
  onInscribirModal,
  onImportarModal,
  onEditarConvocatoria,
  onCerrarCorteModal,
  onReabrirConvocatoria,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener datos globales del panel si no se suministran
  const { data: panelData } = useQuery({
    queryKey: ['admisiones-panel'],
    queryFn: async () => {
      const res = await apiClient.get('/equipos/panel-admisiones');
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const listaConvocatorias = panelData?.convocatorias || [];
  const convocatoriaActiva = panelData?.convocatoriaActiva || listaConvocatorias[0];

  const filtroConvocatoria = propFiltroConvocatoria || 'TODAS';
  const convocatoriaMostrar =
    filtroConvocatoria === 'TODAS'
      ? convocatoriaActiva || listaConvocatorias[0]
      : listaConvocatorias.find((c: any) => c.id === filtroConvocatoria) || convocatoriaActiva;

  const totalCandidatos =
    filtroConvocatoria === 'TODAS'
      ? panelData?.metricas?.totalCandidatos || panelData?.candidatos?.length || 0
      : convocatoriaMostrar?.totalCandidatos || 0;

  const handleNav = (seccion: 'candidatos' | 'equipos' | 'alumnos' | 'convocatoria') => {
    if (onSelectSeccion && location.pathname === '/admisiones/panel') {
      onSelectSeccion(seccion);
    } else {
      navigate(`/admisiones/panel?seccion=${seccion}`);
    }
  };

  const handleAperturar = () => {
    if (onAperturarModal && location.pathname === '/admisiones/panel') {
      onAperturarModal();
    } else {
      navigate('/admisiones/panel?modal=aperturar');
    }
  };

  const handleInscribir = () => {
    if (onInscribirModal && location.pathname === '/admisiones/panel') {
      onInscribirModal();
    } else {
      navigate('/admisiones/panel?modal=inscribir');
    }
  };

  const handleImportar = () => {
    if (onImportarModal && location.pathname === '/admisiones/panel') {
      onImportarModal();
    } else {
      navigate('/admisiones/panel?modal=importar');
    }
  };

  return (
    <aside className="w-full lg:w-72 xl:w-80 shrink-0 bg-white border-r border-[#E0E0E0] lg:sticky lg:top-16 lg:h-[calc(100vh-64px)] lg:overflow-y-auto flex flex-col justify-between p-4 space-y-4 z-20">
      <div className="space-y-4">
        {/* Tarjeta de Contexto de la Convocatoria */}
        <div className="bg-[#FAFAFA] border border-[#E0E0E0] rounded-lg p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#757575] uppercase tracking-wider">
              Periodo en Foco
            </span>
            <div className="flex items-center space-x-1.5">
              {convocatoriaMostrar && onEditarConvocatoria && (
                <button
                  type="button"
                  onClick={() => onEditarConvocatoria(convocatoriaMostrar)}
                  title="Editar parámetros de esta convocatoria"
                  className="p-1 rounded text-[#757575] hover:text-[#01579B] hover:bg-white transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                  convocatoriaMostrar?.estado === 'ABIERTA'
                    ? 'text-[#1B5E20] bg-[#E8F5E9] border-[#C8E6C9]'
                    : 'text-[#616161] bg-[#F5F5F5] border-[#E0E0E0]'
                }`}
              >
                {filtroConvocatoria === 'TODAS'
                  ? 'Todas'
                  : convocatoriaMostrar?.estado || 'CERRADA'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#616161] mb-1">
              Periodo / Convocatoria:
            </label>
            {onSelectConvocatoria ? (
              <select
                value={filtroConvocatoria}
                onChange={(e) => onSelectConvocatoria(e.target.value)}
                className="w-full text-xs font-semibold text-[#212121] bg-white border border-[#E0E0E0] rounded-lg px-2.5 py-2 focus:ring-1 focus:ring-[#01579B] focus:border-[#01579B] focus:outline-none cursor-pointer"
              >
                <option value="TODAS">🌐 Todas las Convocatorias</option>
                {listaConvocatorias.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.estado === 'ABIERTA' ? '🟢' : '⚪'} {c.denominacion}
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-xs font-bold text-[#212121] bg-white border border-[#E0E0E0] rounded-lg px-2.5 py-2 truncate">
                {convocatoriaMostrar?.denominacion || 'Convocatoria Activa'}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-[#757575] pt-2 border-t border-[#E0E0E0]">
            <span className="truncate">
              Semestre: <strong className="text-[#424242]">{convocatoriaMostrar?.semestre || 'General'}</strong>
            </span>
            <span className="text-[11px] font-mono font-bold text-[#01579B]">
              {totalCandidatos} post.
            </span>
          </div>
        </div>

        {/* Menú de Navegación Vertical Uniforme */}
        <nav className="space-y-1">
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#757575]">
            Gestión de Convocatoria
          </div>

          <button
            onClick={() => handleNav('candidatos')}
            className={`w-full flex items-center px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
              seccionActiva === 'candidatos'
                ? 'bg-[#E6EFF5] text-[#01579B] border-l-4 border-[#01579B] font-bold rounded-r-lg shadow-2xs'
                : 'text-[#424242] hover:bg-[#F5F5F5] hover:text-[#01579B] rounded-lg'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Users className={`w-4 h-4 ${seccionActiva === 'candidatos' ? 'text-[#01579B]' : 'text-[#757575]'}`} />
              <span className="truncate">Aspirantes & Selección</span>
            </div>
          </button>

          <button
            onClick={() => handleNav('equipos')}
            className={`w-full flex items-center px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
              seccionActiva === 'equipos'
                ? 'bg-[#E6EFF5] text-[#01579B] border-l-4 border-[#01579B] font-bold rounded-r-lg shadow-2xs'
                : 'text-[#424242] hover:bg-[#F5F5F5] hover:text-[#01579B] rounded-lg'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Building2 className={`w-4 h-4 ${seccionActiva === 'equipos' ? 'text-[#01579B]' : 'text-[#757575]'}`} />
              <span className="truncate">Equipos CTS (Squads)</span>
            </div>
          </button>

          <button
            onClick={() => handleNav('alumnos')}
            className={`w-full flex items-center px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
              seccionActiva === 'alumnos'
                ? 'bg-[#E6EFF5] text-[#01579B] border-l-4 border-[#01579B] font-bold rounded-r-lg shadow-2xs'
                : 'text-[#424242] hover:bg-[#F5F5F5] hover:text-[#01579B] rounded-lg'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <GraduationCap className={`w-4 h-4 ${seccionActiva === 'alumnos' ? 'text-[#01579B]' : 'text-[#757575]'}`} />
              <span className="truncate">Alumnos PROFER</span>
            </div>
          </button>

          <button
            onClick={() => handleNav('convocatoria')}
            className={`w-full flex items-center px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
              seccionActiva === 'convocatoria'
                ? 'bg-[#E6EFF5] text-[#01579B] border-l-4 border-[#01579B] font-bold rounded-r-lg shadow-2xs'
                : 'text-[#424242] hover:bg-[#F5F5F5] hover:text-[#01579B] rounded-lg'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Calendar className={`w-4 h-4 ${seccionActiva === 'convocatoria' ? 'text-[#01579B]' : 'text-[#757575]'}`} />
              <span className="truncate">Convocatoria & Periodo</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Botones de Acción Rápida en Sidebar (Estilo Button Grupo FUNIBER SD) */}
      <div className="pt-3 border-t border-[#EEEEEE] space-y-2">
        <button
          onClick={handleAperturar}
          className="w-full py-2 px-3 bg-[#01579B] hover:bg-[#004174] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Aperturar Convocatoria</span>
        </button>

        <button
          onClick={handleInscribir}
          className="w-full py-2 px-3 border border-[#01579B] text-[#01579B] hover:bg-[#E6EFF5] text-xs font-semibold rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Inscribir Aspirante</span>
        </button>

        <button
          onClick={handleImportar}
          className="w-full py-2 px-3 border border-[#E0E0E0] text-[#424242] hover:bg-[#F5F5F5] text-xs font-semibold rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
        >
          <UploadCloud className="w-3.5 h-3.5 text-[#616161]" />
          <span>Importar Nómina de Sede</span>
        </button>

        {convocatoriaActiva && onCerrarCorteModal && (
          <button
            onClick={onCerrarCorteModal}
            className="w-full py-2 px-3 border border-[#FFCDD2] text-[#D32F2F] hover:bg-[#FFEBEE] text-xs font-semibold rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 text-[#D32F2F]" />
            <span>Cerrar Corte Semestral</span>
          </button>
        )}

        {!convocatoriaActiva && panelData?.ultimaConvocatoria && onReabrirConvocatoria && (
          <button
            onClick={() => onReabrirConvocatoria(panelData.ultimaConvocatoria.id)}
            className="w-full py-2 px-3 border border-[#FFE0B2] text-[#E65100] hover:bg-[#FFF3E0] text-xs font-semibold rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#E65100]" />
            <span>Reabrir Convocatoria</span>
          </button>
        )}
      </div>
    </aside>
  );
};
