import { z } from 'zod';
import {
  createCubeSchema,
  createGroupSchema,
  moveToGroupSchema,
  setFaceColorSchema,
  aiCommandSchema,
  aiCommandListSchema
} from '../schemas/command.schema.js';

export type CreateCubeCommand = z.infer<typeof createCubeSchema>;
export type CreateGroupCommand = z.infer<typeof createGroupSchema>;
export type MoveToGroupCommand = z.infer<typeof moveToGroupSchema>;
export type SetFaceColorCommand = z.infer<typeof setFaceColorSchema>;
export type AICommand = z.infer<typeof aiCommandSchema>;
export type AICommandList = z.infer<typeof aiCommandListSchema>;
