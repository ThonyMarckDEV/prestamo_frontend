import Sidebar from '../components/Sidebar';
import SidebarCliente from '../components/SidebarCliente';
import SidebarAsesor from '../components/SidebarAsesor';
import SidebarAuditor from '../components/SidebarAuditor';
import jwtUtils from '../utilities/jwtUtils';

// Mock function to get user role; replace with your actual auth logic
const getUserRole = () => {
  const token = jwtUtils.getRefreshTokenFromCookie();
  return jwtUtils.getUserRoleRefreshToken(token);
};

const MainLayout = () => {
  const role = getUserRole();

  return (
    <div className="min-h-screen ">
      {/* Conditionally render Sidebar based on role */}
      {role === 'admin' && <Sidebar />}
      {role === 'cliente' && <SidebarCliente />}
      {role === 'asesor' && <SidebarAsesor />}
      {role === 'auditor' && <SidebarAuditor />}
    </div>
  );
};

export default MainLayout;



