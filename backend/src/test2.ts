import dotenv from 'dotenv';
dotenv.config();
import prisma from './db';

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log("Success:", users);
  } catch (e) {
    console.error("Error:", e);
  }
}
main();
