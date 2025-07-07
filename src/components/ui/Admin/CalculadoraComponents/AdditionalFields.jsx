import React from 'react';
import AdvisorSearch from './AdvisorSearch';

export default function AdditionalFields({ formData, handleInputChange, errors, isGroupLoan, advisor }) {
  const handleAdvisorSelect = (advisor) => {
    // Update the formData with the selected advisor
    const advisorId = advisor.idUsuario || `${advisor.datos?.nombre || ''} ${advisor.datos?.apellido || ''}`.trim();
    
    handleInputChange({
      target: {
        name: 'asesor',
        value: advisorId
      }
    });
    
    handleInputChange({
      target: {
        name: 'advisorData',
        value: advisor
      }
    });
  };

  const handleAdvisorRemove = () => {
    handleInputChange({
      target: {
        name: 'asesor',
        value: ''
      }
    });
    
    handleInputChange({
      target: {
        name: 'advisorData',
        value: null
      }
    });
  };

return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
      {/* Frecuencia */}
      <div className="flex flex-col">
        <label className="font-medium mb-1 md:mb-2 text-accent-steel-600 text-xs sm:text-sm">FRECUENCIA</label>
        <select
          name="frecuencia"
          value={formData.frecuencia}
          onChange={handleInputChange}
          className={`border-2 ${errors.frecuencia ? 'border-accent-copper-600' : 'border-neutral-gray'} focus:border-accent-copper-DEFAULT focus:ring focus:ring-accent-yellow-100 focus:ring-opacity-50 px-2 py-1 md:py-2 rounded-lg w-full text-sm`}
        >
          <option value="">SELECCIONE...</option>
          <option value="semanal">SEMANAL</option>
          <option value="catorcenal">CATORCENAL</option>
          <option value="mensual">MENSUAL</option>
        </select>
        {errors.frecuencia && <p className="text-accent-copper-600 text-sm mt-1">{errors.frecuencia}</p>}
      </div>
     
      {/* Asesor */}
      {!isGroupLoan && (
        <div className="flex flex-col">
          <label className="font-medium mb-1 md:mb-2 text-accent-steel-600 text-xs sm:text-sm">ASESOR</label>
          <AdvisorSearch
            selectedAdvisor={formData.advisorData}
            onSelect={handleAdvisorSelect}
            onRemove={handleAdvisorRemove}
            errors={errors.asesor}
          />
        </div>
      )}
      
      {/* Modalidad */}
      <div className="flex flex-col">
        <label className="font-medium mb-1 md:mb-2 text-accent-steel-600 text-xs sm:text-sm">MODALIDAD</label>
        <select
          name="modalidad"
          value={formData.modalidad}
          onChange={handleInputChange}
          className={`border-2 ${errors.modalidad ? 'border-accent-copper-600' : 'border-neutral-gray'} focus:border-accent-copper-DEFAULT focus:ring focus:ring-accent-yellow-100 focus:ring-opacity-50 px-2 py-1 md:py-2 rounded-lg w-full text-sm`}
        >
          <option value="">SELECCIONE...</option>
          <option value="nuevo">NUEVO</option>
          <option value="rcs">RCS</option>
          <option value="rss">RSS</option>
        </select>
        {errors.modalidad && <p className="text-accent-copper-600 text-sm mt-1">{errors.modalidad}</p>}
      </div>
    </div>
);
}