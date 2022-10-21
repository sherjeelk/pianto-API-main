const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const Payout = require('../models/payout.model');

const createPayout = catchAsync(async (req, res) => {
    const payout = await Payout.create(req.body);
    res.status(httpStatus.CREATED).send(payout);
});

const getPayoutList = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['name', 'user']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await Payout.paginate(filter, options);
    res.send(result);
});

const searchPayoutList = catchAsync(async (req, res) => {
    const body = req.body;
    const query = [];
    if (body){
        if (body.length > 0){
            for (const  item of body){
                const search = {};
                const key = Object.keys(item)[0];
                search[key] = {$regex: item[key], $options: "i" };
                query.push(search);
            }
        }
    }
    const payouts = query.length === 0 ? await Payout.find() : await Payout.find({$and: query});
    if (!payouts) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Payout with this query not found');
    }
    res.send(payouts);
});

const getPayoutItem = catchAsync(async (req, res) => {
    const payout = await Payout.findById(req.params.id);
    if (!payout) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Item not found');
    }
    res.send(payout);
});

const updatePayout = catchAsync(async (req, res) => {
    const payout = await Payout.findById(req.params.id);
    if (!payout) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Charge not found');
    }
    Object.assign(payout, req.body);
    await payout.save();
    res.send(payout);
});

const deletePayout = catchAsync(async (req, res) => {
    const payout = await Payout.findById(req.params.id);
    if (!payout) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Payout not found');
    }
    await payout.remove();
    res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
    createPayout,
    getPayoutList,
    getPayoutItem,
    updatePayout,
    deletePayout,
    searchPayoutList
};
