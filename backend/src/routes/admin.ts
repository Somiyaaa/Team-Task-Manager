import { Router, Request, Response } from 'express';
import prisma from '../db';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

export const getSystemProjects = async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        createdBy: {
          select: { name: true, email: true }
        },
        members: {
          select: { id: true }
        },
        tasks: {
          select: { id: true, status: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const enrichedProjects = projects.map(p => {
      const totalTasks = p.tasks.length;
      const completedTasks = p.tasks.filter(t => t.status === 'DONE').length;
      return {
        id: p.id,
        name: p.name,
        description: p.description,
        createdAt: p.createdAt,
        createdBy: p.createdBy.name,
        memberCount: p.members.length,
        totalTasks,
        completedTasks,
        progress: totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)
      };
    });

    res.json(enrichedProjects);
  } catch (error) {
    console.error('Admin projects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSystemStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalProjects = await prisma.project.count();
    const totalTasks = await prisma.task.count();
    const completedTasks = await prisma.task.count({ where: { status: 'DONE' } });

    res.json({
      totalUsers,
      totalProjects,
      totalTasks,
      completedTasks
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

router.get('/projects', getSystemProjects);
router.get('/stats', getSystemStats);

export default router;
