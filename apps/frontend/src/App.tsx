import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { PostulacionPanelPage } from './pages/candidato/PostulacionPanelPage';
import { AlumnoPanelPage } from './pages/alumno/AlumnoPanelPage';
import { LiderPanelPage } from './pages/lider/LiderPanelPage';
import { AdmisionesPanelPage } from './pages/admisiones/AdmisionesPanelPage';
import { RolUsuario } from '@cts/shared-types';

const HomeRedirect: React.FC = () => {
  const { isAuthenticated, usuario, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !usuario) {
    return <Navigate to="/login" replace />;
  }

  switch (usuario.rol) {
    case RolUsuario.CANDIDATO:
      return <Navigate to="/evaluacion/panel" replace />;
    case RolUsuario.ALUMNO:
      return <Navigate to="/formacion/panel" replace />;
    case RolUsuario.LIDER_EQUIPO:
      return <Navigate to="/lider/panel" replace />;
    case RolUsuario.GESTOR:
      return <Navigate to="/admisiones/panel" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<HomeRedirect />} />

          {/* Portal de Postulante / Candidato */}
          <Route element={<ProtectedRoute allowedRoles={[RolUsuario.CANDIDATO]} />}>
            <Route path="/evaluacion/panel" element={<PostulacionPanelPage />} />
          </Route>

          {/* Portal de Alumno Profer */}
          <Route element={<ProtectedRoute allowedRoles={[RolUsuario.ALUMNO]} />}>
            <Route path="/formacion/panel" element={<AlumnoPanelPage />} />
          </Route>

          {/* Portal de Líder de Equipo / Tech Leader */}
          <Route element={<ProtectedRoute allowedRoles={[RolUsuario.LIDER_EQUIPO, RolUsuario.GESTOR]} />}>
            <Route path="/lider/panel" element={<LiderPanelPage />} />
          </Route>

          {/* Portal de Admisiones / Gestor */}
          <Route element={<ProtectedRoute allowedRoles={[RolUsuario.GESTOR]} />}>
            <Route path="/admisiones/panel" element={<AdmisionesPanelPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<HomeRedirect />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
