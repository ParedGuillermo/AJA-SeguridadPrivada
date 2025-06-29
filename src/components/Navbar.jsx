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
    <nav className="text-white bg-black shadow-md">
      <div className="max-w-5xl px-3 mx-auto sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 sm:h-14">
          <div className="flex-shrink-0 text-base font-bold select-none sm:text-lg">
            Sistema Control
          </div>

          {/* Botón hamburguesa móvil */}
          <div className="sm:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              className="p-1 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <svg
                className="w-5 h-5"
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
          <div className="items-center hidden space-x-5 text-sm sm:flex sm:text-base">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive
                  ? 'border-b-2 border-white pb-0.5 font-semibold'
                  : 'hover:border-b-2 hover:border-white pb-0.5 transition'
              }
              onClick={() => setMenuOpen(false)}
            >
              Registro Horarios
            </NavLink>

            <NavLink
              to="/control"
              className={({ isActive }) =>
                isActive
                  ? 'border-b-2 border-white pb-0.5 font-semibold'
                  : 'hover:border-b-2 hover:border-white pb-0.5 transition'
              }
              onClick={() => setMenuOpen(false)}
            >
              Control Personal
            </NavLink>

            <NavLink
              to="/control-horas"
              className={({ isActive }) =>
                isActive
                  ? 'border-b-2 border-white pb-0.5 font-semibold'
                  : 'hover:border-b-2 hover:border-white pb-0.5 transition'
              }
              onClick={() => setMenuOpen(false)}
            >
              Control Horas
            </NavLink>

            <button
              onClick={handleLogout}
              className="px-3 py-1 ml-6 text-sm transition bg-red-600 rounded hover:bg-red-700"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {menuOpen && (
          <div className="px-2 pb-3 mt-2 space-y-1 text-sm border-t border-gray-700 sm:hidden">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive
                  ? 'block border-b-2 border-white pb-1 font-semibold'
                  : 'block hover:border-b-2 hover:border-white pb-1 transition'
              }
              onClick={() => setMenuOpen(false)}
            >
              Registro Horarios
            </NavLink>

            <NavLink
              to="/control"
              className={({ isActive }) =>
                isActive
                  ? 'block border-b-2 border-white pb-1 font-semibold'
                  : 'block hover:border-b-2 hover:border-white pb-1 transition'
              }
              onClick={() => setMenuOpen(false)}
            >
              Control Personal
            </NavLink>

            <NavLink
              to="/control-horas"
              className={({ isActive }) =>
                isActive
                  ? 'block border-b-2 border-white pb-1 font-semibold'
                  : 'block hover:border-b-2 hover:border-white pb-1 transition'
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
              className="w-full px-3 py-2 text-sm transition bg-red-600 rounded hover:bg-red-700"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
