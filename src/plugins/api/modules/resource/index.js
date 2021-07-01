let express = require('express');
let controller = require('./Resource.controller');
let auth = require('../../../auth/auth');
const router = express.Router();

module.exports = function (app, db) {
  router.post('/create', auth, controller.createResource);
  router.get('/', controller.getAllResouces);
  router.get('/resource', auth, controller.getUserResorces);
  router.get('/:id', controller.getResourceById);
  router.put('/update', auth, controller.updateResource);
  router.put('/status/:id', auth, controller.changeResourceStatus);
  router.delete('/remove/:id', auth, controller.deleteResource);
  router.put('/paid/:id', auth, controller.makeResourcePaid);
  router.get('/editor/resources', auth, controller.getResourcesForEditor);
  router.get('/approvedresources', auth, controller.getAllApprovedRespources);
  router.get('/latestapprovedresource', auth, controller.latestApprovedResource);

  return { router: router };
}