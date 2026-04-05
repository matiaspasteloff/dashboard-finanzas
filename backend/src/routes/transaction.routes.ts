import { Router } from 'express';
import { createTransaction, getMyTransactions, deleteTransaction } from '../controllers/transaction.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();


router.post('/', verifyToken, createTransaction);
router.get('/', verifyToken, getMyTransactions);
router.delete('/:id', verifyToken, deleteTransaction);

export default router;