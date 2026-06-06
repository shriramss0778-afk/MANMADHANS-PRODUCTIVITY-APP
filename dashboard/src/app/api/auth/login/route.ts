import { authLoginSchema } from "@/lib/server/schemas";
import { prisma } from "@/lib/server/prisma";
import { ApiError } from "@/lib/server/errors";
import { json, handleRouteError, optionsResponse } from "@/lib/server/api";
import { ensureDefaultAdmin, persistSession, verifyPassword } from "@/lib/server/auth";
import { getBootstrapState } from "@/lib/server/bootstrap";

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: Request) {
  try {
    await ensureDefaultAdmin();
    const body = authLoginSchema.parse(await request.json());
    const user = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
    });

    if (!user?.passwordHash || !(await verifyPassword(body.password, user.passwordHash))) {
      throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }

    const { accessToken } = await persistSession(user);
    const state = await getBootstrapState(user.id);

    return json({
      accessToken,
      ...state,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
