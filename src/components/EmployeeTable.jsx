import React from 'react';

export default function EmployeeTable({ empleados, onEdit }) {
  return (
    <div className="overflow-x-auto rounded shadow border border-gray-300">
      <table className="min-w-full border-collapse">
        <thead className="bg-yellow-400 text-white">
          <tr>
            <th className="p-3 text-left text-sm font-semibold">Nombre</th>
            <th className="p-3 text-left text-sm font-semibold">Apellido</th>
            <th className="p-3 text-left text-sm font-semibold">Departamento</th>
            <th className="p-3 text-left text-sm font-semibold">N° Interno</th>
            <th className="p-3 text-left text-sm font-semibold">Entrada</th>
            <th className="p-3 text-left text-sm font-semibold">Salida</th>
            <th className="p-3 text-left text-sm font-semibold">Horas Justificadas</th>
            <th className="p-3 text-left text-sm font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {empleados.length === 0 ? (
            <tr>
              <td
                colSpan="8"
                className="p-4 text-center text-gray-600 text-sm"
              >
                No hay empleados para mostrar.
              </td>
            </tr>
          ) : (
            empleados.map((emp) => (
              <tr
                key={emp.id}
                className="border-t border-gray-300 hover:bg-yellow-50 cursor-pointer"
              >
                <td className="p-2 text-sm">{emp.nombre}</td>
                <td className="p-2 text-sm">{emp.apellido}</td>
                <td className="p-2 text-sm">{emp.departamento}</td>
                <td className="p-2 text-sm">{emp.nro_interno}</td>
                <td className="p-2 text-sm">{emp.hora_entrada || '06:30 AM'}</td>
                <td className="p-2 text-sm">{emp.hora_salida || '-'}</td>
                <td className="p-2 text-sm">
                  {(3 - (emp.horas_justificadas || 0)).toFixed(2)}
                </td>
                <td className="p-2 text-sm">
                  <button
                    onClick={() => onEdit(emp)}
                    className="bg-yellow-400 text-white px-3 py-1 rounded shadow hover:bg-yellow-500 transition"
                    aria-label={`Editar ${emp.nombre} ${emp.apellido}`}
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
