const express = require('express');
const auth = require('../../middlewares/auth');
const orderController = require('../../controllers/pricing.controller');

const router = express.Router();

router
    .route('/')
    .post(auth('manageUsers'), orderController.createPricing)
    .get(orderController.getPricingList);

router
    .route('/:id')
    .get(orderController.getPricing)
    .put(auth('manageUsers'), orderController.updatePricing)
    .delete(auth('manageUsers'), orderController.deletePricing);

module.exports = router;
