import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';


export interface AuthRequest extends Request {
    user?: { userId: string; email: string };
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {

    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Acceso denegado. No hay token provisto.' });
        return;
    }


    const token = authHeader.split(' ')[1] as string;

    try {

        const secret = process.env.JWT_SECRET as string;
        const decoded = jwt.verify(token, secret) as unknown as { userId: string; email: string };


        req.user = decoded;


        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido o expirado.' });
    }
};