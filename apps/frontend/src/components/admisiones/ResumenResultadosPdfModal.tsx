import React, { useState } from 'react';
import {
  Printer,
  X,
  FileText,
  Edit3,
  Check,
} from 'lucide-react';

interface ResumenResultadosPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidato: any;
}

// Logo oficial squircle CTS con cristal geométrico facetado y letras CTS
const CtsLogoSquircle: React.FC<{ size?: number; className?: string }> = ({ size = 96, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect width="100" height="100" rx="22" fill="#0266CC" />
    {/* Cristal de diamante facetado */}
    <polygon points="50,18 28,45 50,45" fill="#93C5FD" />
    <polygon points="50,18 72,45 50,45" fill="#60A5FA" />
    <polygon points="28,45 50,72 50,45" fill="#3B82F6" />
    <polygon points="72,45 50,72 50,45" fill="#2563EB" />
    <polygon points="50,30 38,45 50,60 62,45" fill="#1D4ED8" />
    {/* Tipografía CTS */}
    <text
      x="50"
      y="88"
      textAnchor="middle"
      fill="#FFFFFF"
      fontSize="13"
      fontWeight="900"
      letterSpacing="5"
      fontFamily="system-ui, -apple-system, sans-serif"
    >
      CTS
    </text>
  </svg>
);

const CtsLogoMini: React.FC<{ size?: number }> = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="24" fill="#FFFFFF" />
    <polygon points="50,18 28,45 50,45" fill="#93C5FD" />
    <polygon points="50,18 72,45 50,45" fill="#60A5FA" />
    <polygon points="28,45 50,72 50,45" fill="#3B82F6" />
    <polygon points="72,45 50,72 50,45" fill="#2563EB" />
    <polygon points="50,30 38,45 50,60 62,45" fill="#1D4ED8" />
  </svg>
);

