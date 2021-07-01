import mongoose, { Schema } from 'mongoose';

const NotificationSchema = new Schema({
  conference: { type: Schema.Types.ObjectId, required: false, ref: 'conferences' },
  workshop: { type: Schema.Types.ObjectId, required: false, ref: 'workshops' },
  resource: { type: Schema.Types.ObjectId, required: false, ref: 'resources' },
  from: { type: Schema.Types.ObjectId, required: false, ref: 'users' },
  message: { type: String, required: true, trim: true },
  to: { type: Schema.Types.ObjectId, required: true, ref: 'users' },
  isarchive: { type: Boolean, required: true },
  payment: {type: Boolean, required: false},
  amount: { type: String, required: false, trim: true }
}, {
  strict: false,
  timestamps: true
});

const Notification = mongoose.model('notifications', NotificationSchema);
module.exports = Notification;