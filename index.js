require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const favicon = require("serve-favicon");
const path = require("path");
const app = express();
const package = require("./package.json");
const maxAge = 60 * 60 * 24;
const http = require('http');
const server = http.createServer(app);
const morgan = require('morgan');
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ type: "application/*+json" }));
app.use(cookieParser());
morgan.token('real-ip', (req) => req.headers['x-real-ip'] || req.ip);
// Format custom: IP + method + url + status + response-time
const customFormat = ':real-ip :method :url :status :response-time ms';
app.use(morgan(customFormat));


app.set("view engine", "ejs");

app.use(favicon(path.join(__dirname + "/public/", "favicon.ico")));
app.use(
    "/asset/js/",
    express.static(path.join(__dirname + "/public/js/"), {
        setHeaders: (res, path, stat) => {
            res.set("Cache-Control", "public, max-age=" + maxAge);
            res.set("ETag", package.version); // add etag
        },
    })
);
app.use(
    "/asset/img/",
    express.static(path.join(__dirname + "/public/img/"), {
        setHeaders: (res, path, stat) => {
            res.set("Cache-Control", "public, max-age=86400");
            res.set("ETag", package.version); // add etag
        },
    })
);
app.use(
    "/asset/css/",
    express.static(path.join(__dirname + "/public/css/"), {
        setHeaders: (res, path, stat) => {
            res.set("Cache-Control", "public, max-age=" + maxAge);
            res.set("ETag", package.version); // add etag
        },
    })
);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});
