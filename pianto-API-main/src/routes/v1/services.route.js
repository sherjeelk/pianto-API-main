const express = require('express');
const auth = require('../../middlewares/auth');
const serviceController = require('../../controllers/service.controller');

const router = express.Router();

router
    .route('/')
    .post(auth('manageUsers'), serviceController.createService)
    .get(serviceController.getServices);

router
    .route('/:id')
    .get(serviceController.getService)
    .put(auth('manageUsers'), serviceController.updateService)
    .delete(auth('manageUsers'), serviceController.deleteService);

router
    .route('/slots')
    .post(serviceController.getSlots)

router
    .route('/futureSlots')
    .post(serviceController.getFutureSlots)

router
    .route('/slots/:id')
    .get(serviceController.getUserSlots)

module.exports = router;
