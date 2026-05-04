import { Router } from 'express';
import { createProject, getProjects, getProjectById, addMember, deleteProject } from '../controllers/projects';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getProjects);
router.post('/', createProject);
router.get('/:id', getProjectById);
router.post('/:id/members', addMember); // Ownership checked in controller
router.delete('/:id', deleteProject); // Ownership checked in controller

export default router;
