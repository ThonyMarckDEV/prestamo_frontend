import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from 'axios';
import API_BASE_URL from '../../../js/urlHelper';
import jwtUtils from '../../../utilities/jwtUtils';

const LoginForm = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [dni, setDni] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/login`,
        {
          username,
          password,
          remember_me: rememberMe
        }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = response.data;

      const access_token = result.access_token;
      const refresh_token = result.refresh_token;
      const idRefreshToken = result.idRefreshToken;

      // Configure cookie options based on "Remember Me"
      const accessTokenExpiration = '; path=/; Secure; SameSite=Strict';
      const refreshTokenExpiration = rememberMe
        ? `; expires=${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString()}; path=/; Secure; SameSite=Strict`
        : '; path=/; Secure; SameSite=Strict';
      const refreshTokenIDExpiration = rememberMe
        ? `; expires=${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString()}; path=/; Secure; SameSite=Strict`
        : '; path=/; Secure; SameSite=Strict';

      // Set cookies
      document.cookie = `access_token=${access_token}${accessTokenExpiration}`;
      document.cookie = `refresh_token=${refresh_token}${refreshTokenExpiration}`;
      document.cookie = `refresh_token_id=${idRefreshToken}${refreshTokenIDExpiration}`;

      const rol = jwtUtils.getUserRole(access_token);

      if (rol === 'admin') {
        setShowSuccessAnimation(true);
        toast.success('Inicio de sesión exitoso!');
        onLoginSuccess(true);
        setTimeout(() => {
          window.location.href = '/admin/home';
        }, 2000);
      } else if (rol === 'cliente') {
        setShowSuccessAnimation(true);
        toast.success('Inicio de sesión exitoso!');
        onLoginSuccess(true);
        setTimeout(() => {
          window.location.href = '/cliente/estados';
        }, 2000);
      } else if (rol === 'asesor') {
        setShowSuccessAnimation(true);
        toast.success('Inicio de sesión exitoso!');
        onLoginSuccess(true);
        setTimeout(() => {
          window.location.href = '/asesor/home';
        }, 2000);
      } else if (rol === 'auditor') {
        setShowSuccessAnimation(true);
        toast.success('Inicio de sesión exitoso!');
        onLoginSuccess(true);
        setTimeout(() => {
          window.location.href = '/auditor/home';
        }, 2000);
      } else {
        console.error('Rol no reconocido:', rol);
        toast.error(`Rol no reconocido: ${rol}`);
      }
    } catch (error) {
      if (error.response) {
        const { message } = error.response.data;
        if (error.response.status === 403 && message.includes('cambiar tu contraseña')) {
          toast.info(message, { autoClose: 5000 });
        } else {
          toast.error(message || 'Usuario o contraseña incorrectos');
        }
      } else {
        console.error('Error al intentar iniciar sesión:', error);
        toast.error('Error interno del servidor. Por favor, inténtelo de nuevo más tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotPasswordLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/forgot-password`,
        { dni },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      toast.success(response.data.message || 'Se ha enviado un enlace de restablecimiento a tu correo.');
      setShowForgotPassword(false);
      setDni('');
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message || 'DNI no encontrado o error al enviar el correo.');
      } else {
        console.error('Error al solicitar restablecimiento:', error);
        toast.error('Error interno del servidor. Por favor, inténtelo de nuevo más tarde.');
      }
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <div>
      {/* Login Form */}
      <form className="space-y-4" onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-2 border border-neutral-gray rounded focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-neutral-gray rounded focus:outline-none focus:ring-2 focus:ring-primary pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-gray"
            tabIndex={-1}
          >
            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
          </button>
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-neutral-dark">Recordarme (7 Días)</span>
          </label>
          <div
            className="text-sm text-primary-light hover:underline cursor-pointer"
            onClick={() => setShowForgotPassword(true)}
          >
            ¿Olvidaste tu contraseña?
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full text-neutral-white font-semibold py-2 rounded transition ${loading ? 'bg-primary-dark' : 'bg-primary hover:bg-primary-dark'}`}
        >
          {loading ? 'Procesando...' : 'Iniciar sesión'}
        </button>
      </form>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-neutral-dark bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-center text-primary">Restablecer Contraseña</h2>
            <form className="space-y-4" onSubmit={handleForgotPassword}>
              <div>
                <label htmlFor="dni" className="block text-sm font-medium text-neutral-dark">
                  Ingresa tu DNI
                </label>
                <input
                  type="text"
                  id="dni"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  className="mt-1 w-full px-4 py-2 border border-neutral-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="DNI"
                  required
                />
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  className="px-4 py-2 text-sm text-neutral-dark hover:underline"
                  onClick={() => setShowForgotPassword(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={forgotPasswordLoading}
                  className={`px-4 py-2 text-neutral-white font-semibold rounded transition ${forgotPasswordLoading ? 'bg-primary-dark' : 'bg-primary hover:bg-primary-dark'}`}
                >
                  {forgotPasswordLoading ? 'Enviando...' : 'Enviar Correo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;