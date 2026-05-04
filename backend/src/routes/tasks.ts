import { Router } from 'express';
import { createTask, getTasks, updateTaskStatus, deleteTask } from '../controllers/tasks';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getTasks);
router.post('/', createTask);
router.patch('/:id/status', updateTaskStatus); // Members and Admin can update status
router.delete('/:id', deleteTask); // Ownership checked in controller

export default router;
