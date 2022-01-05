const express = require('express');

const userController = require('../controllers/user.controller')
const {verifyAccessToken} = require('../helpers/jwt-service')

const router = express.Router();

router.post('/register',userController.register)

router.post('/login',userController.login)

router.post('/refresh-token', userController.refreshToken)

router.delete('/logout', userController.logout)

router.get('/get-list',verifyAccessToken, userController.getLists)

module.exports = router;