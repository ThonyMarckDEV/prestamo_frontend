import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../../../js/authToken';
import API_BASE_URL from '../../../../js/urlHelper';
import Pagination from './Pagination';

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    rango_tasa: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Fetch products
  const fetchProductos = async (page = 1, search = '') => {
    setLoading(true);
    setError('');
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/admin/productos?page=${page}&per_page=${itemsPerPage}&search=${search}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      if (!response.ok) throw new Error('Error al cargar productos');
      const data = await response.json();
      setProductos(data.productos || []);
      setCurrentPage(data.current_page);
      return data;
    } catch (err) {
      setError(err.message || 'Error al cargar productos');
      return { total_pages: 1, total_items: 0 };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos(currentPage, searchTerm);
  }, [currentPage, itemsPerPage, searchTerm]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId
        ? `${API_BASE_URL}/api/admin/productos/${editingId}`
        : `${API_BASE_URL}/api/admin/productos`;
      const response = await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar producto');
      }

      setFormData({ nombre: '', rango_tasa: '' });
      setEditingId(null);
      setShowForm(false);
      await fetchProductos(1, searchTerm);
    } catch (err) {
      setError(err.message || 'Error al guardar producto');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = async (id) => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/admin/productos/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Error al cargar producto');
      const data = await response.json();
      setFormData(data.producto);
      setEditingId(id);
      setShowForm(true);
    } catch (err) {
      setError(err.message || 'Error al cargar producto');
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/admin/productos/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Error al eliminar producto');
      await fetchProductos(currentPage, searchTerm);
    } catch (err) {
      setError(err.message || 'Error al eliminar producto');
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Handle items per page
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  // Pagination
  const totalPages = Math.ceil(productos.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = productos.slice(indexOfFirstItem, indexOfLastItem);

return (
    <div className="min-h-screen bg-accent-mint-100 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-primary-800 mb-8 text-center">
          GESTIÓN DE PRODUCTOS
        </h2>

        {/* Form */}
        {showForm && (
          <div className="mb-8 bg-neutral-white shadow-lg rounded-xl p-6 border-t-4 border-primary-600">
            <h3 className="text-xl font-semibold text-primary-800 mb-4">
              {editingId ? 'EDITAR PRODUCTO' : 'AGREGAR PRODUCTO'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-accent-steel-600 mb-1">
                    NOMBRE
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    placeholder="Ej. CREDIVUELVE"
                    className="w-full p-3 border border-neutral-gray rounded-lg focus:ring-2 focus:ring-accent-copper-DEFAULT focus:border-accent-copper-DEFAULT transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-accent-steel-600 mb-1">
                    RANGO DE TASA
                  </label>
                  <input
                    type="text"
                    name="rango_tasa"
                    value={formData.rango_tasa}
                    onChange={handleInputChange}
                    placeholder="Ej. 13%-18%"
                    className="w-full p-3 border border-neutral-gray rounded-lg focus:ring-2 focus:ring-accent-copper-DEFAULT focus:border-accent-copper-DEFAULT transition"
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-accent-yellow-600 hover:bg-accent-copper-600 text-neutral-white font-semibold py-3 px-6 rounded-lg disabled:bg-accent-steel-600 disabled:cursor-not-allowed transition transform hover:scale-105"
                >
                  {loading ? 'GUARDANDO...' : editingId ? 'ACTUALIZAR' : 'GUARDAR'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ nombre: '', rango_tasa: '' });
                    setEditingId(null);
                  }}
                  className="bg-neutral-gray hover:bg-accent-steel-DEFAULT text-primary-800 font-semibold py-3 px-6 rounded-lg transition transform hover:scale-105"
                >
                  CANCELAR
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-accent-yellow-50 text-accent-copper-600 p-4 rounded-lg mb-6 border border-accent-yellow-200">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-neutral-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-primary-800">PRODUCTOS REGISTRADOS</h2>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-accent-yellow-600 hover:bg-accent-copper-800 text-neutral-white font-semibold py-2 px-4 rounded-lg transition transform hover:scale-105"
              >
                AGREGAR PRODUCTO
              </button>
            )}
          </div>

          {/* Search and Items Per Page */}
          <div className="flex flex-col md:flex-row md:items-center mb-4 space-y-2 md:space-y-0">
            <div className="flex-1">
              <input
                type="text"
                placeholder="BUSCAR PRODUCTO POR ID O NOMBRE"
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full px-4 py-2 border border-neutral-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-copper-DEFAULT"
              />
            </div>
            <div className="md:ml-4">
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="w-full md:w-auto px-3 py-2 border border-neutral-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-copper-DEFAULT"
              >
                <option value="5">5 POR PÁGINA</option>
                <option value="10">10 POR PÁGINA</option>
                <option value="20">20 POR PÁGINA</option>
                <option value="50">50 POR PÁGINA</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-4">CARGANDO PRODUCTOS...</div>
          ) : productos.length === 0 ? (
            <div className="text-center py-4 text-accent-steel-DEFAULT">
              {searchTerm ? 'No se encontraron resultados para la búsqueda' : 'No hay productos registrados'}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-gray">
                  <thead className="bg-primary-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-accent-steel-DEFAULT uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-accent-steel-DEFAULT uppercase tracking-wider">NOMBRE</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-accent-steel-DEFAULT uppercase tracking-wider">RANGO DE TASA</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-accent-steel-DEFAULT uppercase tracking-wider">ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody className="bg-neutral-white divide-y divide-neutral-gray">
                    {currentItems.map((producto) => (
                      <tr key={producto.idProducto} className="hover:bg-accent-yellow-50">
                        <td className="px-6 py-4 whitespace-nowrap">{producto.idProducto}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{producto.nombre}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{producto.rango_tasa}</td>
                        <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                          <button
                            onClick={() => handleEdit(producto.idProducto)}
                            className="text-primary-light hover:text-primary-600"
                          >
                            EDITAR
                          </button>
                          <button
                            onClick={() => handleDelete(producto.idProducto)}
                            className="text-accent-copper-600 hover:text-accent-copper-800"
                          >
                            ELIMINAR
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={productos.length}
                indexOfFirstItem={indexOfFirstItem}
                indexOfLastItem={indexOfLastItem}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
);
};

export default Productos;