import React, { useState } from 'react';
import {
  Printer,
  Cpu,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  X,
  FileDown,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';

export interface HabilidadAptitudItem {
  habilidad: string;
  nivelActual: number;
  nivelDeseado: number;
}

export interface CategoriaAptitudItem {
  codigo: string;
  nombre: string;
  items: HabilidadAptitudItem[];
}

export interface MatrizAptitudInforme {
  nombreCandidato: string;
  escala?: string;
  promedioNivelActual?: number;
  categorias: CategoriaAptitudItem[];
  areasFortaleza?: string[];
  areasMejora?: string[];
}

export interface MatrizAptitudesViewProps {
  matriz: MatrizAptitudInforme;
}

export const MatrizAptitudesView: React.FC<MatrizAptitudesViewProps> = ({
  matriz,
}) => {
  const [modalImprimir, setModalImprimir] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const categorias = matriz.categorias || [];

  // Datos para el Radar Global Multidimensional (promedio por categoría técnica)
  const radarGlobalData = categorias.map((cat) => {
    const avg =
      cat.items.length > 0
        ? Number(
            (cat.items.reduce((acc, it) => acc + it.nivelActual, 0) / cat.items.length).toFixed(1),
          )
        : 0;
    const shortLabel =
      cat.nombre.length > 18 ? cat.nombre.slice(0, 16) + '…' : cat.nombre;
    return {
      dimension: shortLabel,
      nombreCompleto: cat.nombre,
      evaluado: avg,
      deseado: 5,
    };
  });

  const renderDocumentoImprimible = () => (
    <div className="w-full bg-white text-slate-900 p-6 print:p-0">
      {/* 1. ENCABEZADO INSTITUCIONAL HORIZONTAL */}
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm tracking-wider shadow-xs">
            CTS
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-slate-900 uppercase">
              CTS Academy • Diagramas de Radar de Aptitudes Técnicas
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              Universidad Europea del Atlántico • Evaluación de Aptitudes Técnicas y Brechas Formativas
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-300">
            Diagramas Radar (0 - 5)
          </div>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">
            Emisión: <strong className="text-slate-800">{new Date().toLocaleDateString()}</strong>
          </p>
        </div>
      </div>

      {/* 2. DATOS DEL EVALUADO Y PROMEDIO */}
      <div className="grid grid-cols-3 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200 mt-3 text-xs">
        <div>
          <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
            Candidato Evaluado (Email)
          </span>
          <span className="font-extrabold text-slate-900 font-mono">
            {matriz.nombreCandidato || 'candidato@alumnos.uneatlantico.es'}
          </span>
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
            Escala Oficial de Valoración
          </span>
          <span className="font-semibold text-slate-800">
            {matriz.escala || '0: Conocimiento Nulo • 5: Conocimiento Muy Alto'}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
            Promedio Autoevaluación
          </span>
          <span className="text-base font-black text-brand-600">
            {matriz.promedioNivelActual ?? '2.8'} / 5.0
          </span>
        </div>
      </div>

      {/* 3. FORTALEZAS Y ÁREAS DE MEJORA */}
      <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 block mb-1">
            ✓ Principales Fortalezas (Nivel 4 o 5)
          </span>
          <div className="flex flex-wrap gap-1">
            {matriz.areasFortaleza?.map((f, i) => (
              <span key={i} className="px-2 py-0.5 bg-white text-emerald-800 rounded font-bold text-[10px] border border-emerald-200">
                {f}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block mb-1">
            ⚠ Áreas Prioritarias de Formación (Nivel 0 o 1)
          </span>
          <div className="flex flex-wrap gap-1">
            {matriz.areasMejora?.map((m, i) => (
              <span key={i} className="px-2 py-0.5 bg-white text-amber-900 rounded font-medium text-[10px] border border-amber-200">
                • {m}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 4. RADARS EN IMPRESIÓN */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        {categorias.map((cat, idx) => {
          const catRadarData = cat.items.map((item) => ({
            habilidad: item.habilidad.length > 13 ? item.habilidad.slice(0, 11) + '…' : item.habilidad,
            nivel: item.nivelActual,
            deseado: item.nivelDeseado || 5,
          }));

          const catAvg =
            cat.items.length > 0
              ? (cat.items.reduce((acc, it) => acc + it.nivelActual, 0) / cat.items.length).toFixed(1)
              : '0';

          return (
            <div key={cat.codigo || idx} className="border border-slate-200 rounded-xl p-3 bg-white">
              <div className="flex justify-between items-center mb-1">
                <span className="font-extrabold text-[11px] text-slate-900">{cat.nombre}</span>
                <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">
                  {catAvg} / 5.0
                </span>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={catRadarData}>
                    <PolarGrid stroke="#E2E8F0" />
                    <PolarAngleAxis dataKey="habilidad" tick={{ fill: '#334155', fontSize: 8 }} />
                    <PolarRadiusAxis domain={[0, 5]} stroke="#CBD5E1" tickCount={6} />
                    <Radar dataKey="nivel" stroke="#01579B" fill="#01579B" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>

      {/* PIE DE PÁGINA */}
      <div className="mt-4 pt-2 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400">
        <span>CTS Academy • Diagramas de Radar Oficiales de Aptitudes • PROFER Admisión</span>
        <span>Página generada el {new Date().toLocaleDateString()}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Botón de impresión y banner oficial */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                Matriz Oficial de Competencias y Aptitudes
              </span>
              <span className="text-xs text-slate-400 font-mono">43 Habilidades Evaluadas</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1">
              Test Aptitud • Diagramas de Radar de Competencias (0 - 5)
            </h2>
          </div>
        </div>

        <button
          onClick={() => setModalImprimir(true)}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center space-x-2"
        >
          <FileDown className="w-4 h-4 text-blue-300" />
          <span>Descargar / Imprimir Radars (PDF)</span>
        </button>
      </div>

      {/* Ficha encabezado */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase text-slate-400 block tracking-wider">
            Nombre / Email Evaluado
          </span>
          <span className="text-base font-black text-slate-900 font-mono">
            {matriz.nombreCandidato || 'candidato@alumnos.uneatlantico.es'}
          </span>
          <p className="text-xs text-slate-500 mt-0.5">
            Escala Oficial: <strong className="text-slate-700 font-medium">{matriz.escala || '0: Conocimiento Nulo. 5: Conocimiento Muy Alto'}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-4 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
          <div className="text-right">
            <span className="text-2xl font-black text-brand-600">
              {matriz.promedioNivelActual ?? '2.8'}
            </span>
            <span className="text-slate-400 text-sm font-bold"> / 5.0</span>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Promedio de Autoevaluación
            </span>
          </div>
        </div>
      </div>

      {/* Tarjetas resumen de Fortalezas y Brechas de Formación */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 space-y-2">
          <div className="flex items-center space-x-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Principales Fortalezas Técnicas (Nivel 4 o 5)</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {matriz.areasFortaleza && matriz.areasFortaleza.length > 0 ? (
              matriz.areasFortaleza.map((f) => (
                <span
                  key={f}
                  className="text-[11px] font-bold bg-white text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs inline-flex items-center space-x-1"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{f}</span>
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">No registradas</span>
            )}
          </div>
        </div>

        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 space-y-2">
          <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Áreas Prioritarias de Formación PROFER (Nivel 0 o 1)</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {matriz.areasMejora && matriz.areasMejora.length > 0 ? (
              matriz.areasMejora.map((m) => (
                <span
                  key={m}
                  className="text-[11px] font-medium bg-white text-amber-900 px-2.5 py-1 rounded-lg border border-amber-200 shadow-2xs"
                >
                  • {m}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">Sin áreas críticas</span>
            )}
          </div>
        </div>
      </div>

      {/* DIAGRAMAS DE RADAR POR COMPETENCIA (Solo Radar - Sin vista tabular) */}
      <div className="space-y-6">
        {/* Radar Macro-Global de Dimensiones Técnicas */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Radar Global de Aptitudes por Categoría Técnica</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Promedio ponderado del candidato en cada una de las {categorias.length} dimensiones técnicas evaluadas (Escala 0 - 5).
              </p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="inline-flex items-center space-x-1">
                <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
                <span className="font-semibold text-slate-700">Nivel Candidato</span>
              </span>
              <span className="inline-flex items-center space-x-1">
                <span className="w-3 h-3 rounded-full bg-slate-300 inline-block" />
                <span className="font-medium text-slate-400">Objetivo (5.0)</span>
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarGlobalData}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }}
                />
                <PolarRadiusAxis angle={30} domain={[0, 5]} stroke="#CBD5E1" tickCount={6} />
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} / 5.0`, name === 'evaluado' ? 'Nivel Evaluado' : 'Objetivo']}
                />
                <Radar
                  name="evaluado"
                  dataKey="evaluado"
                  stroke="#01579B"
                  fill="#01579B"
                  fillOpacity={0.4}
                />
                <Radar
                  name="deseado"
                  dataKey="deseado"
                  stroke="#CBD5E1"
                  strokeDasharray="3 3"
                  fill="transparent"
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radars Específicos por Cada Categoría de Competencias */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categorias.map((cat, idx) => {
            const catRadarData = cat.items.map((item) => {
              const shortHab =
                item.habilidad.length > 14 ? item.habilidad.slice(0, 12) + '…' : item.habilidad;
              return {
                habilidad: shortHab,
                nombreCompleto: item.habilidad,
                nivel: item.nivelActual,
                deseado: item.nivelDeseado || 5,
              };
            });

            const catAvg =
              cat.items.length > 0
                ? (
                    cat.items.reduce((acc, it) => acc + it.nivelActual, 0) / cat.items.length
                  ).toFixed(1)
                : '0';

            return (
              <div
                key={cat.codigo || idx}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-slate-900 text-xs truncate max-w-[200px]" title={cat.nombre}>
                      {cat.nombre}
                    </h4>
                    <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                      {catAvg} / 5.0
                    </span>
                  </div>

                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={catRadarData}>
                        <PolarGrid stroke="#F1F5F9" />
                        <PolarAngleAxis
                          dataKey="habilidad"
                          tick={{ fill: '#475569', fontSize: 9, fontWeight: 500 }}
                        />
                        <PolarRadiusAxis angle={30} domain={[0, 5]} stroke="#E2E8F0" tickCount={6} />
                        <Tooltip
                          formatter={(val: any) => [`${val} / 5`, 'Nivel']}
                          labelFormatter={(label) => {
                            const found = catRadarData.find((d) => d.habilidad === label);
                            return found?.nombreCompleto || label;
                          }}
                        />
                        <Radar
                          name="Nivel"
                          dataKey="nivel"
                          stroke="#01579B"
                          fill="#01579B"
                          fillOpacity={0.45}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Resumen de habilidades destacadas */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{cat.items.length} habilidades evaluadas</span>
                  <span className="font-medium text-slate-700">
                    {cat.items.filter((i) => i.nivelActual >= 4).length} dominadas (≥4)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
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
              <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Test Aptitud • Matriz Oficial de Habilidades</span>
                  <span className="text-[10px] font-mono uppercase bg-blue-900/60 text-blue-300 border border-blue-700 px-2 py-0.5 rounded-full">
                    A4 Horizontal / Landscape
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Desglose completo de las {categorias.length} categorías y diagramas de radar.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center space-x-1.5"
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
      <div id="pdf-aptitud-impresion" className="hidden print:block documento-imprimible-activo">
        {renderDocumentoImprimible()}
      </div>
    </div>
  );
};

export default MatrizAptitudesView;
