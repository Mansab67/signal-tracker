import mongoose from 'mongoose';

export const SIGNAL_STATUS = Object.freeze({
  OPEN: 'OPEN',
  TARGET_HIT: 'TARGET_HIT',
  STOPLOSS_HIT: 'STOPLOSS_HIT',
  EXPIRED: 'EXPIRED',
});

export const DIRECTION = Object.freeze({
  BUY: 'BUY',
  SELL: 'SELL',
});

const SignalSchema = new mongoose.Schema(
  {
    symbol: { type: String, required: true, uppercase: true, trim: true, index: true },
    direction: { type: String, enum: Object.values(DIRECTION), required: true },
    entry_price: { type: Number, required: true, min: 0 },
    stop_loss: { type: Number, required: true, min: 0 },
    target_price: { type: Number, required: true, min: 0 },
    entry_time: { type: Date, required: true },
    expiry_time: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(SIGNAL_STATUS),
      default: SIGNAL_STATUS.OPEN,
      index: true,
    },
    realized_roi: { type: Number, default: null },
    realized_price: { type: Number, default: null },
    realized_at: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

SignalSchema.index({ status: 1, expiry_time: 1 });
SignalSchema.index({ created_at: -1 });

export const Signal = mongoose.model('Signal', SignalSchema);
