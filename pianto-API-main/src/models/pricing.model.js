const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const pricingSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        }, name_fi: {
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

pricingSchema.plugin(paginate);


/**
 * @typedef Setting
 */
const Pricing = mongoose.model('Pricing', pricingSchema);

module.exports = Pricing;
