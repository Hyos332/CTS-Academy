import React, { useState, useMemo } from 'react';
import {
  Printer,
  Terminal,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Server,
  Layout,
  Code,
  X,
  FileDown,
} from 'lucide-react';

export interface PreguntaTecnicaCTSItem {
  codigo: string;
  categoria: 'GENERAL' | 'FRONT-END' | 'BACK-END' | 'SYSADMIN';
  enunciado: string;
  respuestaCandidato?: string;
  estado: 'CORRECTA' | 'INCORRECTA' | 'OMITIDA';
  comentario?: string;
}

export interface InformePruebaTecnicaCTS {
  idRespuesta: number | string;
  fechaEnvio: string;
  fechaInicio: string;
  fechaUltimaAccion: string;
  nombreCandidato: string;
  apellidosCandidato?: string;
  emailCandidato: string;
  sede: string;
  convocatoria: string;
  puntuacionesPorArea: {
    general: number;
    frontend: number;
    backend: number;
    sysadmin: number;
    globalSobre10: number;
  };
  squadRecomendado: {
    codigo: string;
    nombre: string;
    especialidad: string;
    lider: string;
    afinidadPorcentaje: number;
    justificacion: string;
    fortalezasClave: string[];
  };
  preguntas: PreguntaTecnicaCTSItem[];
}

interface ReportePruebaTecnicaViewProps {
  informe: InformePruebaTecnicaCTS;
}

