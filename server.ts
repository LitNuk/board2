import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import app from './api/index';

dotenv.config();

const PORT = Number(
  process.env.PORT || 3000
);

async function startServer() {
  const vite =
    await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: 'spa',
    });

  const server =
    express();

  /*
   * API
   */
  server.use(app);

  /*
   * Vite
   */
  server.use(
    vite.middlewares
  );

  server.listen(
    PORT,
    '0.0.0.0',
    () => {
      console.log(
        `Server running at http://localhost:${PORT}`
      );
    }
  );
}

startServer().catch(
  (error) => {
    console.error(
      'Failed to start server:',
      error
    );

    process.exit(1);
  }
);
