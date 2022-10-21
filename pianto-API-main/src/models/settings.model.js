const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const settingsSchema = mongoose.Schema(
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
    enable: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

settingsSchema.plugin(paginate);


/**
 * @typedef Setting
 */
const Setting = mongoose.model('Setting', settingsSchema);

module.exports = Setting;
