express = require('express');
const Users = require("./entities/users.js");
const Rooms = require("./entities/rooms.js");
const encrypt = require('./encrypt'); 
const nodemailer = require("nodemailer");
const session = require("express-session");

// Pour stocker les codes temporaires
function init(db){
  // Initialisation router
  const router = express.Router();
  router.use(express.json());

  // Initialisation des entités
  const users = new Users.default(db);
  const rooms = new Rooms.default(db);
  
  // Configuration de la session
  router.use(session({
    secret: 'secret_key', 
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
  }));

  // Transporter pour envoyer les emails
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'bellearnaude@gmail.com', 
      pass: 'fwhv yqui iqjp sppb' 
    }
  });

  // Validation de l'email avec une regexp
  const isEmailValid = (email) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  };
 
  // Générer un code de vérification aléatoire
  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Validation du mot de passe
const validatePassword = (password) => {
  // Au moins 1 minuscule, 1 majuscule, 1 chiffre, 1 caractère spécial (!@#$%^&*?.), longueur >= 8
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*?.])[A-Za-z\d!@#$%^&*?.]{8,}$/; 
  return regex.test(password);
};

  
  /**module.exports = { isEmailValid, isPasswordValid };
     routes.js - Fichier contenant vos routes
     const { isEmailValid, isPasswordValid } = require('./api');
  **/

  //demande création compte, envoi du code seulement
  router.put('/users', async (req, res) => {
    const { pseudo, email, mdp1, mdp2 } = req.body;
  
    if (!pseudo || !email || !mdp1 || !mdp2) {
      return res.send({ message: "Tous les champs sont nécessaires" });
    }
  
    if (mdp1 !== mdp2) {
      return res.send({ message: "Les mots de passe ne correspondent pas" });
    }
  
    if (!isEmailValid(email)) {
      return res.send({ message: "L'email n'est pas valide" });
    }
  
    if (!validatePassword(mdp1)) {
      return res.send({ message: "Le mot de passe doit respecter les critères de sécurité." });
    }
  
    const exist = await users.exist(email);
    if (exist) {
      return res.send({ message: "Email deja utilisé" });
    }

    const existUsername = await users.existUsername(pseudo);
    if (existUsername) {
      return res.send({ message: "Username deja utilisé" });
    }
    // Génération et envoi du code de vérification
    const verificationCode = generateVerificationCode();
    req.session.verificationCode = verificationCode;
    req.session.pendingUser = { pseudo, email, password: await encrypt.hashPassword(mdp1) };
  
    try {
      await transporter.sendMail({
        from: 'bellearnaude@gmail.com',
        to: email,
        subject: 'Code de vérification',
        text: `Votre code de vérification est : ${verificationCode}`
      });
      res.status(200).send({ message: "Code envoyé avec succès" });
    } catch (error) {
      res.status(500).send({ message: "Erreur lors de l'envoi de l'email" });
    }
  });

  // Connexion et envoi du code de vérification
  router.post('/users', async (req, res) => {
    const { email, mdp } = req.body;

    if (!email || !mdp) return res.send({ status: 400 });

    if (!await users.exist(email)) return res.send({ status: 402 });

    if (await users.checkPassword(email, mdp)) {
      req.session.userid = email; 
      return res.send({ status: 200, message: "Login validé" });
    } else {
      return res.send({ status: 401, message: "Mot de passe incorrect" });
    }

  });

   // Route de vérification du code
   router.post('/verify-code', async (req, res) => {
    const { code } = req.body;
  
    if (!req.session.verificationCode || !req.session.pendingUser) {
      return res.send({ status: 403, message: "Session expirée, veuillez recommencer." });
    }
  
    if (req.session.verificationCode === code) {
      const { pseudo, email, password } = req.session.pendingUser;
  
      try {
        await users.creerCompte(pseudo, email, password);
        delete req.session.pendingUser;
        delete req.session.verificationCode;
  
        return res.send({ status: 200, message: "Compte créé avec succès !" });
      } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Erreur lors de la création définitive du compte." });
      }
    } else {
      return res.send({ status: 401, message: "Code invalide." });
    }
  });





  //Permet la création d'un room
  router.put('/rooms', async (req, res) => {
    // Initialisation des variables récupérées du front
    const id = req.body.id;
    const users = req.body.user;
    console.log("RoomName Du back :", id);
    const existingRoom = await rooms.getUsersInRoom(id);
    
    if (existingRoom !== null) {
      return res.status(400).json({ error: "Nom de salle déjà utilisé" });
    }
    //const exist = await users.exist(pseudo); //True si pseudo existe, false sinon
    await rooms.createRoom(id,users);
  });

  // Récupérer toutes les salles publiques
  router.get('/rooms/public', async (req, res) => {
    console.log("[DEBUG] Appel à /api/rooms/public");
    try {
      const showRoom = await rooms.getAllRooms();
      console.log("[DEBUG] Salles récupérées:", showRoom);
      res.status(200).json(showRoom);
    } catch (error) {
      console.error("[ERREUR] /rooms/public:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  //Permet la suppression d'un room
  router.delete('/rooms', async (req, res) => {
    try {
      const { room } = req.body;
      const result = await rooms.deleteRoom(room);
      
      if(result) {
        res.status(200).json({ success: true });
      } else {
        res.status(404).json({ error: "Room non trouvée" });
      }
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  //Permet de vérifier si un room existe ou pas
  router.get('/roomExists', async (req, res) => {
    const roomName = req.query.room;
    // check en BDD si la room existe
    const found = await rooms.exist(roomName);
    if (found) {
      res.json({ ok: true });
    } else {
      res.json({ ok: false });
    }
  });

  //Permet la suppression d'un room
  router.post('/removeUserFromRoom', async (req, res) => {
    try {
      const { room, user } = req.body;
      console.log("Requête reçue - Room:", room, "User:", user);
  
      // 1) Retirer l'utilisateur
      const result = await rooms.removeUserFromRoom(room, user);
  
      if (result) {
        console.log("Suppression réussie !");
        // 2) Récupérer la room mise à jour
        const updatedUsers = await rooms.getUsersInRoom(room);
  
        // 3) Vérifier si c'est vide (plus personne)
        if (!updatedUsers || updatedUsers.length === 0) {
          console.log("Dernier utilisateur parti, on supprime la room...");
          await rooms.deleteRoom(room);
        } else {
          console.log("Il reste encore des joueurs, la room est conservée.");
        }
  
        // 4) Renvoyer la réponse
        res.status(200).json({ success: true });
      } else {
        console.log("Aucune modification effectuée");
        res.status(404).json({ error: "Non trouvé" });
      }
    } catch (error) {
      console.error("Erreur API:", error.message);
      res.status(500).json({ 
        error: "Échec technique",
        details: error.message
      });
    }
  });  

//Permet la suppression d'un room
router.post('/addUserToRoom', async (req, res) => {
  // Initialisation des variables récupérées du front
  const room = req.body.room;
  const user = req.body.user;
  console.log("j'ajoute", room , " room , user ", user);
  if(await rooms.exist(room) !== null) {
    await rooms.addUserToRoom(room,user);
    res.send({status:200})
    console.log("Room rejointe (api.js)")
  }
  else {console.log("roomNonrejointe");res.send({status:401} )}
});

//permet le changement de vie au démarage de la partie
router.post('/modifyLives', async (req,res) =>{
  await rooms.changeLives(req.body.room,req.body.lives);
})

//permet le changement de vie au démarage de la partie
router.post('/loseLife', async (req,res) =>{
  const temp = await rooms.loseLife(req.body.room,req.body.user);
  if(await rooms.checkGameOver(req.body.room)) {
    res.send({status : 200})
  }
  else res.send({status : 401})
})

//Récupere le winner dans une room
//Récupere le winner dans une room
router.get('/getWinner', async (req, res) => {
  console.log("je passe a getWinner ", req.query.room);

  const temp = await rooms.getWinner(req.query.room); 
  // temp ressemble à { id: 'PseudoGagnant', lives: 2 }

  if (temp) {
    try {
      // 1) Récupérer l'utilisateur dans la collection "Compte"
      const winnerUsername = temp.id; // ex: "argh"
      const winnerAccount = await users.getUser(winnerUsername);
      // winnerAccount ressemble à { _id: 'email@example.com', username: 'argh', coins: 0, ... }

      // 2) S'il existe, on incrémente ses pièces
      if (winnerAccount) {
        await users.modifyCoins(winnerAccount._id, 15); 
        console.log(`15 pièces ajoutées au gagnant : ${winnerUsername} (email : ${winnerAccount._id})`);
      } else {
        console.log("Impossible de trouver le compte du gagnant :", winnerUsername);
      }

      // 3) Renvoyer la réponse au front
      res.send({ status: 200, winner: temp, coinsEarned: 15 });
    } catch (error) {
      console.error("Erreur lors de l'attribution des pièces :", error);
      res.status(500).send({ status: 500, error: "Erreur interne du serveur" });
    }
  } else {
    res.send({ status: 401 });
  }
});


router.get('/getNextPlayer', async (req,res) =>{
  console.log("arguemts : ",req.query.room , " ' ", req.query.user);
  const temp = await rooms.nextPlayer(req.query.room,req.query.user);
  if(temp) {
    res.send({status : 200,nextPlayer : temp})
  }
  else res.send({status : 401})
})



  //Permet de récupérer les utilisateurs d'une room
  router.get('/getUsersFromRoom', async (req, res) => {
    try {
      const room = req.query.room;
      if (!room) {
        return res.status(400).json({ error: "Room non spécifiée" });
      }
      const usersFound = await rooms.getUsersInRoom(room);
      
      if (usersFound === null) {
        return res.status(400).json({ error: "Aucune room ne porte ce nom" });
      }
      
      res.json(usersFound); 
      console.log("Users found :", usersFound);
      
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs :", error);
      res.status(500).json({ error: "Erreur interne du serveur" });
    }
  });

//Permet de récupérer les room d'une user
router.get('/getRoomFromUsers', async (req, res) => {
  try {
    // Récupération de la room depuis les paramètres de la requête
    const user = req.query.user; 
    console.log("Récupération de la room de ",user);

    if (!user) {
      return res.status(400).json({ error: "Room non spécifiée" });
    }
    const room = await rooms.getRoomName(user);
    
    if (room === null) {
      return res.status(400).json({ error: "Aucune room contient l'utilisateur" });
    }
    
    res.json(room); 
    console.log("room found :", room);
    
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs :", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});


  // Création d'une session
  router.post('/users', async (req, res) => {
    console.log("-----> in POST /users route");
    console.log("req.secure =", req.secure);
    const login = req.body.email;
    const password = req.body.mdp;
    if (!login || !password) {
      res.send({ status: 400 });
      return;
    }

    if (!await users.exist(login)) {
      res.send({ status: 402 });
      return;
    }
    

    if (await users.checkPassword(login, password)) {
      console.log("Login/password OK, regenerating session...");
      req.session.regenerate(function (err) {
        if (err) {
          console.log("Erreur regenerate:", err);
          res.send({ status: 500, message: "Erreur interne" });
        } else {
          req.session.userid = login;
          console.log("Session ID =", req.sessionID);
          res.send({ status: 200, message: "Login et mot de passe accepté" });
        }
      });
      return;
    } else {
      console.log("Bad credentials, destroying session...");
      req.session.destroy((err) => {});
      res.send({ status: 401, message: "login et/ou le mot de passe invalide(s)" });
      return;
    }
  });
  // pour supprimer un utilisateur
  router.post('/delete', async (req, res) => {
    try {
        // Changer ici pour correspondre aux variables envoyées par le frontend
        const { email, login, password } = req.body; // Récupération des données de la requête

        // Appel de la méthode supprimerCompte avec les bons paramètres
        const result = await users.supprimerCompte(email, password);  // Suppression du compte par email et password
        // Si la suppression a réussi
        if (result) {
            res.status(200).json({ message: "Compte supprimé avec succès" });
        } else {
            res.status(400).json({ message: "Échec de la suppression du compte" });
        }
    } catch (e) {
        console.error("Erreur lors de la suppression du compte :", e);
        res.status(500).json({ message: "Erreur serveur" });
    }
});


  // Chercher une information à partir de l'email fourni
  router.get('/users', async (req, res) => {
    try {
      const pseudo = req.query.pseudo;
      const user = await users.getUser(pseudo);
      if (!user) {
        res.status(404).json({ message: "User not found" });
      } else {
        res.status(200).json(user);
      }
    } catch (e) {
      res.status(500).send(e);
    }
  });

  router.get('/users/detail', async (req, res) => {
    try {
      const user = await users.getEmail(req.session.userid);
      if (!user) {
        res.status(404).json({ message: "User not found" });
      } else {
        res.status(200).json(user);
      }
    } catch (e) {
      res.status(500).send(e);
    }
  });

  // Récupérer les attributs d'une bdd
  router.get('/users/all', async (req, res) => {
    try {
      const allAccount = await users.getAllUsers();
      res.status(200).json(allAccount);
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs :", error);
      res.status(500).json({ message: "Erreur lors de la récupération des infos du compte" });
    }
  });

  // Route pour changer le mot de passe
  router.patch('/users/password', async (req, res) => {
    const { email, oldPassword, newPassword } = req.body;
    const hashedPassword = await encrypt.hashPassword(newPassword); // Utilisation de la fonction pour encrypter les datas

    // Vérifier que tous les champs sont fournis
    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires" });
    }

    // Vérifier si le nouveau mot de passe respecte les critères de sécurité
    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        message: "Le nouveau mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre, un symbole",
      });
    }

    try {
      // Vérifier si l'utilisateur existe
      if (!await users.exist(email)) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      // Vérifier si l'ancien mot de passe est correct
      if (!await users.checkPassword(email, oldPassword)) {
        return res.status(401).json({ message: "Ancien mot de passe incorrect" });
      }

      // Mettre à jour le mot de passe en base de données
      await users.updatePassword(email, hashedPassword);

      return res.status(200).json({ message: "Mot de passe mis à jour avec succès" });

    } catch (error) {
      console.error("Erreur lors de la modification du mot de passe :", error);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Route pour changer le nom d'utilisateur
  router.patch('/users/username', async (req, res) => {
    const { email, newUsername } = req.body;

    // Vérifier que tous les champs sont fournis
    if (!newUsername) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires" });
    }

    try {
      if (!await users.exist(email)) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      if (await users.existUsername(newUsername)) {
        return res.status(404).json({ message: "Ce nom d'utilisateur a déjà été prise!" });
      }

      // Mettre à jour le mot de passe en base de données
      await users.updateUsername(email, newUsername);

      return res.status(200).json({ message: "Nom d'utilisateur mis à jour avec succès" });

    } catch (error) {
      console.error("Erreur lors de la modification du nom d'utilisateur :", error);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Récupérer de userid dans la session
  router.get("/session", (req, res) => {
    if (req.session && req.session.userid) {
      res.status(200).send({ userid: req.session.userid });
    } else {
      res.status(200).send({ userid: req.session.userid });
    }
  });

  // Gestion de session et cookie lors d'une déconnexion
  router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).send('Erreur lors de la déconnexion');
      } else {
        res.clearCookie('sessionID');
        res.status(200).send('Déconnexion réussie');
      }
    });
  });

  router.post('/save-avatar', async (req, res) => {
    const { avatar, avatarSettings, email } = req.body;
  
    if (!avatar || !email) {
      return res.status(400).send({ message: "Avatar et email sont requis" });
    }
  
    try {
      const user = await users.getEmail(email);  // Récupère l'utilisateur par son email
      if (!user) {
        return res.status(404).send({ message: "Utilisateur non trouvé" });
      }
  
      // Sauvegarder l'avatar dans la base de données
      await users.saveAvatar(email, avatar, avatarSettings);
  
      res.status(200).send({ message: "Avatar sauvegardé avec succès" });
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de l'avatar :", error);
      res.status(500).send({ message: "Erreur serveur lors de la sauvegarde de l'avatar" });
    }
  });

  router.get('/get-avatar', async (req, res) => {
    const { email } = req.query;
  
    if (!email || !isEmailValid(email)) { // Utilisez la fonction de validation existante
      return res.status(400).send({ message: "Email invalide ou manquant" });
    }
  
    try {
      const user = await users.getEmail(email);
      if (!user) {
        return res.status(404).send({ message: "Utilisateur non trouvé" });
      }
      res.status(200).send({ avatar: user.avatar || "" }); // Renvoyer une valeur par défaut si nécessaire
    } catch (error) {
      console.error("Erreur lors de la récupération de l'avatar :", error);
      res.status(500).send({ message: "Erreur serveur" });
    }
  });
  
  router.get('/get-avatar-by-username', async (req, res) => {
    const { username } = req.query;
  
    if (!username) {
      return res.status(400).send({ message: "Username requis" });
    }
  
    try {
      const user = await users.getUser(username);
      
      if (!user) {
        return res.status(404).send({ message: "Utilisateur non trouvé" });
      }
  
      res.status(200).send({ avatar: user.avatar || "" });
    } catch (error) {
      console.error("Erreur récupération avatar par username :", error);
      res.status(500).send({ message: "Erreur serveur" });
    }
  });

  router.post('/unlock-item-50', async (req, res) => {
    try {
      // On récupère l'email du user dans la session
      const userEmail = req.session.userid;
      if (!userEmail) {
        return res.status(401).json({ error: "Utilisateur non connecté" });
      }
  
      // On récupère la catégorie et l'item du corps de la requête
      const { category, item } = req.body;
      // Définir un coût fixe (ou variable) : par exemple 10 pièces
      const itemCost = 50;
  
      // Appel à la méthode unlockItem
      await users.unlockItem(userEmail, category, item, itemCost);
  
      return res.status(200).json({ message: "Item débloqué avec succès" });
    } catch (error) {
      console.error("Erreur dans /unlock-item :", error.message);
      // On renvoie le message d'erreur (par ex. "Pas assez de pièces")
      return res.status(400).json({ error: error.message });
    }
  });

  router.post('/unlock-item-100', async (req, res) => {
    try {
      // On récupère l'email du user dans la session
      const userEmail = req.session.userid;
      if (!userEmail) {
        return res.status(401).json({ error: "Utilisateur non connecté" });
      }
  
      // On récupère la catégorie et l'item du corps de la requête
      const { category, item } = req.body;
      // Définir un coût fixe (ou variable) : par exemple 10 pièces
      const itemCost = 100;
  
      // Appel à la méthode unlockItem
      await users.unlockItem(userEmail, category, item, itemCost);
  
      return res.status(200).json({ message: "Item débloqué avec succès" });
    } catch (error) {
      console.error("Erreur dans /unlock-item :", error.message);
      // On renvoie le message d'erreur (par ex. "Pas assez de pièces")
      return res.status(400).json({ error: error.message });
    }
  });
  
  return router;
}

module.exports = init;