import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-2xl p-8 text-center border border-slate-100">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">¡Postulación Registrada!</h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Hemos generado tu expediente de aspirante y tus baterías de evaluación técnica para el Programa PROFER.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-left mb-6 space-y-1">
            <p className="text-slate-500">Credenciales de acceso provisionales:</p>
            <p>
              <strong>Usuario:</strong> {email}
            </p>
            <p>
              <strong>Contraseña predeterminada:</strong> <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono font-bold text-brand-700">CtsAcademy2026!</code>
            </p>
          </div>

          <button
            onClick={() => navigate('/login')}
            className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold shadow-md transition-colors flex items-center justify-center space-x-2"
          >
            <span>Iniciar Sesión y Rendir Evaluación</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex p-3 bg-brand-600 text-white rounded-2xl shadow-xl shadow-brand-500/20 mb-3">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Postulación PROFER</h2>
        <p className="mt-1 text-sm text-slate-400">
          Centro Tecnológico de Desarrollo (CTS) • UNEATLANTICO
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2 text-red-700 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Apellidos</label>
                <input
                  type="text"
                  required
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                  placeholder="Tus apellidos"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Correo Electrónico</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@alumnos.uneatlantico.es"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Sede de Origen</label>
                <select
                  value={sedeOrigen}
                  onChange={(e) => setSedeOrigen(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="SDR_ESP">Santander (España)</option>
                  <option value="COL_BOG">Bogotá (Colombia)</option>
                  <option value="MEX_CDMX">Ciudad de México</option>
                  <option value="GTM_GUA">Guatemala</option>
                  <option value="PER_LIM">Lima (Perú)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="+34600000000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold shadow-md transition-colors flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <span>Enviar Postulación</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center">
            <Link
              to="/login"
              className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center space-x-1"
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
