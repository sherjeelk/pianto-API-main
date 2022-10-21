const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const Setting = require('../models/settings.model');

const createSetting = catchAsync(async (req, res) => {
    const setting = await Setting.create(req.body);
    res.status(httpStatus.CREATED).send(setting);
});

const getSettings = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['name', 'type']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await Setting.paginate(filter, options);
    res.send(result);
});

const getSetting = catchAsync(async (req, res) => {
    const setting = await Setting.findById(req.params.id);
    if (!setting) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Item not found');
    }
    res.send(setting);
});

const updateSetting = catchAsync(async (req, res) => {
    const setting = await Setting.findById(req.params.id);
    if (!setting) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Setting not found');
    }
    Object.assign(setting, req.body);
    await setting.save();
    res.send(setting);
});

const deleteSetting = catchAsync(async (req, res) => {
    const setting = await Setting.findById(req.params.id);
    if (!setting) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Setting not found');
    }
    await setting.remove();
    res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
    createSetting,
    getSettings,
    getSetting,
    updateSetting,
    deleteSetting,
};
