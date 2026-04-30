import { ZodError } from 'zod';
import * as service from '../services/signal.service.js';
import {
  createSignalSchema,
  idParamSchema,
  listQuerySchema,
} from '../validators/signal.validator.js';

function zodErrorToHttp(err) {
  return {
    status: 400,
    body: {
      error: 'Validation failed',
      details: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    },
  };
}

export async function create(req, res, next) {
  try {
    const parsed = createSignalSchema.parse(req.body);
    const signal = await service.createSignal(parsed);
    res.status(201).json(signal);
  } catch (err) {
    if (err instanceof ZodError) {
      const { status, body } = zodErrorToHttp(err);
      return res.status(status).json(body);
    }
    if (err.status) return res.status(err.status).json({ error: err.message, details: err.details });
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const query = listQuerySchema.parse(req.query);
    const data = await service.listSignals(query);
    res.json({ data, count: data.length });
  } catch (err) {
    if (err instanceof ZodError) {
      const { status, body } = zodErrorToHttp(err);
      return res.status(status).json(body);
    }
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const signal = await service.getSignalById(id);
    if (!signal) return res.status(404).json({ error: 'Signal not found' });
    res.json(signal);
  } catch (err) {
    if (err instanceof ZodError) {
      const { status, body } = zodErrorToHttp(err);
      return res.status(status).json(body);
    }
    next(err);
  }
}

export async function getStatus(req, res, next) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const status = await service.getSignalStatus(id);
    if (!status) return res.status(404).json({ error: 'Signal not found' });
    res.json(status);
  } catch (err) {
    if (err instanceof ZodError) {
      const { status, body } = zodErrorToHttp(err);
      return res.status(status).json(body);
    }
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const ok = await service.deleteSignal(id);
    if (!ok) return res.status(404).json({ error: 'Signal not found' });
    res.status(204).end();
  } catch (err) {
    if (err instanceof ZodError) {
      const { status, body } = zodErrorToHttp(err);
      return res.status(status).json(body);
    }
    next(err);
  }
}
