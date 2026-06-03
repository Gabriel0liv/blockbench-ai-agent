import { AICommand, ProjectContext } from '@blockbench-ai-agent/shared';

/**
 * Mocks the AI Agent behavior by reading the user prompt and returning a structured
 * set of JSON commands to be executed on the Blockbench client.
 * Uses unique element and group names to avoid collisions.
 */
export function runMockAgent(prompt: string, context: ProjectContext): AICommand[] {
  const normalizedPrompt = prompt.toLowerCase();
  
  // Generate a short unique ID suffix using timestamp to avoid naming collisions
  const id = Date.now().toString().slice(-4);
  
  // Find selected group, if any, to use as parent
  const selectedGroup = context.selection?.selectedGroupNames?.[0];
  
  console.log(`Running mock agent for prompt: "${prompt}". Selected group in context: ${selectedGroup || 'None'}`);

  if (normalizedPrompt.includes('chifre') || normalizedPrompt.includes('horn')) {
    const hornsGroupName = `horns_group_${id}`;
    
    return [
      // 1. Create a container group for the horns under the selected parent
      {
        type: 'create_group',
        name: hornsGroupName,
        parent: selectedGroup
      },
      // 2. Left Horn
      {
        type: 'create_cube',
        name: `horn_left_${id}`,
        parent: hornsGroupName,
        from: [-3, 8, 2],
        to: [-1, 12, 4],
        rotation: [0, 0, 10],
        color: '2'
      },
      // 3. Right Horn
      {
        type: 'create_cube',
        name: `horn_right_${id}`,
        parent: hornsGroupName,
        from: [1, 8, 2],
        to: [3, 12, 4],
        rotation: [0, 0, -10],
        color: '2'
      }
    ];
  }
  
  if (normalizedPrompt.includes('grupo') || normalizedPrompt.includes('group')) {
    return [
      {
        type: 'create_group',
        name: `ai_new_group_${id}`,
        parent: selectedGroup
      }
    ];
  }

  // Default fallback: create a test block
  return [
    {
      type: 'create_cube',
      name: `ai_test_cube_${id}`,
      parent: selectedGroup,
      from: [-4, 0, -4],
      to: [4, 8, 4],
      color: '0'
    }
  ];
}
