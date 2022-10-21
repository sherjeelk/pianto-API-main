const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const Coupon = require('../models/coupon.model');

const createCoupon = catchAsync(async (req, res) => {
    const service = await Coupon.create(req.body);
    res.status(httpStatus.CREATED).send(service);
});

const getCoupons = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['name', 'value', 'type']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await Coupon.paginate(filter, options);
    res.send(result);
});

const getCoupon = catchAsync(async (req, res) => {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Item not found');
    }
    res.send(coupon);
});

const applyCoupon = catchAsync(async (req, res) => {
    const couponName = req.body.coupon.toLowerCase();
    const total = req.body.total;
    const coupon = await Coupon.findOne({name: couponName});
    if (!coupon) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Coupon not found');
    }
    const discount = coupon.discount;
    const response = {};
    if (coupon.type === 'percentage'){
        response.discount = (total/100)*discount;
    } else {
        response.discount = discount;
    }
    response.msg = 'Coupon applied successfully!';

    res.send(response);
});

const updateCoupon = catchAsync(async (req, res) => {
    const service = await Coupon.findById(req.params.id);
    if (!service) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Setting not found');
    }
    Object.assign(service, req.body);
    await service.save();
    res.send(service);
});

const deleteCoupon = catchAsync(async (req, res) => {
    const service = await Coupon.findById(req.params.id);
    if (!service) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Setting not found');
    }
    await service.remove();
    res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
    createCoupon,
    getCoupons,
    getCoupon,
    applyCoupon,
    updateCoupon,
    deleteCoupon,
};
