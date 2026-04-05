import { Router } from 'express';
import { createCategory, getMyCategories } from '../controllers/category.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Protegemos las rutas con el verifyToken
router.post('/', verifyToken, createCategory);
router.get('/', verifyToken, getMyCategories);

export default router;