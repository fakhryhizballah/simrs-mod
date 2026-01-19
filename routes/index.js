const express = require('express');
const router = express.Router();
const controller = require('../controllers/index');

router.get('/login', controller.login);
router.get('/', controller.dashboard);
router.get('/menu', controller.menu);
module.exports = router;