export const ReportePruebaTecnicaView: React.FC<ReportePruebaTecnicaViewProps> = ({ informe }) => {
  const [modalImprimir, setModalImprimir] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODAS');
  const [filtroEstado, setFiltroEstado] = useState<string>('TODAS');
  const [busqueda, setBusqueda] = useState<string>('');
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const itemsPorPagina = 15;

  const handlePrint = () => {
    window.print();
  };

  const preguntas = informe.preguntas || [];
  const squad = informe.squadRecomendado || {
    codigo: 'TEAM-01',
    nombre: 'Fénix',
    especialidad: 'Desarrollo de aplicaciones web internas y proyectos europeos',
    lider: 'Diego Moys (Tech Lead)',
    afinidadPorcentaje: 88,
    justificacion:
      'Solidez destacada en desarrollo de aplicaciones web, APIs RESTful con PHP/Laravel y frontend con React/Vue. Encaja de forma óptima en el stack de Fénix.',
    fortalezasClave: ['Laravel & PHP', 'React & Vue', 'MySQL / PostgreSQL'],
  };

  const puntuaciones = informe.puntuacionesPorArea || {
    general: 30,
    frontend: 65,
    backend: 85,
    sysadmin: 60,
    globalSobre10: 8.2,
  };

  // Filtrado de preguntas
  const preguntasFiltradas = useMemo(() => {
    return preguntas.filter((p) => {
      if (filtroCategoria !== 'TODAS' && p.categoria !== filtroCategoria) return false;
      if (filtroEstado !== 'TODAS' && p.estado !== filtroEstado) return false;
      if (busqueda.trim() !== '') {
        const query = busqueda.toLowerCase();
        const coincideCodigo = p.codigo.toLowerCase().includes(query);
        const coincideEnunciado = p.enunciado.toLowerCase().includes(query);
        const coincideRespuesta = (p.respuestaCandidato || '').toLowerCase().includes(query);
        if (!coincideCodigo && !coincideEnunciado && !coincideRespuesta) return false;
      }
      return true;
    });
  }, [preguntas, filtroCategoria, filtroEstado, busqueda]);

  // Paginación
  const totalPaginas = Math.ceil(preguntasFiltradas.length / itemsPorPagina) || 1;
  const preguntasPaginadas = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    return preguntasFiltradas.slice(inicio, inicio + itemsPorPagina);
  }, [preguntasFiltradas, paginaActual, itemsPorPagina]);

  const totalCorrectas = preguntas.filter((p) => p.estado === 'CORRECTA').length;
  const totalIncorrectas = preguntas.filter((p) => p.estado === 'INCORRECTA').length;
  const totalOmitidas = preguntas.filter((p) => p.estado === 'OMITIDA').length;

  const renderBadgeEstado = (estado: string) => {
    switch (estado) {
      case 'CORRECTA':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Correcta</span>
          </span>
        );
      case 'INCORRECTA':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-300">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            <span>Incorrecta</span>
          </span>
        );
      case 'OMITIDA':
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <MinusCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>Omitida</span>
          </span>
        );
    }
  };

  // Documento Imprimible Oficial (Horizontal Landscape)
  const renderDocumentoImprimible = () => (
    <div className="w-full bg-white text-slate-900 p-6 print:p-0">
      {/* 1. ENCABEZADO INSTITUCIONAL OFICIAL */}
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm tracking-wider shadow-xs">
            CTS
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-slate-900 uppercase">
              CTS Academy • Prueba Técnica CTS Evaluación
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              Universidad Europea del Atlántico • Informe de Competencias Técnicas y Encaje en Squad
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white">
            Evaluación Técnica Oficial
          </div>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">
            ID de respuesta: <strong className="text-slate-900">{informe.idRespuesta}</strong>
          </p>
        </div>
      </div>

      {/* 2. METADATOS LIMESURVEY Y DATOS DEL CANDIDATO */}
      <div className="grid grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 mt-3 text-xs">
        <div>
          <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
            Candidato Evaluado
          </span>
          <span className="font-extrabold text-slate-900">
            {informe.nombreCandidato} {informe.apellidosCandidato || ''}
          </span>
          <span className="block text-[11px] text-slate-500 truncate">{informe.emailCandidato}</span>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
            Sede & Convocatoria
          </span>
          <span className="font-bold text-slate-800">{informe.sede}</span>
          <span className="block text-[11px] text-slate-500 truncate">{informe.convocatoria}</span>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
            Fechas de Sesión
          </span>
          <span className="text-[11px] text-slate-700 block">
            <strong>Inicio:</strong> {informe.fechaInicio}
          </span>
          <span className="text-[11px] text-slate-700 block">
            <strong>Envío:</strong> {informe.fechaEnvio}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
            Última Acción & Estado
          </span>
          <span className="text-[11px] text-slate-700 block">{informe.fechaUltimaAccion}</span>
          <span className="inline-block mt-0.5 px-2 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
            COMPLETADA
          </span>
        </div>
      </div>

      {/* 3. RESUMEN DE PUNTUACIÓN POR ÁREAS Y SQUAD RECOMENDADO (LADO A LADO) */}
      <div className="grid grid-cols-12 gap-4 mt-3">
        {/* Tabla de 4 Áreas Técnicas */}
        <div className="col-span-5 bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Puntuaciones por Área Técnica
              </span>
              <span className="text-xs font-black text-brand-600">
                Global: {puntuaciones.globalSobre10.toFixed(1)} / 10
              </span>
            </div>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-y border-slate-200">
                  <th className="py-1.5 px-2">Área</th>
                  <th className="py-1.5 px-2 text-right">Porcentaje</th>
                  <th className="py-1.5 px-2 text-center">Nivel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                <tr>
                  <td className="py-1.5 px-2 font-bold text-slate-800 flex items-center space-x-1.5">
                    <Code className="w-3.5 h-3.5 text-blue-600" />
                    <span>GENERAL (POO, Async)</span>
                  </td>
                  <td className="py-1.5 px-2 text-right font-black text-blue-700">
                    {puntuaciones.general.toFixed(1)}%
                  </td>
                  <td className="py-1.5 px-2 text-center">
                    <span className="text-[10px] font-semibold text-slate-500">
                      {puntuaciones.general >= 70 ? 'Alto' : puntuaciones.general >= 50 ? 'Medio' : 'Inicial'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-1.5 px-2 font-bold text-slate-800 flex items-center space-x-1.5">
                    <Layout className="w-3.5 h-3.5 text-cyan-600" />
                    <span>FRONT-END (React, CSS, JS)</span>
                  </td>
                  <td className="py-1.5 px-2 text-right font-black text-cyan-700">
                    {puntuaciones.frontend.toFixed(1)}%
                  </td>
                  <td className="py-1.5 px-2 text-center">
                    <span className="text-[10px] font-semibold text-slate-500">
                      {puntuaciones.frontend >= 70 ? 'Alto' : puntuaciones.frontend >= 50 ? 'Medio' : 'Inicial'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-1.5 px-2 font-bold text-slate-800 flex items-center space-x-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-600" />
                    <span>BACK-END (APIs, SQL, Capas)</span>
                  </td>
                  <td className="py-1.5 px-2 text-right font-black text-purple-700">
                    {puntuaciones.backend.toFixed(1)}%
                  </td>
                  <td className="py-1.5 px-2 text-center">
                    <span className="text-[10px] font-semibold text-slate-500">
                      {puntuaciones.backend >= 70 ? 'Alto' : puntuaciones.backend >= 50 ? 'Medio' : 'Inicial'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-1.5 px-2 font-bold text-slate-800 flex items-center space-x-1.5">
                    <Server className="w-3.5 h-3.5 text-emerald-600" />
                    <span>SYSADMIN (Linux, Docker)</span>
                  </td>
                  <td className="py-1.5 px-2 text-right font-black text-emerald-700">
                    {puntuaciones.sysadmin.toFixed(1)}%
                  </td>
                  <td className="py-1.5 px-2 text-center">
                    <span className="text-[10px] font-semibold text-slate-500">
                      {puntuaciones.sysadmin >= 70 ? 'Alto' : puntuaciones.sysadmin >= 50 ? 'Medio' : 'Inicial'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 border-t border-slate-100">
            <span>Total reactivos: <strong>{preguntas.length}</strong></span>
            <span>Correctas: <strong className="text-emerald-600">{totalCorrectas}</strong></span>
            <span>Incorrectas: <strong className="text-red-600">{totalIncorrectas}</strong></span>
            <span>Omitidas: <strong className="text-slate-600">{totalOmitidas}</strong></span>
          </div>
        </div>

        {/* Sección Destacada: Squad Recomendado ("En qué equipo encaja mejor") */}
        <div className="col-span-7 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl p-3.5 flex flex-col justify-between shadow-sm border border-indigo-400/20">
          <div>
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-indigo-300" />
                  <span>Equipo en el que encaja mejor</span>
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {squad.codigo}
                </span>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black text-emerald-400 leading-none">
                  {squad.afinidadPorcentaje}%
                </span>
                <span className="block text-[9px] uppercase font-bold text-slate-300 tracking-wider">
                  Afinidad Técnica
                </span>
              </div>
            </div>

            <div className="mt-2">
              <h3 className="text-lg font-black text-white">{squad.nombre}</h3>
              <p className="text-xs text-indigo-200 font-medium">
                {squad.especialidad} • <span className="text-slate-300">Líder: {squad.lider}</span>
              </p>
              <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed bg-white/5 p-2 rounded-lg border border-white/10">
                {squad.justificacion}
              </p>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Fortalezas Clave:
            </span>
            <div className="flex flex-wrap gap-1">
              {squad.fortalezasClave?.map((f, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-200 border border-indigo-400/30"
                >
                  ✓ {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. TABLA DETALLADA DE PREGUNTAS Y RESPUESTAS TÉCNICAS */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-1.5">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
            Desglose de Reactivos Técnicos Oficiales ({preguntas.length} preguntas)
          </h4>
          <span className="text-[10px] text-slate-500">
            Formato oficial CTS con validación de código, respuesta y estado
          </span>
        </div>

        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-y border-slate-200">
              <th className="py-2 px-2 text-center w-12">R</th>
              <th className="py-2 px-2 text-center w-20">Código</th>
              <th className="py-2 px-2 w-24">Área</th>
              <th className="py-2 px-3 w-1/2">Pregunta</th>
              <th className="py-2 px-3">Respuesta Registrada del Candidato</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[11px]">
            {preguntas.map((p, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80 page-break-inside-avoid">
                <td className="py-1.5 px-2 text-center font-bold">
                  {p.estado === 'CORRECTA' && <span className="text-emerald-600 font-black">✅</span>}
                  {p.estado === 'INCORRECTA' && <span className="text-red-600 font-black">❌</span>}
                  {p.estado === 'OMITIDA' && <span className="text-slate-400 font-black">⛔</span>}
                </td>
                <td className="py-1.5 px-2 text-center font-mono font-bold text-slate-700">
                  {p.codigo}
                </td>
                <td className="py-1.5 px-2">
                  <span
                    className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      p.categoria === 'GENERAL'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : p.categoria === 'FRONT-END'
                        ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                        : p.categoria === 'BACK-END'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {p.categoria}
                  </span>
                </td>
                <td className="py-1.5 px-3 font-semibold text-slate-900 leading-snug">
                  {p.enunciado}
                </td>
                <td className="py-1.5 px-3 text-slate-700 leading-snug">
                  {p.respuestaCandidato ? (
                    <span className="font-mono text-[10px] bg-slate-50 px-1 py-0.5 rounded border border-slate-200 block">
                      {p.respuestaCandidato}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic text-[10px]">— Sin respuesta —</span>
                  )}
                  {p.comentario && (
                    <span className="block mt-0.5 text-[9px] text-amber-700 italic">
                      💬 {p.comentario}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PIE DE PÁGINA INSTITUCIONAL */}
      <div className="mt-4 pt-2 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400">
        <span>CTS Academy • Universidad Europea del Atlántico • Batería de Selección Técnica PROFER</span>
        <span>Documento oficial de evaluación técnica emitido el {new Date().toLocaleDateString()}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Barra superior con resumen, botón de impresión oficial */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-brand-50 text-brand-600 rounded-xl border border-brand-100">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                Prueba Técnica CTS Oficial
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {preguntas.length} Reactivos Oficiales
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1">
              Evaluación Técnica CTS & Encaje en Squad
            </h2>
          </div>
        </div>

        <button
          onClick={() => setModalImprimir(true)}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center space-x-2"
        >
          <FileDown className="w-4 h-4 text-brand-300" />
          <span>Descargar / Imprimir Reporte Técnico (PDF)</span>
        </button>
      </div>

      {/* Tarjeta de Encabezado LimeSurvey del Test */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400 block tracking-wider">
              ID de Respuesta
            </span>
            <span className="text-sm font-black text-slate-900 font-mono">
              #{informe.idRespuesta}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400 block tracking-wider">
              Fecha de Inicio
            </span>
            <span className="text-sm font-semibold text-slate-800">
              {informe.fechaInicio}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400 block tracking-wider">
              Fecha de Envío
            </span>
            <span className="text-sm font-semibold text-slate-800">
              {informe.fechaEnvio}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400 block tracking-wider">
              Fecha Última Acción
            </span>
            <span className="text-sm font-semibold text-slate-800">
              {informe.fechaUltimaAccion}
            </span>
          </div>
        </div>

        {/* 4 Áreas de Calificación y Banner de Squad */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* 4 Áreas */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Calificación por Áreas
              </h3>
              <span className="text-xs font-black text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                Puntaje Global: {puntuaciones.globalSobre10.toFixed(1)} / 10
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3">
                <span className="text-[11px] font-bold text-blue-900 block">GENERAL</span>
                <span className="text-2xl font-black text-blue-700">
                  {puntuaciones.general.toFixed(1)}%
                </span>
                <span className="text-[10px] text-blue-600 block">POO & Asincronía</span>
              </div>

              <div className="bg-cyan-50/60 border border-cyan-200 rounded-xl p-3">
                <span className="text-[11px] font-bold text-cyan-900 block">FRONT-END</span>
                <span className="text-2xl font-black text-cyan-700">
                  {puntuaciones.frontend.toFixed(1)}%
                </span>
                <span className="text-[10px] text-cyan-600 block">React, CSS & JS</span>
              </div>

              <div className="bg-purple-50/60 border border-purple-200 rounded-xl p-3">
                <span className="text-[11px] font-bold text-purple-900 block">BACK-END</span>
                <span className="text-2xl font-black text-purple-700">
                  {puntuaciones.backend.toFixed(1)}%
                </span>
                <span className="text-[10px] text-purple-600 block">APIs, SQL & Capas</span>
              </div>

              <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3">
                <span className="text-[11px] font-bold text-emerald-900 block">SYSADMIN</span>
                <span className="text-2xl font-black text-emerald-700">
                  {puntuaciones.sysadmin.toFixed(1)}%
                </span>
                <span className="text-[10px] text-emerald-600 block">Linux & Docker</span>
              </div>
            </div>
          </div>

          {/* Banner de Squad Recomendado ("En qué equipo encaja mejor") */}
          <div className="lg:col-span-7 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 text-white shadow-md border border-indigo-500/30 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-900/60 px-2.5 py-0.5 rounded-full border border-indigo-500/30 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-indigo-300" />
                    <span>Equipo en el que encaja mejor</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {squad.codigo}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-400 leading-none">
                    {squad.afinidadPorcentaje}%
                  </span>
                  <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                    Afinidad Técnica
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-black text-white mt-2">
                {squad.nombre}
              </h3>
              <p className="text-xs text-indigo-200 font-medium">
                {squad.especialidad} • <span className="text-slate-300">Líder: {squad.lider}</span>
              </p>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/10">
                {squad.justificacion}
              </p>
            </div>

            <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Fortalezas Clave en el Squad:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {squad.fortalezasClave?.map((f, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-500/20 text-indigo-200 border border-indigo-400/30"
                  >
                    ✓ {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controles de Búsqueda y Filtros de Preguntas */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Banco de Reactivos Técnicos y Respuestas
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Visualización y auditoría reactivo a reactivo del examen técnico ({preguntasFiltradas.length} de {preguntas.length} preguntas)
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              {totalCorrectas} Correctas
            </span>
            <span className="text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
              {totalIncorrectas} Incorrectas
            </span>
            <span className="text-xs font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              {totalOmitidas} Omitidas
            </span>
          </div>
        </div>

        {/* Barra de Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Búsqueda por texto / código */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por código (ej: GB001) o palabra..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPaginaActual(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
            />
          </div>

          {/* Filtro por Categoría */}
          <div className="flex items-center space-x-1.5">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={filtroCategoria}
              onChange={(e) => {
                setFiltroCategoria(e.target.value);
                setPaginaActual(1);
              }}
              className="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50 font-medium"
            >
              <option value="TODAS">Todas las Áreas</option>
              <option value="GENERAL">GENERAL</option>
              <option value="FRONT-END">FRONT-END</option>
              <option value="BACK-END">BACK-END</option>
              <option value="SYSADMIN">SYSADMIN</option>
            </select>
          </div>

          {/* Filtro por Estado */}
          <div>
            <select
              value={filtroEstado}
              onChange={(e) => {
                setFiltroEstado(e.target.value);
                setPaginaActual(1);
              }}
              className="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50 font-medium"
            >
              <option value="TODAS">Todos los Estados</option>
              <option value="CORRECTA">✅ Solo Correctas</option>
              <option value="INCORRECTA">❌ Solo Incorrectas</option>
              <option value="OMITIDA">⛔ Solo Omitidas</option>
            </select>
          </div>
        </div>

        {/* Tabla de Preguntas */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px] border-b border-slate-200">
                <th className="py-3 px-3 text-center w-24">Estado</th>
                <th className="py-3 px-3 text-center w-24">Código</th>
                <th className="py-3 px-3 w-28">Área</th>
                <th className="py-3 px-4 w-5/12">Pregunta</th>
                <th className="py-3 px-4">Respuesta Registrada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {preguntasPaginadas.length > 0 ? (
                preguntasPaginadas.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 text-center">
                      {renderBadgeEstado(p.estado)}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">
                      {p.codigo}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.categoria === 'GENERAL'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : p.categoria === 'FRONT-END'
                            ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                            : p.categoria === 'BACK-END'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {p.categoria}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 leading-snug">
                      {p.enunciado}
                    </td>
                    <td className="py-3 px-4 text-slate-700 leading-snug">
                      {p.respuestaCandidato ? (
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 font-mono text-xs">
                          {p.respuestaCandidato}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-xs">— Sin respuesta registrada —</span>
                      )}
                      {p.comentario && (
                        <span className="block mt-1 text-[11px] text-amber-700 italic">
                          💬 {p.comentario}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No se encontraron preguntas con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500">
              Página <strong className="text-slate-800">{paginaActual}</strong> de{' '}
              <strong className="text-slate-800">{totalPaginas}</strong> (
              {preguntasFiltradas.length} preguntas en total)
            </span>

            <div className="flex items-center space-x-1.5">
              <button
                disabled={paginaActual === 1}
                onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                className="p-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                let num = i + 1;
                if (totalPaginas > 5 && paginaActual > 3) {
                  num = paginaActual - 3 + i;
                  if (num > totalPaginas) num = totalPaginas - (4 - i);
                }
                return (
                  <button
                    key={num}
                    onClick={() => setPaginaActual(num)}
                    className={`w-7 h-7 text-xs font-bold rounded-lg transition-colors ${
                      paginaActual === num
                        ? 'bg-slate-900 text-white'
                        : 'border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}

              <button
                disabled={paginaActual === totalPaginas}
                onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
                className="p-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Página siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Vista Previa A4 Horizontal / Landscape */}
      {modalImprimir && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalImprimir(false);
          }}
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs overflow-y-auto p-3 sm:p-6 flex flex-col items-center no-print"
        >
          <div className="w-full max-w-[1100px] mb-3 flex items-center justify-between bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-brand-500/20 text-brand-400 rounded-xl">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Prueba Técnica CTS • Informe Oficial & Encaje en Squad</span>
                  <span className="text-[10px] font-mono uppercase bg-brand-900/60 text-brand-300 border border-brand-700 px-2 py-0.5 rounded-full">
                    A4 Horizontal / Landscape
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Formato de reporte oficial CTS: ID, 4 Áreas, Squad Recomendado y Reactivos.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center space-x-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir / Guardar PDF</span>
              </button>
              <button
                onClick={() => setModalImprimir(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                title="Cerrar vista previa"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Visualizador en Pantalla */}
          <div className="w-full max-w-[1100px] overflow-x-auto pb-6">
            <div className="min-w-[950px] bg-white rounded-2xl shadow-2xl p-6 border border-slate-200">
              {renderDocumentoImprimible()}
            </div>
          </div>
        </div>
      )}

      {/* Contenedor Estricto de Impresión para Navegador */}
      <div id="pdf-tecnico-impresion" className="hidden print:block documento-imprimible-activo">
        {renderDocumentoImprimible()}
      </div>
    </div>
  );
};
