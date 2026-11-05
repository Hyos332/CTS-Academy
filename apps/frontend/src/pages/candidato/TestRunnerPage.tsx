import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Navbar } from '../../components/common/Navbar';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Code2,
  FileCheck2,
  ChevronRight,
  ChevronLeft,
  Send,
  ArrowLeft,
  Save,
  Lock,
} from 'lucide-react';

interface Opcion {
  id: string;
  texto: string;
}

interface Pregunta {
  id: string;
  enunciado: string;
  tipoPregunta: 'TEORICA' | 'PRACTICA';
  categoria?: string;
  orden?: number;
  opciones?: Opcion[];
}

export const TestRunnerPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [preguntaActivaIndex, setPreguntaActivaIndex] = useState(0);
  // Respuestas seleccionadas en borrador (pueden modificarse libremente antes de pulsar "Siguiente")
  const [respuestasSeleccionadas, setRespuestasSeleccionadas] = useState<Record<string, string>>({});
  // Respuestas confirmadas y bloqueadas de forma permanente
  const [respuestasBloqueadas, setRespuestasBloqueadas] = useState<Record<string, string>>({});
  // Retos prácticos
  const [respuestasPracticas, setRespuestasPracticas] = useState<Record<string, string>>({});
  const [practicasBloqueadas, setPracticasBloqueadas] = useState<Record<string, boolean>>({});
  const [tiempoRestante, setTiempoRestante] = useState<number>(3600);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [testFinalizadoData, setTestFinalizadoData] = useState<any | null>(null);
  const expiracionTimestampRef = React.useRef<number | null>(null);

  // Iniciar o recuperar test
  const { data, isLoading, error } = useQuery({
    queryKey: ['test-runner', testId],
    queryFn: async () => {
      const res = await apiClient.post(`/evaluacion/baterias/${testId}/iniciar`);
      return res.data;
    },
    refetchOnWindowFocus: false,
  });

  // Restaurar estado guardado, respuestas previas y reanudar donde se quedó
  useEffect(() => {
    if (!data) return;

    if (data.completado) {
      setTestFinalizadoData({
        test: data.test,
        perfilRadar: data.perfilRadar,
      });
      return;
    }

    const segundosRestantes =
      data.test?.tiempoRestanteSegundos !== undefined
        ? data.test.tiempoRestanteSegundos
        : data.test?.tiempoLimiteSegundos || 3600;

    setTiempoRestante(segundosRestantes);
    expiracionTimestampRef.current = Date.now() + segundosRestantes * 1000;

    if (data.respuestasGuardadas && Array.isArray(data.respuestasGuardadas)) {
      const bloqueadasTeoricas: Record<string, string> = {};
      const guardadasPracticas: Record<string, string> = {};
      const bloqueadasPracticas: Record<string, boolean> = {};

      for (const r of data.respuestasGuardadas) {
        if (r.opcionSeleccionadaId) {
          bloqueadasTeoricas[r.preguntaId] = r.opcionSeleccionadaId;
        }
        if (r.codigoEntregado) {
          guardadasPracticas[r.preguntaId] = r.codigoEntregado;
          bloqueadasPracticas[r.preguntaId] = true;
        }
      }
      setRespuestasBloqueadas(bloqueadasTeoricas);
      setRespuestasSeleccionadas(bloqueadasTeoricas);
      setRespuestasPracticas(guardadasPracticas);
      setPracticasBloqueadas(bloqueadasPracticas);

      // Reanudar automáticamente en la primera pregunta no respondida/bloqueada
      if (data.preguntas && data.preguntas.length > 0) {
        const primerSinResponderIndex = data.preguntas.findIndex(
          (p: Pregunta) => !bloqueadasTeoricas[p.id] && !bloqueadasPracticas[p.id],
        );
        if (primerSinResponderIndex !== -1) {
          setPreguntaActivaIndex(primerSinResponderIndex);
        } else {
          setPreguntaActivaIndex(data.preguntas.length - 1);
        }
      }
    }
  }, [data]);

  // Cronómetro continuo basado en tiempo real de pared (no se detiene al salir ni pausar pestaña)
  useEffect(() => {
    if (testFinalizadoData) return;

    const interval = setInterval(() => {
      if (!expiracionTimestampRef.current) return;
      const msRestantes = expiracionTimestampRef.current - Date.now();
      const segundos = Math.max(0, Math.round(msRestantes / 1000));
      setTiempoRestante(segundos);

      if (segundos <= 0) {
        clearInterval(interval);
        handleFinalizarTest();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [testFinalizadoData]);

  // Mutación para responder pregunta teórica
  const responderTeoricaMutation = useMutation({
    mutationFn: async ({ preguntaId, opcionId }: { preguntaId: string; opcionId: string }) => {
      return apiClient.post(`/evaluacion/baterias/${testId}/respuestas-teoricas`, {
        preguntaId,
        opcionSeleccionadaId: opcionId,
      });
    },
  });

  // Mutación para entregar solución práctica
  const entregarPracticaMutation = useMutation({
    mutationFn: async ({ preguntaId, codigo }: { preguntaId: string; codigo: string }) => {
      return apiClient.post(`/evaluacion/baterias/${testId}/entregas-practicas`, {
        preguntaId,
        codigoEntregado: codigo,
      });
    },
  });

  // Mutación para finalizar test
  const finalizarMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post(`/evaluacion/baterias/${testId}/finalizar`);
      return res.data;
    },
    onSuccess: (resData) => {
      setTestFinalizadoData(resData);
      setShowConfirmModal(false);
      queryClient.invalidateQueries({ queryKey: ['candidato-panel'] });
    },
  });

  const handleVolver = () => {
    queryClient.invalidateQueries({ queryKey: ['candidato-panel'] });
    navigate('/evaluacion/panel');
  };

  const handleSeleccionarOpcion = (preguntaId: string, opcionId: string) => {
    // Si la pregunta ya está confirmada y bloqueada en el servidor, no permitir modificarla
    if (respuestasBloqueadas[preguntaId]) return;

    // Solo seleccionamos localmente en borrador. No bloquea ni envía al backend todavía.
    setRespuestasSeleccionadas((prev) => ({ ...prev, [preguntaId]: opcionId }));
  };

  const handleAvanzarSiguiente = () => {
    const pId = preguntaActual.id;

    // Si es teórica, tiene una opción seleccionada y aún NO está bloqueada:
    if (preguntaActual.tipoPregunta === 'TEORICA') {
      const opcionSeleccionada = respuestasSeleccionadas[pId];
      if (opcionSeleccionada && !respuestasBloqueadas[pId]) {
        // Bloqueamos la selección en frontend
        setRespuestasBloqueadas((prev) => ({ ...prev, [pId]: opcionSeleccionada }));
        // Enviamos al backend para persistencia inmutable
        responderTeoricaMutation.mutate({ preguntaId: pId, opcionId: opcionSeleccionada });
      }
    } else if (preguntaActual.tipoPregunta === 'PRACTICA') {
      const codigo = respuestasPracticas[pId];
      if (codigo && !practicasBloqueadas[pId]) {
        setPracticasBloqueadas((prev) => ({ ...prev, [pId]: true }));
        entregarPracticaMutation.mutate({ preguntaId: pId, codigo });
      }
    }

    // Avanzar a la siguiente pregunta si no es la última
    if (preguntaActivaIndex < preguntas.length - 1) {
      setPreguntaActivaIndex((prev) => prev + 1);
    }
  };

  const handleRevisarYEntregar = () => {
    const pId = preguntaActual.id;
    // Si la última pregunta tiene opción seleccionada y no estaba bloqueada, persistirla
    if (preguntaActual.tipoPregunta === 'TEORICA') {
      const opcionSeleccionada = respuestasSeleccionadas[pId];
      if (opcionSeleccionada && !respuestasBloqueadas[pId]) {
        setRespuestasBloqueadas((prev) => ({ ...prev, [pId]: opcionSeleccionada }));
        responderTeoricaMutation.mutate({ preguntaId: pId, opcionId: opcionSeleccionada });
      }
    } else if (preguntaActual.tipoPregunta === 'PRACTICA') {
      const codigo = respuestasPracticas[pId];
      if (codigo && !practicasBloqueadas[pId]) {
        setPracticasBloqueadas((prev) => ({ ...prev, [pId]: true }));
        entregarPracticaMutation.mutate({ preguntaId: pId, codigo });
      }
    }

    setShowConfirmModal(true);
  };

  const handleGuardarPractica = (preguntaId: string) => {
    const codigo = respuestasPracticas[preguntaId] || '';
    setPracticasBloqueadas((prev) => ({ ...prev, [preguntaId]: true }));
    entregarPracticaMutation.mutate({ preguntaId, codigo });
  };

  const handleFinalizarTest = async () => {
    // Asegurar que cualquier respuesta seleccionada en borrador se persista antes de computar la nota
    const promesas = [];
    for (const [pId, opcionId] of Object.entries(respuestasSeleccionadas)) {
      if (!respuestasBloqueadas[pId] && opcionId) {
        promesas.push(
          apiClient.post(`/evaluacion/baterias/${testId}/respuestas-teoricas`, {
            preguntaId: pId,
            opcionSeleccionadaId: opcionId,
          }).catch((err) => console.error('Error guardando respuesta en borrador:', err)),
        );
      }
    }
    for (const [pId, codigo] of Object.entries(respuestasPracticas)) {
      if (!practicasBloqueadas[pId] && codigo) {
        promesas.push(
          apiClient.post(`/evaluacion/baterias/${testId}/entregas-practicas`, {
            preguntaId: pId,
            codigoEntregado: codigo,
          }).catch((err) => console.error('Error guardando práctica en borrador:', err)),
        );
      }
    }
    if (promesas.length > 0) {
      await Promise.all(promesas);
    }
    finalizarMutation.mutate();
  };

  const formatoTiempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center text-[#212121]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#01579B] mb-4"></div>
        <p className="text-[#616161] font-medium text-sm">Cargando batería de evaluación oficial...</p>
      </div>
    );
  }

  if (error || !data || !data.preguntas) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center text-[#212121] p-4">
        <div className="w-12 h-12 rounded-full bg-critical-50 flex items-center justify-center mb-3 text-critical-700">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold mb-1 text-[#212121]">Error al iniciar la prueba</h2>
        <p className="text-[#616161] text-xs max-w-md text-center mb-6">
          No fue posible cargar el examen o el test ya ha finalizado previamente.
        </p>
        <button
          onClick={() => navigate('/evaluacion/panel')}
          className="px-4 py-2 bg-[#01579B] hover:bg-[#004174] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
        >
          Volver a mi Panel
        </button>
      </div>
    );
  }

  const preguntas: Pregunta[] = data.preguntas;
  const preguntaActual = preguntas[preguntaActivaIndex];

  // Si el test se finalizó exitosamente, mostrar resumen
  if (testFinalizadoData) {
    const nota = testFinalizadoData.test?.calificacionObtenida ?? 0;
    const radar = testFinalizadoData.perfilRadar?.dimensiones;

    return (
      <div className="min-h-screen bg-[#FAFAFA] text-[#212121] flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-3xl mx-auto px-4 py-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-success-50 text-success-800 rounded-full flex items-center justify-center mb-4 border border-success-200 shadow-2xs">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="text-[11px] font-bold uppercase tracking-wider text-success-800 bg-success-50 px-3 py-1 rounded-full border border-success-200 mb-2">
            Registro Oficial Completado
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#212121] mb-2">
            ¡Evaluación Entregada con Éxito!
          </h1>
          <p className="text-[#616161] max-w-md mb-8 text-xs sm:text-sm">
            Tus respuestas han sido procesadas e integradas a tu expediente. Tu postulación ha avanzado al estado{' '}
            <strong className="text-success-800">TESTS_COMPLETADOS</strong>.
          </p>

          <div className="bg-white border border-[#E0E0E0] rounded-lg p-6 w-full max-w-lg mb-8 text-left shadow-2xs">
            <div className="flex justify-between items-center pb-4 border-b border-[#EEEEEE]">
              <span className="text-[#616161] text-xs font-medium">
                {testFinalizadoData.test?.tipo_bateria === 'TECNICO' ? 'Calificación Técnica Obtenida' : 'Resultado de Evaluación'}
              </span>
              <span className="text-2xl font-bold text-[#01579B]">
                {testFinalizadoData.test?.tipo_bateria === 'TECNICO'
                  ? `${Number(nota).toFixed(1)} / 10`
                  : 'Espectro Registrado'}
              </span>
            </div>

            {radar && (
              <div className="pt-4 space-y-3">
                <h3 className="text-[11px] font-bold text-[#757575] tracking-wider uppercase">
                  Diagnóstico Preliminar por Dimensión
                </h3>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-[#FAFAFA] p-3 rounded-lg border border-[#EEEEEE]">
                    <span className="text-[11px] text-[#757575] block font-medium">Técnico</span>
                    <span className="text-sm font-bold text-[#01579B]">{Number(nota).toFixed(1)} / 10</span>
                  </div>
                  <div className="bg-[#FAFAFA] p-3 rounded-lg border border-[#EEEEEE]">
                    <span className="text-[11px] text-[#757575] block font-medium">Aptitud</span>
                    <span className="text-[11px] font-bold text-success-800">Completado</span>
                  </div>
                  <div className="bg-[#FAFAFA] p-3 rounded-lg border border-[#EEEEEE]">
                    <span className="text-[11px] text-[#757575] block font-medium">Actitud</span>
                    <span className="text-[11px] font-bold text-success-800">Completado</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleVolver}
            className="px-6 py-2.5 bg-[#01579B] hover:bg-[#004174] font-semibold rounded-lg text-white shadow-2xs transition-all flex items-center space-x-2 text-xs cursor-pointer"
          >
            <span>Regresar al Panel de Postulación</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </main>
      </div>
    );
  }

  const esUltima = preguntaActivaIndex === preguntas.length - 1;
  const esPrimera = preguntaActivaIndex === 0;
  const esAlertaTiempo = tiempoRestante < 600; // Menos de 10 minutos
  const esCriticoTiempo = tiempoRestante < 300; // Menos de 5 minutos

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#212121] flex flex-col font-sans">
      {/* Barra de cabecera FUNIBER SD v2.1 con temporizador */}
      <header className="bg-[#01579B] border-b border-[#004174] px-6 py-3.5 flex justify-between items-center sticky top-0 z-20 shadow-xs text-white">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleVolver}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">
              Batería de {data?.test?.tipoBateria ? `${data.test.tipoBateria}` : 'Admisión'}
            </h1>
            <p className="text-[11px] text-white/80">CTS Academy • Grupo FUNIBER</p>
          </div>
        </div>

        {/* Cronómetro */}
        <div
          className={`flex items-center space-x-2 px-3.5 py-1 rounded-full border text-xs font-mono font-bold transition-colors ${
            esCriticoTiempo
              ? 'bg-critical-700 border-critical-900 text-white animate-pulse'
              : esAlertaTiempo
              ? 'bg-high-900 border-high-700 text-white'
              : 'bg-white/15 border-white/20 text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{formatoTiempo(tiempoRestante)}</span>
        </div>

        <div>
          <button
            onClick={() => setShowConfirmModal(true)}
            className="px-3.5 py-1.5 bg-white text-[#01579B] hover:bg-[#F5F5F5] text-xs font-bold rounded-lg shadow-2xs transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-[#01579B]" />
            <span>Finalizar Examen</span>
          </button>
        </div>
      </header>

      {/* Contenido Principal */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Navegador de Preguntas (Sidebar) */}
        <div className="lg:col-span-3 xl:col-span-3 bg-white border border-[#E0E0E0] rounded-lg p-5 h-fit shadow-2xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#424242] mb-3 flex items-center justify-between">
            <span>Preguntas</span>
            <span className="text-[#01579B] font-mono text-xs font-bold">
              {Object.keys(respuestasBloqueadas).length + Object.keys(practicasBloqueadas).length}/{preguntas.length}
            </span>
          </h2>

          <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5 max-h-[460px] overflow-y-auto pr-1">
            {preguntas.map((p, idx) => {
              const estaBloqueada = Boolean(respuestasBloqueadas[p.id] || practicasBloqueadas[p.id]);
              const tieneBorrador = Boolean(respuestasSeleccionadas[p.id] || respuestasPracticas[p.id]);
              const esActiva = idx === preguntaActivaIndex;

              return (
                <button
                  key={p.id}
                  onClick={() => setPreguntaActivaIndex(idx)}
                  className={`h-8 rounded-lg font-mono text-[11px] font-bold transition-all flex items-center justify-center space-x-0.5 border cursor-pointer ${
                    esActiva
                      ? 'bg-[#01579B] border-[#01579B] text-white shadow-2xs ring-2 ring-[#01579B]/20'
                      : estaBloqueada
                      ? 'bg-success-50 border-success-200 text-success-800 hover:bg-success-100'
                      : tieneBorrador
                      ? 'bg-high-50 border-high-200 text-high-900 hover:bg-high-100'
                      : 'bg-[#F5F5F5] border-[#E0E0E0] text-[#616161] hover:bg-[#EEEEEE] hover:text-[#212121]'
                  }`}
                  title={
                    estaBloqueada
                      ? `Pregunta ${idx + 1}: Confirmada (Bloqueada)`
                      : tieneBorrador
                      ? `Pregunta ${idx + 1}: Seleccionada (Pendiente pulsar Siguiente)`
                      : `Pregunta ${idx + 1}: Sin responder`
                  }
                >
                  <span>{idx + 1}</span>
                  {estaBloqueada && <Lock className="w-2.5 h-2.5 ml-0.5 text-success-800" />}
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-[#EEEEEE] text-[11px] text-[#616161] space-y-1.5">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-success-50 border border-success-500"></div>
              <span>Confirmada (Bloqueada)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-high-50 border border-high-500"></div>
              <span>Seleccionada en borrador</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#F5F5F5] border border-[#E0E0E0]"></div>
              <span>Sin responder</span>
            </div>
          </div>
        </div>

        {/* Área de la Pregunta Activa */}
        <div className="lg:col-span-9 xl:col-span-9 bg-white border border-[#E0E0E0] rounded-lg p-6 sm:p-8 flex flex-col justify-between shadow-2xs">
          <div>
            {/* Cabecera de la Pregunta */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-6 border-b border-[#EEEEEE]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-[#F5F5F5] border border-[#E0E0E0] text-[#424242]">
                  Pregunta {preguntaActivaIndex + 1} de {preguntas.length}
                </span>
                {preguntaActual.categoria && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[#E6EFF5] text-[#01579B] border border-[#CCDDEB]">
                    {preguntaActual.categoria}
                  </span>
                )}
                <span className="text-xs font-medium px-2.5 py-1 rounded flex items-center space-x-1 bg-[#F5F5F5] text-[#616161] border border-[#E0E0E0]">
                  {preguntaActual.tipoPregunta === 'PRACTICA' ? (
                    <>
                      <Code2 className="w-3.5 h-3.5 text-[#01579B]" />
                      <span>Reto Práctico</span>
                    </>
                  ) : (
                    <>
                      <FileCheck2 className="w-3.5 h-3.5 text-[#01579B]" />
                      <span>Opción Múltiple</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Enunciado */}
            <h3 className="text-base sm:text-lg font-medium text-[#212121] leading-relaxed mb-6">
              {preguntaActual.enunciado}
            </h3>

            {/* Opciones Teóricas */}
            {preguntaActual.tipoPregunta === 'TEORICA' && preguntaActual.opciones && (() => {
              const estaBloqueada = Boolean(respuestasBloqueadas[preguntaActual.id]);
              const opcionSeleccionada = respuestasSeleccionadas[preguntaActual.id];

              return (
                <div className="space-y-3">
                  {estaBloqueada ? (
                    <div className="p-3 bg-success-50 border border-success-200 rounded-lg flex items-center space-x-2.5 text-xs text-success-900 mb-3">
                      <Lock className="w-4 h-4 text-success-800 shrink-0" />
                      <span>Respuesta confirmada y registrada en el servidor.</span>
                    </div>
                  ) : (
                    <div className="p-3 bg-[#E6EFF5] border border-[#CCDDEB] rounded-lg flex items-center space-x-2.5 text-xs text-[#01579B] mb-3">
                      <CheckCircle2 className="w-4 h-4 text-[#01579B] shrink-0" />
                      <span>
                        Selecciona tu respuesta. Se confirmará de forma definitiva al pulsar{' '}
                        <strong>&quot;Siguiente&quot;</strong>.
                      </span>
                    </div>
                  )}

                  {preguntaActual.opciones.map((opcion) => {
                    const esSeleccionada = opcionSeleccionada === opcion.id;

                    return (
                      <div
                        key={opcion.id}
                        onClick={() => {
                          if (!estaBloqueada) {
                            handleSeleccionarOpcion(preguntaActual.id, opcion.id);
                          }
                        }}
                        className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                          esSeleccionada
                            ? estaBloqueada
                              ? 'bg-success-50 border-success-500 text-[#212121] shadow-2xs ring-1 ring-success-500'
                              : 'bg-[#E6EFF5] border-[#01579B] text-[#01579B] shadow-2xs ring-1 ring-[#01579B] cursor-pointer'
                            : estaBloqueada
                            ? 'bg-[#FAFAFA] border-[#EEEEEE] text-[#9E9E9E] opacity-50 cursor-not-allowed select-none'
                            : 'bg-white border-[#E0E0E0] text-[#212121] hover:bg-[#FAFAFA] hover:border-[#BDBDBD] cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name={`pregunta-${preguntaActual.id}`}
                            checked={esSeleccionada}
                            disabled={estaBloqueada}
                            onChange={() => {
                              if (!estaBloqueada) {
                                handleSeleccionarOpcion(preguntaActual.id, opcion.id);
                              }
                            }}
                            className="h-4 w-4 text-[#01579B] focus:ring-[#01579B] border-[#BDBDBD] cursor-pointer disabled:cursor-not-allowed"
                          />
                          <span className={`text-sm leading-relaxed ${esSeleccionada ? 'font-semibold text-[#212121]' : 'text-[#424242]'}`}>
                            {opcion.texto}
                          </span>
                        </div>

                        {esSeleccionada && (
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border flex items-center space-x-1 shrink-0 ml-3 ${
                              estaBloqueada
                                ? 'bg-success-50 text-success-800 border-success-200'
                                : 'bg-[#E6EFF5] text-[#01579B] border-[#CCDDEB]'
                            }`}
                          >
                            {estaBloqueada ? <Lock className="w-3 h-3 mr-1" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
                            <span>{estaBloqueada ? 'Confirmada' : 'Seleccionada'}</span>
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* Editor de Solución Práctica */}
            {preguntaActual.tipoPregunta === 'PRACTICA' && (() => {
              const estaEntregada = Boolean(practicasBloqueadas[preguntaActual.id]);
              return (
                <div className="space-y-4">
                  {estaEntregada && (
                    <div className="p-3 bg-success-50 border border-success-200 rounded-lg flex items-center space-x-2.5 text-xs text-success-900">
                      <Lock className="w-4 h-4 text-success-800 shrink-0" />
                      <span>Solución práctica entregada y registrada para revisión del equipo técnico.</span>
                    </div>
                  )}

                  <div className="bg-[#1E1E1E] border border-[#333333] rounded-lg overflow-hidden shadow-2xs">
                    <div className="bg-[#2D2D2D] px-4 py-2 flex items-center justify-between text-xs text-[#BDBDBD] border-b border-[#3E3E3E]">
                      <span className="font-mono">solution.ts</span>
                      <span>TypeScript 5.x</span>
                    </div>
                    <textarea
                      rows={12}
                      readOnly={estaEntregada}
                      value={respuestasPracticas[preguntaActual.id] || ''}
                      onChange={(e) => {
                        if (!estaEntregada) {
                          setRespuestasPracticas((prev) => ({
                            ...prev,
                            [preguntaActual.id]: e.target.value,
                          }));
                        }
                      }}
                      placeholder="// Escribe aquí tu implementación en TypeScript...&#10;function calcularRadar(evaluaciones: number[]) {&#10;  // Tu código&#10;}"
                      className={`w-full bg-[#1E1E1E] text-[#D4D4D4] font-mono text-sm p-4 focus:outline-none resize-y ${
                        estaEntregada ? 'opacity-80 cursor-not-allowed select-text' : ''
                      }`}
                    />
                  </div>

                  {!estaEntregada ? (
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleGuardarPractica(preguntaActual.id)}
                        disabled={entregarPracticaMutation.isPending || !respuestasPracticas[preguntaActual.id]?.trim()}
                        className="px-4 py-2 bg-[#01579B] hover:bg-[#004174] disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>
                          {entregarPracticaMutation.isPending ? 'Guardando...' : 'Guardar y Bloquear Solución'}
                        </span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <span className="text-xs font-semibold text-success-800 bg-success-50 border border-success-200 px-3 py-1.5 rounded-lg flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-success-800" />
                        <span>Solución entregada con éxito</span>
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Navegación Inferior */}
          <div className="pt-6 mt-8 border-t border-[#EEEEEE] flex justify-between items-center">
            <button
              onClick={() => setPreguntaActivaIndex((prev) => Math.max(prev - 1, 0))}
              disabled={esPrimera}
              className="px-4 py-2 rounded-lg border border-[#E0E0E0] bg-white text-[#424242] hover:bg-[#F5F5F5] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            {esUltima ? (
              <button
                onClick={handleRevisarYEntregar}
                className="px-5 py-2 bg-success-800 hover:bg-success-900 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar y Entregar Examen</span>
              </button>
            ) : (
              <button
                onClick={handleAvanzarSiguiente}
                className="px-5 py-2 rounded-lg bg-[#01579B] hover:bg-[#004174] text-white text-xs font-bold transition-all flex items-center space-x-1.5 shadow-2xs cursor-pointer"
              >
                <span>
                  {respuestasSeleccionadas[preguntaActual.id] && !respuestasBloqueadas[preguntaActual.id]
                    ? 'Confirmar y Siguiente'
                    : 'Siguiente'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Confirmación de Entrega con Backdrop Click */}
      {showConfirmModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowConfirmModal(false);
          }}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4"
        >
          <div className="bg-white border border-[#E0E0E0] rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-[#212121] mb-2">¿Confirmas la entrega de tu examen?</h3>
            <p className="text-xs text-[#616161] leading-relaxed mb-6">
              Una vez finalizada la prueba, no podrás modificar ninguna respuesta. Tu calificación será calculada de
              forma inmediata y se actualizará tu perfil de aspirante.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-[#E0E0E0] text-[#424242] hover:bg-[#F5F5F5] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Continuar Respondiendo
              </button>
              <button
                onClick={handleFinalizarTest}
                disabled={finalizarMutation.isPending}
                className="px-5 py-2 bg-[#01579B] hover:bg-[#004174] disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                {finalizarMutation.isPending ? (
                  <span>Procesando...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Confirmar y Entregar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestRunnerPage;
