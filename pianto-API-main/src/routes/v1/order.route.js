const express = require('express');
const auth = require('../../middlewares/auth');
const orderController = require('../../controllers/order.controller');

const router = express.Router();

router
    .route('/')
    .post(auth('manageUsers'), orderController.createOrder)
    .get(auth('manageUsers'), orderController.getOrders);

router
    .route('/search')
    .post(auth('manageUsers'), orderController.searchOrders)

router
    .route('/place')
    .post(orderController.placeOrder)

router
    .route('/updateStatus')
    .post(orderController.changeOrderStatus)

router
    .route('/ext')
    .post(orderController.placeExtOrder)
    .put(orderController.updateExtOrder)

router
    .route('/cancel')
    .get(orderController.cancelOrder)

router
    .route('/me')
    .get(auth('user'), orderController.myOrders)

router
    .route('/confirm')
    .post(orderController.confirmOrder)

router
    .route('/earnings')
    .get(orderController.getOrderByDate)

router
    .route('/:id')
    .get(auth('getUsers'), orderController.getOrder)
    .put(auth('getUsers'), orderController.updateOrder)
    .purge(auth('getUsers'), orderController.updateOrder)
    .delete(auth('manageUsers'), orderController.deleteOrder);

module.exports = router;
