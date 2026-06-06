import { clearSession } from "@/lib/server/auth";
import { handleRouteError, noContent, optionsResponse } from "@/lib/server/api";

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST() {
  try {
    await clearSession();
    return noContent();
  } catch (error) {
    return handleRouteError(error);
  }
}
