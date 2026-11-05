import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  X,
  Users,
  Building2,
  Trash2,
  ArrowRight,
} from 'lucide-react';

interface ImportarSedeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CandidatoParseado {
  nombre: string;
  apellidos: string;
  email: string;
  telefono?: string;
  valido: boolean;
  error?: string;
}

export const ImportarSedeModal: React.FC<ImportarSedeModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [sedeOrigen, setSedeOrigen] = useState('SDR_ESP');
  const [textoPegado, setTextoPegado] = useState('');
  const [candidatos, setCandidatos] = useState<CandidatoParseado[]>([]);
  const [enviarInvitaciones, setEnviarInvitaciones] = useState(true);
  const [resultadoImportacion, setResultadoImportacion] = useState<{
    importados: number;
    duplicados: string[];
    totalProcesados: number;
  } | null>(null);

  // Parsea filas en formato: Nombre, Apellidos, Email, Teléfono
  const parsearTexto = (texto: string) => {
    setTextoPegado(texto);
    if (!texto.trim()) {
      setCandidatos([]);
      return;
    }

    const lineas = texto.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const parseados: CandidatoParseado[] = [];

    for (const linea of lineas) {
      // Ignorar cabecera si existe
      if (
        linea.toLowerCase().includes('nombre') &&
        linea.toLowerCase().includes('email')
      ) {
        continue;
      }

      // Separar por coma, punto y coma o tabulación
      const partes = linea.split(/[,;\t]/).map((p) => p.trim());
      if (partes.length >= 3) {
        const nombre = partes[0] || '';
        const apellidos = partes[1] || '';
        const email = partes[2]?.toLowerCase() || '';
        const telefono = partes[3] || undefined;

        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        const tieneNombre = nombre.length > 0 && apellidos.length > 0;

        parseados.push({
          nombre,
          apellidos,
          email,
          telefono,
          valido: emailValido && tieneNombre,
          error: !tieneNombre
            ? 'Nombre o apellido incompleto'
            : !emailValido
            ? 'Formato de correo no válido'
            : undefined,
        });
      }
    }

    setCandidatos(parseados);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      parsearTexto(content);
    };
    reader.readAsText(file);
  };

  const importarMutation = useMutation({
    mutationFn: async () => {
      const candidatosValidos = candidatos
        .filter((c) => c.valido)
        .map((c) => ({
          nombre: c.nombre,
          apellidos: c.apellidos,
          email: c.email,
          telefono: c.telefono,
        }));

      const res = await apiClient.post('/evaluacion/candidatos/importar-sede', {
        sedeOrigen,
        candidatos: candidatosValidos,
        enviarInvitaciones,
      });
      return res.data;
    },
    onSuccess: (data) => {
      setResultadoImportacion(data);
      queryClient.invalidateQueries({ queryKey: ['admisiones-panel'] });
    },
  });

  const handleCerrar = () => {
    setTextoPegado('');
    setCandidatos([]);
    setResultadoImportacion(null);
    onClose();
  };

  if (!isOpen) return null;

  const validosCount = candidatos.filter((c) => c.valido).length;
  const invalidosCount = candidatos.filter((c) => !c.valido).length;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto font-sans"
    >
      <div className="bg-white rounded-lg max-w-3xl w-full p-6 shadow-xl border border-[#E0E0E0] my-8 space-y-5">
        {/* Cabecera */}
        <div className="flex items-start justify-between pb-4 border-b border-[#EEEEEE]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#E6EFF5] text-[#01579B] rounded-lg border border-[#CCDDEB]">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#01579B] bg-[#E6EFF5] px-2 py-0.5 rounded border border-[#CCDDEB]">
                Módulo de Admisión • Grupo FUNIBER
              </span>
              <h2 className="text-base font-bold text-[#212121] mt-1">
                Importación Masiva de Nómina por Sede
              </h2>
              <p className="text-xs text-[#616161]">
                Carga por lote de candidatos universitarios remitidos por las sedes para la convocatoria activa.
              </p>
            </div>
          </div>
          <button
            onClick={handleCerrar}
            className="p-1.5 text-[#757575] hover:text-[#212121] rounded-lg hover:bg-[#F5F5F5] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {resultadoImportacion ? (
          /* Vista de Resultado Exitoso */
          <div className="space-y-4 py-4">
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-emerald-950">
                ¡Nómina de Sede Importada con Éxito!
              </h3>
              <p className="text-xs text-emerald-800 max-w-md mx-auto">
                Se registraron <strong>{resultadoImportacion.importados}</strong> nuevos candidatos con sus 3
                baterías de test asignadas (Actitud, Aptitud y Técnico).
              </p>
            </div>

            {resultadoImportacion.duplicados?.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5 text-xs text-amber-900">
                <div className="flex items-center space-x-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{resultadoImportacion.duplicados.length} Correos ya existentes (omitidos por duplicidad):</span>
                </div>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pt-1 font-mono text-[11px]">
                  {resultadoImportacion.duplicados.map((d) => (
                    <span key={d} className="px-2 py-0.5 bg-amber-100 rounded border border-amber-300">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3">
              <button
                onClick={handleCerrar}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                Volver al Panel de Candidatos
              </button>
            </div>
          </div>
        ) : (
          /* Formulario de Importación */
          <div className="space-y-5">
            {/* Selección de Sede */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1">
                  <Building2 className="w-3.5 h-3.5 text-brand-600" />
                  <span>Sede Universitaria de Origen</span>
                </label>
                <select
                  value={sedeOrigen}
                  onChange={(e) => setSedeOrigen(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white font-medium"
                >
                  <option value="SDR_ESP">Santander (España) • Universidad Europea del Atlántico</option>
                  <option value="GTM_GUA">Guatemala • Sede Centroamérica</option>
                  <option value="COL_BOG">Bogotá (Colombia) • Sede Andina</option>
                  <option value="MEX_CDMX">Ciudad de México • Sede México</option>
                  <option value="PER_LIM">Lima (Perú) • Sede Pacífico</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-brand-600" />
                  <span>Cargar Archivo CSV</span>
                </label>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
                />
              </div>
            </div>

            {/* Área de Texto / Pegar Nómina */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Pegar nómina de aspirantes (formato: Nombre, Apellidos, Correo, Teléfono)
                </label>
                {candidatos.length > 0 && (
                  <button
                    onClick={() => parsearTexto('')}
                    className="text-[11px] text-red-600 hover:text-red-700 font-semibold inline-flex items-center space-x-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Limpiar</span>
                  </button>
                )}
              </div>
              <textarea
                rows={5}
                value={textoPegado}
                onChange={(e) => parsearTexto(e.target.value)}
                placeholder="Ejemplo:&#10;Lucía, Fernández Castro, lucia.f@alumnos.uneatlantico.es, +34600112233&#10;Martín, Gómez Rivas, martin.g@alumnos.uneatlantico.es, +34600223344&#10;Carlos, Alvarado Vega, carlos.alvarado@alumnos.uneatlantico.es"
                className="w-full p-3 font-mono text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none bg-slate-50/50"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Acepta delimitadores por coma, punto y coma o tabulación de Excel.
              </p>
            </div>

            {/* Previsualización de Candidatos Parseados */}
            {candidatos.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <Users className="w-4 h-4 text-brand-600" />
                    <span>Previsualización de Candidatos ({candidatos.length})</span>
                  </span>
                  <div className="flex items-center space-x-2 text-[11px] font-semibold">
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      ✓ {validosCount} Válidos
                    </span>
                    {invalidosCount > 0 && (
                      <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                        ⚠ {invalidosCount} Incompletos
                      </span>
                    )}
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl bg-white shadow-2xs">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="px-3 py-2">#</th>
                        <th className="px-3 py-2">Nombre Completo</th>
                        <th className="px-3 py-2">Correo Electrónico</th>
                        <th className="px-3 py-2">Teléfono</th>
                        <th className="px-3 py-2 text-right">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {candidatos.map((c, idx) => (
                        <tr
                          key={idx}
                          className={c.valido ? 'hover:bg-slate-50/80' : 'bg-red-50/40 text-red-800'}
                        >
                          <td className="px-3 py-2 font-mono text-slate-400">{idx + 1}</td>
                          <td className="px-3 py-2 font-bold text-slate-900">
                            {c.nombre} {c.apellidos}
                          </td>
                          <td className="px-3 py-2 font-mono text-[11px] text-slate-600">
                            {c.email}
                          </td>
                          <td className="px-3 py-2 font-mono text-[11px] text-slate-500">
                            {c.telefono || '—'}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {c.valido ? (
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                Válido
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                                {c.error || 'Error'}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Opciones de Despacho Inmediato */}
            <div className="p-3 bg-[#E6EFF5] border border-[#CCDDEB] rounded-lg">
              <label className="flex items-center space-x-2 text-xs font-bold text-[#01579B] cursor-pointer">
                <input
                  type="checkbox"
                  checked={enviarInvitaciones}
                  onChange={(e) => setEnviarInvitaciones(e.target.checked)}
                  className="rounded border-[#BDBDBD] text-[#01579B] focus:ring-[#01579B]"
                />
                <span>Habilitar credenciales y registrar despacho de invitación por correo</span>
              </label>
              <p className="text-[11px] text-[#616161] pl-6 mt-0.5">
                Cada aspirante dispondrá de acceso inmediato con su contraseña temporal (CtsAcademy2026!) para
                rendir las 3 baterías.
              </p>
            </div>

            {/* Acciones */}
            <div className="flex justify-end space-x-2 pt-3 border-t border-[#EEEEEE]">
              <button
                onClick={handleCerrar}
                className="px-4 py-2 border border-[#E0E0E0] text-[#424242] text-xs font-semibold rounded-lg hover:bg-[#F5F5F5] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => importarMutation.mutate()}
                disabled={validosCount === 0 || importarMutation.isPending}
                className="px-5 py-2 bg-[#01579B] hover:bg-[#004174] disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-2xs transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                {importarMutation.isPending ? (
                  <span>Importando nómina...</span>
                ) : (
                  <>
                    <span>Importar {validosCount} Candidatos</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportarSedeModal;
