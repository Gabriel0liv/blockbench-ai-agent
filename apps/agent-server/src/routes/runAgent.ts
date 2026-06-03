import { FastifyInstance } from 'fastify';
import { runAgentRequestSchema } from '@blockbench-ai-agent/shared';
import { runMockAgent } from '../agent/mockAgent.js';
import { validateCommands } from '../validation/validateCommands.js';

/**
 * Registers the agent execution routes.
 */
export async function runAgentRoutes(fastify: FastifyInstance) {
  fastify.post('/agent/run', async (request, reply) => {
    console.log('Received /agent/run request');
    
    // Validate request body using Zod schema
    const parseResult = runAgentRequestSchema.safeParse(request.body);
    if (!parseResult.success) {
      console.warn('Request body validation failed:', parseResult.error.format());
      return reply.status(400).send({
        success: false,
        error: 'Invalid request body',
        details: parseResult.error.format()
      });
    }

    const { prompt, context } = parseResult.data;

    try {
      // Execute mock agent
      const commands = runMockAgent(prompt, context);

      // Validate outgoing commands
      const validatedCommands = validateCommands(commands);

      return {
        success: true,
        commands: validatedCommands
      };
    } catch (err: any) {
      console.error('Error running agent route:', err);
      return reply.status(500).send({
        success: false,
        error: err.message || 'Internal server error running agent'
      });
    }
  });
}
