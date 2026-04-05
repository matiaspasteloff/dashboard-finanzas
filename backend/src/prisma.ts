import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';


const connectionString = process.env.DATABASE_URL;


if (!connectionString) {
    throw new Error("⚠️ ERROR FATAL: DATABASE_URL no está definida. Revisa tu archivo .env");
}


const pool = new Pool({ connectionString });


const adapter = new PrismaPg(pool);


export const prisma = new PrismaClient({ adapter });