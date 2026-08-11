import { PrismaClient } from "@prisma/client";
import { generateTemporaryPassword, hashPassword } from "../src/lib/server/auth";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    throw new Error("Usage: tsx scripts/authorize-google-user.ts <email>");
  }

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: {
        role: "SUPER_ADMIN" as never,
        isActive: true as never,
        googleLoginEnabled: true as never,
        timerSettings: {
          upsert: {
            create: {
              focus: 25,
              short: 5,
              long: 15,
            },
            update: {},
          },
        },
      },
    });
    console.log(`Authorized existing user: ${email}`);
    return;
  }

  const temporaryPassword = generateTemporaryPassword();
  await prisma.user.create({
    data: {
      email,
      name: "Super Admin",
      role: "SUPER_ADMIN" as never,
      isActive: true as never,
      googleLoginEnabled: true as never,
      passwordChangeRequired: true as never,
      passwordHash: await hashPassword(temporaryPassword),
      timerSettings: {
        create: {
          focus: 25,
          short: 5,
          long: 15,
        },
      },
    },
  });

  console.log(`Created and authorized user: ${email}`);
  console.log(`Temporary password (shown once): ${temporaryPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
