  
let express = require('express');
let controller = require('./Keynote.controller');
let router = express.Router();
//const auth = require('../../../auth/auth');

module.exports = function (app, db) {
    router.post('/create', controller.createKeynote);
    router.put('/update', controller.updateKeynote);
    router.get('/', controller.getAllKeynotes);
    router.get('/:id', controller.getKeynoteById);
    router.delete('/delete', controller.deleteKeynote);
  return { router: router };
}