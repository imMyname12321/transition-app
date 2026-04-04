import React from 'react';
import { ControlElement } from '../types';
import { motion } from 'motion/react';

interface ControlOverlayProps {
  controls: ControlElement[];
  onControlPress: (key: string) => void;
  onControlRelease: (key: string) => void;
}

export const ControlOverlay: React.FC<ControlOverlayProps> = ({ 
  controls, 
  onControlPress, 
  onControlRelease 
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {controls.map((control) => (
        <motion.button
          key={control.id}
          className="absolute pointer-events-auto flex items-center justify-center rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white font-bold select-none active:bg-white/30 active:scale-95 transition-all"
          style={{
            left: `${control.x}%`,
            top: `${control.y}%`,
            width: `${control.size}px`,
            height: `${control.size}px`,
            transform: 'translate(-50%, -50%)',
          }}
          onTouchStart={() => onControlPress(control.keyBinding)}
          onTouchEnd={() => onControlRelease(control.keyBinding)}
          onMouseDown={() => onControlPress(control.keyBinding)}
          onMouseUp={() => onControlRelease(control.keyBinding)}
        >
          {control.label}
        </motion.button>
      ))}
    </div>
  );
};
