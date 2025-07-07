///////////////////////////////////////////////////////////////
// components/LoanResults.jsx
import React from 'react';

export default function LoanResults({ formData }) {
  return (
    <div className="bg-accent-yellow-50 p-2 sm:p-3 md:p-5 rounded-lg border-2 border-accent-yellow-200 mb-3 md:mb-6">
      <h3 className="font-semibold text-base sm:text-lg md:text-xl text-accent-yellow-700 mb-2 md:mb-4">RESULTADOS</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
        {/* Importe de Cuota */}
        <div className="flex flex-col">
          <label className="font-medium mb-1 md:mb-2 text-accent-steel-600 text-xs sm:text-sm">IMPORTE DE CUOTA</label>
          <div className="relative">
            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-accent-steel-DEFAULT text-sm">S/</span>
            <input 
              name="cuota" 
              type="text" 
              value={formData.cuota} 
              readOnly
              className="border-2 border-accent-yellow-200 bg-neutral-white pl-6 pr-2 py-1 md:py-2 rounded-lg w-full font-bold text-accent-copper-800" 
            />
          </div>
        </div>
        {/* Total a Pagar */}
        <div className="flex flex-col">
          <label className="font-medium mb-1 md:mb-2 text-accent-steel-600 text-xs sm:text-sm">TOTAL A PAGAR</label>
          <div className="relative">
            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-accent-steel-DEFAULT text-sm">S/</span>
            <input 
              name="total" 
              type="text" 
              value={formData.total} 
              readOnly
              className="border-2 border-accent-yellow-200 bg-neutral-white pl-6 pr-2 py-1 md:py-2 rounded-lg w-full font-bold text-accent-copper-800" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}