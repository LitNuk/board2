import { app, setupServer } from '../server';

let initialized = false;

export default async function handler(req: any, res: any) {
  if (!initialized) {
    await setupServer();
    initialized = true;
  }

  app(req, res);
}
