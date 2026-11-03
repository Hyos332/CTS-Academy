import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
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
} from 'lucide-react';

interface Opcion {
  id: string;
  texto: string;
}

interface Pregunta {
  id: string;
  enunciado: string;
  tipoPregunta: 'TEORICA' | 'PRACTICA';
  opciones?: Opcion[];
}

export const TestRunnerPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  const [preguntaActivaIndex, setPreguntaActivaIndex] = useState(0);
  const [respuestasTeoricas, setRespuestasTeoricas] = useState<Record<string, string>>({});
  const [respuestasPracticas, setRespuestasPracticas] = useState<Record<string, string>>({});
  const [tiempoRestante, setTiempoRestante] = useState<number>(3600);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [testFinalizadoData, setTestFinalizadoData] = useState<any | null>(null);

  // Iniciar o recuperar test
  const { data, isLoading, error } = useQuery({
    queryKey: ['test-runner', testId],
    queryFn: async () => {
      const res = await apiClient.post(`/evaluacion/baterias/${testId}/iniciar`);
      return res.data;
    },
    refetchOnWindowFocus: false,
  });

  // Temporizador regresivo en segundos
  useEffect(() => {
    if (data?.test?.tiempoLimiteSegundos) {
      setTiempoRestante(data.test.tiempoLimiteSegundos);
    }
  }, [data]);

  useEffect(() => {
    if (testFinalizadoData || tiempoRestante <= 0) return;

    const interval = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinalizarTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [tiempoRestante, testFinalizadoData]);

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
    },
  });

  const handleSeleccionarOpcion = (preguntaId: string, opcionId: string) => {
    setRespuestasTeoricas((prev) => ({ ...prev, [preguntaId]: opcionId }));
    responderTeoricaMutation.mutate({ preguntaId, opcionId });
  };

  const handleGuardarPractica = (preguntaId: string) => {
    const codigo = respuestasPracticas[preguntaId] || '';
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
              <span className="text-slate-400 text-sm">Calificación Calculada</span>
              <span className="text-2xl font-bold text-brand-400">{Number(nota).toFixed(1)} / 10</span>
            </div>

            {radar && (
              <div className="pt-4 space-y-3">
                <h3 className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                  Puntajes Diagnósticos de Competencia
                </h3>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/60">
                    <span className="text-xs text-slate-400 block">Técnico</span>
                    <span className="text-lg font-bold text-white">{radar.tecnico?.puntaje ?? 0} pts</span>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/60">
                    <span className="text-xs text-slate-400 block">Aptitud</span>
                    <span className="text-lg font-bold text-white">{radar.aptitud?.puntaje ?? 0} pts</span>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/60">
                    <span className="text-xs text-slate-400 block">Actitud</span>
                    <span className="text-lg font-bold text-white">{radar.actitud?.puntaje ?? 0} pts</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/evaluacion/panel')}
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
            onClick={() => navigate('/evaluacion/panel')}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-white">Batería de Admisión Técnica</h1>
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

      {/* Contenido Principal */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navegador de Preguntas (Sidebar) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 h-fit shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between">
            <span>Preguntas</span>
            <span className="text-brand-400 font-mono">
              {Object.keys(respuestasTeoricas).length + Object.keys(respuestasPracticas).length}/{preguntas.length}
            </span>
          </h2>

          <div className="grid grid-cols-5 gap-2">
            {preguntas.map((p, idx) => {
              const estaRespondida = Boolean(respuestasTeoricas[p.id] || respuestasPracticas[p.id]);
              const esActiva = idx === preguntaActivaIndex;

              return (
                <button
                  key={p.id}
                  onClick={() => setPreguntaActivaIndex(idx)}
                  className={`h-10 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center border ${
                    esActiva
                      ? 'bg-brand-600 border-brand-500 text-white shadow-md shadow-brand-600/30 ring-2 ring-brand-400/30'
                      : estaRespondida
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30'
                      : 'bg-slate-800 border-slate-700/80 text-slate-400 hover:bg-slate-750 hover:text-white'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500/30 border border-emerald-500/50"></div>
              <span>Respondida</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-slate-800 border border-slate-700"></div>
              <span>Sin responder</span>
            </div>
          </div>
        </div>

        {/* Área de la Pregunta Activa */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-sm">
          <div>
            {/* Cabecera de la Pregunta */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
                  Pregunta {preguntaActivaIndex + 1} de {preguntas.length}
                </span>
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
                      <span>Teórica</span>
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
            {preguntaActual.tipoPregunta === 'TEORICA' && preguntaActual.opciones && (
              <div className="space-y-3">
                {preguntaActual.opciones.map((opcion) => {
                  const esSeleccionada = respuestasTeoricas[preguntaActual.id] === opcion.id;

                  return (
                    <label
                      key={opcion.id}
                      onClick={() => handleSeleccionarOpcion(preguntaActual.id, opcion.id)}
                      className={`flex items-start p-4 rounded-xl border cursor-pointer transition-all ${
                        esSeleccionada
                          ? 'bg-brand-600/15 border-brand-500 text-white shadow-sm ring-1 ring-brand-500/50'
                          : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`pregunta-${preguntaActual.id}`}
                        checked={esSeleccionada}
                        onChange={() => {}}
                        className="mt-1 h-4 w-4 text-brand-600 focus:ring-brand-500 border-slate-700 bg-slate-900"
                      />
                      <span className="ml-3 text-sm leading-relaxed">{opcion.texto}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {/* Editor de Solución Práctica */}
            {preguntaActual.tipoPregunta === 'PRACTICA' && (
              <div className="space-y-4">
                <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                  <div className="bg-slate-800/80 px-4 py-2 flex items-center justify-between text-xs text-slate-400 border-b border-slate-800">
                    <span className="font-mono">solution.ts</span>
                    <span>TypeScript 5.x</span>
                  </div>
                  <textarea
                    rows={12}
                    value={respuestasPracticas[preguntaActual.id] || ''}
                    onChange={(e) =>
                      setRespuestasPracticas((prev) => ({
                        ...prev,
                        [preguntaActual.id]: e.target.value,
                      }))
                    }
                    placeholder="// Escribe aquí tu implementación en TypeScript...&#10;function calcularRadar(evaluaciones: number[]) {&#10;  // Tu código&#10;}"
                    className="w-full bg-slate-950 text-slate-200 font-mono text-sm p-4 focus:outline-none resize-y"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => handleGuardarPractica(preguntaActual.id)}
                    disabled={entregarPracticaMutation.isPending}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center space-x-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>
                      {entregarPracticaMutation.isPending ? 'Guardando...' : 'Guardar Código'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navegación Inferior */}
          <div className="pt-6 mt-8 border-t border-slate-800 flex justify-between items-center">
            <button
              onClick={() => setPreguntaActivaIndex((prev) => Math.max(prev - 1, 0))}
              disabled={esPrimera}
              className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-750 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition-colors flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            {esUltima ? (
              <button
                onClick={() => setShowConfirmModal(true)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md transition-colors flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Revisar y Entregar</span>
              </button>
            ) : (
              <button
                onClick={() => setPreguntaActivaIndex((prev) => Math.min(prev + 1, preguntas.length - 1))}
                className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium transition-colors flex items-center space-x-1"
              >
                <span>Siguiente</span>
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
