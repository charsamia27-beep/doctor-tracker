import dns from 'node:dns';
import mongoose from 'mongoose';
import { env } from './env.js';

// Some ISP/router DNS servers can't resolve the SRV records that mongodb+srv:// (Atlas) needs,
// which fails with "querySrv ECONNREFUSED". Use public DNS for those lookups.
if (env.MONGODB_URI.startsWith('mongodb+srv://')) {
  dns.setServers(['1.1.1.1', '8.8.8.8']);
}

export async function connectDB() {
  mongoose.set('strictQuery', true);
  // Build indexes automatically in dev; in production run `npm run sync-indexes` as a deploy step.
  mongoose.set('autoIndex', !env.isProd);

  await mongoose.connect(env.MONGODB_URI, {
    maxPoolSize: 20,
    // Home routers / ISPs silently drop idle TCP connections. Recycle idle pool sockets
    // before that happens, so the first query after a pause doesn't hang on a dead socket.
    maxIdleTimeMS: 30_000,
    // Fail fast (well before the 30s proxy timeout) instead of hanging the request.
    serverSelectionTimeoutMS: 10_000,
    socketTimeoutMS: 20_000,
    family: 4, // prefer IPv4: avoids slow IPv6 fallbacks on some networks
  });
  console.log(`✅ MongoDB connected: ${mongoose.connection.name}`);
}

export async function disconnectDB() {
  await mongoose.connection.close();
}
