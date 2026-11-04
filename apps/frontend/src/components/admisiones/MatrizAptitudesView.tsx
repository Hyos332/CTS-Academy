import React from 'react';
import { Printer, Cpu, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';

interface HabilidadAptitudItem {
  habilidad: string;
  nivelActual: number;
  nivelDeseado: number;
}

interface CategoriaAptitudItem {
  codigo: string;
  nombre: string;
  items: HabilidadAptitudItem[];
}

interface MatrizAptitudInforme {
  nombreCandidato: string;
  escala?: string;
  promedioNivelActual?: number;
  categorias: CategoriaAptitudItem[];
  areasFortaleza?: string[];
  areasMejora?: string[];
}

interface MatrizAptitudesViewProps {
  matriz: MatrizAptitudInforme;
}

export const MatrizAptitudesView: React.FC<MatrizAptitudesViewProps> = ({ matriz }) => {
  const handlePrint = () => {
    window.print();
  };

  const categorias = matriz.categorias || [];

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
          onClick={handlePrint}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors inline-flex items-center space-x-1.5"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir / Exportar PDF</span>
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

      {/* Las 8 Tablas Oficiales en un Grid Responsivo (2 columnas en pantallas medianas/grandes) */}
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

                          {/* Nivel Actual (0 a 5) */}
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

                          {/* Nivel Deseado (5) */}
                          <td className="px-3 py-2.5 text-center font-mono text-slate-500">
                            {deseado}
                          </td>

                          {/* Medidor visual de 5 bloques */}
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
    </div>
  );
};

export default MatrizAptitudesView;
