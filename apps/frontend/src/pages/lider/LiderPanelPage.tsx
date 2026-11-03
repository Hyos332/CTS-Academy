import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Navbar } from '../../components/common/Navbar';
import { Users, GitPullRequest, ExternalLink } from 'lucide-react';

export const LiderPanelPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedEntrega, setSelectedEntrega] = useState<any | null>(null);
  const [calificacion, setCalificacion] = useState<number>(9.0);
  const [feedback, setFeedback] = useState<string>('');

  const { data: panelData, isLoading: loadingPanel } = useQuery({
    queryKey: ['lider-panel'],
    queryFn: async () => {
      const res = await apiClient.get('/equipos/panel-lider');
      return res.data;
    },
  });

  const { data: entregasPendientes, isLoading: loadingEntregas } = useQuery({
    queryKey: ['entregas-pendientes'],
    queryFn: async () => {
      const res = await apiClient.get('/formacion/entregables/pendientes');
      return res.data;
    },
  });

  const aprobarMutation = useMutation({
    mutationFn: async ({ id, calificacion, feedback }: { id: string; calificacion: number; feedback: string }) => {
      return apiClient.post(`/formacion/entregables/${id}/aprobar`, {
        calificacion,
        feedbackGeneral: feedback,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entregas-pendientes'] });
      queryClient.invalidateQueries({ queryKey: ['lider-panel'] });
      setSelectedEntrega(null);
      setFeedback('');
    },
  });

  const solicitarCambiosMutation = useMutation({
    mutationFn: async ({ id, feedback }: { id: string; feedback: string }) => {
      return apiClient.post(`/formacion/entregables/${id}/solicitar-cambios`, {
        feedbackGeneral: feedback,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entregas-pendientes'] });
      queryClient.invalidateQueries({ queryKey: ['lider-panel'] });
      setSelectedEntrega(null);
      setFeedback('');
    },
  });

  if (loadingPanel || loadingEntregas) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  const { equipo, miembros, entregablesPendientesCount } = panelData || {};

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Cabecera del Squad */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold text-brand-600 tracking-wider uppercase">
              {equipo?.codigo || 'SQUAD'}
            </span>
            <h1 className="text-2xl font-bold text-slate-900">{equipo?.nombre || 'Equipo de Desarrollo'}</h1>
            <p className="text-sm text-slate-500">
              Especialidad: <span className="font-semibold text-slate-700">{equipo?.especialidad}</span> • {equipo?.totalMiembros || 0} Desarrolladores en squad
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-right">
            <span className="text-xs font-semibold text-amber-800 block">Revisiones Pendientes</span>
            <span className="text-2xl font-black text-amber-900">{entregablesPendientesCount || 0}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cola de Entregables Pendientes */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <GitPullRequest className="w-5 h-5 text-brand-600" />
              <span>Entregables Pendientes de Revisión</span>
            </h2>

            <div className="space-y-3">
              {(!entregasPendientes || entregasPendientes.length === 0) ? (
                <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-sm">
                  No hay entregables pendientes de revisión en este momento.
                </div>
              ) : (
                entregasPendientes.map((entrega: any) => (
                  <div
                    key={entrega.id}
                    className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-300 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-medium text-slate-400">
                          {entrega.laboratorio?.modulo?.titulo}
                        </span>
                        <h3 className="text-base font-bold text-slate-900">{entrega.laboratorio?.titulo}</h3>
                        <p className="text-xs text-slate-600 mt-1">
                          Alumno: <strong>{entrega.alumno?.usuario?.nombre} {entrega.alumno?.usuario?.apellidos}</strong> ({entrega.alumno?.usuario?.email})
                        </p>
                      </div>

                      <a
                        href={entrega.url_pull_request}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs text-brand-600 hover:text-brand-800 font-medium"
                      >
                        Ver PR <ExternalLink className="w-3.5 h-3.5 ml-1" />
                      </a>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-mono">
                        Commit: {entrega.commit_hash?.substring(0, 7)} • Intento #{entrega.numero_intento}
                      </span>
                      <button
                        onClick={() => setSelectedEntrega(entrega)}
                        className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium rounded-lg shadow-sm transition-colors"
                      >
                        Evaluar Entrega
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Desarrolladores del Squad */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-600" />
              <span>Miembros del Squad</span>
            </h2>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 divide-y divide-slate-100">
              {miembros?.map((m: any) => (
                <div key={m.id} className="py-3 first:pt-0 last:pb-0">
                  <p className="text-xs font-bold text-slate-900">{m.nombreCompleto}</p>
                  <p className="text-[11px] text-slate-500">{m.email}</p>
                  <span className="text-[10px] text-emerald-600 font-medium mt-1 inline-block">
                    ● Matrícula activa
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal de Calificación de Entregable */}
        {selectedEntrega && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4 border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                Evaluar: {selectedEntrega.laboratorio?.titulo}
              </h3>
              <p className="text-xs text-slate-500">
                Postulante: {selectedEntrega.alumno?.usuario?.nombre} {selectedEntrega.alumno?.usuario?.apellidos}
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Calificación Práctica (0.00 - 10.00)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={calificacion}
                  onChange={(e) => setCalificacion(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Feedback y Comentarios
                </label>
                <textarea
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Detallar puntos fuertes y aspectos a mejorar del Pull Request..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setSelectedEntrega(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() =>
                    solicitarCambiosMutation.mutate({
                      id: selectedEntrega.id,
                      feedback,
                    })
                  }
                  disabled={!feedback || solicitarCambiosMutation.isPending}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  Solicitar Cambios
                </button>
                <button
                  onClick={() =>
                    aprobarMutation.mutate({
                      id: selectedEntrega.id,
                      calificacion,
                      feedback,
                    })
                  }
                  disabled={!feedback || aprobarMutation.isPending}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  Aprobar Entregable
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
