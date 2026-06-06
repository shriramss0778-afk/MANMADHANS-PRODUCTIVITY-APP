import { Role, type User } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomUUID, createHash } from "crypto";
import { createRemoteJWKSet, jwtVerify, SignJWT } from "jose";
import { cookies, headers } from "next/headers";
import { ApiError } from "./errors";
import { env } from "./env";
import { prisma } from "./prisma";

const ACCESS_TOKEN_COOKIE = "dashboard_access_token";
const REFRESH_TOKEN_COOKIE = "dashboard_refresh_token";

type JwtPayload = {
  sub: string;
  email: string;
  role: Role;
  type: "access" | "refresh";
};

function secret(input: string) {
  return new TextEncoder().encode(input);
}

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

async function signToken(payload: JwtPayload, expiresIn: string, secretValue: string) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret(secretValue));
}

export async function createAccessToken(user: Pick<User, "id" | "email" | "role">) {
  return signToken(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: "access",
    },
    `${env.JWT_ACCESS_EXPIRES_IN_MINUTES}m`,
    env.JWT_ACCESS_SECRET,
  );
}

export async function createRefreshToken(user: Pick<User, "id" | "email" | "role">) {
  return signToken(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: "refresh",
    },
    `${env.JWT_REFRESH_EXPIRES_IN_DAYS}d`,
    env.JWT_REFRESH_SECRET,
  );
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, secret(env.JWT_ACCESS_SECRET));
  return payload as JwtPayload;
}

export async function verifyRefreshToken(token: string) {
  const { payload } = await jwtVerify(token, secret(env.JWT_REFRESH_SECRET));
  return payload as JwtPayload;
}

function refreshExpiryDate() {
  return new Date(Date.now() + env.JWT_REFRESH_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000);
}

export async function storeRefreshToken(userId: string, refreshToken: string) {
  const headerStore = await headers();
  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: tokenHash(refreshToken),
      expiresAt: refreshExpiryDate(),
      ipAddress: headerStore.get("x-forwarded-for") ?? undefined,
      userAgent: headerStore.get("user-agent") ?? undefined,
    },
  });
}

export async function revokeRefreshToken(refreshToken: string) {
  await prisma.refreshToken.updateMany({
    where: {
      tokenHash: tokenHash(refreshToken),
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}

export async function persistSession(user: Pick<User, "id" | "email" | "role">) {
  const [accessToken, refreshToken] = await Promise.all([
    createAccessToken(user),
    createRefreshToken(user),
  ]);

  await storeRefreshToken(user.id, refreshToken);

  const cookieStore = await cookies();
  cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: refreshExpiryDate(),
  });
  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(Date.now() + env.JWT_ACCESS_EXPIRES_IN_MINUTES * 60 * 1000),
  });

  return { accessToken, refreshToken };
}

export async function clearSession() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
}

export async function getAccessTokenFromRequest() {
  const cookieStore = await cookies();
  const authHeader = (await headers()).get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export async function requireAuth() {
  const token = await getAccessTokenFromRequest();
  if (!token) {
    throw new ApiError(401, "UNAUTHORIZED", "Authentication required");
  }

  try {
    const payload = await verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { timerSettings: true },
    });

    if (!user) {
      throw new ApiError(401, "UNAUTHORIZED", "User no longer exists");
    }

    return user;
  } catch {
    throw new ApiError(401, "UNAUTHORIZED", "Invalid or expired access token");
  }
}

export function requireRole(user: Pick<User, "role">, roles: Role[]) {
  if (!roles.includes(user.role)) {
    throw new ApiError(403, "FORBIDDEN", "You do not have access to this resource");
  }
}

export async function rotateRefreshToken() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  if (!refreshToken) {
    throw new ApiError(401, "UNAUTHORIZED", "Refresh token missing");
  }

  let payload: JwtPayload;
  try {
    payload = await verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, "UNAUTHORIZED", "Invalid refresh token");
  }

  const record = await prisma.refreshToken.findFirst({
    where: {
      tokenHash: tokenHash(refreshToken),
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (!record) {
    throw new ApiError(401, "UNAUTHORIZED", "Refresh token revoked or expired");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    throw new ApiError(401, "UNAUTHORIZED", "User no longer exists");
  }

  await revokeRefreshToken(refreshToken);
  return persistSession(user);
}

export async function ensureDefaultAdmin() {
  const existing = await prisma.user.findUnique({
    where: { email: env.DEFAULT_ADMIN_EMAIL.toLowerCase() },
  });

  const passwordHash = await hashPassword(env.DEFAULT_ADMIN_PASSWORD);

  if (existing) {
    return prisma.user.update({
      where: { id: existing.id },
      data: {
        name: env.DEFAULT_ADMIN_NAME,
        passwordHash,
        role: "SUPER_ADMIN" as never,
        isActive: true as never,
        googleLoginEnabled: true as never,
        passwordChangeRequired: false as never,
        readingGoal: existing.readingGoal ?? 24,
        timerSettings: existing.id
          ? {
              upsert: {
                create: {
                  focus: 25,
                  short: 5,
                  long: 15,
                },
                update: {},
              },
            }
          : undefined,
      },
    });
  }

  return prisma.user.create({
    data: {
      email: env.DEFAULT_ADMIN_EMAIL.toLowerCase(),
      name: env.DEFAULT_ADMIN_NAME,
      passwordHash,
      role: "SUPER_ADMIN" as never,
      isActive: true as never,
      googleLoginEnabled: true as never,
      passwordChangeRequired: false as never,
      readingGoal: 24,
      timerSettings: {
        create: {
          focus: 25,
          short: 5,
          long: 15,
        },
      },
    },
  });
}

const googleJwks = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export async function verifyGoogleCredential(credential: string) {
  if (!env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
    throw new ApiError(500, "GOOGLE_AUTH_NOT_CONFIGURED", "Google sign-in is not configured");
  }

  const { payload } = await jwtVerify(credential, googleJwks, {
    audience: env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    issuer: ["https://accounts.google.com", "accounts.google.com"],
  });

  return payload as JwtPayload & {
    email?: string;
    email_verified?: boolean;
    name?: string;
  };
}

export function generateOpaqueId(prefix: string) {
  return `${prefix}_${randomUUID()}`;
}
