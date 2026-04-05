import express, { type Request, type Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js'; // <-- 1. Importamos nuestras rutas

const app = express();

app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ message: '¡El servidor está vivo!' });
});

app.use('/api/auth', authRoutes);

export default app;