import { z } from 'zod';
import {
  selectionContextSchema,
  groupInfoSchema,
  elementInfoSchema,
  projectContextSchema,
  runAgentRequestSchema
} from '../schemas/project.schema.js';

export type SelectionContext = z.infer<typeof selectionContextSchema>;
export type GroupInfo = z.infer<typeof groupInfoSchema>;
export type ElementInfo = z.infer<typeof elementInfoSchema>;
export type ProjectContext = z.infer<typeof projectContextSchema>;
export type RunAgentRequest = z.infer<typeof runAgentRequestSchema>;
