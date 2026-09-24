import mongoose from 'mongoose';
import { app } from './app';
import { env } from './config/env';

async function main() {
  await mongoose.connect(env.MONGODB_URI);
  console.log('MongoDB connected');

  // Build declared indexes (incl. the unique {competitionId, userId}) before serving traffic.
  await mongoose.syncIndexes();

  const server = app.listen(env.PORT, () => console.log(`API listening on :${env.PORT}`));

  const shutdown = async (signal: string) => {
    console.log(`${signal} received, shutting down`);
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  console.error('Failed to start', err);
  process.exit(1);
});
