import React, { useState, useCallback } from 'react';
import { Dashboard } from './components/Dashboard';
import { AppWindow } from './components/AppWindow';
import { ControlOverlay } from './components/ControlOverlay';
import { ControlLayoutEditor } from './components/ControlLayoutEditor';
import { VirtualMouse } from './components/VirtualMouse';
import { AppConfig, WindowState, ControlElement, FolderConfig } from './types';
import { Monitor, Gamepad2, Terminal, Folder, Globe, Cpu, MousePointer2, X, FolderPlus } from 'lucide-react';
import { cn } from './lib/utils';
import { motion } from 'motion/react';

const INITIAL_APPS: AppConfig[] = [
  {
    id: '1',
    name: 'Steam.exe',
    icon: '🎮',
    exePath: 'C:/Program Files (x86)/Steam/Steam.exe',
    controls: [
      { id: '1', type: 'button', label: 'A', x: 85, y: 70, size: 60, keyBinding: 'Enter', shape: 'circle' },
      { id: '2', type: 'button', label: 'B', x: 92, y: 60, size: 60, keyBinding: 'Escape', shape: 'circle' },
      { id: '3', type: 'button', label: 'X', x: 78, y: 60, size: 60, keyBinding: 'X', shape: 'circle' },
      { id: '4', type: 'button', label: 'Y', x: 85, y: 50, size: 60, keyBinding: 'Y', shape: 'circle' },
    ],
  },
  {
    id: '2',
    name: 'Chrome.exe',
    icon: '🌐',
    exePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    controls: [
      { id: '5', type: 'button', label: 'F5', x: 10, y: 10, size: 50, keyBinding: 'F5', shape: 'circle' },
      { id: '6', type: 'button', label: 'TAB', x: 10, y: 25, size: 50, keyBinding: 'Tab', shape: 'circle' },
    ],
  },
  {
    id: '3',
    name: 'VSCode.exe',
    icon: '💻',
    exePath: 'C:/Users/User/AppData/Local/Programs/Microsoft VS Code/Code.exe',
    controls: [],
  },
  {
    id: '4',
    name: 'Cmd.exe',
    icon: '⌨️',
    exePath: 'C:/Windows/System32/cmd.exe',
    controls: [],
  },
];

