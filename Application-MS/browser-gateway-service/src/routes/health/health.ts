import { Router, type Request, type Response } from 'express';
import os from 'os';

const router = Router();

// Helper function to format uptime in human-readable format
const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  const secs = Math.floor(seconds % 60);

  if (days > 0) return `${days}d ${hours}h ${minutes}m ${secs}s`;
  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
};

// Helper function to check memory health
const getMemoryHealth = (memoryUsage: NodeJS.MemoryUsage) => {
  const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
  const heapTotalMB = memoryUsage.heapTotal / 1024 / 1024;
  const heapUsagePercent = (heapUsedMB / heapTotalMB) * 100;

  return {
    healthy: heapUsagePercent < 85, // Consider unhealthy if > 85%
    percentage: heapUsagePercent.toFixed(1),
  };
};

// Helper function to check CPU health
const getCpuHealth = (loadAverage: number[]) => {
  const cpuCount = os.cpus().length;
  const load1m: any = loadAverage[0];
  const loadPercentage = (load1m / cpuCount) * 100;

  return {
    healthy: loadPercentage < 80, // Consider unhealthy if > 80%
    percentage: loadPercentage.toFixed(1),
  };
};

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    // console.log("MAKING-REPORT")
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const loadAverage: any = os.loadavg();
    const cpuInfo = os.cpus();

    // Health checks
    const memoryHealth = getMemoryHealth(memoryUsage);
    const cpuHealth = getCpuHealth(loadAverage);

    // Determine overall health
    const isHealthy = memoryHealth.healthy && cpuHealth.healthy;

    const healthReport = {
      status: isHealthy ? 'UP' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      service: {
        name: 'browser-gateway-service',
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch,
        pid: process.pid,
      },
      uptime: {
        process: formatUptime(uptime),
        system: formatUptime(os.uptime()),
        processSeconds: Math.floor(uptime),
      },
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
        heapUsagePercent: `${memoryHealth.percentage}%`,
        healthy: memoryHealth.healthy,
      },
      cpu: {
        count: cpuInfo.length,
        model: cpuInfo[0]?.model || 'Unknown',
        loadAverage: {
          '1m': loadAverage[0].toFixed(2),
          '5m': loadAverage[1].toFixed(2),
          '15m': loadAverage[2].toFixed(2),
        },
        loadPercentage: `${cpuHealth.percentage}%`,
        healthy: cpuHealth.healthy,
      },
      system: {
        hostname: os.hostname(),
        platform: os.platform(),
        release: os.release(),
        totalMemory: `${Math.round(os.totalmem() / 1024 / 1024 / 1024)} GB`,
        freeMemory: `${Math.round(os.freemem() / 1024 / 1024 / 1024)} GB`,
        networkInterfaces: Object.keys(os.networkInterfaces()).length,
      },
      // Add checks for external dependencies here
      dependencies: {
        // Example: database, redis, external APIs
        // database: await checkDatabaseHealth(),
        // redis: await checkRedisHealth(),
        // externalAPI: await checkExternalAPIHealth()
      },
      checks: {
        memory: memoryHealth.healthy ? 'PASS' : 'FAIL',
        cpu: cpuHealth.healthy ? 'PASS' : 'FAIL',
        // Add more checks as needed
      },
    };

    // Return appropriate status code based on health
    const statusCode = isHealthy ? 200 : 503;
    res.status(statusCode).json(healthReport);
  } catch (error) {
    res.status(503).json({
      status: 'DOWN',
      timestamp: new Date().toISOString(),
      service: {
        name: 'browser-gateway-service',
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      },
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      checks: {
        healthEndpoint: 'FAIL',
      },
    });
  }
});

export default router;
