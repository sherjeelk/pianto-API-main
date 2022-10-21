const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const Order = require('../models/order.model');
const { User } = require('../models');
const { emailService } = require('../services');
const { tokenService } = require('../services');
const moment = require('moment');

const createOrder = catchAsync(async (req, res) => {
    console.log('Create order', req.body);
    const order = await Order.create(req.body);
    res.status(httpStatus.CREATED).send(order);
});

const getOrders = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['name', 'type']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await Order.paginate(filter, options);
    res.send(result);
});

const searchOrders = catchAsync(async (req, res) => {
    const keyword = req.body.search;
    const searchKey = req.body.searchKey;
    console.log(req.body)   
    const result = await Order.find({[searchKey]: { "$regex": keyword, "$options": "i"}});
    res.send(result);
});

const myOrders = catchAsync(async (req, res) => {
    const user = await tokenService.getUser(req);
    console.log('UserId', user);
    const result = await Order.find({user: user});
    res.send(result);
});

const getOrder = catchAsync(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Item not found');
    }
    res.send(order);
});

const updateOrder = catchAsync(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Setting not found');
    }
    Object.assign(order, req.body);
    await order.save();
    res.send(order);
});

const cancelOrder = catchAsync(async (req, res) => {
    const order = await Order.findById(req.query.id);
    if (!order) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
    }
    order.status = 'CANCELLED';
    await order.save();
    if (order.serviceMan){
        const serviceMan = await User.findById(order.serviceMan);
        console.log('Service', serviceMan);
        for (const slot of serviceMan.slots){
            if (moment(slot.date).isSame(moment(order.date), 'day') && order.time === slot.from){
                console.log('Slot About to release', slot);
                slot.available = true;
                delete slot.booking
                delete slot.name;
                console.log('Slot Released', slot.date);
                break;
            }
        }
        serviceMan.markModified('slots');
        const save = await serviceMan.save();
        await emailService.sendEmail(serviceMan.email, 'Booking Cancelled', 'Hi, we regret to inform you that a booking is cancelled by customer, please check the app for more details! Order id #'+ order._id);
        if (serviceMan.fcmToken) {
            await emailService.sendNotification(serviceMan.fcmToken, 'Booking Cancelled', 'Hi, we regret ot inform you that a booking is cancelled by customer, please check orders for more details!');
        }
    }

    await emailService.sendEmail(order.email, 'Order Cancelled', 'Hi, your order is cancelled successfully! We will process your refund accordingly. Order id #'+ order._id);

    await emailService.sendEmail('markus@pianto.io', 'Booking Cancelled (ADMIN)', 'Hi, we regret ot inform you that a booking in cancelled by customer, please check the dashboard for more details! Order id #'+ order._id);

    res.send(order);
});

const placeOrder = catchAsync(async (req, res) => {
    const body = req.body;
    console.log('Placing Order', body);
    body.status = 'PENDING';

    // Changed as per advice of Jai for the changes of 21-May-2021
    if ((!req.body.time && moment().isSameOrAfter(moment(req.body.date))) && !req.body.contactCustomer){
        throw new ApiError(httpStatus.BAD_REQUEST, 'Only future date/time allowed!');
    }

    const order = await Order.create(body);
    if (!order) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Setting not found');
    }

    if (order.serviceMan){
        // Block slots
        const user = await User.findById(order.serviceMan);
        console.log('Slots Before', user.slots);
        for (const slot of user.slots){
            if (moment(slot.date).isSame(moment(order.date), 'day') && order.time === slot.from){
                console.log('Slot blocked', slot.date);
                slot.available = false;
                slot.booking = {
                    id: order._id,
                    name: order.name
                };
                slot.name = order.name;
                break;
            }
        }
        console.log('Slots after', user.slots);
        user.markModified('slots');
        await user.save();
    }

    res.send(order);
});

const placeExtOrder = catchAsync(async (req, res) => {
    const body = req.body;
    body.status = 'PENDING';
    body.date = new Date();
    const order = await Order.findById(req.query.id);
    console.log('Extended Order', body, order);
    if (!order) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
    }
    order.extended = true;
    order.additional = body;
    await order.save();
    res.send(order);
});

