import User from './User.model';
import RoleRequest from './RoleRequest.model';
import Notification from './Notification.model';
import response from '../../../../lib/response.handler';
import bcrypt from 'bcryptjs';
import _ from 'lodash';

// create new user - public
export async function createUser(req, res, next) {
  if (req.body && req.body.username) {
    let username = req.body.username;
    let user = await User.findOne({ username });
    if (user) {
      response.handleError(res, 'Username already taken');
      return;
    }
    const newUser = new User(req.body);
    await newUser.save();
    const token = await newUser.generateAuthToken();
    let responseData = {
      user_id: newUser._id,
      username: newUser.username,
      token: token,
      role: newUser.role
    }
    response.sendRespond(res, responseData);
    next();
  } else {
    response.handleError(res, 'Username is required');
  }
}

// login user - public
export async function userLogin(req, res, next) {
  if (req.body && req.body.username && req.body.password) {
    let { username, password } = req.body;
    let user = null;

    try {
      user = await User.findByUsernamePassword(username, password);
    } catch (error) {
      response.handleError(res, error.message);
    }

    if (user) {
      const token = await user.generateAuthToken();
      let responseData = {
        user_id: user._id,
        username: user.username,
        token: token,
        role: user.role
      };
      response.sendRespond(res, responseData);
      next();
    } else {
      response.sendNotFound(res);
    }
  } else {
    response.handleError(res, 'Username password required')
  }
}

// update user account - private
export async function updateUserAccount(req, res, next) {
  if (req.body) {
    let updateData = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      password: await bcrypt.hash(req.body.password, 8),
      phonenumber: req.body.phonenumber,
      imageurl: req.body.imageurl,
      description: req.body.description,
      role: req.body.role
    };
    const user = await User.findByIdAndUpdate(req.user.id, updateData);
    response.sendRespond(res, user);
    next();
  } else {
    response.handleError(res, 'Please provide necessary fields');
  }
}

export async function requestForRoleChange(req, res, next) {
  if (req.user) {
    const roleChange = new RoleRequest(req.body);
    await roleChange.save();
    const notificationData = {
      message: `Your request to become ${req.body.requestrole} is sent successfully`,
      to: req.user._id,
      isarchive: false
    }
    const notification = new Notification(notificationData);
    await notification.save();
    response.sendRespond(res, roleChange);
    next();
  } else {
    response.handleError(res, 'User have to register to the system');
  }
}

export async function getRoleRequests(req, res, next) {
  if (req.user && _.isEqual(req.user.role, 'ROLE_ADMIN')) {
    await RoleRequest.find({ isarchive: false })
    .populate('requestedby', '_id firstname lastname email phonenumber imageurl')
    .sort({ createdAt: 'desc' })
    .then(data => {
      response.sendRespond(res, data);
      next();
    })
    .catch(error => {
      response.handleError(res, error.message);
      next();
    });
  } else {
    response.handleError(res, 'Only admin can get these information');
  }
}

export async function approveRoleChangeRequest(req, res, next) {
  if (req.user && req.body && req.body.userId && req.body.role) {
    if (_.isEqual(req.user.role, 'ROLE_ADMIN')) {
      const user = await User.findById(req.body.userId);
      const userRole = await User.findByIdAndUpdate(req.body.userId, { role: req.body.role });
      const notificationData = {
        from: req.user._id,
        to: req.body.userId,
        message: `Hi ${user.firstname} ${user.lastname}, your role now changed to ${req.body.role}`,
        isarchive: false
      };
      const notification = await new Notification(notificationData);
      await notification.save();
      await RoleRequest.findByIdAndUpdate(req.body.requestid, { isarchive: true });
      response.sendRespond(res, userRole);
      next();
    } else {
      response.handleError(res, 'Only admin can change the role');
    }
  } else {
    response.handleError(res, 'Cannot change user role');
  }
}

export async function rejectRoleChangeRequest(req, res, next) {
  if (req.user && req.body && req.body.userId) {
    if (_.isEqual(req.user.role, 'ROLE_ADMIN')) {
      const user = await User.findById(req.body.userId);
      const notificationData = {
        from: req.user._id,
        to: req.body.userId,
        message: `Hi ${user.firstname} ${user.lastname}, your role change request has been rejected by the admin`,
        isarchive: false
      };
      const notification = await new Notification(notificationData);
      await notification.save();
      response.sendRespond(res, notification);
      next();
    } else {
      response.handleError(res, 'Cannot change user role');
    }
  }
}

// delete user account - private
export async function deleteUserAccount(req, res, next) {
  const user = await User.findByIdAndDelete(req.user.id);
  response.sendRespond(res, user);
  next();
}

// get user account - private
export function getUserAccount(req, res, next) {
  if (req.user) {
    response.sendRespond(res, req.user);
    next();
  } else {
    response.sendNotFound(res);
  }
}

// get notifications for user
export async function getUserNotifications(req, res, next) {
  if (req.user) {
    await Notification.find({ to: req.user._id, isarchive: false })
    .populate('from', '_id firstname lastname email imageurl')
    .populate('to', '_id firstname lastname email imageurl')
    .populate('resource', '_id name venue time description type resourceurls')
    .populate('conference', '_id name venue startdate enddate description')
    .populate('workshop', '_id name description time place')
    .sort({ createdAt: 'desc' })
    .then(data => {
      response.sendRespond(res, data);
      return;
    })
    .catch(error => {
      response.handleError(res, error.message);
      return;
    })
  }
}

export async function makeArchive(req, res, next) {
  if (req.user && req.params.id) {
    let notification = await Notification.findById(req.params.id);
    if (!notification) {
      response.handleError(res, 'No notifications');
      return;
    }

    if (_.isEqual(req.user._id, notification.to)) {
      await Notification.findByIdAndUpdate(req.params.id, { isarchive: true })
      .then(data => {
        response.sendRespond(res, data);
        return;
      })
      .catch(error => {
        response.handleError(res, error.message);
        return;
      })
    } else {
      response.handleError(res, 'This notification not belongs to you');
      return;
    }
  }
}

// get all admin accounts | private | admin only
export async function getAdminAccounts(req, res, next) {
  if (_.isEqual(req.user.role, 'ROLE_ADMIN')) {
    const adminAccounts = await User.find({ role: 'ROLE_ADMIN' });
    if (adminAccounts) {
      response.sendRespond(res, adminAccounts);
      next();
    } else {
      response.handleError(res, 'No admin accounts');
    }
  }
}

// get all reviwer accounts | private | admin only
export async function getReviewerAccounts(req, res, next) {
  if (_.isEqual(req.user.role, 'ROLE_ADMIN')) {
    const reviewerAccounts = await User.find({ role: 'ROLE_REVIEWER' });
    if (reviewerAccounts) {
      response.sendRespond(res, reviewerAccounts);
      next();
    } else {
      response.sendNotFound(res);
    }
  }
}

// get all editor accounts | private | admin only
export async function getEditorAccounts(req,res, next) {
  if (_.isEqual(req.user.role, 'ROLE_ADMIN')) {
    const editorAccounts = await User.find({ role: 'ROLE_EDITOR' });
    if (editorAccounts) {
      response.sendRespond(res, editorAccounts);
      next();
    } else {
      response.sendNotFound(res);
    }
  }
}

// get all user accounts | private | admin only
export async function getAllUserAccounts(req, res, next) {
  const researcherAccounts = await User.find({ role: 'ROLE_USER' });
  if (researcherAccounts) {
    response.sendRespond(res, researcherAccounts);
    next();
  } else {
    response.sendNotFound(res);
  }
}