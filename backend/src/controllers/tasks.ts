import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../db';

const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  projectId: z.string().uuid(),
  assignedToId: z.string().uuid().optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
  dueDate: z.string().optional().or(z.literal('')).transform(val => val === '' ? undefined : (val ? new Date(val) : undefined)),
});

const updateTaskStatusSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']),
});

export const createTask = async (req: Request, res: Response) => {
  try {
    const data = createTaskSchema.parse(req.body);

    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
      include: { members: true }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        projectId: data.projectId,
        assignedToId: data.assignedToId,
        dueDate: data.dueDate,
      },
    });

    res.status(201).json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.issues);
      return res.status(400).json({ error: error.issues });
    }
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTasks = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { projectId } = req.query;

    const tasks = await prisma.task.findMany({
      where: {
        ...(projectId ? { projectId: projectId as string } : {}),
        OR: [
          { project: { members: { some: { id: userId } } } },
          { assignedToId: userId }
        ]
      },
      include: {
        project: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTaskStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = updateTaskStatusSchema.parse(req.body);

    const task = await prisma.task.update({
      where: { id },
      data: { status },
    });

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUserId = (req as any).user.id;
    const currentUserRole = (req as any).user.role;

    const task = await prisma.task.findUnique({
      where: { id },
      include: { project: true }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (currentUserRole !== 'ADMIN' && task.project.createdById !== currentUserId) {
      return res.status(403).json({ error: 'Only admins or project creators can delete tasks' });
    }

    await prisma.task.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
