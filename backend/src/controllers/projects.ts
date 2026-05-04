import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../db';

const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
});

export const createProject = async (req: Request, res: Response) => {
  try {
    const { name, description } = createProjectSchema.parse(req.body);
    const userId = (req as any).user.id;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        createdById: userId,
        members: {
          connect: { id: userId }
        }
      },
    });

    res.status(201).json(project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProjects = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: { id: userId }
        }
      },
      include: {
        _count: {
          select: { tasks: true, members: true }
        }
      }
    });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const userId = (req as any).user.id;

    const project = await prisma.project.findFirst({
      where: {
        id,
        members: {
          some: { id: userId }
        }
      },
      include: {
        members: {
          select: { id: true, name: true, email: true, role: true }
        },
        tasks: true,
        createdBy: {
          select: { id: true, name: true }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addMember = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { userId } = req.body as { userId: string };
    const currentUserId = (req as any).user.id;
    const currentUserRole = (req as any).user.role;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (currentUserRole !== 'ADMIN' && project.createdById !== currentUserId) {
      return res.status(403).json({ error: 'Only admins or project creators can add members' });
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        members: {
          connect: { id: userId }
        }
      },
      include: {
        members: { select: { id: true, name: true, email: true } }
      }
    });

    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const currentUserId = (req as any).user.id;
    const currentUserRole = (req as any).user.role;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (currentUserRole !== 'ADMIN' && project.createdById !== currentUserId) {
      return res.status(403).json({ error: 'Only admins or project creators can delete projects' });
    }

    await prisma.project.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};