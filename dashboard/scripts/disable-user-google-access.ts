import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(
    'UPDATE "User" SET "isActive" = false, "googleLoginEnabled" = false, "updatedAt" = NOW() WHERE email = $1',
    "hemanthmm1107@gmail.com",
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
