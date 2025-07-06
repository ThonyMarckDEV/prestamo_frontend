import React from 'react';
import { Navigate } from 'react-router-dom';
import jwtUtils from '../utilities/jwtUtils'; // Asegúrate de tener esta utilidad para decodificar el token

const ProtectedRouteAdmin = ({ element }) => {
  // Obtener el JWT desde localStorage
  const refresh_token = jwtUtils.getRefreshTokenFromCookie();


  if (!refresh_token) {
    return <Navigate to="/401" />;
  }

  const rol = jwtUtils.getUserRoleRefreshToken(refresh_token);

  if (rol !== 'admin') {
    return <Navigate to="/401" />;
  }

  // Si hay token, se muestra el elemento original
  return element;

};

export default ProtectedRouteAdmin;
