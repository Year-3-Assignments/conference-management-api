import mongoose, { Schema } from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const UserSchema = new Schema({
  firstname: { type: String, required: [true, 'Name should be provided'], trim: true },
  lastname: { type: String, required: [true, 'Name should be provided'], trim: true },
  email: { type: String, required: [true, 'Email must be provided'], trim: true },
  username: { type: String, required: [true, 'Username must be provided'], trim: true },
  password: { type: String, required: [true, 'Password must be provided'], trim: true },
  phonenumber: { type: String, required: [true, 'Phone must be provided'], trim: true },
  imageurl: { type: String, required: false, trim: true },
  description: { type: String, required: false, trim: true },
  role: { type: String, required: false, trim: true },
  conferences: [{ type: Schema.Types.ObjectId, required: false, ref: 'conferences' }],
  workshops:  [{ type: Schema.Types.ObjectId, required: false, ref: 'workshops' }],
  attending_conferences:  [{ type: Schema.Types.ObjectId, required: false, ref: 'conferences' }],
  attending_workshops: [{ type: Schema.Types.ObjectId, required: false, ref: 'workshops' }],
  token: { type: String }
}, {
  strict: false,
  timestamps: true
});

// encrypt the password
UserSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

// generate authentication token
UserSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id}, 'conferenceSecret');
  user.token = token;
  await user.save();
  return token;
}

// find user by email & password
UserSchema.statics.findByUsernamePassword = async function (username, password) {
  const user = await User.findOne({ username });
  if (!user) {
    throw new Error('User not found');
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Password is not matched');
  }
  return user;
}

const User = mongoose.model('users', UserSchema);

module.exports = User;