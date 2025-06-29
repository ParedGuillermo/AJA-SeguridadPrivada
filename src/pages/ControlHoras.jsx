import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const HORAS_MENSUALES = 3;

export default function ControlHoras() {
  const [empleados, setEmpleados] = useState([]);
  const [horasUsadas, setHorasUsadas] = useState({});
  const [salidas, setSalidas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [formData, setFormData] = useState({
    empleado_id: '',
    fecha: '',
    hora_salida: '',
    hora_regreso: '',
    motivo: '',
  });

  const inputClass = "w-full border border-gray-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black";

  async function fetchEmpleados() {
    try {
      const { data, error } = await supabase
        .from('personal')
        .select('id, nombre, apellido')
        .order('apellido');
      if (error) throw error;
      setEmpleados(data);
    } catch (error) {
      alert('Error cargando empleados: ' + error.message);
    }
  }

  async function fetchHorasUsadas() {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextYear = month === 12 ? year + 1 : year;
      const endDate = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`;

      const { data, error } = await supabase
        .from('salidas_autorizadas')
        .select('empleado_id, horas')
        .gte('fecha', startDate)
        .lt('fecha', endDate);

      if (error) throw error;

      const sumHoras = {};
      data.forEach(({ empleado_id, horas }) => {
        if (!sumHoras[empleado_id]) sumHoras[empleado_id] = 0;
        sumHoras[empleado_id] += horas;
      });

      setHorasUsadas(sumHoras);
    } catch (error) {
      alert('Error cargando horas usadas: ' + error.message);
    }
  }

  async function fetchSalidas() {
    try {
      const { data, error } = await supabase
        .from('salidas_autorizadas')
        .select('id, fecha, motivo, hora_salida, hora_regreso, empleado_id, personal:empleado_id(nombre, apellido)')
        .order('fecha', { ascending: false });
      if (error) throw error;
      setSalidas(data);
    } catch (error) {
      alert('Error cargando salidas: ' + error.message);
    }
  }

  async function cargarDatos() {
    setLoading(true);
    await fetchEmpleados();
    await fetchHorasUsadas();
    await fetchSalidas();
    setLoading(false);
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  const empleadosFiltrados = empleados.filter((emp) =>
    emp.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    emp.apellido.toLowerCase().includes(busqueda.toLowerCase())
  );

  async function guardarSalidaAutorizada(e) {
    e.preventDefault();

    const { empleado_id, fecha, hora_salida, hora_regreso, motivo } = formData;

    if (!empleado_id || !fecha || !hora_salida || !hora_regreso || !motivo.trim()) {
      alert('Por favor, completá todos los campos.');
      return;
    }

    setGuardando(true);
    try {
      const { error } = await supabase
        .from('salidas_autorizadas')
        .insert([{ empleado_id, fecha, hora_salida, hora_regreso, motivo }]);
      if (error) throw error;

      alert('Salida registrada correctamente');
      setMostrarFormulario(false);
      setFormData({
        empleado_id: '',
        fecha: '',
        hora_salida: '',
        hora_regreso: '',
        motivo: '',
      });
      cargarDatos();
    } catch (error) {
      alert('Error al guardar salida: ' + error.message);
    } finally {
      setGuardando(false);
    }
  }

  if (loading) {
    return <p className="mt-10 text-center text-gray-700">Cargando datos...</p>;
  }

  return (
    <div className="max-w-5xl p-6 mx-auto text-gray-900 bg-white rounded shadow-md">
      <h2 className="mb-6 text-2xl font-bold text-center">Control de Horas Justificadas</h2>

      <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:justify-between">
        <input
          type="text"
          placeholder="Buscar por nombre o apellido..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full px-4 py-2 border border-gray-400 rounded sm:w-1/2 focus:outline-none focus:ring-2 focus:ring-black"
          aria-label="Buscar empleado por nombre o apellido"
        />

        <button
          className="px-4 py-2 text-white bg-black rounded hover:bg-gray-800"
          onClick={() => setMostrarFormulario(true)}
          type="button"
        >
          + Registrar Salida Autorizada
        </button>
      </div>

      {/* Tabla horas restantes */}
      <table className="min-w-full mb-10 border border-gray-700 rounded">
        <thead className="text-white bg-black">
          <tr>
            <th className="p-3 text-left border-r border-gray-700">Nombre</th>
            <th className="p-3 text-left border-r border-gray-700">Apellido</th>
            <th className="p-3 text-center">Horas Restantes</th>
          </tr>
        </thead>
        <tbody>
          {empleadosFiltrados.map((emp) => {
            const usadas = horasUsadas[emp.id] || 0;
            const restantes = Math.max(0, HORAS_MENSUALES - usadas);

            return (
              <tr key={emp.id} className="transition border-t border-gray-700 hover:bg-gray-100">
                <td className="p-3 border-r border-gray-700">{emp.nombre}</td>
                <td className="p-3 border-r border-gray-700">{emp.apellido}</td>
                <td className="p-3 font-semibold text-center">{restantes.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Tabla salidas registradas */}
      <h3 className="mb-2 text-xl font-bold">Salidas Registradas</h3>
      <table className="min-w-full mb-6 text-sm border border-gray-400 rounded">
        <thead className="text-white bg-gray-800">
          <tr>
            <th className="p-2">Fecha</th>
            <th className="p-2">Empleado</th>
            <th className="p-2">Motivo</th>
            <th className="p-2">Hora Salida</th>
            <th className="p-2">Hora Regreso</th>
          </tr>
        </thead>
        <tbody>
          {salidas.map((salida) => (
            <tr key={salida.id} className="border-t border-gray-300">
              <td className="p-2">{salida.fecha}</td>
              <td className="p-2">{`${salida.personal.nombre} ${salida.personal.apellido}`}</td>
              <td className="p-2">{salida.motivo}</td>
              <td className="p-2">{salida.hora_salida}</td>
              <td className="p-2">{salida.hora_regreso}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Formulario modal */}
      {mostrarFormulario && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="w-full max-w-md p-6 bg-white rounded shadow-md">
            <h3 id="modal-title" className="mb-4 text-lg font-bold">
              Registrar Salida Autorizada
            </h3>
            <form onSubmit={guardarSalidaAutorizada} className="space-y-3">
              <select
                required
                value={formData.empleado_id}
                onChange={(e) => setFormData({ ...formData, empleado_id: e.target.value })}
                className={inputClass}
                aria-label="Seleccionar empleado"
              >
                <option value="">Seleccionar empleado</option>
                {empleados.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.apellido}, {emp.nombre}
                  </option>
                ))}
              </select>

              <input
                type="date"
                required
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                className={inputClass}
                aria-label="Fecha de salida"
              />

              <input
                type="time"
                required
                placeholder="Hora de salida"
                value={formData.hora_salida}
                onChange={(e) => setFormData({ ...formData, hora_salida: e.target.value })}
                className={inputClass}
                aria-label="Hora de salida"
              />

              <input
                type="time"
                required
                placeholder="Hora de regreso"
                value={formData.hora_regreso}
                onChange={(e) => setFormData({ ...formData, hora_regreso: e.target.value })}
                className={inputClass}
                aria-label="Hora de regreso"
              />

              <input
                type="text"
                required
                placeholder="Motivo"
                value={formData.motivo}
                onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                className={inputClass}
                aria-label="Motivo de la salida"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMostrarFormulario(false)}
                  className="px-4 py-2 text-white bg-gray-400 rounded hover:bg-gray-500"
                  disabled={guardando}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-black rounded hover:bg-gray-800 disabled:opacity-50"
                  disabled={guardando}
                >
                  {guardando ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
