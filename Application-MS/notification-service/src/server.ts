import { createServer } from 'http';
import app from './app.js';
import { appConfig } from './config/appConfig/app.config';
import { consoleLogger } from './utils/logs/logger.util';
import { connectDB } from './config/db/db';

const server = createServer(app);

const port = appConfig.port as number;
const host = appConfig.host as string;

const startServer = async () => {
  try {
    await connectDB();
    server.listen(port, host, () => {
      consoleLogger.debug({
        service: appConfig.name,
        status: `running at http://${appConfig.host}:${appConfig.port}`,
        MongoDB: `Connected to DB`,
      });
    });
  } catch (err) {
    consoleLogger.error({ NotificationServer: `failed to start server: ${err}` });
  }
};

startServer();

// Gracefully handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  // console.error(red.bold("UNCAUGHT EXCEPTION 🔥"), err);
  shutdownGracefully();
});

// Gracefully handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  // console.error(red.bold("UNHANDLED REJECTION ⚠️"), reason);
  shutdownGracefully();
});

// Graceful shutdown function
function shutdownGracefully() {
  // console.log(red("Shutting down merchant service gracefully..."));
  server.close(() => {
    // console.log(red("Server closed."));
    process.exit(1); // Exit with failure
  });

  // Force exit if shutdown takes too long
  setTimeout(() => {
    // console.error(red("Force exiting..."));
    process.exit(1);
  }, 10000); // 10 seconds
}
