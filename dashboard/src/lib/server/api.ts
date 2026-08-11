import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ApiError } from "./errors";
import { logger } from "./logger";

function allowedOrigins() {
  return (process.env.CORS_ORIGIN ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0 && origin !== "*");
}

/**
 * Credentialed CORS can never use a wildcard origin, so cross-origin access is
 * granted only to the origins explicitly listed in CORS_ORIGIN. Same-origin
 * requests from the app itself need no CORS headers at all.
 */
function buildCorsHeaders() {
  const origins = allowedOrigins();
  if (origins.length === 0) {
    return { Vary: "Origin" } as Record<string, string>;
  }

  return {
    "Access-Control-Allow-Origin": origins[0],
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    Vary: "Origin",
  } as Record<string, string>;
}

function corsHeadersFor(request?: Request) {
  const origins = allowedOrigins();
  const requestOrigin = request?.headers.get("origin");
  if (!requestOrigin || !origins.includes(requestOrigin)) {
    return buildCorsHeaders();
  }

  return {
    ...buildCorsHeaders(),
    "Access-Control-Allow-Origin": requestOrigin,
  };
}

export function json<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: {
      ...buildCorsHeaders(),
      ...(init?.headers ?? {}),
    },
  });
}

export function noContent(init?: ResponseInit) {
  return new NextResponse(null, {
    status: 204,
    ...init,
    headers: {
      ...buildCorsHeaders(),
      ...(init?.headers ?? {}),
    },
  });
}

export function optionsResponse(request?: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeadersFor(request),
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
