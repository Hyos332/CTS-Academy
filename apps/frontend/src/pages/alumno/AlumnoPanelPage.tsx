import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Navbar } from '../../components/common/Navbar';
import { BookOpen, GitPullRequest, Award, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export const AlumnoPanelPage: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['alumno-panel'],
    queryFn: async () => {
      const res = await apiClient.get('/formacion/alumnos/panel');
      return res.data;
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
          Error al cargar los datos del panel de alumno.
        </main>
      </div>
    );
  }

  const { alumno, progresoGlobal, modulos, entregasRecientes } = data;

  const renderBadgeEstado = (estado: string) => {
    switch (estado) {
      case 'APROBADO':
        return (
          <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5 mr-1" />
            Aprobado
          </span>
        );
      case 'CAMBIOS_SOLICITADOS':
        return (
          <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 mr-1" />
            Cambios Solicitados
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="w-3.5 h-3.5 mr-1" />
            En Revisión
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Encabezado del Alumno */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{alumno.nombreCompleto}</h1>
            <p className="text-sm text-slate-500">
              Squad: <span className="font-semibold text-slate-700">{alumno.equipo}</span> • Especialidad: <span className="font-semibold text-slate-700">{alumno.especialidad}</span>
            </p>
          </div>
          <div className="w-full sm:w-64">
            <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
              <span>Progreso Global</span>
              <span>{progresoGlobal.porcentaje}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-brand-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progresoGlobal.porcentaje}%` }}
              ></div>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              {progresoGlobal.materialesLeidos} de {progresoGlobal.totalMateriales} recursos estudiados
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Módulos de Aprendizaje */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-brand-600" />
              <span>Módulos de Formación</span>
            </h2>

            <div className="grid grid-cols-1 gap-3">
              {modulos.map((mod: any) => (
                <div
                  key={mod.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-300 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-semibold text-brand-600 tracking-wide uppercase">
                        Módulo {mod.orden}
                      </span>
                      <h3 className="text-base font-bold text-slate-900">{mod.titulo}</h3>
                      {mod.descripcion && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{mod.descripcion}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>{mod.totalMateriales} Materiales didácticos</span>
                    <span>{mod.totalLaboratorios} Laboratorios prácticos</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Entregables Recientes */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <GitPullRequest className="w-5 h-5 text-purple-600" />
              <span>Entregas de Laboratorio</span>
            </h2>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 divide-y divide-slate-100">
              {entregasRecientes.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  Aún no has registrado entregas de laboratorio.
                </p>
              ) : (
                entregasRecientes.map((entrega: any) => (
                  <div key={entrega.id} className="py-3 first:pt-0 last:pb-0 space-y-1.5">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-slate-900">{entrega.laboratorio}</h4>
                      {renderBadgeEstado(entrega.estado)}
                    </div>
                    <p className="text-[11px] text-slate-500">{entrega.modulo}</p>
                    {entrega.calificacion && (
                      <p className="text-xs font-semibold text-slate-800 flex items-center">
                        <Award className="w-3.5 h-3.5 text-amber-500 mr-1" />
                        Nota: {entrega.calificacion} / 10
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
