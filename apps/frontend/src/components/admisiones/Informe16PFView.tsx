import React from 'react';
import { Printer, HeartPulse, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface Factor16PFItem {
  factor: string;
  pd: number;
  pc: number;
  bajaPuntuacion: string;
  altaPuntuacion: string;
  etiquetaResultado: string;
  rango: 'BAJA' | 'MEDIA' | 'ALTA';
  interpretacion: string;
}

interface Informe16PFProps {
  informe: {
    nombreCandidato: string;
    edad?: number | string;
    cursoAcademico?: string;
    fechaLlegada?: string;
    factores: Factor16PFItem[];
    distorsion?: {
      decatipo: number;
      etiqueta: string;
      interpretacion: string;
    };
  };
}

export const Informe16PFView: React.FC<Informe16PFProps> = ({ informe }) => {
  const handlePrint = () => {
    window.print();
  };

  const factores = informe.factores || [];
  const distorsion = informe.distorsion || {
    decatipo: 6,
    etiqueta: 'Distorsión',
    interpretacion:
      'Índice de consistencia y sinceridad en las respuestas del postulante (6/10). No se aprecian sesgos significativos ni distorsión deliberada en las respuestas.',
  };

  return (
    <div className="space-y-6">
      {/* Botón de impresión y banner oficial */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                Batería Psicométrica Cattell 16PF Oficial
              </span>
              <span className="text-xs text-slate-400 font-mono">102 Reactivos Conductuales</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1">
              Perfil Psicométrico y Conductual de Admisión
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

      {/* Ficha encabezado idéntica al PDF de Billy Ordores */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400 block tracking-wider">
              Nombre
            </span>
            <span className="text-sm font-black text-slate-900">
              {informe.nombreCandidato || 'Billy ordores'}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400 block tracking-wider">
              Edad
            </span>
            <span className="text-sm font-semibold text-slate-800">
              {informe.edad ? `${informe.edad} años` : '19 años'}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400 block tracking-wider">
              Año Académico
            </span>
            <span className="text-sm font-semibold text-slate-800">
              {informe.cursoAcademico || '2026 - 2027'}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400 block tracking-wider">
              Fecha de llegada / registro
            </span>
            <span className="text-sm font-semibold text-slate-800">
              {informe.fechaLlegada || '9/28/2019'}
            </span>
          </div>
        </div>

        {/* Tabla Oficial de Factores y Decatipos */}
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-y border-slate-200">
                <th className="py-2.5 px-3 text-center w-12">Factor</th>
                <th className="py-2.5 px-2 text-center w-12">PD</th>
                <th className="py-2.5 px-2 text-center w-12 bg-indigo-50/70 text-indigo-950 font-black">
                  PC
                </th>
                <th className="py-2.5 px-3 text-right w-28">Baja Puntuación</th>
                <th className="py-2.5 px-2 text-center">
                  <div className="text-[10px] text-slate-500 font-semibold mb-1">
                    Puntuación en Decatipos (1 - 10)
                  </div>
                  <div className="grid grid-cols-10 text-[10px] text-slate-500 font-mono">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <span key={n} className="text-center font-bold">
                        {n}
                      </span>
                    ))}
                  </div>
                </th>
                <th className="py-2.5 px-3 text-left w-28">Alta Puntuación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {factores.map((f) => {
                const decatipo = Math.min(10, Math.max(1, f.pc));
                const esBaja = decatipo <= 3;
                const esAlta = decatipo >= 8;

                return (
                  <tr key={f.factor} className="hover:bg-slate-50/60 transition-colors">
                    {/* Código de Factor */}
                    <td className="py-2 px-3 text-center font-extrabold font-mono text-slate-900 bg-slate-50/50">
                      {f.factor}
                    </td>

                    {/* PD: Puntuación Directa */}
                    <td className="py-2 px-2 text-center font-mono text-slate-600">
                      {f.pd}
                    </td>

                    {/* PC: Decatipo */}
                    <td className="py-2 px-2 text-center font-mono font-extrabold text-indigo-700 bg-indigo-50/40">
                      {f.pc}
                    </td>

                    {/* Bipolar Izquierdo: Baja Puntuación */}
                    <td
                      className={`py-2 px-3 text-right uppercase font-medium text-[11px] ${
                        esBaja ? 'font-black text-rose-700' : 'text-slate-500'
                      }`}
                    >
                      {f.bajaPuntuacion}
                    </td>

                    {/* Gráfico Visual de Decatipos 1 a 10 */}
                    <td className="py-2 px-2">
                      <div className="grid grid-cols-10 items-center h-5 bg-slate-50 rounded border border-slate-200/70 relative">
                        {/* Marcador de decatipo */}
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
                          const seleccionado = n === decatipo;
                          return (
                            <div
                              key={n}
                              className="h-full flex items-center justify-center border-r border-slate-200/50 last:border-r-0"
                            >
                              {seleccionado && (
                                <div
                                  className={`w-3.5 h-3.5 rounded-full shadow-sm flex items-center justify-center text-[9px] font-black text-white ${
                                    esBaja
                                      ? 'bg-rose-600 ring-2 ring-rose-200'
                                      : esAlta
                                      ? 'bg-emerald-600 ring-2 ring-emerald-200'
                                      : 'bg-indigo-600 ring-2 ring-indigo-200'
                                  }`}
                                >
                                  {decatipo}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </td>

                    {/* Bipolar Derecho: Alta Puntuación */}
                    <td
                      className={`py-2 px-3 text-left uppercase font-medium text-[11px] ${
                        esAlta ? 'font-black text-emerald-700' : 'text-slate-500'
                      }`}
                    >
                      {f.altaPuntuacion}
                    </td>
                  </tr>
                );
              })}

              {/* Fila Factor D (Distorsión) */}
              <tr className="bg-slate-50/70 font-semibold border-t-2 border-slate-200">
                <td className="py-2 px-3 text-center font-extrabold font-mono text-slate-900">
                  D
                </td>
                <td className="py-2 px-2 text-center font-mono text-slate-400">—</td>
                <td className="py-2 px-2 text-center font-mono font-extrabold text-indigo-700 bg-indigo-50/60">
                  {distorsion.decatipo}
                </td>
                <td className="py-2 px-3 text-right uppercase text-slate-600 text-[11px]">
                  Distorsión
                </td>
                <td className="py-2 px-2">
                  <div className="grid grid-cols-10 items-center h-5 bg-slate-100 rounded border border-slate-200">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
                      const seleccionado = n === distorsion.decatipo;
                      return (
                        <div
                          key={n}
                          className="h-full flex items-center justify-center border-r border-slate-200/50 last:border-r-0"
                        >
                          {seleccionado && (
                            <div className="w-3.5 h-3.5 rounded-full bg-slate-700 text-white flex items-center justify-center text-[9px] font-black">
                              {distorsion.decatipo}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </td>
                <td className="py-2 px-3 text-left uppercase text-slate-400 text-[11px]">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* INTERPRETACIONES DE LOS FACTORES (Fiel reflejo de las páginas 2, 3 y 4 del PDF oficial) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="pb-3 border-b border-slate-100 flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">
            Interpretaciones Cualitativas de los Factores (Cattell 16PF)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {factores.map((f) => {
            const decatipo = f.pc;
            const esBaja = decatipo <= 3;
            const esAlta = decatipo >= 8;

            return (
              <div
                key={f.factor}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:border-indigo-200 hover:shadow-xs transition-all space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-mono font-black text-indigo-900 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded">
                      FACTOR {f.factor}
                    </span>

                    <span
                      className={`text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        esBaja
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : esAlta
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}
                    >
                      {f.etiquetaResultado} (PC: {f.pc})
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed text-justify">
                    {f.interpretacion}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
                  <span>Polo bajo: {f.bajaPuntuacion}</span>
                  <span>Polo alto: {f.altaPuntuacion}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interpretación Factor D */}
        <div className="p-4 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50/60 to-white space-y-1.5">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider">
              Factor D: Control de Distorsión y Deseabilidad Social
            </h4>
            <span className="text-xs font-mono font-bold bg-white px-2 py-0.5 rounded text-indigo-700 border border-indigo-200">
              Decatipo {distorsion.decatipo} / 10
            </span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">{distorsion.interpretacion}</p>
        </div>
      </div>
    </div>
  );
};

export default Informe16PFView;
