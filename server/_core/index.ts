import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

// ========== 工作日 08:30 CST 自动触发 cron ==========
let lastCronDate = "";

function startDailyCron() {
  // 每分钟检查一次当前时间（CST = UTC+8）
  setInterval(async () => {
    // 获取北京时间
    const now = new Date();
    const cstOffset = 8 * 60; // CST = UTC+8
    const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    const cstMinutes = (utcMinutes + cstOffset) % (24 * 60);
    const cstHour = Math.floor(cstMinutes / 60);
    const cstMin = cstMinutes % 60;

    // 获取 CST 日期字符串（用于防重复触发）
    const cstDate = new Date(now.getTime() + cstOffset * 60000);
    const dateStr = cstDate.toISOString().slice(0, 10); // "YYYY-MM-DD"

    // 判断是否为工作日（周一=1 ~ 周五=5）
    const cstDayOfWeek = cstDate.getUTCDay(); // 0=Sunday, 6=Saturday
    const isWeekday = cstDayOfWeek >= 1 && cstDayOfWeek <= 5;

    // 触发窗口：08:30 ~ 08:31（2分钟窗口防漏触发）
    const isTargetTime = cstHour === 8 && cstMin >= 30 && cstMin <= 31;

    if (isWeekday && isTargetTime && lastCronDate !== dateStr) {
      lastCronDate = dateStr; // 标记今日已触发
      console.log(`[CRON] Triggering daily scrape + email at ${dateStr} 08:30 CST`);

      try {
        // 通过 tRPC caller 直接调用 cron.dailyScrapeAndReport
        const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
        const result = await caller.cron.dailyScrapeAndReport();
        console.log(`[CRON] Done: fetched=${result.totalFetched}, passed=${result.totalPassed}, inReport=${result.articlesInReport}`);
      } catch (err: any) {
        console.error("[CRON] Error during daily scrape + email:", err?.message || err);
      }
    }
  }, 60 * 1000); // 每60秒检查一次

  console.log("[CRON] Daily auto-scrape + email scheduled for 08:30 CST on weekdays (Mon–Fri)");
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // Auth routes
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    // 启动工作日 08:30 CST 定时任务
    startDailyCron();
  });
}

startServer().catch(console.error);
