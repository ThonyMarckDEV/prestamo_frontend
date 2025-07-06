// Login.jsx (Componente principal)
import React, { useState } from 'react';
import LoginForm from '../../components/Auth/LoginComponents/LoginForm';
import LoginCard from '../../components/Auth/LoginComponents/LoginCard';
import Particles  from '../../components/Auth/LoginComponents/Particles';


export default function Login() {
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleLoginSuccess = () => {
    setLoginSuccess(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 relative overflow-hidden">
      <Particles loginSuccess={loginSuccess} />
      
      <LoginCard loginSuccess={loginSuccess}>
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      </LoginCard>
      
    </div>
  );
}