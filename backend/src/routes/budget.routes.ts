import { Router } from 'express';
import { upsertBudget, getMyBudgets, deleteBudget } from '../controllers/budget.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', verifyToken, getMyBudgets);
router.post('/', verifyToken, upsertBudget);
router.delete('/:id', verifyToken, deleteBudget);

export default router;