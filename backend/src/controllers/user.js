const status = require('http-status')
const userModel = require('../models/users.js')
const has = require('has-keys')
const CodeError = require('../util/CodeError.js')
const bcrypt = require('bcrypt')
const jws = require('jws')
require('mandatoryenv').load(['TOKENSECRET'])
const { TOKENSECRET } = process.env

const ERRORS = {
  TOKEN_MISSING: { code: 403, message: 'Token missing' },
  TOKEN_INVALID: { code: 403, message: 'Token invalid' },
  USER_NOT_FOUND: { code: 404, message: 'User not found' },
  NOT_ADMIN: { code: 403, message: "Not an admin" }
};

function validPassword (password) {
  return /^(?=.*[\d])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*])[\w!@#$%^&*]{8,}$/.test(password)
}

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


async function isAdmin(req) {
  if (!req.headers || !req.headers['x-access-token']) {   
    throw ERRORS.TOKEN_MISSING;
  }
  const token = req.headers['x-access-token'];
  if (!jws.verify(token, 'HS256', process.env.TOKENSECRET)) {
    throw ERRORS.TOKEN_INVALID;
  }
  const decoded = jws.decode(token);  
  if (!decoded || !decoded.payload) {
    throw ERRORS.TOKEN_INVALID;
  }
  const userEmail = decoded.payload;
  console.log(userEmail)
  const user = await userModel.findOne({ where: { email: userEmail } });
  if (!user) {
    throw ERRORS.TOKEN_INVALID;
  }
  if (!user.isAdmin) {
    throw ERRORS.NOT_ADMIN;
  }
  return user.isAdmin;
}

module.exports = {
  async login (req, res) {
    // #swagger.tags = ['Users']
    // #swagger.summary = 'Verify credentials of user using email and password and return token'
    // #swagger.parameters['obj'] = { in: 'body', schema: { $email: 'John.Doe@acme.com', $password: '12345'}}
    if (!has(req.body, ['email', 'password'])) throw new CodeError('You must specify the email and password', status.BAD_REQUEST)
    const { email, password } = req.body
    const user = await userModel.findOne({ where: { email } })
    if (user) {
      if (await bcrypt.compare(password, user.passhash)) {
        const token = jws.sign({ header: { alg: 'HS256' }, payload: email, secret: TOKENSECRET })
        res.json({ status: true, message: 'Login ...', token })
        return
      }
    }
    res.status(status.FORBIDDEN).json({ status: false, message: 'Wrong information' })
  },

  async newUser (req, res) {
    if (!has(req.body, ['name', 'email', 'password'])) {
      throw new CodeError("You must specify the name, email, and password", status.BAD_REQUEST);
    }
    const { name, email, password } = req.body;
    const existingUser = await userModel.findOne({ where: { email } });
    if (existingUser) {
      return res.status(status.CONFLICT).json({ status: false, message: "Utilisateur déjà existant" });
    }
    if (!validPassword(password)) {
      //throw new CodeError("Weak password!", status.BAD_REQUEST);
    }
    const passhash = await bcrypt.hash(password, 10); 
    try {
      const newUser = await userModel.create({
        name: name,
        email: email,
        passhash: passhash
      });
      const token = jws.sign({
        header: { alg: 'HS256' },
        payload: { id: newUser.id, email: newUser.email },
        secret: TOKENSECRET
      });
      return res.status(status.CREATED).json({ status: true, message: "User added", token: token });
    } catch (error) {
      return res.status(status.INTERNAL_SERVER_ERROR).json({ status: false, message: error.message });
    }
  },

  
  async getUsers(req, res) {
    try {
      // Vérifiez la présence du token
      if (!req.headers['x-access-token']) {
        throw new CodeError('No token provided', status.BAD_REQUEST);
      }
      const token = req.headers['x-access-token'];
      if (!jws.verify(token, 'HS256', TOKENSECRET)) {
        throw new CodeError('Token is invalid', status.UNAUTHORIZED);
      }
      const data = await userModel.findAll({
        attributes: ['id', 'name', 'email', 'isAdmin'] 
      });
      res.json({ status: true, message: 'Returning users', data });
    } catch (error) {
      res.status(error.code || 500).json({ status: false, message: error.message || 'An error occurred' });
    }
  },
  




  async deleteUser(req, res) {
    try {
      
      await verifyToken(req); 
      
      if (!has(req.params, 'id')) {
        throw new CodeError('You must specify the id', status.BAD_REQUEST);
      }
      const { id } = req.params;
      await userModel.destroy({ where: { id } });
      res.json({ status: true, message: 'User deleted' });
    } catch (error) {
      res.status(error.code || 500).json({ status: false, message: error.message || 'An error occurred' });
    }
  },

  async updatePassword(req, res) {
    try {
      const user = await verifyToken(req);
  
      if (!req.body.password) {
        throw new CodeError('You must specify the new password', status.BAD_REQUEST);
      }
      
      const newPassword = req.body.password;
      if (!validPassword(newPassword)) {
        //throw new CodeError('Weak password!', status.BAD_REQUEST);
      }
  
      const passhash = await bcrypt.hash(newPassword, 10);
      await userModel.update({ passhash }, { where: { id: user.id } });
  
      res.json({ status: true, message: 'Password updated' });
    } catch (error) {
      res.status(error.code || 500).json({ status: false, message: error.message });
    }
  },
  
  
  

}
  




