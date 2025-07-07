import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../../../js/authToken';
import API_BASE_URL from '../../../../js/urlHelper';

export default function LoanDetails({ formData, handleInputChange, errors }) {
  const [productos, setProductos] = useState([]);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [errorProductos, setErrorProductos] = useState('');

  // Fetch products
  useEffect(() => {
    const fetchProductos = async () => {
      setLoadingProductos(true);
      setErrorProductos('');
      try {
        const response = await fetchWithAuth(`${API_BASE_URL}/api/admin/productos`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Error al cargar productos');
        const data = await response.json();
        setProductos(data.productos || []);
      } catch (err) {
        setErrorProductos(err.message || 'Error al cargar productos');
      } finally {
        setLoadingProductos(false);
      }
    };
    fetchProductos();
  }, []);

return (
    <div className="bg-primary-100 p-2 sm:p-3 md:p-5 rounded-lg mb-3 md:mb-6">
      <h3 className="font-semibold text-base sm:text-lg md:text-xl text-primary-800 mb-2 md:mb-4">DATOS DEL CRÉDITO</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
        {/* Producto */}
        <div className="flex flex-col">
          <label className="font-medium mb-1 md:mb-2 text-accent-steel-600 text-xs sm:text-sm">PRODUCTO</label>
          <select
            name="idProducto"
            value={formData?.idProducto || ''}
            onChange={handleInputChange}
            className={`border-2 ${
              errors.idProducto ? 'border-accent-copper-600' : 'border-neutral-gray'
            } focus:border-accent-copper-DEFAULT focus:ring focus:ring-primary-soft focus:ring-opacity-50 px-2 py-1 md:py-2 rounded-lg w-full`}
            disabled={loadingProductos}
          >
            <option value="">Seleccione un producto</option>
            {productos.map(producto => (
              <option key={producto.idProducto} value={producto.idProducto}>
                {producto.nombre} ({producto.rango_tasa})
              </option>
            ))}
          </select>
          {loadingProductos && <p className="text-accent-steel-DEFAULT text-sm mt-1">Cargando productos...</p>}
          {errorProductos && <p className="text-accent-copper-600 text-sm mt-1">{errorProductos}</p>}
          {errors.idProducto && <p className="text-accent-copper-600 text-sm mt-1">{errors.idProducto}</p>}
        </div>

        {/* Abonado Por */}
        <div className="flex flex-col">
          <label className="font-medium mb-1 md:mb-2 text-accent-steel-600 text-xs sm:text-sm">ABONADO POR</label>
          <select
            name="abonado_por"
            value={formData?.abonado_por || 'CUENTA CORRIENTE'}
           

 onChange={handleInputChange}
            className={`border-2 ${
              errors.abonado_por ? 'border-accent-copper-600' : 'border-neutral-gray'
            } focus:border-accent-copper-DEFAULT focus:ring focus:ring-primary-soft focus:ring-opacity-50 px-2 py-1 md:py-2 rounded-lg w-full`}
          >
            <option value="CUENTA CORRIENTE">CUENTA CORRIENTE</option>
            <option value="CAJA CHICA">CAJA CHICA</option>
          </select>
          {errors.abonado_por && <p className="text-accent-copper-600 text-sm mt-1">{errors.abonado_por}</p>}
        </div>

        {/* Importe de Crédito */}
        <div className="flex flex-col">
          <label className="font-medium mb-1 md:mb-2 text-accent-steel-600 text-xs sm:text-sm">IMPORTE DE CRÉDITO</label>
          <div className="relative">
            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-accent-steel-DEFAULT text-sm">S/</span>
            <input
              name="credito"
              type="number"
              value={formData?.credito || ''}
              onChange={handleInputChange}
              placeholder="0.00"
              min="0"
              step="any"
              className={`border-2 ${
                errors.credito ? 'border-accent-copper-600' : 'border-neutral-gray'
              } focus:border-accent-copper-DEFAULT focus:ring focus:ring-primary-soft focus:ring-opacity-50 pl-6 pr-2 py-1 md:py-2 rounded-lg w-full`}
              inputMode="decimal"
            />
          </div>
          {errors.credito && <p className="text-accent-copper-600 text-sm mt-1">{errors.credito}</p>}
        </div>

        {/* Tasa de Interés */}
        <div className="flex flex-col">
          <label className="font-medium mb-1 md:mb-2 text-accent-steel-600 text-xs sm:text-sm">TASA DE INTERÉS (%)</label>
          <input
            name="interes"
            type="number"
            value={formData?.interes || ''}
            onChange={handleInputChange}
            placeholder="0"
            min="13"
            max="40"
            className={`border-2 ${
              errors.interes ? 'border-accent-copper-600' : 'border-neutral-gray'
            } focus:border-accent-copper-DEFAULT focus:ring focus:ring-primary-soft focus:ring-opacity-50 px-2 py-1 md:py-2 rounded-lg w-full`}
            inputMode="decimal"
          />
          {errors.interes && <p className="text-accent-copper-600 text-sm mt-1">{errors.interes}</p>}
        </div>

        {/* Número de Cuotas */}
        <div className="flex flex-col">
          <label className="font-medium mb-1 md:mb-2 text-accent-steel-600 text-xs sm:text-sm">N° CUOTAS</label>
          <input
            name="cuotas"
            type="number"
            value={formData?.cuotas || ''}
            onChange={handleInputChange}
            placeholder="0"
            min="2"
            max="8"
            className={`border-2 ${
              errors.cuotas ? 'border-accent-copper-600' : 'border-neutral-gray'
            } focus:border-accent-copper-DEFAULT focus:ring focus:ring-primary-soft focus:ring-opacity-50 px-2 py-1 md:py-2 rounded-lg w-full`}
            inputMode="numeric"
          />
          {errors.cuotas && <p className="text-accent-copper-600 text-sm mt-1">{errors.cuotas}</p>}
        </div>
      </div>
    </div>
);
}