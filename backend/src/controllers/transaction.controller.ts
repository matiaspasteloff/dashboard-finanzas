import { type Response } from 'express';
import { prisma } from '../prisma.js';
import { type AuthRequest } from '../middlewares/auth.middleware.js';

export const createTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { amount, description, categoryId, isRecurring, recurrenceFrequency } = req.body;
        const userId = req.user?.userId;

        if (!userId) { res.status(401).json({ error: 'Usuario no autenticado' }); return; }

        const newTransaction = await prisma.transaction.create({
            data: {
                amount: parseFloat(amount),
                description,
                categoryId,
                userId,
                isRecurring: Boolean(isRecurring),
                recurrenceFrequency: isRecurring ? (recurrenceFrequency ?? null) : null,
            },
        });

        res.status(201).json(newTransaction);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear la transacción' });
    }
};

export const getMyTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) { res.status(401).json({ error: 'Usuario no autenticado' }); return; }

        const { page, limit = '20', month, year, startDate, endDate, categoryId, search, type } = req.query;

        // Build where clause
        const where: Record<string, unknown> = { userId };

        if (categoryId) where['categoryId'] = categoryId as string;

        if (type === 'INCOME' || type === 'EXPENSE') {
            where['category'] = { type };
        }

        if (search) {
            where['description'] = { contains: search as string, mode: 'insensitive' };
        }

        const dateFilter: Record<string, Date> = {};
        if (month != null && year != null) {
            const m = Number(month);
            const y = Number(year);
            dateFilter['gte'] = new Date(y, m - 1, 1);
            dateFilter['lte'] = new Date(y, m, 0, 23, 59, 59, 999);
        } else {
            if (startDate) dateFilter['gte'] = new Date(startDate as string);
            if (endDate) {
                const end = new Date(endDate as string);
                end.setHours(23, 59, 59, 999);
                dateFilter['lte'] = end;
            }
        }
        if (Object.keys(dateFilter).length > 0) where['date'] = dateFilter;

        // Paginated response
        if (page != null) {
            const pageNum = Math.max(1, Number(page));
            const limitNum = Math.min(100, Math.max(1, Number(limit)));
            const skip = (pageNum - 1) * limitNum;

            const [transactions, total] = await Promise.all([
                prisma.transaction.findMany({ where, orderBy: { date: 'desc' }, skip, take: limitNum }),
                prisma.transaction.count({ where }),
            ]);

            res.status(200).json({
                data: transactions,
                pagination: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    totalPages: Math.ceil(total / limitNum),
                    hasNext: pageNum < Math.ceil(total / limitNum),
                    hasPrev: pageNum > 1,
                },
            });
            return;
        }

        // Non-paginated (dashboard, budgets page)
        const transactions = await prisma.transaction.findMany({
            where,
            orderBy: { date: 'desc' },
        });
        res.status(200).json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener transacciones' });
    }
};

export const deleteTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        if (!userId) { res.status(401).json({ error: 'Usuario no autenticado' }); return; }

        const transaction = await prisma.transaction.findFirst({where: {id: id as string, userId}});
        if (!transaction) { res.status(404).json({ error: 'Transacción no encontrada o no te pertenece' }); return; }

        await prisma.transaction.delete({ where: { id: id as string } });
        res.status(200).json({ message: 'Transacción eliminada exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar la transacción' });
    }
};