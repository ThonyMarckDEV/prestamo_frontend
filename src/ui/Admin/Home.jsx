import { Link } from 'react-router-dom';
import {
  Users,
  Plus,
  FileText,
  Settings,
  BarChart,
  Calendar,
  DollarSign,
  MessageSquare,
  Briefcase,
  UserCircle,
  Calculator,
  Wallet2,
  History,
  PackageOpen

} from 'lucide-react';

export default function Inicio() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-3xl md:text-4xl font-bold text-red-600 mb-8">FicSullana Control Panel</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl w-full">
        <Link
          to="/admin/calculadora"
          className="bg-white border-2 border-red-600 rounded-lg p-6 md:p-8 flex flex-col items-center justify-center text-red-600 hover:scale-105 hover:shadow-lg transition-transform duration-200"
        >
          <Calculator size={36} />
          <span className="mt-3 text-base md:text-lg font-semibold">Creditos</span>
        </Link>
        <Link
          to="/admin/productos"
          className="bg-white border-2 border-red-600 rounded-lg p-6 md:p-8 flex flex-col items-center justify-center text-red-600 hover:scale-105 hover:shadow-lg transition-transform duration-200"
        >
          <PackageOpen size={36} />
          <span className="mt-3 text-base md:text-lg font-semibold">Productos</span>
        </Link>
        <Link
          to="/admin/clientes"
          className="bg-white border-2 border-red-600 rounded-lg p-6 md:p-8 flex flex-col items-center justify-center text-red-600 hover:scale-105 hover:shadow-lg transition-transform duration-200"
        >
          <Users size={36} />
          <span className="mt-3 text-base md:text-lg font-semibold">Clientes</span>
        </Link>
        <Link
          to="/admin/asignar-avales"
          className="bg-white border-2 border-red-600 rounded-lg p-6 md:p-8 flex flex-col items-center justify-center text-red-600 hover:scale-105 hover:shadow-lg transition-transform duration-200"
        >
          <Plus size={36} />
          <span className="mt-3 text-base md:text-lg font-semibold">Asignar Avales</span>
        </Link>
        <Link
          to="/admin/asesores"
          className="bg-white border-2 border-red-600 rounded-lg p-6 md:p-8 flex flex-col items-center justify-center text-red-600 hover:scale-105 hover:shadow-lg transition-transform duration-200"
        >
          <UserCircle size={36} />
          <span className="mt-3 text-base md:text-lg font-semibold">Empleados</span>
        </Link>
        <Link
          to="/admin/estados"
          className="bg-white border-2 border-red-600 rounded-lg p-6 md:p-8 flex flex-col items-center justify-center text-red-600 hover:scale-105 hover:shadow-lg transition-transform duration-200"
        >
          <DollarSign size={36} />
          <span className="mt-3 text-base md:text-lg font-semibold">Registro Cuotas</span>
        </Link>
        <Link
          to="/admin/pagos/filtros"
          className="bg-white border-2 border-red-600 rounded-lg p-6 md:p-8 flex flex-col items-center justify-center text-red-600 hover:scale-105 hover:shadow-lg transition-transform duration-200"
        >
          <Wallet2 size={36} />
          <span className="mt-3 text-base md:text-lg font-semibold">Filtrar Pagos</span>
        </Link>
        <Link
          to="/admin/historial-prestamos"
          className="bg-white border-2 border-red-600 rounded-lg p-6 md:p-8 flex flex-col items-center justify-center text-red-600 hover:scale-105 hover:shadow-lg transition-transform duration-200"
        >
          <History size={36} />
          <span className="mt-3 text-base md:text-lg font-semibold">Historial Prestamos</span>
        </Link>
        <Link
          to="/admin/cronograma"
          className="bg-white border-2 border-red-600 rounded-lg p-6 md:p-8 flex flex-col items-center justify-center text-red-600 hover:scale-105 hover:shadow-lg transition-transform duration-200"
        >
          <Calendar size={36} />
          <span className="mt-3 text-base md:text-lg font-semibold">Cronogramas</span>
        </Link>
      </div>
    </div>
  );
}