export default function App() {
  const [apps, setApps] = useState<AppConfig[]>(INITIAL_APPS);
  const [folders, setFolders] = useState<FolderConfig[]>([]);
  const [openWindows, setOpenWindows] = useState<WindowState[]>([]);
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [editingInfoAppId, setEditingInfoAppId] = useState<string | null>(null);
  const [mouseActive, setMouseActive] = useState(false);
  const [maxZIndex, setMaxZIndex] = useState(10);
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddFolderModal, setShowAddFolderModal] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [newAppPath, setNewAppPath] = useState('');
  const [newAppIcon, setNewAppIcon] = useState('📦');
  const [newFolderName, setNewFolderName] = useState('');

  const launchApp = useCallback((appId: string) => {
    const existing = openWindows.find(w => w.appId === appId);
    if (existing) {
      focusWindow(existing.id);
      return;
    }

    const newWindow: WindowState = {
      id: Math.random().toString(36).substr(2, 9),
      appId,
      isOpen: true,
      isMinimized: false,
      zIndex: maxZIndex + 1,
    };

    setOpenWindows([...openWindows, newWindow]);
    setMaxZIndex(prev => prev + 1);
  }, [openWindows, maxZIndex]);

  const closeWindow = (id: string) => {
    setOpenWindows(openWindows.filter(w => w.id !== id));
  };

  const focusWindow = (id: string) => {
    setOpenWindows(openWindows.map(w => 
      w.id === id ? { ...w, zIndex: maxZIndex + 1, isMinimized: false } : w
    ));
    setMaxZIndex(prev => prev + 1);
  };

  const minimizeWindow = (id: string) => {
    setOpenWindows(openWindows.map(w => 
      w.id === id ? { ...w, isMinimized: true } : w
    ));
  };

  const saveLayout = (appId: string, controls: ControlElement[]) => {
    setApps(apps.map(app => app.id === appId ? { ...app, controls } : app));
    setEditingAppId(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const simulatedPath = `C:\\Program Files\\${file.name}`;
      setNewAppPath(simulatedPath);
      
      const fileName = file.name.toLowerCase();
      let detectedIcon = '📦'; // Default

      // Smart Icon Detection
      if (fileName.includes('steam')) detectedIcon = '🎮';
      else if (fileName.includes('chrome') || fileName.includes('browser')) detectedIcon = '🌐';
      else if (fileName.includes('code') || fileName.includes('visual')) detectedIcon = '💻';
      else if (fileName.includes('cmd') || fileName.includes('terminal')) detectedIcon = '⌨️';
      else if (fileName.includes('discord')) detectedIcon = '💬';
      else if (fileName.includes('spotify') || fileName.includes('music')) detectedIcon = '🎵';
      else if (fileName.includes('photoshop') || fileName.includes('design')) detectedIcon = '🎨';
      else if (fileName.includes('game')) detectedIcon = '🕹️';
      else if (fileName.includes('folder') || fileName.includes('explorer')) detectedIcon = '📁';
      else if (fileName.includes('setup') || fileName.includes('install')) detectedIcon = '⚙️';
      else {
        // Generate a random but consistent emoji based on first letter
        const emojis = ['🚀', '🛸', '🛰️', '⚡', '🔥', '💎', '🛠️', '🔧', '📡', '🔋'];
        detectedIcon = emojis[file.name.length % emojis.length];
      }

      setNewAppIcon(detectedIcon);
      
      if (!newAppName) {
        setNewAppName(file.name);
      }
    }
  };

  const handleAddApp = () => {
    if (!newAppName || !newAppPath) return;
    const newApp: AppConfig = {
      id: Math.random().toString(36).substr(2, 9),
      name: newAppName,
      icon: newAppIcon,
      exePath: newAppPath,
      controls: [],
    };
    setApps([...apps, newApp]);
    setNewAppName('');
    setNewAppPath('');
    setNewAppIcon('📦');
    setShowAddModal(false);
  };

  const handleDeleteApp = (appId: string) => {
    setApps(apps.filter(a => a.id !== appId));
    setOpenWindows(openWindows.filter(w => w.appId !== appId));
  };

  const handleUpdateAppInfo = () => {
    if (!editingInfoAppId || !newAppName || !newAppPath) return;
    setApps(apps.map(app => app.id === editingInfoAppId ? { ...app, name: newAppName, exePath: newAppPath, icon: newAppIcon } : app));
    setNewAppName('');
    setNewAppPath('');
    setNewAppIcon('📦');
    setEditingInfoAppId(null);
  };

  const handleAddFolder = () => {
    if (!newFolderName) return;
    const newFolder: FolderConfig = {
      id: Math.random().toString(36).substr(2, 9),
      name: newFolderName,
      appIds: [],
    };
    setFolders([...folders, newFolder]);
    setNewFolderName('');
    setShowAddFolderModal(false);
  };

  const handleDeleteFolder = (folderId: string) => {
    setFolders(folders.filter(f => f.id !== folderId));
  };

  const handleAddToFolder = (appId: string, folderId: string) => {
    setFolders(folders.map(f => {
      if (f.id === folderId) {
        if (f.appIds.includes(appId)) return f;
        return { ...f, appIds: [...f.appIds, appId] };
      }
      // Remove from other folders if it was there
      return { ...f, appIds: f.appIds.filter(id => id !== appId) };
    }));
  };

  const handleRemoveFromFolder = (appId: string, folderId: string) => {
    setFolders(folders.map(f => 
      f.id === folderId ? { ...f, appIds: f.appIds.filter(id => id !== appId) } : f
    ));
  };

  const editingApp = apps.find(a => a.id === editingAppId);
  const editingInfoApp = apps.find(a => a.id === editingInfoAppId);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0a0a0a]">
      <Dashboard 
        apps={apps} 
        folders={folders}
        onLaunch={launchApp} 
        onEditLayout={setEditingAppId}
        onAddApp={() => setShowAddModal(true)} 
        onAddFolder={() => setShowAddFolderModal(true)}
        onMouseToggle={() => setMouseActive(!mouseActive)}
        onSetupClick={() => setShowSetupModal(true)}
        onSettingsClick={() => setShowSetupModal(true)}
        onEditApp={(id) => {
          const app = apps.find(a => a.id === id);
          if (app) {
            setNewAppName(app.name);
            setNewAppPath(app.exePath);
            setNewAppIcon(app.icon);
            setEditingInfoAppId(id);
          }
        }}
        onDeleteApp={handleDeleteApp}
        onDeleteFolder={handleDeleteFolder}
        onAddToFolder={handleAddToFolder}
        onRemoveFromFolder={handleRemoveFromFolder}
        mouseActive={mouseActive}
      />

      {/* Render Windows */}
      {openWindows.map((window) => {
        const app = apps.find(a => a.id === window.appId);
        if (!app || window.isMinimized) return null;

        return (
          <AppWindow
            key={window.id}
            title={app.name}
            icon={<span className="text-sm">{app.icon}</span>}
            isActive={window.zIndex === maxZIndex}
            zIndex={window.zIndex}
            onClose={() => closeWindow(window.id)}
            onMinimize={() => minimizeWindow(window.id)}
            onFocus={() => focusWindow(window.id)}
          >
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#121212] relative">
              {/* Simulated App Content */}
              <div className="absolute inset-0 bg-[#0a0a0a] flex flex-col">
                <div className="h-8 bg-[#1a1a1a] border-b border-white/5 flex items-center px-3 gap-4">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                  </div>
                  <div className="flex-1 bg-black/40 rounded px-2 py-0.5 text-[10px] font-mono text-white/40 truncate">
                    {app.exePath}
                  </div>
                </div>
                
                {/* Simulated Desktop / App View */}
                <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                    style={{ 
                      backgroundImage: 'linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff), linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff)',
                      backgroundSize: '40px 40px',
                      backgroundPosition: '0 0, 20px 20px'
                    }} 
                  />

                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-6"
                    >
                      <div className="relative">
                        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-3xl flex items-center justify-center text-5xl border border-white/10 shadow-2xl">
                          {app.icon}
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-[#0a0a0a] animate-pulse" />
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-white tracking-tight">{app.name}</h3>
                        <div className="flex flex-col items-center gap-1">
                          <p className="text-white/40 text-[10px] font-mono uppercase tracking-widest">Transition Engine x64</p>
                          <p className="text-blue-400/60 text-[10px] font-mono">PID: {Math.floor(Math.random() * 9000) + 1000} | Threads: 12</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                        <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-left">
                          <p className="text-[9px] font-bold text-white/30 uppercase mb-1">CPU Usage</p>
                          <div className="flex items-end gap-2">
                            <span className="text-lg font-mono text-white/80">12%</span>
                            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden mb-1.5">
                              <div className="h-full bg-blue-500 w-[12%]" />
                            </div>
                          </div>
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-left">
                          <p className="text-[9px] font-bold text-white/30 uppercase mb-1">Memory</p>
                          <div className="flex items-end gap-2">
                            <span className="text-lg font-mono text-white/80">420MB</span>
                            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden mb-1.5">
                              <div className="h-full bg-purple-500 w-[45%]" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-green-500 text-[10px] font-bold uppercase tracking-widest">System Stable</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Control Overlay */}
              <ControlOverlay 
                controls={app.controls}
                onControlPress={(key) => console.log('Press:', key)}
                onControlRelease={(key) => console.log('Release:', key)}
              />
            </div>
          </AppWindow>
        );
      })}

      {/* Add/Edit App Modal */}
      {(showAddModal || editingInfoAppId) && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{editingInfoAppId ? 'Edit App Info' : 'Add New EXE'}</h2>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  setEditingInfoAppId(null);
                  setNewAppName('');
                  setNewAppPath('');
                }} 
                className="p-2 hover:bg-white/5 rounded-full text-white/40"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                  {newAppIcon}
                </div>
                <div className="flex-1 space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">App Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Photoshop.exe"
                    value={newAppName}
                    onChange={(e) => setNewAppName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Change Icon</label>
                <div className="flex flex-wrap gap-2">
                  {['📦', '🎮', '🌐', '💻', '⌨️', '💬', '🎵', '🎨', '🕹️', '📁', '⚙️', '🚀', '⚡', '🔥'].map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => setNewAppIcon(emoji)}
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all border",
                        newAppIcon === emoji ? "bg-blue-500/20 border-blue-500" : "bg-white/5 border-white/5 hover:bg-white/10"
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">EXE File</label>
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    id="exe-file-input"
                    accept=".exe"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="exe-file-input"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/60 hover:text-white hover:bg-white/10 cursor-pointer transition-all flex items-center justify-center gap-2 border-dashed"
                  >
                    <Folder size={18} />
                    <span>{newAppPath ? 'Change EXE File' : 'Select EXE File'}</span>
                  </label>
                  {newAppPath && (
                    <div className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-[10px] font-mono text-blue-400 truncate">{newAppPath}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button 
              onClick={editingInfoAppId ? handleUpdateAppInfo : handleAddApp}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
            >
              {editingInfoAppId ? 'Update App' : 'Add to Library'}
            </button>
          </motion.div>
        </div>
      )}

      {/* Add Folder Modal */}
      {showAddFolderModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Create New Folder</h2>
              <button 
                onClick={() => {
                  setShowAddFolderModal(false);
                  setNewFolderName('');
                }} 
                className="p-2 hover:bg-white/5 rounded-full text-white/40"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-3xl shadow-inner text-blue-500">
                  <FolderPlus size={32} />
                </div>
                <div className="flex-1 space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Folder Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Games"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
            <button 
              onClick={handleAddFolder}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
            >
              Create Folder
            </button>
          </motion.div>
        </div>
      )}

      {/* Setup Modal */}
      {showSetupModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Transition Setup</h2>
              <button onClick={() => setShowSetupModal(false)} className="p-2 hover:bg-white/5 rounded-full text-white/40">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Engine Version</h4>
                  <p className="text-xs text-white/40">v1.2.4-stable (x64)</p>
                </div>
                <div className="px-2 py-1 bg-green-500/20 text-green-500 text-[10px] font-bold rounded uppercase">Active</div>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Hardware Accel</h4>
                  <p className="text-xs text-white/40">Vulkan 1.3</p>
                </div>
                <div className="px-2 py-1 bg-blue-500/20 text-blue-500 text-[10px] font-bold rounded uppercase">Enabled</div>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Wine Prefix</h4>
                  <p className="text-xs text-white/40">/home/transition/.wine</p>
                </div>
                <button className="text-blue-500 text-[10px] font-bold uppercase">Change</button>
              </div>
            </div>
            <button 
              onClick={() => setShowSetupModal(false)}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-2xl transition-all"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}

      {/* Layout Editor Modal */}
      {editingApp && (
        <ControlLayoutEditor 
          app={editingApp}
          onSave={(controls) => saveLayout(editingApp.id, controls)}
          onClose={() => setEditingAppId(null)}
        />
      )}

      <VirtualMouse active={mouseActive} />
    </div>
  );
}
