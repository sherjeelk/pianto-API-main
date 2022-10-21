const express = require('express');
const auth = require('../../middlewares/auth');
const extraController = require('../../controllers/extra.controller');

const router = express.Router();

router
    .route('/')
    .post(auth('manageUsers'), extraController.createExtra)
    .get(extraController.getExtraList);

router
    .route('/:id')
    .get(extraController.getExtraItem)
    .put(auth('manageUsers'), extraController.updateExtra)
    .delete(auth('manageUsers'), extraController.deleteExtra);

module.exports = router;
