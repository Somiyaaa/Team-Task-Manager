import dotenv from 'dotenv';
dotenv.config();
import prisma from './db';

async function checkData() {
  const users = await prisma.user.findMany();
  const projects = await prisma.project.findMany({ include: { members: true } });
  console.log("Users:", JSON.stringify(users, null, 2));
  console.log("Projects:", JSON.stringify(projects, null, 2));
}
checkData();
