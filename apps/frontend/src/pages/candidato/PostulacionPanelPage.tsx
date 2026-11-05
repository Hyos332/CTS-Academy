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
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-[#01579B]"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-12 text-center text-critical-700">
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
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Cabecera del Candidato - FUNIBER SD v2.1 Card */}
        <div className="bg-white rounded-lg shadow-2xs border border-[#E0E0E0] p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#757575] block mb-1">
              Portal del Candidato • Convocatoria Oficial
            </span>
            <h1 className="text-2xl font-bold text-[#212121] tracking-tight">{candidato.nombreCompleto}</h1>
            <p className="text-xs text-[#616161] mt-1">
              Convocatoria: <span className="font-semibold text-[#212121]">{candidato.convocatoria}</span> • Sede:{' '}
              <span className="font-semibold text-[#212121]">{candidato.sedeOrigen}</span>
            </p>
          </div>
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#E6EFF5] text-[#01579B] border border-[#CCDDEB]">
              Estado: {candidato.estadoPostulacion}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pruebas Técnicas Asignadas */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#424242] flex items-center space-x-2">
                <FileText className="w-4 h-4 text-[#01579B]" />
                <span>Baterías de Evaluación Oficial</span>
              </h2>
              <span className="text-xs text-[#757575]">Obligatorias para el dictamen del comité</span>
            </div>

            <div className="space-y-3">
              {tests.map((test: any) => (
                <div
                  key={test.id}
                  className="bg-white border border-[#E0E0E0] rounded-lg p-5 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-[#BDBDBD] transition-colors"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-[#212121]">Batería de {test.tipoBateria}</h3>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-[#F5F5F5] text-[#616161] font-medium border border-[#EEEEEE]">
                        {Math.round(test.tiempoLimiteSegundos / 60)} min
                      </span>
                    </div>
                    <p className="text-xs text-[#616161] mt-1.5">
                      Estado:{' '}
                      <span className="font-semibold text-[#212121]">
                        {test.estado === 'COMPLETADO'
                          ? 'Completado'
                          : test.estado === 'EN_CURSO'
                          ? 'En curso'
                          : 'Pendiente de inicio'}
                      </span>
                      {test.tipoBateria === 'TECNICO' &&
                        test.calificacionObtenida !== null &&
                        test.calificacionObtenida !== undefined && (
                          <span className="ml-2 pl-2 border-l border-[#EEEEEE]">
                            Nota Técnica:{' '}
                            <strong className="text-[#01579B]">{Number(test.calificacionObtenida).toFixed(1)} / 10</strong>
                          </span>
                        )}
                      {test.tipoBateria !== 'TECNICO' && test.estado === 'COMPLETADO' && (
                        <span className="ml-2 pl-2 border-l border-[#EEEEEE]">
                          Diagnóstico:{' '}
                          <strong className="text-success-800">Registrado en expediente</strong>
                        </span>
                      )}
                    </p>
                  </div>

                  {test.estado === 'NO_INICIADO' && (
                    <button
                      onClick={() => navigate(`/evaluacion/test/${test.id}`)}
                      className="px-4 py-2 bg-[#01579B] hover:bg-[#004174] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                    >
                      <span>Comenzar Batería</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {test.estado === 'EN_CURSO' && (
                    <button
                      onClick={() => navigate(`/evaluacion/test/${test.id}`)}
                      className="px-4 py-2 bg-high-900 hover:bg-high-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                    >
                      <span>Reanudar Test</span>
                      <Clock className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {test.estado === 'COMPLETADO' && (
                    <span className="inline-flex items-center text-xs text-success-800 font-semibold bg-success-50 px-3 py-1 rounded-lg border border-success-200">
                      <CheckCircle2 className="w-4 h-4 mr-1 text-success-800" />
                      Completada
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Widget de Entrevista */}
            {entrevista && (
              <div className="bg-white border border-[#E0E0E0] rounded-lg p-5 mt-4 shadow-2xs">
                <div className="flex items-start space-x-3.5">
                  <div className="p-2.5 bg-[#E6EFF5] text-[#01579B] rounded-lg border border-[#CCDDEB]">
                    <Video className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#757575]">
                      Fase de Entrevista
                    </span>
                    <h3 className="font-bold text-[#212121] text-sm">Entrevista Técnica Personal</h3>
                    <p className="text-xs text-[#616161] mt-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#01579B]" />
                      {new Date(entrevista.fechaHoraProgramada).toLocaleString()}
                    </p>
                    {entrevista.enlaceGoogleMeet && (
                      <a
                        href={entrevista.enlaceGoogleMeet}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center px-4 py-2 bg-[#01579B] hover:bg-[#004174] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors"
                      >
                        Unirse a Google Meet
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Radar de Competencias */}
          <div className="bg-white rounded-lg shadow-2xs border border-[#E0E0E0] p-6 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#757575] block mb-1">
                Evaluación 360°
              </span>
              <h2 className="text-sm font-bold text-[#212121]">Perfil Multidimensional</h2>
              <p className="text-xs text-[#616161] mt-1">
                Balance computado entre las 3 dimensiones del proceso de admisión.
              </p>
            </div>

            <div className="h-64 w-full my-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#EEEEEE" />
                  <PolarAngleAxis dataKey="dimension" tick={{ fill: '#424242', fontSize: 11, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#E0E0E0" tickCount={5} />
                  <Radar
                    name="Competencia"
                    dataKey="valor"
                    stroke="#01579B"
                    fill="#01579B"
                    fillOpacity={0.25}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-4 border-t border-[#EEEEEE] flex justify-between items-center text-xs text-[#616161]">
              <span>Índice Afinidad Global:</span>
              <span className="font-bold text-sm text-[#01579B]">
                {candidato.perfilCompetencias?.indiceAfinidadGlobal || 80}%
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
