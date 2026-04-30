import { z } from 'zod';
import { DIRECTION } from '../models/Signal.js';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const baseSchema = z.object({
  symbol: z
    .string()
    .trim()
    .min(5, 'Symbol must be at least 5 chars')
    .max(20, 'Symbol too long')
    .regex(/^[A-Z0-9]+$/i, 'Symbol must be alphanumeric (e.g. BTCUSDT)'),
  direction: z.enum([DIRECTION.BUY, DIRECTION.SELL]),
  entry_price: z.number().positive('Entry price must be > 0'),
  stop_loss: z.number().positive('Stop loss must be > 0'),
  target_price: z.number().positive('Target price must be > 0'),
  entry_time: z.coerce.date({ invalid_type_error: 'Invalid entry_time' }),
  expiry_time: z.coerce.date({ invalid_type_error: 'Invalid expiry_time' }),
});

export const createSignalSchema = baseSchema.superRefine((data, ctx) => {
  // Direction-aware price rules
  if (data.direction === DIRECTION.BUY) {
    if (!(data.stop_loss < data.entry_price)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['stop_loss'],
        message: 'For BUY: stop_loss must be < entry_price',
      });
    }
    if (!(data.target_price > data.entry_price)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['target_price'],
        message: 'For BUY: target_price must be > entry_price',
      });
    }
  } else if (data.direction === DIRECTION.SELL) {
    if (!(data.stop_loss > data.entry_price)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['stop_loss'],
        message: 'For SELL: stop_loss must be > entry_price',
      });
    }
    if (!(data.target_price < data.entry_price)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['target_price'],
        message: 'For SELL: target_price must be < entry_price',
      });
    }
  }

  // Time rules
  const now = Date.now();
  if (data.entry_time.getTime() > now + 60_000) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['entry_time'],
      message: 'Entry time cannot be in the future',
    });
  }
  if (data.entry_time.getTime() < now - ONE_DAY_MS) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['entry_time'],
      message: 'Entry time cannot be more than 24 hours in the past',
    });
  }
  if (data.expiry_time.getTime() <= data.entry_time.getTime()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['expiry_time'],
      message: 'Expiry time must be after entry time',
    });
  }
});

export const listQuerySchema = z.object({
  status: z.enum(['OPEN', 'TARGET_HIT', 'STOPLOSS_HIT', 'EXPIRED']).optional(),
  symbol: z.string().trim().toUpperCase().optional(),
  direction: z.enum([DIRECTION.BUY, DIRECTION.SELL]).optional(),
  limit: z.coerce.number().int().min(1).max(500).optional(),
  sort: z.string().optional(),
});

export const idParamSchema = z.object({
  id: z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid id'),
});
