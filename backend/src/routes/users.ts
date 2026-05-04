import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import { getAllUsers } from '../controllers/users';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get('/', getAllUsers);

export default router;
