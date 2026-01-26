require("dotenv").config();
const axios = require('axios');
const jwt = require("jsonwebtoken");
const Users = require('../modelsMongoose/Users');
const https = require('https');
const agent = new https.Agent({
    rejectUnauthorized: false
});

module.exports = {
    login: async (req, res) => {
        try {
            let {username, password} = req.body;
            if (!username || !password) {
                return res.status(400).json({
                    error: true,
                    message: 'username and password are required',
                    body: req.body
                });
            }
            let user = await Users.findOne({ username: username, password: password });
            if (user) {
                let token = jwt.sign({ username: username, nik: user.data.no_ktp }, process.env.SECRET_KHNZA, { expiresIn: '1d' });
                res.cookie('token', token);
                return res.status(200).json({
                    error: false,
                    message: 'Success login',
                });
            }
            let Bearertoken = jwt.sign({ username: username }, process.env.SECRET_KHNZA, { expiresIn: '1m' });
            
            const cekPassword = await axios.request({
                method: 'GET',
                maxBodyLength: Infinity,
                url: process.env.HOSTKHNZA + '/api/users/password/' + username,
                headers: {
                    'Authorization': 'Bearer ' + Bearertoken
                },
                httpsAgent: agent
            });
            if (cekPassword.data.data.password != password) {
                return res.status(400).json({
                    error: true,
                    message: 'Username or password is incorrect',
                    body: req.body
                });
            }
            console.log(cekPassword.data);
            const cekAkses = await axios.request({
                method: 'GET',
                maxBodyLength: Infinity,
                url: process.env.HOSTKHNZA + '/api/users/aksess/' + username,
                headers: {
                    'Authorization': 'Bearer ' + Bearertoken
                },
                httpsAgent: agent
            });
            const cekUser = await axios.request({
                method: 'GET',
                maxBodyLength: Infinity,
                url: process.env.HOSTKHNZA + '/api/users/cari?search=' + username+'&limit=1',
                headers: {
                    'Authorization': 'Bearer ' + Bearertoken
                },
                httpsAgent: agent
            });
            
            if (!user) {
                user = new Users({
                    username: username,
                    password: password,
                    akses: cekAkses.data.data,
                    data: cekUser.data.data[0]
                });
                await user.save();
            }
            let token = jwt.sign({ username: username,nik: cekUser.data.data[0].nik }, process.env.SECRET_KHNZA, { expiresIn: '1d' });
            res.cookie('token', token);
            return res.status(200).json({
                error: false,
                message: 'Success',
            });
        } catch (error) {
            console.log(error);
            if (error.response) {
                return res.status(error.response.status).json({
                    error: true,
                    message: error.response.data.message
                });
            }
            return res.status(500).json({
                error: true,
                message: error
            })
        }
      
    }
}