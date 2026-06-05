const status = require('http-status')
const groupeModel = require('../models/groups.js')
const userModel = require('../models/users.js')
const CodeError = require('../util/CodeError.js')
const has = require('has-keys')
const bcrypt = require('bcrypt')
const jws = require('jws')
const { token } = require('morgan')
require('mandatoryenv').load(['TOKENSECRET'])
const { TOKENSECRET } = process.env

const ERRORS = {
    TOKEN_MISSING: { code: 403, message: 'Token missing' },
    TOKEN_INVALID: { code: 403, message: 'Token invalid' },
    USER_NOT_FOUND: { code: 404, message: 'User not found' },
    NOT_ADMIN: { code: 403, message: "Not an admin" }
  };

  async function verifyToken(req) {
    if (!req.headers || !req.headers['x-access-token']) {   // Vérifie la présence du token
      throw ERRORS.TOKEN_MISSING;
    }
    const token = req.headers['x-access-token'];
    if (!jws.verify(token, 'HS256', process.env.TOKENSECRET)) {  // Vérifie la validité du token
      throw ERRORS.TOKEN_INVALID;
    }
    const decoded = jws.decode(token);
    if (!decoded || !decoded.payload) {
      throw ERRORS.TOKEN_INVALID;
    }
    const userEmail = decoded.payload;
    const user = await userModel.findOne({ where: { email: userEmail } });
    if (!user) {   // Vérifiez si l'utilisateur existe
      throw ERRORS.USER_NOT_FOUND;
    }
  
    return user;
  }
  
  async function verifyOwner(req, groupId) {
    const token = req.headers['x-access-token'];
    const decodedToken = jws.decode(token);
    if (!decodedToken || !decodedToken.payload) {
      throw new CodeError('Invalid token', status.UNAUTHORIZED);
    }
    const userEmail = decodedToken.payload;
    const user = await userModel.findOne({ where: { email: userEmail } });
    if (!user) {
      throw new CodeError('User not found', status.NOT_FOUND);
    }
    const group = await groupeModel.findByPk(groupId);
    if (!group) {
      throw new CodeError('Group not found', status.NOT_FOUND);
    }
  
    if (group.ownerId !== user.id) {
      throw new CodeError('User is not the owner of the group', status.FORBIDDEN);
    }
  
    return true;
  }
  

  module.exports = {
    async newGroup(req, res) {
      try {
        const user = await verifyToken(req);
        if (!has(req.body, 'name')) {
          throw new CodeError('You have to specify the name for the group', status.BAD_REQUEST);
        }
        const { name } = req.body;
        const existingGroup = await groupeModel.findOne({ where: { name } });
        if (existingGroup) {
          return res.status(status.CONFLICT).json({ status: false, message: 'Group already exists' });
        }
        const newGroup = await groupeModel.create({ name, ownerId: user.id });
        
        await newGroup.addUser(user);
    
        res.json({ status: true, message: 'Group created successfully', group: newGroup });
      } catch (error) {
        res.status(error.code).json({ status: false, message: error.message });
      }
    },
    
  
    async getGroups(req, res) {
      try {
        const user = await verifyToken(req);
        const groups = await groupeModel.findAll({
          where: { ownerId: user.id },
          attributes: ['id', 'name', 'ownerId']
        });
  
        res.json({ status: true, message: 'Groups retrieved successfully', data: groups });
      } catch (error) {
        res.status(error.code).json({ status: false, message: error.message });
      }
    },

    async addMember(req, res) {
      try {
          const user = await verifyToken(req);
          const { email } = req.body; 
          const groupId = req.params.groupId;
  
          if (!groupId) {
              throw new CodeError('You must specify the group id', status.BAD_REQUEST);
          }
  
          if (!email) {
              throw new CodeError('You must specify the user email', status.BAD_REQUEST);
          }
  
          const group = await groupeModel.findByPk(groupId);
          if (!group) {
              throw new CodeError('Group not found', status.NOT_FOUND);
          }
  
          if (group.ownerId !== user.id) {
              throw new CodeError('You are not the owner of this group', status.FORBIDDEN);
          }
  
          const member = await userModel.findOne({ where: { email: email } });
          if (!member) {
              throw new CodeError('User not found with the provided email', status.NOT_FOUND);
          }
  
          await group.addUser(member);
          res.json({ status: true, message: 'User added to the group successfully' });
      } catch (error) {
          res.status(error.code || 500).json({ status: false, message: error.message });
      }
  },
  
  

  async getMembers(req, res) {
    try {
      const user = await verifyToken(req);

      console.log("PARAM DONE");


      const groupId = req.params.groupId;


      const group = await groupeModel.findByPk(groupId);
      if (!group) {
        throw new CodeError('Group not found', status.NOT_FOUND);
      }
      console.log("GROUP FOUND")
      const isMember = await group.hasUser(user);
      if (!isMember) {
        throw new CodeError('You are not a member of this group', status.FORBIDDEN);
      }
  
      // Récupérez tous les membres du groupe
      const members = await group.getUsers();
  
      res.json({ status: true, message: 'Returning group members', data: members });
    } catch (error) {
      res.status(error.code).json({ status: false, message: error.message });
    }
  },
  


  async deleteMember(req, res) {
    try {
        await verifyToken(req);
        const {groupId, userId} = req.params;
        console.log("back   " + userId);
        console.log("back   " + groupId);


        if (!groupId) {
            throw new CodeError('ERROR group id', status.BAD_REQUEST);
        }

        if (!userId) {
            throw new CodeError('ERROR user id', status.BAD_REQUEST);
        }

        const group = await groupeModel.findByPk(groupId);
        if (!group) {
          throw new CodeError('This group doesn\'t exist', status.NOT_FOUND);
        }
        

        const user = await userModel.findByPk(userId); 
        if (!user) {
          throw new CodeError('This member doesn\'t exist', status.NOT_FOUND);
        }
        
        await group.removeUser(user);

        res.json({ status: true, message: 'User successfully deleted from the group' });
    } catch (error) {
        res.status(error.code).json({ status: false, message: error.message });
    }
}
       
  };
  
 