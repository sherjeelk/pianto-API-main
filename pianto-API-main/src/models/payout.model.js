const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const payoutSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        bank: {
            type: String,
            required: false,
            trim: true,
        },
        swift: {
            type: String,
            required: false,
            trim: true
        },
        user: {
            type: String,
            required: true,
            trim: true
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

payoutSchema.plugin(paginate);


/**
 * @typedef Setting
 */
const Payout = mongoose.model('Payout', payoutSchema);

module.exports = Payout;
