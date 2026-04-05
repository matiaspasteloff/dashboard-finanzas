import { type Response } from 'express';
import { prisma } from '../prisma.js';
import { type AuthRequest } from '../middlewares/auth.middleware.js';

// CREAR UNA CATEGORÍA
export const createCategory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, type } = req.body;
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({ error: 'Usuario no autenticado' });
            return;
        }

        const newCategory = await prisma.category.create({
            data: {
                name,
                type,
                userId
            }
        });

        res.status(201).json(newCategory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear la categoría' });
    }
};

// OBTENER MIS CATEGORÍAS
export const getMyCategories = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({ error: 'Usuario no autenticado' });
            return;
        }

        const categories = await prisma.category.findMany({
            where: { userId: userId }
        });

        res.status(200).json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener categorías' });
    }
};