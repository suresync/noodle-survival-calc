import type { Express } from "express";
import { createServer } from "http";

export async function registerRoutes(app: Express) {
  // Pure frontend calculator — no backend routes needed
  const httpServer = createServer(app);
  return httpServer;
}
