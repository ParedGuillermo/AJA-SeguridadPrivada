export default function FilterInput({ filter, setFilter }) {
  return (
    <input
      type="text"
      placeholder="Buscar por nombre o apellido"
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
      className="w-full sm:w-64 border border-gray-300 rounded px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
    />
  );
}
