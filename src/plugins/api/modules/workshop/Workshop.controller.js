import Workshop from './Workshop.model';
import Resource from '../resource/Resource.model';
import response from '../../../../lib/response.handler';
import _ from 'lodash';
import User from '../user/User.model.js'
import Notification from '../user/Notification.model';
import enums from '../enums';

export async function createWorkshop(req, res, next) {
  if (req.user && req.body) {
    const workhopDetails = {
      name: req.body.name,
      description: req.body.description,
      image_url: req.body.imageurl,
      createdby: req.user._id,
      amount: req.body.amount,
      resource: req.body.resource
    }
    let workshop = new Workshop(workhopDetails);
    await workshop.save()
    .then(async () => {
      await Resource.findByIdAndUpdate(req.body.resource, { isedited: true });
      response.sendRespond(res, workshop);
      next();
    })
    .catch(error => {
      response.handleError(res, error.message);
      next();
    });
  }
}

export async function updateWorkshop(req, res, next) {
  if (req.body && req.body._id) {
    let workshop = await Workshop.findById(req.body._id);
    if (!workshop) {
      response.handleError(res, 'Workshop  not found');
      return;
    }
    let workshopUpdateData = {
      name: req.body.name,
      description: req.body.description,
      image_url: req.body.image_url
    };
    
    await Workshop.findByIdAndUpdate(req.body._id, workshopUpdateData)
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

export async function deleteWorkshop(req, res, next) {
  if (req.params && req.params.id) {
    const workshop = await Workshop.findByIdAndDelete(req.workshop.id);
    response.sendRespond(res, workshop);
    next();
  } else {
    response.handleError(req, 'Parameter id is required');
    next();
  }
}

export async function getWorkshopsForAdmin(req, res, next) {
  if (req.user && _.isEqual(req.user.role, 'ROLE_ADMIN')) {
    await Workshop.find({})
    .populate('attendees', '_id firstname lastname description imageurl email phonenumber')
    .populate('createdby', '_id firstname lastname description imageurl email phonenumber')
    .populate({ 
      path: 'resource', 
      populate:{ path: 'resourcepersons', model: 'users', select: '_id firstname lastname email phonenumber imageurl description'}
    })
    .then((data) => {
      return res.status(200).json(data)
    })
    .catch(error => {
      return res.status(500).json(error.messge);
    });
  }
}

export async function getWorkshopById(req, res, next) {
  if (req.params && req.params.id) {
    await Workshop.findById(req.params.id)
    .populate('attendees', '_id firstname lastname description imageurl email phonenumber ')
    .populate({ 
      path: 'resource', 
      populate:{ path: 'resourcepersons', model: 'users', select: '_id firstname lastname email phonenumber imageurl description'}
    })
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

export async function addAttendee(req, res, next) {
  if (req.user && req.body) {
    let workshop = await Workshop.findById(req.body._id);
    if (!workshop) {
      response.handleError(res, 'Workshop not found');
      return;
    }

    let notification_name = "";
    
    await Workshop.findByIdAndUpdate(req.body._id, { $push: {attendees: req.user._id}})
    .then( async () => {
      await User.findByIdAndUpdate({ _id: req.user._id }, { $push: {attending_workshops: req.body._id}})
    }).then(async () => {
      let data = await Workshop.findById(req.body._id)
      notification_name = data.name;
    }).then(async () => {
        let notificationDetail = {
          workshop: req.body._id,
          message: req.body.message + " " + notification_name,
          to: req.user._id,
          isarchive: false
        }
        let notification = new Notification(notificationDetail);
        await notification.save()
    }).then(() => {
      res.status(200).send({message: 'Conference Added Successfully.'});
    })
    .catch(error => {
      res.status(400).send({message: 'Error Occured.'});
    });
    return;
  }
}

export async function changeApproveStatus(req, res, next) {
  if (req.user && _.isEqual(req.user.role, enums.ROLE_ADMIN) && req.params && req.params.id) {
    await Workshop.findByIdAndUpdate(req.params.id, { isapproved: true })
    .then(data => {
      response.sendRespond(res, data);
      next();
    })
    .catch(error => {
      response.handleError(res, error.message);
    });
  } else {
    response.handleError(res, 'Only Admin can do these modifications');
    return;
  }
}

export async function getWorkshopsForHomePage(req, res, next) {
  await Workshop.find({ isapproved: true })
  .sort({ createdAt: -1 })
  .populate('attendees', '_id firstname lastname description imageurl email phonenumber ')
  .populate('createdby', '_id firstname lastname description imageurl email phonenumber')
  .populate({ 
    path: 'resource', 
    populate:{ path: 'resourcepersons', model: 'users', select: '_id firstname lastname email phonenumber imageurl description'}
  })
  .limit(1)
  .then((data) => {
    return res.status(200).json(data)
  })
  .catch(error => {
    return res.status(500).json(error.message)
  });
}