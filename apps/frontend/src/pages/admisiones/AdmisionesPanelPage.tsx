import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Navbar } from '../../components/common/Navbar';
import {
  Users,
  ShieldAlert,
  Lock,
  ChevronRight,
  ChevronLeft,
  Video,
  UserPlus,
  ChevronDown,
  ChevronUp,
  ArrowRightLeft,
  UserCheck,
  Clock,
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
  AlertCircle,
  History,
} from 'lucide-react';
import { InvitacionCandidatoModal } from '../../components/admisiones/InvitacionCandidatoModal';
import { ImportarSedeModal } from '../../components/admisiones/ImportarSedeModal';
import { AperturarConvocatoriaModal } from '../../components/admisiones/AperturarConvocatoriaModal';

export const AdmisionesPanelPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Sección activa en el sidebar de navegación
  const [seccionActiva, setSeccionActiva] = useState<
    'candidatos' | 'equipos' | 'alumnos' | 'convocatoria'
  >('candidatos');

  // Filtros de búsqueda
  const [busquedaCandidato, setBusquedaCandidato] = useState('');
  const [filtroEstadoCandidato, setFiltroEstadoCandidato] = useState('TODOS');
  const [filtroSedeCandidato, setFiltroSedeCandidato] = useState('TODAS');
  const [busquedaAlumno, setBusquedaAlumno] = useState('');

  // Paginación de listados
  const [paginaCandidatos, setPaginaCandidatos] = useState(1);
  const [candidatosPorPagina, setCandidatosPorPagina] = useState(10);
  const [paginaAlumnos, setPaginaAlumnos] = useState(1);
  const [alumnosPorPagina, setAlumnosPorPagina] = useState(10);

  // Modales
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showAperturarModal, setShowAperturarModal] = useState(false);
  const [motivoCierre, setMotivoCierre] = useState('');

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showImportSedeModal, setShowImportSedeModal] = useState(false);
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

  // Estados para ver miembros y movilidad entre squads (Requirements 3 y 4)
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

  // Mutación: Transferir o reasignar alumno entre squads (Requirement 4)
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="w-full px-4 py-12 text-center text-red-600">
          Error al cargar las métricas de admisiones.
        </main>
      </div>
    );
  }

  const {
    convocatoriaActiva,
    ultimaConvocatoria,
    semestresDisponibles = [],
    historicoConvocatorias = [],
    metricasPostulacion = {},
    equipos = [],
    candidatos = [],
    alumnosSinEquipo = [],
  } = data;

  const convocatoriaMostrar = convocatoriaActiva || ultimaConvocatoria;

  // Lista consolidada de todos los alumnos asignados en los squads
  const todosLosAlumnos = (equipos || []).flatMap((eq: any) =>
    (eq.miembros || []).map((m: any) => ({
      ...m,
      squadId: eq.id,
      squadNombre: eq.nombre,
      squadCodigo: eq.codigo,
    })),
  );

  // Filtrado de candidatos
  const candidatosFiltrados = (candidatos || []).filter((cand: any) => {
    const coincideTexto =
      !busquedaCandidato ||
      cand.nombreCompleto?.toLowerCase().includes(busquedaCandidato.toLowerCase()) ||
      cand.email?.toLowerCase().includes(busquedaCandidato.toLowerCase());

    const coincideEstado =
      filtroEstadoCandidato === 'TODOS' || cand.estadoPostulacion === filtroEstadoCandidato;

    const coincideSede =
      filtroSedeCandidato === 'TODAS' || cand.sedeOrigen === filtroSedeCandidato;

    return coincideTexto && coincideEstado && coincideSede;
  });

  const totalCandidatosFiltrados = candidatosFiltrados.length;
  const totalPaginasCandidatos = Math.max(1, Math.ceil(totalCandidatosFiltrados / candidatosPorPagina));
  const candidatosPaginados = candidatosFiltrados.slice(
    (paginaCandidatos - 1) * candidatosPorPagina,
    paginaCandidatos * candidatosPorPagina,
  );

  // Filtrado de alumnos
  const alumnosFiltrados = todosLosAlumnos.filter((al: any) => {
    return (
      !busquedaAlumno ||
      al.nombreCompleto?.toLowerCase().includes(busquedaAlumno.toLowerCase()) ||
      al.email?.toLowerCase().includes(busquedaAlumno.toLowerCase()) ||
      al.squadNombre?.toLowerCase().includes(busquedaAlumno.toLowerCase())
    );
  });

  const totalAlumnosFiltrados = alumnosFiltrados.length;
  const totalPaginasAlumnos = Math.max(1, Math.ceil(totalAlumnosFiltrados / alumnosPorPagina));
  const alumnosPaginados = alumnosFiltrados.slice(
    (paginaAlumnos - 1) * alumnosPorPagina,
    paginaAlumnos * alumnosPorPagina,
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col lg:flex-row w-full px-3 sm:px-6 lg:px-8 py-6 gap-6">
        {/* ========================================================= */}
        {/* SIDEBAR DE NAVEGACIÓN Y CAMBIO DE VENTANAS                */}
        {/* ========================================================= */}
        <aside className="w-full lg:w-72 xl:w-80 shrink-0 space-y-4">
          {/* Tarjeta de Contexto de la Convocatoria */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                  convocatoriaActiva
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    : 'text-rose-700 bg-rose-50 border-rose-200'
                }`}
              >
                {convocatoriaActiva ? 'Convocatoria Abierta' : 'Convocatoria Cerrada'}
              </span>
            </div>
            <h2 className="text-sm font-black text-slate-900 mt-2 truncate">
              {convocatoriaMostrar?.denominacion || 'Sin Convocatoria Activa'}
            </h2>
            <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
              <span>Semestre: <strong>{convocatoriaMostrar?.semestre || 'No asignado'}</strong></span>
              <span>•</span>
              <span className={convocatoriaActiva ? 'text-emerald-600 font-semibold' : 'text-slate-500 font-semibold'}>
                {convocatoriaActiva ? 'ACTIVA' : 'CERRADA'}
              </span>
            </div>
          </div>

          {/* Menú de Navegación Vertical */}
          <nav className="bg-white border border-slate-200 rounded-2xl p-2 shadow-xs space-y-1">
            <button
              onClick={() => setSeccionActiva('candidatos')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                seccionActiva === 'candidatos'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25 ring-1 ring-brand-500'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Users className={`w-4 h-4 ${seccionActiva === 'candidatos' ? 'text-white' : 'text-slate-500'}`} />
                <span className="truncate">Aspirantes & Selección</span>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  seccionActiva === 'candidatos'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {candidatos?.length || 0}
              </span>
            </button>

            <button
              onClick={() => setSeccionActiva('equipos')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                seccionActiva === 'equipos'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25 ring-1 ring-brand-500'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Building2 className={`w-4 h-4 ${seccionActiva === 'equipos' ? 'text-white' : 'text-slate-500'}`} />
                <span className="truncate">Equipos CTS (Squads)</span>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  seccionActiva === 'equipos'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {equipos?.length || 6}
              </span>
            </button>

            <button
              onClick={() => setSeccionActiva('alumnos')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                seccionActiva === 'alumnos'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25 ring-1 ring-brand-500'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <GraduationCap className={`w-4 h-4 ${seccionActiva === 'alumnos' ? 'text-white' : 'text-slate-500'}`} />
                <span className="truncate">Alumnos PROFER</span>
              </div>
              {alumnosSinEquipo && alumnosSinEquipo.length > 0 ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold animate-pulse">
                  {alumnosSinEquipo.length} pend.
                </span>
              ) : (
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    seccionActiva === 'alumnos'
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {todosLosAlumnos.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setSeccionActiva('convocatoria')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                seccionActiva === 'convocatoria'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25 ring-1 ring-brand-500'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Calendar className={`w-4 h-4 ${seccionActiva === 'convocatoria' ? 'text-white' : 'text-slate-500'}`} />
                <span className="truncate">Convocatoria & Periodo</span>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  seccionActiva === 'convocatoria'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {convocatoriaMostrar?.semestre || 'Periodo'}
              </span>
            </button>
          </nav>

          {/* Botones de Acción Rápida en Sidebar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2.5">
            <button
              onClick={() => setShowAperturarModal(true)}
              className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Aperturar Convocatoria</span>
            </button>

            <button
              onClick={() => setShowRegisterModal(true)}
              className="w-full py-2.5 px-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center space-x-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Inscribir Aspirante</span>
            </button>

            <button
              onClick={() => setShowImportSedeModal(true)}
              className="w-full py-2.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center justify-center space-x-1.5"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Importar Nómina de Sede</span>
            </button>

            {convocatoriaActiva && (
              <button
                onClick={() => setShowCloseModal(true)}
                className="w-full py-2 px-3 border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center space-x-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-red-500" />
                <span>Cerrar Corte Semestral</span>
              </button>
            )}

            {!convocatoriaActiva && ultimaConvocatoria && (
              <button
                onClick={() => reabrirConvocatoriaMutation.mutate(ultimaConvocatoria.id)}
                disabled={reabrirConvocatoriaMutation.isPending}
                className="w-full py-2 px-3 border border-amber-300 text-amber-800 hover:bg-amber-50 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center space-x-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                <span>Reabrir Convocatoria</span>
              </button>
            )}
          </div>
        </aside>

        {/* ========================================================= */}
        {/* ÁREA DE CONTENIDO PRINCIPAL SEGÚN VENTANA ACTIVA          */}
        {/* ========================================================= */}
        <main className="flex-1 min-w-0 space-y-6">
          {/* ========================================================= */}
          {/* 1. VENTANA: ASPIRANTES & SELECCIÓN                        */}
          {/* ========================================================= */}
          {seccionActiva === 'candidatos' && (
            <div className="space-y-6">
              {/* Cabecera de la Sección */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                    <Users className="w-5 h-5 text-brand-600" />
                    <span>Aspirantes & Embudo de Admisión</span>
                  </h1>
                  <p className="text-xs text-slate-500">
                    Seguimiento individual de postulantes, credenciales enviadas y convocatorias a entrevista.
                  </p>
                </div>
                <div className="flex items-center space-x-2 self-start sm:self-auto">
                  <button
                    onClick={() => setShowImportSedeModal(true)}
                    className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-xl shadow-2xs transition-colors inline-flex items-center space-x-1.5"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Importar Nómina Sede</span>
                  </button>
                  <button
                    onClick={() => setShowRegisterModal(true)}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors inline-flex items-center space-x-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Nuevo Aspirante</span>
                  </button>
                </div>
              </div>

              {/* Embudo de Candidatos (Métricas en 6 Tarjetas) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[11px] font-medium text-slate-500 block">Postulados</span>
                  <p className="text-xl font-black text-slate-900 mt-0.5">{metricasPostulacion.totalCandidatos}</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-blue-200/70 shadow-xs bg-blue-50/20">
                  <span className="text-[11px] font-medium text-blue-700 block">En Proceso</span>
                  <p className="text-xl font-black text-blue-900 mt-0.5">{metricasPostulacion.enProceso}</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-indigo-200/70 shadow-xs bg-indigo-50/20">
                  <span className="text-[11px] font-medium text-indigo-700 block">Tests Listos</span>
                  <p className="text-xl font-black text-indigo-900 mt-0.5">{metricasPostulacion.testsCompletados}</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-purple-200/70 shadow-xs bg-purple-50/20">
                  <span className="text-[11px] font-medium text-purple-700 block">Entrevistas</span>
                  <p className="text-xl font-black text-purple-900 mt-0.5">{metricasPostulacion.entrevistaAgendada}</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-emerald-200/70 shadow-xs bg-emerald-50/20">
                  <span className="text-[11px] font-medium text-emerald-700 block">Admitidos</span>
                  <p className="text-xl font-black text-emerald-900 mt-0.5">{metricasPostulacion.admitidos}</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-red-200/70 shadow-xs bg-red-50/20">
                  <span className="text-[11px] font-medium text-red-700 block">Rechazados</span>
                  <p className="text-xl font-black text-red-900 mt-0.5">{metricasPostulacion.rechazados}</p>
                </div>
              </div>

              {/* Barra de Filtros y Búsqueda */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={busquedaCandidato}
                    onChange={(e) => {
                      setBusquedaCandidato(e.target.value);
                      setPaginaCandidatos(1);
                    }}
                    placeholder="Buscar por nombre, apellidos o correo..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none bg-slate-50/50"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={filtroEstadoCandidato}
                      onChange={(e) => {
                        setFiltroEstadoCandidato(e.target.value);
                        setPaginaCandidatos(1);
                      }}
                      className="text-xs border border-slate-200 rounded-xl px-2.5 py-2 bg-slate-50/50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="TODOS">Todos los Estados</option>
                      <option value="EN_PROCESO">En Proceso</option>
                      <option value="TESTS_COMPLETADOS">Tests Listos</option>
                      <option value="ENTREVISTA_AGENDADA">Entrevista Agendada</option>
                      <option value="ADMITIDO">Admitidos</option>
                      <option value="RECHAZADO">Rechazados</option>
                    </select>
                  </div>

                  <select
                    value={filtroSedeCandidato}
                    onChange={(e) => {
                      setFiltroSedeCandidato(e.target.value);
                      setPaginaCandidatos(1);
                    }}
                    className="text-xs border border-slate-200 rounded-xl px-2.5 py-2 bg-slate-50/50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
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

              {/* Tabla de Postulantes Activos */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-5 py-3.5">Candidato</th>
                        <th className="px-4 py-3.5">Sede</th>
                        <th className="px-4 py-3.5">Estado Postulación</th>
                        <th className="px-4 py-3.5">Invitación & Credenciales</th>
                        <th className="px-4 py-3.5">Test Técnico</th>
                        <th className="px-4 py-3.5">Entrevista Meet</th>
                        <th className="px-5 py-3.5 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {candidatosFiltrados.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-xs text-slate-400 italic">
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
                            <tr key={cand.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="px-5 py-3.5">
                                <span className="font-bold text-slate-900 block text-xs sm:text-sm">
                                  {cand.nombreCompleto}
                                </span>
                                <span className="text-[11px] text-slate-400 block font-mono">
                                  {cand.email}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 text-xs font-mono font-medium text-slate-600">
                                {cand.sedeOrigen}
                              </td>
                              <td className="px-4 py-3.5">
                                <span
                                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                                    cand.estadoPostulacion === 'ADMITIDO'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : cand.estadoPostulacion === 'TESTS_COMPLETADOS'
                                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                      : cand.estadoPostulacion === 'EN_PROCESO'
                                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                                      : cand.estadoPostulacion === 'RECHAZADO'
                                      ? 'bg-red-50 text-red-700 border-red-200'
                                      : 'bg-slate-100 text-slate-700 border-slate-200'
                                  }`}
                                >
                                  {cand.estadoPostulacion}
                                </span>
                              </td>

                              {/* Invitación y Credenciales */}
                              <td className="px-4 py-3.5">
                                <button
                                  onClick={() =>
                                    setCandidatoParaInvitacion({
                                      id: cand.id,
                                      nombre: cand.nombreCompleto,
                                      email: cand.email,
                                    })
                                  }
                                  className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                                    invitacionEnviada
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                      : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                                  }`}
                                  title={
                                    invitacionEnviada
                                      ? 'Invitación enviada - Clic para ver credenciales'
                                      : 'Clic para enviar credenciales por correo'
                                  }
                                >
                                  {invitacionEnviada ? (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>Enviada</span>
                                    </>
                                  ) : (
                                    <>
                                      <Mail className="w-3.5 h-3.5 text-amber-600" />
                                      <span>Credenciales</span>
                                    </>
                                  )}
                                </button>
                              </td>

                              <td className="px-4 py-3.5">
                                {testTecnico ? (
                                  <div className="text-xs">
                                    <span className="font-bold text-slate-800">
                                      {testTecnico.calificacion !== null
                                        ? `${Number(testTecnico.calificacion).toFixed(1)} / 10`
                                        : '—'}
                                    </span>
                                    <span className="text-[10px] text-slate-400 block font-mono">
                                      {testTecnico.estado}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-slate-400">—</span>
                                )}
                              </td>

                              <td className="px-4 py-3.5">
                                {tieneMeet ? (
                                  <span className="inline-flex items-center text-xs text-indigo-600 font-semibold">
                                    <Video className="w-3.5 h-3.5 mr-1" />
                                    {new Date(cand.entrevista.fechaHoraProgramada).toLocaleDateString()}
                                  </span>
                                ) : (
                                  <span className="text-xs text-slate-400 italic">Pendiente</span>
                                )}
                              </td>

                              <td className="px-5 py-3.5 text-right">
                                <button
                                  onClick={() => navigate(`/admisiones/candidatos/${cand.id}`)}
                                  className="px-3 py-1.5 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 text-xs font-bold rounded-lg transition-colors inline-flex items-center space-x-1"
                                >
                                  <span>Evaluar</span>
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
                  <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                    <div className="flex items-center space-x-2">
                      <span>Mostrando</span>
                      <strong className="text-slate-900">
                        {(paginaCandidatos - 1) * candidatosPorPagina + 1}
                      </strong>
                      <span>a</span>
                      <strong className="text-slate-900">
                        {Math.min(paginaCandidatos * candidatosPorPagina, totalCandidatosFiltrados)}
                      </strong>
                      <span>de</span>
                      <strong className="text-slate-900">{totalCandidatosFiltrados}</strong>
                      <span>aspirantes</span>

                      <span className="mx-2 text-slate-300">|</span>

                      <span className="text-slate-500">Filas:</span>
                      <select
                        value={candidatosPorPagina}
                        onChange={(e) => {
                          setCandidatosPorPagina(Number(e.target.value));
                          setPaginaCandidatos(1);
                        }}
                        className="border border-slate-200 rounded-lg px-2 py-1 bg-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500"
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setPaginaCandidatos((p) => Math.max(1, p - 1))}
                        disabled={paginaCandidatos === 1}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-700 font-semibold inline-flex items-center space-x-1 transition-colors"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Anterior</span>
                      </button>

                      <div className="px-2 font-medium text-slate-600">
                        Página <span className="font-bold text-slate-900">{paginaCandidatos}</span> de{' '}
                        <span className="font-bold text-slate-900">{totalPaginasCandidatos}</span>
                      </div>

                      <button
                        onClick={() => setPaginaCandidatos((p) => Math.min(totalPaginasCandidatos, p + 1))}
                        disabled={paginaCandidatos >= totalPaginasCandidatos}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-700 font-semibold inline-flex items-center space-x-1 transition-colors"
                      >
                        <span>Siguiente</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. VENTANA: GESTIÓN DE EQUIPOS CTS (SQUADS)              */}
          {/* ========================================================= */}
          {seccionActiva === 'equipos' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                    <Building2 className="w-5 h-5 text-brand-600" />
                    <span>Equipos de Desarrollo CTS (Squads)</span>
                  </h1>
                  <p className="text-xs text-slate-500">
                    Estructura de los 6 squads tecnológicos, asignación de líderes y miembros activos.
                  </p>
                </div>
                <div className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-lg self-start sm:self-auto">
                  Total Alumnos Asignados: <strong className="text-brand-600">{todosLosAlumnos.length}</strong>
                </div>
              </div>

              {/* Cuadrícula de los 6 Squads */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {equipos?.map((eq: any) => {
                  const estaExpandido = Boolean(squadsExpandidos[eq.id]);
                  const miembros = eq.miembros || [];

                  return (
                    <div
                      key={eq.id}
                      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs font-mono font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded border border-brand-100">
                              {eq.codigo}
                            </span>
                            <h3 className="text-base font-bold text-slate-900 mt-1">{eq.nombre}</h3>
                            <p className="text-xs text-slate-500 line-clamp-1">{eq.especialidad}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-black text-slate-900">{miembros.length}</span>
                            <span className="text-[10px] text-slate-400 block font-medium">alumnos</span>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 flex justify-between items-center">
                          <span>
                            Tech Leader: <strong>{eq.lider}</strong>
                          </span>
                          <button
                            onClick={() => toggleExpandirSquad(eq.id)}
                            className="text-xs font-bold text-brand-600 hover:text-brand-800 inline-flex items-center space-x-1"
                          >
                            <span>Miembros ({miembros.length})</span>
                            {estaExpandido ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        {/* Lista desplegable de miembros del squad */}
                        {estaExpandido && (
                          <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                            {miembros.length === 0 ? (
                              <p className="text-xs text-slate-400 italic">No hay alumnos asignados a este squad actualmente.</p>
                            ) : (
                              miembros.map((m: any) => (
                                <div
                                  key={m.id}
                                  className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                                >
                                  <div>
                                    <span className="font-bold text-slate-800 block">{m.nombreCompleto}</span>
                                    <span className="text-[11px] text-slate-400 font-mono">{m.email}</span>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setAlumnoParaTransferir({
                                        id: m.id,
                                        nombreCompleto: m.nombreCompleto,
                                        email: m.email,
                                        squadActualId: eq.id,
                                        squadActualNombre: eq.nombre,
                                      });
                                      setSquadDestinoId('');
                                    }}
                                    title="Cambiar a otro squad"
                                    className="p-1.5 bg-white hover:bg-brand-50 text-slate-600 hover:text-brand-700 border border-slate-200 rounded-lg shadow-2xs transition-colors inline-flex items-center space-x-1"
                                  >
                                    <ArrowRightLeft className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-semibold">Mover</span>
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. VENTANA: ALUMNOS PROFER & MOVILIDAD                   */}
          {/* ========================================================= */}
          {seccionActiva === 'alumnos' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                    <GraduationCap className="w-5 h-5 text-brand-600" />
                    <span>Alumnos PROFER & Movilidad de Squad</span>
                  </h1>
                  <p className="text-xs text-slate-500">
                    Estudiantes admitidos e incorporados, gestión de traslados entre squads y asignación diferida.
                  </p>
                </div>
              </div>

              {/* SECCIÓN ALUMNOS ADMITIDOS PENDIENTES DE SQUAD */}
              {alumnosSinEquipo && alumnosSinEquipo.length > 0 && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-xs">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-amber-950 text-base flex items-center space-x-2">
                          <span>Alumnos Admitidos con Asignación de Squad Diferida</span>
                          <span className="text-xs font-black bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full">
                            {alumnosSinEquipo.length} pendientes
                          </span>
                        </h3>
                        <p className="text-xs text-amber-800">
                          Estudiantes admitidos en el programa pendientes de vincular a su equipo técnico definitivo.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-amber-200 rounded-xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-slate-700">
                        <thead className="bg-amber-100/60 text-[11px] font-bold uppercase tracking-wider text-amber-900 border-b border-amber-200">
                          <tr>
                            <th className="px-5 py-3">Alumno PROFER</th>
                            <th className="px-5 py-3">Correo Institucional</th>
                            <th className="px-5 py-3">Fecha de Admisión</th>
                            <th className="px-5 py-3 text-right">Acción</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-amber-100">
                          {alumnosSinEquipo.map((alumno: any) => (
                            <tr key={alumno.id} className="hover:bg-amber-50/50 transition-colors">
                              <td className="px-5 py-3.5 font-bold text-slate-900">
                                {alumno.nombreCompleto}
                              </td>
                              <td className="px-5 py-3.5 font-mono text-xs text-slate-600">
                                {alumno.email}
                              </td>
                              <td className="px-5 py-3.5 text-xs text-slate-500">
                                {new Date(alumno.creadoEn).toLocaleDateString()}
                              </td>
                              <td className="px-5 py-3.5 text-right">
                                <button
                                  onClick={() => {
                                    setAlumnoParaTransferir({
                                      id: alumno.id,
                                      nombreCompleto: alumno.nombreCompleto,
                                      email: alumno.email,
                                      squadActualId: null,
                                      squadActualNombre: 'Sin Squad Asignado',
                                    });
                                    setSquadDestinoId(equipos?.[0]?.id || '');
                                  }}
                                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors inline-flex items-center space-x-1.5"
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>Asignar a Squad</span>
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

              {/* Búsqueda de Alumnos Activos */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={busquedaAlumno}
                    onChange={(e) => {
                      setBusquedaAlumno(e.target.value);
                      setPaginaAlumnos(1);
                    }}
                    placeholder="Buscar alumno por nombre, correo o squad..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none bg-slate-50/50"
                  />
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {alumnosFiltrados.length} alumnos asignados
                </span>
              </div>

              {/* Tabla de Todos los Alumnos Asignados */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-5 py-3.5">Alumno PROFER</th>
                        <th className="px-5 py-3.5">Correo</th>
                        <th className="px-5 py-3.5">Squad Asignado</th>
                        <th className="px-5 py-3.5 text-right">Movilidad</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {alumnosFiltrados.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-xs text-slate-400 italic">
                            No se encontraron alumnos con los criterios de búsqueda.
                          </td>
                        </tr>
                      ) : (
                        alumnosPaginados.map((al: any) => (
                          <tr key={al.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-5 py-3.5 font-bold text-slate-900 text-xs sm:text-sm">
                              {al.nombreCompleto}
                            </td>
                            <td className="px-5 py-3.5 font-mono text-xs text-slate-600">
                              {al.email}
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                                <span className="font-mono font-bold">{al.squadCodigo}</span>
                                <span>-</span>
                                <span>{al.squadNombre}</span>
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <button
                                onClick={() => {
                                  setAlumnoParaTransferir({
                                    id: al.id,
                                    nombreCompleto: al.nombreCompleto,
                                    email: al.email,
                                    squadActualId: al.squadId,
                                    squadActualNombre: al.squadNombre,
                                  });
                                  setSquadDestinoId('');
                                }}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 text-xs font-bold rounded-lg transition-colors inline-flex items-center space-x-1"
                              >
                                <ArrowRightLeft className="w-3.5 h-3.5" />
                                <span>Cambiar Squad</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Controles de Paginación de Alumnos */}
                {totalAlumnosFiltrados > 0 && (
                  <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                    <div className="flex items-center space-x-2">
                      <span>Mostrando</span>
                      <strong className="text-slate-900">
                        {(paginaAlumnos - 1) * alumnosPorPagina + 1}
                      </strong>
                      <span>a</span>
                      <strong className="text-slate-900">
                        {Math.min(paginaAlumnos * alumnosPorPagina, totalAlumnosFiltrados)}
                      </strong>
                      <span>de</span>
                      <strong className="text-slate-900">{totalAlumnosFiltrados}</strong>
                      <span>alumnos</span>

                      <span className="mx-2 text-slate-300">|</span>

                      <span className="text-slate-500">Filas:</span>
                      <select
                        value={alumnosPorPagina}
                        onChange={(e) => {
                          setAlumnosPorPagina(Number(e.target.value));
                          setPaginaAlumnos(1);
                        }}
                        className="border border-slate-200 rounded-lg px-2 py-1 bg-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500"
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setPaginaAlumnos((p) => Math.max(1, p - 1))}
                        disabled={paginaAlumnos === 1}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-700 font-semibold inline-flex items-center space-x-1 transition-colors"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Anterior</span>
                      </button>

                      <div className="px-2 font-medium text-slate-600">
                        Página <span className="font-bold text-slate-900">{paginaAlumnos}</span> de{' '}
                        <span className="font-bold text-slate-900">{totalPaginasAlumnos}</span>
                      </div>

                      <button
                        onClick={() => setPaginaAlumnos((p) => Math.min(totalPaginasAlumnos, p + 1))}
                        disabled={paginaAlumnos >= totalPaginasAlumnos}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-700 font-semibold inline-flex items-center space-x-1 transition-colors"
                      >
                        <span>Siguiente</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 4. VENTANA: CONVOCATORIA SEMESTRAL & CIERRE               */}
          {/* ========================================================= */}
          {seccionActiva === 'convocatoria' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-brand-600" />
                    <span>Convocatoria Semestral & Control de Periodo</span>
                  </h1>
                  <p className="text-xs text-slate-500">
                    Parámetros del ciclo de admisión, creación de semestres, absorción institucional y cierre de corte.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowAperturarModal(true)}
                    className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors inline-flex items-center space-x-1.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Aperturar Convocatoria / Semestre</span>
                  </button>
                  {!convocatoriaActiva && ultimaConvocatoria && (
                    <button
                      onClick={() => reabrirConvocatoriaMutation.mutate(ultimaConvocatoria.id)}
                      disabled={reabrirConvocatoriaMutation.isPending}
                      className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs transition-colors inline-flex items-center space-x-1.5 disabled:opacity-50"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>{reabrirConvocatoriaMutation.isPending ? 'Reabriendo...' : 'Reabrir Convocatoria'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Banner de alerta si la convocatoria está cerrada */}
              {!convocatoriaActiva && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-bold text-amber-900">
                        No hay una convocatoria de ingreso abierta actualmente
                      </h3>
                      <p className="text-xs text-amber-700 mt-0.5">
                        {ultimaConvocatoria
                          ? `La última convocatoria registrada (${ultimaConvocatoria.denominacion}) fue cerrada formalmente. Puedes reabrirla para seguir admitiendo postulantes o abrir una nueva para otro semestre.`
                          : 'Apertura un periodo de ingreso para comenzar a recibir y evaluar candidatos en el programa CTS Academy.'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    {ultimaConvocatoria && (
                      <button
                        onClick={() => reabrirConvocatoriaMutation.mutate(ultimaConvocatoria.id)}
                        disabled={reabrirConvocatoriaMutation.isPending}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors inline-flex items-center space-x-1 disabled:opacity-50"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reabrir {ultimaConvocatoria.semestre || 'Convocatoria'}</span>
                      </button>
                    )}
                    <button
                      onClick={() => setShowAperturarModal(true)}
                      className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg transition-colors inline-flex items-center space-x-1"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Abrir Nueva</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Ficha de la Convocatoria */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200 uppercase">
                      Periodo Oficial
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 mt-1">
                      {convocatoriaMostrar?.denominacion || 'Convocatoria General'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Modelo: <strong>{convocatoriaMostrar?.modeloAdmision || 'ADMISION_CONTINUA'}</strong>
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full border ${
                      convocatoriaActiva
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : 'bg-rose-100 text-rose-800 border-rose-200'
                    }`}
                  >
                    {convocatoriaActiva ? 'ABIERTA' : 'CERRADA'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-medium text-slate-500 block">Semestre Académico</span>
                    <span className="text-base font-black text-slate-800 mt-1 block">
                      {convocatoriaMostrar?.semestre || '2026-I'}
                    </span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-medium text-slate-500 block">Total de Postulantes</span>
                    <span className="text-base font-black text-slate-800 mt-1 block">
                      {metricasPostulacion.totalCandidatos || 0} aspirantes
                    </span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-medium text-slate-500 block">Admitidos en el Ciclo</span>
                    <span className="text-base font-black text-emerald-700 mt-1 block">
                      {metricasPostulacion.admitidos || 0} alumnos
                    </span>
                  </div>
                </div>

                {convocatoriaActiva && (
                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => setShowCloseModal(true)}
                      className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Formalizar Cierre de Corte Semestral</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Histórico de Convocatorias y Ciclos */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
                  <History className="w-5 h-5 text-slate-600" />
                  <h3 className="font-bold text-slate-900 text-base">Historial de Convocatorias Registradas</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-5 py-3">Convocatoria</th>
                        <th className="px-4 py-3">Semestre</th>
                        <th className="px-4 py-3">Fechas</th>
                        <th className="px-4 py-3">Postulantes</th>
                        <th className="px-4 py-3">Estado</th>
                        <th className="px-5 py-3 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {historicoConvocatorias.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-xs text-slate-400 italic">
                            No se registran periodos de ingreso históricos.
                          </td>
                        </tr>
                      ) : (
                        historicoConvocatorias.map((conv: any) => (
                          <tr key={conv.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-5 py-3.5">
                              <span className="font-bold text-slate-900 block text-xs">
                                {conv.denominacion}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {conv.modeloAdmision}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-xs font-semibold text-slate-700">
                              {conv.semestre?.codigo || conv.semestre?.periodoSemestre || '—'}
                            </td>
                            <td className="px-4 py-3.5 text-xs text-slate-500">
                              {new Date(conv.fechaInicio).toLocaleDateString()} -{' '}
                              {new Date(conv.fechaFin).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3.5 text-xs font-mono font-medium text-slate-700">
                              {conv.candidatos?.length || 0} aspirantes
                            </td>
                            <td className="px-4 py-3.5">
                              <span
                                className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                                  conv.estado === 'ABIERTA'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-slate-100 text-slate-600 border-slate-200'
                                }`}
                              >
                                {conv.estado}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              {conv.estado === 'CERRADA' ? (
                                <button
                                  onClick={() => reabrirConvocatoriaMutation.mutate(conv.id)}
                                  disabled={reabrirConvocatoriaMutation.isPending}
                                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold rounded-lg border border-amber-200 transition-colors inline-flex items-center space-x-1"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Reabrir</span>
                                </button>
                              ) : (
                                <span className="text-[11px] text-emerald-600 font-semibold">En curso</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================= */}
      {/* MODALES DEL SISTEMA                                       */}
      {/* ========================================================= */}

      {/* Modal de Movilidad de Alumnos entre Squads (Requirement 4) */}
      {alumnoParaTransferir && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-100">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
              <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Reasignar Alumno de Squad</h3>
                <p className="text-xs text-slate-500">Gestión de movilidad durante la estancia en el programa.</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <p className="text-slate-500">Alumno seleccionado:</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{alumnoParaTransferir.nombreCompleto}</p>
                <p className="text-slate-500 font-mono text-[11px]">{alumnoParaTransferir.email}</p>
                <p className="mt-2 text-slate-600">
                  Squad actual:{' '}
                  <strong className="text-brand-600">
                    {alumnoParaTransferir.squadActualNombre || 'Sin Squad Asignado'}
                  </strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nuevo Squad de Destino
                </label>
                <select
                  value={squadDestinoId}
                  onChange={(e) => setSquadDestinoId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
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

              <p className="text-[11px] text-slate-500 italic">
                El alumno mantendrá todo su historial de entregas de laboratorios y su rol activo de ALUMNO PROFER.
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setAlumnoParaTransferir(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => transferirAlumnoMutation.mutate()}
                disabled={transferirAlumnoMutation.isPending}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                {transferirAlumnoMutation.isPending ? 'Guardando...' : 'Confirmar Reasignación'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Registro de Nuevo Candidato */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-100">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
              <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Inscribir Nuevo Postulante</h3>
                <p className="text-xs text-slate-500">Asocia un aspirante a la convocatoria activa.</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    placeholder="Ej. Ana"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Apellidos</label>
                  <input
                    type="text"
                    value={nuevoApellidos}
                    onChange={(e) => setNuevoApellidos(e.target.value)}
                    placeholder="Ej. García López"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Correo Institucional / Personal
                </label>
                <input
                  type="email"
                  value={nuevoEmail}
                  onChange={(e) => setNuevoEmail(e.target.value)}
                  placeholder="ana.garcia@alumnos.uneatlantico.es"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sede de Origen</label>
                  <select
                    value={nuevaSede}
                    onChange={(e) => setNuevaSede(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="SDR_ESP">Santander (España)</option>
                    <option value="COL_BOG">Bogotá (Colombia)</option>
                    <option value="MEX_CDMX">Ciudad de México</option>
                    <option value="GTM_GUA">Guatemala</option>
                    <option value="PER_LIM">Lima (Perú)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={nuevoTelefono}
                    onChange={(e) => setNuevoTelefono(e.target.value)}
                    placeholder="+34600000000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Opción de envío inmediato de credenciales */}
              <div className="p-3 bg-indigo-50/70 border border-indigo-200/60 rounded-xl space-y-1.5">
                <label className="flex items-center space-x-2 text-xs font-semibold text-indigo-950 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enviarInvitacionInmediata}
                    onChange={(e) => setEnviarInvitacionInmediata(e.target.checked)}
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span>Enviar credenciales de acceso e invitación por correo de inmediato</span>
                </label>
                <p className="text-[11px] text-slate-500 pl-6">
                  Se despachará el enlace al portal con la contraseña temporal (CtsAcademy2026!) y las instrucciones para realizar las pruebas.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowRegisterModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => registrarCandidatoMutation.mutate(convocatoriaActiva?.id)}
                disabled={
                  !nuevoNombre.trim() ||
                  !nuevoApellidos.trim() ||
                  !nuevoEmail.trim() ||
                  registrarCandidatoMutation.isPending
                }
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                {registrarCandidatoMutation.isPending ? 'Registrando...' : 'Inscribir Aspirante'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cierre de Corte */}
      {showCloseModal && convocatoriaActiva && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-100">
            <div className="p-3 bg-red-50 text-red-700 rounded-xl flex items-center space-x-2">
              <ShieldAlert className="w-6 h-6 flex-shrink-0" />
              <h3 className="font-bold text-sm">Formalizar Cierre de Corte Semestral</h3>
            </div>

            <p className="text-xs text-slate-600">
              Esta acción emitirá el <strong>Informe de Corte con firma hash inmutable</strong> y cerrará las
              postulaciones de <strong>{convocatoriaActiva.denominacion}</strong>.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Motivo de cierre u observaciones
              </label>
              <textarea
                rows={3}
                value={motivoCierre}
                onChange={(e) => setMotivoCierre(e.target.value)}
                placeholder="Cierre regular semestral tras agotar plazas y culminar proceso de entrevistas..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowCloseModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => cerrarCorteMutation.mutate(convocatoriaActiva.id)}
                disabled={cerrarCorteMutation.isPending}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                Confirmar y Firmar Corte
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Credenciales e Invitación Oficial al Postulante */}
      {candidatoParaInvitacion && (
        <InvitacionCandidatoModal
          candidatoId={candidatoParaInvitacion.id}
          candidatoNombre={candidatoParaInvitacion.nombre}
          candidatoEmail={candidatoParaInvitacion.email}
          isOpen={Boolean(candidatoParaInvitacion)}
          onClose={() => setCandidatoParaInvitacion(null)}
        />
      )}

      {/* Modal: Importación Masiva de Nómina por Sede */}
      {showImportSedeModal && (
        <ImportarSedeModal
          isOpen={showImportSedeModal}
          onClose={() => setShowImportSedeModal(false)}
        />
      )}

      {/* Modal: Aperturar Nueva Convocatoria / Semestre */}
      {showAperturarModal && (
        <AperturarConvocatoriaModal
          isOpen={showAperturarModal}
          onClose={() => setShowAperturarModal(false)}
          semestresDisponibles={semestresDisponibles}
        />
      )}
    </div>
  );
};

export default AdmisionesPanelPage;
