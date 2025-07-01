Create New Directry - (node-rest-shop)
Navigate to new created directory in cmd promt - (navigate to = node-rest-shop)
Type "npm init" in that folder
Assign "package name" 
Assign "Version"
Provide "Description"
Provide "entry point" (index.js)
"test command" (skip)
"git reposetory" (skip)
provide "keywords" (node restul api)
"author" (Nameers)
"license" (ISC)
Is this ok (yes)? -> type "yes"
In VScode Editor Open terninal
In terminal type "npm install --save express" (this will save package json inside the dependency)
now create "server.js" file
In server.js file import https, port  and server variable as well
const http = require('http');
const port = process.env.PORT || 3000;
const server = http.createServer();
now add server listener ==> server.listen(port); ==> to start server
Now create "app.js" file  [ this will make handling requests bit simpler for us]
In app.js ==> we import express ==> "const express = require('express')
In app.js ==> create const app = express(); [ execute express request]
In app.js ==> app.use() // It is a method that will act as a middleware, so incoming requests will go through this middleware and execute
app.use((req, res,next)) => app.use() have the arrow fucntion with req,res and next ==> this middleware is mandotory every request has togo through this middleware
now after creating middleware export the app "module.exports =app"
Now impot app in server.js file 
In server.js => pass app to create server "const server = http.createServer(app);"
In terminal => node server.js to start server.
Create Api folder
IN api folder => create routes folder
In routes folder => create product.js (To handle product related routes)\
Now setting up the routes in product.js file
Import express module