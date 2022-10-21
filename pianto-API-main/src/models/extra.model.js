const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const extraSchema = mongoose.Schema(
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
            required: false,
            trim: true,
        },
        value: {
            type: String,
            required: false,
            trim: true
        },
        valueNum: {
            type: Number,
            required: false,
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

extraSchema.plugin(paginate);


/**
 * @typedef Setting
 */
const Extra = mongoose.model('Extra', extraSchema);

module.exports = Extra;
