import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function RegistroUsuarios() {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [edicionHoras, setEdicionHoras] = useState({ hora_entrada: '', hora_salida: '' });

  const bucketName = 'fotos-personal';

  async function fetchEmpleadosConHorarios() {
    setLoading(true);
    const fechaHoy = new Date().toISOString().slice(0, 10);

    const { data: empleadosData, error: errorEmpleados } = await supabase
      .from('personal')
      .select('*')
      .order('apellido', { ascending: true })
      .order('nombre', { ascending: true });

    if (errorEmpleados) {
      alert('Error cargando empleados: ' + errorEmpleados.message);
      setLoading(false);
      return;
    }

    const { data: registros, error: errorRegistros } = await supabase
      .from('registro_horarios')
      .select('*')
      .eq('fecha', fechaHoy);

    if (errorRegistros) {
      alert('Error cargando registros de horarios: ' + errorRegistros.message);
      setLoading(false);
      return;
    }

    const empleadosConHorarios = empleadosData.map((emp) => {
      const registroHoy = registros.find((r) => r.empleado_id === emp.id);
      return {
        ...emp,
        hora_entrada: registroHoy?.hora_entrada ?? null,
        hora_salida: registroHoy?.hora_salida ?? null,
        registroId: registroHoy?.id ?? null,
      };
    });

    const empleadosConFoto = empleadosConHorarios.map((emp) => {
      if (emp.foto_url) {
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(emp.foto_url);
        return { ...emp, fotoPublica: publicUrlData.publicUrl };
      }
      return { ...emp, fotoPublica: null };
    });

    setEmpleados(empleadosConFoto);
    setLoading(false);
  }

  useEffect(() => {
    fetchEmpleadosConHorarios();
  }, []);

  async function registrarHora(id, tipo) {
    setUpdatingId(id);

    const fechaHoy = new Date().toISOString().slice(0, 10);
    const ahora = new Date();
    const horaStr = ahora.toTimeString().slice(0, 5); // HH:mm

    // Buscar registro existente
    const { data: registroExistente, error: errorBuscar } = await supabase
      .from('registro_horarios')
      .select('*')
      .eq('empleado_id', id)
      .eq('fecha', fechaHoy)
      .limit(1)
      .single();

    if (errorBuscar && errorBuscar.code !== 'PGRST116') {
      alert('Error buscando registro: ' + errorBuscar.message);
      setUpdatingId(null);
      return;
    }

    if (registroExistente) {
      const updateData = tipo === 'entrada' ? { hora_entrada: horaStr } : { hora_salida: horaStr };

      const { error: errorUpdate } = await supabase
        .from('registro_horarios')
        .update(updateData)
        .eq('id', registroExistente.id);

      if (errorUpdate) {
        alert('Error al actualizar hora: ' + errorUpdate.message);
      } else {
        alert(`Hora de ${tipo} actualizada: ${horaStr}`);
        fetchEmpleadosConHorarios();
      }
    } else {
      const insertData = {
        empleado_id: id,
        fecha: fechaHoy,
        hora_entrada: tipo === 'entrada' ? horaStr : null,
        hora_salida: tipo === 'salida' ? horaStr : null,
      };

      const { error: errorInsert } = await supabase
        .from('registro_horarios')
        .insert([insertData]);

      if (errorInsert) {
        alert('Error al insertar hora: ' + errorInsert.message);
      } else {
        alert(`Hora de ${tipo} registrada: ${horaStr}`);
        fetchEmpleadosConHorarios();
      }
    }

    setUpdatingId(null);
  }

  // Funciones para edición manual
  function iniciarEdicion(emp) {
    setEditandoId(emp.id);
    setEdicionHoras({
      hora_entrada: emp.hora_entrada ?? '',
      hora_salida: emp.hora_salida ?? '',
    });
  }

  function cancelarEdicion() {
    setEditandoId(null);
    setEdicionHoras({ hora_entrada: '', hora_salida: '' });
  }

  async function guardarEdicion(emp) {
    if (!emp.registroId) {
      alert('No existe registro para editar. Por favor registre ingreso o salida primero.');
      return;
    }

    if (!edicionHoras.hora_entrada || !edicionHoras.hora_salida) {
      if (!window.confirm('Alguna hora está vacía. ¿Querés continuar?')) {
        return;
      }
    }

    setUpdatingId(emp.id);

    const { error } = await supabase
      .from('registro_horarios')
      .update({
        hora_entrada: edicionHoras.hora_entrada || null,
        hora_salida: edicionHoras.hora_salida || null,
      })
      .eq('id', emp.registroId);

    if (error) {
      alert('Error al guardar cambios: ' + error.message);
    } else {
      alert('Horas actualizadas correctamente');
      fetchEmpleadosConHorarios();
      cancelarEdicion();
    }
    setUpdatingId(null);
  }

  const empleadosFiltrados = empleados.filter((emp) =>
    emp.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    emp.apellido.toLowerCase().includes(busqueda.toLowerCase())
  );

  function generarPDF() {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Planilla de Usuarios y Horarios', 14, 22);

    const columns = [
      { header: 'Apellido y Nombre', dataKey: 'nombre_completo' },
      { header: 'Hora Entrada', dataKey: 'hora_entrada' },
      { header: 'Hora Salida', dataKey: 'hora_salida' },
    ];

    const rows = empleadosFiltrados.map((emp) => ({
      nombre_completo: `${emp.apellido}, ${emp.nombre}`,
      hora_entrada: emp.hora_entrada ?? '-',
      hora_salida: emp.hora_salida ?? '-',
    }));

    doc.autoTable({
      head: [columns.map(c => c.header)],
      body: rows.map(r => columns.map(c => r[c.dataKey])),
      startY: 30,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 0, 0], textColor: 255 },
    });

    doc.save('planilla_usuarios_horarios.pdf');
  }

  if (loading) return <p className="text-center mt-10">Cargando empleados...</p>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-6 text-center">Registro de Horarios</h2>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
        <input
          type="text"
          placeholder="Buscar por nombre o apellido..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full sm:w-72 px-4 py-2 border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-black"
          aria-label="Buscar por nombre o apellido"
        />

        <button
          onClick={generarPDF}
          className="w-full sm:w-auto bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
          type="button"
        >
          Imprimir Planilla PDF
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 rounded shadow">
          <thead className="bg-black text-white">
            <tr>
              <th className="p-2 text-left">Apellido y Nombre</th>
              <th className="p-2 text-center">Acciones</th>
              <th className="p-2 text-left">Hora Entrada</th>
              <th className="p-2 text-left">Hora Salida</th>
              <th className="p-2 text-center">Editar</th>
            </tr>
          </thead>
          <tbody>
            {empleadosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-4 text-gray-600">
                  No se encontraron empleados con ese nombre o apellido.
                </td>
              </tr>
            ) : (
              empleadosFiltrados.map((emp) => (
                <tr
                  key={emp.id}
                  className="border-t border-gray-300 hover:bg-gray-100 transition"
                >
                  <td className="p-2">{`${emp.apellido}, ${emp.nombre}`}</td>
                  <td className="p-2 flex justify-center gap-2 flex-wrap">
                    <button
                      onClick={() => registrarHora(emp.id, 'entrada')}
                      disabled={updatingId === emp.id || editandoId === emp.id}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                      type="button"
                    >
                      Registrar Ingreso
                    </button>
                    <button
                      onClick={() => registrarHora(emp.id, 'salida')}
                      disabled={updatingId === emp.id || editandoId === emp.id}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                      type="button"
                    >
                      Registrar Salida
                    </button>
                  </td>

                  <td className="p-2">
                    {editandoId === emp.id ? (
                      <input
                        type="time"
                        value={edicionHoras.hora_entrada}
                        onChange={(e) =>
                          setEdicionHoras((prev) => ({ ...prev, hora_entrada: e.target.value }))
                        }
                        className="border border-gray-400 rounded px-2 py-1 w-24"
                      />
                    ) : (
                      emp.hora_entrada ?? '-'
                    )}
                  </td>
                  <td className="p-2">
                    {editandoId === emp.id ? (
                      <input
                        type="time"
                        value={edicionHoras.hora_salida}
                        onChange={(e) =>
                          setEdicionHoras((prev) => ({ ...prev, hora_salida: e.target.value }))
                        }
                        className="border border-gray-400 rounded px-2 py-1 w-24"
                      />
                    ) : (
                      emp.hora_salida ?? '-'
                    )}
                  </td>

                  <td className="p-2 text-center">
                    {editandoId === emp.id ? (
                      <>
                        <button
                          onClick={() => guardarEdicion(emp)}
                          disabled={updatingId === emp.id}
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50 mr-1"
                          type="button"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={cancelarEdicion}
                          className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                          type="button"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => iniciarEdicion(emp)}
                        disabled={updatingId === emp.id}
                        className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 disabled:opacity-50"
                        type="button"
                      >
                        Editar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
