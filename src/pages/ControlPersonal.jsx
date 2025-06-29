import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function ControlPersonal() {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    departamento: '',
    nro_interno: '',
  });
  const [guardando, setGuardando] = useState(false);

  const bucketName = 'fotos-personal'; // Cambiá por el nombre real de tu bucket

  async function fetchEmpleados() {
    setLoading(true);
    const { data, error } = await supabase
      .from('personal')
      .select('*')
      .order('apellido', { ascending: true });
    if (error) {
      alert('Error al cargar empleados: ' + error.message);
      setLoading(false);
      return;
    }

    // Agregar url pública de la foto
    const dataConFotos = data.map((emp) => {
      if (emp.foto_url) {
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(emp.foto_url);
        return { ...emp, fotoPublica: publicUrlData.publicUrl };
      }
      return { ...emp, fotoPublica: null };
    });

    setEmpleados(dataConFotos);
    setLoading(false);
  }

  useEffect(() => {
    fetchEmpleados();
  }, []);

  const empleadosFiltrados = empleados.filter((emp) => {
    const texto = busqueda.toLowerCase();
    return (
      emp.nombre.toLowerCase().includes(texto) ||
      emp.apellido.toLowerCase().includes(texto)
    );
  });

  const empleadosAgrupados = empleadosFiltrados.reduce((grupos, emp) => {
    const depto = emp.departamento || 'Sin Departamento';
    if (!grupos[depto]) grupos[depto] = [];
    grupos[depto].push(emp);
    return grupos;
  }, {});

  function comenzarEdicion(emp) {
    setEditandoId(emp.id);
    setFormData({
      nombre: emp.nombre,
      apellido: emp.apellido,
      departamento: emp.departamento || '',
      nro_interno: emp.nro_interno || '',
    });
  }

  function cancelarEdicion() {
    setEditandoId(null);
    setFormData({
      nombre: '',
      apellido: '',
      departamento: '',
      nro_interno: '',
    });
  }

  async function guardarCambios() {
    setGuardando(true);
    const { error } = await supabase
      .from('personal')
      .update({
        nombre: formData.nombre,
        apellido: formData.apellido,
        departamento: formData.departamento,
        nro_interno: formData.nro_interno,
      })
      .eq('id', editandoId);

    if (error) {
      alert('Error guardando cambios: ' + error.message);
    } else {
      alert('Empleado actualizado');
      fetchEmpleados();
      cancelarEdicion();
    }
    setGuardando(false);
  }

  if (loading) return <p className="text-center mt-10 text-gray-700">Cargando empleados...</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white text-gray-900 rounded shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Control y Edición de Personal</h2>

      <div className="mb-6 max-w-md mx-auto">
        <input
          type="text"
          placeholder="Buscar por nombre o apellido..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full px-4 py-2 border border-gray-700 rounded shadow focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      {Object.keys(empleadosAgrupados).length === 0 && (
        <p className="text-center text-gray-500">No se encontraron empleados.</p>
      )}

      {Object.entries(empleadosAgrupados).map(([depto, lista]) => (
        <div key={depto} className="mb-8">
          <h3 className="text-lg font-semibold mb-3 border-b border-black pb-1">
            {depto} ({lista.length})
          </h3>

          <table className="min-w-full border border-gray-700 rounded shadow">
            <thead className="bg-black text-white">
              <tr>
                <th className="p-3 text-left border-r border-gray-700">Foto</th>
                <th className="p-3 text-left border-r border-gray-700">Nombre</th>
                <th className="p-3 text-left border-r border-gray-700">Apellido</th>
                <th className="p-3 text-left border-r border-gray-700">N° Interno</th>
                <th className="p-3 text-left border-r border-gray-700">Departamento</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((emp) =>
                editandoId === emp.id ? (
                  <tr key={emp.id} className="border-t border-gray-700 bg-gray-100">
                    <td className="p-3 border-r border-gray-700">
                      {emp.fotoPublica ? (
                        <img
                          src={emp.fotoPublica}
                          alt={`${emp.nombre} ${emp.apellido}`}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                          N/A
                        </div>
                      )}
                    </td>
                    <td className="p-3 border-r border-gray-700">
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) =>
                          setFormData((f) => ({ ...f, nombre: e.target.value }))
                        }
                        className="w-full border border-gray-700 rounded px-2 py-1"
                      />
                    </td>
                    <td className="p-3 border-r border-gray-700">
                      <input
                        type="text"
                        value={formData.apellido}
                        onChange={(e) =>
                          setFormData((f) => ({ ...f, apellido: e.target.value }))
                        }
                        className="w-full border border-gray-700 rounded px-2 py-1"
                      />
                    </td>
                    <td className="p-3 border-r border-gray-700">
                      <input
                        type="text"
                        value={formData.nro_interno}
                        onChange={(e) =>
                          setFormData((f) => ({ ...f, nro_interno: e.target.value }))
                        }
                        className="w-full border border-gray-700 rounded px-2 py-1"
                      />
                    </td>
                    <td className="p-3 border-r border-gray-700">
                      <input
                        type="text"
                        value={formData.departamento}
                        onChange={(e) =>
                          setFormData((f) => ({ ...f, departamento: e.target.value }))
                        }
                        className="w-full border border-gray-700 rounded px-2 py-1"
                      />
                    </td>
                    <td className="p-3 text-center flex gap-2 justify-center">
                      <button
                        onClick={guardarCambios}
                        disabled={guardando}
                        className="bg-black text-white px-3 py-1 rounded hover:bg-gray-800 disabled:opacity-50"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={cancelarEdicion}
                        disabled={guardando}
                        className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr
                    key={emp.id}
                    className="border-t border-gray-700 hover:bg-gray-100 transition"
                  >
                    <td className="p-3 border-r border-gray-700">
                      {emp.fotoPublica ? (
                        <img
                          src={emp.fotoPublica}
                          alt={`${emp.nombre} ${emp.apellido}`}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                          N/A
                        </div>
                      )}
                    </td>
                    <td className="p-3 border-r border-gray-700">{emp.nombre}</td>
                    <td className="p-3 border-r border-gray-700">{emp.apellido}</td>
                    <td className="p-3 border-r border-gray-700">{emp.nro_interno}</td>
                    <td className="p-3 border-r border-gray-700">{emp.departamento || '-'}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => comenzarEdicion(emp)}
                        className="bg-black text-white px-3 py-1 rounded hover:bg-gray-800"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
