import { z } from 'zod';

export const selectionContextSchema = z.object({
  selectedGroupNames: z.array(z.string()),
  selectedElementNames: z.array(z.string())
}).strict();

export const groupInfoSchema = z.object({
  name: z.string(),
  parent: z.string().optional()
}).strict();

export const elementInfoSchema = z.object({
  name: z.string(),
  type: z.enum(['cube', 'locator']),
  parent: z.string().optional()
}).strict();

export const projectContextSchema = z.object({
  modelType: z.string().optional(),
  groups: z.array(groupInfoSchema),
  elements: z.array(elementInfoSchema),
  selection: selectionContextSchema
}).strict();

export const runAgentRequestSchema = z.object({
  prompt: z.string().min(1),
  context: projectContextSchema
}).strict();
