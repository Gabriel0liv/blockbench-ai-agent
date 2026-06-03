/**
 * Safely accesses the current selection from Blockbench and isolates the global API.
 */
export function getSelectionContext() {
  const selectedGroupNames: string[] = [];
  const selectedElementNames: string[] = [];

  try {
    // Blockbench global array of selected elements (Outliner elements and groups)
    if (typeof selected !== 'undefined' && Array.isArray(selected)) {
      for (const item of selected) {
        if (!item) continue;
        
        // In Blockbench, a Group has type === 'group' or is an instance of Group
        if (item.type === 'group' || (typeof Group !== 'undefined' && item instanceof Group)) {
          selectedGroupNames.push(item.name);
        } else {
          selectedElementNames.push(item.name);
        }
      }
    }

    // Fallback: If no group was found in 'selected', check the active selected group global
    if (selectedGroupNames.length === 0 && typeof Group !== 'undefined' && Group.selected) {
      selectedGroupNames.push(Group.selected.name);
    }
  } catch (err) {
    console.error('Error reading Blockbench selection context:', err);
  }

  return {
    selectedGroupNames,
    selectedElementNames
  };
}
