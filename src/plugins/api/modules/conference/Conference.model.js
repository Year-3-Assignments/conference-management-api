import mongoose, { Schema } from 'mongoose';

const ConferenceSchema = new Schema({
  name: { type: String, required: true, trim: true },
  image_url: { type: String, required: false, trim: true },
  description: { type: String, required: true, trim: true },
  amount: { type: Number, required: false, trim: true },
  status: { type: String, required: true, trim: true },
  createdby: { type: Schema.Types.ObjectId, required: true, ref: 'users' },
  atendees: [{ type: Schema.Types.ObjectId, ref: 'users' }],
  resource: { type: Schema.Types.ObjectId, ref: 'resources', required: true },
}, {
  timestamps: true
});

const Conference = mongoose.model('conferences', ConferenceSchema);
export default Conference;