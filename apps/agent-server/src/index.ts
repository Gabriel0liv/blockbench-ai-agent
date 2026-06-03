import Fastify from 'fastify';
import cors from '@fastify/cors';
import { runAgentRoutes } from './routes/runAgent.js';

const fastify = Fastify({
  logger: true
});

// Configure CORS to allow access from any origin (e.g. Blockbench Desktop plugin running locally)
await fastify.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
});

// Register routes
await fastify.register(runAgentRoutes);

const PORT = 3000;
const HOST = '127.0.0.1';

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: HOST });
    console.log(`Agent Server is running on http://${HOST}:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
