import express from 'express';

const app = express();

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'LitNuke X ANUMA Tracker',
    time: new Date().toISOString(),
  });
});

export default app;
