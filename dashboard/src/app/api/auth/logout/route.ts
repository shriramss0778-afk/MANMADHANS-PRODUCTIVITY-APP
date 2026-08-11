import { clearSession } from "@/lib/server/auth";
import { corsPreflight, noContent, route } from "@/lib/server/api";

export { corsPreflight as OPTIONS };

export const POST = route(async () => {
  await clearSession();
  return noContent();
});
