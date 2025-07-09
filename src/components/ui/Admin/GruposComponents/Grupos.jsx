import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../../../js/authToken';
import API_BASE_URL from '../../../../js/urlHelper';
import Pagination from './Pagination';
import AdvisorSearch from './AdvisorSearch';
import { toast } from 'react-toastify';

const Grupos = () => {
  const [grupos, setGrupos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    idAsesor: null,
    fecha_creacion: '',
    estado: 'activo'
  });
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [advisorError, setAdvisorError] = useState('');

  // Fetch groups
  const fetchGrupos = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/admin/grupos?page=${page}&per_page=${itemsPerPage}&search=${encodeURIComponent(search)}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cargar grupos');
      }
      const data = await response.json();
      setGrupos(data.grupos || []);
      setCurrentPage(data.current_page);
      return data;
    } catch (err) {
      toast.error(err.message || 'Error al cargar grupos', { autoClose: 5000 });
      return { total_pages: 1, total_items: 0 };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrupos(currentPage, searchTerm);
  }, [currentPage, itemsPerPage, searchTerm]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle advisor selection
  const handleSelectAdvisor = (advisor) => {
    setSelectedAdvisor(advisor);
    setFormData({ ...formData, idAsesor: advisor.idUsuario });
    setAdvisorError('');
  };

  // Handle advisor removal
  const handleRemoveAdvisor = () => {
    setSelectedAdvisor(null);
    setFormData({ ...formData, idAsesor: null });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setAdvisorError('');
    setLoading(true);

    if (!formData.idAsesor) {
      setAdvisorError('Debes seleccionar un asesor');
      toast.error('Debes seleccionar un asesor', { autoClose: 5000 });
      setLoading(false);
      return;
    }

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId
        ? `${API_BASE_URL}/api/admin/grupos/${editingId}`
        : `${API_BASE_URL}/api/admin/grupos`;
      const response = await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Error al guardar grupo');
      }

      setFormData({
        nombre: '',
        descripcion: '',
        idAsesor: null,
        fecha_creacion: '',
        estado: 'activo'
      });
      setSelectedAdvisor(null);
      setEditingId(null);
      setShowForm(false);
      await fetchGrupos(1, searchTerm);
      toast.success(editingId ? 'Grupo actualizado correctamente' : 'Grupo creado correctamente', { autoClose: 5000 });
    } catch (err) {
      toast.error(err.message || 'Error al guardar grupo', { autoClose: 5000 });
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = async (id) => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/admin/grupos/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Error al cargar grupo');
      }
      const data = await response.json();
      setFormData({
        nombre: data.grupo.nombre,
        descripcion: data.grupo.descripcion || '',
        idAsesor: data.grupo.idAsesor,
        fecha_creacion: data.grupo.fecha_creacion,
        estado: data.grupo.estado
      });
      setSelectedAdvisor(data.grupo.asesor);
      setEditingId(id);
      setShowForm(true);
    } catch (err) {
      toast.error(err.message || 'Error al cargar grupo', { autoClose: 5000 });
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este grupo?')) return;
    setLoading(true);
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/admin/grupos/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar grupo');
      }
      await fetchGrupos(currentPage, searchTerm);
      toast.success('Grupo eliminado correctamente', { autoClose: 5000 });
    } catch (err) {
      toast.error(err.message || 'Error al eliminar grupo', { autoClose: 5000 });
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
  const totalPages = Math.ceil(grupos.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = grupos.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="min-h-screen bg-accent-mint-100 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-primary-800 mb-8 text-center">
          GESTIÓN DE GRUPOS
        </h2>

        {/* Form */}
        {showForm && (
          <div className="mb-8 bg-neutral-white shadow-lg rounded-xl p-6 border-t-4 border-primary-600">
            <h3 className="text-xl font-semibold text-primary-800 mb-4">
              {editingId ? 'EDITAR GRUPO' : 'AGREGAR GRUPO'}
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
                    placeholder="Ej. Grupo Sol"
                    className="w-full p-3 border border-neutral-gray rounded-lg focus:ring-2 focus:ring-accent-copper-DEFAULT focus:border-accent-copper-DEFAULT transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-accent-steel-600 mb-1">
                    DESCRIPCIÓN
                  </label>
                  <input
                    type="text"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    placeholder="Ej. Grupo para microempresarios"
                    className="w-full p-3 border border-neutral-gray rounded-lg focus:ring-2 focus:ring-accent-copper-DEFAULT focus:border-accent-copper-DEFAULT transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-accent-steel-600 mb-1">
                    ASESOR
                  </label>
                  <AdvisorSearch
                    selectedAdvisor={selectedAdvisor}
                    onSelect={handleSelectAdvisor}
                    onRemove={handleRemoveAdvisor}
                    errors={advisorError}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-accent-steel-600 mb-1">
                    FECHA DE CREACIÓN
                  </label>
                  <input
                    type="date"
                    name="fecha_creacion"
                    value={formData.fecha_creacion}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-neutral-gray rounded-lg focus:ring-2 focus:ring-accent-copper-DEFAULT focus:border-accent-copper-DEFAULT transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-accent-steel-600 mb-1">
                    ESTADO
                  </label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-neutral-gray rounded-lg focus:ring-2 focus:ring-accent-copper-DEFAULT focus:border-accent-copper-DEFAULT transition"
                    required
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
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
                    setFormData({ nombre: '', descripcion: '', idAsesor: null, fecha_creacion: '', estado: 'activo' });
                    setSelectedAdvisor(null);
                    setEditingId(null);
                    setAdvisorError('');
                  }}
                  className="bg-neutral-gray hover:bg-accent-steel-DEFAULT text-primary-800 font-semibold py-3 px-6 rounded-lg transition transform hover:scale-105"
                >
                  CANCELAR
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="bg-neutral-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-primary-800">GRUPOS REGISTRADOS</h2>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-accent-yellow-600 hover:bg-accent-copper-800 text-neutral-white font-semibold py-2 px-4 rounded-lg transition transform hover:scale-105"
              >
                AGREGAR GRUPO
              </button>
            )}
          </div>

          {/* Search and Items Per Page */}
          <div className="flex flex-col md:flex-row md:items-center mb-4 space-y-2 md:space-y-0">
            <div className="flex-1">
              <input
                type="text"
                placeholder="BUSCAR GRUPO POR NOMBRE O ASESOR"
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
            <div className="text-center py-4">CARGANDO GRUPOS...</div>
          ) : grupos.length === 0 ? (
            <div className="text-center py-4 text-accent-steel-DEFAULT">
              {searchTerm ? 'No se encontraron resultados para la búsqueda' : 'No hay grupos registrados'}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-gray">
                  <thead className="bg-primary-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-accent-steel-DEFAULT uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-accent-steel-DEFAULT uppercase tracking-wider">NOMBRE</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-accent-steel-DEFAULT uppercase tracking-wider">DESCRIPCIÓN</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-accent-steel-DEFAULT uppercase tracking-wider">ASESOR</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-accent-steel-DEFAULT uppercase tracking-wider">FECHA CREACIÓN</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-accent-steel-DEFAULT uppercase tracking-wider">ESTADO</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-accent-steel-DEFAULT uppercase tracking-wider">ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody className="bg-neutral-white divide-y divide-neutral-gray">
                    {currentItems.map((grupo) => (
                      <tr key={grupo.idGrupo} className="hover:bg-accent-yellow-50">
                        <td className="px-6 py-4 whitespace-nowrap">{grupo.idGrupo}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{grupo.nombre}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{grupo.descripcion || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {grupo.asesor?.datos
                            ? `${grupo.asesor.datos.nombre} ${grupo.asesor.datos.apellidoPaterno || ''} ${grupo.asesor.datos.apellidoMaterno || ''}`
                            : 'Sin asesor'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{new Date(grupo.fecha_creacion).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{grupo.estado}</td>
                        <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                          <button
                            onClick={() => handleEdit(grupo.idGrupo)}
                            className="text-primary-light hover:text-primary-600"
                          >
                            EDITAR
                          </button>
                          <button
                            onClick={() => handleDelete(grupo.idGrupo)}
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
                totalItems={grupos.length}
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

export default Grupos;