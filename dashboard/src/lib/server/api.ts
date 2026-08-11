import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ApiError } from "./errors";
import { logger } from "./logger";
import { requireAuth, requireSuperAdmin } from "./auth";

const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.CORS_ORIGIN ?? "*",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
};

export function json<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: {
      ...corsHeaders,
      ...(init?.headers ?? {}),
    },
  });
}

export function noContent(init?: ResponseInit) {
  return new NextResponse(null, {
    status: 204,
    ...init,
    headers: {
      ...corsHeaders,
      ...(init?.headers ?? {}),
    },
  });
}

/** CORS preflight handler shared by every route: `export { corsPreflight as OPTIONS }`. */
export async function corsPreflight() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export function handleRouteError(error: unknown) {
  if (error instanceof ZodError) {
    return json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed",
          details: error.flatten(),
        },
      },
      { status: 400 },
    );
  }

  if (error instanceof ApiError) {
    return json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status: error.status },
    );
  }

  logger.error("Unhandled route error", {
    error: error instanceof Error ? error.message : String(error),
  });

  return json(
    {
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong",
      },
    },
    { status: 500 },
  );
}

type RouteContext<P> = { params: Promise<P> };

type RouteParams = Record<string, string>;

function withUser<P extends RouteParams, U>(
  resolveUser: () => Promise<U>,
  handler: (args: { request: Request; user: U; params: P }) => Promise<Response>,
) {
  return async (request: Request, context?: RouteContext<P>) => {
    try {
      const user = await resolveUser();
      const params = ((await context?.params) ?? {}) as P;
      return await handler({ request, user, params });
    } catch (error) {
      return handleRouteError(error);
    }
  };
}

/** Wrap a handler so thrown `ApiError`/`ZodError` become API error responses. */
export function route<P extends RouteParams = RouteParams>(
  handler: (args: { request: Request; params: P }) => Promise<Response>,
) {
  return withUser<P, null>(async () => null, ({ request, params }) => handler({ request, params }));
}

/** Wrap a handler that requires an authenticated user. */
export function authedRoute<P extends RouteParams = RouteParams>(
  handler: (args: {
    request: Request;
    user: Awaited<ReturnType<typeof requireAuth>>;
    params: P;
  }) => Promise<Response>,
) {
  return withUser<P, Awaited<ReturnType<typeof requireAuth>>>(requireAuth, handler);
}

/** Wrap a handler that requires an authenticated super admin managing `resource`. */
export function superAdminRoute<P extends RouteParams = RouteParams>(
  resource: string,
  handler: (args: {
    request: Request;
    user: Awaited<ReturnType<typeof requireSuperAdmin>>;
    params: P;
  }) => Promise<Response>,
) {
  return withUser<P, Awaited<ReturnType<typeof requireSuperAdmin>>>(
    () => requireSuperAdmin(resource),
    handler,
  );
}
