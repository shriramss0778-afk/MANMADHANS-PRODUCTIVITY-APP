import { prisma } from "@/lib/server/prisma";
import { ApiError } from "@/lib/server/errors";
import { getBootstrapState } from "@/lib/server/bootstrap";
import { handleRouteError, json, optionsResponse } from "@/lib/server/api";
import { ensureDefaultAdmin, persistSession, verifyGoogleCredential } from "@/lib/server/auth";

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: Request) {
  try {
    await ensureDefaultAdmin();
    const body = (await request.json()) as { credential?: string };
    if (!body.credential) {
      throw new ApiError(400, "GOOGLE_CREDENTIAL_REQUIRED", "Google credential is required");
    }

    const payload = await verifyGoogleCredential(body.credential);
    const email = payload.email?.toLowerCase();

    if (!email || !payload.email_verified) {
      throw new ApiError(401, "GOOGLE_EMAIL_INVALID", "Google account email could not be verified");
    }

    const user = (await prisma.user.findUnique({
      where: { email },
    })) as ({
      id: string;
      email: string;
      role: string;
      googleLoginEnabled: boolean;
      isActive: boolean;
    } & Record<string, unknown>) | null;

    if (!user || !user.googleLoginEnabled || !user.isActive) {
      throw new ApiError(403, "GOOGLE_ACCESS_DENIED", "This Google account is not authorized");
    }

    const { accessToken } = await persistSession(user as never);
    const state = await getBootstrapState(user.id);

    return json({
      accessToken,
      ...state,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
