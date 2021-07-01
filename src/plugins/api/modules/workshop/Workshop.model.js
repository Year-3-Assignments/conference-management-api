import mongoose, { Schema } from 'mongoose';

const WorkshopSchema = new Schema({
  name: {type: String, required: true,  trim: true},
  description: { type: String,  required: [true, 'Workshop speaker description'], trim: true },
  image_url: { type: String, required: true, trim: true },
  amount: { type: Number, required: true },
  resource: { type: Schema.Types.ObjectId, required: true, ref: 'resources' },
  attendees:[{ type: Schema.Types.ObjectId, required: false, ref: 'users' }],
  createdby: { type: Schema.Types.ObjectId, required: true, ref: 'users' },
  isapproved: { type: Boolean, required: false, default: false }
}, {
  timestamps: true
});
const Workshop = mongoose.model('workshops', WorkshopSchema);
export default Workshop;