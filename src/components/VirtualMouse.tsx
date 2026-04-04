import React, { useState, useEffect, useCallback } from 'react';
import { MousePointer2 } from 'lucide-react';
import { motion } from 'motion/react';

interface VirtualMouseProps {
  active: boolean;
}

export const VirtualMouse: React.FC<VirtualMouseProps> = ({ active }) => {
  const [position, setPosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [isClicking, setIsClicking] = useState(false);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!active) return;
    const touch = e.touches[0];
    setPosition({ x: touch.clientX, y: touch.clientY });
  }, [active]);

  const handleTouchStart = useCallback(() => {
    if (!active) return;
    setIsClicking(true);
  }, [active]);

  const handleTouchEnd = useCallback(() => {
    if (!active) return;
    setIsClicking(false);
  }, [active]);

  useEffect(() => {
    if (active) {
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchstart', handleTouchStart);
      window.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [active, handleTouchMove, handleTouchStart, handleTouchEnd]);

  if (!active) return null;

  return (
    <motion.div
      className="fixed pointer-events-none z-[9999]"
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', damping: 20, stiffness: 300, mass: 0.5 }}
    >
      <div className={`relative transition-transform duration-75 ${isClicking ? 'scale-90' : 'scale-100'}`}>
        <MousePointer2 
          className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" 
          size={24} 
          fill="currentColor"
        />
        {isClicking && (
          <motion.div
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 2, opacity: 0 }}
            className="absolute top-0 left-0 w-6 h-6 bg-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2"
          />
        )}
      </div>
    </motion.div>
  );
};
