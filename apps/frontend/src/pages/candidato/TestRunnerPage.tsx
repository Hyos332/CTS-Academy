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

  const handleFinalizarTest = () => {
    finalizarMutation.mutate();
  };

  const formatoTiempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mb-4"></div>
        <p className="text-slate-300 font-medium">Cargando batería de evaluación técnica...</p>
      </div>
    );
  }

  if (error || !data || !data.preguntas) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-3" />
        <h2 className="text-xl font-bold mb-2">Error al iniciar la prueba</h2>
        <p className="text-slate-400 text-sm max-w-md text-center mb-6">
          No fue posible cargar el examen o el test ya ha finalizado previamente.
        </p>
        <button
          onClick={() => navigate('/evaluacion/panel')}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors"
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
      <div className="min-h-screen bg-slate-900 text-white flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-3xl mx-auto px-4 py-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6 border border-emerald-500/30">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h1 className="text-3xl font-extrabold mb-2">¡Evaluación Entregada con Éxito!</h1>
          <p className="text-slate-400 max-w-md mb-8 text-sm">
            Tus respuestas han sido procesadas y registradas en el sistema. Tu postulación ha pasado al estado{' '}
            <span className="text-emerald-400 font-semibold">TESTS_COMPLETADOS</span>.
          </p>

          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 w-full max-w-lg mb-8 text-left shadow-xl">
            <div className="flex justify-between items-center pb-4 border-b border-slate-700">
              <span className="text-slate-400 text-sm">
                {testFinalizadoData.test?.tipo_bateria === 'TECNICO' ? 'Calificación Técnica' : 'Resultado de Evaluación'}
              </span>
              <span className="text-2xl font-bold text-brand-400">
                {testFinalizadoData.test?.tipo_bateria === 'TECNICO'
                  ? `${Number(nota).toFixed(1)} / 10`
                  : 'Espectro Cualitativo Registrado'}
              </span>
            </div>

            {radar && (
              <div className="pt-4 space-y-3">
                <h3 className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                  Diagnóstico por Dimensión
                </h3>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/60">
                    <span className="text-xs text-slate-400 block">Técnico</span>
                    <span className="text-base font-bold text-emerald-400">{Number(nota).toFixed(1)} / 10</span>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/60">
                    <span className="text-xs text-slate-400 block">Aptitud</span>
                    <span className="text-xs font-bold text-indigo-300">Espectro Registrado</span>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/60">
                    <span className="text-xs text-slate-400 block">Actitud</span>
                    <span className="text-xs font-bold text-amber-300">Espectro Registrado</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleVolver}
            className="px-6 py-3 bg-brand-600 hover:bg-brand-500 font-medium rounded-xl text-white shadow-lg shadow-brand-600/30 transition-all flex items-center space-x-2"
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Barra de cabecera con temporizador */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-md">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleVolver}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-white">
              Batería de {data?.test?.tipoBateria ? `${data.test.tipoBateria}` : 'Admisión'}
            </h1>
            <p className="text-xs text-slate-400">CTS Academy • Programa PROFER</p>
          </div>
        </div>

        {/* Cronómetro */}
        <div
          className={`flex items-center space-x-2 px-4 py-1.5 rounded-full border text-sm font-mono font-bold transition-colors ${
            esCriticoTiempo
              ? 'bg-red-500/20 border-red-500/40 text-red-400 animate-pulse'
              : esAlertaTiempo
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
              : 'bg-slate-800 border-slate-700 text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{formatoTiempo(tiempoRestante)}</span>
        </div>

        <div>
          <button
            onClick={() => setShowConfirmModal(true)}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center space-x-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Finalizar Examen</span>
          </button>
        </div>
      </header>

      {/* Contenido Principal a Pantalla Completa Fluida */}
      <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Navegador de Preguntas (Sidebar) */}
        <div className="lg:col-span-3 xl:col-span-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 h-fit shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
            <span>Preguntas</span>
            <span className="text-brand-400 font-mono text-xs">
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
                  className={`h-8 rounded-lg font-mono text-[11px] font-bold transition-all flex items-center justify-center space-x-0.5 border ${
                    esActiva
                      ? 'bg-brand-600 border-brand-500 text-white shadow-md shadow-brand-600/30 ring-2 ring-brand-400/30'
                      : estaBloqueada
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30'
                      : tieneBorrador
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                      : 'bg-slate-800 border-slate-700/80 text-slate-400 hover:bg-slate-750 hover:text-white'
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
                  {estaBloqueada && <Lock className="w-2.5 h-2.5 ml-0.5 text-emerald-400" />}
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 space-y-1.5">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/30 border border-emerald-500/50"></div>
              <span>Confirmada (Bloqueada)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/30 border border-amber-500/50"></div>
              <span>Seleccionada en borrador</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700"></div>
              <span>Sin responder</span>
            </div>
          </div>
        </div>

        {/* Área de la Pregunta Activa */}
        <div className="lg:col-span-9 xl:col-span-9 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-sm">
          <div>
            {/* Cabecera de la Pregunta */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-6 border-b border-slate-800">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
                  Pregunta {preguntaActivaIndex + 1} de {preguntas.length}
                </span>
                {preguntaActual.categoria && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {preguntaActual.categoria}
                  </span>
                )}
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-md flex items-center space-x-1 ${
                    preguntaActual.tipoPregunta === 'PRACTICA'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}
                >
                  {preguntaActual.tipoPregunta === 'PRACTICA' ? (
                    <>
                      <Code2 className="w-3 h-3" />
                      <span>Reto Práctico</span>
                    </>
                  ) : (
                    <>
                      <FileCheck2 className="w-3 h-3" />
                      <span>Opción Múltiple</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Enunciado */}
            <h3 className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed mb-6">
              {preguntaActual.enunciado}
            </h3>

            {/* Opciones Teóricas */}
            {preguntaActual.tipoPregunta === 'TEORICA' && preguntaActual.opciones && (() => {
              const estaBloqueada = Boolean(respuestasBloqueadas[preguntaActual.id]);
              const opcionSeleccionada = respuestasSeleccionadas[preguntaActual.id];

              return (
                <div className="space-y-3">
                  {estaBloqueada ? (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center space-x-2.5 text-xs text-emerald-300 mb-3">
                      <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Respuesta confirmada y bloqueada en el servidor.</span>
                    </div>
                  ) : (
                    <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center space-x-2.5 text-xs text-indigo-300 mb-3">
                      <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>
                        Selecciona tu respuesta libremente. Se confirmará y bloqueará de forma definitiva al pulsar{' '}
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
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                          esSeleccionada
                            ? estaBloqueada
                              ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500/50'
                              : 'bg-brand-600/20 border-brand-500 text-white shadow-sm ring-1 ring-brand-500/50 cursor-pointer'
                            : estaBloqueada
                            ? 'bg-slate-800/30 border-slate-800 text-slate-500 opacity-40 cursor-not-allowed select-none'
                            : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:border-slate-600 cursor-pointer'
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
                            className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-slate-700 bg-slate-900 cursor-pointer disabled:cursor-not-allowed"
                          />
                          <span className={`text-sm leading-relaxed ${esSeleccionada ? 'font-medium text-white' : ''}`}>
                            {opcion.texto}
                          </span>
                        </div>

                        {esSeleccionada && (
                          <span
                            className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border flex items-center space-x-1 shrink-0 ml-3 ${
                              estaBloqueada
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : 'bg-brand-500/20 text-brand-300 border-brand-500/30'
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
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center space-x-2.5 text-xs text-emerald-300">
                      <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Solución práctica entregada y bloqueada para revisión del equipo técnico.</span>
                    </div>
                  )}

                  <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                    <div className="bg-slate-800/80 px-4 py-2 flex items-center justify-between text-xs text-slate-400 border-b border-slate-800">
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
                      className={`w-full bg-slate-950 text-slate-200 font-mono text-sm p-4 focus:outline-none resize-y ${
                        estaEntregada ? 'opacity-80 cursor-not-allowed select-text' : ''
                      }`}
                    />
                  </div>

                  {!estaEntregada ? (
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleGuardarPractica(preguntaActual.id)}
                        disabled={entregarPracticaMutation.isPending || !respuestasPracticas[preguntaActual.id]?.trim()}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center space-x-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>
                          {entregarPracticaMutation.isPending ? 'Guardando...' : 'Guardar y Bloquear Solución'}
                        </span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        <span>Solución entregada con éxito</span>
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Navegación Inferior */}
          <div className="pt-6 mt-8 border-t border-slate-800 flex justify-between items-center">
            <button
              onClick={() => setPreguntaActivaIndex((prev) => Math.max(prev - 1, 0))}
              disabled={esPrimera}
              className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-750 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition-colors flex items-center space-x-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            {esUltima ? (
              <button
                onClick={handleRevisarYEntregar}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar y Entregar Examen</span>
              </button>
            ) : (
              <button
                onClick={handleAvanzarSiguiente}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all flex items-center space-x-1.5 shadow-md shadow-brand-600/30"
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

      {/* Modal de Confirmación de Entrega */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">¿Confirmas la entrega de tu examen?</h3>
            <p className="text-sm text-slate-400 mb-6">
              Una vez finalizada la prueba, no podrás modificar ninguna respuesta. Tu calificación será calculada de
              forma inmediata y se actualizará tu perfil de aspirante.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
              >
                Continuar Respondiendo
              </button>
              <button
                onClick={handleFinalizarTest}
                disabled={finalizarMutation.isPending}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-md transition-colors flex items-center space-x-1.5"
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
