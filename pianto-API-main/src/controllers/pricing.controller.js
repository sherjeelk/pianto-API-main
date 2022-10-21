const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const Pricing = require('../models/pricing.model');

const createPricing = catchAsync(async (req, res) => {
    const charge = await Pricing.create(req.body);
    res.status(httpStatus.CREATED).send(charge);
});

const getPricingList = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['name', 'type']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await Pricing.paginate(filter, options);
    res.send(result);
});

const getPricing = catchAsync(async (req, res) => {
    const pricing = await Pricing.findById(req.params.id);
    if (!pricing) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Item not found');
    }
    res.send(pricing);
});

const updatePricing = catchAsync(async (req, res) => {
    const pricing = await Pricing.findById(req.params.id);
    if (!pricing) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Charge not found');
    }
    Object.assign(pricing, req.body);
    await pricing.save();
    res.send(pricing);
});

const deletePricing = catchAsync(async (req, res) => {
    const pricing = await Pricing.findById(req.params.id);
    if (!pricing) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Charge not found');
    }
    await pricing.remove();
    res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
    createPricing,
    getPricingList,
    getPricing,
    updatePricing,
    deletePricing,
};
