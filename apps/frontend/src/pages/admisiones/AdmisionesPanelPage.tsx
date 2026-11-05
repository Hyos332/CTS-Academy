import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Navbar } from '../../components/common/Navbar';
import {
  Users,
  Lock,
  ChevronRight,
  ChevronLeft,
  Video,
  UserPlus,
  ChevronDown,
  ChevronUp,
  ArrowRightLeft,
  Mail,
  CheckCircle2,
  Search,
  Building2,
  GraduationCap,
  Calendar,
  Filter,
  UploadCloud,
  RotateCcw,
  PlusCircle,
  Pencil,
  X,
} from 'lucide-react';
import { InvitacionCandidatoModal } from '../../components/admisiones/InvitacionCandidatoModal';
import { ImportarSedeModal } from '../../components/admisiones/ImportarSedeModal';
import { AperturarConvocatoriaModal } from '../../components/admisiones/AperturarConvocatoriaModal';
import { EditarConvocatoriaModal, ConvocatoriaParaEditar } from '../../components/admisiones/EditarConvocatoriaModal';

export const AdmisionesPanelPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Sección activa en el sidebar de navegación
  const [seccionActiva, setSeccionActiva] = useState<
    'candidatos' | 'equipos' | 'alumnos' | 'convocatoria'
  >('candidatos');

  // Filtros de búsqueda
  const [filtroConvocatoria, setFiltroConvocatoria] = useState<string>('TODAS');
  const [busquedaCandidato, setBusquedaCandidato] = useState('');
  const [filtroEstadoCandidato, setFiltroEstadoCandidato] = useState('TODOS');
  const [filtroSedeCandidato, setFiltroSedeCandidato] = useState('TODAS');
  const [busquedaAlumno, setBusquedaAlumno] = useState('');

  // Paginación de listados
  const [paginaCandidatos, setPaginaCandidatos] = useState(1);
  const [candidatosPorPagina, setCandidatosPorPagina] = useState(10);
  const [paginaAlumnos, setPaginaAlumnos] = useState(1);
  const [alumnosPorPagina, setAlumnosPorPagina] = useState(10);

  // Modales y Sidebar Hamburguesa
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showAperturarModal, setShowAperturarModal] = useState(false);
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [convocatoriaAEditar, setConvocatoriaAEditar] = useState<ConvocatoriaParaEditar | null>(null);
  const [motivoCierre, setMotivoCierre] = useState('');

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showImportSedeModal, setShowImportSedeModal] = useState(false);
  const [convocatoriaDestinoId, setConvocatoriaDestinoId] = useState('');
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoApellidos, setNuevoApellidos] = useState('');
  const [nuevoEmail, setNuevoEmail] = useState('');
  const [nuevaSede, setNuevaSede] = useState('SDR_ESP');
  const [nuevoTelefono, setNuevoTelefono] = useState('');
  const [enviarInvitacionInmediata, setEnviarInvitacionInmediata] = useState(true);

  const [candidatoParaInvitacion, setCandidatoParaInvitacion] = useState<{
    id: string;
    nombre: string;
    email: string;
  } | null>(null);

  // Estados para ver miembros y movilidad entre squads
  const [squadsExpandidos, setSquadsExpandidos] = useState<Record<string, boolean>>({});
  const [alumnoParaTransferir, setAlumnoParaTransferir] = useState<{
    id: string;
    nombreCompleto: string;
    email: string;
    squadActualId?: string | null;
    squadActualNombre?: string;
  } | null>(null);
  const [squadDestinoId, setSquadDestinoId] = useState<string>('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['admisiones-panel'],
    queryFn: async () => {
      const res = await apiClient.get('/equipos/panel-admisiones');
      return res.data;
    },
  });

  const registrarCandidatoMutation = useMutation({
    mutationFn: async (convocatoriaId?: string) => {
      return apiClient.post('/evaluacion/candidatos', {
        nombre: nuevoNombre,
        apellidos: nuevoApellidos,
        email: nuevoEmail,
        sedeOrigen: nuevaSede,
        telefono: nuevoTelefono || undefined,
        convocatoriaId,
        enviarInvitacionInmediata,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admisiones-panel'] });
      setShowRegisterModal(false);
      setNuevoNombre('');
      setNuevoApellidos('');
      setNuevoEmail('');
      setNuevoTelefono('');
      setEnviarInvitacionInmediata(true);
    },
  });

  const cerrarCorteMutation = useMutation({
    mutationFn: async (convocatoriaId: string) => {
      return apiClient.post(`/equipos/periodos-ingreso/${convocatoriaId}/cierre`, {
        motivoCierre,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admisiones-panel'] });
      setShowCloseModal(false);
      setMotivoCierre('');
    },
  });

  const reabrirConvocatoriaMutation = useMutation({
    mutationFn: async (convocatoriaId: string) => {
      return apiClient.post(`/equipos/periodos-ingreso/${convocatoriaId}/reabrir`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admisiones-panel'] });
    },
  });

  const transferirAlumnoMutation = useMutation({
    mutationFn: async () => {
      if (!alumnoParaTransferir) return;
      return apiClient.put(`/equipos/alumnos/${alumnoParaTransferir.id}/squad`, {
        equipoId: squadDestinoId || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admisiones-panel'] });
      setAlumnoParaTransferir(null);
      setSquadDestinoId('');
    },
  });

  const toggleExpandirSquad = (squadId: string) => {
    setSquadsExpandidos((prev) => ({
      ...prev,
      [squadId]: !prev[squadId],
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#01579B] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-[#616161]">Cargando Panel de Admisiones...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans">
        <Navbar onToggleSidebar={() => setSidebarAbierto((prev) => !prev)} isSidebarOpen={sidebarAbierto} />
        <main className="w-full px-4 py-12 text-center text-[#D32F2F] text-sm">
          Error al cargar las métricas de admisiones. Por favor, recarga la página.
        </main>
      </div>
    );
  }

  const { convocatoriaActiva, ultimaConvocatoria, convocatorias, candidatos, equipos, alumnos } = data;
  const listaConvocatorias = convocatorias || [];

  const convocatoriaMostrar =
    filtroConvocatoria === 'TODAS'
      ? convocatoriaActiva || ultimaConvocatoria
      : listaConvocatorias.find((c: any) => c.id === filtroConvocatoria) || convocatoriaActiva || ultimaConvocatoria;

  // Filtrado de Candidatos
  const candidatosFiltrados = (candidatos || []).filter((cand: any) => {
    if (filtroConvocatoria !== 'TODAS' && cand.convocatoriaId !== filtroConvocatoria) {
      return false;
    }
    if (filtroEstadoCandidato !== 'TODOS') {
      if (filtroEstadoCandidato === 'ABANDONADO') {
        if (cand.estadoPostulacion !== 'ABANDONADO' && cand.estadoPostulacion !== 'RECHAZADO') return false;
      } else if (cand.estadoPostulacion !== filtroEstadoCandidato) {
        return false;
      }
    }
    if (filtroSedeCandidato !== 'TODAS' && cand.sedeOrigen !== filtroSedeCandidato) {
      return false;
    }
    if (busquedaCandidato.trim() !== '') {
      const q = busquedaCandidato.toLowerCase();
      const matchNombre = cand.nombreCompleto?.toLowerCase().includes(q);
      const matchEmail = cand.email?.toLowerCase().includes(q);
      if (!matchNombre && !matchEmail) return false;
    }
    return true;
  });

  const totalCandidatosFiltrados = candidatosFiltrados.length;
  const totalPaginasCandidatos = Math.ceil(totalCandidatosFiltrados / candidatosPorPagina) || 1;
  const candidatosPaginados = candidatosFiltrados.slice(
    (paginaCandidatos - 1) * candidatosPorPagina,
    paginaCandidatos * candidatosPorPagina,
  );

  // Métricas reactivas del embudo según el filtro
  const metricasActivas = {
    totalCandidatos: candidatosFiltrados.length,
    enProceso: candidatosFiltrados.filter((c: any) => c.estadoPostulacion === 'EN_PROCESO').length,
    testsCompletados: candidatosFiltrados.filter((c: any) => c.estadoPostulacion === 'TESTS_COMPLETADOS').length,
    entrevistaAgendada: candidatosFiltrados.filter((c: any) => c.estadoPostulacion === 'ENTREVISTA_AGENDADA').length,
    admitidos: candidatosFiltrados.filter((c: any) => c.estadoPostulacion === 'ADMITIDO').length,
    abandonos: candidatosFiltrados.filter(
      (c: any) => c.estadoPostulacion === 'ABANDONADO' || c.estadoPostulacion === 'RECHAZADO',
    ).length,
  };

  // Filtrado de Alumnos PROFER
  const alumnosFiltrados = (alumnos || []).filter((al: any) => {
    if (busquedaAlumno.trim() !== '') {
      const q = busquedaAlumno.toLowerCase();
      const matchNombre = al.nombreCompleto?.toLowerCase().includes(q);
      const matchEmail = al.email?.toLowerCase().includes(q);
      const matchSquad = al.squadActualNombre?.toLowerCase().includes(q);
      if (!matchNombre && !matchEmail && !matchSquad) return false;
    }
    return true;
  });

  const totalAlumnosFiltrados = alumnosFiltrados.length;
  const totalPaginasAlumnos = Math.ceil(totalAlumnosFiltrados / alumnosPorPagina) || 1;
  const alumnosPaginados = alumnosFiltrados.slice(
    (paginaAlumnos - 1) * alumnosPorPagina,
    paginaAlumnos * alumnosPorPagina,
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans text-[#212121]">
      <Navbar onToggleSidebar={() => setSidebarAbierto((prev) => !prev)} isSidebarOpen={sidebarAbierto} />

      <div className="flex-1 flex flex-col lg:flex-row w-full min-h-[calc(100vh-64px)]">
        
        {/* ========================================================= */}
        {/* SIDEBAR DE NAVEGACIÓN UNIFICADO AL LATERAL (FUNIBER SD)   */}
        {/* ========================================================= */}
        {sidebarAbierto && (
          <aside className="w-full lg:w-72 xl:w-80 shrink-0 bg-white border-r border-[#E0E0E0] min-h-[calc(100vh-64px)] flex flex-col justify-between p-4 space-y-4 z-20">
            <div className="space-y-4">
              {/* Tarjeta de Contexto de la Convocatoria */}
              <div className="bg-[#FAFAFA] border border-[#E0E0E0] rounded-lg p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#757575] uppercase tracking-wider">
                    Periodo en Foco
                  </span>
                  <div className="flex items-center space-x-1.5">
                    {convocatoriaMostrar && (
                      <button
                        type="button"
                        onClick={() => {
                          setConvocatoriaAEditar({
                            id: convocatoriaMostrar.id,
                            denominacion: convocatoriaMostrar.denominacion,
                            fechaApertura: convocatoriaMostrar.fechaApertura || convocatoriaMostrar.fecha_apertura,
                            fechaCierre: convocatoriaMostrar.fechaCierre || convocatoriaMostrar.fecha_cierre,
                            modeloAdmision: convocatoriaMostrar.modeloAdmision || convocatoriaMostrar.modelo_admision,
                            estado: convocatoriaMostrar.estado,
                            semestre: convocatoriaMostrar.semestre,
                          });
                          setShowEditarModal(true);
                        }}
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
                    Cambiar Periodo / Convocatoria:
                  </label>
                  <select
                    value={filtroConvocatoria}
                    onChange={(e) => {
                      setFiltroConvocatoria(e.target.value);
                      setPaginaCandidatos(1);
                    }}
                    className="w-full text-xs font-semibold text-[#212121] bg-white border border-[#E0E0E0] rounded-lg px-2.5 py-2 focus:ring-1 focus:ring-[#01579B] focus:border-[#01579B] focus:outline-none cursor-pointer"
                  >
                    <option value="TODAS">🌐 Todas las Convocatorias ({candidatos?.length || 0})</option>
                    {listaConvocatorias.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.estado === 'ABIERTA' ? '🟢' : '⚪'} {c.denominacion} ({c.totalCandidatos} post.)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between text-xs text-[#757575] pt-2 border-t border-[#E0E0E0]">
                  <span className="truncate">Semestre: <strong className="text-[#424242]">{convocatoriaMostrar?.semestre || 'General'}</strong></span>
                  <span className="text-[11px] font-mono font-bold text-[#01579B]">
                    {metricasActivas.totalCandidatos} post.
                  </span>
                </div>
              </div>

              {/* Menú de Navegación Vertical (Lateral Navigation Grupo FUNIBER SD) */}
              <nav className="space-y-1">
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#757575]">
                  Gestión de Convocatoria
                </div>

                <button
                  onClick={() => setSeccionActiva('candidatos')}
                  className={`w-full flex items-center px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                    seccionActiva === 'candidatos'
                      ? 'bg-[#E6EFF5] text-[#01579B] border-l-4 border-[#01579B] font-bold rounded-r-lg shadow-2xs'
                      : 'text-[#424242] hover:bg-[#F5F5F5] hover:text-[#212121] rounded-lg'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Users className={`w-4 h-4 ${seccionActiva === 'candidatos' ? 'text-[#01579B]' : 'text-[#757575]'}`} />
                    <span className="truncate">Aspirantes & Selección</span>
                  </div>
                </button>

                <button
                  onClick={() => setSeccionActiva('equipos')}
                  className={`w-full flex items-center px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                    seccionActiva === 'equipos'
                      ? 'bg-[#E6EFF5] text-[#01579B] border-l-4 border-[#01579B] font-bold rounded-r-lg shadow-2xs'
                      : 'text-[#424242] hover:bg-[#F5F5F5] hover:text-[#212121] rounded-lg'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Building2 className={`w-4 h-4 ${seccionActiva === 'equipos' ? 'text-[#01579B]' : 'text-[#757575]'}`} />
                    <span className="truncate">Equipos CTS (Squads)</span>
                  </div>
                </button>

                <button
                  onClick={() => setSeccionActiva('alumnos')}
                  className={`w-full flex items-center px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                    seccionActiva === 'alumnos'
                      ? 'bg-[#E6EFF5] text-[#01579B] border-l-4 border-[#01579B] font-bold rounded-r-lg shadow-2xs'
                      : 'text-[#424242] hover:bg-[#F5F5F5] hover:text-[#212121] rounded-lg'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <GraduationCap className={`w-4 h-4 ${seccionActiva === 'alumnos' ? 'text-[#01579B]' : 'text-[#757575]'}`} />
                    <span className="truncate">Alumnos PROFER</span>
                  </div>
                </button>

                <button
                  onClick={() => setSeccionActiva('convocatoria')}
                  className={`w-full flex items-center px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                    seccionActiva === 'convocatoria'
                      ? 'bg-[#E6EFF5] text-[#01579B] border-l-4 border-[#01579B] font-bold rounded-r-lg shadow-2xs'
                      : 'text-[#424242] hover:bg-[#F5F5F5] hover:text-[#212121] rounded-lg'
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
                onClick={() => setShowAperturarModal(true)}
                className="w-full py-2 px-3 bg-[#01579B] hover:bg-[#004174] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Aperturar Convocatoria</span>
              </button>

              <button
                onClick={() => setShowRegisterModal(true)}
                className="w-full py-2 px-3 border border-[#01579B] text-[#01579B] hover:bg-[#E6EFF5] text-xs font-semibold rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Inscribir Aspirante</span>
              </button>

              <button
                onClick={() => setShowImportSedeModal(true)}
                className="w-full py-2 px-3 border border-[#E0E0E0] text-[#424242] hover:bg-[#F5F5F5] text-xs font-semibold rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5 text-[#616161]" />
                <span>Importar Nómina de Sede</span>
              </button>

              {convocatoriaActiva && (
                <button
                  onClick={() => setShowCloseModal(true)}
                  className="w-full py-2 px-3 border border-[#FFCDD2] text-[#D32F2F] hover:bg-[#FFEBEE] text-xs font-semibold rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-[#D32F2F]" />
                  <span>Cerrar Corte Semestral</span>
                </button>
              )}

              {!convocatoriaActiva && ultimaConvocatoria && (
                <button
                  onClick={() => reabrirConvocatoriaMutation.mutate(ultimaConvocatoria.id)}
                  disabled={reabrirConvocatoriaMutation.isPending}
                  className="w-full py-2 px-3 border border-[#FFE0B2] text-[#E65100] hover:bg-[#FFF3E0] text-xs font-semibold rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#E65100]" />
                  <span>Reabrir Convocatoria</span>
                </button>
              )}
            </div>
          </aside>
        )}

        {/* ========================================================= */}
        {/* ÁREA DE CONTENIDO PRINCIPAL SEGÚN VENTANA ACTIVA          */}
        {/* ========================================================= */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          
          {/* ========================================================= */}
          {/* 1. VENTANA: ASPIRANTES & SELECCIÓN                        */}
          {/* ========================================================= */}
          {seccionActiva === 'candidatos' && (
            <div className="space-y-6">
              {/* Cabecera de la Sección */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold text-[#212121] flex items-center space-x-2">
                    <Users className="w-5 h-5 text-[#01579B]" />
                    <span>Aspirantes & Embudo de Admisión</span>
                  </h1>
                  <p className="text-xs text-[#757575] mt-0.5">
                    Seguimiento individual de postulantes, credenciales enviadas y convocatorias a entrevista.
                  </p>
                </div>
                <div className="flex items-center space-x-2 self-start sm:self-auto">
                  <button
                    onClick={() => setShowImportSedeModal(true)}
                    className="px-3.5 py-2 border border-[#E0E0E0] bg-white hover:bg-[#F5F5F5] text-[#424242] text-xs font-semibold rounded-lg shadow-2xs transition-colors inline-flex items-center space-x-1.5 cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-[#616161]" />
                    <span>Importar Nómina Sede</span>
                  </button>
                  <button
                    onClick={() => setShowRegisterModal(true)}
                    className="px-4 py-2 bg-[#01579B] hover:bg-[#004174] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors inline-flex items-center space-x-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Nuevo Aspirante</span>
                  </button>
                </div>
              </div>

              {/* Embudo de Candidatos (Métricas reactivas limpias y con jerarquía FUNIBER SD) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="bg-white p-3.5 rounded-lg border border-[#E0E0E0] shadow-xs">
                  <span className="text-[11px] font-semibold text-[#757575] block uppercase tracking-wider">Postulados</span>
                  <p className="text-2xl font-black text-[#212121] mt-1">{metricasActivas.totalCandidatos}</p>
                </div>
                <div className="bg-white p-3.5 rounded-lg border border-[#FFE0B2] shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#E65100] block uppercase tracking-wider">En Proceso</span>
                    <span className="w-2 h-2 rounded-full bg-[#FF9800]" />
                  </div>
                  <p className="text-2xl font-black text-[#E65100] mt-1">{metricasActivas.enProceso}</p>
                </div>
                <div className="bg-white p-3.5 rounded-lg border border-[#CCDDEB] shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#01579B] block uppercase tracking-wider">Tests Listos</span>
                    <span className="w-2 h-2 rounded-full bg-[#01579B]" />
                  </div>
                  <p className="text-2xl font-black text-[#01579B] mt-1">{metricasActivas.testsCompletados}</p>
                </div>
                <div className="bg-white p-3.5 rounded-lg border border-[#C4D9FD] shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#084DC4] block uppercase tracking-wider">Entrevistas</span>
                    <span className="w-2 h-2 rounded-full bg-[#2873F6]" />
                  </div>
                  <p className="text-2xl font-black text-[#084DC4] mt-1">{metricasActivas.entrevistaAgendada}</p>
                </div>
                <div className="bg-white p-3.5 rounded-lg border border-[#C8E6C9] shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#1B5E20] block uppercase tracking-wider">Admitidos</span>
                    <span className="w-2 h-2 rounded-full bg-[#4CAF50]" />
                  </div>
                  <p className="text-2xl font-black text-[#1B5E20] mt-1">{metricasActivas.admitidos}</p>
                </div>
                <div className="bg-white p-3.5 rounded-lg border border-[#FFCDD2] shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#B71C1C] block uppercase tracking-wider">Abandonadas</span>
                    <span className="w-2 h-2 rounded-full bg-[#F44336]" />
                  </div>
                  <p className="text-2xl font-black text-[#B71C1C] mt-1">{metricasActivas.abandonos}</p>
                </div>
              </div>

              {/* Barra de Filtros y Búsqueda */}
              <div className="bg-white p-3.5 rounded-lg border border-[#E0E0E0] shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#757575] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={busquedaCandidato}
                    onChange={(e) => {
                      setBusquedaCandidato(e.target.value);
                      setPaginaCandidatos(1);
                    }}
                    placeholder="Buscar por nombre, apellidos o correo..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#01579B] focus:border-[#01579B] focus:outline-none bg-[#FAFAFA] text-[#212121]"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center space-x-1">
                    <Filter className="w-3.5 h-3.5 text-[#757575]" />
                    <select
                      value={filtroEstadoCandidato}
                      onChange={(e) => {
                        setFiltroEstadoCandidato(e.target.value);
                        setPaginaCandidatos(1);
                      }}
                      className="text-xs border border-[#E0E0E0] rounded-lg px-2.5 py-2 bg-[#FAFAFA] text-[#424242] focus:outline-none focus:ring-2 focus:ring-[#01579B]"
                    >
                      <option value="TODOS">Todos los Estados</option>
                      <option value="EN_PROCESO">En Proceso</option>
                      <option value="TESTS_COMPLETADOS">Tests Listos</option>
                      <option value="ENTREVISTA_AGENDADA">Entrevista Agendada</option>
                      <option value="ADMITIDO">Admitidos</option>
                      <option value="ABANDONADO">Candidaturas Abandonadas</option>
                    </select>
                  </div>

                  <select
                    value={filtroSedeCandidato}
                    onChange={(e) => {
                      setFiltroSedeCandidato(e.target.value);
                      setPaginaCandidatos(1);
                    }}
                    className="text-xs border border-[#E0E0E0] rounded-lg px-2.5 py-2 bg-[#FAFAFA] text-[#424242] focus:outline-none focus:ring-2 focus:ring-[#01579B]"
                  >
                    <option value="TODAS">Todas las Sedes</option>
                    <option value="SDR_ESP">Santander (España)</option>
                    <option value="GTM_GUA">Guatemala</option>
                    <option value="COL_BOG">Bogotá</option>
                    <option value="MEX_CDMX">México</option>
                    <option value="PER_LIM">Lima</option>
                  </select>
                </div>
              </div>

              {/* Tabla de Postulantes Activos (Estilo Oficial FUNIBER SD) */}
              <div className="bg-white border border-[#E0E0E0] rounded-lg shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#424242]">
                    <thead className="bg-[#FAFAFA] text-[11px] font-bold uppercase tracking-wider text-[#616161] border-b border-[#E0E0E0]">
                      <tr>
                        <th className="px-5 py-3">Candidato</th>
                        <th className="px-4 py-3">Convocatoria</th>
                        <th className="px-4 py-3">Sede</th>
                        <th className="px-4 py-3">Estado Postulación</th>
                        <th className="px-4 py-3">Invitación & Credenciales</th>
                        <th className="px-4 py-3">Test Técnico</th>
                        <th className="px-4 py-3">Entrevista Meet</th>
                        <th className="px-5 py-3 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EEEEEE]">
                      {candidatosFiltrados.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-6 py-12 text-center text-xs text-[#757575] italic">
                            No se encontraron candidatos con los filtros seleccionados.
                          </td>
                        </tr>
                      ) : (
                        candidatosPaginados.map((cand: any) => {
                          const testTecnico =
                            cand.tests?.find((t: any) => t.tipoBateria === 'TECNICO') || cand.tests?.[0];
                          const tieneMeet = Boolean(cand.entrevista);
                          const invitacionEnviada = Boolean(
                            cand.invitacionEnviada || cand.perfilCompetencias?.invitacion?.enviada,
                          );

                          return (
                            <tr key={cand.id} className="hover:bg-[#F7F9FC] transition-colors">
                              <td className="px-5 py-3.5">
                                <span className="font-bold text-[#212121] block text-xs">
                                  {cand.nombreCompleto}
                                </span>
                                <span className="text-[11px] text-[#757575] block font-mono">
                                  {cand.email}
                                </span>
                              </td>
                              
                              <td className="px-4 py-3.5">
                                <div className="max-w-[190px]">
                                  <span className="font-semibold text-[#212121] block text-xs truncate" title={cand.convocatoriaNombre}>
                                    {cand.convocatoriaNombre}
                                  </span>
                                  <div className="flex items-center space-x-1.5 mt-0.5">
                                    <span className="text-[10px] text-[#757575] font-mono truncate" title={cand.semestreNombre}>
                                      {cand.semestreNombre}
                                    </span>
                                    <span
                                      className={`px-1.5 py-0.2 rounded text-[9px] font-bold shrink-0 ${
                                        cand.convocatoriaEstado === 'ABIERTA'
                                          ? 'bg-[#E8F5E9] text-[#1B5E20]'
                                          : 'bg-[#F5F5F5] text-[#616161]'
                                      }`}
                                    >
                                      {cand.convocatoriaEstado === 'ABIERTA' ? 'Activa' : 'Cerrada'}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-3.5 text-xs font-mono font-medium text-[#616161]">
                                {cand.sedeOrigen}
                              </td>

                              <td className="px-4 py-3.5">
                                <span
                                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                    cand.estadoPostulacion === 'ADMITIDO'
                                      ? 'bg-[#E8F5E9] text-[#1B5E20] border-[#C8E6C9]'
                                      : cand.estadoPostulacion === 'TESTS_COMPLETADOS'
                                      ? 'bg-[#E6EFF5] text-[#01579B] border-[#CCDDEB]'
                                      : cand.estadoPostulacion === 'ENTREVISTA_AGENDADA'
                                      ? 'bg-[#E8F0FE] text-[#084DC4] border-[#C4D9FD]'
                                      : cand.estadoPostulacion === 'EN_PROCESO'
                                      ? 'bg-[#FFF3E0] text-[#E65100] border-[#FFE0B2]'
                                      : cand.estadoPostulacion === 'ABANDONADO' || cand.estadoPostulacion === 'RECHAZADO'
                                      ? 'bg-[#FFEBEE] text-[#B71C1C] border-[#FFCDD2]'
                                      : 'bg-[#F5F5F5] text-[#616161] border-[#E0E0E0]'
                                  }`}
                                >
                                  {cand.estadoPostulacion === 'ADMITIDO'
                                    ? `Admitido ${cand.porcentajeAcceso !== undefined && cand.porcentajeAcceso !== null ? `(${cand.porcentajeAcceso}%)` : ''}`
                                    : cand.estadoPostulacion === 'ABANDONADO' || cand.estadoPostulacion === 'RECHAZADO'
                                    ? 'Abandonada'
                                    : cand.estadoPostulacion}
                                </span>
                              </td>

                              <td className="px-4 py-3.5">
                                <button
                                  onClick={() =>
                                    setCandidatoParaInvitacion({
                                      id: cand.id,
                                      nombre: cand.nombreCompleto,
                                      email: cand.email,
                                    })
                                  }
                                  className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                                    invitacionEnviada
                                      ? 'bg-[#E8F5E9] text-[#1B5E20] border-[#C8E6C9] hover:bg-[#C8E6C9]/40'
                                      : 'bg-[#FFF3E0] text-[#E65100] border-[#FFE0B2] hover:bg-[#FFE0B2]/50'
                                  }`}
                                  title={
                                    invitacionEnviada
                                      ? 'Invitación enviada - Clic para ver credenciales'
                                      : 'Clic para enviar credenciales por correo'
                                  }
                                >
                                  {invitacionEnviada ? (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" />
                                      <span>Enviada</span>
                                    </>
                                  ) : (
                                    <>
                                      <Mail className="w-3.5 h-3.5 text-[#F57C00]" />
                                      <span>Credenciales</span>
                                    </>
                                  )}
                                </button>
                              </td>

                              <td className="px-4 py-3.5">
                                {testTecnico ? (
                                  <div className="text-xs">
                                    <span className="font-bold text-[#212121]">
                                      {testTecnico.calificacion !== null
                                        ? `${Number(testTecnico.calificacion).toFixed(1)} / 10`
                                        : '—'}
                                    </span>
                                    <span className="text-[10px] text-[#757575] block font-mono">
                                      {testTecnico.estado}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-[#757575]">—</span>
                                )}
                              </td>

                              <td className="px-4 py-3.5">
                                {tieneMeet ? (
                                  <span className="inline-flex items-center text-xs text-[#084DC4] font-semibold">
                                    <Video className="w-3.5 h-3.5 mr-1" />
                                    {new Date(cand.entrevista.fechaHoraProgramada).toLocaleDateString()}
                                  </span>
                                ) : (
                                  <span className="text-xs text-[#757575] italic">Pendiente</span>
                                )}
                              </td>

                              <td className="px-5 py-3.5 text-right">
                                <button
                                  onClick={() => navigate(`/admisiones/candidatos/${cand.id}`)}
                                  className="px-3 py-1.5 bg-[#E6EFF5] hover:bg-[#01579B] text-[#01579B] hover:text-white border border-[#CCDDEB] hover:border-[#01579B] text-xs font-semibold rounded-lg transition-colors inline-flex items-center space-x-1 cursor-pointer"
                                >
                                  <span>Expediente</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Controles de Paginación de Aspirantes */}
                {totalCandidatosFiltrados > 0 && (
                  <div className="px-5 py-3.5 bg-[#FAFAFA] border-t border-[#E0E0E0] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#616161]">
                    <div className="flex items-center space-x-2">
                      <span>Mostrando</span>
                      <strong className="text-[#212121]">
                        {(paginaCandidatos - 1) * candidatosPorPagina + 1}
                      </strong>
                      <span>a</span>
                      <strong className="text-[#212121]">
                        {Math.min(paginaCandidatos * candidatosPorPagina, totalCandidatosFiltrados)}
                      </strong>
                      <span>de</span>
                      <strong className="text-[#212121]">{totalCandidatosFiltrados}</strong>
                      <span>postulantes</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <select
                        value={candidatosPorPagina}
                        onChange={(e) => {
                          setCandidatosPorPagina(Number(e.target.value));
                          setPaginaCandidatos(1);
                        }}
                        className="border border-[#E0E0E0] rounded-lg px-2 py-1 bg-white text-xs font-semibold text-[#424242] focus:outline-none focus:ring-1 focus:ring-[#01579B]"
                      >
                        <option value={5}>5 por pág.</option>
                        <option value={10}>10 por pág.</option>
                        <option value={20}>20 por pág.</option>
                        <option value={50}>50 por pág.</option>
                      </select>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => setPaginaCandidatos((p) => Math.max(p - 1, 1))}
                          disabled={paginaCandidatos === 1}
                          className="p-1.5 border border-[#E0E0E0] rounded-lg bg-white text-[#424242] hover:bg-[#F5F5F5] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="px-2 font-mono text-xs font-bold text-[#212121]">
                          {paginaCandidatos} / {totalPaginasCandidatos}
                        </span>
                        <button
                          onClick={() => setPaginaCandidatos((p) => Math.min(p + 1, totalPaginasCandidatos))}
                          disabled={paginaCandidatos === totalPaginasCandidatos}
                          className="p-1.5 border border-[#E0E0E0] rounded-lg bg-white text-[#424242] hover:bg-[#F5F5F5] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. VENTANA: EQUIPOS CTS (SQUADS)                          */}
          {/* ========================================================= */}
          {seccionActiva === 'equipos' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold text-[#212121] flex items-center space-x-2">
                    <Building2 className="w-5 h-5 text-[#01579B]" />
                    <span>Equipos de Desarrollo & Squads CTS</span>
                  </h1>
                  <p className="text-xs text-[#757575] mt-0.5">
                    Coordinación de especialidades técnicas, capacidad de acogida y supervisión de los 4 líderes de squad.
                  </p>
                </div>
              </div>

              {/* Grid 2x2 de los 4 Squads Oficiales FUNIBER */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {(equipos || []).map((eq: any) => {
                  const estaExpandido = Boolean(squadsExpandidos[eq.id]);
                  const miembros = eq.miembros || [];

                  // Map exact technical leaders according to group definition
                  let techLeader = 'Coordinador Técnico';
                  if (eq.nombre?.includes('Presencia') || eq.codigo === 'TEAM-03') techLeader = 'Diego Moys';
                  else if (eq.nombre?.includes('Fénix') || eq.codigo === 'TEAM-01') techLeader = 'Alejandro Ruiz';
                  else if (eq.nombre?.includes('Sistemas') || eq.codigo === 'TEAM-02') techLeader = 'Lucía Vargas';
                  else if (eq.nombre?.includes('Docente') || eq.codigo === 'TEAM-04') techLeader = 'Marcos Navarro';

                  return (
                    <div
                      key={eq.id}
                      className="bg-white border border-[#E0E0E0] rounded-lg shadow-xs hover:border-[#CCDDEB] transition-all flex flex-col justify-between overflow-hidden"
                    >
                      <div className="p-5 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-[#757575] uppercase block">
                              {eq.codigo}
                            </span>
                            <h3 className="font-bold text-base text-[#212121] mt-0.5">
                              {eq.nombre}
                            </h3>
                          </div>
                          <span className="bg-[#E6EFF5] text-[#01579B] border border-[#CCDDEB] text-[11px] font-bold px-2.5 py-1 rounded-md">
                            Líder: {techLeader}
                          </span>
                        </div>

                        <p className="text-xs text-[#616161] leading-relaxed">
                          {eq.descripcion || eq.especialidad}
                        </p>

                        {/* Tecnologías oficiales del Squad */}
                        {eq.tecnologias && eq.tecnologias.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {eq.tecnologias.map((tech: string) => (
                              <span
                                key={tech}
                                className="bg-[#F5F5F5] text-[#424242] border border-[#E0E0E0] text-[10px] font-semibold px-2 py-0.5 rounded"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="px-5 py-3 bg-[#FAFAFA] border-t border-[#E0E0E0] flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-3 text-[#616161]">
                          <span>
                            Alumnos asignados: <strong className="text-[#212121]">{miembros.length}</strong>
                          </span>
                          <span>•</span>
                          <span>Capacidad: <strong className="text-[#212121]">{eq.capacidadMaxima || 6}</strong></span>
                        </div>

                        <button
                          onClick={() => toggleExpandirSquad(eq.id)}
                          className="text-xs font-semibold text-[#01579B] hover:text-[#004174] inline-flex items-center space-x-1 cursor-pointer"
                        >
                          <span>{estaExpandido ? 'Ocultar alumnos' : 'Ver alumnos'}</span>
                          {estaExpandido ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* Lista de Miembros si está expandido */}
                      {estaExpandido && (
                        <div className="p-4 bg-[#FAFAFA] border-t border-[#E0E0E0] space-y-2">
                          {miembros.length === 0 ? (
                            <p className="text-xs text-[#757575] italic text-center py-2">
                              Aún no hay alumnos activos asignados a este squad.
                            </p>
                          ) : (
                            <div className="divide-y divide-[#EEEEEE] bg-white rounded border border-[#E0E0E0]">
                              {miembros.map((m: any) => (
                                <div key={m.id} className="p-2.5 flex items-center justify-between text-xs">
                                  <div>
                                    <span className="font-bold text-[#212121] block">
                                      {m.nombre} {m.apellidos}
                                    </span>
                                    <span className="text-[11px] text-[#757575] font-mono">{m.email}</span>
                                  </div>
                                  <button
                                    onClick={() =>
                                      setAlumnoParaTransferir({
                                        id: m.id,
                                        nombreCompleto: `${m.nombre} ${m.apellidos}`,
                                        email: m.email,
                                        squadActualId: eq.id,
                                        squadActualNombre: eq.nombre,
                                      })
                                    }
                                    className="px-2 py-1 border border-[#E0E0E0] bg-white hover:bg-[#F5F5F5] text-[#424242] text-[11px] font-semibold rounded inline-flex items-center space-x-1 cursor-pointer"
                                    title="Transferir a otro Squad"
                                  >
                                    <ArrowRightLeft className="w-3 h-3 text-[#616161]" />
                                    <span>Transferir</span>
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. VENTANA: ALUMNOS PROFER                                */}
          {/* ========================================================= */}
          {seccionActiva === 'alumnos' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold text-[#212121] flex items-center space-x-2">
                    <GraduationCap className="w-5 h-5 text-[#01579B]" />
                    <span>Nómina de Alumnos Admitidos PROFER</span>
                  </h1>
                  <p className="text-xs text-[#757575] mt-0.5">
                    Estudiantes incorporados al programa de alto rendimiento, asignación a squads y becas otorgadas.
                  </p>
                </div>
              </div>

              {/* Barra de Filtro de Alumnos */}
              <div className="bg-white p-3.5 rounded-lg border border-[#E0E0E0] shadow-xs">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#757575] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={busquedaAlumno}
                    onChange={(e) => {
                      setBusquedaAlumno(e.target.value);
                      setPaginaAlumnos(1);
                    }}
                    placeholder="Buscar alumno por nombre, correo o squad asignado..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#01579B] focus:border-[#01579B] focus:outline-none bg-[#FAFAFA] text-[#212121]"
                  />
                </div>
              </div>

              {/* Tabla de Alumnos */}
              <div className="bg-white border border-[#E0E0E0] rounded-lg shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#424242]">
                    <thead className="bg-[#FAFAFA] text-[11px] font-bold uppercase tracking-wider text-[#616161] border-b border-[#E0E0E0]">
                      <tr>
                        <th className="px-5 py-3">Alumno</th>
                        <th className="px-4 py-3">Squad Asignado</th>
                        <th className="px-4 py-3">Acceso / Beca</th>
                        <th className="px-4 py-3">Convocatoria</th>
                        <th className="px-4 py-3">Fecha Admisión</th>
                        <th className="px-5 py-3 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EEEEEE]">
                      {alumnosFiltrados.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-xs text-[#757575] italic">
                            No hay alumnos registrados en el sistema.
                          </td>
                        </tr>
                      ) : (
                        alumnosPaginados.map((al: any) => (
                          <tr key={al.id} className="hover:bg-[#F7F9FC] transition-colors">
                            <td className="px-5 py-3.5">
                              <span className="font-bold text-[#212121] block text-xs">
                                {al.nombreCompleto}
                              </span>
                              <span className="text-[11px] text-[#757575] block font-mono">
                                {al.email}
                              </span>
                            </td>

                            <td className="px-4 py-3.5">
                              {al.squadActualNombre ? (
                                <span className="bg-[#E6EFF5] text-[#01579B] font-bold text-[10px] px-2 py-0.5 rounded border border-[#CCDDEB] uppercase tracking-wider">
                                  {al.squadActualNombre}
                                </span>
                              ) : (
                                <span className="bg-[#FFF3E0] text-[#E65100] text-[10px] font-bold px-2 py-0.5 rounded border border-[#FFE0B2]">
                                  Incorporación Diferida
                                </span>
                              )}
                            </td>

                            <td className="px-4 py-3.5">
                              <span className="font-mono font-bold text-xs text-[#1B5E20] bg-[#E8F5E9] px-2 py-0.5 rounded border border-[#C8E6C9]">
                                {al.porcentajeAcceso ?? 100}% Beca
                              </span>
                            </td>

                            <td className="px-4 py-3.5 text-xs text-[#616161]">
                              {al.convocatoriaNombre || 'General'}
                            </td>

                            <td className="px-4 py-3.5 text-xs font-mono text-[#616161]">
                              {al.fechaAdmision ? new Date(al.fechaAdmision).toLocaleDateString() : '—'}
                            </td>

                            <td className="px-5 py-3.5 text-right">
                              <button
                                onClick={() =>
                                  setAlumnoParaTransferir({
                                    id: al.id,
                                    nombreCompleto: al.nombreCompleto,
                                    email: al.email,
                                    squadActualId: al.squadActualId,
                                    squadActualNombre: al.squadActualNombre,
                                  })
                                }
                                className="px-3 py-1.5 border border-[#E0E0E0] bg-white hover:bg-[#F5F5F5] text-[#424242] text-xs font-semibold rounded-lg inline-flex items-center space-x-1 cursor-pointer"
                              >
                                <ArrowRightLeft className="w-3.5 h-3.5 text-[#616161]" />
                                <span>Mover Squad</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Paginación Alumnos */}
                {totalAlumnosFiltrados > 0 && (
                  <div className="px-5 py-3.5 bg-[#FAFAFA] border-t border-[#E0E0E0] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#616161]">
                    <div className="flex items-center space-x-2">
                      <span>Mostrando</span>
                      <strong className="text-[#212121]">
                        {(paginaAlumnos - 1) * alumnosPorPagina + 1}
                      </strong>
                      <span>a</span>
                      <strong className="text-[#212121]">
                        {Math.min(paginaAlumnos * alumnosPorPagina, totalAlumnosFiltrados)}
                      </strong>
                      <span>de</span>
                      <strong className="text-[#212121]">{totalAlumnosFiltrados}</strong>
                      <span>alumnos</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <select
                        value={alumnosPorPagina}
                        onChange={(e) => {
                          setAlumnosPorPagina(Number(e.target.value));
                          setPaginaAlumnos(1);
                        }}
                        className="border border-[#E0E0E0] rounded-lg px-2 py-1 bg-white text-xs font-semibold text-[#424242] focus:outline-none focus:ring-1 focus:ring-[#01579B]"
                      >
                        <option value={5}>5 por pág.</option>
                        <option value={10}>10 por pág.</option>
                        <option value={20}>20 por pág.</option>
                        <option value={50}>50 por pág.</option>
                      </select>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => setPaginaAlumnos((p) => Math.max(p - 1, 1))}
                          disabled={paginaAlumnos === 1}
                          className="p-1.5 border border-[#E0E0E0] rounded-lg bg-white text-[#424242] hover:bg-[#F5F5F5] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="px-2 font-mono text-xs font-bold text-[#212121]">
                          {paginaAlumnos} / {totalPaginasAlumnos}
                        </span>
                        <button
                          onClick={() => setPaginaAlumnos((p) => Math.min(p + 1, totalPaginasAlumnos))}
                          disabled={paginaAlumnos === totalPaginasAlumnos}
                          className="p-1.5 border border-[#E0E0E0] rounded-lg bg-white text-[#424242] hover:bg-[#F5F5F5] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 4. VENTANA: CONVOCATORIA & PERIODO                        */}
          {/* ========================================================= */}
          {seccionActiva === 'convocatoria' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold text-[#212121] flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-[#01579B]" />
                    <span>Convocatorias & Periodos de Ingreso</span>
                  </h1>
                  <p className="text-xs text-[#757575] mt-0.5">
                    Historial de convocatorias semestrales, parámetros del modelo de admisión y estados de apertura.
                  </p>
                </div>
                <button
                  onClick={() => setShowAperturarModal(true)}
                  className="px-4 py-2 bg-[#01579B] hover:bg-[#004174] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors inline-flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Aperturar Nueva Convocatoria</span>
                </button>
              </div>

              {/* Tarjeta de Resumen de Convocatoria Actual */}
              {convocatoriaMostrar && (
                <div className="bg-white border border-[#E0E0E0] rounded-lg p-5 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-[#EEEEEE]">
                    <div>
                      <span className="text-[10px] font-bold text-[#757575] uppercase tracking-wider block">
                        Detalle del Periodo Seleccionado
                      </span>
                      <h2 className="text-lg font-bold text-[#212121] mt-0.5">
                        {convocatoriaMostrar.denominacion}
                      </h2>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded border ${
                          convocatoriaMostrar.estado === 'ABIERTA'
                            ? 'text-[#1B5E20] bg-[#E8F5E9] border-[#C8E6C9]'
                            : 'text-[#616161] bg-[#F5F5F5] border-[#E0E0E0]'
                        }`}
                      >
                        {convocatoriaMostrar.estado}
                      </span>
                      <button
                        onClick={() => {
                          setConvocatoriaAEditar({
                            id: convocatoriaMostrar.id,
                            denominacion: convocatoriaMostrar.denominacion,
                            fechaApertura: convocatoriaMostrar.fechaApertura || convocatoriaMostrar.fecha_apertura,
                            fechaCierre: convocatoriaMostrar.fechaCierre || convocatoriaMostrar.fecha_cierre,
                            modeloAdmision: convocatoriaMostrar.modeloAdmision || convocatoriaMostrar.modelo_admision,
                            estado: convocatoriaMostrar.estado,
                            semestre: convocatoriaMostrar.semestre,
                          });
                          setShowEditarModal(true);
                        }}
                        className="px-3 py-1 bg-[#E6EFF5] hover:bg-[#01579B] text-[#01579B] hover:text-white border border-[#CCDDEB] hover:border-[#01579B] text-xs font-semibold rounded-lg transition-colors inline-flex items-center space-x-1 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Editar Parámetros</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    <div className="p-3 bg-[#FAFAFA] rounded-lg border border-[#E0E0E0]">
                      <span className="text-[#757575] block text-[11px] font-semibold">Semestre Académico</span>
                      <strong className="text-sm text-[#212121] mt-0.5 block">{convocatoriaMostrar.semestre || 'General'}</strong>
                    </div>
                    <div className="p-3 bg-[#FAFAFA] rounded-lg border border-[#E0E0E0]">
                      <span className="text-[#757575] block text-[11px] font-semibold">Modelo de Admisión</span>
                      <strong className="text-sm text-[#212121] mt-0.5 block">{convocatoriaMostrar.modeloAdmision || 'ESTANDAR'}</strong>
                    </div>
                    <div className="p-3 bg-[#FAFAFA] rounded-lg border border-[#E0E0E0]">
                      <span className="text-[#757575] block text-[11px] font-semibold">Fecha de Apertura</span>
                      <strong className="text-sm font-mono text-[#212121] mt-0.5 block">
                        {convocatoriaMostrar.fechaApertura
                          ? new Date(convocatoriaMostrar.fechaApertura).toLocaleDateString()
                          : '—'}
                      </strong>
                    </div>
                    <div className="p-3 bg-[#FAFAFA] rounded-lg border border-[#E0E0E0]">
                      <span className="text-[#757575] block text-[11px] font-semibold">Fecha de Cierre Previsto</span>
                      <strong className="text-sm font-mono text-[#212121] mt-0.5 block">
                        {convocatoriaMostrar.fechaCierre
                          ? new Date(convocatoriaMostrar.fechaCierre).toLocaleDateString()
                          : 'Abierta indefinidamente'}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Historial de Todas las Convocatorias */}
              <div className="bg-white border border-[#E0E0E0] rounded-lg shadow-xs overflow-hidden">
                <div className="px-5 py-3.5 bg-[#FAFAFA] border-b border-[#E0E0E0] font-bold text-xs text-[#212121]">
                  Historial de Convocatorias del Programa PROFER
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#424242]">
                    <thead className="bg-[#FAFAFA] text-[11px] font-bold uppercase tracking-wider text-[#616161] border-b border-[#E0E0E0]">
                      <tr>
                        <th className="px-5 py-3">Convocatoria</th>
                        <th className="px-4 py-3">Semestre</th>
                        <th className="px-4 py-3">Estado</th>
                        <th className="px-4 py-3">Total Postulantes</th>
                        <th className="px-4 py-3">Fechas</th>
                        <th className="px-5 py-3 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EEEEEE]">
                      {listaConvocatorias.map((conv: any) => (
                        <tr key={conv.id} className="hover:bg-[#F7F9FC] transition-colors">
                          <td className="px-5 py-3.5 font-bold text-[#212121]">
                            {conv.denominacion}
                          </td>
                          <td className="px-4 py-3.5 text-xs text-[#616161]">
                            {conv.semestre}
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                                conv.estado === 'ABIERTA'
                                  ? 'bg-[#E8F5E9] text-[#1B5E20] border-[#C8E6C9]'
                                  : 'bg-[#F5F5F5] text-[#616161] border-[#E0E0E0]'
                              }`}
                            >
                              {conv.estado}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 font-mono font-bold text-xs text-[#01579B]">
                            {conv.totalCandidatos} postulantes
                          </td>
                          <td className="px-4 py-3.5 text-xs font-mono text-[#757575]">
                            {conv.fechaApertura ? new Date(conv.fechaApertura).toLocaleDateString() : '—'} al{' '}
                            {conv.fechaCierre ? new Date(conv.fechaCierre).toLocaleDateString() : 'Activo'}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <button
                              onClick={() => {
                                setFiltroConvocatoria(conv.id);
                                setSeccionActiva('candidatos');
                              }}
                              className="px-2.5 py-1 bg-[#E6EFF5] hover:bg-[#01579B] text-[#01579B] hover:text-white border border-[#CCDDEB] hover:border-[#01579B] text-xs font-semibold rounded-lg transition-colors inline-flex items-center space-x-1 cursor-pointer"
                            >
                              <Users className="w-3 h-3" />
                              <span>Ver Candidatos</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================= */}
      {/* MODALES DEL SISTEMA (Click fuera del backdrop cierra)     */}
      {/* ========================================================= */}

      {/* Modal de Movilidad de Alumnos entre Squads */}
      {alumnoParaTransferir && (
        <div
          className="fixed inset-0 bg-[#000000]/40 backdrop-blur-2xs z-50 flex items-center justify-center p-4"
          onClick={() => setAlumnoParaTransferir(null)}
        >
          <div
            className="bg-white rounded-lg shadow-md max-w-md w-full p-6 space-y-4 border border-[#E0E0E0]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#EEEEEE]">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-[#E6EFF5] text-[#01579B] rounded-lg">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#212121] text-base">Reasignar Alumno de Squad</h3>
                  <p className="text-xs text-[#757575]">Movilidad entre equipos CTS.</p>
                </div>
              </div>
              <button
                onClick={() => setAlumnoParaTransferir(null)}
                className="p-1 rounded-lg text-[#757575] hover:text-[#212121] hover:bg-[#F5F5F5] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#FAFAFA] rounded-lg border border-[#E0E0E0]">
                <p className="text-[#757575]">Alumno seleccionado:</p>
                <p className="font-bold text-[#212121] text-sm mt-0.5">{alumnoParaTransferir.nombreCompleto}</p>
                <p className="text-[#757575] font-mono text-[11px]">{alumnoParaTransferir.email}</p>
                <p className="mt-2 text-[#424242]">
                  Squad actual: <strong className="text-[#01579B]">{alumnoParaTransferir.squadActualNombre || 'Sin Squad Asignado'}</strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#424242] mb-1">
                  Nuevo Squad de Destino
                </label>
                <select
                  value={squadDestinoId}
                  onChange={(e) => setSquadDestinoId(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-xs bg-white focus:ring-2 focus:ring-[#01579B] focus:outline-none"
                >
                  <option value="">-- Dejar sin asignar (Incorporación diferida) --</option>
                  {equipos
                    ?.filter((eq: any) => eq.id !== alumnoParaTransferir.squadActualId)
                    .map((eq: any) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.codigo} - {eq.nombre} ({eq.especialidad})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-[#EEEEEE]">
              <button
                onClick={() => setAlumnoParaTransferir(null)}
                className="px-4 py-2 border border-[#E0E0E0] text-[#424242] text-xs font-semibold rounded-lg hover:bg-[#F5F5F5] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => transferirAlumnoMutation.mutate()}
                disabled={transferirAlumnoMutation.isPending}
                className="px-4 py-2 bg-[#01579B] hover:bg-[#004174] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {transferirAlumnoMutation.isPending ? 'Guardando...' : 'Confirmar Reasignación'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Registro de Nuevo Candidato */}
      {showRegisterModal && (
        <div
          className="fixed inset-0 bg-[#000000]/40 backdrop-blur-2xs z-50 flex items-center justify-center p-4"
          onClick={() => setShowRegisterModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-md max-w-md w-full p-6 space-y-4 border border-[#E0E0E0]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#EEEEEE]">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-[#E6EFF5] text-[#01579B] rounded-lg">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#212121] text-base">Inscribir Nuevo Postulante</h3>
                  <p className="text-xs text-[#757575]">Asocia un aspirante a la convocatoria activa.</p>
                </div>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="p-1 rounded-lg text-[#757575] hover:text-[#212121] hover:bg-[#F5F5F5] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#424242] mb-1">Nombre</label>
                  <input
                    type="text"
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    placeholder="Ej. Ana"
                    className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-xs bg-white focus:ring-2 focus:ring-[#01579B] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#424242] mb-1">Apellidos</label>
                  <input
                    type="text"
                    value={nuevoApellidos}
                    onChange={(e) => setNuevoApellidos(e.target.value)}
                    placeholder="Ej. Martínez Gómez"
                    className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-xs bg-white focus:ring-2 focus:ring-[#01579B] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#424242] mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={nuevoEmail}
                  onChange={(e) => setNuevoEmail(e.target.value)}
                  placeholder="ana.martinez@alumnos.uneatlantico.es"
                  className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-xs bg-white focus:ring-2 focus:ring-[#01579B] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#424242] mb-1">Sede de Origen</label>
                  <select
                    value={nuevaSede}
                    onChange={(e) => setNuevaSede(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-xs bg-white focus:ring-2 focus:ring-[#01579B] focus:outline-none"
                  >
                    <option value="SDR_ESP">Santander (España)</option>
                    <option value="GTM_GUA">Guatemala</option>
                    <option value="COL_BOG">Bogotá</option>
                    <option value="MEX_CDMX">México</option>
                    <option value="PER_LIM">Lima</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#424242] mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={nuevoTelefono}
                    onChange={(e) => setNuevoTelefono(e.target.value)}
                    placeholder="+34 600 000 000"
                    className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-xs bg-white focus:ring-2 focus:ring-[#01579B] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#424242] mb-1">Asignar a Convocatoria</label>
                <select
                  value={convocatoriaDestinoId}
                  onChange={(e) => setConvocatoriaDestinoId(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-xs bg-white focus:ring-2 focus:ring-[#01579B] focus:outline-none"
                >
                  <option value="">-- Convocatoria Activa por Defecto --</option>
                  {listaConvocatorias.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.denominacion} ({c.estado})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <label className="flex items-center space-x-2 text-xs text-[#424242] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enviarInvitacionInmediata}
                    onChange={(e) => setEnviarInvitacionInmediata(e.target.checked)}
                    className="rounded border-[#E0E0E0] text-[#01579B] focus:ring-[#01579B]"
                  />
                  <span>Enviar credenciales de acceso por email automáticamente</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-[#EEEEEE]">
              <button
                onClick={() => setShowRegisterModal(false)}
                className="px-4 py-2 border border-[#E0E0E0] text-[#424242] text-xs font-semibold rounded-lg hover:bg-[#F5F5F5] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => registrarCandidatoMutation.mutate(convocatoriaDestinoId || undefined)}
                disabled={!nuevoNombre || !nuevoEmail || registrarCandidatoMutation.isPending}
                className="px-4 py-2 bg-[#01579B] hover:bg-[#004174] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {registrarCandidatoMutation.isPending ? 'Inscribiendo...' : 'Registrar Candidato'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cierre de Corte Semestral */}
      {showCloseModal && convocatoriaActiva && (
        <div
          className="fixed inset-0 bg-[#000000]/40 backdrop-blur-2xs z-50 flex items-center justify-center p-4"
          onClick={() => setShowCloseModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-md max-w-md w-full p-6 space-y-4 border border-[#E0E0E0]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#EEEEEE]">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-[#FFEBEE] text-[#D32F2F] rounded-lg">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#212121] text-base">Cierre de Corte Semestral</h3>
                  <p className="text-xs text-[#757575]">{convocatoriaActiva.denominacion}</p>
                </div>
              </div>
              <button
                onClick={() => setShowCloseModal(false)}
                className="p-1 rounded-lg text-[#757575] hover:text-[#212121] hover:bg-[#F5F5F5] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#424242]">
              <p>
                Al cerrar el corte, la convocatoria pasará a estado <strong>CERRADA</strong> y no admitirá nuevas
                postulaciones públicas.
              </p>
              <div>
                <label className="block text-xs font-semibold text-[#424242] mb-1">
                  Motivo o Dictamen de Cierre:
                </label>
                <textarea
                  value={motivoCierre}
                  onChange={(e) => setMotivoCierre(e.target.value)}
                  placeholder="Ej. Cumplimiento del cupo de 15 postulantes y finalización del periodo de entrevistas..."
                  rows={3}
                  className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-xs bg-white focus:ring-2 focus:ring-[#01579B] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-[#EEEEEE]">
              <button
                onClick={() => setShowCloseModal(false)}
                className="px-4 py-2 border border-[#E0E0E0] text-[#424242] text-xs font-semibold rounded-lg hover:bg-[#F5F5F5] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => cerrarCorteMutation.mutate(convocatoriaActiva.id)}
                disabled={cerrarCorteMutation.isPending}
                className="px-4 py-2 bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {cerrarCorteMutation.isPending ? 'Cerrando...' : 'Confirmar Cierre de Periodo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Invitación / Envío de Credenciales */}
      {candidatoParaInvitacion && (
        <InvitacionCandidatoModal
          isOpen={Boolean(candidatoParaInvitacion)}
          candidatoId={candidatoParaInvitacion.id}
          candidatoNombre={candidatoParaInvitacion.nombre}
          candidatoEmail={candidatoParaInvitacion.email}
          onClose={() => {
            setCandidatoParaInvitacion(null);
            queryClient.invalidateQueries({ queryKey: ['admisiones-panel'] });
          }}
        />
      )}

      {/* Modal de Importación Masiva desde Sede */}
      {showImportSedeModal && (
        <ImportarSedeModal
          isOpen={showImportSedeModal}
          onClose={() => {
            setShowImportSedeModal(false);
            queryClient.invalidateQueries({ queryKey: ['admisiones-panel'] });
          }}
        />
      )}

      {/* Modal de Apertura de Nueva Convocatoria */}
      {showAperturarModal && (
        <AperturarConvocatoriaModal
          isOpen={showAperturarModal}
          onClose={() => {
            setShowAperturarModal(false);
            queryClient.invalidateQueries({ queryKey: ['admisiones-panel'] });
          }}
        />
      )}

      {/* Modal de Edición de Convocatoria */}
      {showEditarModal && convocatoriaAEditar && (
        <EditarConvocatoriaModal
          isOpen={showEditarModal && Boolean(convocatoriaAEditar)}
          convocatoria={convocatoriaAEditar}
          onClose={() => {
            setShowEditarModal(false);
            setConvocatoriaAEditar(null);
            queryClient.invalidateQueries({ queryKey: ['admisiones-panel'] });
          }}
        />
      )}
    </div>
  );
};

export default AdmisionesPanelPage;
