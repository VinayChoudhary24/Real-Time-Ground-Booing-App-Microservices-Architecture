import { Request, Response, NextFunction } from "express";

const allowedHeaders = [
  "authorization",
  "content-type",
  "x-access-token",
  "x-api-key",
  "cache-control",
  "origin",
  "x-requested-with",
  "accept",
  "x-forwarded-for",
  "x-real-ip",
  "x-client-ip",
  "x-client",
  "cf-connecting-ip",
  "true-client-ip",
  "x-forwarded-proto",
  "x-forwarded-host",
  "user-agent",
  "referer",
  "x-app-ip",
  "x-app-location",
];


export const sanitizeHeaders = (req: Request, res: Response, next: NextFunction) => {
  const sanitizedHeaders: Record<string, string> = {};

  const incomingHeaders = Object.fromEntries(
    Object.entries(req.headers).map(([k, v]) => [k.toLowerCase(), v])
  );

  for (const key of allowedHeaders) {
    if (incomingHeaders[key]) {
      sanitizedHeaders[key] = incomingHeaders[key] as string;
    }
  }

  // Override original req.headers with sanitized headers
  req.headers = sanitizedHeaders;

  next();
};
