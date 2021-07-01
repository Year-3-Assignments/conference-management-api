import mongoose, { Schema } from 'mongoose';

const PaymentSchema = new Schema({
  conference: { type: Schema.Types.ObjectId, required: true, ref: 'conferences' },
  attendee: { type: Schema.Types.ObjectId, required: true, ref: 'users' },
  amount: { type: String, required: true, trim: true },
}, {
  timestamps: true
});

const Payment = mongoose.model('payments', PaymentSchema);
module.exports = Payment;