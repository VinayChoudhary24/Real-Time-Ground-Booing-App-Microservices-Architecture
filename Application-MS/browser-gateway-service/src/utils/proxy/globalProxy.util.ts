// middleware/globalProxy.ts
import { createProxyMiddleware } from "http-proxy-middleware";
import { Agent } from "http";
import { Request, Response, NextFunction } from "express";

interface ProxyConfig {
  target: string;
  timeout?: number;
  maxSockets?: number;
  maxFreeSockets?: number;
}

class GlobalProxyMiddleware {
  private httpAgent: Agent;
  private proxyMiddleware: any;

  constructor(config: ProxyConfig) {
    this.httpAgent = new Agent({
      keepAlive: true,
      keepAliveMsecs: 30000,
      maxSockets: config.maxSockets || 100,
      maxFreeSockets: config.maxFreeSockets || 20,
      timeout: 60000,
    });

    this.proxyMiddleware = this.createProxy(config);
  }

  private createProxy(config: ProxyConfig) {
    const proxyOptions = {
      target: config.target,
      changeOrigin: true,
      timeout: config.timeout || 10000,
      proxyTimeout: config.timeout || 10000,
      agent: this.httpAgent,
      
      // Filter function to only proxy /api routes
      filter: (pathname: string, req: Request) => {
        return pathname.startsWith('/api');
      },
      
      onProxyReq: (proxyReq: any, req: Request, res: Response) => {
        const startTime = Date.now();
        
        // Add essential headers only
        proxyReq.setHeader('X-Forwarded-For', req.ip);
        proxyReq.setHeader('X-Real-IP', req.ip);
        proxyReq.setHeader('X-Request-ID', this.generateRequestId());
        proxyReq.setHeader('X-Start-Time', startTime.toString());
        
        // Store start time for performance monitoring
        (req as any).startTime = startTime;
      },
      
      onProxyRes: (proxyRes: any, req: Request, res: Response) => {
        const duration = Date.now() - ((req as any).startTime || 0);
        
        // Add performance headers
        res.setHeader('X-Response-Time', `${duration}ms`);
        res.setHeader('X-Proxy-Source', 'global-gateway');
      },
      
      onError: (err: any, req: Request, res: Response) => {
        console.error(`Proxy Error for ${req.path}:`, err.message);
        
        res.status(502).json({
          error: 'Bad gateway',
          path: req.path
        });
      }
    };

    return createProxyMiddleware(proxyOptions);
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  public getMiddleware() {
    return this.proxyMiddleware;
  }

  public healthCheck(req: Request, res: Response) {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      connections: {
        maxSockets: this.httpAgent.maxSockets,
        maxFreeSockets: this.httpAgent.maxFreeSockets
      }
    });
  }
}

// Factory function to create proxy middleware
export const createGlobalProxy = (config: ProxyConfig) => {
  return new GlobalProxyMiddleware(config);
};

// Default export
export default createGlobalProxy;