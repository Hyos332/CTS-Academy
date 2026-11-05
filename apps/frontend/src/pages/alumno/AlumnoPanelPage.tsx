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
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#01579B] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-[#616161]">Cargando Panel de Alumno...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-12 text-center text-[#D32F2F] text-sm">
          Error al cargar los datos del panel de alumno. Por favor, recarga la página.
        </main>
      </div>
    );
  }

  const { alumno, progresoGlobal, modulos, entregasRecientes } = data;

  const renderBadgeEstado = (estado: string) => {
    switch (estado) {
      case 'APROBADO':
        return (
          <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded bg-[#E8F5E9] text-[#1B5E20] border border-[#C8E6C9] uppercase tracking-wider">
            <CheckCircle className="w-3 h-3 mr-1 text-[#2E7D32]" />
            Aprobado
          </span>
        );
      case 'CAMBIOS_SOLICITADOS':
        return (
          <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2] uppercase tracking-wider">
            <AlertTriangle className="w-3 h-3 mr-1 text-[#F57C00]" />
            Cambios Solicitados
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded bg-[#E6EFF5] text-[#01579B] border border-[#CCDDEB] uppercase tracking-wider">
            <Clock className="w-3 h-3 mr-1 text-[#01579B]" />
            En Revisión
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans text-[#212121]">
      <Navbar />

      <main className="w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 space-y-6">
        {/* Encabezado del Alumno */}
        <div className="bg-white rounded-lg shadow-xs border border-[#E0E0E0] p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#212121] tracking-tight">{alumno.nombreCompleto}</h1>
            <p className="text-xs text-[#757575] mt-1">
              Squad: <span className="font-semibold text-[#01579B]">{alumno.equipo}</span> • Especialidad: <span className="font-semibold text-[#424242]">{alumno.especialidad}</span>
            </p>
          </div>
          <div className="w-full sm:w-64">
            <div className="flex justify-between text-xs font-semibold text-[#616161] mb-1">
              <span>Progreso Global</span>
              <span className="font-mono text-[#01579B] font-bold">{progresoGlobal.porcentaje}%</span>
            </div>
            <div className="w-full bg-[#EEEEEE] rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#01579B] h-2 rounded-full transition-all duration-500"
                style={{ width: `${progresoGlobal.porcentaje}%` }}
              />
            </div>
            <span className="text-[11px] text-[#757575] mt-1 block">
              {progresoGlobal.materialesLeidos} de {progresoGlobal.totalMateriales} recursos estudiados
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Módulos de Aprendizaje */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-base font-bold text-[#212121] flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-[#01579B]" />
              <span>Módulos de Formación</span>
            </h2>

            <div className="grid grid-cols-1 gap-3">
              {modulos.map((mod: any) => (
                <div
                  key={mod.id}
                  className="bg-white border border-[#E0E0E0] rounded-lg p-5 shadow-xs hover:border-[#CCDDEB] transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-[#01579B] tracking-wider uppercase">
                        Módulo {mod.orden}
                      </span>
                      <h3 className="text-sm font-bold text-[#212121] mt-0.5">{mod.titulo}</h3>
                      {mod.descripcion && (
                        <p className="text-xs text-[#616161] mt-1 line-clamp-2">{mod.descripcion}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#EEEEEE] flex items-center justify-between text-xs text-[#757575]">
                    <span>{mod.totalMateriales} Materiales didácticos</span>
                    <span>{mod.totalLaboratorios} Laboratorios prácticos</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Entregables Recientes */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-[#212121] flex items-center space-x-2">
              <GitPullRequest className="w-4 h-4 text-[#01579B]" />
              <span>Entregas de Laboratorio</span>
            </h2>

            <div className="bg-white rounded-lg shadow-xs border border-[#E0E0E0] p-4 divide-y divide-[#EEEEEE]">
              {entregasRecientes.length === 0 ? (
                <p className="text-xs text-[#757575] py-4 text-center italic">
                  Aún no has registrado entregas de laboratorio.
                </p>
              ) : (
                entregasRecientes.map((entrega: any) => (
                  <div key={entrega.id} className="py-3 first:pt-0 last:pb-0 space-y-1.5">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-[#212121]">{entrega.laboratorio}</h4>
                      {renderBadgeEstado(entrega.estado)}
                    </div>
                    <p className="text-[11px] text-[#757575]">{entrega.modulo}</p>
                    {entrega.calificacion && (
                      <p className="text-xs font-semibold text-[#424242] flex items-center">
                        <Award className="w-3.5 h-3.5 text-[#F57C00] mr-1" />
                        Nota: <strong className="ml-1 text-[#212121]">{entrega.calificacion} / 10</strong>
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

export default AlumnoPanelPage;
