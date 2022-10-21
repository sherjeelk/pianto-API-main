const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const Extra = require('../models/extra.model');
const { emailService } = require('../services');
const { userService } = require('../services');

const createExtra = catchAsync(async (req, res) => {
    const extra = await Extra.create(req.body);
    res.status(httpStatus.CREATED).send(extra);
});

const getExtraList = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['name', 'type']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await Extra.paginate(filter, options);
    res.send(result);
});

const searchExtraList = catchAsync(async (req, res) => {
    const body = req.body;
    const query = [];
    if (body){
        if (body.length > 0){
            for (const  item of body){
                const search = {};
                const key = Object.keys(item)[0];
                search[key] = {$regex: item[key], $options: "i" };
                query.push(search);
            }
        }
    }
    const extras = query.length === 0 ? await Extra.find() : await Extra.find({$and: query});
    if (!extras) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Extra with this query not found');
    }
    res.send(extras);
});

const getExtraItem = catchAsync(async (req, res) => {
    const extra = await Extra.findById(req.params.id);
    if (!extra) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Item not found');
    }
    res.send(extra);
});

const updateExtra = catchAsync(async (req, res) => {
    const extra = await Extra.findById(req.params.id);
    if (!extra) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Charge not found');
    }
    Object.assign(extra, req.body);
    await extra.save();
    res.send(extra);
});

const deleteExtra = catchAsync(async (req, res) => {
    const extra = await Extra.findById(req.params.id);
    if (!extra) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Charge not found');
    }
    await extra.remove();
    res.status(httpStatus.NO_CONTENT).send();
});

const sendEmail = catchAsync(async (req, res) => {
    const email = req.body.email;
    const subject = req.body.subject;
    const text = req.body.text;
    await emailService.sendEmail(email, subject, text);
    res.send({status: 1, msg: 'Email sent successfully!'});
});

 // test html email
const sendHtmlEmail = catchAsync(async (req, res) => {
    const email = req.body.email;
    const subject = req.body.subject;
    const text = req.body.text;
    let html = req.body.html;
console.log(html);
    html = html.replace(/&lt;/g, '<');
    console.log(html);
    await emailService.sendHtmlEmail(email, subject, text, html);
    res.send({status: 1, msg: 'Email sent successfully!'});
});

const sendNotification = catchAsync(async (req, res) => {
    const title = req.body.title;
    const text = req.body.text;
    const userId = req.body.user;
    const user = await userService.getUserById(userId);
    const token = [user.fcmToken];
    console.log('Email', user.email, ' Token : ', user.fcmToken, token);
    await emailService.sendNotification(token, title, text);
    res.send({status: 1, msg: 'Notification sent successfully!'});
});	

module.exports = {
    createExtra,
    getExtraList,
    getExtraItem,
    updateExtra,
    deleteExtra,
    sendEmail,
    sendHtmlEmail,
    searchExtraList,
    sendNotification
};
