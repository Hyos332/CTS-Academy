import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Navbar } from '../../components/common/Navbar';
import { Users, GitPullRequest, ExternalLink, X } from 'lucide-react';

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
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#01579B] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-[#616161]">Cargando Panel de Squad...</span>
        </div>
      </div>
    );
  }

  const { equipo, miembros, entregablesPendientesCount } = panelData || {};

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans text-[#212121]">
      <Navbar />

      <main className="w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 space-y-6">
        {/* Cabecera del Squad */}
        <div className="bg-white rounded-lg shadow-xs border border-[#E0E0E0] p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[10px] font-bold text-[#01579B] tracking-wider uppercase">
              {equipo?.codigo || 'SQUAD'}
            </span>
            <h1 className="text-2xl font-bold text-[#212121] tracking-tight mt-0.5">{equipo?.nombre || 'Equipo de Desarrollo'}</h1>
            <p className="text-xs text-[#757575] mt-1">
              Especialidad: <span className="font-semibold text-[#424242]">{equipo?.especialidad}</span> • {equipo?.totalMiembros || 0} Desarrolladores en squad
            </p>
          </div>
          <div className="bg-[#FFF3E0] border border-[#FFE0B2] rounded-lg px-4 py-2.5 text-right">
            <span className="text-[11px] font-bold text-[#E65100] block uppercase tracking-wider">Revisiones Pendientes</span>
            <span className="text-2xl font-black text-[#E65100]">{entregablesPendientesCount || 0}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cola de Entregables Pendientes */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-base font-bold text-[#212121] flex items-center space-x-2">
              <GitPullRequest className="w-4 h-4 text-[#01579B]" />
              <span>Entregables Pendientes de Revisión</span>
            </h2>

            <div className="space-y-3">
              {(!entregasPendientes || entregasPendientes.length === 0) ? (
                <div className="bg-white border border-[#E0E0E0] rounded-lg p-8 text-center text-[#757575] text-xs italic">
                  No hay entregables pendientes de revisión en este momento.
                </div>
              ) : (
                entregasPendientes.map((entrega: any) => (
                  <div
                    key={entrega.id}
                    className="bg-white border border-[#E0E0E0] rounded-lg p-5 shadow-xs hover:border-[#CCDDEB] transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[11px] font-semibold text-[#757575]">
                          {entrega.laboratorio?.modulo?.titulo}
                        </span>
                        <h3 className="text-sm font-bold text-[#212121] mt-0.5">{entrega.laboratorio?.titulo}</h3>
                        <p className="text-xs text-[#616161] mt-1">
                          Alumno: <strong>{entrega.alumno?.usuario?.nombre} {entrega.alumno?.usuario?.apellidos}</strong> ({entrega.alumno?.usuario?.email})
                        </p>
                      </div>

                      <a
                        href={entrega.url_pull_request}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs text-[#01579B] hover:text-[#004174] font-semibold"
                      >
                        Ver PR <ExternalLink className="w-3.5 h-3.5 ml-1" />
                      </a>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#EEEEEE] flex items-center justify-between">
                      <span className="text-[11px] text-[#757575] font-mono">
                        Commit: {entrega.commit_hash?.substring(0, 7)} • Intento #{entrega.numero_intento}
                      </span>
                      <button
                        onClick={() => setSelectedEntrega(entrega)}
                        className="px-3 py-1.5 bg-[#01579B] hover:bg-[#004174] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
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
            <h2 className="text-base font-bold text-[#212121] flex items-center space-x-2">
              <Users className="w-4 h-4 text-[#01579B]" />
              <span>Miembros del Squad</span>
            </h2>

            <div className="bg-white rounded-lg shadow-xs border border-[#E0E0E0] p-4 divide-y divide-[#EEEEEE]">
              {miembros?.map((m: any) => (
                <div key={m.id} className="py-3 first:pt-0 last:pb-0">
                  <p className="text-xs font-bold text-[#212121]">{m.nombreCompleto}</p>
                  <p className="text-[11px] text-[#757575] font-mono">{m.email}</p>
                  <span className="text-[10px] text-[#1B5E20] bg-[#E8F5E9] font-bold px-2 py-0.5 rounded border border-[#C8E6C9] mt-1 inline-block">
                    ● Matrícula activa
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal de Calificación de Entregable (Cierre con clic en backdrop) */}
        {selectedEntrega && (
          <div
            onClick={() => setSelectedEntrega(null)}
            className="fixed inset-0 bg-[#000000]/40 backdrop-blur-2xs z-50 flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-md max-w-lg w-full p-6 space-y-4 border border-[#E0E0E0]"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#EEEEEE]">
                <div>
                  <h3 className="text-base font-bold text-[#212121]">
                    Evaluar: {selectedEntrega.laboratorio?.titulo}
                  </h3>
                  <p className="text-xs text-[#757575]">
                    Alumno: {selectedEntrega.alumno?.usuario?.nombre} {selectedEntrega.alumno?.usuario?.apellidos}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedEntrega(null)}
                  className="p-1 rounded-lg text-[#757575] hover:text-[#212121] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#424242] mb-1">
                  Calificación Práctica (0.00 - 10.00)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={calificacion}
                  onChange={(e) => setCalificacion(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-xs bg-white text-[#212121] focus:ring-1 focus:ring-[#01579B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#424242] mb-1">
                  Feedback y Comentarios
                </label>
                <textarea
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Detallar puntos fuertes y aspectos a mejorar del Pull Request..."
                  className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-xs bg-white text-[#212121] focus:ring-1 focus:ring-[#01579B] focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#EEEEEE]">
                <button
                  onClick={() => setSelectedEntrega(null)}
                  className="px-4 py-2 border border-[#E0E0E0] text-[#424242] text-xs font-semibold rounded-lg hover:bg-[#F5F5F5] transition-colors cursor-pointer"
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
                  className="px-4 py-2 bg-[#F57C00] hover:bg-[#E65100] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
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
                  className="px-4 py-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
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

export default LiderPanelPage;
