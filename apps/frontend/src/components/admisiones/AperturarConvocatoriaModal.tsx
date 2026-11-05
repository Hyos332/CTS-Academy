import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import {
  Calendar,
  PlusCircle,
  X,
  AlertCircle,
  Sparkles,
  Layers,
} from 'lucide-react';

interface SemestreDisponible {
  id: string;
  periodo: string;
  fechaInicio: string;
  fechaFin: string;
  cursoAcademico: string;
}

interface AperturarConvocatoriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  semestresDisponibles?: SemestreDisponible[];
}

export const AperturarConvocatoriaModal: React.FC<AperturarConvocatoriaModalProps> = ({
  isOpen,
  onClose,
  semestresDisponibles = [],
}) => {
  const queryClient = useQueryClient();

  const [modoSemestre, setModoSemestre] = useState<'existente' | 'nuevo'>(
    semestresDisponibles.length > 0 ? 'existente' : 'nuevo',
  );

  // Semestre existente
  const [semestreId, setSemestreId] = useState<string>(
    semestresDisponibles[0]?.id || '',
  );

  // Nuevo semestre
  const anioActual = new Date().getFullYear();
  const [cursoDenominacion, setCursoDenominacion] = useState(`Curso ${anioActual}-${anioActual + 1}`);
  const [periodoSemestre, setPeriodoSemestre] = useState('SEM-01');
  const [anioInicio, setAnioInicio] = useState(anioActual);
  const [anioFin, setAnioFin] = useState(anioActual + 1);

  // Datos de la convocatoria
  const hoyStr = new Date().toISOString().split('T')[0];
  const cierreSugerido = new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [denominacion, setDenominacion] = useState(
    `Convocatoria Admisión ${new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`,
  );
  const [fechaApertura, setFechaApertura] = useState(hoyStr);
  const [fechaCierre, setFechaCierre] = useState(cierreSugerido);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const aperturarMutation = useMutation({
    mutationFn: async () => {
      setErrorMsg(null);

      const payload: any = {
        denominacion: denominacion.trim(),
        fechaApertura: new Date(fechaApertura).toISOString(),
        fechaCierre: new Date(fechaCierre).toISOString(),
        modeloAdmision: 'CONTINUA',
      };

      if (modoSemestre === 'existente') {
        if (!semestreId) {
          throw new Error('Debes seleccionar un semestre existente.');
        }
        payload.semestreId = semestreId;
      } else {
        payload.periodoSemestre = periodoSemestre;
        payload.cursoDenominacion = cursoDenominacion;
        payload.anioInicio = Number(anioInicio);
        payload.anioFin = Number(anioFin);
      }

      const res = await apiClient.post('/equipos/periodos-ingreso', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admisiones-panel'] });
      onClose();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Error al aperturar la convocatoria.';
      setErrorMsg(Array.isArray(msg) ? msg.join(', ') : msg);
    },
  });

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto font-sans"
    >
      <div className="bg-white rounded-lg max-w-xl w-full p-6 shadow-xl border border-[#E0E0E0] my-8 space-y-5">
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-3 border-b border-[#EEEEEE]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-[#E6EFF5] text-[#01579B] border border-[#CCDDEB]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#212121] text-base">Aperturar Nueva Convocatoria</h3>
              <p className="text-xs text-[#616161]">
                Inicia un nuevo ciclo de admisiones continuas para la recepción de postulantes.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#757575] hover:text-[#212121] hover:bg-[#F5F5F5] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Selector de Modo de Semestre */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Periodo Académico y Semestre
          </label>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setModoSemestre('existente')}
              disabled={semestresDisponibles.length === 0}
              className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                modoSemestre === 'existente'
                  ? 'bg-[#E6EFF5] border-[#01579B] text-[#01579B]'
                  : 'border-[#E0E0E0] text-[#616161] hover:bg-[#F5F5F5] disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Semestre Existente</span>
            </button>

            <button
              type="button"
              onClick={() => setModoSemestre('nuevo')}
              className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                modoSemestre === 'nuevo'
                  ? 'bg-[#E6EFF5] border-[#01579B] text-[#01579B]'
                  : 'border-[#E0E0E0] text-[#616161] hover:bg-[#F5F5F5]'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Crear Nuevo Semestre</span>
            </button>
          </div>

          {modoSemestre === 'existente' ? (
            <div>
              <label className="block text-xs text-[#616161] mb-1">Selecciona el semestre académico:</label>
              <select
                value={semestreId}
                onChange={(e) => setSemestreId(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-1 focus:ring-[#01579B] bg-white text-[#212121]"
              >
                {semestresDisponibles.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.cursoAcademico} • {s.periodo} ({new Date(s.fechaInicio).toLocaleDateString()} a {new Date(s.fechaFin).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="p-3 bg-[#FAFAFA] rounded-lg border border-[#E0E0E0] space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#616161] mb-1">
                    Denominación del Curso:
                  </label>
                  <input
                    type="text"
                    value={cursoDenominacion}
                    onChange={(e) => setCursoDenominacion(e.target.value)}
                    placeholder="ej. Curso 2026-2027"
                    className="w-full text-xs px-3 py-2 border border-[#E0E0E0] rounded-lg bg-white text-[#212121]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#616161] mb-1">
                    Periodo Semestral:
                  </label>
                  <select
                    value={periodoSemestre}
                    onChange={(e) => setPeriodoSemestre(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-[#E0E0E0] rounded-lg bg-white text-[#212121]"
                  >
                    <option value="SEM-01">SEM-01 (Semestre I)</option>
                    <option value="SEM-02">SEM-02 (Semestre II)</option>
                    <option value="EXTRA">EXTRA (Periodo Extraordinario)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#616161] mb-1">Año Inicio:</label>
                  <input
                    type="number"
                    value={anioInicio}
                    onChange={(e) => setAnioInicio(Number(e.target.value))}
                    className="w-full text-xs px-3 py-1.5 border border-[#E0E0E0] rounded-lg bg-white text-[#212121]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#616161] mb-1">Año Fin:</label>
                  <input
                    type="number"
                    value={anioFin}
                    onChange={(e) => setAnioFin(Number(e.target.value))}
                    className="w-full text-xs px-3 py-1.5 border border-[#E0E0E0] rounded-lg bg-white text-[#212121]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Datos de la Convocatoria */}
        <div className="space-y-3 pt-2 border-t border-[#EEEEEE]">
          <label className="block text-xs font-bold text-[#424242] uppercase tracking-wider">
            Detalles de la Convocatoria
          </label>

          <div>
            <label className="block text-xs text-[#616161] mb-1">Título / Denominación Oficial:</label>
            <input
              type="text"
              value={denominacion}
              onChange={(e) => setDenominacion(e.target.value)}
              placeholder="ej. Convocatoria Admisión Septiembre 2026"
              className="w-full text-xs px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-1 focus:ring-[#01579B] font-medium text-[#212121] bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#616161] mb-1">Fecha de Apertura:</label>
              <input
                type="date"
                value={fechaApertura}
                onChange={(e) => setFechaApertura(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-[#E0E0E0] rounded-lg bg-white text-[#212121]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#616161] mb-1">Fecha de Cierre Prevista:</label>
              <input
                type="date"
                value={fechaCierre}
                onChange={(e) => setFechaCierre(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-[#E0E0E0] rounded-lg bg-white text-[#212121]"
              />
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-between pt-4 border-t border-[#EEEEEE]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#424242] hover:bg-[#F5F5F5] rounded-lg border border-[#E0E0E0] transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={() => aperturarMutation.mutate()}
            disabled={aperturarMutation.isPending || !denominacion.trim() || !fechaApertura || !fechaCierre}
            className="px-5 py-2 bg-[#01579B] hover:bg-[#004174] text-white text-xs font-semibold rounded-lg shadow-2xs transition-all flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{aperturarMutation.isPending ? 'Aperturando...' : 'Aperturar Convocatoria'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AperturarConvocatoriaModal;