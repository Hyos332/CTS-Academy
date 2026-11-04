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
  Compass,
  CheckCircle2,
  Copy,
  ExternalLink,
  Mail,
  LayoutDashboard,
  HeartPulse,
  FileSpreadsheet,
  ArrowRight,
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
      const iso = new Date(fechaEntrevista).toISOString();
      return apiClient.post(`/evaluacion/candidatos/${id}/entrevista`, {
        fechaProgramada: iso,
        fechaHoraProgramada: iso,
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
  const testTecnico = candidato.tests?.find((t: any) => t.tipo_bateria === 'TECNICO');
  const testActitud = candidato.tests?.find((t: any) => t.tipo_bateria === 'ACTITUD');
  const testAptitud = candidato.tests?.find((t: any) => t.tipo_bateria === 'APTITUD');

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

      <main className="w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 space-y-6">
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
          <div className="space-y-6">
            {/* 1. RECOMENDACIÓN DE SQUAD (Minimalista y Directo) */}
            {sugerido && (
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-indigo-500/30">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-900/60 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                        Squad Recomendado
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-400">
                        {sugerido.codigo}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black mt-1 text-white">
                      {sugerido.nombre}
                    </h2>
                    <p className="text-xs text-slate-300 mt-1 max-w-2xl line-clamp-2">
                      {sugerido.justificacion}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4 shrink-0">
                    <div className="text-right">
                      <div className="text-3xl font-black text-emerald-400">
                        {sugerido.afinidadPorcentaje}%
                      </div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
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
                        className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-1.5"
                      >
                        <span>Asignar a {sugerido.nombre}</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Fortalezas Clave */}
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10 items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {sugerido.fortalezasClave?.map((f: string) => (
                      <span
                        key={f}
                        className="text-[11px] font-semibold bg-white/5 hover:bg-white/10 text-indigo-200 px-2.5 py-1 rounded-lg border border-white/10"
                      >
                        ✓ {f}
                      </span>
                    ))}
                  </div>
                  <span className="text-[11px] font-medium text-slate-400">
                    Líder Técnico: <strong className="text-slate-200">{sugerido.lider}</strong>
                  </span>
                </div>

                {/* Ranking compacto de los otros squads */}
                {recomendacion.rankingEquipos && (
                  <div className="mt-4 pt-3 border-t border-white/10">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Afinidad en los demás Squads CTS
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
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
                            className={`px-3 py-2 rounded-lg border text-center transition-all cursor-pointer ${
                              esTop
                                ? 'bg-indigo-600/40 border-indigo-400/60 ring-1 ring-indigo-400/50'
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }`}
                          >
                            <span className="text-[10px] font-mono text-slate-400 block">{eq.codigo}</span>
                            <span className="text-xs font-bold text-white block truncate">{eq.nombre}</span>
                            <span
                              className={`text-xs font-extrabold mt-0.5 block ${
                                esTop ? 'text-emerald-400' : 'text-slate-300'
                              }`}
                            >
                              {eq.afinidadPorcentaje}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. RESUMEN DE LAS 3 BATERÍAS (Minimalista, 3 Cards Ejecutivas con enlaces directos) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Card 1: Batería de Actitud (16PF) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                      <HeartPulse className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                        testActitud?.estado === 'COMPLETADO'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {testActitud?.estado === 'COMPLETADO' ? 'Completado' : 'Pendiente'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">
                    Batería de Actitud (16PF)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Evaluación psicométrica oficial en 16 factores de personalidad y dinámicas de equipo.
                  </p>

                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Perfil Actitudinal
                    </span>
                    <span className="text-xs font-bold text-slate-800 mt-0.5 block truncate">
                      {espectro.actitud?.estiloTrabajo?.etiqueta || 'Colaborativo / Alta Adaptabilidad'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setTabActiva('actitud16pf')}
                  className="mt-4 w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-1"
                >
                  <span>Ver Informe 16PF Oficial</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Card 2: Batería de Aptitud (Matriz) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                        testAptitud?.estado === 'COMPLETADO'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {testAptitud?.estado === 'COMPLETADO' ? 'Completado' : 'Pendiente'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">
                    Batería de Aptitud (Matriz)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Matriz de 43 habilidades técnicas autoevaluadas (Escala 0-5) en 6 categorías de especialidad.
                  </p>

                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Competencia Destacada
                    </span>
                    <span className="text-xs font-bold text-slate-800 mt-0.5 block truncate">
                      {espectro.aptitud?.abstraccion?.etiqueta || 'Arquitectura & Backend DDD'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setTabActiva('aptitudMatriz')}
                  className="mt-4 w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-1"
                >
                  <span>Ver Matriz de Competencias</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Card 3: Evaluación Técnica */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                        testTecnico?.estado === 'COMPLETADO'
                          ? Number(testTecnico?.calificacion_obtenida || 0) >= 5
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {testTecnico?.estado === 'COMPLETADO'
                        ? Number(testTecnico?.calificacion_obtenida || 0) >= 5
                          ? 'Aprobado'
                          : 'No Aprobado'
                        : 'En Progreso'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">
                    Evaluación Técnica
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Cuestionario teórico de arquitectura y solución funcional de reto en TypeScript.
                  </p>

                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Calificación Numérica
                      </span>
                      <span className="text-2xl font-black text-slate-900 mt-0.5 block">
                        {testTecnico?.calificacion_obtenida !== null && testTecnico?.calificacion_obtenida !== undefined
                          ? `${Number(testTecnico.calificacion_obtenida).toFixed(1)}`
                          : '—'}
                        <span className="text-xs font-normal text-slate-400 ml-1">/ 10</span>
                      </span>
                    </div>
                    {testTecnico?.estado === 'COMPLETADO' && (
                      <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500 font-medium">
                  {testTecnico?.estado === 'COMPLETADO'
                    ? 'Examen finalizado y calificado'
                    : 'Pendiente de finalización por el aspirante'}
                </div>
              </div>
            </div>

            {/* 3. ENTREVISTA GOOGLE MEET & CONCLUSIONES (Minimalista en 2 Columnas) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Google Meet */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Video className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Entrevista Google Meet
                      </h3>
                    </div>
                    {candidato.entrevista && (
                      <span className="text-[11px] font-bold uppercase text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                        {candidato.entrevista.estado}
                      </span>
                    )}
                  </div>

                  {candidato.entrevista ? (
                    <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 space-y-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                          Fecha y Hora Programada
                        </span>
                        <p className="font-bold text-slate-900 text-sm mt-0.5">
                          {new Date(candidato.entrevista.fecha_hora_programada).toLocaleDateString(
                            'es-ES',
                            {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            },
                          )}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Gestor: {candidato.entrevista.gestor?.nombre || 'Equipo de Selección'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-indigo-100 text-xs">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(candidato.entrevista.enlace_google_meet);
                            setCopiadoMeet(true);
                            setTimeout(() => setCopiadoMeet(false), 2000);
                          }}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center space-x-1"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copiadoMeet ? '¡Copiado!' : 'Copiar enlace Meet'}</span>
                        </button>

                        <a
                          href={candidato.entrevista.enlace_google_meet}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold inline-flex items-center space-x-1 shadow-sm"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Abrir Meet</span>
                          <ExternalLink className="w-3 h-3 ml-0.5" />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-6 text-center space-y-2.5">
                      <p className="text-xs text-slate-500 italic">
                        Sin entrevista programada aún para este aspirante.
                      </p>
                      <button
                        onClick={() => {
                          generarEnlaceMeet();
                          setModalEntrevista(true);
                        }}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm inline-flex items-center space-x-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Agendar Google Meet</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Conclusiones de entrevista si ya existen */}
                {candidato.entrevista?.anotaciones && candidato.entrevista.anotaciones.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Anotaciones de la Entrevista
                    </span>
                    {candidato.entrevista.anotaciones.map((anot: any) => (
                      <div key={anot.id} className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs">
                        <div className="flex justify-between font-bold text-amber-900 mb-0.5">
                          <span>{anot.competencia_evaluada}</span>
                          <span className="bg-amber-100 px-1.5 py-0.5 rounded text-[10px]">
                            {anot.calificacion_cualitativa}
                          </span>
                        </div>
                        <p className="text-amber-800 text-[11px] italic">{anot.comentario}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Anotaciones del Gestor */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Conclusiones Cualitativas del Gestor
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">
                    Anotaciones confidenciales de encaje con el squad y solvencia profesional.
                  </p>

                  <textarea
                    rows={4}
                    value={comentariosEntrevista}
                    onChange={(e) => setComentariosEntrevista(e.target.value)}
                    placeholder="Registrar observaciones cualitativas del aspirante..."
                    className="w-full border border-slate-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end mt-3">
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
          </div>
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
