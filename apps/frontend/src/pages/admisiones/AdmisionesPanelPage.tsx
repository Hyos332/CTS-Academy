import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Navbar } from '../../components/common/Navbar';
import { Users, ShieldAlert, Lock, ChevronRight, Video, FileText } from 'lucide-react';

export const AdmisionesPanelPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [motivoCierre, setMotivoCierre] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['admisiones-panel'],
    queryFn: async () => {
      const res = await apiClient.get('/equipos/panel-admisiones');
      return res.data;
    },
  });

  const cerrarCorteMutation = useMutation({
    mutationFn: async (convocatoriaId: string) => {
      return apiClient.post(`/equipos/periodos-ingreso/${convocatoriaId}/cierre`, {
        motivoCierre,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admisiones-panel'] });
      setShowCloseModal(false);
      setMotivoCierre('');
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-12 text-center text-red-600">
          Error al cargar las métricas de admisiones.
        </main>
      </div>
    );
  }

  const { convocatoriaActiva, metricasPostulacion, equipos, candidatos } = data;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Cabecera de Convocatoria */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold text-amber-600 tracking-wider uppercase">
              Admisiones & Gestión de Equipos
            </span>
            <h1 className="text-2xl font-bold text-slate-900">
              {convocatoriaActiva?.denominacion || 'Sin Convocatoria Activa'}
            </h1>
            <p className="text-sm text-slate-500">
              Semestre: <span className="font-semibold text-slate-700">{convocatoriaActiva?.semestre || 'N/A'}</span> • Modelo: <span className="font-semibold text-slate-700">{convocatoriaActiva?.modeloAdmision || 'N/A'}</span>
            </p>
          </div>

          {convocatoriaActiva && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowCloseModal(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg shadow-sm transition-colors flex items-center space-x-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Cerrar Corte Semestral</span>
              </button>
            </div>
          )}
        </div>

        {/* Embudo de Candidatos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-medium text-slate-500">Postulados</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{metricasPostulacion.totalCandidatos}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-medium text-blue-600">En Proceso</span>
            <p className="text-2xl font-bold text-blue-900 mt-1">{metricasPostulacion.enProceso}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-medium text-indigo-600">Tests Listos</span>
            <p className="text-2xl font-bold text-indigo-900 mt-1">{metricasPostulacion.testsCompletados}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-medium text-purple-600">Entrevistas</span>
            <p className="text-2xl font-bold text-purple-900 mt-1">{metricasPostulacion.entrevistaAgendada}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-medium text-emerald-600">Admitidos</span>
            <p className="text-2xl font-bold text-emerald-900 mt-1">{metricasPostulacion.admitidos}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-medium text-red-600">Rechazados</span>
            <p className="text-2xl font-bold text-red-900 mt-1">{metricasPostulacion.rechazados}</p>
          </div>
        </div>

        {/* Tabla de Postulantes Activos */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-brand-600" />
              <span>Aspirantes en Convocatoria Activa</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Total: {candidatos?.length || 0} candidatos
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Candidato</th>
                    <th className="px-6 py-3.5">Sede</th>
                    <th className="px-6 py-3.5">Estado Postulación</th>
                    <th className="px-6 py-3.5">Batería Técnica</th>
                    <th className="px-6 py-3.5">Entrevista Meet</th>
                    <th className="px-6 py-3.5 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {candidatos?.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-xs text-slate-400 italic">
                        No hay candidatos registrados para la convocatoria activa.
                      </td>
                    </tr>
                  ) : (
                    candidatos?.map((cand: any) => {
                      const test = cand.tests?.[0];
                      const tieneMeet = Boolean(cand.entrevista);

                      return (
                        <tr key={cand.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-bold text-slate-900 block">{cand.nombreCompleto}</span>
                            <span className="text-xs text-slate-400">{cand.email}</span>
                          </td>
                          <td className="px-6 py-4 text-xs font-mono font-medium text-slate-600">
                            {cand.sedeOrigen}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                                cand.estadoPostulacion === 'ADMITIDO'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : cand.estadoPostulacion === 'TESTS_COMPLETADOS'
                                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                  : cand.estadoPostulacion === 'EN_PROCESO'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : cand.estadoPostulacion === 'RECHAZADO'
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              {cand.estadoPostulacion}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {test ? (
                              <div className="text-xs">
                                <span className="font-semibold text-slate-800">
                                  {test.calificacion !== null
                                    ? `${Number(test.calificacion).toFixed(1)} / 10`
                                    : 'Sin calificar'}
                                </span>
                                <span className="text-[10px] text-slate-400 block font-mono">
                                  {test.estado}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {tieneMeet ? (
                              <span className="inline-flex items-center text-xs text-indigo-600 font-medium">
                                <Video className="w-3.5 h-3.5 mr-1" />
                                {new Date(cand.entrevista.fechaHoraProgramada).toLocaleDateString()}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Pendiente</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => navigate(`/admisiones/candidatos/${cand.id}`)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 text-xs font-semibold rounded-lg transition-colors inline-flex items-center space-x-1"
                            >
                              <span>Evaluar</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Squads y Capacidad */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Users className="w-5 h-5 text-brand-600" />
            <span>Equipos de Desarrollo y Capacidad Operativa</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipos?.map((eq: any) => (
              <div
                key={eq.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-300 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-mono font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                      {eq.codigo}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{eq.nombre}</h3>
                    <p className="text-xs text-slate-500">{eq.especialidad}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-slate-900">{eq.alumnosActivos}</span>
                    <span className="text-[10px] text-slate-400 block">alumnos</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
                  Tech Leader: <strong>{eq.lider}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal de Cierre de Corte */}
        {showCloseModal && convocatoriaActiva && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-100">
              <div className="p-3 bg-red-50 text-red-700 rounded-xl flex items-center space-x-2">
                <ShieldAlert className="w-6 h-6 flex-shrink-0" />
                <h3 className="font-bold text-sm">Formalizar Cierre de Corte Semestral</h3>
              </div>

              <p className="text-xs text-slate-600">
                Esta acción emitirá el <strong>Informe de Corte con firma hash inmutable</strong> y cerrará las postulaciones de <strong>{convocatoriaActiva.denominacion}</strong>.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Motivo de cierre u observaciones
                </label>
                <textarea
                  rows={3}
                  value={motivoCierre}
                  onChange={(e) => setMotivoCierre(e.target.value)}
                  placeholder="Cierre regular semestral tras agotar plazas y culminar proceso de entrevistas..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setShowCloseModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => cerrarCorteMutation.mutate(convocatoriaActiva.id)}
                  disabled={cerrarCorteMutation.isPending}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  Confirmar y Firmar Corte
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
