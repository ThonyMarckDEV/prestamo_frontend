import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

//AUTH UIS

import Login from './ui/Auth/Login';

//SIDEBAR GLOBAL
import MainLayout from './ui/MainLayout';


//UIS ADMIN

import HomeAdmin from './ui/Admin/Home';

import AdminPerfil from './ui/Admin/Perfil/PerfilUI';

import Clientes from './ui/Admin/Clientes/ClientesUI';

import AsignarAvalesUI from './ui/Admin/Asignar-Avales/AsignarAvalesUI';

import Asesores from './ui/Admin/Empleados/AsesoresUI';

import CalculadoraUI from './ui/Admin/Calculadora/CalculadoraUI';

import Estados from './ui/Admin/Estados/EstadosUI';

import FiltroPagosUI from './ui/Admin/FiltrarPagos/FiltrarPagosUI';

import FiltrarPrestamos from './ui/Admin/FiltrarPrestamos/FiltrarPrestamosUI';

import Cronograma from './ui/Admin/Cronograma/CronogramaUI';

import Productos from './ui/Admin/Productos/ProductosUI';

//UIS CLIENTE

import EstadosCliente from './ui/Cliente/Estados/EstadosUI';

import ResumenCliente from './ui/Cliente/Resumen/ResumenUI';

import CronogramaCliente from './ui/Cliente/Cronograma/CronogramaUI';

import MisPagos from './ui/Cliente/MisPagos/MisPagosUI';

//UIS ASESOR
import HomeAsesor from './ui/Asesor/Clientes/ClientesUI';

//UIS AUDITOR
import HomeAuditor from './ui/Auditor/FiltrarPagos/FiltrarPagosUI';

import FiltrarPrestamosAuditor from './ui/Auditor/FiltrarPrestamos/FiltrarPrestamosUI';

import CronogramaAuditor from './ui/Auditor/Cronograma/CronogramaUI';

//Portectoresde rutas
import ProtectedRouteHome from './utilities/ProtectedRouteHome';

import ProtectedRouteAdmin from './utilities/ProtectedRouteAdmin';

import ProtectedRouteCliente from './utilities/ProtectedRouteCliente';

import ProtectedRouteAsesor from './utilities/ProtectedRouteAsesor';

import ProtectedRouteAuditor from './utilities/ProtectedRouteAuditor';

import ProtectedRouteToken from './utilities/ProtectedRouteToken';

//ERROR PAGES

import ErrorPage from './components/ErrorPage404';

import Error401Page from './components/ErrorPage401';


function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta por defecto */}
        <Route path="/" element={<ProtectedRouteHome element={<Login />} />} />

        {/* Rutas de Error */}
         <Route path="/*" element={<ErrorPage />} />

        <Route path="/401"  element={<Error401Page />} />

        <Route element={<ProtectedRouteToken element={<MainLayout />} />}>
        
        {/* Rutas para Admin */}

          <Route path="/admin/home" element={<ProtectedRouteAdmin element={<HomeAdmin />} />} />

          <Route path="/admin/perfil" element={<ProtectedRouteAdmin element={<AdminPerfil />} />} />

          <Route path="/admin/calculadora" element={<ProtectedRouteAdmin element={<CalculadoraUI />} />} />

          <Route path="/admin/clientes" element={<ProtectedRouteAdmin element={<Clientes />} />} />

          <Route path="/admin/asignar-avales" element={<ProtectedRouteAdmin element={<AsignarAvalesUI />} />} />

          <Route path="/admin/asesores" element={<ProtectedRouteAdmin element={<Asesores />} />} />
          
          <Route path="/admin/estados" element={<ProtectedRouteAdmin element={<Estados />} />} />

          <Route path="/admin/pagos/filtros" element={<ProtectedRouteAdmin element={<FiltroPagosUI />} />} />

          <Route path="/admin/historial-prestamos" element={<ProtectedRouteAdmin element={<FiltrarPrestamos />} />} />

          <Route path="/admin/cronograma" element={<ProtectedRouteAdmin element={<Cronograma />} />} />

          <Route path="/admin/productos" element={<ProtectedRouteAdmin element={<Productos />} />} />


          {/* Rutas para Cliente */}

          <Route path="/cliente/estados" element={<ProtectedRouteCliente element={<EstadosCliente />} />} />

          <Route path="/cliente/resumen" element={<ProtectedRouteCliente element={<ResumenCliente />} />} />

          <Route path="/cliente/cronograma" element={<ProtectedRouteCliente element={<CronogramaCliente />} />} />

          <Route path="/cliente/mispagos" element={<ProtectedRouteCliente element={<MisPagos />} />} />

          {/* Rutas par Asesor */}

          <Route path="/asesor/home" element={<ProtectedRouteAsesor element={<HomeAsesor />} />} />


          {/* Rutas par Auditor */}

          <Route path="/auditor/home" element={<ProtectedRouteAuditor element={<HomeAuditor />} />} />

          <Route path="/auditor/historial-prestamos" element={<ProtectedRouteAuditor element={<FiltrarPrestamosAuditor />} />} />

          <Route path="/auditor/cronograma" element={<ProtectedRouteAuditor element={<CronogramaAuditor />} />} />

        </Route>
      </Routes>

      {/* ToastContainer global */}
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}

export default App;