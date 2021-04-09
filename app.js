// require packages
const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
var dotenv = require('dotenv');

dotenv.config();

// create express app
const app = express();

// use cors middleware
app.use(cors());

// use for logging reequest info to server
app.use(morgan("dev"));

// allow parsing of request body data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// use cookie parser
app.use(cookieParser());

// require routes to api js
const backtestRoutes = require("./backtest");
const livetestRoutes = require("./livetest");

// wire api routes
app.use("/backtest", backtestRoutes);
app.use("/livetest", livetestRoutes);

// no api routes hit, so call 404 error
app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

// unexpected error hit, so throw 500 error
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

module.exports = app;
