// components/utils/ObservacionesTooltip.js
import React from 'react';

const ObservacionesTooltip = ({ hoveredCuota, tooltipPosition }) => {
  if (!hoveredCuota) return null;

  return (
    <div
      className="fixed bg-white border border-gray-200 shadow-lg rounded-lg p-3 max-w-xs z-50 text-sm text-gray-700"
      style={{
        top: `${tooltipPosition.y + 10}px`,
        left: `${tooltipPosition.x + 10}px`,
      }}
    >
      <p className="font-medium text-gray-800">Observaciones:</p>
      <p>{hoveredCuota.observaciones || 'Sin observaciones'}</p>
    </div>
  );
};

export default ObservacionesTooltip;