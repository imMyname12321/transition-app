import React, { useState } from 'react';
import { AppConfig, ControlElement } from '../types';
import { X, Plus, Trash2, Move, Save } from 'lucide-react';
import { motion, useDragControls } from 'motion/react';
import { cn } from '../lib/utils';

interface ControlLayoutEditorProps {
  app: AppConfig;
  onSave: (controls: ControlElement[]) => void;
  onClose: () => void;
}

export const ControlLayoutEditor: React.FC<ControlLayoutEditorProps> = ({
  app,
  onSave,
  onClose,
}) => {
  const [controls, setControls] = useState<ControlElement[]>(app.controls.map(c => ({
    ...c,
    shape: c.shape || 'circle'
  })));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const updateControl = React.useCallback((id: string, updates: Partial<ControlElement>) => {
    setControls(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  React.useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (selectedId && isDragging) {
        const canvas = document.getElementById('control-canvas');
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          updateControl(selectedId, { 
            x: Math.max(0, Math.min(100, x)), 
            y: Math.max(0, Math.min(100, y)) 
          });
        }
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [selectedId, isDragging, updateControl]);

  const addControl = () => {
    const newControl: ControlElement = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'button',
      label: 'NEW',
      x: 50,
      y: 50,
      size: 60,
      keyBinding: 'Space',
      shape: 'circle',
    };
    setControls([...controls, newControl]);
    setSelectedId(newControl.id);
  };

  const removeControl = (id: string) => {
    setControls(controls.filter(c => c.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const selectedControl = controls.find(c => c.id === selectedId);

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col">
      <header className="h-14 bg-[#1a1a1a] border-b border-white/10 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X size={20} />
          </button>
          <h2 className="font-bold text-white">Layout Editor: {app.name}</h2>
        </div>
        <button 
          onClick={() => onSave(controls)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-lg"
        >
          <Save size={18} />
          <span>Save</span>
        </button>
      </header>

      <div className="flex-1 relative bg-[#0a0a0a] overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
          style={{ 
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', 
            backgroundSize: '40px 40px' 
          }} 
        />

        {/* Control Canvas */}
        <div 
          className="absolute inset-0 touch-none" 
          id="control-canvas"
          onPointerUp={() => {
            if (!isDragging) {
              setSelectedId(null);
            }
          }}
        >
          {controls.map((control) => (
            <div
              key={control.id}
              onPointerDown={(e) => {
                e.stopPropagation();
                setSelectedId(control.id);
                setIsDragging(true);
              }}
              className={cn(
                "absolute cursor-move flex items-center justify-center border-2 transition-all touch-none",
                control.shape === 'circle' ? 'rounded-full' : 'rounded-lg',
                selectedId === control.id ? "bg-blue-500/30 border-blue-500 scale-110 z-10" : "bg-white/10 border-white/20"
              )}
              style={{
                left: `${control.x}%`,
                top: `${control.y}%`,
                width: `${control.size}px`,
                height: `${control.size}px`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <span className="text-xs font-bold text-white select-none">{control.label}</span>
            </div>
          ))}
        </div>

        {/* Sidebar / Properties */}
        {selectedControl && (
          <>
            {isSidebarOpen ? (
              <motion.div 
                initial={{ width: 0, height: 0, opacity: 0 }}
                animate={{ width: 150, height: 150, opacity: 1 }}
                className="absolute right-4 top-4 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-20"
              >
                <div className="flex items-center justify-between p-3 border-b border-white/5">
                  <h3 className="font-bold text-white/90 text-sm">Properties</h3>
                  <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-white/60 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
                  <div className="flex justify-end">
                    <button 
                      onClick={() => removeControl(selectedControl.id)}
                      className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Label</label>
                      <input 
                        type="text" 
                        value={selectedControl.label}
                        onChange={(e) => updateControl(selectedControl.id, { label: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Key Binding</label>
                      <input 
                        type="text" 
                        value={selectedControl.keyBinding}
                        onChange={(e) => updateControl(selectedControl.id, { keyBinding: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono text-blue-400 focus:border-blue-500 outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Shape</label>
                      <select 
                        value={selectedControl.shape}
                        onChange={(e) => updateControl(selectedControl.id, { shape: e.target.value as 'circle' | 'square' })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none transition-colors"
                      >
                        <option value="circle">Circle</option>
                        <option value="square">Square</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Size ({selectedControl.size}px)</label>
                      <input 
                        type="range" 
                        min="40" 
                        max="120"
                        value={selectedControl.size}
                        onChange={(e) => updateControl(selectedControl.id, { size: parseInt(e.target.value) })}
                        className="w-full accent-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setIsSidebarOpen(true)}
                className="absolute right-4 top-4 p-3 bg-blue-500 text-white rounded-full shadow-lg z-20 hover:bg-blue-600 transition-colors"
              >
                <Move size={20} />
              </motion.button>
            )}
          </>
        )}

        {/* Add Button */}
        <button 
          onClick={addControl}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-3 rounded-full flex items-center gap-2 font-bold shadow-2xl hover:scale-105 transition-transform"
        >
          <Plus size={20} />
          <span>Add Control</span>
        </button>
      </div>
    </div>
  );
};
