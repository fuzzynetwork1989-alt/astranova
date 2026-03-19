const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getVersion: () => ipcRenderer.invoke('get-version'),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  
  // AI Features
  openAIChat: () => {
    const event = new CustomEvent('openAIChat');
    window.dispatchEvent(event);
  },
  
  summarizePage: () => {
    const event = new CustomEvent('summarizePage');
    window.dispatchEvent(event);
  }
});

// Add Electron-specific styles and functionality
window.addEventListener('DOMContentLoaded', () => {
  // Add window controls
  if (window.electronAPI) {
    const style = document.createElement('style');
    style.textContent = `
      .electron-window-controls {
        position: fixed;
        top: 0;
        right: 0;
        z-index: 9999;
        display: flex;
        gap: 8px;
        padding: 8px;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
      }
      
      .window-control-btn {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        transition: opacity 0.2s;
      }
      
      .window-control-btn:hover {
        opacity: 0.8;
      }
      
      .close-btn { background: #ff5f57; }
      .minimize-btn { background: #ffbd2e; }
      .maximize-btn { background: #28ca42; }
    `;
    document.head.appendChild(style);
    
    // Create window controls
    const controls = document.createElement('div');
    controls.className = 'electron-window-controls';
    controls.innerHTML = `
      <button class="window-control-btn close-btn" onclick="window.electronAPI.closeWindow()"></button>
      <button class="window-control-btn minimize-btn" onclick="window.electronAPI.minimizeWindow()"></button>
      <button class="window-control-btn maximize-btn" onclick="window.electronAPI.maximizeWindow()"></button>
    `;
    document.body.appendChild(controls);
  }
});
