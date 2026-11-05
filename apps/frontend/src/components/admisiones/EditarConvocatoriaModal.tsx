import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import {
  X,
  AlertCircle,
  Save,
  Settings,
} from 'lucide-react';

export interface ConvocatoriaParaEditar {
  id: string;
  denominacion: string;
  fechaApertura: string;
  fechaCierre: string;
  modeloAdmision?: string;
  estado: string;
  semestre?: string;
}

interface EditarConvocatoriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  convocatoria: ConvocatoriaParaEditar | null;
}

export const EditarConvocatoriaModal: React.FC<EditarConvocatoriaModalProps> = ({
  isOpen,
  onClose,
  convocatoria,
}) => {
  const queryClient = useQueryClient();

  const [denominacion, setDenominacion] = useState('');
  const [fechaApertura, setFechaApertura] = useState('');
  const [fechaCierre, setFechaCierre] = useState('');
  const [modeloAdmision, setModeloAdmision] = useState('CONTINUA');
  const [estado, setEstado] = useState('ABIERTA');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (convocatoria) {
      setDenominacion(convocatoria.denominacion || '');
      setFechaApertura(
        convocatoria.fechaApertura ? convocatoria.fechaApertura.split('T')[0] : '',
      );
      setFechaCierre(
        convocatoria.fechaCierre ? convocatoria.fechaCierre.split('T')[0] : '',
      );
      setModeloAdmision(convocatoria.modeloAdmision || 'CONTINUA');
      setEstado(convocatoria.estado || 'ABIERTA');
      setErrorMsg(null);
    }
  }, [convocatoria, isOpen]);

  const editarMutation = useMutation({
    mutationFn: async () => {
      if (!convocatoria?.id) {
        throw new Error('No se ha especificado la convocatoria a editar.');
      }
      setErrorMsg(null);

      const payload: any = {
        denominacion: denominacion.trim(),
        fechaApertura: new Date(fechaApertura).toISOString(),
        fechaCierre: new Date(fechaCierre).toISOString(),
        modeloAdmision,
        estado,
      };

      const res = await apiClient.patch(`/equipos/convocatorias/${convocatoria.id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admisiones-panel'] });
      onClose();
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.message || err.message || 'Error al editar la convocatoria.';
      setErrorMsg(Array.isArray(msg) ? msg.join(', ') : msg);
    },
  });

  if (!isOpen || !convocatoria) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 my-8 space-y-5">
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-brand-50 text-brand-600 border border-brand-100">
              <Settings className="w-5 h-5 text-[#01579B]" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Editar Convocatoria</h3>
              <p className="text-xs text-slate-500">
                Corrige la denominación, el periodo de vigencia o el estado de la convocatoria.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
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

        <div className="space-y-4">
          {/* Denominación */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Título / Denominación Oficial:
            </label>
            <input
              type="text"
              value={denominacion}
              onChange={(e) => setDenominacion(e.target.value)}
              placeholder="ej. Convocatoria Admisión Febrero 2026"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#01579B] font-medium"
            />
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Fecha de Apertura:
              </label>
              <input
                type="date"
                value={fechaApertura}
                onChange={(e) => setFechaApertura(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#01579B]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Fecha de Cierre:
              </label>
              <input
                type="date"
                value={fechaCierre}
                onChange={(e) => setFechaCierre(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#01579B]"
              />
            </div>
          </div>

          {/* Modelo de Admisión y Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Modelo de Admisión:
              </label>
              <select
                value={modeloAdmision}
                onChange={(e) => setModeloAdmision(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#01579B]"
              >
                <option value="CONTINUA">Admisión Continua (Rolling)</option>
                <option value="BATCH">Admisión por Cohortes (Batch)</option>
                <option value="MIXTA">Admisión Mixta</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Estado Operativo:
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#01579B]"
              >
                <option value="ABIERTA">🟢 ABIERTA (Activa para postulaciones)</option>
                <option value="CERRADA">⚪ CERRADA (Corte semestral finalizado)</option>
                <option value="PAUSADA">🟡 PAUSADA (Temporalmente detenida)</option>
              </select>
            </div>
          </div>

          {convocatoria.semestre && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <span className="font-medium">Semestre Académico Vinculado:</span>
              <span className="font-bold text-slate-800">{convocatoria.semestre}</span>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={() => editarMutation.mutate()}
            disabled={
              editarMutation.isPending ||
              !denominacion.trim() ||
              !fechaApertura ||
              !fechaCierre
            }
            className="px-5 py-2.5 bg-[#01579B] hover:bg-[#004174] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
          >
            {editarMutation.isPending ? (
              <span>Guardando...</span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditarConvocatoriaModal;
