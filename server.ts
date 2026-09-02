import { createServer as createViteServer } from 'vite';
import app from './api/app';

const PORT = Number(
  process.env.PORT || 3000
);

async function startLocalServer() {
  const vite =
    await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: 'spa',
    });

  app.use(vite.middlewares);

  app.listen(
    PORT,
    '0.0.0.0',
    () => {
      console.log(
        `[LitNuke X ANUMA] Server running on http://localhost:${PORT}`
      );
    }
  );
}

startLocalServer().catch(
  (error) => {
    console.error(
      '[Server] Failed to start:',
      error
    );

    process.exit(1);
  }
);
