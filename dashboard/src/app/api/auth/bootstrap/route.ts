import { ensureDefaultAdmin } from "@/lib/server/auth";
import { corsPreflight, json, route } from "@/lib/server/api";
import { startSessionState } from "@/lib/server/bootstrap";

export { corsPreflight as OPTIONS };

export const POST = route(async () => {
  const user = await ensureDefaultAdmin();
  return json(await startSessionState(user));
});
