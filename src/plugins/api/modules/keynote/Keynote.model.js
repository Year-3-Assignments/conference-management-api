import mongoose, { Schema } from 'mongoose';

const KeynoteSchema = new Schema({
    title : { type: String, required: [false, 'Title should be provided'], trim: true },
    description: {  type: String, required: [true, 'Title should be provided'], trim: true },
    keynoteimageurl : { type: String, required: false, trim: true },
    createdby: { type: Schema.Types.ObjectId, required: true, ref: 'users' },
    resouce: { type:Schema.Types.ObjectId, required:true, ref:'resources' },
    status: { type: String, required: true, trim: false }
},
    {strict: false},
    {timestamps : true}
);
const Keynote = mongoose.model('keynotes',KeynoteSchema);

module.exports = Keynote;