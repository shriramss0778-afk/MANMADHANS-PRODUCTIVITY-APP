import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    throw new Error("Usage: tsx scripts/disable-user-google-access.ts <email>");
  }

  const result = await prisma.user.updateMany({
    where: { email },
    data: {
      isActive: false as never,
      googleLoginEnabled: false as never,
    },
  });

  console.log(`Disabled access for ${result.count} user(s) matching ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
