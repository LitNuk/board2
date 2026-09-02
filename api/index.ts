import express from 'express';

const app = express();

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    source: 'NEW-INDEX-2026',
  });
});

export default app;
