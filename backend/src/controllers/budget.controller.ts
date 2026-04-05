import { type Response } from 'express';
import { prisma } from '../prisma.js';
import { type AuthRequest } from '../middlewares/auth.middleware.js';

export const upsertBudget = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { categoryId, amount, month, year } = req.body;
        const userId = req.user?.userId;

        if (!userId) { res.status(401).json({ error: 'No autenticado' }); return; }
        if (!categoryId || !amount || month == null || year == null) {
            res.status(400).json({ error: 'categoryId, amount, month y year son requeridos' });
            return;
        }

        const budget = await prisma.budget.upsert({
            where: { userId_categoryId_month_year: { userId, categoryId, month: Number(month), year: Number(year) } },
            update: { amount: Number(amount) },
            create: { categoryId, amount: Number(amount), month: Number(month), year: Number(year), userId },
            include: { category: true },
        });

        res.status(200).json(budget);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al guardar el presupuesto' });
    }
};

export const getMyBudgets = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) { res.status(401).json({ error: 'No autenticado' }); return; }

        const { month, year } = req.query;
        const where: Record<string, unknown> = { userId };
        if (month != null) where['month'] = Number(month);
        if (year != null) where['year'] = Number(year);

        const budgets = await prisma.budget.findMany({
            where,
            include: { category: true },
            orderBy: { category: { name: 'asc' } },
        });

        res.status(200).json(budgets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener presupuestos' });
    }
};

export const deleteBudget = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        if (!userId) { res.status(401).json({ error: 'No autenticado' }); return; }

        const budget = await prisma.budget.findFirst({ where: { id, userId } });
        if (!budget) { res.status(404).json({ error: 'Presupuesto no encontrado' }); return; }

        await prisma.budget.delete({ where: { id } });
        res.status(200).json({ message: 'Presupuesto eliminado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el presupuesto' });
    }
};