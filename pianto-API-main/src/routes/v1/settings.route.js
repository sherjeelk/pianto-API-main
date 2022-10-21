const express = require('express');
const auth = require('../../middlewares/auth');
const settingsController = require('../../controllers/setting.controller');

const router = express.Router();

router
    .route('/')
    .post(auth('manageUsers'), settingsController.createSetting)
    .get(auth('manageUsers'), settingsController.getSettings);

router
    .route('/:id')
    .get(auth('manageUsers'), settingsController.getSetting)
    .put(auth('manageUsers'), settingsController.updateSetting)
    .delete(auth('manageUsers'), settingsController.deleteSetting);

module.exports = router;
