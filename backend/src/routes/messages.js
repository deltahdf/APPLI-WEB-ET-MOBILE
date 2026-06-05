const express = require('express')
const router = express.Router()
const message = require('../controllers/messages.js')

router.get('/api/messages/:groupId', message.listMessages)
router.post('/api/messages/:groupId', message.sendMessage)

module.exports = router