const updateExtOrder = catchAsync(async (req, res) => {
    const status = req.body.status === 1 ?  'PAYMENT_CONFIRMED' : 'PAYMENT_FAILED';
    const order = await Order.findById(req.body.id);
    console.log('Update Extended Order', req.body, order);
    if (!order) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
    }
    order.additional.status = status;
    order.markModified('additional');
    await order.save();
    if (req.body.status === 1) {
        // send email of order
        await emailService.sendEmail(order.email, 'Order Extended Successfully', 'Hi, your order is confirmed successfully! Order id #'+ order._id);
    } else {
        await emailService.sendEmail(order.email, 'Extended Order Failed', 'Hi, payment for your order is failed! Please try again. Order id #'+ order._id);
    }
    res.send(order);
});



const confirmOrder = catchAsync(async (req, res) => {
    const status = req.body.status === 1 ?  'PAYMENT_CONFIRMED' : 'PAYMENT_FAILED';
    const order = await Order.findById(req.body.id);
    console.log('Order Confirmed', req.body, order);
    if (!order) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Setting not found');
    }

    if (!req.body.payment && !req.body.paymentMethod){
        throw new ApiError(httpStatus.BAD_REQUEST, 'Payment Information Required!');
    }
    order.payment = req.body.payment;
    order.paymentMethod = req.body.paymentMethod;
    order.status = status;
    if (req.body.userId){
        order.user = req.body.userId;
    }
    await order.save();
    if (req.body.status === 1) {
        // send email of order
                  const services = [];
      
                for (const service of order.service) {
                    services.push(service.name);
                        }



      // await emailService.sendEmail(order.email, 'Order Confirmed', 'Hi, your order is confirmed successfully! Order id #'+ order._id);
                    await emailService.sendHtmlEmail(order.email, 'Booking Confirmed',  'Hi, your order is confirmed successfully! Order id #'+ order._id,  `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>th{height:40px}.t-center{text-align:center}.container{width:50%;margin:30px auto;background:white}@media (max-width: 600px){.container{width:95%;background:white}}hr{margin:30px 10%;color:#1d1d1d;background:#1d1d1d;height:1px}.user-details td{border:none;padding:3px}.card{box-shadow:0 4px 8px 0 rgba(0,0,0,0.2);transition:0.3s;background:white}.button{background:#a51fff;color:white;border-radius:8px;padding:12px 22px;font-size:16px;border:none}</style></head><body style="background: #eaf0f6"><div class="container" style="padding: 0"><div style="text-align: center;"> <img src="https://cdn2.hubspot.net/hub/9412756/hubfs/pianto%20(3).png?width=1200&upscale=true&name=pianto%20(3).png" style="width: 100%"></div></div><div class="container card"><div style="padding: 25px"><div class="t-center"><h2>Hei!</h2><h3>Kiitos tilauksestasi. Mahtavaa että olet valinnut meidät virittämään pianosi huippukuntoon!</h3></div><hr><div class="t-center"><h3>Tilauksesi yhteenveto</h3><h3 style="margin-top: 25px">Aika: ${order.time ? order.time : 'No time'}</h3><h3>Virittäjä: ${order.serviceMan ? order.serviceMan : 'We will contact you'}</h3><h3>Tilattu palvelu: ${services.toString()}</h3></div><div><h3 class="t-center"> Ennen viritysajankohtaa varmistathan, että soittimen luokse kulku on esteetön ja että mahdolliset ylimääräiset tavarat on otettu soittimen päältä pois. Näin nopeutamme ja helpotamme virittäjän työskentelyä.</h3></div><div class="t-center"> <a href="https://tilaus.pianto.io/"><button class="button">Vieraile verkkosivuilla</button></a></div><div style="display: flex;justify-content: space-around;"><div style="padding: 25px"> <img style="width: 100%" src="https://cdn2.hubspot.net/hub/9412756/hubfs/miksi-pianon-viritys-on-ta%CC%88rkea%CC%88-ja-kuinka-usein-se-tulisi-tehda%CC%88_.jpeg?width=520&upscale=true&name=miksi-pianon-viritys-on-ta%CC%88rkea%CC%88-ja-kuinka-usein-se-tulisi-tehda%CC%88_.jpeg" alt=""><h3> Miksi pianonviritys on tärkeä ja kuinka usein se tulisi tehdä?</h3><div class="t-center"> <a href="https://tilaus.pianto.io/"><button class="button">Vieraile verkkosivuilla</button></a></div></div><div style="padding: 25px"> <img style="width: 100%" src="https://cdn2.hubspot.net/hub/9412756/hubfs/Nimeton-suunn.malli-5-e1618940146353.png?width=462&upscale=true&name=Nimeton-suunn.malli-5-e1618940146353.png" alt=""><h3> Mikä on viritystaso ja mitä tarkoitetaan tasonkorjauksella?</h3><div class="t-center"> <a href="https://tilaus.pianto.io/"><button class="button">Vieraile verkkosivuilla</button></a></div></div></div><div class="t-center"> <img src="https://cdn2.hubspot.net/hub/9412756/hubfs/pianto.png?width=200&upscale=true&name=pianto.png" alt="" style="width: 100px"></div></div></div></body></html>`);

        if (order.serviceMan) {
            console.log('this is service man 2', order.serviceMan);
                console.log('this is order 2', order);


            const serviceMan = await User.findById(order.serviceMan);

   

            await emailService.sendEmail(serviceMan.email, 'Booking Received', 'Hi, a booking is received for please check the app for more details! Order id #'+ order._id);
                        

            console.log(serviceMan);
            if (serviceMan.fcmToken) {
                await emailService.sendNotification(serviceMan.fcmToken, 'New Booking', `Hi, you have received a new booking with Order id # ${order._id}, please check the application for more details.`);;
            }
        }

    } else {
        // Release slots
            console.log('this is service man', order.serviceMan);
                console.log('this is order 1', order);

        if (order.serviceMan){
            const user = await User.findById(order.serviceMan);
            for (const slot of user.slots){
                if (moment(slot.date).isSame(moment(order.date), 'day') && order.time === slot.from){
                    console.log('Slot blocked', slot.date);
                    slot.available = true;
                    delete slot.booking
                    delete slot.name;
                    break;
                }
            }
            console.log('Slots after', user.slots);
            user.markModified('slots');
            const save = await user.save();
        }
        await emailService.sendEmail(order.email, 'Order Failed', 'Hi, payment for your order is failed! Please try again. Order id #'+ order._id);
    }
    res.send(order);
});

