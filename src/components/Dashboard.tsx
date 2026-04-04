import React, { useState } from 'react';
import { Plus, Settings, Play, Layout, MousePointer2, Trash2, Folder, FolderPlus, ArrowLeft } from 'lucide-react';
import { AppConfig, FolderConfig } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface DashboardProps {
  apps: AppConfig[];
  folders: FolderConfig[];
  onLaunch: (appId: string) => void;
  onEditLayout: (appId: string) => void;
  onAddApp: () => void;
  onAddFolder: () => void;
  onMouseToggle: () => void;
  onSetupClick: () => void;
  onSettingsClick: () => void;
  onEditApp: (appId: string) => void;
  onDeleteApp: (appId: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onAddToFolder: (appId: string, folderId: string) => void;
  onRemoveFromFolder: (appId: string, folderId: string) => void;
  mouseActive: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  apps,
  folders,
  onLaunch,
  onEditLayout,
  onAddApp,
  onAddFolder,
  onMouseToggle,
  onSetupClick,
  onSettingsClick,
  onEditApp,
  onDeleteApp,
  onDeleteFolder,
  onAddToFolder,
  onRemoveFromFolder,
  mouseActive,
}) => {
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  const activeFolder = folders.find(f => f.id === activeFolderId);
  const displayedApps = activeFolderId 
    ? apps.filter(app => activeFolder?.appIds.includes(app.id))
    : apps.filter(app => !folders.some(f => f.appIds.includes(app.id)));

  return (
    <div className="h-full overflow-y-auto bg-[#0a0a0a] p-6 pb-32 scrollbar-hide" onClick={() => setSelectedAppId(null)}>
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {activeFolderId && (
            <button 
              onClick={() => setActiveFolderId(null)}
              className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors border border-white/10 text-white"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {activeFolderId ? activeFolder?.name : 'Transition'}
            </h1>
            <p className="text-white/40 text-sm">
              {activeFolderId ? `${activeFolder?.appIds.length} apps in folder` : 'PC App Manager for Android'}
            </p>
          </div>
        </div>
        <button 
          onClick={onSettingsClick}
          className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors border border-white/10"
        >
          <Settings className="text-white/60" size={20} />
        </button>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <AnimatePresence mode="popLayout">
          {/* Folders (only on main screen) */}
          {!activeFolderId && folders.map((folder) => (
            <motion.div
              key={folder.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveFolderId(folder.id)}
              className="group relative bg-[#1a1a1a] border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-3 hover:border-blue-500/30 transition-all cursor-pointer"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-gray-500/20 to-gray-700/20 rounded-xl flex items-center justify-center text-3xl shadow-inner border border-white/5 relative overflow-hidden">
                <div className="grid grid-cols-2 gap-1 p-2">
                  {folder.appIds.slice(0, 4).map(appId => {
                    const app = apps.find(a => a.id === appId);
                    return app ? (
                      <div key={appId} className="text-[10px] flex items-center justify-center bg-white/5 rounded-sm">
                        {app.icon}
                      </div>
                    ) : null;
                  })}
                  {folder.appIds.length === 0 && (
                    <Folder className="text-white/20 col-span-2" size={24} />
                  )}
                </div>
              </div>
              <span className="text-sm font-medium text-white/80 text-center truncate w-full">
                {folder.name}
              </span>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteFolder(folder.id);
                }}
                className="absolute top-2 right-2 p-1.5 bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity border border-red-500/20 text-red-500"
              >
                <Trash2 size={12} />
              </button>
            </motion.div>
          ))}

          {/* Apps */}
          {displayedApps.map((app) => (
            <motion.div
              key={app.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedAppId(selectedAppId === app.id ? null : app.id);
              }}
              className={cn(
                "group relative bg-[#151515] border rounded-2xl p-4 flex flex-col items-center gap-3 transition-all",
                selectedAppId === app.id ? "border-blue-500/50" : "border-white/5 hover:border-blue-500/30"
              )}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center text-3xl shadow-inner border border-white/5">
                {app.icon}
              </div>
              <span className="text-sm font-medium text-white/80 text-center truncate w-full">
                {app.name}
              </span>

              <AnimatePresence>
                {selectedAppId === app.id && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/90 rounded-2xl flex flex-col items-center justify-center gap-3 backdrop-blur-sm p-2 z-10"
                  >
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onLaunch(app.id); }}
                        className="p-2.5 bg-blue-500 rounded-full hover:bg-blue-600 transition-colors shadow-lg text-white"
                        title="Launch"
                      >
                        <Play size={18} fill="currentColor" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onEditLayout(app.id); }}
                        className="p-2.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors border border-white/10 text-white"
                        title="Edit Controls"
                      >
                        <Layout size={18} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onEditApp(app.id); }}
                        className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/10 text-white/60 hover:text-white"
                        title="Edit App Info"
                      >
                        <Settings size={14} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteApp(app.id); }}
                        className="p-2 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors border border-red-500/20 text-red-500"
                        title="Delete App"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    {/* Folder Management */}
                    {!activeFolderId ? (
                      <div className="flex flex-wrap justify-center gap-1 mt-1">
                        {folders.map(f => (
                          <button
                            key={f.id}
                            onClick={(e) => { e.stopPropagation(); onAddToFolder(app.id, f.id); }}
                            className="text-[8px] font-bold px-1.5 py-0.5 bg-white/5 rounded border border-white/10 text-white/40 hover:text-white hover:bg-white/10"
                          >
                            {f.name.slice(0, 3)}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); onRemoveFromFolder(app.id, activeFolderId); }}
                        className="text-[8px] font-bold px-2 py-1 bg-white/5 rounded border border-white/10 text-white/40 hover:text-white hover:bg-white/10 mt-1"
                      >
                        Move Out
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}

          {/* Add Actions */}
          {!activeFolderId && (
            <motion.button 
              key="add-app"
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={onAddApp}
              className="bg-white/5 border border-dashed border-white/20 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-all text-white/40 hover:text-white/60"
            >
              <Plus size={32} />
              <span className="text-xs font-medium uppercase tracking-wider">Add EXE</span>
            </motion.button>
          )}
          {!activeFolderId && (
            <motion.button 
              key="add-folder"
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={onAddFolder}
              className="bg-white/5 border border-dashed border-white/20 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-all text-white/40 hover:text-white/60"
            >
              <FolderPlus size={32} />
              <span className="text-xs font-medium uppercase tracking-wider">Add Folder</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex items-center gap-8 shadow-2xl z-50">
        <button 
          onClick={() => setActiveFolderId(null)}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            !activeFolderId ? "text-blue-500" : "text-white/40 hover:text-white/60"
          )}
        >
          <Layout size={20} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Apps</span>
        </button>
        <button 
          onClick={onMouseToggle}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            mouseActive ? "text-blue-500" : "text-white/40 hover:text-white/60"
          )}
        >
          <MousePointer2 size={20} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Mouse</span>
        </button>
        <button 
          onClick={onSetupClick}
          className="text-white/40 hover:text-white/60 transition-colors flex flex-col items-center gap-1"
        >
          <Settings size={20} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Setup</span>
        </button>
      </nav>
    </div>
  );
};
