// components/auth/LoginCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import logo from '../../../img/logo/Logo_FICSULLANA.png';

const LoginCard = ({ children, loginSuccess }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: loginSuccess ? [1, 1.03, 1] : 1,
        transition: loginSuccess ? {
          scale: { duration: 0.5, repeat: 0, repeatType: "reverse" }
        } : { duration: 0.6 }
      }}
      className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center relative z-10"
    >
      <img
        src={logo}
        alt="Logo FIC Sullana"
        className="w-36 mx-auto mb-4"
      />
      <motion.h1 
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: 1,
          color: loginSuccess ? ["#1f2937", "#047857", "#1f2937"] : "#1f2937"
        }}
        transition={{ 
          delay: 0.3, 
          duration: 0.5,
          color: { duration: 1.5 }
        }}
        className="text-xl font-semibold mb-6 text-gray-800"
      >
        INICIAR SESIÓN - FIC SULLANA
      </motion.h1>
      {children}
      
      {loginSuccess && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 rounded-lg z-20"
        >
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, 0, -10, 0] 
            }}
            transition={{ duration: 1, repeat: 1 }}
            className="text-4xl text-green-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-xl mt-4 font-medium">Acceso Exitoso</p>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};
export default LoginCard;