const mongoose = require('mongoose');
const {toJSON, paginate} = require('./plugins');

const orderSchema = mongoose.Schema(
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
        pianoName: {
            type: String,
            trim: true
        },
        serial: {
            type: String,
            trim: true
        },
        service: {
            type: Object,
            trim: true
        },
        total: {
            type: Number,
            default: 0
        },
        address: {
            type: String,
            trim: true
        },
        city: {
            type: String,
            trim: true
        },
        postcode: {
            type: String,
            trim: true
        },
        email: {
            type: String,
            trim: true
        },
        phone: {
            type: String,
            trim: true
        },
        time: {
            type: String,
            trim: true
        },
        paymentMethod: {
            type: String,
            trim: true
        },
        discount: {
            type: Number,
        },
        subtotal: {
            type: Number,
        },
        coupon: {
            type: String,
            trim: true
        },
        serviceMan: {
            type: String,
            trim: true
        },
        created: {
            type: Date,
            default: new Date()
        },
        date: {
            type: Date,
            required: false,
        },
        lastService: {
            type: String
        },
        status: {
            type: String,
            required: true
        },
        payment: [{
            type: Object
        }],
        user: {
            type: String,
            required: false
        },
        questions: [{
            type: Object
        }],
        cancellationNote: {
            type: String
        },
        charges: {
            type: Object
        },
        extended: {
            type: Boolean,
            default: false
        },
        additional: {
            type: Object
        },
        reminder: {
            type: Object
        },
        technician: {
            type: String
        },
        notes: {
            type: String
        },
        contactCustomer: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
    }
);

orderSchema.plugin(paginate);


/**
 * @typedef Setting
 */
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
