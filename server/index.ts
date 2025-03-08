import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import axios from "axios";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Set up automatic bounty sync every hour
  const syncBounties = async () => {
    try {
      log('Starting automatic bounty sync...');
      const port = 5000;
      await axios.post(`http://0.0.0.0:${port}/api/bounties/sync`);
      log('Automatic bounty sync completed successfully');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        log('Error during automatic bounty sync:', 
          err.message, 
          err.response?.data || 'No response data'
        );
      } else {
        log('Error during automatic bounty sync:', err instanceof Error ? err.message : String(err));
      }
    }
  };

  // Initial sync on server start
  log('Initiating first bounty sync on server start...');
  setTimeout(syncBounties, 5000); // Wait 5 seconds for server to be fully ready

  // Then sync every hour
  setInterval(syncBounties, 60 * 60 * 1000);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();