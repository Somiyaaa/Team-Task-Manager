// import { PrismaClient } from '@prisma/client';
// ✅ New
import { PrismaClient } from "@prisma/client/edge";
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

export default prisma;
