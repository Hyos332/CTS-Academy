import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Navbar } from '../../components/common/Navbar';
import {
  ArrowLeft,
  Calendar,
  Video,
  UserCheck,
  UserX,
  MessageSquare,
  ShieldAlert,
  CheckCircle2,
  Copy,
  ExternalLink,
  Mail,
  HeartPulse,
  Cpu,
  ArrowRight,
  FileDown,
  Terminal,
  Sparkles,
  Users,
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';
import { InvitacionCandidatoModal } from '../../components/admisiones/InvitacionCandidatoModal';
import { Informe16PFView } from '../../components/admisiones/Informe16PFView';
import { MatrizAptitudesView } from '../../components/admisiones/MatrizAptitudesView';
import { ResumenResultadosPdfModal } from '../../components/admisiones/ResumenResultadosPdfModal';
import { ReportePruebaTecnicaView } from '../../components/admisiones/ReportePruebaTecnicaView';

export const CandidatoPerfilPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showPdfModal, setShowPdfModal] = useState(false);
  const [fechaEntrevista, setFechaEntrevista] = useState('');
  const [enlaceMeet, setEnlaceMeet] = useState('');
  const [comentariosEntrevista, setComentariosEntrevista] = useState('');
  const [itemAnotacion, setItemAnotacion] = useState<'Actitud' | 'Aptitud' | 'Generalidades' | 'Recomendaciones'>('Generalidades');
  const [calificacionAnotacion, setCalificacionAnotacion] = useState<'SOBRESALIENTE' | 'COMPETENTE' | 'EN_DESARROLLO' | 'NO_IDONEO'>('SOBRESALIENTE');
  
  const [equipoSeleccionadoId, setEquipoSeleccionadoId] = useState('');
  const [porcentajeAcceso, setPorcentajeAcceso] = useState<number>(100);
  const [asignacionDiferida, setAsignacionDiferida] = useState(false);
  const [motivoAbandono, setMotivoAbandono] = useState('');
  const [copiadoMeet, setCopiadoMeet] = useState(false);

  const [modalEntrevista, setModalEntrevista] = useState(false);
  const [modalAdmitir, setModalAdmitir] = useState(false);
  const [modalAbandonar, setModalAbandonar] = useState(false);
  const [modalInvitacion, setModalInvitacion] = useState(false);

  // Vista activa: 'resumen' (página única sintetizada) o vista detallada de un test
  const [vistaDetallada, setVistaDetallada] = useState<'resumen' | 'actitud16pf' | 'aptitudMatriz' | 'tecnicoCts'>('resumen');

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
        competenciaEvaluada: itemAnotacion,
        calificacionCualitativa: calificacionAnotacion,
        comentario: comentariosEntrevista,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidato-perfil', id] });
      setComentariosEntrevista('');
    },
  });

  // Mutación: Admitir Alumno Profer (otorga porcentaje de acceso: 100%, 66%, 50%, 0% y asigna squad)
  const admitirMutation = useMutation({
    mutationFn: async () => {
      return apiClient.post(`/evaluacion/candidatos/${id}/admitir`, {
        equipoId: asignacionDiferida ? undefined : (equipoSeleccionadoId || undefined),
        porcentajeAcceso,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidato-perfil', id] });
      queryClient.invalidateQueries({ queryKey: ['admisiones-panel'] });
      setModalAdmitir(false);
    },
  });

  // Mutación: Registrar Abandono de Candidatura (nunca "rechazado")
  const abandonarMutation = useMutation({
    mutationFn: async () => {
      return apiClient.post(`/evaluacion/candidatos/${id}/abandonar`, {
        motivo: motivoAbandono || 'El candidato desiste de incorporarse al programa',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidato-perfil', id] });
      queryClient.invalidateQueries({ queryKey: ['admisiones-panel'] });
      setModalAbandonar(false);
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

  const copiarEnlaceMeet = (enlace?: string) => {
    const link = enlace || enlaceMeet;
    if (!link) return;
    navigator.clipboard.writeText(link);
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
      `Entrevista Técnica PROFER - ${candidato?.usuario?.nombre} ${candidato?.usuario?.apellidos}`,
    );
    const details = encodeURIComponent(
      `Sesión de Entrevista de Selección CTS Academy.\nEnlace Meet: ${
        enlaceMeet || 'https://meet.google.com/cts-eval-demo'
      }\nCandidato: ${candidato?.usuario?.email}`,
    );
    const add = encodeURIComponent(candidato?.usuario?.email || '');
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
        <main className="w-full px-4 sm:px-6 lg:px-8 py-12 text-center">
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
  const yaAbandonado = candidato.estado_postulacion === 'ABANDONADO' || candidato.estado_postulacion === 'RECHAZADO';
  const recomendacion = candidato.recomendacionSquad;
  const sugerido = recomendacion?.equipoSugerido;
  const testTecnico = candidato.tests?.find((t: any) => t.tipo_bateria === 'TECNICO');
  const testActitud = candidato.tests?.find((t: any) => t.tipo_bateria === 'ACTITUD');
  const testAptitud = candidato.tests?.find((t: any) => t.tipo_bateria === 'APTITUD');

  const perfilCompetencias = candidato.perfil_competencias || {};
  const porcentajeOtorgado = candidato.porcentaje_acceso ?? perfilCompetencias.porcentajeAcceso;
  const informe16PF = perfilCompetencias.informe16PF;
  const matrizAptitudes = perfilCompetencias.matrizAptitudes;
  const informeTecnico = perfilCompetencias.informePruebaTecnica;

  // Cálculo del paso activo en el Stepper (1 a 4)
  const testsCompletadosCount = [
    testActitud?.estado === 'COMPLETADO',
    testAptitud?.estado === 'COMPLETADO',
    testTecnico?.estado === 'COMPLETADO',
  ].filter(Boolean).length;

  const entrevistaRealizada =
    candidato.entrevista?.estado === 'REALIZADA' ||
    (candidato.entrevista?.anotaciones && candidato.entrevista.anotaciones.length > 0);

  let etapaActual = 1;
  if (yaAdmitido || yaAbandonado) {
    etapaActual = 4;
  } else if (candidato.estado_postulacion === 'ENTREVISTA_AGENDADA' || entrevistaRealizada) {
    etapaActual = 3;
  } else if (candidato.estado_postulacion === 'TESTS_COMPLETADOS' || testsCompletadosCount === 3) {
    etapaActual = 3;
  } else if (testsCompletadosCount > 0 || candidato.estado_postulacion === 'EN_PROCESO') {
    etapaActual = 2;
  } else {
    etapaActual = 2; // Registro ya completado
  }

  // Preparar datos para el radar de aptitud en el resumen
  const categoriasAptitud = matrizAptitudes?.categorias || [];
  const radarDataAptitud = categoriasAptitud.map((cat: any) => {
    const avg =
      cat.items && cat.items.length > 0
        ? Number((cat.items.reduce((acc: number, it: any) => acc + it.nivelActual, 0) / cat.items.length).toFixed(1))
        : 0;
    const shortLabel = cat.nombre.length > 15 ? cat.nombre.slice(0, 13) + '…' : cat.nombre;
    return {
      dimension: shortLabel,
      nombreCompleto: cat.nombre,
      nivel: avg,
      deseado: 5,
    };
  });

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col font-sans">
      <Navbar />

      {/* ANCHO COMPLETO DE PANTALLA (Punto 6) */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-5 flex-1 space-y-6">
        
        {/* ========================================================= */}
        {/* CONTENEDOR 1: CABECERA INTEGRADA + FLUJO EN CÍRCULOS     */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          {/* Barra superior de navegación y acciones de dictamen */}
          <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <button
              onClick={() => {
                if (vistaDetallada !== 'resumen') {
                  setVistaDetallada('resumen');
                } else {
                  navigate('/admisiones/panel');
                }
              }}
              className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-slate-400" />
              <span>
                {vistaDetallada !== 'resumen'
                  ? '← Volver al Expediente Principal'
                  : 'Volver al Panel de Admisiones'}
              </span>
            </button>

            {/* Chip de Estado + Botones de Decisión al lado */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border inline-flex items-center space-x-1.5 ${
                  yaAdmitido
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : yaAbandonado
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-blue-50 text-blue-800 border-blue-300'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${yaAdmitido ? 'bg-emerald-500' : yaAbandonado ? 'bg-amber-500' : 'bg-blue-500'}`} />
                <span>
                  {yaAdmitido
                    ? `Admitido • ${porcentajeOtorgado ?? 100}% Acceso`
                    : yaAbandonado
                    ? 'Candidatura Abandonada'
                    : candidato.estado_postulacion}
                </span>
              </span>

              {!yaAdmitido && !yaAbandonado && (
                <>
                  <button
                    onClick={() => {
                      if (sugerido?.id) {
                        setEquipoSeleccionadoId(sugerido.id);
                      }
                      setModalAdmitir(true);
                    }}
                    className="px-3.5 py-1.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Admitir Alumno</span>
                  </button>

                  <button
                    onClick={() => setModalAbandonar(true)}
                    className="px-3.5 py-1.5 border border-amber-300 bg-amber-50/50 text-amber-800 hover:bg-amber-100 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer"
                    title="Marcar si el candidato decide no continuar o no incorporarse"
                  >
                    <UserX className="w-3.5 h-3.5 text-amber-700" />
                    <span>Abandonar Candidatura</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Información del Postulante & Botones de Reporte */}
          <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200/80">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {candidato.usuario?.nombre} {candidato.usuario?.apellidos}
                </h1>
                {porcentajeOtorgado !== undefined && porcentajeOtorgado !== null && (
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-blue-100 text-[#01579B] border border-blue-200">
                    {porcentajeOtorgado}% Beca / Acceso Otorgado
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>
                  Email: <strong className="text-slate-800 font-mono">{candidato.usuario?.email}</strong>
                </span>
                <span>•</span>
                <span>
                  Sede: <strong className="text-slate-800">{candidato.sede_origen}</strong>
                </span>
                <span>•</span>
                <span>
                  Teléfono: <strong className="text-slate-800">{candidato.telefono || 'No registrado'}</strong>
                </span>
                <span>•</span>
                <span>
                  Convocatoria: <strong className="text-slate-700">{candidato.convocatoria?.denominacion}</strong>
                </span>
              </p>
            </div>

            {/* Acciones principales de expediente */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowPdfModal(true)}
                className="px-4 py-2 bg-[#01579B] hover:bg-[#004174] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-2"
              >
                <FileDown className="w-4 h-4 text-blue-200" />
                <span>Descargar Informe de Entrevista (PDF)</span>
              </button>

              <button
                onClick={() => setModalInvitacion(true)}
                className="px-3.5 py-2 border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl shadow-2xs transition-colors flex items-center space-x-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>Credenciales e Invitación</span>
              </button>
            </div>
          </div>

          {/* FLUJO CON CÍRCULOS Y UNA LÍNEA (Punto 5) */}
          <div className="p-6 bg-slate-50/40">
            <div className="flex items-center justify-between mb-3 px-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Flujo del Proceso de Admisión PROFER
              </span>
              <span className="text-xs font-semibold text-slate-600">
                {yaAdmitido
                  ? 'Proceso Concluido: Alumno Admitido'
                  : yaAbandonado
                  ? 'Proceso Concluido: Candidatura Archivada'
                  : `Etapa ${etapaActual} de 4 en Curso`}
              </span>
            </div>

            <div className="relative py-2 px-4">
              {/* Línea conectora horizontal */}
              <div className="absolute top-6 left-12 right-12 h-1 bg-slate-200 -translate-y-1/2 z-0 hidden sm:block">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{
                    width:
                      etapaActual === 1
                        ? '0%'
                        : etapaActual === 2
                        ? '33%'
                        : etapaActual === 3
                        ? '66%'
                        : '100%',
                  }}
                />
              </div>

              {/* 4 Círculos con labels */}
              <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                {/* Paso 1: Registro */}
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-xs bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-xs">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 mt-2">1. Registro Inicial</span>
                  <span className="text-[11px] text-slate-500 font-medium">Credenciales enviadas</span>
                </div>

                {/* Paso 2: Tests */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs transition-all shadow-xs ${
                      testsCompletadosCount === 3 || etapaActual > 2
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                        : etapaActual === 2
                        ? 'bg-[#01579B] text-white ring-4 ring-blue-100 animate-pulse'
                        : 'bg-white border-2 border-slate-300 text-slate-400'
                    }`}
                  >
                    {testsCompletadosCount === 3 || etapaActual > 2 ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      <span>2</span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-900 mt-2">2. Tests de Admisión</span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {testsCompletadosCount === 3 ? '3/3 completados' : `${testsCompletadosCount}/3 completados`}
                  </span>
                </div>

                {/* Paso 3: Entrevista */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs transition-all shadow-xs ${
                      entrevistaRealizada || etapaActual > 3
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                        : etapaActual === 3
                        ? 'bg-[#01579B] text-white ring-4 ring-blue-100 animate-pulse'
                        : 'bg-white border-2 border-slate-300 text-slate-400'
                    }`}
                  >
                    {entrevistaRealizada || etapaActual > 3 ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      <span>3</span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-900 mt-2">3. Entrevista Técnica</span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {entrevistaRealizada
                      ? 'Conclusiones listas'
                      : candidato.entrevista
                      ? 'Sesión agendada'
                      : 'Pendiente agendar'}
                  </span>
                </div>

                {/* Paso 4: Dictamen */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs transition-all shadow-xs ${
                      yaAdmitido
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                        : yaAbandonado
                        ? 'bg-amber-600 text-white ring-4 ring-amber-100'
                        : etapaActual === 4
                        ? 'bg-[#01579B] text-white ring-4 ring-blue-100'
                        : 'bg-white border-2 border-slate-300 text-slate-400'
                    }`}
                  >
                    {yaAdmitido ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : yaAbandonado ? (
                      <UserX className="w-4 h-4 text-white" />
                    ) : (
                      <span>4</span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-900 mt-2">4. Dictamen Final</span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {yaAdmitido
                      ? `${porcentajeOtorgado ?? 100}% Beca & Squad`
                      : yaAbandonado
                      ? 'Candidatura archivada'
                      : 'Otorgar % acceso'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* VISTAS DETALLADAS INDIVIDUALES (Si el usuario hizo click) */}
        {/* ========================================================= */}
        {vistaDetallada === 'actitud16pf' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <button
                onClick={() => setVistaDetallada('resumen')}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center space-x-1"
              >
                <span>← Volver al Expediente Principal</span>
              </button>
              <span className="text-xs font-extrabold text-slate-700">Informe Psicométrico 16PF Oficial</span>
            </div>
            {informe16PF ? (
              <Informe16PFView informe={informe16PF} />
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                El candidato aún no ha completado el cuestionario de actitud 16PF.
              </div>
            )}
          </div>
        )}

        {vistaDetallada === 'aptitudMatriz' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <button
                onClick={() => setVistaDetallada('resumen')}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center space-x-1"
              >
                <span>← Volver al Expediente Principal</span>
              </button>
              <span className="text-xs font-extrabold text-slate-700">Matriz Oficial de Aptitudes & Diagramas de Radar</span>
            </div>
            {matrizAptitudes ? (
              <MatrizAptitudesView matriz={matrizAptitudes} />
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                El candidato aún no ha completado la matriz de aptitudes.
              </div>
            )}
          </div>
        )}

        {vistaDetallada === 'tecnicoCts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <button
                onClick={() => setVistaDetallada('resumen')}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center space-x-1"
              >
                <span>← Volver al Expediente Principal</span>
              </button>
              <span className="text-xs font-extrabold text-slate-700">Auditoría de Prueba Técnica CTS</span>
            </div>
            {informeTecnico ? (
              <ReportePruebaTecnicaView informe={informeTecnico} />
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                El examen técnico oficial aún no ha sido completado por el aspirante.
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* EXPEDIENTE RESUMIDO PRINCIPAL (Con jerarquía unificada)   */}
        {/* ========================================================= */}
        {vistaDetallada === 'resumen' && (
          <div className="space-y-6">
            
            {/* ----------------------------------------------------- */}
            {/* SECCIÓN 1: DIAGNÓSTICO & CAPTURAS DE BATERÍAS (Punto 1 y 4) */}
            {/* ----------------------------------------------------- */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Sección 1 • Resultados de las Baterías de Admisión</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Capturas visuales fidedignas: Diagramas de radar para Aptitud y Tabla oficial de decatipos para Actitud (sin textos largos).
                  </p>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1.1 Batería de Aptitud: Solo Diagrama de Radar (Punto 1) */}
                <div className="bg-slate-50/50 rounded-xl border border-slate-200/80 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                          <Cpu className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-bold text-slate-900">Aptitud: Diagrama de Radar</h4>
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {matrizAptitudes ? `${matrizAptitudes.promedioNivelActual || '2.8'} / 5.0` : 'Pendiente'}
                      </span>
                    </div>

                    {matrizAptitudes ? (
                      <div className="h-56 w-full py-1">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={radarDataAptitud}>
                            <PolarGrid stroke="#E2E8F0" />
                            <PolarAngleAxis dataKey="dimension" tick={{ fill: '#334155', fontSize: 9, fontWeight: 600 }} />
                            <PolarRadiusAxis domain={[0, 5]} stroke="#CBD5E1" tickCount={6} />
                            <Tooltip formatter={(val: any) => [`${val} / 5.0`, 'Nivel']} />
                            <Radar name="Aptitud" dataKey="nivel" stroke="#0266CC" fill="#0266CC" fillOpacity={0.4} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-56 flex items-center justify-center text-center p-4">
                        <p className="text-xs text-slate-400 italic">
                          El candidato aún no ha completado la matriz de aptitudes.
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setVistaDetallada('aptitudMatriz')}
                    className="mt-3 pt-2.5 border-t border-slate-200/80 w-full flex items-center justify-between text-xs text-blue-700 font-bold hover:text-blue-900 cursor-pointer"
                  >
                    <span>Ver matriz y radars por categoría</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 1.2 Batería de Actitud: Solo Tabla de Decatipos (Punto 1: NO explicaciones) */}
                <div className="bg-slate-50/50 rounded-xl border border-slate-200/80 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-rose-50 text-rose-700 rounded-lg">
                          <HeartPulse className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-bold text-slate-900">Actitud: Tabla Decatipos 16PF</h4>
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {informe16PF ? '16 Factores' : 'Pendiente'}
                      </span>
                    </div>

                    {informe16PF ? (
                      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white max-h-56 overflow-y-auto">
                        <table className="w-full text-left border-collapse text-[11px]">
                          <thead>
                            <tr className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200 text-[10px] uppercase">
                              <th className="py-1 px-2">Factor</th>
                              <th className="py-1 px-1.5 text-center">Decatipo</th>
                              <th className="py-1 px-2">Rasgo Dominante</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {(informe16PF.factores || []).slice(0, 7).map((f: any) => {
                              const pc = f.pc ?? f.pd ?? 6;
                              const rasgo = pc >= 6 ? f.altaPuntuacion : f.bajaPuntuacion;
                              return (
                                <tr key={f.factor} className="hover:bg-slate-50">
                                  <td className="py-1 px-2 font-mono font-bold text-slate-900">
                                    Factor {f.factor}
                                  </td>
                                  <td className="py-1 px-1.5 text-center font-bold text-blue-800 font-mono">
                                    {pc} / 10
                                  </td>
                                  <td className="py-1 px-2 text-slate-700 truncate max-w-[140px] font-medium">
                                    {rasgo}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="h-56 flex items-center justify-center text-center p-4">
                        <p className="text-xs text-slate-400 italic">
                          El candidato aún no ha completado el cuestionario de actitud 16PF.
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setVistaDetallada('actitud16pf')}
                    className="mt-3 pt-2.5 border-t border-slate-200/80 w-full flex items-center justify-between text-xs text-rose-700 font-bold hover:text-rose-900 cursor-pointer"
                  >
                    <span>Ver informe psicométrico 16PF</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 1.3 Prueba Técnica CTS: Desglose por áreas y calificación */}
                <div className="bg-slate-50/50 rounded-xl border border-slate-200/80 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-purple-50 text-purple-700 rounded-lg">
                          <Terminal className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-bold text-slate-900">Prueba Técnica CTS</h4>
                      </div>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        testTecnico?.estado === 'COMPLETADO'
                          ? Number(testTecnico?.calificacion_obtenida || 0) >= 5
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {testTecnico?.estado === 'COMPLETADO'
                          ? `${Number(testTecnico.calificacion_obtenida).toFixed(1)} / 10.0`
                          : 'Pendiente'}
                      </span>
                    </div>

                    {testTecnico?.estado === 'COMPLETADO' ? (
                      <div className="space-y-3 py-2">
                        <div className="p-3 bg-white rounded-lg border border-slate-200 text-center">
                          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                            Calificación Numérica Global
                          </span>
                          <span className="text-3xl font-black text-slate-900 block mt-0.5">
                            {Number(testTecnico.calificacion_obtenida).toFixed(1)}
                            <span className="text-xs text-slate-400 font-normal ml-1">/ 10</span>
                          </span>
                        </div>

                        {/* Desglose por Áreas Técnicas */}
                        <div className="space-y-1.5 text-xs">
                          {informeTecnico?.puntuacionesPorArea && (
                            <>
                              <div className="flex justify-between items-center text-[11px]">
                                <span className="font-semibold text-slate-700">General:</span>
                                <span className="font-mono font-bold text-slate-900">
                                  {informeTecnico.puntuacionesPorArea.general}%
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-[11px]">
                                <span className="font-semibold text-slate-700">Frontend:</span>
                                <span className="font-mono font-bold text-slate-900">
                                  {informeTecnico.puntuacionesPorArea.frontend}%
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-[11px]">
                                <span className="font-semibold text-slate-700">Backend:</span>
                                <span className="font-mono font-bold text-slate-900">
                                  {informeTecnico.puntuacionesPorArea.backend}%
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="h-56 flex items-center justify-center text-center p-4">
                        <p className="text-xs text-slate-400 italic">
                          El aspirante aún no ha finalizado la evaluación técnica oficial.
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setVistaDetallada('tecnicoCts')}
                    className="mt-3 pt-2.5 border-t border-slate-200/80 w-full flex items-center justify-between text-xs text-purple-700 font-bold hover:text-purple-900 cursor-pointer"
                  >
                    <span>Ver auditoría de respuestas técnicas</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            </div>

            {/* ----------------------------------------------------- */}
            {/* SECCIÓN 2: AFINIDAD SQUADS CTS & ASIGNACIÓN (Punto 4) */}
            {/* ----------------------------------------------------- */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>Sección 2 • Afinidad Algorítmica con Squads CTS Oficiales</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Evaluación y encaje tecnológico en los 4 equipos con sus respectivos líderes técnicos.
                  </p>
                </div>

                {sugerido && (
                  <span className="text-[11px] font-extrabold px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full">
                    Top Match Recomendado: {sugerido.nombre} ({sugerido.afinidadPorcentaje}%)
                  </span>
                )}
              </div>

              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(recomendacion?.rankingEquipos || [
                  { id: '1', codigo: 'TEAM-01', nombre: 'Fénix', afinidadPorcentaje: 0, lider: 'Diego Moys' },
                  { id: '2', codigo: 'TEAM-02', nombre: 'Departamento de Sistemas', afinidadPorcentaje: 0, lider: 'Alejandro Ruiz' },
                  { id: '3', codigo: 'TEAM-03', nombre: 'Presencia Web', afinidadPorcentaje: 0, lider: 'Lucía Vargas' },
                  { id: '4', codigo: 'TEAM-04', nombre: 'Acción Docente', afinidadPorcentaje: 0, lider: 'Marcos Navarro' },
                ]).map((eq: any) => {
                  const esTop = sugerido && eq.codigo === sugerido.codigo;
                  return (
                    <div
                      key={eq.id}
                      onClick={() => {
                        if (!yaAdmitido && !yaAbandonado) {
                          setEquipoSeleccionadoId(eq.id);
                          setModalAdmitir(true);
                        }
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        esTop
                          ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-100 shadow-xs'
                          : 'bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-slate-100/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                            {eq.codigo}
                          </span>
                          {esTop && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                              Recomendado
                            </span>
                          )}
                        </div>

                        <h4 className="font-extrabold text-xs text-slate-900 truncate" title={eq.nombre}>
                          {eq.nombre}
                        </h4>

                        {/* Líder Técnico dentro de cada equipo */}
                        <div className="flex items-center space-x-1.5 text-[11px] text-slate-600 mt-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">
                            Líder: <strong className="text-slate-800">{eq.lider || 'Coordinador'}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-200/80">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] text-slate-500 font-medium">Afinidad</span>
                          <span className={`text-xs font-black ${esTop ? 'text-blue-700' : 'text-slate-700'}`}>
                            {eq.afinidadPorcentaje || 0}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${esTop ? 'bg-blue-600' : 'bg-slate-400'}`}
                            style={{ width: `${eq.afinidadPorcentaje || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ----------------------------------------------------- */}
            {/* SECCIÓN 3: ENTREVISTA & ANOTACIONES CUALITATIVAS (P3)  */}
            {/* ----------------------------------------------------- */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                    <Video className="w-4 h-4 text-blue-600" />
                    <span>Sección 3 • Entrevista de Selección & Deliberación Cualitativa</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Coordinación de la sesión Google Meet y registro formal de observaciones según la plantilla oficial.
                  </p>
                </div>

                {candidato.entrevista ? (
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    Estado: {candidato.entrevista.estado}
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      generarEnlaceMeet();
                      setModalEntrevista(true);
                    }}
                    className="px-3.5 py-1.5 bg-[#01579B] hover:bg-[#004174] text-white rounded-lg text-xs font-bold shadow-xs transition-colors inline-flex items-center space-x-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Agendar Google Meet</span>
                  </button>
                )}
              </div>

              <div className="p-6 space-y-6">
                {/* Bloque Google Meet */}
                {candidato.entrevista && (
                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                        Sesión Programada en Google Calendar
                      </span>
                      <p className="font-bold text-slate-900 text-xs">
                        {new Date(candidato.entrevista.fecha_hora_programada).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        Enlace: {candidato.entrevista.enlace_google_meet}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => copiarEnlaceMeet(candidato.entrevista.enlace_google_meet)}
                        className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold inline-flex items-center space-x-1 shadow-2xs"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiadoMeet ? '¡Copiado!' : 'Copiar'}</span>
                      </button>

                      <a
                        href={candidato.entrevista.enlace_google_meet}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold inline-flex items-center space-x-1 shadow-xs"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Unirse a Meet</span>
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>

                      <button
                        onClick={() => {
                          generarEnlaceMeet();
                          setModalEntrevista(true);
                        }}
                        className="px-2.5 py-1.5 text-slate-500 hover:text-slate-800 text-xs font-medium"
                      >
                        Reprogramar
                      </button>
                    </div>
                  </div>
                )}

                {/* Formulario y Registro de Anotaciones */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                    <MessageSquare className="w-4 h-4 text-amber-600" />
                    <span>Registro de Observaciones para la Plantilla Oficial de Entrevista</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">Dimensión / Item Evaluado:</label>
                        <select
                          value={itemAnotacion}
                          onChange={(e: any) => setItemAnotacion(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="Actitud">Actitud (Comportamiento, Colaboración, Motivación)</option>
                          <option value="Aptitud">Aptitud (Solvencia Técnica, Análisis Lógico)</option>
                          <option value="Generalidades">Generalidades (Comunicación, Disponibilidad)</option>
                          <option value="Recomendaciones">Recomendaciones (Squad idóneo, Integración)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">Calificación Cualitativa:</label>
                        <select
                          value={calificacionAnotacion}
                          onChange={(e: any) => setCalificacionAnotacion(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="SOBRESALIENTE">Sobresaliente</option>
                          <option value="COMPETENTE">Competente</option>
                          <option value="EN_DESARROLLO">En Desarrollo</option>
                          <option value="NO_IDONEO">No Idóneo</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <textarea
                        rows={3}
                        value={comentariosEntrevista}
                        onChange={(e) => setComentariosEntrevista(e.target.value)}
                        placeholder="Registrar observaciones cualitativas del aspirante..."
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => anotacionesMutation.mutate()}
                        disabled={!comentariosEntrevista.trim() || anotacionesMutation.isPending}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                      >
                        {anotacionesMutation.isPending ? 'Guardando...' : 'Registrar Observación'}
                      </button>
                    </div>
                  </div>

                  {/* Historial de anotaciones */}
                  {candidato.entrevista?.anotaciones && candidato.entrevista.anotaciones.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Observaciones Guardadas en el Expediente
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {candidato.entrevista.anotaciones.map((anot: any) => (
                          <div
                            key={anot.id}
                            className="p-3 bg-amber-50/50 border border-amber-200/80 rounded-xl text-xs space-y-1"
                          >
                            <div className="flex justify-between items-center font-bold text-amber-900">
                              <span className="text-xs">{anot.competencia_evaluada}</span>
                              <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded">
                                {anot.calificacion_cualitativa}
                              </span>
                            </div>
                            <p className="text-slate-700 text-[11px] leading-relaxed">{anot.comentario}</p>
                            <span className="text-[9px] text-slate-400 block pt-1 font-mono">
                              {new Date(anot.creado_en).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL: ADMITIR ALUMNO (Con cierre al hacer clic fuera)    */}
        {/* ========================================================= */}
        {modalAdmitir && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setModalAdmitir(false);
            }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-black text-slate-900">Dictamen de Admisión PROFER</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Asignar porcentaje de acceso/beca y squad para {candidato.usuario?.nombre} {candidato.usuario?.apellidos}.
                  </p>
                </div>
                <button
                  onClick={() => setModalAdmitir(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <UserX className="w-4 h-4" />
                </button>
              </div>

              {/* Selector de Porcentaje de Acceso */}
              <div className="space-y-2">
                <label className="block text-xs font-extrabold uppercase text-slate-600 tracking-wider">
                  1. Porcentaje de Beca / Acceso Otorgado:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[100, 66, 50, 0].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setPorcentajeAcceso(pct)}
                      className={`py-2.5 px-2 rounded-xl text-xs font-black border transition-all text-center cursor-pointer ${
                        porcentajeAcceso === pct
                          ? 'bg-[#01579B] text-white border-[#01579B] shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-base font-extrabold">{pct}%</div>
                      <div className="text-[9px] uppercase font-semibold opacity-80">
                        {pct === 100 ? 'Beca Total' : pct === 66 ? 'Preferente' : pct === 50 ? 'Parcial' : 'Estándar'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selector de Squad */}
              <div className="space-y-2">
                <label className="block text-xs font-extrabold uppercase text-slate-600 tracking-wider">
                  2. Asignación de Squad Oficial:
                </label>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {(equiposData || []).map((eq: any) => {
                    const esSugerido = sugerido?.id === eq.id;
                    const esSeleccionado = equipoSeleccionadoId === eq.id && !asignacionDiferida;

                    return (
                      <div
                        key={eq.id}
                        onClick={() => {
                          setEquipoSeleccionadoId(eq.id);
                          setAsignacionDiferida(false);
                        }}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                          esSeleccionado
                            ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-[10px] text-slate-400 font-bold">{eq.codigo}</span>
                            <span className="font-bold text-slate-900">{eq.nombre}</span>
                            {esSugerido && (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                                Match Sugerido
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            Líder: {eq.lider?.nombre || 'Coordinador'} {eq.lider?.apellidos || ''}
                          </span>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            esSeleccionado ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                          }`}
                        >
                          {esSeleccionado && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={asignacionDiferida}
                      onChange={(e) => setAsignacionDiferida(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Diferir asignación de equipo (asignar squad definitivo durante la incorporación)</span>
                  </label>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalAdmitir(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => admitirMutation.mutate()}
                  disabled={admitirMutation.isPending || (!asignacionDiferida && !equipoSeleccionadoId)}
                  className="px-4 py-2 bg-[#2E7D32] hover:bg-[#1B5E20] disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  {admitirMutation.isPending ? 'Confirmando...' : `Confirmar Admisión (${porcentajeAcceso}% Acceso)`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL: ABANDONAR CANDIDATURA (Cierre al hacer clic fuera) */}
        {/* ========================================================= */}
        {modalAbandonar && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setModalAbandonar(false);
            }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2 text-amber-800">
                  <UserX className="w-5 h-5 text-amber-600" />
                  <h3 className="text-base font-black text-slate-900">Registrar Abandono de Candidatura</h3>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Esta acción registra que el aspirante <strong>{candidato.usuario?.nombre} {candidato.usuario?.apellidos}</strong> ha decidido no continuar o no incorporarse al programa PROFER. No se utiliza el término rechazo en su expediente.
              </p>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Motivo de Abandono o No Incorporación:
                </label>
                <select
                  value={motivoAbandono}
                  onChange={(e) => setMotivoAbandono(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-amber-500"
                >
                  <option value="">Seleccionar motivo frecuente...</option>
                  <option value="El candidato decide no incorporarse por motivos laborales o personales">
                    Decisión personal o compatibilidad laboral
                  </option>
                  <option value="Desiste del porcentaje de acceso/beca otorgado">
                    Desiste del porcentaje de beca otorgado
                  </option>
                  <option value="No responde a las convocatorias de entrevista o pruebas">
                    Sin respuesta en convocatorias de entrevista
                  </option>
                  <option value="Incorporación a otra oportunidad académica/profesional">
                    Incorporación a otra institución
                  </option>
                </select>

                <textarea
                  rows={2}
                  value={motivoAbandono}
                  onChange={(e) => setMotivoAbandono(e.target.value)}
                  placeholder="Detallar observaciones o motivo específico..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-amber-500 mt-2"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalAbandonar(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => abandonarMutation.mutate()}
                  disabled={abandonarMutation.isPending}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  {abandonarMutation.isPending ? 'Archivando...' : 'Confirmar Abandono'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: AGENDAR GOOGLE MEET (Cierre al hacer clic fuera) */}
        {modalEntrevista && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setModalEntrevista(false);
            }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
                  <Video className="w-5 h-5 text-blue-600" />
                  <span>Programar Entrevista Google Meet</span>
                </h3>
                <button onClick={() => setModalEntrevista(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                  <UserX className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Fecha y Hora de la Sesión:</label>
                  <input
                    type="datetime-local"
                    value={fechaEntrevista}
                    onChange={(e) => setFechaEntrevista(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Enlace a Google Meet:</label>
                  <div className="flex space-x-2">
                    <input
                      type="url"
                      value={enlaceMeet}
                      onChange={(e) => setEnlaceMeet(e.target.value)}
                      placeholder="https://meet.google.com/xyz-abcd-uvw"
                      className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={generarEnlaceMeet}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer"
                    >
                      Generar
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={abrirEnGoogleCalendar}
                  disabled={!fechaEntrevista}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 disabled:opacity-40 cursor-pointer"
                >
                  + Añadir a Google Calendar
                </button>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setModalEntrevista(false)}
                    className="px-3 py-2 border border-slate-300 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => agendarMutation.mutate()}
                    disabled={!fechaEntrevista || agendarMutation.isPending}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    {agendarMutation.isPending ? 'Guardando...' : 'Agendar Sesión'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: CREDENCIALES E INVITACIÓN */}
        {modalInvitacion && (
          <InvitacionCandidatoModal
            isOpen={modalInvitacion}
            onClose={() => setModalInvitacion(false)}
            candidatoId={id!}
            candidatoNombre={`${candidato.usuario?.nombre} ${candidato.usuario?.apellidos}`}
            candidatoEmail={candidato.usuario?.email || ''}
          />
        )}

        {/* MODAL: RESUMEN PDF CON PLANTILLA OFICIAL */}
        {showPdfModal && (
          <ResumenResultadosPdfModal
            isOpen={showPdfModal}
            onClose={() => setShowPdfModal(false)}
            candidato={candidato}
          />
        )}
      </main>
    </div>
  );
};

export default CandidatoPerfilPage;
