const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const chargeSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        name_fi: {
            type: String,
            trim: true,
        },
        type: {
            type: String,
            required: true,
            trim: true,
        },
        value: {
            type: Number,
            required: true,
            trim: true
        },
        amountType: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
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

chargeSchema.plugin(paginate);


/**
 * @typedef Setting
 */
const Charge = mongoose.model('Charge', chargeSchema);

module.exports = Charge;
