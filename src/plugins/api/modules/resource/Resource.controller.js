import Resource from './Resource.model';
import Payment from '../payment/Payment.model';
import Notification from '../user/Notification.model';
import response from '../../../../lib/response.handler';
import _ from 'lodash';

export async function createResource(req, res, next) {
  let resource = new Resource(req.body);
  await resource.save()
  .then((data) => {
    const notificationData = {
      from: '60df41db9a6b1d1c58f3f74f',
      message: `Dear ${req.user.firstname} ${req.user.lastname}, your resource request successfully sent to the reviewer`,
      to: req.user._id,
      isarchive: false
    }
    const notification = new Notification(notificationData);
    notification.save();
    return res.status(200).json(data);
  })
  .catch(error => {
    return res.status(500).json(error.message);
  });
}

export async function getUserResorces(req, res, next) {
  if (req.user) {
    await Resource.find({ createdby: req.user._id })
    .populate('createdby', '_id firstname lastname email username phonenumber imageurl description')
    .populate('resourcepersons', '_id firstname lastname email username phonenumber imageurl description')
    .then((data) => {
      response.sendRespond(res, data);
      return;
    })
    .catch(error => {
      response.handleError(res, error.message);
      return;
    });
  } else {
    response.handleError(res, 'Only authenticated user can access this route');
    return;
  }
}

export async function getResourcesForEditor(req, res, next) {
  await Resource.find({ ispaid: true, isedited: false })
  .populate('createdby', '_id firstname lastname email username phonenumber imageurl description')
  .populate('resourcepersons', '_id firstname lastname email username phonenumber imageurl description')
  .then((data) => {
    response.sendRespond(res, data);
    next();
  })
  .catch(error => {
    response.handleError(res, error.message);
    next();
  });
}

export async function updateResource(req, res, next) {
  if (req.body) {
    let resource = await Resource.findById(req.body._id);
    if (!resource) {
      response.handleError(res, 'Resource not found');
      return;
    }
    let resourceUpdateData = {
      name: req.body.name,
      venue: req.body.venue,
      time: req.body.time,
      description: req.body.description,
      resourceurls: req.body.resourceurls,
      amount: req.body.amount,
      resourcepersons: req.body.resourcepersons
    };
    
    await Resource.findByIdAndUpdate(req.body._id, resourceUpdateData)
    .then(data => {
      response.sendRespond(res, data);
      next();
    })
    .catch(error => {
      response.handleError(res, error.message);
      next();
    });
  }
}

export async function changeResourceStatus(req, res, next) {
  if (req.user && req.params && req.params.id) {
    if (_.isEqual(req.user.role, 'ROLE_REVIEWER')) {
      let status = null;
      let resource = await Resource.findById(req.params.id);
      if (!resource) {
        response.handleError(res, 'Resource not found');
        return;
      }

      if (_.isEqual(req.body.status, 'APPROVED')) {
        status = 'APPROVED';

        let notificationData = {
          resource: resource._id,
          from: req.user._id,
          message: req.body.message,
          to: resource.createdby,
          isarchive: false,
          payment: true,
          amount: req.body.amount
        }
        console.log(notificationData);
        let notification = new Notification(notificationData);
        await notification.save()
      }

      if (_.isEqual(req.body.status, 'PENDING')) {
        status = 'PENDING';

        let notificationData = {
          resource: resource._id,
          from: req.user._id,
          message: req.body.message,
          to: resource.createdby,
          isarchive: false
        }
        let notification = new Notification(notificationData);
        await notification.save()
      }

      if (_.isEqual(req.body.status, 'REJECTED')) {
        status = 'REJECTED';

        let notificationData = {
          resource: resource._id,
          from: req.user._id,
          message: req.body.message,
          to: resource.createdby,
          isarchive: false
        }
        let notification = new Notification(notificationData);
        await notification.save()
      }

      await Resource.findByIdAndUpdate(req.params.id, { status: status, reveiwedby: req.user._id })
      .then(data => {
        response.sendRespond(res, data);
        next();
      })
      .catch(error => {
        response.handleError(res, error.message);
        next();
      });
    } else {
      response.handleError(res, 'Only Reviewer can change the status');
      next();
    }
  }
}

