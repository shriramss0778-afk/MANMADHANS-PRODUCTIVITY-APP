type Meta = Record<string, unknown> | undefined;

function serializeValue(value: unknown): unknown {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
      ...(value.cause !== undefined ? { cause: serializeValue(value.cause) } : {}),
    };
  }
  return value;
}

function serializeMeta(meta: Meta) {
  if (!meta) {
    return undefined;
  }
  return Object.fromEntries(Object.entries(meta).map(([key, value]) => [key, serializeValue(value)]));
}

function log(level: "info" | "warn" | "error", message: string, meta?: Meta) {
  const entry = {
    level,
    message,
    meta: serializeMeta(meta),
    timestamp: new Date().toISOString(),
  };

  if (level === "error") {
    console.error(JSON.stringify(entry));
    return;
  }

  if (level === "warn") {
    console.warn(JSON.stringify(entry));
    return;
  }

  console.log(JSON.stringify(entry));
}

export const logger = {
  info: (message: string, meta?: Meta) => log("info", message, meta),
  warn: (message: string, meta?: Meta) => log("warn", message, meta),
  error: (message: string, meta?: Meta) => log("error", message, meta),
};
