import { createApp } from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { env } from './config/env.js';

async function start() {
  await connectDB();
  const app = createApp();
  const server = app.listen(env.PORT, () => console.log(`🚀 API listening on http://localhost:${env.PORT}/api`));

    // Keep idle connections open longer than the reverse proxy in front of us (Next.js rewrites,
  // Vercel, a load balancer). If the API closed an idle socket first, the proxy could reuse
  // that dead socket and the request would fail with ECONNRESET / 500.
  server.keepAliveTimeout = 65_000;
  // Must be greater than keepAliveTimeout. Still caps slow-loris style slow headers.
  server.headersTimeout = 66_000;
  server.requestTimeout = 70_000;
  const shutdown = (signal) => {
    console.log(`\n${signal} received, shutting down…`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection', err);
    shutdown('unhandledRejection');
  });
}

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
