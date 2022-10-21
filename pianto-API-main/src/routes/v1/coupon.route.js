const express = require('express');
const auth = require('../../middlewares/auth');
const couponController = require('../../controllers/coupon.controller');

const router = express.Router();

router
    .route('/')
    .post(auth('manageUsers'), couponController.createCoupon)
    .get(couponController.getCoupons);

router
    .route('/applyCoupon')
    .post(couponController.applyCoupon);

router
    .route('/:id')
    .get(couponController.getCoupon)
    .put(auth('manageUsers'), couponController.updateCoupon)
    .delete(auth('manageUsers'), couponController.deleteCoupon);

module.exports = router;
