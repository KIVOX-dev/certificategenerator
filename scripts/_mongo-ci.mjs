import { MongoMemoryServer } from 'mongodb-memory-server';
const m = await MongoMemoryServer.create({ instance: { port: 27555 } });
console.log('up');
await new Promise(() => {});
