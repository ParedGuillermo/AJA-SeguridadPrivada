import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function EmployeeForm({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [nroInterno, setNroInterno] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nombre || !apellido || !departamento) {
      alert('Completa los campos obligatorios');
      return;
    }

    const { error } = await supabase.from('personal').insert({
      nombre,
      apellido,
      departamento,
      nro_interno: nroInterno,
      hora_entrada: '06:30:00',
      horas_justificadas: 0,
    });

    if (error) {
      alert('Error al agregar empleado: ' + error.message);
    } else {
      setNombre('');
      setApellido('');
      setDepartamento('');
      setNroInterno('');
      setOpen(false);
      onAdd();
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-yellow-400 text-white px-4 py-2 rounded shadow hover:bg-yellow-500 transition w-full sm:w-auto"
      >
        + Agregar Empleado
      </button>

      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded shadow-lg p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold mb-4 text-center">Nuevo Empleado</h2>

            <label className="block mb-3">
              Nombre*:
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
            </label>

            <label className="block mb-3">
              Apellido*:
              <input
                type="text"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
            </label>

            <label className="block mb-3">
              Departamento*:
              <input
                type="text"
                value={departamento}
                onChange={(e) => setDepartamento(e.target.value)}
                placeholder="Ejemplo: Legales"
                className="w-full border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
            </label>

            <label className="block mb-4">
              Número Interno:
              <input
                type="text"
                value={nroInterno}
                onChange={(e) => setNroInterno(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </label>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded border border-gray-400 hover:bg-gray-100 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-yellow-400 text-white px-4 py-2 rounded shadow hover:bg-yellow-500 transition"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
