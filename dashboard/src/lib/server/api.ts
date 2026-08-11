import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ApiError } from "./errors";
import { logger } from "./logger";

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

export function optionsResponse() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

const PRISMA_ERROR_MAP: Record<string, { status: number; code: string; message: string }> = {
  P2002: { status: 409, code: "CONFLICT", message: "A record with these values already exists" },
  P2003: { status: 400, code: "INVALID_REFERENCE", message: "Related record does not exist" },
  P2025: { status: 404, code: "NOT_FOUND", message: "Record not found" },
};

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const mapped = PRISMA_ERROR_MAP[error.code];
    if (mapped) {
      return new ApiError(mapped.status, mapped.code, mapped.message);
    }
    return new ApiError(500, "DATABASE_ERROR", "Database request failed");
  }

  if (
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientRustPanicError
  ) {
    return new ApiError(503, "DATABASE_UNAVAILABLE", "The database is currently unavailable");
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return new ApiError(500, "DATABASE_ERROR", "Database request failed");
  }

  return new ApiError(500, "INTERNAL_SERVER_ERROR", "Something went wrong");
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

  const apiError = toApiError(error);

  if (apiError.status >= 500) {
    logger.error("Unhandled route error", {
      code: apiError.code,
      status: apiError.status,
      error: error instanceof Error ? error : String(error),
    });

    return json(
      {
        error: {
          code: apiError.code,
          message: apiError.message,
        },
      },
      { status: apiError.status },
    );
  }

  return json(
    {
      error: {
        code: apiError.code,
        message: apiError.message,
        details: apiError.details,
      },
    },
    { status: apiError.status },
  );
}
