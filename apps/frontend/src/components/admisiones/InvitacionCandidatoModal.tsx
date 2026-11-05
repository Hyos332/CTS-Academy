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
      className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-sans"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full border border-[#E0E0E0] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal - FUNIBER SD v2.1 */}
        <div className="px-6 py-4 bg-[#01579B] text-white flex justify-between items-center border-b border-[#004174]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 text-white rounded-lg border border-white/20">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white tracking-tight">
                Invitación y Credenciales de Postulación
              </h3>
              <p className="text-xs text-white/80">
                {candidatoNombre} • {candidatoEmail}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido Scrollable */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-[#212121] text-sm">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#01579B]" />
              <p className="text-xs text-[#616161] font-medium">Generando credenciales y plantilla...</p>
            </div>
          ) : (
            <>
              {/* Badge de Estado del Envío */}
              <div className="flex items-center justify-between p-3.5 bg-[#FAFAFA] border border-[#E0E0E0] rounded-lg">
                <div className="flex items-center space-x-2.5">
                  {data?.invitacionEnviada ? (
                    <div className="p-1.5 bg-success-50 text-success-800 rounded-lg border border-success-200">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="p-1.5 bg-high-50 text-high-900 rounded-lg border border-high-200">
                      <Clock className="w-4 h-4" />
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-bold block text-[#212121]">
                      Estado del Correo de Invitación
                    </span>
                    <span className="text-xs text-[#616161]">
                      {data?.invitacionEnviada
                        ? `Enviado oficialmente el ${new Date(data.fechaEnvio).toLocaleString('es-ES')}`
                        : 'Pendiente de envío al postulante'}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    data?.invitacionEnviada
                      ? 'bg-success-50 text-success-800 border border-success-200'
                      : 'bg-high-50 text-high-900 border border-high-200'
                  }`}
                >
                  {data?.invitacionEnviada ? 'Despachado' : 'Pendiente'}
                </span>
              </div>

              {/* Tarjeta de Credenciales Rápidas */}
              <div className="bg-[#E6EFF5] border border-[#CCDDEB] rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#01579B] uppercase tracking-wider flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#01579B]" />
                    <span>Credenciales Provisionales Generadas</span>
                  </span>
                  <button
                    onClick={copiarCredenciales}
                    className="text-xs font-semibold text-[#01579B] hover:text-[#004174] bg-white px-2.5 py-1 rounded-lg border border-[#CCDDEB] shadow-2xs inline-flex items-center space-x-1 transition-all cursor-pointer"
                  >
                    {copiadoCredenciales ? (
                      <>
                        <Check className="w-3 h-3 text-success-800" />
                        <span className="text-success-800 font-bold">¡Copiadas!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-[#01579B]" />
                        <span>Copiar Credenciales</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-[#CCDDEB]">
                    <span className="text-[10px] uppercase font-sans font-bold text-[#757575] block">
                      Enlace de Acceso
                    </span>
                    <a
                      href={data?.urlLogin || 'http://localhost:3000/login'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#01579B] font-medium hover:underline inline-flex items-center space-x-1 mt-0.5 truncate max-w-full"
                    >
                      <span>{data?.urlLogin || 'http://localhost:3000/login'}</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-[#CCDDEB]">
                    <span className="text-[10px] uppercase font-sans font-bold text-[#757575] block">
                      Usuario (Email)
                    </span>
                    <span className="text-[#212121] font-medium truncate block mt-0.5">
                      {candidatoEmail}
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-[#CCDDEB]">
                    <span className="text-[10px] uppercase font-sans font-bold text-[#757575] block">
                      Contraseña Temporal
                    </span>
                    <span className="text-[#01579B] font-bold tracking-wider block mt-0.5">
                      {data?.contrasenaDefault || 'CtsAcademy2026!'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vista Previa del Correo Oficial */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#424242] uppercase tracking-wider">
                    Plantilla Oficial de Correo (PROFER)
                  </span>
                  <button
                    onClick={copiarPlantillaCompleta}
                    className="text-xs text-[#424242] hover:text-[#212121] inline-flex items-center space-x-1 bg-[#F5F5F5] hover:bg-[#EEEEEE] px-2.5 py-1 rounded-lg border border-[#E0E0E0] transition-colors cursor-pointer"
                  >
                    {copiadoPlantilla ? (
                      <>
                        <Check className="w-3 h-3 text-success-800" />
                        <span className="text-success-800 font-bold">¡Mensaje Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copiar Mensaje Completo</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-3 bg-[#FAFAFA] border border-[#E0E0E0] rounded-lg text-xs space-y-1 font-mono">
                  <div>
                    <span className="font-bold text-[#757575] font-sans">Para:</span>{' '}
                    <span className="text-[#212121]">{candidatoEmail}</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#757575] font-sans">Asunto:</span>{' '}
                    <span className="text-[#01579B] font-semibold">{data?.asunto}</span>
                  </div>
                </div>

                <div className="bg-[#212121] text-[#FAFAFA] p-4 rounded-lg text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto border border-[#424242] shadow-inner">
                  {data?.cuerpo}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Acciones */}
        <div className="px-6 py-4 bg-[#FAFAFA] border-t border-[#E0E0E0] flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-[#757575] italic">
            El aspirante dispondrá de credenciales de acceso para completar las 3 baterías de admisión.
          </p>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[#E0E0E0] text-[#424242] hover:bg-[#F5F5F5] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Cerrar
            </button>
            <button
              onClick={() => enviarMutation.mutate()}
              disabled={enviarMutation.isPending || isLoading}
              className="px-4 py-2 bg-[#01579B] hover:bg-[#004174] text-white text-xs font-bold rounded-lg shadow-2xs transition-all inline-flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
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
