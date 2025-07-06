import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import {
  FaHome, FaUser, FaCalculator,
  FaUsers, FaChartBar, FaClipboardList, FaCalendarAlt, FaSignOutAlt, FaBars, FaTimes, FaUserTie, FaFilter, FaMoneyBillAlt
} from 'react-icons/fa';
import { logout } from '../js/logout';
import logo from '../img/logo/Logo_FICSULLANA.png';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

export default function Principal() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const sidebarRef = useRef(null);
  const hoverAreaRef = useRef(null);
  const isMobile = useRef(window.innerWidth < 768);
  const [gestionClientesOpen, setGestionClientesOpen] = useState(false);
  const [gestionPagosOpen, setGestionPagosOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Detectar si es dispositivo móvil o PC
  useEffect(() => {
    const handleResize = () => {
      isMobile.current = window.innerWidth < 768;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Manejar hover en el borde izquierdo (solo para PC)
  useEffect(() => {
    if (!isMobile.current && isHovering) {
      setSidebarOpen(true);
    }
  }, [isHovering]);

  // Close sidebar when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !hoverAreaRef.current?.contains(event.target) &&
        sidebarOpen) {
        setSidebarOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen flex relative">

      {/* Hamburger menu button - position fixed to stay on top */}
      <button
        onClick={toggleSidebar}
        className="fixed z-20 top-4 left-4 p-2 rounded-md bg-red-600 text-white md:hidden"
      >
        {sidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      {/* Overlay cuando el sidebar está abierto */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 w-64 bg-red-600 text-white flex flex-col fixed h-full z-20 transition-transform duration-300 ease-in-out`}
        onMouseLeave={() => {
          if (!isMobile.current && isHovering) {
            setSidebarOpen(false);
            setIsHovering(false);
          }
        }}
      >
        {/* Header del sidebar con fondo blanco al 30% de altura */}
        <div className="h-[30%] bg-white flex flex-col">
          {/* Contenedor de la imagen centrada */}
          <div className="flex-1 flex items-center justify-center p-4">
            <img
              src={logo}
              alt="Logo FIC Sullana"
              className="max-w-full max-h-full object-contain"
            />
          </div>
          {/* Botón de cerrar solo para móviles */}
          <button
            onClick={toggleSidebar}
            className="absolute top-2 right-2 text-red-600 md:hidden"
            aria-label="Cerrar menú"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Menú */}
        <nav className="p-4 space-y-6 flex-1">
          {/* Sección desplegable: Gestión de Pagos */}
          <div>
            <button
              onClick={() => setGestionPagosOpen(!gestionPagosOpen)}
              className="flex items-center justify-between w-full text-left gap-3 hover:text-gray-300"
            >
              <div className="flex items-center gap-3">
                <FaMoneyBillAlt /> GESTIÓN DE PAGOS
              </div>
              {gestionPagosOpen ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
            </button>

            {gestionPagosOpen && (
              <div className="ml-6 mt-2 flex flex-col space-y-2">
                <Link to="/auditor/home" className="hover:text-gray-300" onClick={() => setSidebarOpen(false)}>
                  <div className="flex items-center gap-2"><FaFilter /> FILTRAR PAGOS</div>
                </Link>
              </div>
            )}
          </div>
          <Link to="/auditor/historial-prestamos" className="flex items-center gap-3 hover:text-gray-300" onClick={() => setSidebarOpen(false)}>
            <FaClipboardList /> HISTORIAL PRESTAMOS
          </Link>
          <Link to="/auditor/cronograma" className="flex items-center gap-3 hover:text-gray-300" onClick={() => setSidebarOpen(false)}>
            <FaCalendarAlt /> CRONOGRAMAS
          </Link>
        </nav>

        {/* Logout button en la parte inferior */}
        <div className="p-4 border-t border-red-700">
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded w-full"
          >
            <FaSignOutAlt /> CERRAR SESIÓN
          </button>
        </div>
      </div>

      {/* Contenido dinámico - with padding that adjusts based on sidebar visibility */}
      <div className="flex-1 bg-gray-100 transition-all duration-300 md:ml-64">
        <div className="p-6 pt-16 md:pt-6">
          <Outlet />
        </div>
      </div>

      {/* Modal de confirmación */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              ¿ESTÁS SEGURO/A DE CERRAR SESIÓN?
            </h3>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              >
                NO
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                SÍ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}