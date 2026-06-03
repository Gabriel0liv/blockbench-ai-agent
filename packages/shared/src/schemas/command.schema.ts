import { z } from 'zod';

export const createCubeSchema = z.object({
  type: z.literal('create_cube'),
  name: z.string().min(1).max(64),
  parent: z.string().optional(),
  from: z.tuple([z.number(), z.number(), z.number()]),
  to: z.tuple([z.number(), z.number(), z.number()]),
  rotation: z.tuple([z.number(), z.number(), z.number()]).optional(),
  color: z.string().optional()
}).strict();

export const createGroupSchema = z.object({
  type: z.literal('create_group'),
  name: z.string().min(1).max(64),
  parent: z.string().optional()
}).strict();

export const moveToGroupSchema = z.object({
  type: z.literal('move_to_group'),
  elementName: z.string().min(1).max(64),
  parent: z.string().min(1).max(64)
}).strict();

export const setFaceColorSchema = z.object({
  type: z.literal('set_face_color'),
  elementName: z.string().min(1).max(64),
  face: z.enum(['north', 'south', 'east', 'west', 'up', 'down']),
  color: z.string().min(1)
}).strict();

export const aiCommandBaseSchema = z.discriminatedUnion('type', [
  createCubeSchema,
  createGroupSchema,
  moveToGroupSchema,
  setFaceColorSchema
]);

export const aiCommandSchema = aiCommandBaseSchema.superRefine((data, ctx) => {
  if (data.type === 'create_cube') {
    const [fx, fy, fz] = data.from;
    const [tx, ty, tz] = data.to;
    
    // from must be less than to in the relevant axes
    const axesCheck = fx < tx && fy < ty && fz < tz;
    if (!axesCheck) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid coordinates: "from" must be less than "to"'
      });
      return;
    }
    
    // cubes cannot have zero size
    const sizeX = tx - fx;
    const sizeY = ty - fy;
    const sizeZ = tz - fz;
    if (sizeX <= 0 || sizeY <= 0 || sizeZ <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Cubes cannot have zero volume / size'
      });
      return;
    }
    
    // limit maximum initial size of cubes to avoid broken models (max 32 units)
    const maxSize = 32;
    if (sizeX > maxSize || sizeY > maxSize || sizeZ > maxSize) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Cube dimensions must not exceed 32 units on any axis.'
      });
      return;
    }
  }
});

export const aiCommandListSchema = z.array(aiCommandSchema);
