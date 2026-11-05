import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export const PostularPublicoPage: React.FC = () => {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail] = useState('');
  const [sedeOrigen, setSedeOrigen] = useState('SDR_ESP');
  const [telefono, setTelefono] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [registrado, setRegistrado] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await apiClient.post('/evaluacion/candidatos/publico', {
        nombre,
        apellidos,
        email,
        sedeOrigen,
        telefono: telefono || undefined,
      });
      setRegistrado(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Error al registrar la postulación. Verifica que el correo no esté registrado previamente.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (registrado) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans text-[#212121]">
        <div className="max-w-md w-full mx-auto bg-white rounded-lg shadow-funiber p-8 text-center border border-[#E0E0E0]">
          <div className="w-14 h-14 bg-[#E8F5E9] text-[#1B5E20] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#C8E6C9]">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-[#212121] mb-2 tracking-tight">¡Postulación Registrada!</h2>
          <p className="text-xs text-[#616161] mb-6 leading-relaxed">
            Hemos generado tu expediente de aspirante y tus baterías de evaluación técnica para el Programa PROFER.
          </p>

          <div className="bg-[#FAFAFA] border border-[#E0E0E0] rounded-lg p-4 text-xs text-left mb-6 space-y-1.5">
            <p className="text-[#757575] font-semibold text-[11px] uppercase tracking-wider">Credenciales provisionales:</p>
            <p className="text-[#212121]">
              <strong>Usuario:</strong> <span className="font-mono text-[#01579B]">{email}</span>
            </p>
            <p className="text-[#212121]">
              <strong>Contraseña inicial:</strong> <code className="bg-[#E6EFF5] text-[#01579B] px-1.5 py-0.5 rounded font-mono font-bold">CtsAcademy2026!</code>
            </p>
          </div>

          <button
            onClick={() => navigate('/login')}
            className="w-full py-2.5 px-4 bg-[#01579B] hover:bg-[#004174] text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center justify-center space-x-2 cursor-pointer uppercase tracking-wider"
          >
            <span>Iniciar Sesión y Rendir Evaluación</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans text-[#212121]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex p-3 bg-[#01579B] text-white rounded-lg shadow-xs mb-3 border border-[#004174]">
          <div className="w-10 h-10 flex items-center justify-center font-black text-lg tracking-wider">
            CTS
          </div>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <h1 className="text-2xl font-bold text-[#212121] tracking-tight">
            Postulación PROFER
          </h1>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-[#E6EFF5] text-[#01579B] px-2 py-0.5 rounded border border-[#CCDDEB]">
            Grupo FUNIBER
          </span>
        </div>
        <p className="mt-1 text-xs text-[#757575] font-medium">
          Centro Tecnológico de Desarrollo (CTS) • Universidad Europea del Atlántico
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-funiber rounded-lg sm:px-10 border border-[#E0E0E0]">
          <div className="mb-5 pb-3 border-b border-[#EEEEEE]">
            <h2 className="text-sm font-bold text-[#212121]">Formulario de Admisión Pública</h2>
            <p className="text-xs text-[#757575] mt-0.5">Ingresa tus datos para generar tu acceso de aspirante</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-[#FFEBEE] border border-[#FFCDD2] rounded-lg flex items-start space-x-2 text-[#D32F2F] text-xs font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#D32F2F]" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#424242] mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-xs text-[#212121] bg-white focus:ring-2 focus:ring-[#01579B] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#424242] mb-1">Apellidos</label>
                <input
                  type="text"
                  required
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                  placeholder="Tus apellidos"
                  className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-xs text-[#212121] bg-white focus:ring-2 focus:ring-[#01579B] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#424242] mb-1">Correo Electrónico</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@alumnos.uneatlantico.es"
                className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-xs text-[#212121] bg-white focus:ring-2 focus:ring-[#01579B] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#424242] mb-1">Sede de Origen</label>
                <select
                  value={sedeOrigen}
                  onChange={(e) => setSedeOrigen(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-xs text-[#212121] bg-white focus:ring-2 focus:ring-[#01579B] focus:outline-none"
                >
                  <option value="SDR_ESP">Santander (España)</option>
                  <option value="COL_BOG">Bogotá (Colombia)</option>
                  <option value="MEX_CDMX">Ciudad de México</option>
                  <option value="GTM_GUA">Guatemala</option>
                  <option value="PER_LIM">Lima (Perú)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#424242] mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="+34 600 000 000"
                  className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-xs text-[#212121] bg-white focus:ring-2 focus:ring-[#01579B] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-[#01579B] hover:bg-[#004174] disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center justify-center space-x-2 cursor-pointer uppercase tracking-wider"
              >
                {isLoading ? (
                  <span className="flex items-center space-x-2">
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Enviando...</span>
                  </span>
                ) : (
                  <>
                    <span>Enviar Postulación</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-[#EEEEEE] flex items-center justify-center">
            <Link
              to="/login"
              className="text-xs text-[#01579B] hover:text-[#004174] font-semibold flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>¿Ya tienes cuenta? Iniciar Sesión</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostularPublicoPage;
