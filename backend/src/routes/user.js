const express = require('express')
const router = express.Router()
const user = require('../controllers/user.js')

router.post('/login', user.login)
router.get('/api/users', user.getUsers)
router.post('/api/users', user.newUser)
router.post('/api/users/:id', user.updatePassword)
router.delete('/api/users/:id', user.deleteUser)

module.exports = router
