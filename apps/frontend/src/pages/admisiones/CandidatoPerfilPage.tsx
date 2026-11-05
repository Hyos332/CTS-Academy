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
  Clock,
  Sparkles,
  Users,
  Award,
} from 'lucide-react';
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
  const yaAbandonado = candidato.estado_postulacion === 'ABANDONADO' || candidato.estado_postulacion === 'RECHAZADO';
  const recomendacion = candidato.recomendacionSquad;
  const sugerido = recomendacion?.equipoSugerido;
  const testTecnico = candidato.tests?.find((t: any) => t.tipo_bateria === 'TECNICO');
  const testActitud = candidato.tests?.find((t: any) => t.tipo_bateria === 'ACTITUD');
  const testAptitud = candidato.tests?.find((t: any) => t.tipo_bateria === 'APTITUD');

  const perfilCompetencias = candidato.perfil_competencias || {};
  const porcentajeOtorgado = candidato.porcentaje_acceso ?? perfilCompetencias.porcentajeAcceso;

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

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar />

      <main className="w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 space-y-6 max-w-7xl mx-auto">
        {/* ========================================================= */}
        {/* BARRA SUPERIOR DE NAVEGACIÓN Y BOTONES DE ACCIÓN (Punto 6)*/}
        {/* ========================================================= */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white px-5 py-3.5 rounded-xl border border-slate-200 shadow-2xs">
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
                ? '← Volver al Expediente Resumido'
                : 'Volver al Panel de Admisiones'}
            </span>
          </button>

          {/* Estado del Candidato + Botones Admitir / Abandonar al lado del Chip */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Chip de Estado Oficial */}
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

            {/* Botones de Decisión al lado del Chip de Estado */}
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

        {/* ========================================================= */}
        {/* FICHA RESUMEN DEL CANDIDATO (Sin botón agendar Meet arriba) */}
        {/* ========================================================= */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {candidato.usuario?.nombre} {candidato.usuario?.apellidos}
              </h1>
              {porcentajeOtorgado !== undefined && porcentajeOtorgado !== null && (
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-blue-100 text-[#01579B] border border-blue-200">
                  {porcentajeOtorgado}% Beca / Acceso
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
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
            </p>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Convocatoria Oficial: <span className="text-slate-700">{candidato.convocatoria?.denominacion}</span>
            </p>
          </div>

          {/* Botones de Reporte y Credenciales */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowPdfModal(true)}
              className="px-4 py-2 bg-[#01579B] hover:bg-[#004174] text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center space-x-2"
            >
              <FileDown className="w-4 h-4 text-blue-200" />
              <span>Descargar Informe de Entrevista (PDF)</span>
            </button>

            <button
              onClick={() => setModalInvitacion(true)}
              className="px-3.5 py-2 border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center space-x-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>Credenciales e Invitación</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* STEPPER / LÍNEA DE TIEMPO DEL PROCESO DE ADMISIÓN (Punto 7) */}
        {/* ========================================================= */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Flujo de la Candidatura PROFER
            </span>
            <span className="text-xs font-semibold text-slate-600">
              {yaAdmitido
                ? 'Proceso Concluido: Alumno Admitido'
                : yaAbandonado
                ? 'Proceso Concluido: Candidatura Archivada'
                : `Etapa ${etapaActual} de 4 en Curso`}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 relative">
            {/* Paso 1: Registro */}
            <div
              className={`p-3 rounded-lg border transition-all ${
                etapaActual >= 1
                  ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider">Etapa 1</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <h4 className="font-bold text-xs">Registro Inicial</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Expediente y credenciales</p>
            </div>

            {/* Paso 2: Tests de Admisión */}
            <div
              className={`p-3 rounded-lg border transition-all ${
                etapaActual > 2 || testsCompletadosCount === 3
                  ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
                  : etapaActual === 2
                  ? 'bg-blue-50/80 border-blue-400 text-blue-900 ring-2 ring-blue-100'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider">Etapa 2</span>
                {testsCompletadosCount === 3 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Clock className="w-4 h-4 text-blue-600 animate-pulse" />
                )}
              </div>
              <h4 className="font-bold text-xs">Tests de Admisión</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {testsCompletadosCount === 3 ? '3/3 completados' : `${testsCompletadosCount}/3 completados`}
              </p>
            </div>

            {/* Paso 3: Entrevista de Selección */}
            <div
              className={`p-3 rounded-lg border transition-all ${
                etapaActual > 3 || entrevistaRealizada
                  ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
                  : etapaActual === 3
                  ? 'bg-blue-50/80 border-blue-400 text-blue-900 ring-2 ring-blue-100'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider">Etapa 3</span>
                {entrevistaRealizada ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : candidato.entrevista ? (
                  <Calendar className="w-4 h-4 text-blue-600" />
                ) : (
                  <span className="text-[10px] text-slate-400 font-mono">Pendiente</span>
                )}
              </div>
              <h4 className="font-bold text-xs">Entrevista Técnica</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {entrevistaRealizada
                  ? 'Realizada con anotaciones'
                  : candidato.entrevista
                  ? 'Sesión agendada'
                  : 'Por agendar Meet'}
              </p>
            </div>

            {/* Paso 4: Dictamen Final */}
            <div
              className={`p-3 rounded-lg border transition-all ${
                yaAdmitido
                  ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
                  : yaAbandonado
                  ? 'bg-amber-50/80 border-amber-300 text-amber-900'
                  : etapaActual === 4
                  ? 'bg-blue-50/80 border-blue-400 text-blue-900 ring-2 ring-blue-100'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider">Etapa 4</span>
                {yaAdmitido ? (
                  <Award className="w-4 h-4 text-emerald-600" />
                ) : yaAbandonado ? (
                  <UserX className="w-4 h-4 text-amber-600" />
                ) : (
                  <span className="text-[10px] text-slate-400 font-mono">Pendiente</span>
                )}
              </div>
              <h4 className="font-bold text-xs">Dictamen Final</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {yaAdmitido
                  ? `${porcentajeOtorgado ?? 100}% Beca & Squad`
                  : yaAbandonado
                  ? 'Candidatura archivada'
                  : 'Otorgar % acceso & squad'}
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* VISTAS DETALLADAS DE CADA TEST (Al pulsar "Ver Detalles") */}
        {/* ========================================================= */}
        {vistaDetallada === 'actitud16pf' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
              <button
                onClick={() => setVistaDetallada('resumen')}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center space-x-1"
              >
                <span>← Volver al Expediente Principal</span>
              </button>
              <span className="text-xs font-extrabold text-slate-700">Informe Psicométrico 16PF Oficial</span>
            </div>
            {perfilCompetencias.informe16PF ? (
              <Informe16PFView informe={perfilCompetencias.informe16PF} />
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                El candidato aún no ha completado el cuestionario de actitud 16PF.
              </div>
            )}
          </div>
        )}

        {vistaDetallada === 'aptitudMatriz' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
              <button
                onClick={() => setVistaDetallada('resumen')}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center space-x-1"
              >
                <span>← Volver al Expediente Principal</span>
              </button>
              <span className="text-xs font-extrabold text-slate-700">Matriz Oficial de Aptitudes & Diagramas de Radar</span>
            </div>
            {perfilCompetencias.matrizAptitudes ? (
              <MatrizAptitudesView matriz={perfilCompetencias.matrizAptitudes} />
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                El candidato aún no ha completado la matriz de aptitudes.
              </div>
            )}
          </div>
        )}

        {vistaDetallada === 'tecnicoCts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
              <button
                onClick={() => setVistaDetallada('resumen')}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center space-x-1"
              >
                <span>← Volver al Expediente Principal</span>
              </button>
              <span className="text-xs font-extrabold text-slate-700">Auditoría de Prueba Técnica CTS</span>
            </div>
            {perfilCompetencias.informePruebaTecnica ? (
              <ReportePruebaTecnicaView informe={perfilCompetencias.informePruebaTecnica} />
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                El examen técnico oficial aún no ha sido completado por el aspirante.
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* PÁGINA SINTETIZADA EN UNA SOLA VISTA (Punto 2)            */}
        {/* ========================================================= */}
        {vistaDetallada === 'resumen' && (
          <div className="space-y-6">
            {/* 1. CARD DE RECOMENDACIÓN DE EQUIPOS COMPACTA Y NO INVASIVA (Punto 4) */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-[#01579B]" />
                    <span>Afinidad Algorítmica con Squads CTS Oficiales</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Evaluación computada sobre el stack tecnológico de los 4 equipos y la solvencia del aspirante.
                  </p>
                </div>
                {sugerido && (
                  <span className="text-[11px] font-extrabold px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full">
                    Top Match: {sugerido.nombre} ({sugerido.afinidadPorcentaje}%)
                  </span>
                )}
              </div>

              {/* Grid compacto de los 4 Squads con Líder Integrado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {(recomendacion?.rankingEquipos || [
                  { id: '1', codigo: 'TEAM-01', nombre: 'Fénix', afinidadPorcentaje: 0, lider: 'Diego Moys', tecnologias: ['React', 'Vue', 'PHP', 'Laravel'] },
                  { id: '2', codigo: 'TEAM-02', nombre: 'Departamento de Sistemas', afinidadPorcentaje: 0, lider: 'Alejandro Ruiz', tecnologias: ['Express', 'NodeJS', 'Fortinet'] },
                  { id: '3', codigo: 'TEAM-03', nombre: 'Presencia Web', afinidadPorcentaje: 0, lider: 'Lucía Vargas', tecnologias: ['WordPress', 'Drupal', 'NextJS'] },
                  { id: '4', codigo: 'TEAM-04', nombre: 'Acción Docente', afinidadPorcentaje: 0, lider: 'Marcos Navarro', tecnologias: ['PHP', 'Moodle', 'TypeScript'] },
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
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        esTop
                          ? 'bg-blue-50/60 border-blue-400 ring-2 ring-blue-100 shadow-xs'
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

                        {/* Líder Técnico dentro de cada equipo (Punto 4) */}
                        <div className="flex items-center space-x-1 text-[11px] text-slate-600 mt-1">
                          <Users className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">
                            Líder: <strong className="text-slate-800">{eq.lider || 'Asignado'}</strong>
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

            {/* 2. CARDS COMPACTAS DE LOS 3 TESTS CON REDIRECCIÓN A DETALLE (Puntos 2 y 9) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Batería de Actitud (16PF) */}
              <div
                onClick={() => setVistaDetallada('actitud16pf')}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                      <HeartPulse className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        testActitud?.estado === 'COMPLETADO'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {testActitud?.estado === 'COMPLETADO' ? 'Completado' : 'Pendiente'}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900">Actitud (16PF Oficial)</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                    Factores psicométricos de personalidad y dinámicas colaborativas en squad.
                  </p>

                  <div className="mt-3 p-2 bg-slate-50 rounded-lg border border-slate-100 text-[11px]">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Perfil Actitudinal</span>
                    <span className="font-bold text-slate-800 truncate block mt-0.5">
                      {testActitud?.estado === 'COMPLETADO'
                        ? (perfilCompetencias.informe16PF?.factoresPrincipales?.[0]?.etiqueta || 'Evaluación computada')
                        : 'Pendiente de realización'}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-rose-700 font-bold">
                  <span>Ver informe 16PF</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Card 2: Batería de Aptitud (Matriz con Radars) */}
              <div
                onClick={() => setVistaDetallada('aptitudMatriz')}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        testAptitud?.estado === 'COMPLETADO'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {testAptitud?.estado === 'COMPLETADO' ? 'Completado' : 'Pendiente'}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900">Aptitud (Diagramas de Radar)</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                    Diagramas polares y matriz técnica en 43 competencias de desarrollo.
                  </p>

                  <div className="mt-3 p-2 bg-slate-50 rounded-lg border border-slate-100 text-[11px]">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Promedio Aptitudes</span>
                    <span className="font-extrabold text-[#01579B] truncate block mt-0.5">
                      {testAptitud?.estado === 'COMPLETADO' && perfilCompetencias.matrizAptitudes
                        ? `${perfilCompetencias.matrizAptitudes.promedioNivelActual || '2.8'} / 5.0`
                        : 'Pendiente de realización'}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-blue-700 font-bold">
                  <span>Ver diagramas de radar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Card 3: Evaluación Técnica CTS */}
              <div
                onClick={() => setVistaDetallada('tecnicoCts')}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                      <Terminal className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
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
                        : 'Pendiente'}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900">Evaluación Técnica CTS</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                    Cuestionario de 148 preguntas con desglose por Frontend, Backend y Sistemas.
                  </p>

                  <div className="mt-3 p-2 bg-slate-50 rounded-lg border border-slate-100 text-[11px]">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Calificación Obtenida</span>
                    <span className="font-extrabold text-slate-900 truncate block mt-0.5">
                      {testTecnico?.estado === 'COMPLETADO' && testTecnico?.calificacion_obtenida !== null
                        ? `${Number(testTecnico.calificacion_obtenida).toFixed(1)} / 10.0`
                        : 'Pendiente de finalización'}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-purple-700 font-bold">
                  <span>Ver desglose técnico</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* 3. CARD UNIFICADA DE ENTREVISTA & ANOTACIONES (Punto 3)   */}
            {/* ========================================================= */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center space-x-2">
                    <Video className="w-4 h-4 text-blue-600" />
                    <span>Entrevista de Selección & Anotaciones Cualitativas</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Coordinación de la sesión Google Meet y registro estructurado de observaciones del aspirante.
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
                      title="Reprogramar fecha"
                    >
                      Reprogramar
                    </button>
                  </div>
                </div>
              )}

              {/* Bloque Formulario y Registro de Anotaciones (Estructura oficial de la Plantilla) */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                  <MessageSquare className="w-4 h-4 text-amber-600" />
                  <span>Anotaciones y Observaciones Técnicas</span>
                </div>

                {/* Formulario de nueva anotación */}
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
                      placeholder="Registrar observaciones cualitativas para el dictamen y plantilla oficial..."
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

                {/* Historial de anotaciones registradas */}
                {candidato.entrevista?.anotaciones && candidato.entrevista.anotaciones.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Observaciones Registradas en el Expediente
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
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
        )}

        {/* ========================================================= */}
        {/* MODAL: ADMITIR ALUMNO & OTORGAR PORCENTAJE ACCESO (Punto 1) */}
        {/* ========================================================= */}
        {modalAdmitir && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
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

              {/* Selector de Porcentaje de Acceso (50%, 66%, 100% o 0%) */}
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
                      className={`py-2.5 px-2 rounded-xl text-xs font-black border transition-all text-center ${
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

              {/* Botón de Confirmación */}
              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalAdmitir(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => admitirMutation.mutate()}
                  disabled={admitirMutation.isPending || (!asignacionDiferida && !equipoSeleccionadoId)}
                  className="px-4 py-2 bg-[#2E7D32] hover:bg-[#1B5E20] disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  {admitirMutation.isPending ? 'Confirmando...' : `Confirmar Admisión (${porcentajeAcceso}% Acceso)`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL: ABANDONAR CANDIDATURA (Punto 1: Nunca Rechazar)     */}
        {/* ========================================================= */}
        {modalAbandonar && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
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
                  className="px-4 py-2 border border-slate-300 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => abandonarMutation.mutate()}
                  disabled={abandonarMutation.isPending}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  {abandonarMutation.isPending ? 'Archivando...' : 'Confirmar Abandono'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: AGENDAR GOOGLE MEET */}
        {modalEntrevista && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
                  <Video className="w-5 h-5 text-blue-600" />
                  <span>Programar Entrevista Google Meet</span>
                </h3>
                <button onClick={() => setModalEntrevista(false)} className="text-slate-400 hover:text-slate-700">
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
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold whitespace-nowrap"
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
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 disabled:opacity-40"
                >
                  + Añadir a Google Calendar
                </button>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setModalEntrevista(false)}
                    className="px-3 py-2 border border-slate-300 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => agendarMutation.mutate()}
                    disabled={!fechaEntrevista || agendarMutation.isPending}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold"
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

        {/* MODAL: RESUMEN PDF CON PLANTILLA OFICIAL (Punto 8) */}
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
