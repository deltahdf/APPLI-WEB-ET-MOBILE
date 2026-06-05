const express = require('express')
const router = express.Router()
const group = require('../controllers/groups.js')

router.get('/api/groups', group.getGroups);
router.post('/api/groups', group.newGroup);
router.get('/api/groups/:groupId', group.getMembers);
router.post('/api/groups/:groupId/:userId', group.addMember);
router.delete('/api/groups/:groupId/:userId', group.deleteMember); 

module.exports = router;