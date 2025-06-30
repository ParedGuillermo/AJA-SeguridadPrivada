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
  const [mensaje, setMensaje] = useState('');

  const bucketName = 'fotos-personal';

  function mostrarMensaje(txt) {
    setMensaje(txt);
    setTimeout(() => setMensaje(''), 2000);
  }

  async function fetchEmpleadosConHorarios() {
    setLoading(true);
    const fechaHoy = new Date().toISOString().slice(0, 10);

    const { data: empleadosData, error: errorEmpleados } = await supabase
      .from('personal')
      .select('*')
      .order('apellido', { ascending: true })
      .order('nombre', { ascending: true });

    if (errorEmpleados) {
      console.error('Error cargando empleados:', errorEmpleados.message);
      setLoading(false);
      return;
    }

    const { data: registros, error: errorRegistros } = await supabase
      .from('registro_horarios')
      .select('*')
      .eq('fecha', fechaHoy);

    if (errorRegistros) {
      console.error('Error cargando registros de horarios:', errorRegistros.message);
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
    const horaStr = ahora.toTimeString().slice(0, 5);

    const { data: registroExistente, error: errorBuscar } = await supabase
      .from('registro_horarios')
      .select('*')
      .eq('empleado_id', id)
      .eq('fecha', fechaHoy)
      .limit(1)
      .single();

    if (errorBuscar && errorBuscar.code !== 'PGRST116') {
      console.error('Error buscando registro:', errorBuscar.message);
      setUpdatingId(null);
      return;
    }

    if (registroExistente) {
      const updateData = tipo === 'entrada' ? { hora_entrada: horaStr } : { hora_salida: horaStr };

      const { error: errorUpdate } = await supabase
        .from('registro_horarios')
        .update(updateData)
        .eq('id', registroExistente.id);

      if (!errorUpdate) {
        setEmpleados((prev) =>
          prev.map((emp) =>
            emp.id === id
              ? { ...emp, ...updateData, registroId: registroExistente.id }
              : emp
          )
        );
        mostrarMensaje(`Hora de ${tipo} actualizada: ${horaStr}`);
      }
    } else {
      const insertData = {
        empleado_id: id,
        fecha: fechaHoy,
        hora_entrada: tipo === 'entrada' ? horaStr : null,
        hora_salida: tipo === 'salida' ? horaStr : null,
      };

      const { data, error: errorInsert } = await supabase
        .from('registro_horarios')
        .insert([insertData])
        .select()
        .single();

      if (!errorInsert) {
        setEmpleados((prev) =>
          prev.map((emp) =>
            emp.id === id
              ? { ...emp, ...insertData, registroId: data.id }
              : emp
          )
        );
        mostrarMensaje(`Hora de ${tipo} registrada: ${horaStr}`);
      }
    }

    setUpdatingId(null);
  }

  async function guardarEdicion(emp) {
    if (!emp.registroId) {
      mostrarMensaje('No existe registro para editar.');
      return;
    }

    setUpdatingId(emp.id);

    const { error } = await supabase
      .from('registro_horarios')
      .update({
        hora_entrada: edicionHoras.hora_entrada || null,
        hora_salida: edicionHoras.hora_salida || null,
      })
      .eq('id', emp.registroId);

    if (!error) {
      setEmpleados((prev) =>
        prev.map((e) =>
          e.id === emp.id
            ? {
                ...e,
                hora_entrada: edicionHoras.hora_entrada || null,
                hora_salida: edicionHoras.hora_salida || null,
              }
            : e
        )
      );
      cancelarEdicion();
      mostrarMensaje('Horas actualizadas');
    }

    setUpdatingId(null);
  }

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

  const empleadosFiltrados = empleados.filter((emp) =>
    emp.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    emp.apellido.toLowerCase().includes(busqueda.toLowerCase())
  );

  function generarPDF() {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Planilla de Usuarios y Horarios', 14, 20);

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
      startY: 28,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 0, 0], textColor: 255 },
    });

    doc.save('planilla_usuarios_horarios.pdf');
  }

  return (
    <div className="max-w-4xl p-2 mx-auto sm:p-4">
      <h2 className="mb-4 text-lg font-bold text-center sm:text-xl">Registro de Horarios</h2>

      {mensaje && <div className="p-2 mb-3 text-sm text-center text-white bg-green-600 rounded">{mensaje}</div>}

      <div className="flex flex-col gap-2 mb-3 sm:flex-row sm:justify-between sm:items-center">
        <input
          type="text"
          placeholder="Buscar por nombre o apellido..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-400 rounded sm:w-72 focus:outline-none focus:ring-2 focus:ring-black"
        />

        <button
          onClick={generarPDF}
          className="w-full px-4 py-2 text-sm text-white transition bg-black rounded sm:w-auto hover:bg-gray-800"
        >
          Imprimir Planilla PDF
        </button>
      </div>

      <p className="mb-2 text-xs text-center text-gray-500">Haz clic en un botón para registrar la hora sin refrescar toda la tabla.</p>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-gray-300 rounded shadow sm:text-base">
          <thead className="text-white bg-black">
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
                <td colSpan="5" className="p-4 text-sm text-center text-gray-600">
                  No se encontraron empleados con ese nombre o apellido.
                </td>
              </tr>
            ) : (
              empleadosFiltrados.map((emp) => (
                <tr key={emp.id} className="transition border-t border-gray-300 hover:bg-gray-100">
                  <td className="p-2 whitespace-nowrap">{`${emp.apellido}, ${emp.nombre}`}</td>
                  <td className="flex justify-center gap-2 p-2">
                    <button
                      onClick={() => registrarHora(emp.id, 'entrada')}
                      disabled={updatingId === emp.id || editandoId === emp.id}
                      className="px-3 py-1 text-xs text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50 sm:text-sm"
                    >
                      Ingreso
                    </button>
                    <button
                      onClick={() => registrarHora(emp.id, 'salida')}
                      disabled={updatingId === emp.id || editandoId === emp.id}
                      className="px-3 py-1 text-xs text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50 sm:text-sm"
                    >
                      Salida
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
                        className="w-20 px-2 py-1 text-xs border border-gray-400 rounded sm:text-sm"
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
                        className="w-20 px-2 py-1 text-xs border border-gray-400 rounded sm:text-sm"
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
                          className="px-3 py-1 mr-1 text-xs text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 sm:text-sm"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={cancelarEdicion}
                          className="px-3 py-1 text-xs text-white bg-gray-400 rounded hover:bg-gray-500 sm:text-sm"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => iniciarEdicion(emp)}
                        disabled={updatingId === emp.id}
                        className="px-3 py-1 text-xs text-white bg-yellow-600 rounded hover:bg-yellow-700 disabled:opacity-50 sm:text-sm"
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
