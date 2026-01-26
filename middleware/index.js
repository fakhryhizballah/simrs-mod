const jwt = require("jsonwebtoken");
const secretKey = process.env.SECRET_KHNZA;
const api_url = process.env.HOSTKHNZA;
module.exports = {
    cekLogin: async (req, res, next) => {
        try {
            const token = req.cookies.token;
            if (!token) {
                return res.redirect('/logout');
            }
            const decoded = jwt.verify(token, secretKey);
            req.user = decoded;
            res.cookie('API_URL', api_url, {
                maxAge: 1000 * 60 * 60 * 24 // 1 day
            });
            res.cookie('decoded', JSON.stringify(decoded), {
                maxAge: 1000 * 60 * 60 * 24 // 1 day
            });
            next();
        } catch (error) {
            return res.redirect('/logout');
        }
    }
}