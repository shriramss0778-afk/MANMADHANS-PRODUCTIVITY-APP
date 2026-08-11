import { authLoginSchema } from "@/lib/server/schemas";
import { prisma } from "@/lib/server/prisma";
import { ApiError } from "@/lib/server/errors";
import { corsPreflight, json, route } from "@/lib/server/api";
import { ensureDefaultAdmin, verifyPassword } from "@/lib/server/auth";
import { startSessionState } from "@/lib/server/bootstrap";

export { corsPreflight as OPTIONS };

export const POST = route(async ({ request }) => {
  await ensureDefaultAdmin();
  const body = authLoginSchema.parse(await request.json());
  const user = await prisma.user.findUnique({
    where: { email: body.email.toLowerCase() },
  });

  if (!user?.passwordHash || !(await verifyPassword(body.password, user.passwordHash))) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  return json(await startSessionState(user));
});
