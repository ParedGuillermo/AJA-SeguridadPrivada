import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function EditHoursModal({ employee, onClose }) {
  const [nombre, setNombre] = useState(employee.nombre);
  const [apellido, setApellido] = useState(employee.apellido);
  const [departamento, setDepartamento] = useState(employee.departamento);
  const [nroInterno, setNroInterno] = useState(employee.nro_interno);
  const [horaEntrada, setHoraEntrada] = useState(formatTime(employee.hora_entrada) || '06:30');
  const [horaSalida, setHoraSalida] = useState(formatTime(employee.hora_salida) || '');
  const [horasJustificadas, setHorasJustificadas] = useState(employee.horas_justificadas || 0);
  const [saving, setSaving] = useState(false);

  function formatTime(t) {
    if (!t) return '';
    if (t.length >= 5) return t.slice(0, 5);
    return t;
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from('personal')
      .update({
        nombre,
        apellido,
        departamento,
        nro_interno: nroInterno,
        hora_entrada: horaEntrada,
        hora_salida: horaSalida,
        horas_justificadas: parseFloat(horasJustificadas),
      })
      .eq('id', employee.id);

    setSaving(false);

    if (error) {
      alert('Error al guardar: ' + error.message);
    } else {
      onClose();
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50"
    >
      <form
        onSubmit={handleSave}
        className="bg-white rounded shadow-lg w-full max-w-md p-6"
      >
        <h2 className="text-xl font-bold mb-4 text-center">Editar Empleado</h2>

        <label className="block mb-3">
          Nombre:
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            required
          />
        </label>

        <label className="block mb-3">
          Apellido:
          <input
            type="text"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            required
          />
        </label>

        <label className="block mb-3">
          Departamento:
          <input
            type="text"
            value={departamento}
            onChange={(e) => setDepartamento(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            required
          />
        </label>

        <label className="block mb-3">
          Número Interno:
          <input
            type="text"
            value={nroInterno}
            onChange={(e) => setNroInterno(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </label>

        <label className="block mb-3">
          Hora Entrada:
          <input
            type="time"
            value={horaEntrada}
            onChange={(e) => setHoraEntrada(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </label>

        <label className="block mb-3">
          Hora Salida:
          <input
            type="time"
            value={horaSalida}
            onChange={(e) => setHoraSalida(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </label>

        <label className="block mb-5">
          Horas Justificadas Usadas (máx 3):
          <input
            type="number"
            min="0"
            max="3"
            step="0.25"
            value={horasJustificadas}
            onChange={(e) => setHorasJustificadas(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </label>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded border border-gray-400 hover:bg-gray-100 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-yellow-400 text-white px-4 py-2 rounded shadow hover:bg-yellow-500 transition"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}
