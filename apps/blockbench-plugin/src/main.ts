import { createChatPanel, registerPanelEvents, unregisterPanelEvents } from './ui/chatPanel.js';

(function() {
  let panelInstance: any = null;

  if (typeof Plugin !== 'undefined') {
    Plugin.register('blockbench-ai-agent', {
      title: 'AI Model Agent',
      author: 'Antigravity & Gabriel',
      icon: 'smart_toy',
      description: 'Control your Blockbench projects using local AI agent commands.',
      version: '1.0.0',
      variant: 'both',
      onload() {
        console.log('AI Model Agent plugin loaded successfully.');
        
        // Instantiate and register the sidebar panel
        panelInstance = createChatPanel();
        if (panelInstance && typeof panelInstance.register === 'function') {
          panelInstance.register();
        }
        
        // Attach DOM listeners for user interaction
        registerPanelEvents();
      },
      onunload() {
        console.log('AI Model Agent plugin unloaded.');
        
        // Dismount sidebar panel
        if (panelInstance && typeof panelInstance.unregister === 'function') {
          panelInstance.unregister();
          panelInstance = null;
        }
        
        // Clean up DOM event listeners
        unregisterPanelEvents();
      }
    });
  } else {
    console.error('Plugin registration API is unavailable (not running in Blockbench context).');
  }
})();
