const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const Service = require('../models/services.model');
const User = require('../models/user.model');
const _ = require('lodash');
const moment = require('moment');

const createService = catchAsync(async (req, res) => {
    const service = await Service.create(req.body);
    res.status(httpStatus.CREATED).send(service);
});

const getServices = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['name', 'type']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await Service.paginate(filter, options);
    res.send(result);
});

const getService = catchAsync(async (req, res) => {
    const service = await Service.findById(req.params.id);
    if (!service) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Item not found');
    }
    res.send(service);
});

const updateService = catchAsync(async (req, res) => {
    const service = await Service.findById(req.params.id);
    if (!service) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Setting not found');
    }
    Object.assign(service, req.body);
    await service.save();
    res.send(service);
});

const deleteService = catchAsync(async (req, res) => {
    const service = await Service.findById(req.params.id);
    if (!service) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Setting not found');
    }
    await service.remove();
    res.status(httpStatus.NO_CONTENT).send();
});

const getUserSlots = catchAsync(async (req, res) => {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user) {
        console.log('User not found');
        throw new ApiError(httpStatus.NO_CONTENT, 'Not user found');
    }
    res.send({slots: user.slots, name: user.name, id: user.id});
});

const getSlots = catchAsync(async (req, res) => {
    const postcode = req.body.postcode;
    const city = req.body.city.toLowerCase();

    // Check which users have this city in them and get them to check slots
    console.log('City', city, req.body);
    const users = await User.find({"city.name": city, "slots.available": true});
    if (!users) {
        console.log('No users found with these slots', users);
        throw new ApiError(httpStatus.NO_CONTENT, 'Slots not found');
    }
    res.send(users);
});

const getFutureSlots = catchAsync(async (req, res) => {
    const postcode = req.body.postcode;
    const city = req.body.city.toLowerCase();

    // Check which users have this city in them and get them to check slots
    console.log('City', city, req.body);
    let users = await User.find({"slots.city": city,"slots.available": true});
    if (!users) {
        console.log('No users found with these slots', users);
        throw new ApiError(httpStatus.NO_CONTENT, 'Slots not found');
    }
    for (const user of users){
        const slots = user.slots;
        user.slots = _.filter(slots, item => {
            console.log(user.email, item.date);
            return item.available && moment().isBefore(moment(item.date).startOf('day').add(1, 'day')) && item.city.includes(city);
        });
    }

    users = _.filter(users, user => {
        return (user.slots.length > 0);
    });

    res.send(users);
});

module.exports = {
    createService,
    getServices,
    getService,
    getUserSlots,
    updateService,
    deleteService,
    getSlots,
    getFutureSlots,
};
