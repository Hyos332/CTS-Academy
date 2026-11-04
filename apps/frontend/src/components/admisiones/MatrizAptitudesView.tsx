import React, { useState } from 'react';
import {
  Printer,
  Cpu,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  X,
  FileDown,
} from 'lucide-react';

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
              CTS Academy • Matriz Oficial de Competencias y Aptitudes
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              Universidad Europea del Atlántico • Evaluación de Aptitudes Técnicas y Brechas Formativas
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-300">
            Matriz de Aptitudes (0 - 5)
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

      {/* 4. TODAS LAS 8 CATEGORÍAS Y 43 HABILIDADES EN GRID LANDSCAPE */}
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        {categorias.map((cat, idx) => (
          <div
            key={cat.codigo || idx}
            className="border border-slate-200 rounded-xl overflow-hidden bg-white page-break-inside-avoid"
          >
            <div className="px-3 py-1.5 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
              <span className="font-extrabold text-slate-900 text-[11px] flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
                <span>{cat.nombre}</span>
              </span>
              <span className="text-[9px] font-mono text-slate-500 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                {cat.items.length} habilidades
              </span>
            </div>

            <table className="w-full text-left border-collapse text-[10px]">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-100">
                  <th className="py-1 px-3">Habilidad</th>
                  <th className="py-1 px-2 text-center w-12">Actual</th>
                  <th className="py-1 px-2 text-center w-12">Deseado</th>
                  <th className="py-1 px-2 text-center w-20">Nivel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cat.items.map((item, i) => {
                  const actual = item.nivelActual;
                  const deseado = item.nivelDeseado || 5;
                  const esAlto = actual >= 4;

                  return (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="py-1 px-3 font-medium text-slate-800">{item.habilidad}</td>
                      <td className="py-1 px-2 text-center font-mono font-bold text-slate-900">
                        {actual}
                      </td>
                      <td className="py-1 px-2 text-center font-mono text-slate-400">
                        {deseado}
                      </td>
                      <td className="py-1 px-2 text-center">
                        <div className="flex items-center justify-center space-x-0.5">
                          {[1, 2, 3, 4, 5].map((b) => (
                            <div
                              key={b}
                              className={`w-2.5 h-1.5 rounded-xs ${
                                b <= actual
                                  ? esAlto
                                    ? 'bg-emerald-500'
                                    : 'bg-indigo-600'
                                  : 'bg-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* PIE DE PÁGINA */}
      <div className="mt-4 pt-2 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400">
        <span>CTS Academy • Matriz Oficial de Competencias y Brechas Técnicas • PROFER Admisión</span>
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
              Test Aptitud • Nivel Actual vs Nivel Deseado (0 - 5)
            </h2>
          </div>
        </div>

        <button
          onClick={() => setModalImprimir(true)}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center space-x-2"
        >
          <FileDown className="w-4 h-4 text-blue-300" />
          <span>Descargar / Imprimir Matriz Aptitudes (PDF)</span>
        </button>
      </div>

      {/* Ficha encabezado idéntica al PDF oficial */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase text-slate-400 block tracking-wider">
            Nombre / Email Evaluado
          </span>
          <span className="text-base font-black text-slate-900 font-mono">
            {matriz.nombreCandidato || 'billy.ordores@alumnos.uneatlantico.es'}
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

      {/* Las 8 Tablas Oficiales en un Grid Responsivo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {categorias.map((cat, idx) => (
          <div
            key={cat.codigo || idx}
            className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="px-5 py-3.5 bg-slate-100/80 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-brand-600" />
                  <span>{cat.nombre}</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {cat.items.length} items
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/60 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <th className="px-5 py-2.5">Habilidad</th>
                      <th className="px-3 py-2.5 text-center w-16">Nivel Actual</th>
                      <th className="px-3 py-2.5 text-center w-16">Nivel Deseado</th>
                      <th className="px-4 py-2.5 text-center w-28">Brecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cat.items.map((item, i) => {
                      const actual = item.nivelActual;
                      const deseado = item.nivelDeseado || 5;
                      const esAlto = actual >= 4;
                      const esBajo = actual <= 1;

                      return (
                        <tr
                          key={i}
                          className="hover:bg-slate-50/60 transition-colors"
                        >
                          <td className="px-5 py-2.5 font-medium text-slate-800">
                            {item.habilidad}
                          </td>

                          <td className="px-3 py-2.5 text-center font-mono font-bold">
                            <span
                              className={`inline-block px-2 py-0.5 rounded ${
                                esAlto
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : esBajo
                                  ? 'bg-slate-100 text-slate-600'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {actual}
                            </span>
                          </td>

                          <td className="px-3 py-2.5 text-center font-mono text-slate-500">
                            {deseado}
                          </td>

                          <td className="px-4 py-2.5 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              {[1, 2, 3, 4, 5].map((bloque) => (
                                <div
                                  key={bloque}
                                  className={`w-3.5 h-2 rounded-xs transition-all ${
                                    bloque <= actual
                                      ? esAlto
                                        ? 'bg-emerald-500'
                                        : 'bg-indigo-600'
                                      : 'bg-slate-200'
                                  }`}
                                />
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Vista Previa A4 Horizontal / Landscape */}
      {modalImprimir && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs overflow-y-auto p-3 sm:p-6 flex flex-col items-center no-print">
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
                  Desglose completo de las 8 categorías, 43 competencias, fortalezas y brechas.
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
