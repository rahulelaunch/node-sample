var morgan = require('morgan');
import redisClient from "./utils/redisHelper";
import path from "path";

const config = require("config")
const mongoose = require('mongoose');
const express = require('express')
const bodyParser = require('body-parser')
const cors = require("cors");
const cookieParser = require("cookie-parser");

import eventEmitter from "./utils/event";
import authRoute from "./components/userAuth";
import userRoute from "./components/users";
import businessRoute from "./components/business";
import adminRoute from "./components/admin";
import {connectionHandler} from "./components/chat/SocketController";
import corsOptions from "./utils/corsOptions";
import {NextFunction, Request, Response} from "express";

express.application.prefix = express.Router.prefix = function (path: any, configure: any) {
    var router = express.Router();
    this.use(path, router);
    configure(router);
    return router;
};

const app = express()
app.use(function (req: Request, res: Response, next: NextFunction) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});
app.use(cors(corsOptions))
app.use(cookieParser());

app.use(bodyParser.json({limit: '50mb'}))
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}))

app.use('/uploads', express.static(path.join(__dirname, '/uploads')))

app.use(morgan('dev', {skip: (req: any, res: any) => process.env.NODE_ENV === 'production'}));
app.set('eventEmitter', eventEmitter)

app.prefix('/user', (route: any) => {
    authRoute(route)
    userRoute(route)
})

app.prefix('/business', (route: any) => {
    authRoute(route)
    businessRoute(route)
})

app.prefix('/admin', (route: any) => {
    adminRoute(route)
})

const http = require('http');
const server = http.createServer(app);
const {Server} = require("socket.io");
const io = new Server(server);


server.listen(config.get("PORT"), () => {
    console.log(`⚡️[NodeJs server]: Server is running at http://localhost:${config.get("PORT")}`)

    mongoose.connect(
        config.get("DB_CONN_STRING"),
        () => console.log('connected to mongodb.')
    );
    redisClient.on('error', (err: any) => console.log('Redis Client Error', err));
    io.on('connection', connectionHandler);
});

//  "ROUTE_URL": "http://192.168.0.156:7009",