const express = require("express");
const authController = require('../controllers/auth');


const router = express.Router();

//Create a controller that will deal with the data sent from the form
router.post('/register', authController.register);
router.post('/login', authController.login);



module.exports = router;