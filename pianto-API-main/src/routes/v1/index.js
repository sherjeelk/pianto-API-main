const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const settingRoute = require('./settings.route');
const serviceRoute = require('./services.route');
const docsRoute = require('./docs.route');
const couponsRoute = require('./coupon.route');
const chargesRoute = require('./charges.route');
const pricingRoute = require('./pricing.route');
const ordersRoute = require('./order.route');
const reviewsRoute = require('./review.route');
const extraRoute = require('./extra.route');
const payoutRoute = require('./payout.route');

const router = express.Router();

router.use('/auth', authRoute);
router.use('/users', userRoute);
router.use('/settings', settingRoute);
router.use('/services', serviceRoute);
router.use('/coupons', couponsRoute);
router.use('/orders', ordersRoute);
router.use('/reviews', reviewsRoute);
router.use('/payouts', payoutRoute);
router.use('/docs', docsRoute);
router.use('/pricing', pricingRoute);
router.use('/charges', chargesRoute);
router.use('/extras', extraRoute);

module.exports = router;
