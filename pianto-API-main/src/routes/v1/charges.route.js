const express = require('express');
const auth = require('../../middlewares/auth');
const controller = require('../../controllers/charge.controller');

const router = express.Router();

router
    .route('/')
    .post(auth('manageUsers'), controller.createCharge)
    .get(controller.getCharges);

router
    .route('/:id')
    .get(controller.getCharge)
    .put(auth('manageUsers'), controller.updateCharge)
    .delete(auth('manageUsers'), controller.deleteCharge);

module.exports = router;
