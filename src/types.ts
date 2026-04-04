export interface ControlElement {
  id: string;
  type: 'button' | 'joystick' | 'dpad';
  label: string;
  x: number;
  y: number;
  size: number;
  keyBinding: string;
  shape: 'circle' | 'square';
}

export interface FolderConfig {
  id: string;
  name: string;
  appIds: string[];
}

export interface AppConfig {
  id: string;
  name: string;
  icon: string;
  exePath: string;
  controls: ControlElement[];
}

export interface WindowState {
  id: string;
  appId: string;
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
}