const getOrderByDate = catchAsync(async (req, res) => {
    const less = req.query.lte;
    const higher = req.query.gte;
    const user = req.query.user;
    const result = await Order.find({date: {$gte: higher, $lt: less}, serviceMan: user});
    res.send(result);
});

const changeOrderStatus = catchAsync(async (req, res) => {
    const status = req.body.status;
    const questions = req.body.questions;
    const id = req.body.id;
    const notes = req.body.notes;
    console.log('Change order status', req.body);
    const order = await Order.findById(id);
    if (notes)
        order.cancellationNote = notes;

    if (status === 'COMPLETED'){
        order.questions = questions;
        await emailService.sendEmail(order.email, 'Order Completed', `Hi, your order is now completed, please rate your experience by clicking on this link <a href="http://tilaus.pianto.io/post-review/${order._id}">Review Experience</a>! Order id # ${order._id}`);
    } else if (status === 'REJECTED') {
        const user = await User.findById(order.serviceMan);
        for (const slot of user.slots){
            if (moment(slot.date).isSame(moment(order.date), 'day') && order.time === slot.from){
                slot.available = true;
                delete slot.booking;
                delete slot.name;
                break;
            }
        }
        await user.save();
        await emailService.sendEmail(order.email, 'Order Cancelled', `Hi, your order with Order Id# ${order._id} is cancelled by service man, please wait for resolution we will try to assign a new service man, sorry for the inconvenience.`);
        await emailService.sendEmail('markus@pianto.io', 'Cancelled By Service (ADMIN)', `Hi ADMIN, an order is cancelled by service man, please try to assign a new service man  for the order id: ${order._id}`);

    } else if (status === 'CANCELLED_BY_SERVICE'){
        const user = await User.findById(order.serviceMan);
        for (const slot of user.slots){
            if (moment(slot.date).isSame(moment(order.date), 'day') && order.time === slot.from){
                slot.available = true;
                delete slot.booking;
                delete slot.name;
                break;
            }
        }
        await user.save();
       // await emailService.sendEmail(order.email, 'Order Cancelled', `Hi, your booking is cancelled by Serice Man`);
    } else if (status === 'BOOKING_CONFIRMED'){
        await emailService.sendEmail(order.email, 'Order Confirmed', `Hi, your order is now confirmed by the technician, You are all set.`);
    }

    order.status = status;
    await order.save();
    res.send({status: 1, msg: "Order updated successfully!", order});
});


const deleteOrder = catchAsync(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Setting not found');
    }
    await order.remove();
    res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
    placeOrder,
    confirmOrder,
    createOrder,
    myOrders,
    getOrders,
    cancelOrder,
    searchOrders,
    getOrder,
    updateOrder,
    placeExtOrder,
    updateExtOrder,
    changeOrderStatus,
    deleteOrder,
    getOrderByDate
};
