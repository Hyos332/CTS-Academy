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
  X,
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

  // Vista activa: 'resumen' (página única sintetizada) o desglose individual
  const [vistaDetallada, setVistaDetallada] = useState<'resumen' | 'actitud16pf' | 'aptitudMatriz' | 'tecnicoCts'>('resumen');
  // Pestaña activa en el expediente: 'entrevista' | 'afinidad' | 'tests'
  const [tabActivo, setTabActivo] = useState<'entrevista' | 'afinidad' | 'tests'>('entrevista');

  // Obtener perfil detallado del candidato
  const { data: candidato, isLoading, error } = useQuery({
    queryKey: ['candidato-perfil', id],
    queryFn: async () => {
      const res = await apiClient.get(`/evaluacion/candidatos/${id}/perfil`);
      return res.data;
    },
  });

  // Obtener lista de equipos
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

  // Mutación: Admitir Alumno Profer
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

  // Mutación: Registrar Abandono de Candidatura
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
    const endObj = new Date(fechaObj.getTime() + 45 * 60000);
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
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#01579B] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-[#616161]">Cargando Expediente del Postulante...</span>
        </div>
      </div>
    );
  }

  if (error || !candidato) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans">
        <Navbar />
        <main className="w-full px-4 sm:px-6 lg:px-8 py-12 text-center">
          <ShieldAlert className="w-12 h-12 text-[#D32F2F] mx-auto mb-3" />
          <h2 className="text-xl font-bold text-[#212121] mb-2">Candidato no encontrado</h2>
          <button
            onClick={() => navigate('/admisiones/panel')}
            className="mt-4 px-4 py-2 bg-[#01579B] hover:bg-[#004174] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
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
    etapaActual = 2;
  }

  // Preparar datos para el radar de aptitud
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
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans text-[#212121]">
      <Navbar />

      <main className="w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 space-y-6">
        
        {/* ========================================================= */}
        {/* ENCABEZADO PRINCIPAL DE EXPEDIENTE + ACCIONES DE DICTAMEN */}
        {/* ========================================================= */}
        <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-xs overflow-hidden">
          {/* Barra Superior: Retorno y Botones de Decisión */}
          <div className="px-6 py-3.5 bg-[#FAFAFA] border-b border-[#E0E0E0] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <button
              onClick={() => {
                if (vistaDetallada !== 'resumen') {
                  setVistaDetallada('resumen');
                } else {
                  navigate('/admisiones/panel');
                }
              }}
              className="inline-flex items-center space-x-2 text-xs font-semibold text-[#616161] hover:text-[#01579B] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#757575]" />
              <span>
                {vistaDetallada !== 'resumen'
                  ? '← Volver al Expediente Principal'
                  : 'Volver al Panel de Admisiones'}
              </span>
            </button>

            {/* Chip de Estado Oficial FUNIBER + Botones de Decisión */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border inline-flex items-center space-x-1.5 ${
                  yaAdmitido
                    ? 'bg-[#E8F5E9] text-[#1B5E20] border-[#C8E6C9]'
                    : yaAbandonado
                    ? 'bg-[#FFEBEE] text-[#B71C1C] border-[#FFCDD2]'
                    : 'bg-[#E6EFF5] text-[#01579B] border-[#CCDDEB]'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${yaAdmitido ? 'bg-[#4CAF50]' : yaAbandonado ? 'bg-[#F44336]' : 'bg-[#01579B]'}`} />
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
                    className="px-3.5 py-1.5 bg-[#01579B] hover:bg-[#004174] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Admitir Alumno</span>
                  </button>

                  <button
                    onClick={() => setModalAbandonar(true)}
                    className="px-3.5 py-1.5 border border-[#FFCDD2] bg-[#FFEBEE] text-[#B71C1C] hover:bg-[#FFCDD2]/60 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer"
                    title="Registrar si el candidato desiste de incorporarse al programa"
                  >
                    <UserX className="w-3.5 h-3.5 text-[#B71C1C]" />
                    <span>Abandonar Candidatura</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Datos del Candidato & Acciones Secundarias */}
          <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-[#EEEEEE]">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-black text-[#212121] tracking-tight">
                  {candidato.usuario?.nombre} {candidato.usuario?.apellidos}
                </h1>
                {porcentajeOtorgado !== undefined && porcentajeOtorgado !== null && (
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#E6EFF5] text-[#01579B] border border-[#CCDDEB]">
                    {porcentajeOtorgado}% Beca / Acceso Otorgado
                  </span>
                )}
              </div>

              <p className="text-xs text-[#757575] mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>
                  Email: <strong className="text-[#212121] font-mono">{candidato.usuario?.email}</strong>
                </span>
                <span>•</span>
                <span>
                  Sede: <strong className="text-[#424242] font-mono">{candidato.sede_origen}</strong>
                </span>
                <span>•</span>
                <span>
                  Teléfono: <strong className="text-[#424242]">{candidato.telefono || 'No registrado'}</strong>
                </span>
                <span>•</span>
                <span>
                  Convocatoria: <strong className="text-[#01579B]">{candidato.convocatoria?.denominacion}</strong>
                </span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowPdfModal(true)}
                className="px-3.5 py-2 border border-[#01579B] text-[#01579B] hover:bg-[#E6EFF5] text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center space-x-2 cursor-pointer"
              >
                <FileDown className="w-4 h-4 text-[#01579B]" />
                <span>Informe de Entrevista (PDF)</span>
              </button>

              <button
                onClick={() => setModalInvitacion(true)}
                className="px-3.5 py-2 border border-[#E0E0E0] bg-white text-[#424242] hover:bg-[#F5F5F5] text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-[#616161]" />
                <span>Credenciales e Invitación</span>
              </button>
            </div>
          </div>

          {/* Stepper del Proceso (Diseño Angosto y Compacto) */}
          <div className="px-6 py-2.5 bg-[#FAFAFA] border-t border-[#EEEEEE] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-1 sm:space-x-4 w-full md:w-auto overflow-x-auto py-1">
              
              {/* Paso 1: Registro */}
              <div className="flex items-center space-x-1.5 shrink-0">
                <div className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] bg-[#01579B] text-white">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-xs font-semibold text-[#212121]">1. Registro</span>
              </div>

              <div className="w-6 sm:w-10 h-0.5 bg-[#01579B] shrink-0" />

              {/* Paso 2: Tests */}
              <div className="flex items-center space-x-1.5 shrink-0">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] transition-all ${
                    testsCompletadosCount === 3 || etapaActual > 2
                      ? 'bg-[#01579B] text-white'
                      : etapaActual === 2
                      ? 'bg-[#01579B] text-white ring-2 ring-[#CCDDEB]'
                      : 'bg-white border border-[#BDBDBD] text-[#757575]'
                  }`}
                >
                  {testsCompletadosCount === 3 || etapaActual > 2 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <span>2</span>
                  )}
                </div>
                <span className={`text-xs ${etapaActual === 2 ? 'font-bold text-[#01579B]' : 'font-semibold text-[#212121]'}`}>
                  2. Tests ({testsCompletadosCount}/3)
                </span>
              </div>

              <div className={`w-6 sm:w-10 h-0.5 shrink-0 ${etapaActual >= 3 ? 'bg-[#01579B]' : 'bg-[#E0E0E0]'}`} />

              {/* Paso 3: Entrevista */}
              <div className="flex items-center space-x-1.5 shrink-0">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] transition-all ${
                    entrevistaRealizada || etapaActual > 3
                      ? 'bg-[#01579B] text-white'
                      : etapaActual === 3
                      ? 'bg-[#01579B] text-white ring-2 ring-[#CCDDEB]'
                      : 'bg-white border border-[#BDBDBD] text-[#757575]'
                  }`}
                >
                  {entrevistaRealizada || etapaActual > 3 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <span>3</span>
                  )}
                </div>
                <span className={`text-xs ${etapaActual === 3 ? 'font-bold text-[#01579B]' : 'font-semibold text-[#212121]'}`}>
                  3. Entrevista
                </span>
              </div>

              <div className={`w-6 sm:w-10 h-0.5 shrink-0 ${etapaActual >= 4 ? 'bg-[#01579B]' : 'bg-[#E0E0E0]'}`} />

              {/* Paso 4: Dictamen */}
              <div className="flex items-center space-x-1.5 shrink-0">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] transition-all ${
                    yaAdmitido
                      ? 'bg-[#2E7D32] text-white'
                      : yaAbandonado
                      ? 'bg-[#D32F2F] text-white'
                      : etapaActual === 4
                      ? 'bg-[#01579B] text-white ring-2 ring-[#CCDDEB]'
                      : 'bg-white border border-[#BDBDBD] text-[#757575]'
                  }`}
                >
                  {yaAdmitido ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  ) : yaAbandonado ? (
                    <UserX className="w-3 h-3 text-white" />
                  ) : (
                    <span>4</span>
                  )}
                </div>
                <span className={`text-xs ${yaAdmitido ? 'font-bold text-[#2E7D32]' : yaAbandonado ? 'font-bold text-[#D32F2F]' : etapaActual === 4 ? 'font-bold text-[#01579B]' : 'font-semibold text-[#212121]'}`}>
                  4. Dictamen {yaAdmitido ? `(${porcentajeOtorgado ?? 100}%)` : ''}
                </span>
              </div>

            </div>

            <span className="text-[11px] font-semibold text-[#757575] shrink-0">
              {yaAdmitido
                ? 'Proceso Concluido: Admitido'
                : yaAbandonado
                ? 'Proceso Concluido: Archivado'
                : `Etapa ${etapaActual} de 4 en Curso`}
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* VISTAS DETALLADAS INDIVIDUALES (Si el usuario hizo click) */}
        {/* ========================================================= */}
        {vistaDetallada === 'actitud16pf' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-[#E0E0E0] shadow-xs">
              <button
                onClick={() => {
                  setVistaDetallada('resumen');
                  setTabActivo('tests');
                }}
                className="text-xs font-semibold text-[#01579B] hover:text-[#004174] flex items-center space-x-1 cursor-pointer"
              >
                <span>← Volver a Resultados de Tests</span>
              </button>
              <span className="text-xs font-bold text-[#212121]">Informe Psicométrico 16PF Oficial</span>
            </div>
            {informe16PF ? (
              <Informe16PFView informe={informe16PF} />
            ) : (
              <div className="bg-white rounded-lg border border-[#E0E0E0] p-8 text-center text-xs text-[#757575]">
                El candidato aún no ha completado el cuestionario de actitud 16PF.
              </div>
            )}
          </div>
        )}

        {vistaDetallada === 'aptitudMatriz' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-[#E0E0E0] shadow-xs">
              <button
                onClick={() => {
                  setVistaDetallada('resumen');
                  setTabActivo('tests');
                }}
                className="text-xs font-semibold text-[#01579B] hover:text-[#004174] flex items-center space-x-1 cursor-pointer"
              >
                <span>← Volver a Resultados de Tests</span>
              </button>
              <span className="text-xs font-bold text-[#212121]">Matriz Oficial de Aptitudes & Diagramas de Radar</span>
            </div>
            {matrizAptitudes ? (
              <MatrizAptitudesView matriz={matrizAptitudes} />
            ) : (
              <div className="bg-white rounded-lg border border-[#E0E0E0] p-8 text-center text-xs text-[#757575]">
                El candidato aún no ha completado la matriz de aptitudes.
              </div>
            )}
          </div>
        )}

        {vistaDetallada === 'tecnicoCts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-[#E0E0E0] shadow-xs">
              <button
                onClick={() => {
                  setVistaDetallada('resumen');
                  setTabActivo('tests');
                }}
                className="text-xs font-semibold text-[#01579B] hover:text-[#004174] flex items-center space-x-1 cursor-pointer"
              >
                <span>← Volver a Resultados de Tests</span>
              </button>
              <span className="text-xs font-bold text-[#212121]">Auditoría de Prueba Técnica CTS</span>
            </div>
            {informeTecnico ? (
              <ReportePruebaTecnicaView informe={informeTecnico} />
            ) : (
              <div className="bg-white rounded-lg border border-[#E0E0E0] p-8 text-center text-xs text-[#757575]">
                El examen técnico oficial aún no ha sido completado por el aspirante.
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* EXPEDIENTE RESUMIDO PRINCIPAL (Jerarquía Limpia y Sólida)  */}
        {/* ========================================================= */}
        {vistaDetallada === 'resumen' && (
          <div className="space-y-6">
            
                        {/* Pestañas de Navegación del Expediente */}
            <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-xs p-1.5 flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setTabActivo('entrevista')}
                className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-xs transition-all cursor-pointer ${
                  tabActivo === 'entrevista'
                    ? 'bg-[#E6EFF5] text-[#01579B] border border-[#CCDDEB] shadow-2xs font-bold'
                    : 'text-[#616161] hover:text-[#212121] hover:bg-[#F5F5F5] border border-transparent font-medium'
                }`}
              >
                <Video className={`w-3.5 h-3.5 ${tabActivo === 'entrevista' ? 'text-[#01579B]' : 'text-[#757575]'}`} />
                <span>1. Entrevista & Deliberación</span>
                {candidato?.entrevista && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white border border-[#CCDDEB] text-[#01579B] font-bold">
                    ✓
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setTabActivo('afinidad')}
                className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-xs transition-all cursor-pointer ${
                  tabActivo === 'afinidad'
                    ? 'bg-[#E6EFF5] text-[#01579B] border border-[#CCDDEB] shadow-2xs font-bold'
                    : 'text-[#616161] hover:text-[#212121] hover:bg-[#F5F5F5] border border-transparent font-medium'
                }`}
              >
                <Users className={`w-3.5 h-3.5 ${tabActivo === 'afinidad' ? 'text-[#01579B]' : 'text-[#757575]'}`} />
                <span>2. Afinidad de Equipos (Squads)</span>
                {sugerido && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white border border-[#CCDDEB] text-[#01579B] font-bold">
                    {sugerido.afinidadPorcentaje}%
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setTabActivo('tests')}
                className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-xs transition-all cursor-pointer ${
                  tabActivo === 'tests'
                    ? 'bg-[#E6EFF5] text-[#01579B] border border-[#CCDDEB] shadow-2xs font-bold'
                    : 'text-[#616161] hover:text-[#212121] hover:bg-[#F5F5F5] border border-transparent font-medium'
                }`}
              >
                <Sparkles className={`w-3.5 h-3.5 ${tabActivo === 'tests' ? 'text-[#01579B]' : 'text-[#757575]'}`} />
                <span>3. Resultados de los Tests</span>
              </button>
            </div>

            {/* 1. SECCIÓN ENTREVISTA & ANOTACIONES */}
            {tabActivo === 'entrevista' && (
              <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-xs overflow-hidden">
              <div className="px-6 py-4 bg-[#FAFAFA] border-b border-[#E0E0E0] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-xs font-bold text-[#212121] uppercase tracking-wider flex items-center space-x-2">
                    <Video className="w-4 h-4 text-[#01579B]" />
                    <span>Entrevista de Selección & Deliberación Cualitativa</span>
                  </h3>
                  <p className="text-[11px] text-[#757575] mt-0.5">
                    Coordinación Google Meet y registro formal de observaciones según la plantilla oficial.
                  </p>
                </div>

                {candidato.entrevista ? (
                  <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded bg-[#E8F0FE] text-[#084DC4] border border-[#C4D9FD]">
                    Estado: {candidato.entrevista.estado}
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      generarEnlaceMeet();
                      setModalEntrevista(true);
                    }}
                    className="px-3.5 py-1.5 bg-[#01579B] hover:bg-[#004174] text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors inline-flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Agendar Google Meet</span>
                  </button>
                )}
              </div>

              <div className="p-6 space-y-6">
                {/* Bloque Google Meet Activo */}
                {candidato.entrevista && (
                  <div className="bg-[#FAFAFA] border border-[#E0E0E0] rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#757575] block">
                        Sesión Programada en Google Calendar
                      </span>
                      <p className="font-bold text-[#212121] text-xs">
                        {new Date(candidato.entrevista.fecha_hora_programada).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="text-[11px] text-[#757575] font-mono">
                        Enlace: {candidato.entrevista.enlace_google_meet}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => copiarEnlaceMeet(candidato.entrevista.enlace_google_meet)}
                        className="px-3 py-1.5 bg-white border border-[#E0E0E0] text-[#424242] hover:bg-[#F5F5F5] rounded-lg text-xs font-semibold inline-flex items-center space-x-1 shadow-2xs cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5 text-[#616161]" />
                        <span>{copiadoMeet ? '¡Copiado!' : 'Copiar'}</span>
                      </button>

                      <a
                        href={candidato.entrevista.enlace_google_meet}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-[#01579B] hover:bg-[#004174] text-white rounded-lg text-xs font-semibold inline-flex items-center space-x-1 shadow-2xs cursor-pointer"
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
                        className="px-2.5 py-1.5 text-[#616161] hover:text-[#212121] text-xs font-semibold cursor-pointer"
                      >
                        Reprogramar
                      </button>
                    </div>
                  </div>
                )}

                {/* Formulario y Registro de Anotaciones */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-xs font-bold text-[#212121]">
                    <MessageSquare className="w-4 h-4 text-[#01579B]" />
                    <span>Registro de Observaciones para la Plantilla Oficial de Entrevista</span>
                  </div>

                  <div className="bg-[#FAFAFA] border border-[#E0E0E0] rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[#616161] font-semibold mb-1">Dimensión / Item Evaluado:</label>
                        <select
                          value={itemAnotacion}
                          onChange={(e: any) => setItemAnotacion(e.target.value)}
                          className="w-full bg-white border border-[#E0E0E0] rounded-lg px-3 py-2 text-xs font-medium text-[#212121] focus:ring-1 focus:ring-[#01579B]"
                        >
                          <option value="Actitud">Actitud (Comportamiento, Colaboración, Motivación)</option>
                          <option value="Aptitud">Aptitud (Solvencia Técnica, Análisis Lógico)</option>
                          <option value="Generalidades">Generalidades (Comunicación, Disponibilidad)</option>
                          <option value="Recomendaciones">Recomendaciones (Squad idóneo, Integración)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[#616161] font-semibold mb-1">Calificación Cualitativa:</label>
                        <select
                          value={calificacionAnotacion}
                          onChange={(e: any) => setCalificacionAnotacion(e.target.value)}
                          className="w-full bg-white border border-[#E0E0E0] rounded-lg px-3 py-2 text-xs font-medium text-[#212121] focus:ring-1 focus:ring-[#01579B]"
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
                        className="w-full bg-white border border-[#E0E0E0] rounded-lg p-3 text-xs text-[#212121] focus:ring-1 focus:ring-[#01579B] focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => anotacionesMutation.mutate()}
                        disabled={!comentariosEntrevista.trim() || anotacionesMutation.isPending}
                        className="px-4 py-2 bg-[#01579B] hover:bg-[#004174] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {anotacionesMutation.isPending ? 'Guardando...' : 'Guardar Observación'}
                      </button>
                    </div>
                  </div>

                  {/* Listado de Anotaciones Registradas */}
                  {candidato.entrevista?.anotaciones && candidato.entrevista.anotaciones.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#757575] block">
                        Observaciones Registradas por el Comité
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {candidato.entrevista.anotaciones.map((anot: any) => (
                          <div
                            key={anot.id}
                            className="p-3 bg-white border border-[#E0E0E0] rounded-lg space-y-1.5 shadow-2xs"
                          >
                            <div className="flex items-center justify-between text-xs font-bold text-[#212121]">
                              <span>{anot.competencia_evaluada}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                anot.calificacion_cualitativa === 'SOBRESALIENTE'
                                  ? 'bg-[#E8F5E9] text-[#1B5E20] border-[#C8E6C9]'
                                  : anot.calificacion_cualitativa === 'COMPETENTE'
                                  ? 'bg-[#E6EFF5] text-[#01579B] border-[#CCDDEB]'
                                  : anot.calificacion_cualitativa === 'EN_DESARROLLO'
                                  ? 'bg-[#FFF3E0] text-[#E65100] border-[#FFE0B2]'
                                  : 'bg-[#FFEBEE] text-[#B71C1C] border-[#FFCDD2]'
                              }`}>
                                {anot.calificacion_cualitativa}
                              </span>
                            </div>
                            <p className="text-[#424242] text-[11px] leading-relaxed">{anot.comentario}</p>
                            <span className="text-[10px] text-[#757575] block pt-1 font-mono">
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

            {/* 2. SECCIÓN AFINIDAD CON SQUADS OFICIALES */}
            {tabActivo === 'afinidad' && (
              <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-xs overflow-hidden">
              <div className="px-6 py-4 bg-[#FAFAFA] border-b border-[#E0E0E0] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className="text-xs font-bold text-[#212121] uppercase tracking-wider flex items-center space-x-2">
                    <Users className="w-4 h-4 text-[#01579B]" />
                    <span>Afinidad Algorítmica con Squads CTS Oficiales</span>
                  </h3>
                  <p className="text-[11px] text-[#757575] mt-0.5">
                    Evaluación tecnológica en los 4 equipos y sus respectivos líderes técnicos.
                  </p>
                </div>

                {sugerido && (
                  <span className="text-[11px] font-bold px-3 py-1 bg-[#E8F5E9] text-[#1B5E20] border border-[#C8E6C9] rounded-full">
                    Top Match Recomendado: {sugerido.nombre} ({sugerido.afinidadPorcentaje}%)
                  </span>
                )}
              </div>

              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(recomendacion?.rankingEquipos || [
                  { id: '1', codigo: 'TEAM-03', nombre: 'Presencia Web', afinidadPorcentaje: 0, lider: 'Diego Moys' },
                  { id: '2', codigo: 'TEAM-01', nombre: 'Fénix', afinidadPorcentaje: 0, lider: 'Alejandro Ruiz' },
                  { id: '3', codigo: 'TEAM-02', nombre: 'Departamento de Sistemas', afinidadPorcentaje: 0, lider: 'Lucía Vargas' },
                  { id: '4', codigo: 'TEAM-04', nombre: 'Acción Docente', afinidadPorcentaje: 0, lider: 'Marcos Navarro' },
                ]).map((eq: any) => {
                  const esTop = sugerido && eq.codigo === sugerido.codigo;
                  
                  // Ensure correct official technical leader
                  let leaderName = eq.lider;
                  if (eq.nombre?.includes('Presencia') || eq.codigo === 'TEAM-03') leaderName = 'Diego Moys';
                  else if (eq.nombre?.includes('Fénix') || eq.codigo === 'TEAM-01') leaderName = 'Alejandro Ruiz';
                  else if (eq.nombre?.includes('Sistemas') || eq.codigo === 'TEAM-02') leaderName = 'Lucía Vargas';
                  else if (eq.nombre?.includes('Docente') || eq.codigo === 'TEAM-04') leaderName = 'Marcos Navarro';

                  return (
                    <div
                      key={eq.id}
                      onClick={() => {
                        if (!yaAdmitido && !yaAbandonado) {
                          setEquipoSeleccionadoId(eq.id);
                          setModalAdmitir(true);
                        }
                      }}
                      className={`p-4 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                        esTop
                          ? 'bg-[#E6EFF5]/60 border-[#01579B] shadow-2xs'
                          : 'bg-[#FAFAFA] border-[#E0E0E0] hover:border-[#CCDDEB] hover:bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-mono font-bold text-[#757575] uppercase">
                            {eq.codigo}
                          </span>
                          {esTop && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#E8F5E9] text-[#1B5E20] border border-[#C8E6C9]">
                              Recomendado
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-xs text-[#212121] truncate" title={eq.nombre}>
                          {eq.nombre}
                        </h4>

                        <div className="flex items-center space-x-1.5 text-[11px] text-[#616161] mt-1.5">
                          <Users className="w-3.5 h-3.5 text-[#757575] shrink-0" />
                          <span className="truncate">
                            Líder: <strong className="text-[#212121]">{leaderName}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-[#E0E0E0]">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] text-[#757575] font-medium">Afinidad</span>
                          <span className={`text-xs font-bold ${esTop ? 'text-[#01579B]' : 'text-[#424242]'}`}>
                            {eq.afinidadPorcentaje || 0}%
                          </span>
                        </div>
                        <div className="w-full bg-[#E0E0E0] h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${esTop ? 'bg-[#01579B]' : 'bg-[#9E9E9E]'}`}
                            style={{ width: `${eq.afinidadPorcentaje || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            )}

            {/* 3. SECCIÓN RESULTADOS DE TESTS */}
            {tabActivo === 'tests' && (
              <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-xs overflow-hidden">
              <div className="px-6 py-4 bg-[#FAFAFA] border-b border-[#E0E0E0] flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-bold text-[#212121] uppercase tracking-wider flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-[#01579B]" />
                    <span>Resultados de las Baterías de Admisión</span>
                  </h3>
                  <p className="text-[11px] text-[#757575] mt-0.5">
                    Capturas visuales directas: Diagrama de radar para Aptitud y Tabla oficial de decatipos para Actitud.
                  </p>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1.1 Batería de Aptitud: Solo Diagrama de Radar */}
                <div className="bg-[#FAFAFA] rounded-lg border border-[#E0E0E0] p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-[#E6EFF5] text-[#01579B] rounded-lg">
                          <Cpu className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-bold text-[#212121]">Aptitud: Diagrama de Radar</h4>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E6EFF5] text-[#01579B] border border-[#CCDDEB]">
                        {matrizAptitudes ? `${matrizAptitudes.promedioNivelActual || '2.8'} / 5.0` : 'Pendiente'}
                      </span>
                    </div>

                    {matrizAptitudes ? (
                      <div className="h-56 w-full py-1">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={radarDataAptitud}>
                            <PolarGrid stroke="#E0E0E0" />
                            <PolarAngleAxis dataKey="dimension" tick={{ fill: '#424242', fontSize: 9, fontWeight: 600 }} />
                            <PolarRadiusAxis domain={[0, 5]} stroke="#BDBDBD" tickCount={6} />
                            <Tooltip formatter={(val: any) => [`${val} / 5.0`, 'Nivel']} />
                            <Radar name="Aptitud" dataKey="nivel" stroke="#01579B" fill="#01579B" fillOpacity={0.35} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-56 flex items-center justify-center text-center p-4">
                        <p className="text-xs text-[#757575] italic">
                          El candidato aún no ha completado la matriz de aptitudes.
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setVistaDetallada('aptitudMatriz')}
                    className="mt-3 pt-2.5 border-t border-[#E0E0E0] w-full flex items-center justify-between text-xs text-[#01579B] font-semibold hover:text-[#004174] cursor-pointer"
                  >
                    <span>Ver matriz y radars por categoría</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 1.2 Batería de Actitud: Solo Tabla de Decatipos (Sin explicaciones largas) */}
                <div className="bg-[#FAFAFA] rounded-lg border border-[#E0E0E0] p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-[#FFEBEE] text-[#D32F2F] rounded-lg">
                          <HeartPulse className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-bold text-[#212121]">Actitud: Tabla Decatipos 16PF</h4>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E8F5E9] text-[#1B5E20] border border-[#C8E6C9]">
                        {informe16PF ? '16 Factores' : 'Pendiente'}
                      </span>
                    </div>

                    {informe16PF ? (
                      <div className="border border-[#E0E0E0] rounded-lg overflow-hidden bg-white max-h-56 overflow-y-auto">
                        <table className="w-full text-left border-collapse text-[11px]">
                          <thead>
                            <tr className="bg-[#FAFAFA] text-[#616161] font-bold border-b border-[#E0E0E0] text-[10px] uppercase">
                              <th className="py-1.5 px-2">Factor</th>
                              <th className="py-1.5 px-1.5 text-center">Decatipo</th>
                              <th className="py-1.5 px-2">Rasgo Dominante</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#EEEEEE]">
                            {(informe16PF.factores || []).slice(0, 7).map((f: any) => {
                              const pc = f.pc ?? f.pd ?? 6;
                              const rasgo = pc >= 6 ? f.altaPuntuacion : f.bajaPuntuacion;
                              return (
                                <tr key={f.factor} className="hover:bg-[#F7F9FC]">
                                  <td className="py-1.5 px-2 font-mono font-bold text-[#212121]">
                                    Factor {f.factor}
                                  </td>
                                  <td className="py-1.5 px-1.5 text-center font-bold text-[#01579B] font-mono">
                                    {pc} / 10
                                  </td>
                                  <td className="py-1.5 px-2 text-[#424242] truncate max-w-[140px] font-medium">
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
                        <p className="text-xs text-[#757575] italic">
                          El candidato aún no ha completado el cuestionario de actitud 16PF.
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setVistaDetallada('actitud16pf')}
                    className="mt-3 pt-2.5 border-t border-[#E0E0E0] w-full flex items-center justify-between text-xs text-[#01579B] font-semibold hover:text-[#004174] cursor-pointer"
                  >
                    <span>Ver informe psicométrico 16PF</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 1.3 Prueba Técnica CTS */}
                <div className="bg-[#FAFAFA] rounded-lg border border-[#E0E0E0] p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-[#E6EFF5] text-[#01579B] rounded-lg">
                          <Terminal className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-bold text-[#212121]">Prueba Técnica CTS</h4>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        testTecnico?.estado === 'COMPLETADO'
                          ? Number(testTecnico?.calificacion_obtenida || 0) >= 5
                            ? 'bg-[#E8F5E9] text-[#1B5E20] border border-[#C8E6C9]'
                            : 'bg-[#FFEBEE] text-[#B71C1C] border border-[#FFCDD2]'
                          : 'bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2]'
                      }`}>
                        {testTecnico?.estado === 'COMPLETADO'
                          ? `${Number(testTecnico.calificacion_obtenida).toFixed(1)} / 10.0`
                          : 'Pendiente'}
                      </span>
                    </div>

                    {testTecnico?.estado === 'COMPLETADO' ? (
                      <div className="space-y-3 py-2">
                        <div className="p-3 bg-white rounded-lg border border-[#E0E0E0] text-center">
                          <span className="text-[10px] font-bold uppercase text-[#757575] tracking-wider block">
                            Calificación Global
                          </span>
                          <span className="text-3xl font-black text-[#212121] block mt-0.5">
                            {Number(testTecnico.calificacion_obtenida).toFixed(1)}
                            <span className="text-xs text-[#757575] font-normal ml-1">/ 10</span>
                          </span>
                        </div>

                        <div className="space-y-1.5 text-xs">
                          {informeTecnico?.puntuacionesPorArea && (
                            <>
                              <div className="flex justify-between items-center text-[11px]">
                                <span className="font-semibold text-[#616161]">Fundamentos Generales:</span>
                                <span className="font-mono font-bold text-[#212121]">
                                  {informeTecnico.puntuacionesPorArea.general}%
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-[11px]">
                                <span className="font-semibold text-[#616161]">Frontend:</span>
                                <span className="font-mono font-bold text-[#212121]">
                                  {informeTecnico.puntuacionesPorArea.frontend}%
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-[11px]">
                                <span className="font-semibold text-[#616161]">Backend:</span>
                                <span className="font-mono font-bold text-[#212121]">
                                  {informeTecnico.puntuacionesPorArea.backend}%
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="h-56 flex items-center justify-center text-center p-4">
                        <p className="text-xs text-[#757575] italic">
                          El aspirante aún no ha finalizado la evaluación técnica oficial.
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setVistaDetallada('tecnicoCts')}
                    className="mt-3 pt-2.5 border-t border-[#E0E0E0] w-full flex items-center justify-between text-xs text-[#01579B] font-semibold hover:text-[#004174] cursor-pointer"
                  >
                    <span>Ver auditoría de respuestas técnicas</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            </div>
            )}


          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL: ADMITIR ALUMNO (Con cierre al hacer clic fuera)    */}
        {/* ========================================================= */}
        {modalAdmitir && (
          <div
            onClick={() => setModalAdmitir(false)}
            className="fixed inset-0 z-50 bg-[#000000]/40 backdrop-blur-2xs flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg max-w-lg w-full p-6 shadow-md border border-[#E0E0E0] space-y-5"
            >
              <div className="flex justify-between items-start border-b border-[#EEEEEE] pb-3">
                <div>
                  <h3 className="text-base font-bold text-[#212121]">Dictamen de Admisión PROFER</h3>
                  <p className="text-xs text-[#757575] mt-0.5">
                    Asignar porcentaje de acceso/beca y squad para {candidato.usuario?.nombre} {candidato.usuario?.apellidos}.
                  </p>
                </div>
                <button
                  onClick={() => setModalAdmitir(false)}
                  className="p-1.5 text-[#757575] hover:text-[#212121] rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Selector de Porcentaje de Acceso */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-[#424242] tracking-wider">
                  1. Porcentaje de Beca / Acceso Otorgado:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[100, 66, 50, 0].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setPorcentajeAcceso(pct)}
                      className={`py-2.5 px-2 rounded-lg text-xs font-bold border transition-all text-center cursor-pointer ${
                        porcentajeAcceso === pct
                          ? 'bg-[#01579B] text-white border-[#01579B] shadow-2xs'
                          : 'bg-[#FAFAFA] text-[#424242] border-[#E0E0E0] hover:bg-[#F5F5F5]'
                      }`}
                    >
                      <div className="text-base font-black">{pct}%</div>
                      <div className="text-[9px] uppercase font-semibold opacity-90">
                        {pct === 100 ? 'Beca Total' : pct === 66 ? 'Preferente' : pct === 50 ? 'Parcial' : 'Estándar'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selector de Squad */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-[#424242] tracking-wider">
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
                        className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between ${
                          esSeleccionado
                            ? 'bg-[#E6EFF5] border-[#01579B] ring-1 ring-[#01579B]'
                            : 'bg-white border-[#E0E0E0] hover:border-[#CCDDEB]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-[#212121]">{eq.nombre}</span>
                            {esSugerido && (
                              <span className="bg-[#E8F5E9] text-[#1B5E20] border border-[#C8E6C9] text-[9px] font-bold px-1.5 py-0.2 rounded">
                                Sugerido
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#757575] block mt-0.5">{eq.especialidad}</span>
                        </div>
                        <input
                          type="radio"
                          name="squadSelection"
                          checked={esSeleccionado}
                          onChange={() => {}}
                          className="text-[#01579B] focus:ring-[#01579B]"
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <label className="flex items-center space-x-2 text-xs text-[#424242] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={asignacionDiferida}
                      onChange={(e) => setAsignacionDiferida(e.target.checked)}
                      className="rounded border-[#E0E0E0] text-[#01579B] focus:ring-[#01579B]"
                    />
                    <span>Incorporación diferida (asignar squad más adelante)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#EEEEEE]">
                <button
                  type="button"
                  onClick={() => setModalAdmitir(false)}
                  className="px-4 py-2 border border-[#E0E0E0] text-[#424242] text-xs font-semibold rounded-lg hover:bg-[#F5F5F5] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => admitirMutation.mutate()}
                  disabled={admitirMutation.isPending || (!asignacionDiferida && !equipoSeleccionadoId)}
                  className="px-4 py-2 bg-[#01579B] hover:bg-[#004174] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {admitirMutation.isPending ? 'Confirmando...' : 'Confirmar Admisión'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL: ABANDONAR CANDIDATURA (Con cierre al clic fuera)   */}
        {/* ========================================================= */}
        {modalAbandonar && (
          <div
            onClick={() => setModalAbandonar(false)}
            className="fixed inset-0 z-50 bg-[#000000]/40 backdrop-blur-2xs flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg max-w-md w-full p-6 shadow-md border border-[#E0E0E0] space-y-4"
            >
              <div className="flex justify-between items-start border-b border-[#EEEEEE] pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-[#FFEBEE] text-[#D32F2F] rounded-lg">
                    <UserX className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#212121]">Abandonar Candidatura</h3>
                    <p className="text-xs text-[#757575]">Registro de desistimiento del aspirante.</p>
                  </div>
                </div>
                <button
                  onClick={() => setModalAbandonar(false)}
                  className="p-1 rounded-lg text-[#757575] hover:text-[#212121] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-[#424242]">
                <p>
                  Este proceso registra formalmente que el candidato <strong>no se incorporará</strong> al programa
                  por decisión propia o incompatibilidad de horarios.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-[#424242] mb-1">
                    Motivo o justificación del abandono:
                  </label>
                  <textarea
                    rows={3}
                    value={motivoAbandono}
                    onChange={(e) => setMotivoAbandono(e.target.value)}
                    placeholder="Ej. El candidato manifiesta incompatibilidad de horarios laborales para asistir a los laboratorios..."
                    className="w-full border border-[#E0E0E0] rounded-lg p-2.5 text-xs text-[#212121] focus:ring-1 focus:ring-[#01579B] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#EEEEEE]">
                <button
                  type="button"
                  onClick={() => setModalAbandonar(false)}
                  className="px-4 py-2 border border-[#E0E0E0] text-[#424242] text-xs font-semibold rounded-lg hover:bg-[#F5F5F5] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => abandonarMutation.mutate()}
                  disabled={abandonarMutation.isPending}
                  className="px-4 py-2 bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {abandonarMutation.isPending ? 'Procesando...' : 'Confirmar Abandono'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL: AGENDAR GOOGLE MEET (Con cierre al clic fuera)     */}
        {/* ========================================================= */}
        {modalEntrevista && (
          <div
            onClick={() => setModalEntrevista(false)}
            className="fixed inset-0 z-50 bg-[#000000]/40 backdrop-blur-2xs flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg max-w-md w-full p-6 shadow-md border border-[#E0E0E0] space-y-4"
            >
              <div className="flex justify-between items-start border-b border-[#EEEEEE] pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-[#E6EFF5] text-[#01579B] rounded-lg">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#212121]">Agendar Entrevista Técnica</h3>
                    <p className="text-xs text-[#757575]">Coordinación de Google Meet para deliberación.</p>
                  </div>
                </div>
                <button
                  onClick={() => setModalEntrevista(false)}
                  className="p-1 rounded-lg text-[#757575] hover:text-[#212121] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-xs font-semibold text-[#424242] mb-1">
                    Fecha y Hora Programada:
                  </label>
                  <input
                    type="datetime-local"
                    value={fechaEntrevista}
                    onChange={(e) => setFechaEntrevista(e.target.value)}
                    className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-xs text-[#212121] bg-white focus:ring-1 focus:ring-[#01579B]"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-[#424242]">Enlace de Google Meet:</label>
                    <button
                      type="button"
                      onClick={generarEnlaceMeet}
                      className="text-[11px] text-[#01579B] hover:text-[#004174] font-semibold cursor-pointer"
                    >
                      Generar aleatorio
                    </button>
                  </div>
                  <input
                    type="url"
                    value={enlaceMeet}
                    onChange={(e) => setEnlaceMeet(e.target.value)}
                    placeholder="https://meet.google.com/xxx-xxxx-xxx"
                    className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-xs text-[#212121] bg-white font-mono focus:ring-1 focus:ring-[#01579B]"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-[#EEEEEE]">
                <button
                  type="button"
                  onClick={abrirEnGoogleCalendar}
                  disabled={!fechaEntrevista}
                  className="text-xs text-[#01579B] hover:text-[#004174] font-semibold disabled:opacity-40 cursor-pointer"
                >
                  Abrir en Google Calendar
                </button>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setModalEntrevista(false)}
                    className="px-4 py-2 border border-[#E0E0E0] text-[#424242] text-xs font-semibold rounded-lg hover:bg-[#F5F5F5] transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => agendarMutation.mutate()}
                    disabled={!fechaEntrevista || agendarMutation.isPending}
                    className="px-4 py-2 bg-[#01579B] hover:bg-[#004174] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {agendarMutation.isPending ? 'Guardando...' : 'Confirmar Agenda'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Invitación y Credenciales */}
        {modalInvitacion && (
          <InvitacionCandidatoModal
            isOpen={modalInvitacion}
            candidatoId={candidato.id}
            candidatoNombre={`${candidato.usuario?.nombre} ${candidato.usuario?.apellidos}`}
            candidatoEmail={candidato.usuario?.email}
            onClose={() => {
              setModalInvitacion(false);
              queryClient.invalidateQueries({ queryKey: ['candidato-perfil', id] });
            }}
          />
        )}

        {/* Modal Oficial de PDF Informe de Entrevista */}
        {showPdfModal && (
          <ResumenResultadosPdfModal
            isOpen={showPdfModal}
            candidato={candidato}
            onClose={() => setShowPdfModal(false)}
          />
        )}

      </main>
    </div>
  );
};

export default CandidatoPerfilPage;
