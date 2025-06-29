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

  const bucketName = 'fotos-personal'; // Cambiar si es necesario

  const inputClass =
    'w-full border border-gray-700 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-black';

  async function fetchEmpleados() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('personal')
        .select('*')
        .order('apellido', { ascending: true });
      if (error) throw error;

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
    } catch (error) {
      alert('Error al cargar empleados: ' + error.message);
    } finally {
      setLoading(false);
    }
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
    if (!formData.nombre.trim() || !formData.apellido.trim()) {
      alert('Nombre y Apellido son obligatorios.');
      return;
    }
    setGuardando(true);
    try {
      const { error } = await supabase
        .from('personal')
        .update({
          nombre: formData.nombre.trim(),
          apellido: formData.apellido.trim(),
          departamento: formData.departamento.trim() || null,
          nro_interno: formData.nro_interno.trim() || null,
        })
        .eq('id', editandoId);
      if (error) throw error;
      alert('Empleado actualizado correctamente.');
      fetchEmpleados();
      cancelarEdicion();
    } catch (error) {
      alert('Error guardando cambios: ' + error.message);
    } finally {
      setGuardando(false);
    }
  }

  if (loading)
    return <p className="mt-10 text-center text-gray-700">Cargando empleados...</p>;

  return (
    <div className="max-w-5xl p-6 mx-auto text-gray-900 bg-white rounded shadow-md">
      <h2 className="mb-6 text-2xl font-bold text-center">Control y Edición de Personal</h2>

      <div className="max-w-md mx-auto mb-6">
        <input
          type="text"
          placeholder="Buscar por nombre o apellido..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full px-4 py-2 border border-gray-700 rounded shadow focus:outline-none focus:ring-2 focus:ring-black"
          aria-label="Buscar empleados por nombre o apellido"
        />
      </div>

      {Object.keys(empleadosAgrupados).length === 0 && (
        <p className="text-center text-gray-500">No se encontraron empleados.</p>
      )}

      {Object.entries(empleadosAgrupados).map(([depto, lista]) => (
        <div key={depto} className="mb-8">
          <h3 className="pb-1 mb-3 text-lg font-semibold border-b border-black">
            {depto} ({lista.length})
          </h3>

          <table className="min-w-full border border-gray-700 rounded shadow">
            <thead className="text-white bg-black">
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
                  <tr key={emp.id} className="bg-gray-100 border-t border-gray-700">
                    <td className="p-3 border-r border-gray-700">
                      {emp.fotoPublica ? (
                        <img
                          src={emp.fotoPublica}
                          alt={`${emp.nombre} ${emp.apellido}`}
                          className="object-cover w-12 h-12 rounded-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-12 h-12 text-gray-600 bg-gray-300 rounded-full">
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
                        className={inputClass}
                        autoFocus
                      />
                    </td>
                    <td className="p-3 border-r border-gray-700">
                      <input
                        type="text"
                        value={formData.apellido}
                        onChange={(e) =>
                          setFormData((f) => ({ ...f, apellido: e.target.value }))
                        }
                        className={inputClass}
                      />
                    </td>
                    <td className="p-3 border-r border-gray-700">
                      <input
                        type="text"
                        value={formData.nro_interno}
                        onChange={(e) =>
                          setFormData((f) => ({ ...f, nro_interno: e.target.value }))
                        }
                        className={inputClass}
                      />
                    </td>
                    <td className="p-3 border-r border-gray-700">
                      <input
                        type="text"
                        value={formData.departamento}
                        onChange={(e) =>
                          setFormData((f) => ({ ...f, departamento: e.target.value }))
                        }
                        className={inputClass}
                      />
                    </td>
                    <td className="flex justify-center gap-2 p-3 text-center">
                      <button
                        onClick={guardarCambios}
                        disabled={guardando}
                        className="px-3 py-1 text-white bg-black rounded hover:bg-gray-800 disabled:opacity-50"
                        type="button"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={cancelarEdicion}
                        disabled={guardando}
                        className="px-3 py-1 text-white bg-gray-600 rounded hover:bg-gray-700 disabled:opacity-50"
                        type="button"
                      >
                        Cancelar
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr
                    key={emp.id}
                    className="transition border-t border-gray-700 hover:bg-gray-100"
                  >
                    <td className="p-3 border-r border-gray-700">
                      {emp.fotoPublica ? (
                        <img
                          src={emp.fotoPublica}
                          alt={`${emp.nombre} ${emp.apellido}`}
                          className="object-cover w-12 h-12 rounded-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-12 h-12 text-gray-600 bg-gray-300 rounded-full">
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
                        className="px-3 py-1 text-white bg-black rounded hover:bg-gray-800"
                        type="button"
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
