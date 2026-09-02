import express from 'express';

const app = express();

app.get('/', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Vercel Express function is working'
  });
});

export default app;
