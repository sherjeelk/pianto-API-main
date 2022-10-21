const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const Review = require('../models/review.model');

const createReview = catchAsync(async (req, res) => {
    const review = await Review.create(req.body);
    res.status(httpStatus.CREATED).send(review);
});

const getReviewList = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['name', 'order', 'rating','user']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await Review.paginate(filter, options);
    res.send(result);
});

const searchReviewList = catchAsync(async (req, res) => {
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
    const reviews = query.length === 0 ? await Review.find() : await Review.find({$and: query});
    if (!reviews) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Payout with this query not found');
    }
    res.send(reviews);
});

const getReviewItem = catchAsync(async (req, res) => {
    const payout = await Review.findById(req.params.id);
    if (!payout) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Item not found');
    }
    res.send(payout);
});

const getReviewByDate = catchAsync(async (req, res) => {
    const less = req.query.lte;
    const higher = req.query.gte;
    const user = req.query.user;
    const result = await Review.find({date: {$gte: higher, $lt: less}, user: user});
    res.send(result);
});

const updateReview = catchAsync(async (req, res) => {
    const review = await Review.findById(req.params.id);
    if (!review) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Review not found');
    }
    Object.assign(review, req.body);
    await review.save();
    res.send(review);
});

const deleteReview = catchAsync(async (req, res) => {
    const review = await Review.findById(req.params.id);
    if (!review) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Review not found');
    }
    await review.remove();
    res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
    createReview,
    getReviewList,
    getReviewItem,
    updateReview,
    deleteReview,
    searchReviewList,
    getReviewByDate
};
