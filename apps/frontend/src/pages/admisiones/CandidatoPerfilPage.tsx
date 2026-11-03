import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Navbar } from '../../components/common/Navbar';
import {
  ArrowLeft,
  Calendar,
  Video,
  FileText,
  UserCheck,
  UserX,
  MessageSquare,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

export const CandidatoPerfilPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [fechaEntrevista, setFechaEntrevista] = useState('');
  const [enlaceMeet, setEnlaceMeet] = useState('');
  const [comentariosEntrevista, setComentariosEntrevista] = useState('');
  const [equipoSeleccionadoId, setEquipoSeleccionadoId] = useState('');
  const [motivoRechazo, setMotivoRechazo] = useState('');

  const [modalEntrevista, setModalEntrevista] = useState(false);
  const [modalAdmitir, setModalAdmitir] = useState(false);
  const [modalRechazar, setModalRechazar] = useState(false);

  // Obtener perfil detallado del candidato
  const { data: candidato, isLoading, error } = useQuery({
    queryKey: ['candidato-perfil', id],
    queryFn: async () => {
      const res = await apiClient.get(`/evaluacion/candidatos/${id}/perfil`);
      return res.data;
    },
  });

  // Obtener lista de equipos para el selector de admisión
  const { data: equiposData } = useQuery({
    queryKey: ['equipos-list'],
    queryFn: async () => {
      const res = await apiClient.get('/equipos/panel-admisiones');
      return res.data?.equipos || [];
    },
  });

  // Mutación: Agendar Google Meet
  const agendarMutation = useMutation({
    mutationFn: async () => {
      return apiClient.post(`/evaluacion/candidatos/${id}/entrevista`, {
        fechaHoraProgramada: new Date(fechaEntrevista).toISOString(),
        enlaceGoogleMeet: enlaceMeet || 'https://meet.google.com/cts-eval-demo',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidato-perfil', id] });
      setModalEntrevista(false);
    },
  });

  // Mutación: Registrar Anotaciones de Entrevista
  const anotacionesMutation = useMutation({
    mutationFn: async () => {
      return apiClient.post(`/evaluacion/candidatos/${id}/entrevista/anotaciones`, {
        conclusiones: comentariosEntrevista,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidato-perfil', id] });
      setComentariosEntrevista('');
    },
  });

  // Mutación: Admitir Alumno Profer
  const admitirMutation = useMutation({
    mutationFn: async () => {
      return apiClient.post(`/evaluacion/candidatos/${id}/admitir`, {
        equipoId: equipoSeleccionadoId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidato-perfil', id] });
      setModalAdmitir(false);
    },
  });

  // Mutación: Rechazar Candidatura
  const rechazarMutation = useMutation({
    mutationFn: async () => {
      return apiClient.post(`/evaluacion/candidatos/${id}/rechazar`, {
        motivo: motivoRechazo,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidato-perfil', id] });
      setModalRechazar(false);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (error || !candidato) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-12 text-center">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Candidato no encontrado</h2>
          <button
            onClick={() => navigate('/admisiones/panel')}
            className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm"
          >
            Volver al Panel de Admisiones
          </button>
        </main>
      </div>
    );
  }

  const radarData = [
    { dimension: 'Actitud', valor: candidato.perfil_competencias?.dimensiones?.actitud?.puntaje || 75 },
    { dimension: 'Aptitud', valor: candidato.perfil_competencias?.dimensiones?.aptitud?.puntaje || 80 },
    { dimension: 'Técnico', valor: candidato.perfil_competencias?.dimensiones?.tecnico?.puntaje || 70 },
  ];

  const yaAdmitido = candidato.estado_postulacion === 'ADMITIDO';
  const yaRechazado = candidato.estado_postulacion === 'RECHAZADO';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Barra superior de navegación y estado */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/admisiones/panel')}
            className="inline-flex items-center space-x-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Panel de Admisiones</span>
          </button>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
              yaAdmitido
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : yaRechazado
                ? 'bg-red-100 text-red-800 border-red-300'
                : 'bg-blue-100 text-blue-800 border-blue-300'
            }`}
          >
            {candidato.estado_postulacion}
          </span>
        </div>

        {/* Ficha Principal del Candidato */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {candidato.usuario?.nombre} {candidato.usuario?.apellidos}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Email: <span className="font-medium text-slate-700">{candidato.usuario?.email}</span> • Sede:{' '}
              <span className="font-medium text-slate-700">{candidato.sede_origen}</span> • Tel:{' '}
              <span className="font-medium text-slate-700">{candidato.telefono || 'N/A'}</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Convocatoria: {candidato.convocatoria?.denominacion}
            </p>
          </div>

          {/* Botones de Acción Editorial / Decisión */}
          {!yaAdmitido && !yaRechazado && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setModalEntrevista(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center space-x-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Agendar Meet</span>
              </button>
              <button
                onClick={() => setModalAdmitir(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center space-x-1.5"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Admitir en Squad</span>
              </button>
              <button
                onClick={() => setModalRechazar(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center space-x-1.5"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Rechazar</span>
              </button>
            </div>
          )}
        </div>

        {/* Sección de 2 Columnas: Radar de Competencias & Tests */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar de Competencias (ADR-013) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-1">
                Radar de Competencias Multidimensional
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Puntajes calculados de la batería técnica, aptitudinal y actitudinal (ADR-013).
              </p>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="dimension" tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
                    <Radar
                      name="Aspirante"
                      dataKey="valor"
                      stroke="#4f46e5"
                      fill="#6366f1"
                      fillOpacity={0.45}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center">
              {radarData.map((d) => (
                <div key={d.dimension} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 block">{d.dimension}</span>
                  <span className="text-lg font-extrabold text-slate-900">{d.valor} pts</span>
                </div>
              ))}
            </div>
          </div>

          {/* Historial de Tests de Admisión */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-brand-600" />
                <span>Baterías de Evaluación Realizadas</span>
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Pruebas técnicas y prácticas asignadas en la convocatoria.
              </p>

              <div className="space-y-3">
                {candidato.tests?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No hay tests registrados.</p>
                ) : (
                  candidato.tests?.map((t: any) => (
                    <div
                      key={t.id}
                      className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex justify-between items-center"
                    >
                      <div>
                        <span className="text-xs font-mono font-semibold text-slate-500">
                          {t.tipo_bateria}
                        </span>
                        <h4 className="font-bold text-slate-800 text-sm">
                          Evaluación Técnica General
                        </h4>
                        <span
                          className={`inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded ${
                            t.estado === 'COMPLETADO'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {t.estado}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Nota</span>
                        <span className="text-xl font-extrabold text-slate-900">
                          {t.calificacion_obtenida !== null ? `${Number(t.calificacion_obtenida).toFixed(1)}/10` : '—'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Entrevista Agendada */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <Video className="w-4 h-4 text-indigo-600" />
                <span>Entrevista Técnica Personal</span>
              </h3>

              {candidato.entrevista ? (
                <div className="bg-indigo-50/80 border border-indigo-200 rounded-xl p-3.5 text-xs text-indigo-950 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">
                      {new Date(candidato.entrevista.fecha_hora_programada).toLocaleString()}
                    </p>
                    <p className="text-indigo-600">Estado: {candidato.entrevista.estado}</p>
                  </div>
                  <a
                    href={candidato.entrevista.enlace_google_meet}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-sm"
                  >
                    Abrir Meet
                  </a>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No se ha agendado entrevista aún.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sección de Anotaciones Cualitativas del Gestor */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-amber-600" />
            <span>Anotaciones y Conclusiones de Selección</span>
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Observaciones confidenciales del Gestor durante la entrevista para fundamentar la asignación al squad.
          </p>

          <div className="space-y-4">
            <textarea
              rows={3}
              value={comentariosEntrevista}
              onChange={(e) => setComentariosEntrevista(e.target.value)}
              placeholder="Registrar notas cualitativas (ej. perfil proactivo, fuerte en TypeScript, afinidad con Team Fénix)..."
              className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
            <div className="flex justify-end">
              <button
                onClick={() => anotacionesMutation.mutate()}
                disabled={!comentariosEntrevista.trim() || anotacionesMutation.isPending}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                Guardar Anotación
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modal: Agendar Google Meet */}
      {modalEntrevista && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Agendar Entrevista Técnica</h3>
            <p className="text-xs text-slate-500">
              Programa la sesión por Google Meet con el candidato.
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Fecha y Hora</label>
              <input
                type="datetime-local"
                value={fechaEntrevista}
                onChange={(e) => setFechaEntrevista(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Enlace de Google Meet</label>
              <input
                type="url"
                value={enlaceMeet}
                onChange={(e) => setEnlaceMeet(e.target.value)}
                placeholder="https://meet.google.com/xyz-abcd-efg"
                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setModalEntrevista(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => agendarMutation.mutate()}
                disabled={!fechaEntrevista || agendarMutation.isPending}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold"
              >
                Agendar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Admitir en Squad */}
      {modalAdmitir && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Admitir Aspirante al Programa PROFER</h3>
            <p className="text-xs text-slate-500">
              Selecciona el equipo de desarrollo (squad) al que se incorporará el alumno.
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Equipo de Destino</label>
              <select
                value={equipoSeleccionadoId}
                onChange={(e) => setEquipoSeleccionadoId(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="">-- Selecciona un equipo --</option>
                {equiposData?.map((eq: any) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.codigo} - {eq.nombre} ({eq.especialidad})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setModalAdmitir(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => admitirMutation.mutate()}
                disabled={!equipoSeleccionadoId || admitirMutation.isPending}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold"
              >
                Confirmar Admisión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Rechazar Candidatura */}
      {modalRechazar && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Rechazar Candidatura</h3>
            <p className="text-xs text-slate-500">
              Indica la justificación de la decisión para registro interno de auditoría.
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Motivo del Rechazo</label>
              <textarea
                rows={3}
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
                placeholder="No alcanza el umbral de conocimientos prácticos en TypeScript..."
                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setModalRechazar(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => rechazarMutation.mutate()}
                disabled={!motivoRechazo || rechazarMutation.isPending}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidatoPerfilPage;
