import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/server/auth";

const prisma = new PrismaClient();

async function main() {
  const email = "shriramss0778@gmail.com";
  const passwordHash = await hashPassword("Welcome@123");

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: {
        name: "Super Admin",
        role: "SUPER_ADMIN" as never,
        isActive: true as never,
        googleLoginEnabled: true as never,
        passwordHash,
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

  await prisma.user.create({
    data: {
      email,
      name: "Super Admin",
      role: "SUPER_ADMIN" as never,
      isActive: true as never,
      googleLoginEnabled: true as never,
      passwordHash,
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
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
