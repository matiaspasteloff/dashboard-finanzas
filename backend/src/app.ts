import express, { type Request, type Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import transactionRoutes from './routes/transaction.routes.js';
import categoryRoutes from './routes/category.routes.js'; // <-- 1. Importamos la ruta

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ message: '¡El servidor está vivo! 🚀' });
});

// 2. Conectamos todas las rutas
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes); // <-- 3. Activamos la ruta

export default app;