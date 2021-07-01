import jwt from 'jsonwebtoken';
import response from '../../lib/response.handler';

module.exports = async function auth(req, res, next) {
  try {
    const User = require('../api/modules/user/User.model');
    const token = req.header('Authorization');
    const decode = jwt.verify(token, 'conferenceSecret');
    const user = await User.findOne({ _id: decode._id, 'token': token });
    
    if (!user) {
      throw new Error('Please Authenticate to the System');
    }
    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    response.handleError(res, error.message);
  }
}
