import { readProjectContext } from '../blockbench/readProject.js';
import { applyCommands } from '../blockbench/applyCommands.js';
import { runInUndoTransaction, triggerUndo } from '../blockbench/undo.js';

let clickListener: ((event: MouseEvent) => void) | null = null;

/**
 * Creates the sidebar chat panel for the AI Model Agent.
 */
export function createChatPanel() {
  if (typeof Panel === 'undefined') {
    console.warn('Panel constructor is not defined in Blockbench.');
    return null;
  }

  const panel = new Panel('ai_model_agent', {
    title: 'AI Model Agent',
    icon: 'smart_toy',
    growable: true,
    template: `
      <div style="display: flex; flex-direction: column; height: 100%; padding: 8px; gap: 8px; box-sizing: border-box;">
        <div id="ai-chat-history" style="flex: 1; min-height: 150px; border: 1px solid var(--color-border); background-color: var(--color-back); overflow-y: auto; padding: 6px; font-size: 13px; font-family: monospace; white-space: pre-wrap; display: flex; flex-direction: column; gap: 4px;">
          <div style="color: var(--color-sub); font-style: italic;">[System] Panel loaded. Server: http://127.0.0.1:3000</div>
        </div>
        
        <div style="font-size: 12px; display: flex; justify-content: space-between;">
          <span><strong>Status:</strong> <span id="ai-agent-status" style="color: var(--color-accent); font-weight: bold;">Idle</span></span>
        </div>
        
        <textarea id="ai-prompt-input" placeholder="Ex: cria dois chifres pequenos no grupo selecionado" style="width: 100%; height: 60px; box-sizing: border-box; background: var(--color-input); color: var(--color-text); border: 1px solid var(--color-border); border-radius: 4px; padding: 6px; resize: none; font-size: 13px; font-family: sans-serif;"></textarea>
        
        <div style="display: flex; gap: 8px;">
          <button id="ai-send-btn" class="button" style="flex: 2; height: 32px; font-weight: bold; background: var(--color-accent); color: var(--color-accent_text); cursor: pointer; border: none; border-radius: 4px;">Send Prompt</button>
          <button id="ai-undo-btn" class="button" style="flex: 1; height: 32px; background: var(--color-button); color: var(--color-text); cursor: pointer; border: none; border-radius: 4px;">Undo AI</button>
        </div>
      </div>
    `
  });

  return panel;
}

/**
 * Attaches DOM click listeners to the document for the chat actions.
 * Deferring selection via document delegation ensures buttons are found when panel mounts.
 */
export function registerPanelEvents() {
  if (clickListener) return;

  clickListener = async (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target) return;

    if (target.id === 'ai-send-btn') {
      await handleSendPrompt();
    } else if (target.id === 'ai-undo-btn') {
      handleUndoAction();
    }
  };

  document.addEventListener('click', clickListener);
}

/**
 * Removes DOM event listener on plugin unloads.
 */
export function unregisterPanelEvents() {
  if (clickListener) {
    document.removeEventListener('click', clickListener);
    clickListener = null;
  }
}

async function handleSendPrompt() {
  const promptInput = document.getElementById('ai-prompt-input') as HTMLTextAreaElement;
  const statusSpan = document.getElementById('ai-agent-status');

  if (!promptInput || !promptInput.value.trim()) return;
  const prompt = promptInput.value.trim();

  // Clear prompt input box immediately
  promptInput.value = '';

  appendLog(`[User] ${prompt}`);

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
      appendLog(`[Agent] Executed ${result.commands.length} commands successfully.`);
    } else {
      throw new Error(result.error || 'Server returned failure status.');
    }
  } catch (err: any) {
    console.error('Failed to communicate or apply agent response:', err);
    if (statusSpan) {
      statusSpan.textContent = 'Error';
      statusSpan.style.color = '#F44336';
    }
    appendLog(`[Error] ${err.message || 'Check server connection'}`);
  }

  // Restore Idle state after timeout
  setTimeout(() => {
    const currentStatus = document.getElementById('ai-agent-status');
    if (currentStatus && currentStatus.textContent !== 'Sending...' && currentStatus.textContent !== 'Applying...') {
      currentStatus.textContent = 'Idle';
      currentStatus.style.color = 'var(--color-accent)';
    }
  }, 2500);
}

function handleUndoAction() {
  const success = triggerUndo();
  if (success) {
    appendLog('[System] Reverted last AI action.');
  } else {
    appendLog('[System] Reverted action failed or no history to undo.');
  }
}

function appendLog(message: string) {
  const chatHistory = document.getElementById('ai-chat-history');
  if (chatHistory) {
    const logDiv = document.createElement('div');
    logDiv.textContent = message;
    
    if (message.startsWith('[User]')) {
      logDiv.style.color = 'var(--color-light)';
    } else if (message.startsWith('[Agent]')) {
      logDiv.style.color = '#81C784';
    } else if (message.startsWith('[Error]')) {
      logDiv.style.color = '#E57373';
    } else {
      logDiv.style.color = 'var(--color-sub)';
    }
    
    chatHistory.appendChild(logDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }
}
