import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';

interface Schemas {
  params?: AnyZodObject;
  query?: AnyZodObject;
  body?: AnyZodObject;
}

// Parses + coerces each part of the request. On failure the ZodError bubbles to errorHandler (-> 400).
// On success handlers receive typed, sanitized (unknown keys stripped) data.
export const validate =
  (schemas: Schemas) => (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.params) req.params = schemas.params.parse(req.params);
      if (schemas.query) req.query = schemas.query.parse(req.query);
      if (schemas.body) req.body = schemas.body.parse(req.body);
      next();
    } catch (err) {
      next(err);
    }
  };
