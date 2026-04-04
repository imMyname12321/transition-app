import React, { useState } from 'react';
import { X, Minus, Square, GripVertical } from 'lucide-react';
import { motion, useDragControls } from 'motion/react';
import { cn } from '../lib/utils';

interface AppWindowProps {
  title: string;
  icon: React.ReactNode;
  onClose: () => void;
  onMinimize: () => void;
  children: React.ReactNode;
  isActive: boolean;
  onFocus: () => void;
  zIndex: number;
}

export const AppWindow: React.FC<AppWindowProps> = ({
  title,
  icon,
  onClose,
  onMinimize,
  children,
  isActive,
  onFocus,
  zIndex,
}) => {
  const dragControls = useDragControls();
  const [isMaximized, setIsMaximized] = useState(false);

  return (
    <motion.div
      drag={!isMaximized}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      onPointerDown={onFocus}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        width: isMaximized ? '100vw' : '80vw',
        height: isMaximized ? '100vh' : '70vh',
        x: isMaximized ? 0 : undefined,
        y: isMaximized ? 0 : undefined,
      }}
      style={{ zIndex }}
      className={cn(
        "fixed bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col",
        isMaximized ? "top-0 left-0 rounded-none" : "top-[10%] left-[10%]",
        isActive ? "ring-2 ring-blue-500/50" : "opacity-90"
      )}
    >
      {/* Title Bar */}
      <div 
        className="h-10 bg-[#252525] flex items-center justify-between px-3 cursor-default select-none border-b border-white/5"
        onPointerDown={(e) => dragControls.start(e)}
      >
        <div className="flex items-center gap-2">
          <div className="text-white/70">{icon}</div>
          <span className="text-sm font-medium text-white/90">{title}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={onMinimize}
            className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-white/60"
          >
            <Minus size={14} />
          </button>
          <button 
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-white/60"
          >
            <Square size={12} />
          </button>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-red-500/80 rounded-md transition-colors text-white/60 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 relative bg-black overflow-hidden">
        {children}
      </div>
    </motion.div>
  );
};
