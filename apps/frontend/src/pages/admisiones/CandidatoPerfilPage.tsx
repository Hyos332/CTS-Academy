import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Navbar } from '../../components/common/Navbar';
import {
  ArrowLeft,
  Calendar,
  Video,
  FileText,
  UserCheck,
  UserX,
  MessageSquare,
  ShieldAlert,
  AlertTriangle,
  Sparkles,
  Compass,
  CheckCircle2,
  Copy,
  ExternalLink,
  Award,
  Mail,
  LayoutDashboard,
  HeartPulse,
  FileSpreadsheet,
} from 'lucide-react';
import { InvitacionCandidatoModal } from '../../components/admisiones/InvitacionCandidatoModal';
import { Informe16PFView } from '../../components/admisiones/Informe16PFView';
import { MatrizAptitudesView } from '../../components/admisiones/MatrizAptitudesView';

export const CandidatoPerfilPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [fechaEntrevista, setFechaEntrevista] = useState('');
  const [enlaceMeet, setEnlaceMeet] = useState('');
  const [comentariosEntrevista, setComentariosEntrevista] = useState('');
  const [equipoSeleccionadoId, setEquipoSeleccionadoId] = useState('');
  const [asignacionDiferida, setAsignacionDiferida] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [copiadoMeet, setCopiadoMeet] = useState(false);

  const [modalEntrevista, setModalEntrevista] = useState(false);
  const [modalAdmitir, setModalAdmitir] = useState(false);
  const [modalRechazar, setModalRechazar] = useState(false);
  const [modalInvitacion, setModalInvitacion] = useState(false);
  const [tabActiva, setTabActiva] = useState<'resumen' | 'actitud16pf' | 'aptitudMatriz'>('resumen');
  const [confirmarIrreversibleAdmitir, setConfirmarIrreversibleAdmitir] = useState(false);
  const [confirmarIrreversibleRechazar, setConfirmarIrreversibleRechazar] = useState(false);

  // Obtener perfil detallado del candidato (con cálculo de recomendación de squad)
  const { data: candidato, isLoading, error } = useQuery({
    queryKey: ['candidato-perfil', id],
    queryFn: async () => {
      const res = await apiClient.get(`/evaluacion/candidatos/${id}/perfil`);
      return res.data;
    },
  });

  // Obtener lista de equipos para el selector de admisión
  const { data: equiposData } = useQuery({
    queryKey: ['equipos-list'],
    queryFn: async () => {
      const res = await apiClient.get('/equipos/panel-admisiones');
      return res.data?.equipos || [];
    },
  });

  // Mutación: Agendar Google Meet
  const agendarMutation = useMutation({
    mutationFn: async () => {
      return apiClient.post(`/evaluacion/candidatos/${id}/entrevista`, {
        fechaHoraProgramada: new Date(fechaEntrevista).toISOString(),
        enlaceGoogleMeet: enlaceMeet || 'https://meet.google.com/cts-eval-demo',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidato-perfil', id] });
      setModalEntrevista(false);
    },
  });

  // Mutación: Registrar Anotaciones de Entrevista
  const anotacionesMutation = useMutation({
    mutationFn: async () => {
      return apiClient.post(`/evaluacion/candidatos/${id}/entrevista/anotaciones`, {
        competenciaEvaluada: 'Evaluación Técnica y Aptitudinal Integral',
        calificacionCualitativa: 'SOBRESALIENTE',
        comentario: comentariosEntrevista,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidato-perfil', id] });
      setComentariosEntrevista('');
    },
  });

  // Mutación: Admitir Alumno Profer (admite con squad o con asignación diferida)
  const admitirMutation = useMutation({
    mutationFn: async () => {
      return apiClient.post(`/evaluacion/candidatos/${id}/admitir`, {
        equipoId: asignacionDiferida ? undefined : (equipoSeleccionadoId || undefined),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidato-perfil', id] });
      queryClient.invalidateQueries({ queryKey: ['admisiones-panel'] });
      setModalAdmitir(false);
    },
  });

  // Mutación: Rechazar Candidatura
  const rechazarMutation = useMutation({
    mutationFn: async () => {
      return apiClient.post(`/evaluacion/candidatos/${id}/rechazar`, {
        motivoRechazo,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidato-perfil', id] });
      queryClient.invalidateQueries({ queryKey: ['admisiones-panel'] });
      setModalRechazar(false);
    },
  });

  const generarEnlaceMeet = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const genPart = (len: number) =>
      Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const randomCode = `${genPart(3)}-${genPart(4)}-${genPart(3)}`;
    const nuevoEnlace = `https://meet.google.com/${randomCode}`;
    setEnlaceMeet(nuevoEnlace);
  };

  const copiarEnlaceMeet = () => {
    if (!enlaceMeet) return;
    navigator.clipboard.writeText(enlaceMeet);
    setCopiadoMeet(true);
    setTimeout(() => setCopiadoMeet(false), 2000);
  };

  const abrirEnGoogleCalendar = () => {
    if (!fechaEntrevista) return;
    const fechaObj = new Date(fechaEntrevista);
    const startStr = fechaObj.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endObj = new Date(fechaObj.getTime() + 45 * 60000); // 45 min
    const endStr = endObj.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const title = encodeURIComponent(
      `Entrevista Técnica PROFER - ${candidato.usuario?.nombre} ${candidato.usuario?.apellidos}`,
    );
    const details = encodeURIComponent(
      `Sesión de Entrevista de Selección CTS Academy.\nEnlace Meet: ${
        enlaceMeet || 'https://meet.google.com/cts-eval-demo'
      }\nCandidato: ${candidato.usuario?.email}`,
    );
    const add = encodeURIComponent(candidato.usuario?.email || '');
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&add=${add}`;
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (error || !candidato) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-12 text-center">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Candidato no encontrado</h2>
          <button
            onClick={() => navigate('/admisiones/panel')}
            className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm"
          >
            Volver al Panel de Admisiones
          </button>
        </main>
      </div>
    );
  }

  const yaAdmitido = candidato.estado_postulacion === 'ADMITIDO';
  const yaRechazado = candidato.estado_postulacion === 'RECHAZADO';
  const recomendacion = candidato.recomendacionSquad;
  const sugerido = recomendacion?.equipoSugerido;

  // Extraer espectro psicométrico (sin puntuación numérica para actitud y aptitud)
  const perfilCompetencias = candidato.perfil_competencias || {};
  const espectro = perfilCompetencias.espectro || {
    actitud: {
      estiloTrabajo: {
        poloIzquierdo: 'Autonomía e Iniciativa Individual',
        poloDerecho: 'Colaboración en Squad & Sincronía',
        posicionPorcentaje: 78,
        etiqueta: 'Predominio Colaborativo',
        descripcion:
          'Alta disposición para el trabajo sinérgico en equipo, pair programming y alineación con objetivos comunes.',
      },
      enfoqueResolucion: {
        poloIzquierdo: 'Pragmatismo Ágil & Entregas Rápidas',
        poloDerecho: 'Rigor Arquitectónico & Perfeccionismo',
        posicionPorcentaje: 72,
        etiqueta: 'Equilibrio con Rigor Arquitectónico',
        descripcion: 'Prioriza la robustez de diseño y desacoplamiento sin perder de vista los plazos del sprint.',
      },
      adaptabilidad: {
        poloIzquierdo: 'Procesos Predecibles & Estabilidad',
        poloDerecho: 'Flexibilidad & Resiliencia al Cambio',
        posicionPorcentaje: 84,
        etiqueta: 'Alta Resiliencia al Cambio',
        descripcion: 'Maneja adecuadamente la ambigüedad de requisitos y evoluciona soluciones ante imprevistos.',
      },
    },
    aptitud: {
      razonamiento: {
        poloIzquierdo: 'Empírico / Ensayo y Error',
        poloDerecho: 'Lógico-Formal / Deductivo',
        posicionPorcentaje: 82,
        etiqueta: 'Razonamiento Deductivo Estructurado',
        descripcion: 'Capacidad notable para desglosar problemas complejos en invariantes lógicas y estructuras claras.',
      },
      abstraccion: {
        poloIzquierdo: 'Implementación Concreta Inmediata',
        poloDerecho: 'Modelado Conceptual & Arquitectura',
        posicionPorcentaje: 88,
        etiqueta: 'Elevada Capacidad de Abstracción',
        descripcion:
          'Entiende y aplica patrones de arquitectura hexagonal, inversión de dependencias y límites de contexto.',
      },
      atencionDetalle: {
        poloIzquierdo: 'Visión Macro Global',
        poloDerecho: 'Foco Minucioso en Casos Borde',
        posicionPorcentaje: 76,
        etiqueta: 'Balance Sistémico y Casos Borde',
        descripcion: 'Anticipa posibles fallos en condiciones excepcionales sin perder de vista el flujo principal.',
      },
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Barra superior de navegación y estado */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/admisiones/panel')}
            className="inline-flex items-center space-x-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Panel de Admisiones</span>
          </button>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
              yaAdmitido
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : yaRechazado
                ? 'bg-red-100 text-red-800 border-red-300'
                : 'bg-blue-100 text-blue-800 border-blue-300'
            }`}
          >
            {candidato.estado_postulacion}
          </span>
        </div>

        {/* Ficha Principal del Candidato */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {candidato.usuario?.nombre} {candidato.usuario?.apellidos}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Email: <span className="font-medium text-slate-700">{candidato.usuario?.email}</span> • Sede:{' '}
              <span className="font-medium text-slate-700">{candidato.sede_origen}</span> • Tel:{' '}
              <span className="font-medium text-slate-700">{candidato.telefono || 'N/A'}</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Convocatoria: {candidato.convocatoria?.denominacion}
            </p>
          </div>

          {/* Botones de Acción Editorial / Decisión */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setModalInvitacion(true)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center space-x-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-indigo-300" />
              <span>Credenciales e Invitación</span>
            </button>

            {!yaAdmitido && !yaRechazado && (
              <>
                <button
                  onClick={() => {
                    generarEnlaceMeet();
                    setModalEntrevista(true);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center space-x-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Agendar Google Meet</span>
                </button>
                <button
                  onClick={() => {
                    if (sugerido?.id) {
                      setEquipoSeleccionadoId(sugerido.id);
                    }
                    setModalAdmitir(true);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center space-x-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Admitir en Programa</span>
                </button>
                <button
                  onClick={() => setModalRechazar(true)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center space-x-1.5"
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>Rechazar</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Selector de Pestañas de Evaluación e Informes Oficiales */}
        <div className="flex border-b border-slate-200 space-x-3 overflow-x-auto pb-px">
          <button
            onClick={() => setTabActiva('resumen')}
            className={`pb-3 px-4 text-xs font-bold transition-all flex items-center space-x-2 border-b-2 whitespace-nowrap ${
              tabActiva === 'resumen'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Resumen & Squad Recomendado</span>
          </button>

          <button
            onClick={() => setTabActiva('actitud16pf')}
            className={`pb-3 px-4 text-xs font-bold transition-all flex items-center space-x-2 border-b-2 whitespace-nowrap ${
              tabActiva === 'actitud16pf'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HeartPulse className="w-4 h-4" />
            <span>Informe Test Actitud (16PF Oficial)</span>
          </button>

          <button
            onClick={() => setTabActiva('aptitudMatriz')}
            className={`pb-3 px-4 text-xs font-bold transition-all flex items-center space-x-2 border-b-2 whitespace-nowrap ${
              tabActiva === 'aptitudMatriz'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Informe Test Aptitud (Matriz Habilidades)</span>
          </button>
        </div>

        {/* PESTAÑA: TEST ACTITUD 16PF OFICIAL */}
        {tabActiva === 'actitud16pf' && (
          <Informe16PFView
            informe={
              perfilCompetencias.informe16PF || {
                nombreCandidato: `${candidato.usuario?.nombre} ${candidato.usuario?.apellidos}`,
                edad: 19,
                cursoAcademico: '2026 - 2027',
                fechaLlegada: new Date(candidato.creado_en).toLocaleDateString(),
                factores: [],
              }
            }
          />
        )}

        {/* PESTAÑA: TEST APTITUD MATRIZ HABILIDADES */}
        {tabActiva === 'aptitudMatriz' && (
          <MatrizAptitudesView
            matriz={
              perfilCompetencias.matrizAptitudes || {
                nombreCandidato: candidato.usuario?.email,
                categorias: [],
              }
            }
          />
        )}

        {/* PESTAÑA: RESUMEN Y SQUAD */}
        {tabActiva === 'resumen' && (
          <>

        {/* RECOMENDACIÓN DE SQUAD POR MOTOR DE ADMISIONES (Requirement 6) */}
        {sugerido && (
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 rounded-2xl p-6 sm:p-7 text-white shadow-xl border border-indigo-500/30">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-400/30">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-950/80 px-2.5 py-0.5 rounded-full border border-indigo-500/40">
                    Motor de Recomendación de Admisiones
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black mt-1 text-white flex items-center space-x-2">
                    <span>Squad Recomendado: {sugerido.nombre}</span>
                    <span className="text-xs font-mono font-bold bg-white/10 px-2 py-0.5 rounded text-indigo-200">
                      {sugerido.codigo}
                    </span>
                  </h2>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <span className="text-3xl font-extrabold text-emerald-400">
                    {sugerido.afinidadPorcentaje}%
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Afinidad Global
                  </span>
                </div>
                {!yaAdmitido && !yaRechazado && (
                  <button
                    onClick={() => {
                      setEquipoSeleccionadoId(sugerido.id);
                      setAsignacionDiferida(false);
                      setModalAdmitir(true);
                    }}
                    className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center space-x-1.5"
                  >
                    <span>Asignar a {sugerido.nombre}</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 mt-4 leading-relaxed">
              {sugerido.justificacion}
            </p>

            <div className="flex flex-wrap gap-2 mt-3">
              {sugerido.fortalezasClave?.map((f: string) => (
                <span
                  key={f}
                  className="text-[11px] font-semibold bg-white/10 hover:bg-white/15 text-indigo-200 px-3 py-1 rounded-lg border border-white/10"
                >
                  ✓ {f}
                </span>
              ))}
              <span className="text-[11px] font-semibold bg-indigo-950/60 text-slate-300 px-3 py-1 rounded-lg border border-indigo-500/20">
                Tech Leader: {sugerido.lider}
              </span>
            </div>

            {/* Comparativa con los otros 5 squads */}
            {recomendacion.rankingEquipos && (
              <div className="mt-5 pt-4 border-t border-white/10">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Ranking de Compatibilidad en los 6 Squads CTS
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {recomendacion.rankingEquipos.map((eq: any) => {
                    const esTop = eq.codigo === sugerido.codigo;
                    return (
                      <div
                        key={eq.id}
                        onClick={() => {
                          if (!yaAdmitido && !yaRechazado) {
                            setEquipoSeleccionadoId(eq.id);
                            setAsignacionDiferida(false);
                            setModalAdmitir(true);
                          }
                        }}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          esTop
                            ? 'bg-indigo-600/30 border-indigo-400/60 ring-2 ring-indigo-400/40'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <span className="text-[10px] font-mono text-slate-400 block">{eq.codigo}</span>
                        <span className="text-xs font-bold text-white block truncate">{eq.nombre}</span>
                        <div className="mt-1 flex items-center justify-center space-x-1">
                          <span
                            className={`text-sm font-extrabold ${
                              esTop ? 'text-emerald-400' : 'text-slate-300'
                            }`}
                          >
                            {eq.afinidadPorcentaje}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1 mt-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              esTop ? 'bg-emerald-400' : 'bg-slate-500'
                            }`}
                            style={{ width: `${eq.afinidadPorcentaje}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ESPECTRO DE APTITUD Y ACTITUD (Requirement 2: sin puntuación numérica, basado en espectro) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Columna 1: Espectro Actitudinal */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Espectro Actitudinal & Dinámica de Squad
                </h2>
                <p className="text-xs text-slate-500">
                  Evaluación psicométrica cualitativa de estilo de trabajo, sin puntuación numérica (ADR-014).
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              {/* Dimensión 1: Estilo de Trabajo */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                  <span className="text-slate-500 font-normal">
                    {espectro.actitud?.estiloTrabajo?.poloIzquierdo}
                  </span>
                  <span className="text-amber-700 font-bold bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded text-[11px]">
                    {espectro.actitud?.estiloTrabajo?.etiqueta}
                  </span>
                  <span className="text-slate-500 font-normal">
                    {espectro.actitud?.estiloTrabajo?.poloDerecho}
                  </span>
                </div>
                <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-amber-300 via-amber-500 to-amber-600 rounded-full"
                    style={{ width: `${espectro.actitud?.estiloTrabajo?.posicionPorcentaje}%` }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-amber-600 rounded-full shadow"
                    style={{
                      left: `calc(${espectro.actitud?.estiloTrabajo?.posicionPorcentaje}% - 7px)`,
                    }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 italic">
                  {espectro.actitud?.estiloTrabajo?.descripcion}
                </p>
              </div>

              {/* Dimensión 2: Enfoque de Resolución */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                  <span className="text-slate-500 font-normal">
                    {espectro.actitud?.enfoqueResolucion?.poloIzquierdo}
                  </span>
                  <span className="text-amber-700 font-bold bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded text-[11px]">
                    {espectro.actitud?.enfoqueResolucion?.etiqueta}
                  </span>
                  <span className="text-slate-500 font-normal">
                    {espectro.actitud?.enfoqueResolucion?.poloDerecho}
                  </span>
                </div>
                <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-amber-300 via-amber-500 to-amber-600 rounded-full"
                    style={{ width: `${espectro.actitud?.enfoqueResolucion?.posicionPorcentaje}%` }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-amber-600 rounded-full shadow"
                    style={{
                      left: `calc(${espectro.actitud?.enfoqueResolucion?.posicionPorcentaje}% - 7px)`,
                    }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 italic">
                  {espectro.actitud?.enfoqueResolucion?.descripcion}
                </p>
              </div>

              {/* Dimensión 3: Adaptabilidad */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                  <span className="text-slate-500 font-normal">
                    {espectro.actitud?.adaptabilidad?.poloIzquierdo}
                  </span>
                  <span className="text-amber-700 font-bold bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded text-[11px]">
                    {espectro.actitud?.adaptabilidad?.etiqueta}
                  </span>
                  <span className="text-slate-500 font-normal">
                    {espectro.actitud?.adaptabilidad?.poloDerecho}
                  </span>
                </div>
                <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-amber-300 via-amber-500 to-amber-600 rounded-full"
                    style={{ width: `${espectro.actitud?.adaptabilidad?.posicionPorcentaje}%` }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-amber-600 rounded-full shadow"
                    style={{
                      left: `calc(${espectro.actitud?.adaptabilidad?.posicionPorcentaje}% - 7px)`,
                    }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 italic">
                  {espectro.actitud?.adaptabilidad?.descripcion}
                </p>
              </div>
            </div>
          </div>

          {/* Columna 2: Espectro de Aptitud Cognitiva */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Espectro de Aptitud Cognitiva & Arquitectura
                </h2>
                <p className="text-xs text-slate-500">
                  Dimensiones de modelado conceptual y abstracción, sin puntuación numérica (ADR-014).
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              {/* Dimensión 1: Razonamiento */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                  <span className="text-slate-500 font-normal">
                    {espectro.aptitud?.razonamiento?.poloIzquierdo}
                  </span>
                  <span className="text-blue-700 font-bold bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded text-[11px]">
                    {espectro.aptitud?.razonamiento?.etiqueta}
                  </span>
                  <span className="text-slate-500 font-normal">
                    {espectro.aptitud?.razonamiento?.poloDerecho}
                  </span>
                </div>
                <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-blue-300 via-blue-500 to-indigo-600 rounded-full"
                    style={{ width: `${espectro.aptitud?.razonamiento?.posicionPorcentaje}%` }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-full shadow"
                    style={{
                      left: `calc(${espectro.aptitud?.razonamiento?.posicionPorcentaje}% - 7px)`,
                    }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 italic">
                  {espectro.aptitud?.razonamiento?.descripcion}
                </p>
              </div>

              {/* Dimensión 2: Abstracción */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                  <span className="text-slate-500 font-normal">
                    {espectro.aptitud?.abstraccion?.poloIzquierdo}
                  </span>
                  <span className="text-blue-700 font-bold bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded text-[11px]">
                    {espectro.aptitud?.abstraccion?.etiqueta}
                  </span>
                  <span className="text-slate-500 font-normal">
                    {espectro.aptitud?.abstraccion?.poloDerecho}
                  </span>
                </div>
                <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-blue-300 via-blue-500 to-indigo-600 rounded-full"
                    style={{ width: `${espectro.aptitud?.abstraccion?.posicionPorcentaje}%` }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-full shadow"
                    style={{
                      left: `calc(${espectro.aptitud?.abstraccion?.posicionPorcentaje}% - 7px)`,
                    }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 italic">
                  {espectro.aptitud?.abstraccion?.descripcion}
                </p>
              </div>

              {/* Dimensión 3: Atención al Detalle */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                  <span className="text-slate-500 font-normal">
                    {espectro.aptitud?.atencionDetalle?.poloIzquierdo}
                  </span>
                  <span className="text-blue-700 font-bold bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded text-[11px]">
                    {espectro.aptitud?.atencionDetalle?.etiqueta}
                  </span>
                  <span className="text-slate-500 font-normal">
                    {espectro.aptitud?.atencionDetalle?.poloDerecho}
                  </span>
                </div>
                <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-blue-300 via-blue-500 to-indigo-600 rounded-full"
                    style={{ width: `${espectro.aptitud?.atencionDetalle?.posicionPorcentaje}%` }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-full shadow"
                    style={{
                      left: `calc(${espectro.aptitud?.atencionDetalle?.posicionPorcentaje}% - 7px)`,
                    }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 italic">
                  {espectro.aptitud?.atencionDetalle?.descripcion}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de 2 Columnas: Tests Realizados & Entrevista Google Meet */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Historial de Tests de Admisión (Solo el Técnico tiene nota numérica) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-brand-600" />
                <span>Baterías de Admisión Realizadas</span>
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Test técnico (calificación numérica) y baterías actitudinal/aptitudinal (evaluación por espectro).
              </p>

              <div className="space-y-3">
                {candidato.tests?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No hay tests registrados.</p>
                ) : (
                  candidato.tests?.map((t: any) => {
                    const esTecnico = t.tipo_bateria === 'TECNICO';
                    return (
                      <div
                        key={t.id}
                        className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex justify-between items-center"
                      >
                        <div>
                          <span className="text-xs font-mono font-semibold text-slate-500">
                            Batería {t.tipo_bateria}
                          </span>
                          <h4 className="font-bold text-slate-800 text-sm">
                            {esTecnico
                              ? 'Evaluación Técnica de Programación y Arquitectura'
                              : t.tipo_bateria === 'ACTITUD'
                              ? 'Evaluación de Espectro Actitudinal en Squad'
                              : 'Evaluación de Espectro de Aptitud Cognitiva'}
                          </h4>
                          <span
                            className={`inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded ${
                              t.estado === 'COMPLETADO'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {t.estado}
                          </span>
                        </div>

                        <div className="text-right">
                          {esTecnico ? (
                            <>
                              <span className="text-xs text-slate-400 block">Nota Numérica</span>
                              <span className="text-xl font-extrabold text-slate-900">
                                {t.calificacion_obtenida !== null
                                  ? `${Number(t.calificacion_obtenida).toFixed(1)}/10`
                                  : '—'}
                              </span>
                            </>
                          ) : (
                            <span className="inline-block text-[11px] font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg">
                              Espectro Cualitativo
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Entrevista Agendada en Google Meet (Requirement 5) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center space-x-2">
                <Video className="w-5 h-5 text-indigo-600" />
                <span>Entrevista Personal en Google Meet</span>
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Sesión técnica en vivo con los líderes del Centro Tecnológico.
              </p>

              {candidato.entrevista ? (
                <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-200 rounded-xl p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[11px] font-bold uppercase text-indigo-600 bg-indigo-100 px-2.5 py-0.5 rounded">
                        Estado: {candidato.entrevista.estado}
                      </span>
                      <p className="font-bold text-slate-900 text-base mt-2">
                        {new Date(candidato.entrevista.fecha_hora_programada).toLocaleDateString(
                          'es-ES',
                          {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          },
                        )}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Gestor asignado: {candidato.entrevista.gestor?.nombre || 'Equipo de Selección'}
                      </p>
                    </div>

                    <a
                      href={candidato.entrevista.enlace_google_meet}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-600/20 inline-flex items-center space-x-1.5"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Abrir Google Meet</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="pt-2 border-t border-indigo-100 flex items-center justify-between text-xs text-slate-600">
                    <span className="font-mono truncate max-w-xs text-indigo-700">
                      {candidato.entrevista.enlace_google_meet}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(candidato.entrevista.enlace_google_meet);
                        setCopiadoMeet(true);
                        setTimeout(() => setCopiadoMeet(false), 2000);
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center space-x-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiadoMeet ? '¡Copiado!' : 'Copiar enlace'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-8 text-center space-y-3">
                  <p className="text-xs text-slate-500 italic">
                    Aún no se ha programado una sesión de entrevista para este postulante.
                  </p>
                  <button
                    onClick={() => {
                      generarEnlaceMeet();
                      setModalEntrevista(true);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors inline-flex items-center space-x-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Agendar Entrevista Google Meet</span>
                  </button>
                </div>
              )}
            </div>

            {/* Anotaciones cualitativas ya registradas */}
            {candidato.entrevista?.anotaciones && candidato.entrevista.anotaciones.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Conclusiones de la Entrevista
                </span>
                <div className="space-y-2">
                  {candidato.entrevista.anotaciones.map((anot: any) => (
                    <div key={anot.id} className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs">
                      <div className="flex justify-between font-bold text-amber-900 mb-1">
                        <span>{anot.competencia_evaluada}</span>
                        <span className="bg-amber-100 px-2 py-0.5 rounded text-[10px]">
                          {anot.calificacion_cualitativa}
                        </span>
                      </div>
                      <p className="text-amber-800 italic">{anot.comentario}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sección de Anotaciones Cualitativas del Gestor */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-amber-600" />
            <span>Registrar Conclusiones Cualitativas de Selección</span>
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Observaciones confidenciales del Gestor durante la entrevista para fundamentar la asignación al squad.
          </p>

          <div className="space-y-4">
            <textarea
              rows={3}
              value={comentariosEntrevista}
              onChange={(e) => setComentariosEntrevista(e.target.value)}
              placeholder="Registrar notas cualitativas (ej. candidato muestra alta motivación, encaje con Team Fénix por dominio de TypeScript)..."
              className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
            <div className="flex justify-end">
              <button
                onClick={() => anotacionesMutation.mutate()}
                disabled={!comentariosEntrevista.trim() || anotacionesMutation.isPending}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                {anotacionesMutation.isPending ? 'Guardando...' : 'Guardar Conclusión'}
              </button>
            </div>
          </div>
        </div>
        </>
        )}
      </main>

      {/* Modal: Agendar Google Meet (Requirement 5) */}
      {modalEntrevista && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Agendar Entrevista Google Meet</h3>
                <p className="text-xs text-slate-500">
                  Programa la sesión con {candidato.usuario?.nombre} {candidato.usuario?.apellidos}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Fecha y Hora de la Entrevista
              </label>
              <input
                type="datetime-local"
                value={fechaEntrevista}
                onChange={(e) => setFechaEntrevista(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-700">Enlace de Google Meet</label>
                <button
                  type="button"
                  onClick={generarEnlaceMeet}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  ⚡ Regenerar Enlace
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="url"
                  value={enlaceMeet}
                  onChange={(e) => setEnlaceMeet(e.target.value)}
                  placeholder="https://meet.google.com/xyz-abcd-efg"
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-mono focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={copiarEnlaceMeet}
                  className="p-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600"
                  title="Copiar enlace"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              {copiadoMeet && (
                <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                  ✓ Enlace copiado al portapapeles
                </span>
              )}
            </div>

            {/* Asistente Google Calendar */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-indigo-950">Agendar en Google Calendar</p>
                <p className="text-[11px] text-indigo-700">
                  Abre Google Calendar con fecha, candidatos y enlace pre-cargados.
                </p>
              </div>
              <button
                type="button"
                onClick={abrirEnGoogleCalendar}
                disabled={!fechaEntrevista}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg text-xs font-semibold inline-flex items-center space-x-1"
              >
                <span>Abrir Calendar</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setModalEntrevista(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => agendarMutation.mutate()}
                disabled={!fechaEntrevista || agendarMutation.isPending}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold"
              >
                {agendarMutation.isPending ? 'Guardando...' : 'Confirmar Entrevista'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Admitir al Programa PROFER (Requirement 1: Asignación de Squad Diferida) */}
      {modalAdmitir && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              Admitir Aspirante al Programa de Becas PROFER
            </h3>
            <p className="text-xs text-slate-500">
              Formaliza la admisión institucional del estudiante en el Centro Tecnológico CTS.
            </p>

            {/* Aviso de Corrección de la Interesada: Asignación de Squad Diferida */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 flex items-start space-x-3 text-blue-950">
              <Compass className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold">Protocolo de Asignación de Squad Diferida</p>
                <p className="text-blue-800 leading-relaxed">
                  Según las directrices de coordinación, al dar el &quot;SÍ&quot; para el programa PROFER no es obligatorio fijar el squad inmediatamente. Puedes formalizar la admisión ahora y definir su asignación definitiva en la ventana temporal hasta su incorporación física.
                </p>
              </div>
            </div>

            {/* Checkbox para diferir la asignación */}
            <label className="flex items-center space-x-2 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={asignacionDiferida}
                onChange={(e) => {
                  setAsignacionDiferida(e.target.checked);
                  if (e.target.checked) setEquipoSeleccionadoId('');
                }}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs font-semibold text-slate-800">
                ⏳ Diferir asignación de squad (Asignar cuando el alumno se incorpore formalmente)
              </span>
            </label>

            {/* Selector de Squad (si no es diferido) */}
            {!asignacionDiferida && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Equipo de Destino CTS (Squad)
                </label>
                <select
                  value={equipoSeleccionadoId}
                  onChange={(e) => setEquipoSeleccionadoId(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="">-- Selecciona un equipo --</option>
                  {equiposData?.map((eq: any) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.codigo} - {eq.nombre} ({eq.especialidad})
                      {sugerido?.codigo === eq.codigo ? ' ⭐ [RECOMENDADO]' : ''}
                    </option>
                  ))}
                </select>
                {sugerido && (
                  <button
                    type="button"
                    onClick={() => setEquipoSeleccionadoId(sugerido.id)}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold mt-1.5 flex items-center space-x-1"
                  >
                    <span>⚡ Aplicar squad recomendado por IA ({sugerido.nombre} - {sugerido.afinidadPorcentaje}% afín)</span>
                  </button>
                )}
              </div>
            )}

            {/* Aviso de Acción Irreversible */}
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 flex items-start space-x-3 text-amber-900">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold">⚠️ ADVERTENCIA: Acción Irreversible de Admisión</p>
                <p className="text-amber-800 leading-relaxed">
                  Al admitir al postulante, su cuenta será promovida formalmente al rol de{' '}
                  <strong>ALUMNO PROFER</strong> y se formalizará su matrícula activa.
                </p>
              </div>
            </div>

            <label className="flex items-start space-x-2 text-xs text-slate-700 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={confirmarIrreversibleAdmitir}
                onChange={(e) => setConfirmarIrreversibleAdmitir(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>
                Confirmo que he verificado los requisitos y autorizo la{' '}
                <strong>admisión definitiva</strong> del candidato en el programa PROFER.
              </span>
            </label>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setModalAdmitir(false);
                  setConfirmarIrreversibleAdmitir(false);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => admitirMutation.mutate()}
                disabled={
                  (!asignacionDiferida && !equipoSeleccionadoId) ||
                  !confirmarIrreversibleAdmitir ||
                  admitirMutation.isPending
                }
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold transition-colors"
              >
                {admitirMutation.isPending
                  ? 'Formalizando...'
                  : asignacionDiferida
                  ? 'Confirmar Admisión (Squad Diferido)'
                  : 'Confirmar Admisión y Asignar Squad'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Rechazar Candidatura */}
      {modalRechazar && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Rechazar Candidatura</h3>
            <p className="text-xs text-slate-500">
              Indica la justificación de la decisión para registro interno de auditoría.
            </p>

            <div className="bg-red-50 border border-red-300 rounded-xl p-3.5 flex items-start space-x-3 text-red-900">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold">⚠️ ADVERTENCIA: Acción Irreversible de Rechazo</p>
                <p className="text-red-800 leading-relaxed">
                  La postulación será marcada de forma definitiva como <strong>RECHAZADA</strong> en la
                  convocatoria actual.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Motivo del Rechazo</label>
              <textarea
                rows={3}
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
                placeholder="No alcanza el umbral de conocimientos prácticos en la evaluación..."
                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <label className="flex items-start space-x-2 text-xs text-slate-700 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={confirmarIrreversibleRechazar}
                onChange={(e) => setConfirmarIrreversibleRechazar(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
              />
              <span>
                Confirmo el <strong>rechazo definitivo e irrevocable</strong> de esta postulación.
              </span>
            </label>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setModalRechazar(false);
                  setConfirmarIrreversibleRechazar(false);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => rechazarMutation.mutate()}
                disabled={!motivoRechazo.trim() || !confirmarIrreversibleRechazar || rechazarMutation.isPending}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold transition-colors"
              >
                {rechazarMutation.isPending ? 'Procesando...' : 'Confirmar Rechazo Definitivo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Credenciales e Invitación Oficial (Requirement 1) */}
      <InvitacionCandidatoModal
        candidatoId={candidato.id}
        candidatoNombre={`${candidato.usuario?.nombre} ${candidato.usuario?.apellidos}`}
        candidatoEmail={candidato.usuario?.email || ''}
        isOpen={modalInvitacion}
        onClose={() => setModalInvitacion(false)}
      />
    </div>
  );
};

export default CandidatoPerfilPage;
