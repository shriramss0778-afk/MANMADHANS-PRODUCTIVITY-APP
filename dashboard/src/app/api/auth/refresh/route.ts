import { getBootstrapState } from "@/lib/server/bootstrap";
import { corsPreflight, json, route } from "@/lib/server/api";
import { rotateRefreshToken, verifyAccessToken } from "@/lib/server/auth";

export { corsPreflight as OPTIONS };

export const POST = route(async () => {
  const { accessToken } = await rotateRefreshToken();
  const payload = await verifyAccessToken(accessToken);
  const state = await getBootstrapState(payload.sub);

  return json({
    accessToken,
    ...state,
  });
});
