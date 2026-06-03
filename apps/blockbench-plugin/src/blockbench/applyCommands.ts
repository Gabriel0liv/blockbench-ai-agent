import { AICommand } from '@blockbench-ai-agent/shared';

/**
 * Gets or creates the fallback group 'ai_generated' under the root.
 */
function getOrCreateFallbackGroup(): any {
  if (typeof Group === 'undefined' || !Array.isArray(Group.all)) {
    return undefined;
  }
  
  let fallback = Group.all.find((g: any) => g.name === 'ai_generated');
  if (!fallback) {
    fallback = new Group({ name: 'ai_generated' });
    fallback.addTo();
    if (typeof fallback.init === 'function') {
      fallback.init();
    }
  }
  return fallback;
}

/**
 * Executes a list of AI commands on the current Blockbench project.
 * Uses isolated global Canvas, Group, Cube, and other APIs.
 */
export function applyCommands(commands: AICommand[]) {
  const alteredElements: any[] = [];

  try {
    for (const cmd of commands) {
      console.log(`Executing command:`, cmd);

      if (cmd.type === 'create_group') {
        if (typeof Group === 'undefined') {
          console.warn('Group constructor is not defined in Blockbench.');
          continue;
        }
        
        let parentGroup: any = undefined;
        if (cmd.parent) {
          if (Array.isArray(Group.all)) {
            parentGroup = Group.all.find((g: any) => g.name === cmd.parent);
          }
          if (!parentGroup) {
            throw new Error(`Parent group "${cmd.parent}" specified for group "${cmd.name}" but not found in the project.`);
          }
        } else {
          // Commands without parent use the fallback group 'ai_generated'
          parentGroup = getOrCreateFallbackGroup();
        }
        
        const group = new Group({ name: cmd.name });
        group.addTo(parentGroup);
        
        if (typeof group.init === 'function') {
          group.init();
        }
        
        alteredElements.push(group);
      }
      
      else if (cmd.type === 'create_cube') {
        if (typeof Cube === 'undefined') {
          console.warn('Cube constructor is not defined in Blockbench.');
          continue;
        }
        
        let parentGroup: any = undefined;
        if (cmd.parent) {
          if (typeof Group !== 'undefined' && Array.isArray(Group.all)) {
            parentGroup = Group.all.find((g: any) => g.name === cmd.parent);
          }
          if (!parentGroup) {
            throw new Error(`Parent group "${cmd.parent}" specified for cube "${cmd.name}" but not found in the project.`);
          }
        } else {
          // Commands without parent use the fallback group 'ai_generated'
          parentGroup = getOrCreateFallbackGroup();
        }

        const cubeData: any = {
          name: cmd.name,
          from: cmd.from,
          to: cmd.to,
          color: cmd.color || '0'
        };
        
        if (cmd.rotation) {
          cubeData.rotation = cmd.rotation;
        }
        
        const cube = new Cube(cubeData);
        cube.addTo(parentGroup);
        
        if (typeof cube.init === 'function') {
          cube.init();
        }
        
        alteredElements.push(cube);
      }
      
      else if (cmd.type === 'move_to_group') {
        if (typeof Group === 'undefined' || !Array.isArray(Group.all)) {
          console.warn('Group API is not available.');
          continue;
        }
        
        const parentGroup = Group.all.find((g: any) => g.name === cmd.parent);
        if (!parentGroup) {
          throw new Error(`Parent group "${cmd.parent}" specified for move_to_group but not found in the project.`);
        }
        
        let targetElement: any = undefined;
        
        // Find in cubes first
        if (typeof Cube !== 'undefined' && Array.isArray(Cube.all)) {
          targetElement = Cube.all.find((c: any) => c.name === cmd.elementName);
        }
        
        // Find in groups if not found in cubes
        if (!targetElement) {
          targetElement = Group.all.find((g: any) => g.name === cmd.elementName);
        }
        
        if (targetElement) {
          targetElement.addTo(parentGroup);
          alteredElements.push(targetElement);
        } else {
          console.warn(`Target element "${cmd.elementName}" not found to move.`);
        }
      }
      
      else if (cmd.type === 'set_face_color') {
        if (typeof Cube !== 'undefined' && Array.isArray(Cube.all)) {
          const cube = Cube.all.find((c: any) => c.name === cmd.elementName);
          if (cube) {
            console.log(`Setting color index for face "${cmd.face}" on cube "${cmd.elementName}" (non-blocking placeholder)`);
            // Adding to list of altered elements to trigger view updates
            alteredElements.push(cube);
          } else {
            console.warn(`Cube "${cmd.elementName}" not found for set_face_color.`);
          }
        }
      }
    }

    // Refresh viewport
    if (typeof Canvas !== 'undefined') {
      if (alteredElements.length > 0 && typeof Canvas.updateView === 'function') {
        console.log(`Updating viewport view for ${alteredElements.length} items.`);
        try {
          Canvas.updateView({
            elements: alteredElements,
            element_aspects: { geometry: true },
            selection: true
          });
        } catch (viewErr) {
          console.warn('Canvas.updateView failed, falling back to Canvas.updateAll:', viewErr);
          if (typeof Canvas.updateAll === 'function') {
            Canvas.updateAll();
          }
        }
      } else if (typeof Canvas.updateAll === 'function') {
        console.log('Calling Canvas.updateAll() fallback.');
        Canvas.updateAll();
      }
    }
  } catch (err) {
    console.error('Critical error applying commands to Blockbench:', err);
    if (typeof Canvas !== 'undefined' && typeof Canvas.updateAll === 'function') {
      Canvas.updateAll();
    }
    // Re-throw to propagate the error back to the UI panel status
    throw err;
  }
}
