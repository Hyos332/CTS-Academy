import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Navbar } from '../../components/common/Navbar';
import { CheckCircle2, Clock, Calendar, Video, FileText, ArrowRight } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export const PostulacionPanelPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery({
    queryKey: ['candidato-panel'],
    queryFn: async () => {
      const res = await apiClient.get('/evaluacion/candidatos/panel');
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
          Error al cargar los datos del panel de postulación.
        </main>
      </div>
    );
  }

  const { candidato, tests, entrevista } = data;

  const radarData = [
    { dimension: 'Actitud', valor: candidato.perfilCompetencias?.dimensiones?.actitud?.puntaje || 75 },
    { dimension: 'Aptitud', valor: candidato.perfilCompetencias?.dimensiones?.aptitud?.puntaje || 80 },
    { dimension: 'Técnico', valor: candidato.perfilCompetencias?.dimensiones?.tecnico?.puntaje || 85 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Cabecera del Candidato */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{candidato.nombreCompleto}</h1>
            <p className="text-sm text-slate-500">
              Convocatoria: <span className="font-medium text-slate-700">{candidato.convocatoria}</span> • Sede: <span className="font-medium text-slate-700">{candidato.sedeOrigen}</span>
            </p>
          </div>
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
              Estado: {candidato.estadoPostulacion}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pruebas Técnicas Asignadas */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-brand-600" />
              <span>Baterías de Evaluación</span>
            </h2>

            <div className="space-y-3">
              {tests.map((test: any) => (
                <div
                  key={test.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-300 transition-colors"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-slate-900">Batería de {test.tipoBateria}</h3>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        {Math.round(test.tiempoLimiteSegundos / 60)} min
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Estado: <span className="font-medium text-slate-700">{test.estado}</span>
                      {test.calificacionObtenida && (
                        <span> • Calificación: <strong>{test.calificacionObtenida} / 10</strong></span>
                      )}
                    </p>
                  </div>

                  {test.estado === 'NO_INICIADO' && (
                    <button
                      onClick={() => navigate(`/evaluacion/test/${test.id}`)}
                      className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium rounded-lg shadow-sm transition-colors flex items-center space-x-1"
                    >
                      <span>Comenzar Test</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {test.estado === 'EN_CURSO' && (
                    <button
                      onClick={() => navigate(`/evaluacion/test/${test.id}`)}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-lg shadow-sm transition-colors flex items-center space-x-1"
                    >
                      <span>Reanudar Test</span>
                      <Clock className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {test.estado === 'COMPLETADO' && (
                    <span className="inline-flex items-center text-xs text-emerald-600 font-medium bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Completado
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Widget de Entrevista */}
            {entrevista && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 mt-6">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-indigo-600 text-white rounded-lg">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-indigo-950">Entrevista Técnica Personal</h3>
                    <p className="text-xs text-indigo-700 mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(entrevista.fechaHoraProgramada).toLocaleString()}
                    </p>
                    <a
                      href={entrevista.enlaceGoogleMeet}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg shadow-sm transition-colors"
                    >
                      Unirse a Google Meet
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Radar de Competencias */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Perfil Multidimensional</h2>
            <p className="text-xs text-slate-500 mb-4">
              Radar de evaluación computado sobre las 3 dimensiones de admisión.
            </p>

            <div className="h-64 w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="dimension" tick={{ fill: '#475569', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
                  <Radar
                    name="Competencia"
                    dataKey="valor"
                    stroke="#2563eb"
                    fill="#3b82f6"
                    fillOpacity={0.5}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-xs text-slate-600">
              <span>Índice Afinidad Global:</span>
              <strong className="text-slate-900">
                {candidato.perfilCompetencias?.indiceAfinidadGlobal || 80}%
              </strong>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
