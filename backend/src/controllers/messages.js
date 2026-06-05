const status = require('http-status')
const userModel = require('../models/users.js')
const groupModel = require('../models/groups.js')
const messageModel = require('../models/messages.js')
const has = require('has-keys')
const CodeError = require('../util/CodeError.js')
const bcrypt = require('bcrypt')
const jws = require('jws')
const { use } = require('../routes/messages.js')
require('mandatoryenv').load(['TOKENSECRET'])
const { TOKENSECRET } = process.env

const ERRORS = {
  TOKEN_MISSING: { code: 403, message: 'Token missing' },
  TOKEN_INVALID: { code: 403, message: 'Token invalid' },
  USER_NOT_FOUND: { code: 404, message: 'User not found' },
  NOT_ADMIN: { code: 403, message: 'Not an admin' }
}

async function verifyToken (req) {
  if (!req.headers || !req.headers['x-access-token']) { // Vérifiez la présence du token
    throw ERRORS.TOKEN_MISSING
  }
  const token = req.headers['x-access-token']
  if (!jws.verify(token, 'HS256', process.env.TOKENSECRET)) { // Vérifiez la validité du token
    throw ERRORS.TOKEN_INVALID
  }
  const decoded = jws.decode(token)
  if (!decoded || !decoded.payload) {
    throw ERRORS.TOKEN_INVALID
  }
  const userEmail = decoded.payload
  const user = await userModel.findOne({ where: { email: userEmail } })
  if (!user) { // Vérifiez si l'utilisateur existe
    throw ERRORS.USER_NOT_FOUND
  }

  return user
}

async function verifyMember (req, gid) {
  const user = await verifyToken(req)

  const member = await groupModel.findOne({ where: { id: gid, ownerId: user.id } })
  if (!member) {
    throw new CodeError('User is not a member of the group', status.FORBIDDEN)
  }

  return user
}

module.exports = {
  async listMessages(req, res) {
    try {
      await verifyToken(req);
      if (!req.params.groupId) {
        throw new CodeError('Group ID is missing', status.BAD_REQUEST);
      }
  
      const gid = req.params.groupId;
      await verifyMember(req, gid);
      const messages = await messageModel.findAll({
        where: { gid }
      });
  
      const messageWithUserNames = await Promise.all(messages.map(async (msg) => {
        const user = await userModel.findByPk(msg.uid);
        return {
          id: msg.id,
          content: msg.content,
          userName: user ? user.name : 'Unknown' // Fallback to 'Unknown' if user is not found
        };
      }));
  
      res.json({ status: true, data: messageWithUserNames });
    } catch (error) {
      res.status(error.code).json({ status: false, message: error.message });
    }
  },

  async sendMessage (req, res) {
    try {
      const user = await verifyToken(req)
      if (!req.params.groupId) {
        throw new CodeError('Group ID is missing', status.BAD_REQUEST)
      }
      const gid = req.params.groupId
      if (!req.body.content) {
        throw new CodeError('Message content is missing', status.BAD_REQUEST)
      }

      if(!req.body.uid){
        throw new CodeError('Message user id is missing', status.BAD_REQUEST)
      }

      await verifyMember(req, gid)
      const content = req.body.content
      const uid = req.body.uid
      const userName = user.name;
      await messageModel.create({ content, gid, uid, userName })
      res.json({ status: true, message: 'Message sent', userName })
    } catch (error) {
      res.status(error.code).json({ status: false, message: error.message })
    }
  }
}