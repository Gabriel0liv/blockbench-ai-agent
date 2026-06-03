import { readProjectContext } from '../blockbench/readProject.js';
import { applyCommands } from '../blockbench/applyCommands.js';
import { runInUndoTransaction, triggerUndo } from '../blockbench/undo.js';

let activeDialog: any = null;

/**
 * Opens the Dialog modal interface for prompting the AI Agent.
 * Replaces the previous sidebar Panel approach.
 */
export function openAgentDialog() {
  if (typeof Dialog === 'undefined') {
    console.warn('Dialog constructor is not defined in Blockbench.');
    return;
  }

  // Prevent multiple dialog instances from opening
  if (activeDialog) {
    activeDialog.show();
    return;
  }

  activeDialog = new Dialog({
    id: 'ai_model_agent_dialog',
    title: 'AI Model Agent Prompt',
    icon: 'smart_toy',
    lines: [
      `
      <div class="ai-agent-dialog" style="display: flex; flex-direction: column; gap: 8px; width: 450px; padding: 10px; box-sizing: border-box;">
        <textarea id="dialog-ai-prompt" placeholder="Ex: cria dois chifres pequenos no grupo selecionado" style="width: 100%; height: 80px; box-sizing: border-box; background: var(--color-input); color: var(--color-text); border: 1px solid var(--color-border); border-radius: 4px; padding: 8px; resize: none; font-size: 13px; font-family: sans-serif;"></textarea>
        
        <div style="font-size: 12px; margin-top: 4px; display: flex; justify-content: space-between;">
          <span><strong>Status:</strong> <span id="dialog-ai-status" style="color: var(--color-accent); font-weight: bold;">Idle</span></span>
        </div>
        
        <div id="dialog-ai-log" style="height: 120px; overflow-y: auto; font-family: monospace; font-size: 12px; color: var(--color-sub); background: var(--color-back); padding: 6px; border: 1px solid var(--color-border); border-radius: 4px; white-space: pre-wrap; margin-top: 4px; box-sizing: border-box;">[System] AI Model Agent dialog initialized.</div>
      </div>
      `
    ],
    buttons: ['Run', 'Undo AI', 'Close'],
    singleButton: false,
    onButton(buttonIndex: number) {
      if (buttonIndex === 0) { // Run
        handleRunPrompt();
        return false; // Keep the dialog open
      } else if (buttonIndex === 1) { // Undo AI
        handleUndoAction();
        return false; // Keep the dialog open
      }
      
      // Close button
      activeDialog = null;
      return true; // Closes the dialog
    },
    onCancel() {
      activeDialog = null;
    }
  });

  activeDialog.show();
}

async function handleRunPrompt() {
  const promptInput = document.getElementById('dialog-ai-prompt') as HTMLTextAreaElement;
  const statusSpan = document.getElementById('dialog-ai-status');
  const logDiv = document.getElementById('dialog-ai-log');

  if (!promptInput || !promptInput.value.trim()) return;
  const prompt = promptInput.value.trim();

  // Clear prompt input box immediately
  promptInput.value = '';

  appendLog(logDiv, `[User] ${prompt}`);

  if (statusSpan) {
    statusSpan.textContent = 'Sending...';
    statusSpan.style.color = '#FFB300';
  }

  try {
    const context = readProjectContext();
    console.log('Sending project context to local backend:', context);

    const response = await fetch('http://127.0.0.1:3000/agent/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt,
        context: context
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const result = await response.json();
    console.log('Received response from local agent server:', result);

    if (result.success && Array.isArray(result.commands)) {
      if (statusSpan) {
        statusSpan.textContent = 'Applying...';
      }

      // Group all actions in one Undo transaction
      runInUndoTransaction('AI Agent Action', () => {
        applyCommands(result.commands);
      });

      if (statusSpan) {
        statusSpan.textContent = 'Success!';
        statusSpan.style.color = '#4CAF50';
      }
      appendLog(logDiv, `[Agent] Executed ${result.commands.length} commands successfully.`);
    } else {
      throw new Error(result.error || 'Server returned failure status.');
    }
  } catch (err: any) {
    console.error('Failed to communicate or apply agent response:', err);
    if (statusSpan) {
      statusSpan.textContent = 'Error';
      statusSpan.style.color = '#F44336';
    }
    appendLog(logDiv, `[Error] ${err.message || 'Check server connection'}`);
  }

  // Restore Idle state after timeout
  setTimeout(() => {
    const currentStatus = document.getElementById('dialog-ai-status');
    if (currentStatus && currentStatus.textContent !== 'Sending...' && currentStatus.textContent !== 'Applying...') {
      currentStatus.textContent = 'Idle';
      currentStatus.style.color = 'var(--color-accent)';
    }
  }, 2500);
}

function handleUndoAction() {
  const logDiv = document.getElementById('dialog-ai-log');
  const success = triggerUndo();
  if (success) {
    appendLog(logDiv, '[System] Reverted last AI action.');
  } else {
    appendLog(logDiv, '[System] Reverted action failed or no history to undo.');
  }
}

function appendLog(logDiv: HTMLElement | null, message: string) {
  if (logDiv) {
    const logDivItem = document.createElement('div');
    logDivItem.textContent = message;
    
    if (message.startsWith('[User]')) {
      logDivItem.style.color = 'var(--color-light)';
    } else if (message.startsWith('[Agent]')) {
      logDivItem.style.color = '#81C784';
    } else if (message.startsWith('[Error]')) {
      logDivItem.style.color = '#E57373';
    } else {
      logDivItem.style.color = 'var(--color-sub)';
    }
    
    logDiv.appendChild(logDivItem);
    logDiv.scrollTop = logDiv.scrollHeight;
  }
}
