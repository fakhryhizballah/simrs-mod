require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const favicon = require("serve-favicon");
const path = require("path");
const app = express();
const http = require('http');
const server = http.createServer(app);
const morgan = require('morgan');
const mongoose = require('mongoose');
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ type: "application/*+json" }));
app.use(cookieParser());
morgan.token('real-ip', (req) => req.headers['x-real-ip'] || req.ip);
// Format custom: IP + method + url + status + response-time
const customFormat = ':real-ip :method :url :status :response-time ms';
app.use(morgan(customFormat));
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Terhubung ke MongoDB!'))
    .catch(err => console.error('Gagal terhubung ke MongoDB:', err));
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to DB');
});
mongoose.connection.on('error', (err) => {
    console.log('Mongoose connection error:', err);
});
mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected from DB');
});

app.use((req, res, next) => {
    req.mongoose = mongoose;
    next();
});

app.set("view engine", "ejs");

app.use(favicon(path.join(__dirname + "/public/", "favicon.ico")));
app.use(
    "/asset/js/",
    express.static(path.join(__dirname + "/public/js/"), {
    })
);
app.use(
    "/asset/img/",
    express.static(path.join(__dirname + "/public/img/"), {
    })
);
app.use(
    "/asset/css/",
    express.static(path.join(__dirname + "/public/css/"), {

    })
);

app.use("/", require("./routes/index"));


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});
