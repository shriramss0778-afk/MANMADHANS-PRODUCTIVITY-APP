import { requireAuth } from "@/lib/server/auth";
import { getBootstrapState } from "@/lib/server/bootstrap";
import { json, handleRouteError, optionsResponse } from "@/lib/server/api";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET() {
  try {
    const user = await requireAuth();
    const state = await getBootstrapState(user.id);
    return json(state);
  } catch (error) {
    return handleRouteError(error);
  }
}
