import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import {
  Mail,
  Copy,
  Check,
  Send,
  X,
  ExternalLink,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';

interface InvitacionCandidatoModalProps {
  candidatoId: string;
  candidatoNombre: string;
  candidatoEmail: string;
  isOpen: boolean;
  onClose: () => void;
  onSentSuccess?: () => void;
}

export const InvitacionCandidatoModal: React.FC<InvitacionCandidatoModalProps> = ({
  candidatoId,
  candidatoNombre,
  candidatoEmail,
  isOpen,
  onClose,
  onSentSuccess,
}) => {
  const queryClient = useQueryClient();
  const [copiadoCredenciales, setCopiadoCredenciales] = useState(false);
  const [copiadoPlantilla, setCopiadoPlantilla] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['invitacion-candidato', candidatoId],
    queryFn: async () => {
      const res = await apiClient.get(`/evaluacion/candidatos/${candidatoId}/invitacion`);
      return res.data;
    },
    enabled: isOpen && Boolean(candidatoId),
  });

  const enviarMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post(`/evaluacion/candidatos/${candidatoId}/invitacion`, {});
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admisiones-panel'] });
      queryClient.invalidateQueries({ queryKey: ['candidato-perfil', candidatoId] });
      queryClient.invalidateQueries({ queryKey: ['invitacion-candidato', candidatoId] });
      refetch();
      if (onSentSuccess) onSentSuccess();
    },
  });

  if (!isOpen) return null;

  const copiarCredenciales = () => {
    const texto = `Enlace: ${data?.urlLogin || 'http://localhost:3000/login'}\nUsuario: ${candidatoEmail}\nContraseña: ${data?.contrasenaDefault || 'CtsAcademy2026!'}`;
    navigator.clipboard.writeText(texto);
    setCopiadoCredenciales(true);
    setTimeout(() => setCopiadoCredenciales(false), 2500);
  };

  const copiarPlantillaCompleta = () => {
    if (!data) return;
    const texto = `Asunto: ${data.asunto}\n\n${data.cuerpo}`;
    navigator.clipboard.writeText(texto);
    setCopiadoPlantilla(true);
    setTimeout(() => setCopiadoPlantilla(false), 2500);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-500/30">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Invitación y Credenciales de Postulación
              </h3>
              <p className="text-xs text-indigo-200">
                {candidatoNombre} • {candidatoEmail}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido Scrollable */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-slate-800 text-sm">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
              <p className="text-xs text-slate-500 font-medium">Generando credenciales y plantilla...</p>
            </div>
          ) : (
            <>
              {/* Badge de Estado del Envío */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center space-x-2">
                  {data?.invitacionEnviada ? (
                    <div className="p-1 bg-emerald-100 text-emerald-700 rounded-lg">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="p-1 bg-amber-100 text-amber-700 rounded-lg">
                      <Clock className="w-4 h-4" />
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-bold block text-slate-900">
                      Estado del Correo de Invitación
                    </span>
                    <span className="text-xs text-slate-500">
                      {data?.invitacionEnviada
                        ? `Enviado oficialmente el ${new Date(data.fechaEnvio).toLocaleString('es-ES')}`
                        : 'Pendiente de envío al postulante'}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    data?.invitacionEnviada
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  {data?.invitacionEnviada ? 'Despachado' : 'Pendiente'}
                </span>
              </div>

              {/* Tarjeta de Credenciales Rápidas */}
              <div className="bg-gradient-to-br from-indigo-50/70 to-blue-50/70 border border-indigo-100 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Credenciales Provisionales Generadas</span>
                  </span>
                  <button
                    onClick={copiarCredenciales}
                    className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-white px-2.5 py-1 rounded-md border border-indigo-200 shadow-2xs inline-flex items-center space-x-1 transition-all"
                  >
                    {copiadoCredenciales ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">¡Copiadas!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copiar Credenciales</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-indigo-100">
                    <span className="text-[10px] uppercase font-sans font-bold text-slate-400 block">
                      Enlace de Acceso
                    </span>
                    <a
                      href={data?.urlLogin || 'http://localhost:3000/login'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 font-medium hover:underline inline-flex items-center space-x-1 mt-0.5 truncate max-w-full"
                    >
                      <span>{data?.urlLogin || 'http://localhost:3000/login'}</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-indigo-100">
                    <span className="text-[10px] uppercase font-sans font-bold text-slate-400 block">
                      Usuario (Email)
                    </span>
                    <span className="text-slate-800 font-medium truncate block mt-0.5">
                      {candidatoEmail}
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-indigo-100">
                    <span className="text-[10px] uppercase font-sans font-bold text-slate-400 block">
                      Contraseña Temporal
                    </span>
                    <span className="text-slate-900 font-bold tracking-wider block mt-0.5">
                      {data?.contrasenaDefault || 'CtsAcademy2026!'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vista Previa del Correo Oficial */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Plantilla Oficial de Correo (PROFER)
                  </span>
                  <button
                    onClick={copiarPlantillaCompleta}
                    className="text-xs text-slate-600 hover:text-slate-900 inline-flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md transition-colors"
                  >
                    {copiadoPlantilla ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">¡Mensaje Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copiar Mensaje Completo</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1 font-mono">
                  <div>
                    <span className="font-bold text-slate-500 font-sans">Para:</span>{' '}
                    <span className="text-slate-800">{candidatoEmail}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500 font-sans">Asunto:</span>{' '}
                    <span className="text-indigo-900 font-semibold">{data?.asunto}</span>
                  </div>
                </div>

                <div className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto border border-slate-800 shadow-inner">
                  {data?.cuerpo}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Acciones */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-slate-500 italic">
            El aspirante recibirá el enlace oficial y sus credenciales para completar las 3 baterías.
          </p>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-white transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={() => enviarMutation.mutate()}
              disabled={enviarMutation.isPending || isLoading}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all inline-flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {enviarMutation.isPending
                  ? 'Despachando...'
                  : data?.invitacionEnviada
                  ? 'Reenviar Invitación'
                  : 'Enviar Invitación Oficial'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitacionCandidatoModal;
