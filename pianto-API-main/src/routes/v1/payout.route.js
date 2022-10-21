const express = require('express');
const auth = require('../../middlewares/auth');
const payoutController = require('../../controllers/payout.controller');

const router = express.Router();

router
    .route('/')
    .post(payoutController.createPayout)
    .get(payoutController.getPayoutList);

router
    .route('/:id')
    .get(payoutController.getPayoutItem)
    .put(payoutController.updatePayout)
    .delete(payoutController.deletePayout);

module.exports = router;
