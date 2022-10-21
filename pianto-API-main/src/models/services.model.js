const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const serviceSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        name_fi: {
            type: String,
            trim: true
        },
        desc: {
            type: String,
            required: true,
            trim: true,
        }, desc_fi: {
            type: String,
            trim: true
        },
        type: {
            type: String,
            required: true,
            trim: true,
        },
        price: {
            type: Number,
            required: true,
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

serviceSchema.plugin(paginate);


/**
 * @typedef Setting
 */
const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
