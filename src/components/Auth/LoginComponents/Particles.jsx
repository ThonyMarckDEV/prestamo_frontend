// components/auth/Particles.jsx
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const Particles = ({ loginSuccess }) => {
  const particlesRef = useRef([]);
  const containerRef = useRef(null);
  
  // Create particles
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    
    // Clear existing particles
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    
    // Create new particles
    particlesRef.current = [];
    const numParticles = 50;
    
    for (let i = 0; i < numParticles; i++) {
      const particle = document.createElement('div');
      
      // Random positioning and styling
      const size = Math.random() * 8 + 3;
      const opacity = Math.random() * 0.6 + 0.2;
      
      particle.style.position = 'absolute';
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.backgroundColor = '#0A2F52';
      particle.style.borderRadius = '50%';
      particle.style.opacity = opacity;
      particle.style.left = `${Math.random() * containerWidth}px`;
      particle.style.top = `${Math.random() * containerHeight}px`;
      
      // Animation properties
      particle.dataset.speedX = (Math.random() - 0.5) * 1;
      particle.dataset.speedY = (Math.random() - 0.5) * 1;
      particle.dataset.x = parseFloat(particle.style.left);
      particle.dataset.y = parseFloat(particle.style.top);
      
      container.appendChild(particle);
      particlesRef.current.push(particle);
    }
    
    // Animation loop
    let animationId;
    const animate = () => {
      particlesRef.current.forEach(particle => {
        // Update position
        let x = parseFloat(particle.dataset.x);
        let y = parseFloat(particle.dataset.y);
        const speedX = parseFloat(particle.dataset.speedX);
        const speedY = parseFloat(particle.dataset.speedY);
        
        x += speedX;
        y += speedY;
        
        // Boundary check
        if (x < 0 || x > containerWidth) {
          particle.dataset.speedX = -speedX;
        }
        if (y < 0 || y > containerHeight) {
          particle.dataset.speedY = -speedY;
        }
        
        // Update position
        particle.dataset.x = x;
        particle.dataset.y = y;
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);
  
  // Success animation effect
  useEffect(() => {
    if (loginSuccess && containerRef.current) {
      // When login is successful, particles converge to center
      const container = containerRef.current;
      const centerX = container.offsetWidth / 2;
      const centerY = container.offsetHeight / 2;
      
      particlesRef.current.forEach(particle => {
        // Get current position
        const x = parseFloat(particle.dataset.x);
        const y = parseFloat(particle.dataset.y);
        
        // Calculate direction to center
        const dx = centerX - x;
        const dy = centerY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Set new speed towards center
        const speed = 3 + Math.random() * 2;
        particle.dataset.speedX = (dx / distance) * speed;
        particle.dataset.speedY = (dy / distance) * speed;
        
        // Increase particle size for effect
        const currentSize = parseFloat(particle.style.width);
        particle.style.width = `${currentSize * 1.5}px`;
        particle.style.height = `${currentSize * 1.5}px`;
        particle.style.opacity = '0.8';
      });
    }
  }, [loginSuccess]);
  
  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden z-0"
    />
  );
};

export default Particles;