export async function deleteResource(req, res, next) {
  if (req.params && req.params.id) {
    if (_.isEqual(req.user.role, 'ROLE_PRESENTER') || _.isEqual(req.user.role, 'ROLE_RESEARCHER')) {
      let resource = await Resource.findById(req.params.id);
      if (!resource) {
        response.handleError(res, 'Resource not found');
        return;
      }

      await Resource.findByIdAndDelete(req.params.id)
      .then(data => {
        response.sendRespond(res, data);
        next();
      })
      .catch(error => {
        response.handleError(res, error.message);
        next();
      });
    } else {
      response.handleError(res, 'Only presenter and researcher can delete their resources');
      return;
    }
  }
}

export async function makeResourcePaid(req, res, next) {
  if (req.params && req.params.id) {
    let resource = await Resource.findById(req.params.id);
    if (!resource) {
      response.handleError(res, 'Resource not found');
      return;
    }

    const paymentDetails = {
      resource: req.params.id,
      user: req.user._id,
      amount: req.body.amount
    };

    const payment = new Payment(paymentDetails);
    await payment.save();

    await Notification.findByIdAndUpdate(req.body.notificationId, { isarchive: true });

    const notificationData = {
      from: '60df41db9a6b1d1c58f3f74f',
      message: `Dear ${req.user.firstname}, your payment for resource is successful. Thank you`,
      to: req.user._id,
      isarchive: false
    }

    const notification = new Notification(notificationData);
    await notification.save();

    await Resource.findByIdAndUpdate(req.params.id, { ispaid: true })
    .then(data => {
      response.sendRespond(res, data);
      next();
    })
    .catch(error => {
      response.handleError(res, error.message);
      next();
    });
  } else {
    response.handleError(res, 'Please provide necessary fields');
    return;
  }
}

export async function getResourceById(req, res, next) {
  if (req.params && req.params.id) {
    await Resource.findById(req.params.id)
    .populate('createdby', '_id firstname lastname email username phonenumber imageurl description')
    .populate('resourcepersons', '_id firstname lastname email username phonenumber imageurl description')
    .then((data) => {
      response.sendRespond(res, data);
      next();
    })
    .catch(error => {
      response.handleError(res, error.message);
      next();
    });
  }
}

export async function getAllResouces(req, res, next) {
  await Resource.find({})
  .populate('createdby', '_id firstname lastname email username phonenumber imageurl description')
  .populate('resourcepersons', '_id firstname lastname email username phonenumber imageurl description')
  .then((data) => {
    response.sendRespond(res, data);
    next();
  })
  .catch(error => {
    response.handleError(res, error.message);
    next();
  });
}

export async function getAllApprovedRespources(req, res, next) {
  await Resource.find({ isAdminApproved: true })
  .populate('createdby', '_id firstname lastname email username phonenumber imageurl description')
  .populate('resourcepersons', '_id firstname lastname email username phonenumber imageurl description')
  .sort({ createdAt: 'asc' })
  .then((data) => {
    response.sendRespond(res, data);
    next();
  })
  .catch(error => {
    response.handleError(res, error.message);
    next();
  });
}

export async function latestApprovedResource(req, res, next) {
  await Resource.findOne({ isAdminApproved: true })
  .populate('createdby', '_id firstname lastname email username phonenumber imageurl description')
  .populate('resourcepersons', '_id firstname lastname email username phonenumber imageurl description')
  .sort({ createdAt: 'asc' })
  .then((data) => {
    response.sendRespond(res, data);
    next();
  })
  .catch(error => {
    response.handleError(res, error.message);
    next();
  });
}