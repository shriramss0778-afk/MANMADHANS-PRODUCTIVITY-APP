import { prisma } from "@/lib/server/prisma";
import { ApiError } from "@/lib/server/errors";
import { startSessionState } from "@/lib/server/bootstrap";
import { corsPreflight, json, route } from "@/lib/server/api";
import { ensureDefaultAdmin, verifyGoogleCredential } from "@/lib/server/auth";

export { corsPreflight as OPTIONS };

export const POST = route(async ({ request }) => {
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

  return json(await startSessionState(user as never));
});
