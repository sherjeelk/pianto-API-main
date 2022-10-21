const httpStatus = require('http-status');
const moment = require('moment');
const _ = require('lodash');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const Order = require('../models/order.model');
const User = require('../models/user.model');

const createExtra = catchAsync(async (req, res) => {
    const extra = await Extra.create(req.body);
    res.status(httpStatus.CREATED).send(extra);
});

const getExtraList = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['name', 'type']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await Extra.paginate(filter, options);
    res.send(result);
});

const getOrderTotalMonthWise = catchAsync(async (req, res) => {
    const today = moment().toDate();
    const previous = moment().startOf('day').subtract(12, 'months');
    const orders = await Order.find({
        created: {
            $gte: previous.toDate(),
            $lte: today.toDate()
        }
    });


    for (const item of orders){
        if (moment(item.created).month()){

        }
    }



    if (!extra) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Item not found');
    }
    res.send(extra);
});

const updateExtra = catchAsync(async (req, res) => {
    const extra = await Extra.findById(req.params.id);
    if (!extra) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Charge not found');
    }
    Object.assign(pricing, req.body);
    await extra.save();
    res.send(extra);
});

const deleteExtra = catchAsync(async (req, res) => {
    const extra = await Extra.findById(req.params.id);
    if (!extra) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Charge not found');
    }
    await extra.remove();
    res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
    createExtra,
    getExtraList,
    getExtraItem,
    updateExtra,
    deleteExtra,
};
