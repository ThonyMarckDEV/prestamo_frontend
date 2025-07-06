import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import {
  FaHome, FaBoxOpen, FaCalculator,
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

  useEffect(() => {
    const handleResize = () => {
      isMobile.current = window.innerWidth < 768;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!isMobile.current && isHovering) {
      setSidebarOpen(true);
    }
  }, [isHovering]);

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
      {/* Hamburger menu button */}
      <button
        onClick={toggleSidebar}
        className="fixed z-20 top-4 left-4 p-2 rounded-md bg-primary text-neutral-white md:hidden"
      >
        {sidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      {/* Overlay cuando el sidebar está abierto */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-neutral-dark bg-opacity-50 z-10"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 w-64 bg-primary text-neutral-white flex flex-col fixed h-full z-20 transition-transform duration-300 ease-in-out`}
        onMouseLeave={() => {
          if (!isMobile.current && isHovering) {
            setSidebarOpen(false);
            setIsHovering(false);
          }
        }}
      >
        {/* Header del sidebar */}
        <div className="h-[30%] bg-neutral-white flex flex-col">
          <div className="flex-1 flex items-center justify-center p-4">
            <img
              src={logo}
              alt="Logo FIC Sullana"
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <button
            onClick={toggleSidebar}
            className="absolute top-2 right-2 text-primary md:hidden"
            aria-label="Cerrar menú"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Menú */}
        <nav className="p-4 space-y-6 flex-1">
          <Link to="/admin/home" className="flex items-center gap-3 hover:text-neutral-gray" onClick={() => setSidebarOpen(false)}>
            <FaHome /> INICIO
          </Link>
          <Link to="/admin/calculadora" className="flex items-center gap-3 hover:text-neutral-gray" onClick={() => setSidebarOpen(false)}>
            <FaCalculator /> REGISTRO DE CRÉDITOS
          </Link>
          <Link to="/admin/productos" className="flex items-center gap-3 hover:text-neutral-gray" onClick={() => setSidebarOpen(false)}>
            <FaBoxOpen /> PRODUCTOS
          </Link>
          {/* Sección desplegable: Gestión de Clientes */}
          <div>
            <button
              onClick={() => setGestionClientesOpen(!gestionClientesOpen)}
              className="flex items-center justify-between w-full text-left gap-3 hover:text-neutral-gray"
            >
              <div className="flex items-center gap-3">
                <FaUsers /> GESTIÓN DE CLIENTES
              </div>
              {gestionClientesOpen ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
            </button>
            {gestionClientesOpen && (
              <div className="ml-6 mt-2 flex flex-col space-y-2">
                <Link to="/admin/clientes" className="hover:text-neutral-gray" onClick={() => setSidebarOpen(false)}>
                  REGISTRO DE CLIENTES
                </Link>
                <Link to="/admin/asignar-avales" className="hover:text-neutral-gray" onClick={() => setSidebarOpen(false)}>
                  ASIGNACIÓN DE AVAL
                </Link>
              </div>
            )}
          </div>
          <Link to="/admin/asesores" className="flex items-center gap-3 hover:text-neutral-gray" onClick={() => setSidebarOpen(false)}>
            <FaUserTie /> GESTIÓN DE EMPLEADOS
          </Link>
          {/* Sección desplegable: Gestión de Pagos */}
          <div>
            <button
              onClick={() => setGestionPagosOpen(!gestionPagosOpen)}
              className="flex items-center justify-between w-full text-left gap-3 hover:text-neutral-gray"
            >
              <div className="flex items-center gap-3">
                <FaMoneyBillAlt /> GESTIÓN DE PAGOS
              </div>
              {gestionPagosOpen ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
            </button>
            {gestionPagosOpen && (
              <div className="ml-6 mt-2 flex flex-col space-y-2">
                <Link to="/admin/estados" className="hover:text-neutral-gray" onClick={() => setSidebarOpen(false)}>
                  <div className="flex items-center gap-2"><FaChartBar /> REGISTRO DE CUOTAS</div>
                </Link>
                <Link to="/admin/pagos/filtros" className="hover:text-neutral-gray" onClick={() => setSidebarOpen(false)}>
                  <div className="flex items-center gap-2"><FaFilter /> FILTRAR PAGOS</div>
                </Link>
              </div>
            )}
          </div>
          <Link to="/admin/historial-prestamos" className="flex items-center gap-3 hover:text-neutral-gray" onClick={() => setSidebarOpen(false)}>
            <FaClipboardList /> HISTORIAL PRESTAMOS
          </Link>
          <Link to="/admin/cronograma" className="flex items-center gap-3 hover:text-neutral-gray" onClick={() => setSidebarOpen(false)}>
            <FaCalendarAlt /> CRONOGRAMAS
          </Link>
        </nav>

        {/* Logout button */}
        <div className="p-4 border-t border-primary-dark">
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-2 bg-primary-light hover:bg-primary-dark text-neutral-white px-4 py-2 rounded w-full"
          >
            <FaSignOutAlt /> CERRAR SESIÓN
          </button>
        </div>
      </div>

      {/* Contenido dinámico */}
      <div className="flex-1 bg-neutral-softWhite transition-all duration-300 md:ml-64">
        <div className="p-6 pt-16 md:pt-6">
          <Outlet />
        </div>
      </div>

      {/* Modal de confirmación */}
      {showConfirm && (
        <div className="fixed inset-0 bg-neutral-dark bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-white p-6 rounded-lg shadow-lg w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4 text-neutral-dark">
              ¿ESTÁS SEGURO/A DE CERRAR SESIÓN?
            </h3>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded bg-neutral-gray hover:bg-neutral-dark text-neutral-white"
              >
                NO
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded bg-primary text-neutral-white hover:bg-primary-dark"
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