const express = require('express');
const router = express.Router();
const controller = require('../controllers/index');
const middleware = require('../middleware/index');
const ajax = require('../controllers/ajax');

router.get('/login', controller.login);
router.get('/', controller.dashboard);
router.get('/menu', middleware.cekLogin, controller.menu);
router.get('/menu/inacbg_klaim', middleware.cekLogin, controller.inacbg_klaim);
router.get('/menu/inacbg_klaim/kirim', middleware.cekLogin, controller.inacbg_klaim_kirim);
router.get('/menu/inacbg_klaim/kirim/diagnosa', middleware.cekLogin, controller.diagnosa);


router.post('/api/login', ajax.login);

router.get('/logout', (req, res) => {
    res.clearCookie('token', { httpOnly: true, sameSite: 'strict' });
    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict' });
    res.redirect('/login');
})
module.exports = router;