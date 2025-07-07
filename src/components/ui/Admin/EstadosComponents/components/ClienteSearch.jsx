import React from 'react';

const ClienteSearch = ({
  searchQuery,
  setSearchQuery,
  handleSearch,
  handleReset,
  searchResults,
  handleSelectCliente
}) => (
  <div className="mb-6">
    <div className="flex flex-col md:flex-row gap-2">
      <div className="flex-1">
        <label className="block text-sm font-medium text-neutral-dark mb-1">BUSCAR CLIENTE (DNI, NOMBRE O APELLIDO)</label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border border-neutral-gray rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="Ingrese DNI, Nombre o Apellido"
          autoComplete="off"
          inputMode="text"
          style={{ textTransform: 'uppercase' }}
        />
      </div>
      <div className="md:self-end">
        <button
          onClick={handleSearch}
          className="w-full md:w-auto bg-primary hover:bg-primary-dark text-neutral-white font-bold py-2 px-4 rounded-lg"
        >
          BUSCAR
        </button>
      </div>
      <div className="md:self-end">
        <button
          onClick={handleReset}
          className="w-full md:w-auto bg-neutral-gray hover:bg-neutral-dark text-neutral-white font-bold py-2 px-4 rounded-lg"
        >
          LIMPIAR
        </button>
      </div>
    </div>

    {searchResults.length > 0 && (
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2 text-neutral-dark">RESULTADOS DE BÚSQUEDA</h3>
        <div className="bg-neutral-softWhite p-3 rounded-lg border border-neutral-gray max-h-60 overflow-y-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-sm font-medium text-neutral-dark border-b border-neutral-gray">
                <th className="py-2 px-3">DNI</th>
                <th className="py-2 px-3">NOMBRE</th>
                <th className="py-2 px-3">APELLIDO</th>
                <th className="py-2 px-3">ACCIÓN</th>
              </tr>
            </thead>
            <tbody>
              {searchResults.map((cliente) => (
                <tr key={cliente.idUsuario} className="border-b border-neutral-gray last:border-b-0 hover:bg-neutral-softWhite">
                  <td className="py-2 px-3">{cliente.dni}</td>
                  <td className="py-2 px-3">{cliente.nombre}</td>
                  <td className="py-2 px-3">{cliente.apellidoPaterno} {cliente.apellidoMaterno}</td>
                  <td className="py-2 px-3">
                    <button
                      onClick={() => handleSelectCliente(cliente)}
                      className="bg-primary hover:bg-primary-dark text-neutral-white text-sm py-1 px-2 rounded"
                    >
                      SELECCIONAR
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>
);

export default ClienteSearch;