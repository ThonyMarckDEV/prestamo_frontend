// components/auth/Wave.jsx
import React from 'react';
import { motion } from 'framer-motion';

const Wave = () => {
  return (
    <div className="absolute bottom-0 left-0 w-full overflow-hidden z-0">
      <motion.div
        initial={{ y: 10, opacity: 0.8 }}
        animate={{ 
          y: [0, -10, 0],
          opacity: [0.8, 1, 0.8]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 3,
          ease: "easeInOut" 
        }}
        className="relative h-24"
      >
        <svg 
          className="absolute bottom-0"
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1440 320"
        >
          <path 
            fill="#EF4444" 
            fillOpacity="0.8" 
            d="M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,229.3C672,235,768,213,864,181.3C960,149,1056,107,1152,101.3C1248,96,1344,128,1392,144L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
        <svg 
          className="absolute bottom-0"
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1440 320"
        >
          <path 
            fill="#DC2626" 
            fillOpacity="0.6" 
            d="M0,288L48,272C96,256,192,224,288,218.7C384,213,480,235,576,245.3C672,256,768,256,864,229.3C960,203,1056,149,1152,144C1248,139,1344,181,1392,202.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </motion.div>
    </div>
  );
};

export default Wave;