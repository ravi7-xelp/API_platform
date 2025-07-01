// this is where we define our express application. It is the entry point for our applications.
const express = require("express");
const app = express();
const postRoute = require("./routes/post");

// Define route for posts
app.use("/posts", postRoute);

module.exports = app;
