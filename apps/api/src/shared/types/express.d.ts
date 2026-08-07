// Augments Express's Request type with the `id` field that request-tracing
// middleware (e.g. pino-http, or any future request-id middleware) attaches
// to incoming requests. Kept optional since not every request path is
// guaranteed to have gone through that middleware.
import 'express';

declare module 'express' {
  interface Request {
    id?: string;
  }
}
