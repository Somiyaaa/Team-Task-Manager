import prisma from './db';

async function main() {
  try {
    const projects = await prisma.project.findMany();
    console.log("Database connection successful!", projects);
  } catch (error) {
    console.error("Database error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
