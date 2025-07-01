// ----------------------------Import statements ------------------------------------
const express = require("express"); // import express from express
const app = express();

const morgan = require("morgan"); //import morgan -> logging pagckage

const productRoutes = require("./api/routes/products.js"); // import product routes

const orderRoutes = require("./api/routes/orders.js"); // import order routes

// -----------------------app.use-----------------------------------------
app.use(morgan("dev")); // create the logs for the website

app.use("/products", productRoutes); //product will be in url path.

app.use("/orders", orderRoutes); //orders will be in url path.

// ------------------------ error handling ----------------------------------------
app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
}); // error handler when no routes are available

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
}); // error handler for all kinds of errors
module.exports = app;
