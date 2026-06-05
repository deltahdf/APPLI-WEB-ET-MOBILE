const userModel = require('../models/users.js')
const groupModel = require('../models/groups.js')
const messageModel = require('../models/messages')
const bcrypt = require('bcrypt');
// Ajouter ici les nouveaux require des nouveaux modèles

// eslint-disable-next-line no-unexpected-multiline
(async () => {
  // Regénère la base de données
  await require('../models/database.js').sync({ force: true })
  console.log('Base de données créée.')
  // Initialise la base avec quelques données
  const passhash = await bcrypt.hash('123456', 2)
  console.log(passhash)
  await userModel.create({
    name: 'Sebastien Viardot', email: 'Sebastien.Viardot@grenoble-inp.fr', passhash, isAdmin : true
  })
  // Ajouter ici le code permettant d'initialiser par défaut la base de donnée
  const passhash1 = await bcrypt.hash('123', 2)
  console.log(passhash1)
  await userModel.create({
    name: 'Fahd', email: 'fahdamine@gmail.com', passhash : passhash1, isAdmin : true
  })


})()
