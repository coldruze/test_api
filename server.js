import express from "express";
import cors from "cors";
import config from "./config.json" assert {type: "json"};
import mongoose from "mongoose";
import {router} from "./router/index.js";
import cookieParser from "cookie-parser";
import {errorMiddleware} from "./middlewares/errorMiddleware.js";

const app = express();
const port = config.port;
const url = config.mongoUrl;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "*"
}));
app.use("/", router);
app.use(errorMiddleware);

const start = async function () {
    try {
        await mongoose.connect(url);
        app.listen(port);
    } catch (e) {
        console.log(e);
    }
};

start().then(() => console.log(`Server is working on localhost:${port}`));