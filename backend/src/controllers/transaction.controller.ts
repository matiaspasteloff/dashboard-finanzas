import { type Response } from 'express';
import { prisma } from '../prisma.js';
import { type AuthRequest } from '../middlewares/auth.middleware.js';

export const createTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { amount, description, categoryId } = req.body;
        const userId = req.user?.userId; 

        if (!userId) {
            res.status(401).json({ error: 'Usuario no autenticado' });
            return;
        }

        const newTransaction = await prisma.transaction.create({
            data: {
                amount: parseFloat(amount),
                description,
                categoryId, 
                userId
            }
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

        if (!userId) {
            res.status(401).json({ error: 'Usuario no autenticado' });
            return;
        }

        // Buscamos solo las transacciones de este usuario específico
        const transactions = await prisma.transaction.findMany({
            where: { userId: userId },
            orderBy: { date: 'desc' } 
        });

        res.status(200).json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener transacciones' });
    }
};

export const deleteTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params; // El ID de la transacción viene en la URL
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({ error: 'Usuario no autenticado' });
            return;
        }

        // Primero verificamos que la transacción exista Y pertenezca al usuario que la quiere borrar
        const transaction = await prisma.transaction.findFirst({
            where: { id: id, userId: userId }
        });

        if (!transaction) {
            res.status(404).json({ error: 'Transacción no encontrada o no te pertenece' });
            return;
        }

        await prisma.transaction.delete({
            where: { id: id }
        });

        res.status(200).json({ message: 'Transacción eliminada exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar la transacción' });
    }
};