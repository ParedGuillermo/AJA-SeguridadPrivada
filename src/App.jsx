import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import RegistroUsuarios from './pages/RegistroUsuarios';
import ControlPersonal from './pages/ControlPersonal';
import ControlHoras from './pages/ControlHoras';
import Auth from './pages/Auth';
import { supabase } from './supabaseClient';

function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) return <div className="p-4">Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Auth />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <RegistroUsuarios />
          </ProtectedRoute>
        }
      />
      <Route
        path="/control"
        element={
          <ProtectedRoute>
            <ControlPersonal />
          </ProtectedRoute>
        }
      />
      <Route
        path="/control-horas"
        element={
          <ProtectedRoute>
            <ControlHoras />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
