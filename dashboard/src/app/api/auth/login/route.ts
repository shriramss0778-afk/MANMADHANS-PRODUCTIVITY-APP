import { authLoginSchema } from "@/lib/server/schemas";
import { prisma } from "@/lib/server/prisma";
import { ApiError } from "@/lib/server/errors";
import { json, handleRouteError, optionsResponse } from "@/lib/server/api";
import { ensureDefaultAdmin, persistSession, verifyPassword } from "@/lib/server/auth";
import { clientIdentifier, consumeRateLimit, resetRateLimit } from "@/lib/server/rate-limit";
import { getBootstrapState } from "@/lib/server/bootstrap";

const LOGIN_ATTEMPT_LIMIT = 10;
const LOGIN_WINDOW_MS = 10 * 60 * 1000;

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: Request) {
  try {
    const rateLimitKey = `login:${await clientIdentifier()}`;
    consumeRateLimit(rateLimitKey, LOGIN_ATTEMPT_LIMIT, LOGIN_WINDOW_MS);

    await ensureDefaultAdmin();
    const body = authLoginSchema.parse(await request.json());
    const user = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
    });

    if (!user?.passwordHash || !(await verifyPassword(body.password, user.passwordHash))) {
      throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }

    if (!user.isActive) {
      throw new ApiError(403, "ACCOUNT_DISABLED", "This account has been deactivated");
    }

    resetRateLimit(rateLimitKey);
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
