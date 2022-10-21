const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const reviewSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        comment: {
            type: String,
            required: false,
            trim: true,
        },
        rating: {
            type: Number,
            required: false,
            trim: true
        },
        user: {
            type: String,
            required: true,
            trim: true
        },
        order: {
            type: String,
            required: true,
            trim: true
        },
        attributes: [{
            type: Object
        }],
        date: {
            type: Date,
            required: false,
            default: new Date()
        },
        enable: {
            type: Boolean,
            default: false,
        }
    },
    {
        timestamps: true,
    }
);

reviewSchema.plugin(paginate);


/**
 * @typedef Setting
 */
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
