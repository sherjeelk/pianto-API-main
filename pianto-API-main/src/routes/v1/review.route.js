const express = require('express');
const auth = require('../../middlewares/auth');
const reviewController = require('../../controllers/review.controller');

const router = express.Router();

router
    .route('/')
    .post(reviewController.createReview)
    .get(reviewController.getReviewList);

router
    .route('/reviewsByDate')
    .get(reviewController.getReviewByDate);

router
    .route('/:id')
    .get(reviewController.getReviewItem)
    .put(reviewController.updateReview)
    .delete(reviewController.deleteReview);

module.exports = router;
