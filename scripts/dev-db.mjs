// Local MongoDB for development without Atlas. Data persists in ./.dev-db
// Usage: npm run dev:db   then set DATABASE_URL=mongodb://127.0.0.1:27017/certificates
import { MongoMemoryServer } from 'mongodb-memory-server';
import { mkdirSync } from 'fs';

mkdirSync('.dev-db', { recursive: true });
const mongo = await MongoMemoryServer.create({
  instance: { port: 27017, dbPath: '.dev-db', storageEngine: 'wiredTiger' },
});
console.log(`MongoDB running: ${mongo.getUri('certificates')}  (Ctrl+C to stop)`);
process.on('SIGINT', async () => {
  await mongo.stop();
  process.exit(0);
});
