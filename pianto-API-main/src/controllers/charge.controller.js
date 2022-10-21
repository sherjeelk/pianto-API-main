const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const Charge = require('../models/charges.model');

const createCharge = catchAsync(async (req, res) => {
    const charge = await Charge.create(req.body);
    res.status(httpStatus.CREATED).send(charge);
});

const getCharges = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['name', 'type']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await Charge.paginate(filter, options);
    res.send(result);
});

const getCharge = catchAsync(async (req, res) => {
    const charge = await Charge.findById(req.params.id);
    if (!charge) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Item not found');
    }
    res.send(charge);
});

const updateCharge = catchAsync(async (req, res) => {
    const charge = await Charge.findById(req.params.id);
    if (!charge) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Charge not found');
    }
    Object.assign(charge, req.body);
    await charge.save();
    res.send(charge);
});

const deleteCharge = catchAsync(async (req, res) => {
    const charge = await Charge.findById(req.params.id);
    if (!charge) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Charge not found');
    }
    await charge.remove();
    res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
    createCharge,
    getCharges,
    getCharge,
    updateCharge,
    deleteCharge,
};
