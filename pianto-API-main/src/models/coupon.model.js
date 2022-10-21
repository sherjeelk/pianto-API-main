const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const couponSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        type: {
            type: String,
            required: true,
            trim: true,
        },
        value: {
            type: String,
            required: true,
            trim: true
        },
        discount: {
          type: Number,
          required: true
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

couponSchema.plugin(paginate);


/**
 * @typedef Setting
 */
const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
