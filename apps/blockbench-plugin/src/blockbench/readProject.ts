import { getSelectionContext } from './selection.js';

/**
 * Safely aggregates the current model's project context to send to the server.
 * Isolates Blockbench global APIs like Project, Group, and Cube.
 */
export function readProjectContext() {
  const groups: { name: string; parent?: string }[] = [];
  const elements: { name: string; type: 'cube' | 'locator'; parent?: string }[] = [];
  let modelType = 'unknown';

  try {
    // Get model format
    if (typeof Project !== 'undefined' && Project && Project.format) {
      modelType = Project.format.id || Project.format.name || 'unknown';
    }

    // Read all groups currently instantiated in Blockbench
    if (typeof Group !== 'undefined' && Array.isArray(Group.all)) {
      for (const group of Group.all) {
        if (!group) continue;
        
        // Find parent group name if it exists and is not root
        const parentName = (group.parent && group.parent !== 'root' && typeof group.parent === 'object') 
          ? group.parent.name 
          : undefined;
          
        groups.push({
          name: group.name,
          parent: parentName
        });
      }
    }

    // Read all cubes currently instantiated in Blockbench
    if (typeof Cube !== 'undefined' && Array.isArray(Cube.all)) {
      for (const cube of Cube.all) {
        if (!cube) continue;
        
        const parentName = (cube.parent && cube.parent !== 'root' && typeof cube.parent === 'object')
          ? cube.parent.name
          : undefined;
          
        elements.push({
          name: cube.name,
          type: 'cube',
          parent: parentName
        });
      }
    }
  } catch (err) {
    console.error('Error compiling Blockbench project context:', err);
  }

  return {
    modelType,
    groups,
    elements,
    selection: getSelectionContext()
  };
}
