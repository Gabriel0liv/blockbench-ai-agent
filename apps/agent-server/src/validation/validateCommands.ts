import { aiCommandListSchema, AICommandList } from '@blockbench-ai-agent/shared';

/**
 * Validates a list of commands against the shared Zod schema.
 * Throws an error if validation fails.
 */
export function validateCommands(commands: unknown): AICommandList {
  const result = aiCommandListSchema.safeParse(commands);
  if (!result.success) {
    console.error('Command validation failed:', result.error.format());
    throw new Error(`Command validation failed: ${JSON.stringify(result.error.format())}`);
  }
  return result.data;
}
