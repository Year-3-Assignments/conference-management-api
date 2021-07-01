let express = require('express');
let controller = require('./Workshop.controller');
let router = express.Router();
const auth = require('../../../auth/auth');

module.exports = function (app, db) {
  router.post('/create', auth , controller.createWorkshop);
  router.get('/:id', controller.getWorkshopById);
  router.get('/workshop/home', controller.getWorkshopsForHomePage);
  router.put('/update',auth, controller.updateWorkshop);
  router.put('/addattendee', auth, controller.addAttendee);
  router.put('/admin/status/:id', auth, controller.changeApproveStatus);
  router.delete('/remove/:id', auth, controller.deleteWorkshop);
  router.get('/', auth, controller.getWorkshopsForAdmin);

  return { router: router }
}