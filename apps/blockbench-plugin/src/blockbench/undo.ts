/**
 * Safely wraps Blockbench modifications in a unified Undo edit transaction.
 * Isolates Blockbench global Undo API.
 */
export function runInUndoTransaction(actionName: string, runFn: () => void) {
  if (typeof Undo === 'undefined') {
    console.warn('Blockbench Undo API not found, executing action directly.');
    runFn();
    return;
  }

  try {
    // Initialize edit tracking for the outliner, selection, and cube geometries
    Undo.initEdit({
      outliner: true,
      elements: typeof Cube !== 'undefined' ? Cube.all : undefined,
      selection: true
    });
    
    runFn();
    
    // Commit the edit transaction to Blockbench's history stack
    Undo.finishEdit(actionName);
  } catch (err) {
    console.error('Error in Blockbench Undo transaction wrapper:', err);

    if (typeof Undo !== 'undefined' && typeof Undo.cancelEdit === 'function') {
      try {
        Undo.cancelEdit();
      } catch (cancelErr) {
        console.warn('Failed to cancel Blockbench Undo edit:', cancelErr);
      }
    }

    throw err;
  }
}

/**
 * Invokes native undo in Blockbench to revert the last action (such as the last AI run).
 */
export function triggerUndo() {
  if (typeof Undo !== 'undefined' && typeof Undo.undo === 'function') {
    try {
      Undo.undo();
      return true;
    } catch (err) {
      console.error('Error running native Blockbench Undo:', err);
    }
  }
  return false;
}
