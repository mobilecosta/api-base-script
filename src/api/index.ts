import app from '../index';

// Vercel's Node builder will call the default export with (req, res).
// Forward incoming requests to the Express app instance.
export default function handler(req: any, res: any) {
  return app(req, res);
}
