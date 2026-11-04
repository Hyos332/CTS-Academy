import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Navbar } from '../../components/common/Navbar';
import {
  Users,
  ShieldAlert,
  Lock,
  ChevronRight,
  Video,
  FileText,
  UserPlus,
  ChevronDown,
  ChevronUp,
  ArrowRightLeft,
  UserCheck,
  Clock,
  Mail,
  CheckCircle2,
} from 'lucide-react';
import { InvitacionCandidatoModal } from '../../components/admisiones/InvitacionCandidatoModal';

export const AdmisionesPanelPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [motivoCierre, setMotivoCierre] = useState('');

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoApellidos, setNuevoApellidos] = useState('');
  const [nuevoEmail, setNuevoEmail] = useState('');
  const [nuevaSede, setNuevaSede] = useState('SDR_ESP');
  const [nuevoTelefono, setNuevoTelefono] = useState('');
  const [enviarInvitacionInmediata, setEnviarInvitacionInmediata] = useState(true);

  const [candidatoParaInvitacion, setCandidatoParaInvitacion] = useState<{
    id: string;
    nombre: string;
    email: string;
  } | null>(null);

  // Estados para ver miembros y movilidad entre squads (Requirements 3 y 4)
  const [squadsExpandidos, setSquadsExpandidos] = useState<Record<string, boolean>>({});
  const [alumnoParaTransferir, setAlumnoParaTransferir] = useState<{
    id: string;
    nombreCompleto: string;
    email: string;
    squadActualId?: string | null;
    squadActualNombre?: string;
  } | null>(null);
  const [squadDestinoId, setSquadDestinoId] = useState<string>('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['admisiones-panel'],
    queryFn: async () => {
      const res = await apiClient.get('/equipos/panel-admisiones');
      return res.data;
    },
  });

  const registrarCandidatoMutation = useMutation({
    mutationFn: async (convocatoriaId?: string) => {
      return apiClient.post('/evaluacion/candidatos', {
        nombre: nuevoNombre,
        apellidos: nuevoApellidos,
        email: nuevoEmail,
        sedeOrigen: nuevaSede,
        telefono: nuevoTelefono || undefined,
        convocatoriaId,
        enviarInvitacionInmediata,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admisiones-panel'] });
      setShowRegisterModal(false);
      setNuevoNombre('');
      setNuevoApellidos('');
      setNuevoEmail('');
      setNuevoTelefono('');
      setEnviarInvitacionInmediata(true);
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

  // Mutación: Transferir o reasignar alumno entre squads (Requirement 4)
  const transferirAlumnoMutation = useMutation({
    mutationFn: async () => {
      if (!alumnoParaTransferir) return;
      return apiClient.put(`/equipos/alumnos/${alumnoParaTransferir.id}/squad`, {
        equipoId: squadDestinoId || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admisiones-panel'] });
      setAlumnoParaTransferir(null);
      setSquadDestinoId('');
    },
  });

  const toggleExpandirSquad = (squadId: string) => {
    setSquadsExpandidos((prev) => ({
      ...prev,
      [squadId]: !prev[squadId],
    }));
  };

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

  const { convocatoriaActiva, metricasPostulacion, equipos, candidatos, alumnosSinEquipo } = data;

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
              Semestre:{' '}
              <span className="font-semibold text-slate-700">{convocatoriaActiva?.semestre || 'N/A'}</span> • Modelo:{' '}
              <span className="font-semibold text-slate-700">{convocatoriaActiva?.modeloAdmision || 'N/A'}</span>
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

        {/* SECCIÓN ALUMNOS ADMITIDOS PENDIENTES DE SQUAD (Requirement 1: Incorporación diferida) */}
        {alumnosSinEquipo && alumnosSinEquipo.length > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-sm">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-amber-950 text-base flex items-center space-x-2">
                    <span>Alumnos PROFER Admitidos (Asignación de Squad Diferida)</span>
                    <span className="text-xs font-extrabold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                      {alumnosSinEquipo.length} pendientes
                    </span>
                  </h3>
                  <p className="text-xs text-amber-800">
                    Estudiantes a los que se les dio el &quot;SÍ&quot; para el programa, pendientes de vincular formalmente a uno de los 6 squads para su incorporación.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-amber-200 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-amber-100/60 text-[11px] font-bold uppercase tracking-wider text-amber-900 border-b border-amber-200">
                    <tr>
                      <th className="px-5 py-3">Alumno PROFER</th>
                      <th className="px-5 py-3">Correo Institucional</th>
                      <th className="px-5 py-3">Fecha de Admisión</th>
                      <th className="px-5 py-3 text-right">Acción de Asignación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100">
                    {alumnosSinEquipo.map((alumno: any) => (
                      <tr key={alumno.id} className="hover:bg-amber-50/50 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-slate-900">
                          {alumno.nombreCompleto}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs text-slate-600">
                          {alumno.email}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-500">
                          {new Date(alumno.creadoEn).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => {
                              setAlumnoParaTransferir({
                                id: alumno.id,
                                nombreCompleto: alumno.nombreCompleto,
                                email: alumno.email,
                                squadActualId: null,
                                squadActualNombre: 'Sin Squad Asignado',
                              });
                              setSquadDestinoId(equipos?.[0]?.id || '');
                            }}
                            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors inline-flex items-center space-x-1.5"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Asignar a Squad</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tabla de Postulantes Activos */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-brand-600" />
                <span>Aspirantes en Convocatoria Activa</span>
              </h2>
              <p className="text-xs text-slate-500">
                Total: {candidatos?.length || 0} candidatos registrados en el embudo
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowRegisterModal(true)}
                className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center space-x-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>Inscribir Aspirante</span>
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Candidato</th>
                    <th className="px-6 py-3.5">Sede</th>
                    <th className="px-6 py-3.5">Estado Postulación</th>
                    <th className="px-6 py-3.5">Invitación y Credenciales</th>
                    <th className="px-6 py-3.5">Batería Técnica</th>
                    <th className="px-6 py-3.5">Entrevista Meet</th>
                    <th className="px-6 py-3.5 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {candidatos?.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-xs text-slate-400 italic">
                        No hay candidatos registrados para la convocatoria activa.
                      </td>
                    </tr>
                  ) : (
                    candidatos?.map((cand: any) => {
                      const testTecnico = cand.tests?.find((t: any) => t.tipoBateria === 'TECNICO') || cand.tests?.[0];
                      const tieneMeet = Boolean(cand.entrevista);
                      const invitacionEnviada = Boolean(
                        cand.invitacionEnviada || cand.perfilCompetencias?.invitacion?.enviada,
                      );

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

                          {/* Invitación y Credenciales */}
                          <td className="px-6 py-4">
                            <button
                              onClick={() =>
                                setCandidatoParaInvitacion({
                                  id: cand.id,
                                  nombre: cand.nombreCompleto,
                                  email: cand.email,
                                })
                              }
                              className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                                invitacionEnviada
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                              }`}
                              title={
                                invitacionEnviada
                                  ? 'Invitación enviada - Haz clic para ver credenciales o reenviar'
                                  : 'Haz clic para ver credenciales y enviar correo'
                              }
                            >
                              {invitacionEnviada ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Enviada</span>
                                </>
                              ) : (
                                <>
                                  <Mail className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Enviar Credenciales</span>
                                </>
                              )}
                            </button>
                          </td>

                          <td className="px-6 py-4">
                            {testTecnico ? (
                              <div className="text-xs">
                                <span className="font-semibold text-slate-800">
                                  {testTecnico.calificacion !== null
                                    ? `${Number(testTecnico.calificacion).toFixed(1)} / 10`
                                    : 'Sin calificar'}
                                </span>
                                <span className="text-[10px] text-slate-400 block font-mono">
                                  {testTecnico.estado}
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

        {/* SQUADS, MIEMBROS Y MOVILIDAD (Requirements 3 y 4: Visibilidad de miembros y transferencia) */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <Users className="w-5 h-5 text-brand-600" />
                <span>Equipos de Desarrollo CTS y Miembros Activos</span>
              </h2>
              <p className="text-xs text-slate-500">
                Visualización integral de los 6 squads y gestión de movilidad de alumnos durante su estancia en el programa.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {equipos?.map((eq: any) => {
              const estaExpandido = Boolean(squadsExpandidos[eq.id]);
              const miembros = eq.miembros || [];

              return (
                <div
                  key={eq.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div>
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
                        <span className="text-[10px] text-slate-400 block font-medium">alumnos</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 flex justify-between items-center">
                      <span>
                        Tech Leader: <strong>{eq.lider}</strong>
                      </span>
                      <button
                        onClick={() => toggleExpandirSquad(eq.id)}
                        className="text-xs font-semibold text-brand-600 hover:text-brand-800 inline-flex items-center space-x-1"
                      >
                        <span>Miembros ({miembros.length})</span>
                        {estaExpandido ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Lista desplegable de miembros del squad */}
                    {estaExpandido && (
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                        {miembros.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">No hay alumnos asignados a este squad actualmente.</p>
                        ) : (
                          miembros.map((m: any) => (
                            <div
                              key={m.id}
                              className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                            >
                              <div>
                                <span className="font-bold text-slate-800 block">{m.nombreCompleto}</span>
                                <span className="text-[11px] text-slate-400 font-mono">{m.email}</span>
                              </div>
                              <button
                                onClick={() => {
                                  setAlumnoParaTransferir({
                                    id: m.id,
                                    nombreCompleto: m.nombreCompleto,
                                    email: m.email,
                                    squadActualId: eq.id,
                                    squadActualNombre: eq.nombre,
                                  });
                                  setSquadDestinoId('');
                                }}
                                title="Cambiar a otro squad"
                                className="p-1.5 bg-white hover:bg-brand-50 text-slate-600 hover:text-brand-700 border border-slate-200 rounded-lg shadow-2xs transition-colors inline-flex items-center space-x-1"
                              >
                                <ArrowRightLeft className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-semibold">Mover</span>
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal de Movilidad de Alumnos entre Squads (Requirement 4) */}
        {alumnoParaTransferir && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-100">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Reasignar Alumno de Squad</h3>
                  <p className="text-xs text-slate-500">Gestión de movilidad durante la estancia en el programa.</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <p className="text-slate-500">Alumno seleccionado:</p>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{alumnoParaTransferir.nombreCompleto}</p>
                  <p className="text-slate-500 font-mono text-[11px]">{alumnoParaTransferir.email}</p>
                  <p className="mt-2 text-slate-600">
                    Squad actual: <strong className="text-brand-600">{alumnoParaTransferir.squadActualNombre || 'Sin Squad Asignado'}</strong>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nuevo Squad de Destino
                  </label>
                  <select
                    value={squadDestinoId}
                    onChange={(e) => setSquadDestinoId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="">-- Dejar sin asignar (Incorporación diferida) --</option>
                    {equipos
                      ?.filter((eq: any) => eq.id !== alumnoParaTransferir.squadActualId)
                      .map((eq: any) => (
                        <option key={eq.id} value={eq.id}>
                          {eq.codigo} - {eq.nombre} ({eq.especialidad})
                        </option>
                      ))}
                  </select>
                </div>

                <p className="text-[11px] text-slate-500 italic">
                  El alumno mantendrá todo su historial de entregas de laboratorios y su rol activo de ALUMNO PROFER.
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setAlumnoParaTransferir(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => transferirAlumnoMutation.mutate()}
                  disabled={transferirAlumnoMutation.isPending}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  {transferirAlumnoMutation.isPending ? 'Guardando...' : 'Confirmar Reasignación'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Registro de Nuevo Candidato */}
        {showRegisterModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-100">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Inscribir Nuevo Postulante</h3>
                  <p className="text-xs text-slate-500">Asocia un aspirante a la convocatoria activa.</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre</label>
                    <input
                      type="text"
                      value={nuevoNombre}
                      onChange={(e) => setNuevoNombre(e.target.value)}
                      placeholder="Ej. Ana"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Apellidos</label>
                    <input
                      type="text"
                      value={nuevoApellidos}
                      onChange={(e) => setNuevoApellidos(e.target.value)}
                      placeholder="Ej. García López"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Correo Institucional / Personal</label>
                  <input
                    type="email"
                    value={nuevoEmail}
                    onChange={(e) => setNuevoEmail(e.target.value)}
                    placeholder="ana.garcia@alumnos.uneatlantico.es"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Sede de Origen</label>
                    <select
                      value={nuevaSede}
                      onChange={(e) => setNuevaSede(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    >
                      <option value="SDR_ESP">Santander (España)</option>
                      <option value="COL_BOG">Bogotá (Colombia)</option>
                      <option value="MEX_CDMX">Ciudad de México</option>
                      <option value="GTM_GUA">Guatemala</option>
                      <option value="PER_LIM">Lima (Perú)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono</label>
                    <input
                      type="tel"
                      value={nuevoTelefono}
                      onChange={(e) => setNuevoTelefono(e.target.value)}
                      placeholder="+34600000000"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Opción de envío inmediato de credenciales */}
                <div className="p-3 bg-indigo-50/70 border border-indigo-200/60 rounded-xl space-y-1.5">
                  <label className="flex items-center space-x-2 text-xs font-semibold text-indigo-950 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enviarInvitacionInmediata}
                      onChange={(e) => setEnviarInvitacionInmediata(e.target.checked)}
                      className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span>Enviar credenciales de acceso e invitación por correo de inmediato</span>
                  </label>
                  <p className="text-[11px] text-slate-500 pl-6">
                    Se despachará el enlace al portal con la contraseña temporal (CtsAcademy2026!) y las instrucciones para realizar las pruebas.
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => registrarCandidatoMutation.mutate(convocatoriaActiva?.id)}
                  disabled={!nuevoNombre.trim() || !nuevoApellidos.trim() || !nuevoEmail.trim() || registrarCandidatoMutation.isPending}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  {registrarCandidatoMutation.isPending ? 'Registrando...' : 'Inscribir Aspirante'}
                </button>
              </div>
            </div>
          </div>
        )}

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

        {/* Modal: Credenciales e Invitación Oficial al Postulante */}
        {candidatoParaInvitacion && (
          <InvitacionCandidatoModal
            candidatoId={candidatoParaInvitacion.id}
            candidatoNombre={candidatoParaInvitacion.nombre}
            candidatoEmail={candidatoParaInvitacion.email}
            isOpen={Boolean(candidatoParaInvitacion)}
            onClose={() => setCandidatoParaInvitacion(null)}
          />
        )}
      </main>
    </div>
  );
};

export default AdmisionesPanelPage;
