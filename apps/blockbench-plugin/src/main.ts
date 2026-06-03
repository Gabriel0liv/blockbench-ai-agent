import { openAgentDialog } from './ui/agentDialog.js';

(function() {
  let openAgentAction: any = null;

  if (typeof Plugin !== 'undefined') {
    Plugin.register('ai_model_agent', {
      title: 'AI Model Agent',
      author: 'Antigravity & Gabriel',
      icon: 'smart_toy',
      description: 'Control your Blockbench projects using local AI agent commands.',
      version: '1.0.0',
      variant: 'desktop',
      onload() {
        console.log('AI Model Agent plugin loaded successfully.');
        
        // Define Action to open the agent dialog modal
        openAgentAction = new Action('open_ai_model_agent', {
          name: 'AI Model Agent',
          description: 'Open the AI Model Agent prompt window',
          icon: 'smart_toy',
          click() {
            openAgentDialog();
          }
        });

        // Add action to the Tools menu
        if (typeof MenuBar !== 'undefined' && MenuBar.menus && MenuBar.menus.tools) {
          MenuBar.menus.tools.addAction(openAgentAction);
        }
      },
      onunload() {
        console.log('AI Model Agent plugin unloaded.');
        
        // Remove Action from Tools menu and release references
        if (openAgentAction) {
          if (typeof openAgentAction.delete === 'function') {
            openAgentAction.delete();
          }
          openAgentAction = null;
        }
      }
    });
  } else {
    console.error('Plugin registration API is unavailable (not running in Blockbench context).');
  }
})();
