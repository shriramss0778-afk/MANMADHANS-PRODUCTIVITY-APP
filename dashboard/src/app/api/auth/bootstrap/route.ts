import { ensureDefaultAdmin, persistSession } from "@/lib/server/auth";
import { json, handleRouteError, optionsResponse } from "@/lib/server/api";
import { getBootstrapState } from "@/lib/server/bootstrap";

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST() {
  try {
    const user = await ensureDefaultAdmin();
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
