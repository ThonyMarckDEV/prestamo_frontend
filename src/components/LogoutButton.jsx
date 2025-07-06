// LogoutButton.jsx
import React from 'react';
import { logout } from '../js/logout';

function LogoutButton() {
   const handleLogout = () => {
       logout(); // Cierra sesión
     };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-500 focus:outline-none"
    >
      Cerrar sesión
    </button>
  );
}

export default LogoutButton;
