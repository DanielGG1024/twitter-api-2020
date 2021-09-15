const express = require('express')
const router = express.Router()
const adminController = require('../../controllers/adminController.js')
const { authenticated, authenticatedAdmin } = require('../../middleware/auth')

router.post('/login', adminController.adminLogin)
router.get('/tweets', authenticatedAdmin, adminController.getAdminTweets)


module.exports = router