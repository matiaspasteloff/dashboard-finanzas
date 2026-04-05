import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

// 2. Escuchamos en el puerto DINÁMICO y en todas las interfaces ('0.0.0.0')
app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 Servidor listo y escuchando en el puerto ${PORT}`);
});