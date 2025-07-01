const express = require('express');
const postsController = require('../controllers/post.controller');

const router = express.Router(); // access router methods

router.get('/', postsController.index); //

module.exports =router;