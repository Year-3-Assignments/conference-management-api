import mongoose, { Schema } from 'mongoose';

const PaymentSchema = new Schema({
  resource: { type: Schema.Types.ObjectId, required: false, ref: 'resources' },
  user: { type: Schema.Types.ObjectId, required: false, ref: 'users' },
  conference: { type: Schema.Types.ObjectId, required: false, ref: 'conferences' },
  attendee: { type: Schema.Types.ObjectId, required: false, ref: 'users' },
  amount: { type: String, required: true, trim: true },
}, {
  timestamps: true
});

const Payment = mongoose.model('payments', PaymentSchema);
module.exports = Payment;