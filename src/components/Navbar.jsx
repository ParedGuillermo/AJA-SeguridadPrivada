import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    setMenuOpen(false);
    navigate('/');
  }

  return (
    <nav className="bg-black text-white shadow-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          <div className="flex-shrink-0 font-bold text-lg select-none">
            Sistema Control
          </div>

          {/* Botón hamburguesa móvil */}
          <div className="sm:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              className="focus:outline-none focus:ring-2 focus:ring-white"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Menú desktop */}
          <div className="hidden sm:flex space-x-6 items-center">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? 'border-b-2 border-white pb-1 font-semibold' : 'hover:border-b-2 hover:border-white pb-1 transition'
              }
              onClick={() => setMenuOpen(false)}
            >
              Registro Horarios
            </NavLink>

            <NavLink
              to="/control"
              className={({ isActive }) =>
                isActive ? 'border-b-2 border-white pb-1 font-semibold' : 'hover:border-b-2 hover:border-white pb-1 transition'
              }
              onClick={() => setMenuOpen(false)}
            >
              Control Personal
            </NavLink>

            <NavLink
              to="/control-horas"
              className={({ isActive }) =>
                isActive ? 'border-b-2 border-white pb-1 font-semibold' : 'hover:border-b-2 hover:border-white pb-1 transition'
              }
              onClick={() => setMenuOpen(false)}
            >
              Control Horas
            </NavLink>

            <button
              onClick={handleLogout}
              className="ml-6 bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded transition"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {menuOpen && (
          <div className="sm:hidden mt-2 space-y-2 px-2 pb-3 border-t border-gray-700">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? 'block border-b-2 border-white pb-1 font-semibold' : 'block hover:border-b-2 hover:border-white pb-1 transition'
              }
              onClick={() => setMenuOpen(false)}
            >
              Registro Horarios
            </NavLink>

            <NavLink
              to="/controlpersonal"
              className={({ isActive }) =>
                isActive ? 'block border-b-2 border-white pb-1 font-semibold' : 'block hover:border-b-2 hover:border-white pb-1 transition'
              }
              onClick={() => setMenuOpen(false)}
            >
              Control Personal
            </NavLink>

            <NavLink
              to="/control-horas"
              className={({ isActive }) =>
                isActive ? 'block border-b-2 border-white pb-1 font-semibold' : 'block hover:border-b-2 hover:border-white pb-1 transition'
              }
              onClick={() => setMenuOpen(false)}
            >
              Control Horas
            </NavLink>

            <button
              onClick={() => {
                handleLogout();
                setMenuOpen(false);
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded transition"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