// Componente SVG puro para Radar de Aptitud (imprimible de forma 100% determinista)
const SvgRadarAptitud: React.FC<{ categorias: any[] }> = ({ categorias }) => {
  if (!categorias || categorias.length === 0) return null;
  const cx = 200;
  const cy = 110;
  const rMax = 80;
  const total = categorias.length;

  const pointsGrid = [1, 2, 3, 4, 5].map((lvl) => {
    const r = (rMax * lvl) / 5;
    return Array.from({ length: total }, (_, i) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / total;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    }).join(' ');
  });

  const candPoints = categorias.map((cat, i) => {
    const avg =
      cat.items && cat.items.length > 0
        ? cat.items.reduce((acc: number, it: any) => acc + it.nivelActual, 0) / cat.items.length
        : 2.5;
    const r = (rMax * Math.min(5, Math.max(0, avg))) / 5;
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / total;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(' ');

  return (
    <div className="flex justify-center items-center py-1">
      <svg width="400" height="220" viewBox="0 0 400 220" className="max-w-full">
        {/* Grids concentricos */}
        {pointsGrid.map((pts, idx) => (
          <polygon
            key={idx}
            points={pts}
            fill={idx === 4 ? '#F8FAFC' : 'none'}
            stroke="#CBD5E1"
            strokeWidth="1"
          />
        ))}

        {/* Ejes radiales */}
        {Array.from({ length: total }, (_, i) => {
          const angle = -Math.PI / 2 + (2 * Math.PI * i) / total;
          const x2 = cx + rMax * Math.cos(angle);
          const y2 = cy + rMax * Math.sin(angle);
          const labelDist = rMax + 16;
          const lx = cx + labelDist * Math.cos(angle);
          const ly = cy + labelDist * Math.sin(angle);
          const catNombre = categorias[i]?.nombre || '';
          const shortName = catNombre.length > 15 ? catNombre.slice(0, 13) + '…' : catNombre;

          return (
            <g key={i}>
              <line x1={cx} y1={cy} x2={x2} y2={y2} stroke="#CBD5E1" strokeWidth="1" />
              <text
                x={lx}
                y={ly}
                textAnchor={lx > cx + 10 ? 'start' : lx < cx - 10 ? 'end' : 'middle'}
                dominantBaseline="central"
                fontSize="9"
                fontWeight="700"
                fill="#334155"
              >
                {shortName}
              </text>
            </g>
          );
        })}

        {/* Poligono evaluado */}
        <polygon
          points={candPoints}
          fill="#0266CC"
          fillOpacity="0.4"
          stroke="#0266CC"
          strokeWidth="2"
        />

        {/* Puntos en los vertices */}
        {candPoints.split(' ').map((pt, i) => {
          const [px, py] = pt.split(',');
          return <circle key={i} cx={px} cy={py} r="3" fill="#01579B" stroke="#FFFFFF" strokeWidth="1" />;
        })}
      </svg>
    </div>
  );
};

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
    `${usuario.nombre || ''} ${usuario.apellidos || ''}`.trim() || 'Postulante';
  const email = usuario.email || '—';
  const sede = candidato.sede_origen || 'Santander, España';

  const testTecnico = candidato.tests?.find((t: any) => t.tipo_bateria === 'TECNICO');

  const perfilCompetencias = candidato.perfil_competencias || {};
  const informe16PF = perfilCompetencias.informe16PF;
  const matrizAptitudes = perfilCompetencias.matrizAptitudes;
  const recomendacion = candidato.recomendacionSquad;
  const sugerido = recomendacion?.equipoSugerido;

  // Porcentaje de acceso (0%, 50%, 66%, 100%)
  const porcentajeAcceso =
    candidato.porcentaje_acceso !== null && candidato.porcentaje_acceso !== undefined
      ? candidato.porcentaje_acceso
      : perfilCompetencias.porcentajeAcceso ?? (sugerido ? 100 : '-');

  // Observaciones predeterminadas (calculadas a partir de la deliberación real)
  const defaultObsActitud = informe16PF
    ? `Candidato con perfil predominantemente colaborativo (${informe16PF.factoresPrincipales?.find((f: any) => f.factor === 'A')?.etiqueta || 'Afinidad interpersonal'}). Buena adaptabilidad y disposición al trabajo en equipo.`
    : (candidato.entrevista?.anotaciones?.find((a: any) => a.competencia_evaluada.toLowerCase().includes('actitud'))?.comentario ||
      'Demuestra actitud receptiva, motivación por el aprendizaje y clara orientación al trabajo en equipo en dinámicas de squad.');

  const defaultObsAptitud = matrizAptitudes
    ? `Promedio de autoevaluación técnica de ${matrizAptitudes.promedioNivelActual || '2.8'}/5.0. Destaca en: ${matrizAptitudes.areasFortaleza?.slice(0, 3).join(', ') || 'Desarrollo web y backend'}.`
    : (testTecnico?.calificacion_obtenida
      ? `Calificación técnica obtenida de ${Number(testTecnico.calificacion_obtenida).toFixed(1)}/10.0 en el cuestionario oficial CTS.`
      : 'Evaluación técnica y aptitudinal en proceso de consolidación.');

  const defaultObsGeneral =
    candidato.entrevista?.anotaciones?.find((a: any) => a.competencia_evaluada.toLowerCase().includes('general'))?.comentario ||
    `Aspirante que cumple con el perfil de ingreso al programa PROFER. Comunicación fluida y adecuada disposición horaria para incorporación.`;

  const defaultObsRecomendaciones = sugerido
    ? `Se recomienda su incorporación prioritaria a ${sugerido.nombre} (${sugerido.codigo}) bajo el liderazgo técnico de ${sugerido.lider}.`
    : 'Incorporación recomendada sujeta a asignación de squad definitivo.';

  const defaultObsLucia =
    'El aspirante cumple satisfactoriamente con los criterios de idoneidad formativa y profesional requeridos por la coordinación CWO.';

  const [obsActitud, setObsActitud] = useState(defaultObsActitud);
  const [obsAptitud, setObsAptitud] = useState(defaultObsAptitud);
  const [obsGeneral, setObsGeneral] = useState(defaultObsGeneral);
  const [obsRecomendaciones, setObsRecomendaciones] = useState(defaultObsRecomendaciones);
  const [obsLucia, setObsLucia] = useState(defaultObsLucia);
  const [responsable, setResponsable] = useState('Loyda Alas');
  const [fechaLlegada, setFechaLlegada] = useState('Septiembre 2026 - Febrero 2027');
  const [modoEdicion, setModoEdicion] = useState(false);

  // Formato de mes y año actual
  const fechaHoy = new Date();
  const mesAnio = fechaHoy.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const mesAnioCapitalizado = mesAnio.charAt(0).toUpperCase() + mesAnio.slice(1);

  const renderDocumento = () => (
    <div className="bg-white text-slate-800 font-sans print:m-0 print:p-0">
      {/* ======================================================== */}
      {/* PÁGINA 1: PORTADA OFICIAL (Plantilla Informe Entrevistas) */}
      {/* ======================================================== */}
      <div
        className="w-[8.5in] min-h-[11in] mx-auto p-16 flex flex-col justify-between bg-white relative page-break-after-always print:w-full print:h-[11in] print:min-h-[11in] print:p-14"
        style={{ pageBreakAfter: 'always' }}
      >
        {/* Espaciador superior */}
        <div className="h-12" />

        {/* Bloque Central de Portada */}
        <div className="flex flex-col items-center text-center space-y-8 my-auto">
          {/* Logo Squircle CTS */}
          <div className="drop-shadow-sm">
            <CtsLogoSquircle size={110} />
          </div>

          {/* Título Principal */}
          <div className="space-y-4 w-full">
            <h1
              className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#0B4EA2]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Informe de Entrevistas
            </h1>

            {/* Línea horizontal divisora exacta de la plantilla */}
            <div className="w-full max-w-lg mx-auto border-t border-slate-300 my-4" />

            {/* Fecha (Mes Año) */}
            <p className="text-sm text-slate-600 font-medium tracking-wide">
              {mesAnioCapitalizado}
            </p>
          </div>

          {/* Datos del Postulante */}
          <div className="space-y-2 pt-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1976D2]">
              {nombreCompleto}
            </h2>
            <p className="text-base text-slate-600 font-medium">
              {sede}
            </p>
            <p className="text-sm text-slate-600 pt-2 font-medium">
              Responsable: <span className="font-semibold text-slate-800">{responsable}</span>
            </p>
          </div>
        </div>

        {/* Pie de página de Portada */}
        <div className="text-right text-xs text-slate-500 font-medium pt-8">
          Santander, España
        </div>
      </div>

      {/* ======================================================== */}
      {/* PÁGINA 2: INFORME DE ENTREVISTAS & RESULTADOS TESTS      */}
      {/* ======================================================== */}
      <div
        className="w-[8.5in] min-h-[11in] mx-auto flex flex-col justify-between bg-white relative print:w-full print:h-[11in] print:min-h-[11in]"
        style={{ pageBreakInside: 'avoid' }}
      >
        <div>
          {/* Barra Superior Azul Oficial con Logo Mini y Número de Página */}
          <div className="w-full bg-[#1565C0] h-11 px-8 flex items-center justify-between text-white print:bg-[#1565C0] print:text-white">
            <div className="flex items-center space-x-2">
              <CtsLogoMini size={20} />
            </div>
            <span className="text-xs font-bold tracking-wider">1</span>
          </div>

          {/* Cuerpo del Informe */}
          <div className="p-8 sm:p-10 space-y-5">
            {/* Metadatos Superiores */}
            <div className="space-y-1 text-xs text-slate-800">
              <p>
                <strong className="font-bold">Sugerencia de porcentaje de Acceso: </strong>
                <span className="font-extrabold text-[#1565C0] text-sm">
                  {porcentajeAcceso !== '-' ? `${porcentajeAcceso}%` : '-%'}
                </span>
              </p>
              <p>
                <strong className="font-bold">Correo electrónico: </strong>
                <span className="font-mono text-slate-700">{email}</span>
              </p>
              <p>
                <strong className="font-bold">Fecha de llegada: </strong>
                <span className="text-slate-700">{fechaLlegada}</span>
              </p>
            </div>

            {/* TABLA 1: Observaciones (Loyda Alas - Gestión PROFER GII) */}
            <div className="border border-slate-300 rounded-xs overflow-hidden">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-[#1565C0] text-white">
                    <th className="py-1.5 px-3 text-left font-bold w-[22%] border-r border-[#0D47A1]">
                      Item
                    </th>
                    <th className="py-1.5 px-3 text-left font-bold">
                      Observaciones ({responsable} - Gestión PROFER GII)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="py-1.5 px-3 font-semibold text-slate-800 bg-slate-50/50 border-r border-slate-200 align-top">
                      Actitud
                    </td>
                    <td className="py-1.5 px-3 text-slate-700 leading-relaxed text-[11px]">
                      {obsActitud}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 font-semibold text-slate-800 bg-slate-50/50 border-r border-slate-200 align-top">
                      Aptitud
                    </td>
                    <td className="py-1.5 px-3 text-slate-700 leading-relaxed text-[11px]">
                      {obsAptitud}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 font-semibold text-slate-800 bg-slate-50/50 border-r border-slate-200 align-top">
                      Generalidades
                    </td>
                    <td className="py-1.5 px-3 text-slate-700 leading-relaxed text-[11px]">
                      {obsGeneral}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 font-semibold text-slate-800 bg-slate-50/50 border-r border-slate-200 align-top">
                      Recomendaciones
                    </td>
                    <td className="py-1.5 px-3 text-slate-700 leading-relaxed text-[11px]">
                      {obsRecomendaciones}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* TABLA 2: Observaciones (Lucía Terán - CWO) */}
            <div className="border border-slate-300 rounded-xs overflow-hidden">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-[#1565C0] text-white">
                    <th className="py-1.5 px-3 text-left font-bold w-[22%] border-r border-[#0D47A1]">
                      Item
                    </th>
                    <th className="py-1.5 px-3 text-left font-bold">
                      Observaciones (Lucía Terán - CWO)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="py-1.5 px-3 font-semibold text-slate-800 bg-slate-50/50 border-r border-slate-200 align-top">
                      Generalidades
                    </td>
                    <td className="py-1.5 px-3 text-slate-700 leading-relaxed text-[11px]">
                      {obsLucia}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SECCIÓN: Resultados Tests (Con capturas fieles: Radar para Aptitud y Tabla 16PF para Actitud) */}
            <div className="pt-1 space-y-3">
              <h3 className="text-xs font-black text-slate-900 tracking-wide uppercase border-b border-slate-200 pb-1">
                Resultados Tests
              </h3>

              {/* Bloque Aptitud: Solo Diagramas de Radar */}
              <div className="space-y-1">
                <h4 className="text-[11px] font-black tracking-widest text-slate-700 text-center uppercase">
                  APTITUD (DIAGRAMA DE RADAR DE COMPETENCIAS)
                </h4>
                {matrizAptitudes ? (
                  <div className="border border-slate-200 rounded-lg p-2 bg-slate-50/50">
                    <SvgRadarAptitud categorias={matrizAptitudes.categorias || []} />
                    <div className="text-center text-[10px] text-slate-500 font-mono">
                      Promedio Autoevaluación Técnica: <strong className="text-blue-700 font-bold">{matrizAptitudes.promedioNivelActual || '2.8'} / 5.0</strong>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-500 text-center italic py-2">
                    Batería de aptitud técnica pendiente de realización.
                  </p>
                )}
              </div>

              {/* Bloque Actitud: Solo Tabla de Decatipos 16PF (Sin explicaciones de texto) */}
              <div className="space-y-1 pt-1">
                <h4 className="text-[11px] font-black tracking-widest text-slate-700 text-center uppercase">
                  ACTITUD (TABLA DE FACTORES 16PF OFICIAL)
                </h4>
                {informe16PF ? (
                  <div className="border border-slate-300 rounded-xs overflow-hidden">
                    <table className="w-full border-collapse text-[10px]">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                          <th className="py-1 px-2 text-left w-14">Factor</th>
                          <th className="py-1 px-1.5 text-center w-16">Puntuación</th>
                          <th className="py-1 px-2 text-left">Rasgo Dominante Evaluado</th>
                          <th className="py-1 px-1.5 text-center w-14">Rango</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {(informe16PF.factores || []).slice(0, 8).map((f: any) => {
                          const pc = f.pc ?? f.pd ?? 6;
                          const rasgo = pc >= 6 ? f.altaPuntuacion : f.bajaPuntuacion;
                          return (
                            <tr key={f.factor} className="hover:bg-slate-50/50">
                              <td className="py-0.5 px-2 font-mono font-bold text-slate-900">Factor {f.factor}</td>
                              <td className="py-0.5 px-1.5 text-center font-bold text-blue-800 font-mono">{pc} / 10</td>
                              <td className="py-0.5 px-2 text-slate-700 font-medium truncate max-w-[220px]">{rasgo}</td>
                              <td className="py-0.5 px-1.5 text-center font-bold text-slate-600">{f.rango || 'MEDIA'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-500 text-center italic py-2">
                    Batería de actitud 16PF pendiente de realización.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pie de página Página 2 */}
        <div className="p-8 text-right text-[11px] text-slate-400 font-medium">
          Página 1 de 2
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: letter portrait;
            margin: 0;
          }
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .page-break-after-always {
            page-break-after: always !important;
            break-after: page !important;
          }
        }
      `}</style>

      {/* Modal de Vista Previa en Pantalla */}
      {isOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs overflow-y-auto p-3 sm:p-6 flex flex-col items-center no-print"
        >
          <div className="w-full max-w-[850px] mb-3 flex items-center justify-between bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Plantilla Oficial de Informe de Entrevistas</span>
                  <span className="text-[10px] font-mono uppercase bg-blue-900/60 text-blue-300 border border-blue-700 px-2 py-0.5 rounded-full">
                    Letter Portrait (2 Páginas)
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Generado siguiendo la plantilla oficial de entrevistas (Loyda Alas / Lucía Terán).
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setModoEdicion(!modoEdicion)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 ${
                  modoEdicion
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{modoEdicion ? 'Vista Documento' : 'Editar Notas'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center space-x-1.5"
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

          {/* Formulario de edición rápida si se activa */}
          {modoEdicion && (
            <div className="w-full max-w-[850px] bg-slate-800 text-white rounded-2xl p-5 mb-4 border border-slate-700 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                  Personalizar Observaciones del Informe Oficial
                </span>
                <button
                  onClick={() => setModoEdicion(false)}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold inline-flex items-center space-x-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Aplicar Cambios</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Responsable:</label>
                  <input
                    type="text"
                    value={responsable}
                    onChange={(e) => setResponsable(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Fecha de llegada:</label>
                  <input
                    type="text"
                    value={fechaLlegada}
                    onChange={(e) => setFechaLlegada(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-400 font-semibold mb-1">Obs. Actitud (Loyda Alas):</label>
                  <textarea
                    rows={2}
                    value={obsActitud}
                    onChange={(e) => setObsActitud(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-400 font-semibold mb-1">Obs. Aptitud (Loyda Alas):</label>
                  <textarea
                    rows={2}
                    value={obsAptitud}
                    onChange={(e) => setObsAptitud(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-400 font-semibold mb-1">Obs. Generalidades (Loyda Alas):</label>
                  <textarea
                    rows={2}
                    value={obsGeneral}
                    onChange={(e) => setObsGeneral(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-400 font-semibold mb-1">Recomendaciones (Loyda Alas):</label>
                  <textarea
                    rows={2}
                    value={obsRecomendaciones}
                    onChange={(e) => setObsRecomendaciones(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-400 font-semibold mb-1">Observaciones (Lucía Terán - CWO):</label>
                  <textarea
                    rows={2}
                    value={obsLucia}
                    onChange={(e) => setObsLucia(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Visualizador en Pantalla */}
          <div className="w-full max-w-[850px] overflow-x-auto pb-6 space-y-6">
            <div className="border border-slate-200 shadow-2xl rounded-xl overflow-hidden bg-white">
              {renderDocumento()}
            </div>
          </div>
        </div>
      )}

      {/* Contenedor Estricto de Impresión para Navegador */}
      <div id="pdf-resumen-impresion" className="hidden print:block documento-imprimible-activo">
        {renderDocumento()}
      </div>
    </>
  );
};

export default ResumenResultadosPdfModal;
