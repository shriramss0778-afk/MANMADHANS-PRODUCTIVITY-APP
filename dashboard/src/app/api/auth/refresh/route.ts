import { getBootstrapState } from "@/lib/server/bootstrap";
import { json, handleRouteError, optionsResponse } from "@/lib/server/api";
import { rotateRefreshToken, verifyAccessToken } from "@/lib/server/auth";

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST() {
  try {
    const { accessToken } = await rotateRefreshToken();
    const payload = await verifyAccessToken(accessToken);
    const state = await getBootstrapState(payload.sub);

    return json({
      accessToken,
      ...state,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
