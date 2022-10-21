const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');
const { authLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');
const User = require('./models/user.model');
const Order = require('./models/order.model');
const email = require('./services/email.service');
const moment = require('moment');

const app = express();

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}

// v1 api routes
app.use('/v1', routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);
//*/59 * * * *

const CronJob = require('cron').CronJob;
const job = new CronJob('*/30 * * * *', async function() {
  console.log('RUNNING CRON FOR SCHEDULED TASKS');
  const date = moment().subtract(28, 'hours');
  const users = await User.find({created: {$gte: date.toDate()}, used: false});
  const pendingOrders = await Order.find({status: 'PENDING', createdAt: {$lte: moment().subtract(10, 'minutes').toDate()}});
  console.log("PENDING ORDERS", pendingOrders);
  // Release slot and mark it as payment fail
  for (const order of pendingOrders){
    if (order.serviceMan){
    const serviceMan = await User.findById(order.serviceMan);
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
    }
    order.status = 'PAYMENT_FAILED';
    await order.save();
  }

  // console.log(users);
  for (const user of users){
    if (user.emailCount){
      const firstDiff = moment().diff(moment(user.created), 'hours');
      const secondDiff = moment().diff(moment(user.emailCount.firstTime), 'hours');
      const thirdDiff = moment().diff(moment(user.emailCount.secondTime), 'hours');
    const emailHtml = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>th{height:40px}.t-center{text-align:center}.container{width:50%;margin:30px auto;background:white}@media (max-width: 600px){.container{width:95%;background:white}}hr{margin:30px 10%;color:#1d1d1d;background:#1d1d1d;height:1px}.user-details td{border:none;padding:3px}.card{box-shadow:0 4px 8px 0 rgba(0,0,0,0.2);transition:0.3s;background:white}.button{background:#a51fff;color:white;border-radius:8px;padding:12px 22px;font-size:16px;border:none}</style></head><body style="background: #eaf0f6"><div class="container" style="padding: 0"><div style="text-align: center;"> <img src="https://cdn2.hubspot.net/hub/9412756/hubfs/pianto%20(3).png?width=1200&upscale=true&name=pianto%20(3).png" style="width: 100%"></div></div><div class="container card"><div style="padding: 25px"><div><h3 class="t-center"> Pianto toivottaa sinut tervetulleeksi!</h3><h3 style="margin-top: 20px;text-align: center"> Käythän vielä aktivoimassa käyttäjätilisi luomalla salasanan, jotta pystyt jatkossa seuraamaan tilauksiasi kätevästi yhdestä paikasta.</h3></div><hr><div class="t-center"> <a href="https://tilaus.pianto.io/forgot-password"><button class="button">Luo salasana</button></a></div><div style="display: flex"><div style="padding: 25px"> <img style="width: 100%" src="https://cdn2.hubspot.net/hub/9412756/hubfs/miksi-pianon-viritys-on-ta%CC%88rkea%CC%88-ja-kuinka-usein-se-tulisi-tehda%CC%88_.jpeg?width=520&upscale=true&name=miksi-pianon-viritys-on-ta%CC%88rkea%CC%88-ja-kuinka-usein-se-tulisi-tehda%CC%88_.jpeg" alt=""><h3> Miksi pianonviritys on tärkeä ja kuinka usein se tulisi tehdä?</h3><div class="t-center"> <a href="https://tilaus.pianto.io/"><button class="button">Vieraile verkkosivuilla</button></a></div></div><div style="padding: 25px"> <img style="width: 100%" src="https://cdn2.hubspot.net/hub/9412756/hubfs/Nimeton-suunn.malli-5-e1618940146353.png?width=462&upscale=true&name=Nimeton-suunn.malli-5-e1618940146353.png" alt=""><h3> Mikä on viritystaso ja mitä tarkoitetaan tasonkorjauksella?</h3><div class="t-center"> <a href="https://tilaus.pianto.io/"><button class="button">Vieraile verkkosivuilla</button></a></div></div></div><div class="t-center"> <img src="https://cdn2.hubspot.net/hub/9412756/hubfs/pianto.png?width=200&upscale=true&name=pianto.png" alt="" style="width: 100px"></div></div></div></body></html>` 

      console.log('User', user.name, user.emailCount, firstDiff, secondDiff, thirdDiff);
      if(!user.emailCount.first && firstDiff >= 4){
        // send first email
        user.emailCount.first = true;
        user.emailCount.firstTime = new Date();
        user.markModified('emailCount');
        await user.save();
        await email.sendHtmlEmail(user.email, 'Login Reminder', 'Hi, we just wanted to inform you, that you can manage your order from your pianto account. Please login on tilaus.pianto.io', emailHtml );
        console.log('Need to send first email!');
      } else if (!user.emailCount.second && secondDiff >= 12){
        user.emailCount.second = true;
        user.emailCount.secondTime = new Date();
        console.log('Need to send second email!');
        user.markModified('emailCount');
        await user.save();
        await email.sendHtmlEmail(user.email, 'Login Reminder', 'Hi, we just wanted to inform you, that you can manage your order from your pianto account. Please login on tilaus.pianto.io', emailHtml );
        // send second email
      } else if (!user.emailCount.third && thirdDiff >= 24){
        user.emailCount.third = true;
        user.emailCount.thirdTime = new Date();
        console.log('Need to send third email!');
        user.markModified('emailCount');
        await user.save();
        await email.sendHtmlEmail(user.email, 'Login Reminder', 'Hi, we just wanted to inform you, that you can manage your order from your pianto account. Please login on tilaus.pianto.io', emailHtml );
        // send third email
      }
    } else {
      user.emailCount = {
        first: false,
        firstTime: new Date(),
        second: false,
        secondTime: new Date(),
        third: false,
        thirdTime: new Date()
      };
      user.markModified('emailCount');
      await user.save();
    }
  }

  const remindDate = moment().add(12, 'hours');
  const orders = await Order.find({date: {$lte: remindDate.toDate(), $gte: new Date()}});
  for (const order of orders){
      if (order.reminder){
        const secondDiff = moment().diff(moment(order.reminder.firstTime), 'hours');
        console.log('Order', order.name, order.reminder);

        if(!order.reminder.first){
          // send first email
          order.reminder.first = true;
          order.reminder.firstTime = new Date();
          order.markModified('reminder');
          await order.save();
          if (order.serviceMan)
          await email.sendNotification(order.serviceMan, 'Service Reminder', `Hi, we just wanted you to inform you that you have a service request for today with order id# ${order.id}`);
          console.log('Need to send first email of Service day!');
        } else if (!order.reminder.second && secondDiff >= 12){
          order.reminder.second = true;
          order.reminder.secondTime = new Date();
          order.markModified('reminder');
          await order.save();
          if (order.serviceMan)
            await email.sendNotification(order.serviceMan, 'Service Reminder', `Hi, we just wanted you to inform you that you have a service request for today with order id# ${order.id}`);
          console.log('Need to send second email of service day!');
          // send second email
        }
      } else {
        order.reminder = {
          first: false,
          firstTime: new Date(),
          second: false,
          secondTime: new Date(),
        };
        order.markModified('reminder');
        await order.save();
      }
  }


  // await Order.updateMany({ status: 'PAYMENT_CONFIRMED', created: {$lt: date}}, {"$set":{'status': 'EXPIRED'}});
}, null, true);
job.start();

// handle error
app.use(errorHandler);

module.exports = app;
