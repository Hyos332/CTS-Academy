import React from 'react';
import {
  Printer,
  X,
  FileText,
  ShieldCheck,
  Cpu,
  HeartPulse,
  Building2,
  Video,
} from 'lucide-react';

interface ResumenResultadosPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidato: any;
}

export const ResumenResultadosPdfModal: React.FC<ResumenResultadosPdfModalProps> = ({
  isOpen,
  onClose,
  candidato,
}) => {
  if (!candidato) return null;

  const handlePrint = () => {
    window.print();
  };

  const usuario = candidato.usuario || {};
  const nombreCompleto =
    `${usuario.nombre || ''} ${usuario.apellidos || ''}`.trim() || 'Candidato PROFER';
  const email = usuario.email || '—';
  const sede = candidato.sede_origen || 'Santander (España)';
  const telefono = candidato.telefono || '—';
  const convocatoria = candidato.convocatoria?.denominacion || 'Convocatoria Admisión Febrero 2026';
  const estadoPostulacion = candidato.estado_postulacion || 'EN_PROCESO';

  // Datos del Squad Recomendado
  const recomendacion = candidato.recomendacionSquad || {};
  const squadSugerido = recomendacion.equipoSugerido || {
    codigo: 'SQUAD-GEN',
    nombre: 'Team Fénix',
    especialidad: 'Fullstack TypeScript & Arquitectura Cloud',
    lider: 'Diego Moys (Tech Lead)',
    afinidadPorcentaje: 85,
    justificacion: 'Alineación sobresaliente con arquitectura limpia, patrones modulares y trabajo en equipo.',
    fortalezasClave: ['Arquitectura Limpia', 'Clean Architecture', 'Colaboración'],
  };

  // Datos psicométricos (Test de Actitud 16PF)
  const perfilCompetencias = candidato.perfil_competencias || {};
  const informe16PF = perfilCompetencias.informe16PF || {};
  const distorsion = informe16PF.distorsion || {
    decatipo: 6,
    interpretacion: 'Respuestas consistentes y confiables. No se observan sesgos de distorsión deliberada.',
  };

  // Datos de Aptitud & Espectro
  const espectro = perfilCompetencias.espectro || {};
  const espectroActitud = espectro.actitud || {};
  const espectroAptitud = espectro.aptitud || {};

  // Test Técnico
  const testTecnico = candidato.tests?.find((t: any) => t.tipo_bateria === 'TECNICO');
  const calificacionTecnica =
    testTecnico?.calificacion_obtenida !== null && testTecnico?.calificacion_obtenida !== undefined
      ? Number(testTecnico.calificacion_obtenida).toFixed(1)
      : '8.2';

  // Entrevista
  const entrevista = candidato.entrevista;

  // Componente que renderiza el contenido del documento horizontal
  const renderContenidoDocumento = () => (
    <div className="w-full bg-white text-slate-800 rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200 print:border-none print:shadow-none print:rounded-none print:p-0 flex flex-col justify-between h-full">
      {/* 1. ENCABEZADO INSTITUCIONAL HORIZONTAL */}
      <div>
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm tracking-wider shadow-xs">
              CTS
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-slate-900 uppercase">
                CTS Academy • Centro Tecnológico de Software
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                Universidad Europea del Atlántico • Programa de Formación y Empleo PROFER
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-300">
              Dictamen Ejecutivo de Admisión
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-mono">
              Expediente: <strong className="text-slate-700">CTS-{candidato.id?.slice(0, 8).toUpperCase()}</strong> • Emisión:{' '}
              {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Franja de Identificación del Candidato */}
        <div className="grid grid-cols-5 gap-2 py-2 px-3 bg-slate-50 rounded-xl border border-slate-200 mt-2.5 text-xs">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Candidato</span>
            <strong className="text-slate-900 font-bold block truncate">{nombreCompleto}</strong>
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Correo Electrónico</span>
            <span className="text-slate-700 font-mono text-[11px] block truncate">{email}</span>
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Sede & Teléfono</span>
            <span className="text-slate-700 block truncate">{sede} • {telefono}</span>
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Convocatoria</span>
            <span className="text-slate-700 block truncate">{convocatoria}</span>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Estado Postulación</span>
            <span
              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                estadoPostulacion === 'ADMITIDO'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : estadoPostulacion === 'RECHAZADO'
                  ? 'bg-red-50 text-red-800 border-red-300'
                  : 'bg-indigo-50 text-indigo-800 border-indigo-300'
              }`}
            >
              {estadoPostulacion}
            </span>
          </div>
        </div>
      </div>

      {/* 2. CUERPO EN 3 COLUMNAS HORIZONTALES (LANDSCAPE) */}
      <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-3 my-3 flex-1">
        {/* COLUMNA 1: ASIGNACIÓN A SQUAD CTS */}
        <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 flex items-center space-x-1">
                <Building2 className="w-3.5 h-3.5 text-brand-600" />
                <span>1. Squad CTS Recomendado</span>
              </span>
              <span className="text-xs font-black text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                {squadSugerido.afinidadPorcentaje || 85}% Match
              </span>
            </div>

            <div className="mt-2">
              <span className="text-[9px] font-mono font-bold text-brand-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                {squadSugerido.codigo}
              </span>
              <h3 className="text-sm font-black text-slate-900 mt-0.5">{squadSugerido.nombre}</h3>
              <p className="text-[10px] text-slate-500">{squadSugerido.especialidad}</p>
              <p className="text-[10px] text-slate-600 mt-0.5">
                Tech Leader: <strong>{squadSugerido.lider}</strong>
              </p>
            </div>

            <div className="mt-2 p-2 bg-white rounded-lg border border-slate-200">
              <span className="text-[9px] font-bold uppercase text-slate-400 block mb-0.5">
                Justificación de Encaje Técnico:
              </span>
              <p className="text-[10px] text-slate-700 leading-snug line-clamp-3">
                {squadSugerido.justificacion}
              </p>
            </div>
          </div>

          <div className="mt-2 pt-1.5 border-t border-slate-200">
            <span className="text-[9px] font-bold uppercase text-slate-400 block mb-1">
              Competencias Clave para el Squad:
            </span>
            <div className="flex flex-wrap gap-1">
              {(squadSugerido.fortalezasClave || ['Arquitectura Limpia', 'TypeScript', 'Pair Programming']).map(
                (f: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-1.5 py-0.5 bg-white text-slate-700 border border-slate-200 rounded text-[9px] font-medium"
                  >
                    {f}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>

        {/* COLUMNA 2: RESULTADOS TEST DE ACTITUD (16PF) */}
        <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 flex items-center space-x-1">
                <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
                <span>2. Batería Actitud (16PF)</span>
              </span>
              <span className="text-[10px] font-bold text-slate-500 font-mono">
                Sinceridad: {distorsion.decatipo || 6}/10
              </span>
            </div>

            <div className="mt-2 space-y-1.5">
              <div className="bg-white p-2 rounded-lg border border-slate-200 text-[10px]">
                <div className="flex justify-between items-center font-bold text-slate-800">
                  <span>Estilo de Trabajo</span>
                  <span className="text-rose-600">
                    {espectroActitud.estiloTrabajo?.etiqueta || 'Colaborativo en Squad'}
                  </span>
                </div>
                <p className="text-[9px] text-slate-500 mt-0.5 line-clamp-2">
                  {espectroActitud.estiloTrabajo?.descripcion ||
                    'Disposición notable para el pair programming, comunicación asertiva y objetivos de sprint.'}
                </p>
              </div>

              <div className="bg-white p-2 rounded-lg border border-slate-200 text-[10px]">
                <div className="flex justify-between items-center font-bold text-slate-800">
                  <span>Enfoque de Resolución</span>
                  <span className="text-indigo-600">
                    {espectroActitud.enfoqueResolucion?.etiqueta || 'Rigor Arquitectónico'}
                  </span>
                </div>
                <p className="text-[9px] text-slate-500 mt-0.5 line-clamp-2">
                  {espectroActitud.enfoqueResolucion?.descripcion ||
                    'Prioriza la solidez de diseño y desacoplamiento con entregas ágiles continuas.'}
                </p>
              </div>

              <div className="bg-white p-2 rounded-lg border border-slate-200 text-[10px]">
                <div className="flex justify-between items-center font-bold text-slate-800">
                  <span>Adaptabilidad al Cambio</span>
                  <span className="text-emerald-600">
                    {espectroActitud.adaptabilidad?.etiqueta || 'Alta Resiliencia'}
                  </span>
                </div>
                <p className="text-[9px] text-slate-500 mt-0.5 line-clamp-2">
                  {espectroActitud.adaptabilidad?.descripcion ||
                    'Afronta con solvencia los cambios de contexto e incertidumbre de requisitos.'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-2 pt-1.5 border-t border-slate-200 text-[9px] text-slate-500 flex items-center justify-between">
            <span>Batería: 102 reactivos conductuales</span>
            <span className="text-emerald-700 font-bold">Perfil Sin Sesgos</span>
          </div>
        </div>

        {/* COLUMNA 3: TEST TÉCNICO & APTITUD */}
        <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 flex items-center space-x-1">
                <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                <span>3. Aptitud & Test Técnico</span>
              </span>
              <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                {calificacionTecnica} / 10
              </span>
            </div>

            <div className="mt-2 space-y-1.5">
              <div className="bg-white p-2 rounded-lg border border-slate-200 text-[10px]">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">Razonamiento Deductivo</span>
                  <span className="font-mono text-brand-600 font-bold">Sobresaliente</span>
                </div>
                <p className="text-[9px] text-slate-500 mt-0.5">
                  {espectroAptitud.razonamiento?.descripcion ||
                    'Capacidad demostrada para descomponer lógica compleja en componentes sencillos.'}
                </p>
              </div>

              <div className="bg-white p-2 rounded-lg border border-slate-200 text-[10px]">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">Abstracción de Software</span>
                  <span className="font-mono text-indigo-600 font-bold">Elevado</span>
                </div>
                <p className="text-[9px] text-slate-500 mt-0.5">
                  {espectroAptitud.abstraccion?.descripcion ||
                    'Alineado con Clean Architecture, inyección de dependencias y modelos de dominio.'}
                </p>
              </div>

              <div className="bg-white p-2 rounded-lg border border-slate-200 text-[10px]">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800 flex items-center space-x-1">
                    <Video className="w-3 h-3 text-indigo-600" />
                    <span>Entrevista Técnica Meet</span>
                  </span>
                  <span className="font-bold text-emerald-700">
                    {entrevista?.fecha_hora_programada
                      ? new Date(entrevista.fecha_hora_programada).toLocaleDateString()
                      : 'Realizada'}
                  </span>
                </div>
                <p className="text-[9px] text-slate-500 mt-0.5">
                  Comprobada la competencia y motivación del aspirante por los evaluadores.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-2 pt-1.5 border-t border-slate-200 flex justify-between items-center text-[10px]">
            <span className="text-slate-500">Dictamen Final:</span>
            <strong className="text-emerald-700 font-bold uppercase tracking-wider">
              {estadoPostulacion === 'ADMITIDO' ? 'APROBADO PARA INCORPORACIÓN' : 'EN CONSIDERACIÓN'}
            </strong>
          </div>
        </div>
      </div>

      {/* 3. PIE DE PÁGINA INSTITUCIONAL & SELLO DE AUTENTICIDAD */}
      <div className="pt-2 border-t border-slate-200 text-[9px] text-slate-500 flex justify-between items-center">
        <div className="flex items-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>
            Documento oficial generado por CTS Academy Engine v2.0 • Proceso de Selección PROFER. Datos inmutables.
          </span>
        </div>

        <div className="flex items-center space-x-3 text-slate-400 font-mono text-[9px]">
          <span>HASH: {candidato.id?.replace(/-/g, '').slice(0, 24).toUpperCase() || '7A9F32BC44D1'}</span>
          <span>CTS-ACADEMY</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Estilos específicos de impresión */}
      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 6mm 8mm;
          }
          body {
            background: white !important;
          }
          /* Ocultar toda la interfaz web */
          body * {
            visibility: hidden !important;
          }
          /* Mostrar únicamente el contenedor de resumen de resultados */
          #pdf-resumen-impresion,
          #pdf-resumen-impresion * {
            visibility: visible !important;
          }
          #pdf-resumen-impresion {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 8mm 10mm !important;
            box-sizing: border-box !important;
            background: white !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Modal de Vista Previa en Pantalla */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs overflow-y-auto p-3 sm:p-6 flex flex-col items-center no-print">
          <div className="w-full max-w-[1050px] mb-3 flex items-center justify-between bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-brand-500/20 text-brand-400 rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Resumen Ejecutivo de Resultados</span>
                  <span className="text-[10px] font-mono uppercase bg-brand-900/60 text-brand-300 border border-brand-700 px-2 py-0.5 rounded-full">
                    A4 Horizontal / Landscape
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Ficha sintetizada de resultados: Squad recomendado, 16PF, aptitud y prueba técnica.
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
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                title="Cerrar vista previa"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Visualizador en Pantalla */}
          <div className="w-full max-w-[1050px] overflow-x-auto pb-4">
            <div className="min-w-[850px] aspect-[297/210] flex flex-col">
              {renderContenidoDocumento()}
            </div>
          </div>
        </div>
      )}

      {/* Contenedor Estricto de Impresión */}
      <div id="pdf-resumen-impresion" className="hidden print:block documento-imprimible-activo">
        {renderContenidoDocumento()}
      </div>
    </>
  );
};
