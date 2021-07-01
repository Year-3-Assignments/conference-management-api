import Keynote from './Keynote.model';
import response from '../../../../lib/response.handler';
import _ from 'lodash';

//create new keynote
export async function createKeynote (req, res, next){
  if (req.body) {
    if (_.isEqual(req.user.role, 'ROLE_EDITOR')) {
      let keynote = new Keynote(req.body);
      await keynote.save()
      .then(() => {
        response.sendRespond(res, keynote);
        next();
      })
      .catch(error => {
        response.handleError(res, error.message);
        next();
      });
    } else {
      response.handleError(res, 'Only editor can create a keynote');
      return;
    }
  }
}

//get all keynote details
export async function getAllKeynotes(req, res, next) {
  await Keynote.find({})
  .populate({ path: 'resource', populate: { path: 'resourcepersons', model: 'users', select: 'firstname lastname email phonenumber description imageurl'}})
  .then((data) => {
    response.sendRespond(res, data);
    next();
  })
  .catch(error => {
    response.handleError(res, error.message);
    next();
  });
}

//get keynote details - core
export async function getKeynoteById(req, res, next) {
  if (req.params && req.params.id) {
    await Keynote.findById(req.params.id)
    .populate({ path: 'resource', populate: { path: 'resourcepersons', model: 'users', select: 'firstname lastname email phonenumber description imageurl'}})
    .then((data) => {
      response.sendRespond(res, data);
      next();
    })
    .catch(error => {
      response.handleError(res, error.message);
      next();
    });
  } else {
    response.sendNotFound(res, 'Key note id not found');
    return;
  }
}

// update user - core
export async function updateKeynote(req, res, next) {
  if (req.body) {
    if (_.isEqual(req.user.role, 'ROLE_EDITOR')) {
      let updateData = {
        title: req.body.title,
        keynoteimageurl: req.body.keynoteimageurl,
        description: req.body.description
      };
      const keynote = await keynote.findByIdAndUpdate(req.user._id, updateData);
      response.sendRespond(res, keynote);
      next();
    } else {
      response.handleError(res, 'Only editor can create a keynote');
      return;
    }
  } else {
    response.handleError(res, 'Please provide necessary fields');
    return;
  }
}

export async function changeKeynoteStatus(req, res, next) {
  if (req.user && req.params && req.params.id) {
    if (_.isEqual(req.user.role, 'ROLE_ADMIN')) {
      let status = null;
      let keynote = await Keynote.findById(req.params.id);
      if (!keynote) {
        response.handleError(res, 'Keynote not found');
        return;
      }

      if (_.isEqual(req.body.status, 'APPROVED')) {
        // mark keynote as approved
        status = 'APPROVED';

        // send a notification to relevent user
        let notificationData = {
          keynote: keynote._id,
          from: req.user._id,
          message: `Your keynote is approved by ${req.user.firstname}`,
          to: keynote.createdby,
          isarchive: false
        }
        let notification = new Notification(notificationData);
        await notification.save()
      }

      if (_.isEqual(req.body.status, 'PENDING')) {
        // mark keynote as pending
        status = 'PENDING';

        // send a notification to relevent user
        let notificationData = {
          keynote: keynote._id,
          from: req.user._id,
          message: `Your resources are rejected by ${req.user.firstname}`,
          to: keynote.createdby,
          isarchive: false
        }
        let notification = new Notification(notificationData);
        await notification.save()
      }

      await Keynote.findByIdAndUpdate(req.params.id, { status: status })
      .then(data => {
        response.sendRespond(res, data);
        next();
      })
      .catch(error => {
        response.handleError(res, error.message);
        next();
      });
    } else {
      response.handleError(res, 'Only Admin can change the status');
      next();
    }
  }
}

// delete keynote - core
export async function deleteKeynote(req, res, next) {
  if (req.params && req.params.id) {
    if (_.isEqual(req.user.role, 'ROLE_EDITOR')) {
      const keynote = await Keynote.findIdAndDelete(req.keynote.id);
      response.sendRespond(res, keynote);
      next();
    } else {
      response.handleError(res, 'Only Editor can delete the keynote');
      next();
    }
  } else {
    response.handleError(req, 'Parameter id is required');
    next();
  }
}






