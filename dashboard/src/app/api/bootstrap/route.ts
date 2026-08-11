import { authedRoute, corsPreflight, json } from "@/lib/server/api";
import { getBootstrapState } from "@/lib/server/bootstrap";

export { corsPreflight as OPTIONS };

export const GET = authedRoute(async ({ user }) => json(await getBootstrapState(user.id)));
