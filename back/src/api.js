const express = require('express');
const Users = require("./entities/users.js");

function init(db){
  //Initialisation router
  const router = express.Router();
  router.use(express.json());

  //Initialisation des entités
  const users = new Users.default(db);
  
  //Permet la création d'un compte
  router.put('/users', async (req, res) => {
    //Initialisation des variables récupérés du front
    const pseudo = req.body.pseudo;
    const email = req.body.email;
    const mdp1 = req.body.mdp1;
    const mdp2 = req.body.mdp2;
    const exist = await users.exist(pseudo); //True si pseudo existe, false sinon

    //Vérifie si tous les champs sont remplis
    if (!pseudo || !mdp1 || !mdp2 || !email) {
      return res.send({ message: "Tous les champs sont nécessaires" });
    }

    //Vérifie si les deux saisis du mdp sont identique
    if (mdp1 !== mdp2) {
      return res.send({ message: "Les mots de passe ne correspondent pas" });
    }
    
    //Vérifie si l'email est valide ou pas
    if (exist) {
      return res.send({ message: "Email deja utilisé" });
    }
    
    try {
      await users.creerCompte(pseudo, email, mdp1, mdp2);
      return res.status(200).send({ message: "Utilisateur créé avec succès" });
    } catch (error) {
        console.error("Erreur lors de la création de l'utilisateur :", error);
        return res.status(500).send({ message: "Erreur lors de la création de l'utilisateur" });
    }
  });

  //Création d'une session
  router.post('/users', async (req, res) => {
    //Initialisation
    const login = req.body.email;
    const password = req.body.mdp;

    //Pas valide si les champs sont vides
    if (!login || !password) {
      res.send({status : 400});
      return;
    }

    //Pas valide si l'email existe deja dans la bdd
    if (!await users.exist(login)) {
      res.send({status : 402});
      return;
    }
    
    if (await users.checkPassword(login, password)) {
      req.session.regenerate(function (err) {
        if (err) {
          res.send({
            status: 500,
            message: "Erreur interne"
          });
        } else {
          //C'est bon, nouvelle session créée
          console.log(req.session);
          req.session.userid = login;
          res.send({
            status: 200,
            message: "Login et mot de passe accepté"
          }); 
        }
        console.log(req.session.userid);
      });
      return;
    } else {
        //Faux login : destruction de la session et erreur
        req.session.destroy((err) => {});
        console.log("Destruction du cookie")
        res.send({
          status: 401,
          message: "login et/ou le mot de passe invalide(s)"
        });
        return;
    }
  });

  //Chercher une information à partir de l'email fourni
  router.get('/users', async (req, res) => {
    try {
      const pseudo = req.query.pseudo; //Utilise req.query pour récupérer les paramètres de requête GET
      const user = await users.getUser(pseudo);
      if (!user) {
        res.status(404).json({ message: "User not found" });
      } else {
        console.log(user);
        res.status(200).json(user); //Envoyer les données de l'utilisateur dans la réponse
      }
    } catch (e) {
      res.status(500).send(e);
    }
  });

  //Récupérer les attributs d'une bdd
  router.get('/users/all',async (req, res) => {
    try {
      const allAccount = await users.getAllUsers();
      res.status(200).json(allAccount);
      } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs :", error);
        res.status(500).json({ message: "Erreur lors de la récupération des infos du compte" });
      }
  });

  //Récupérer de userid dans la session
  router.get("/session", (req, res) => {
    console.log(req.session)
    if (req.session && req.session.userid) {
      res.status(200).send({ userid: req.session.userid });
    } else {
        // Si le cookie n'est pas défini ou s'il manque le userid, on initialise avec login
      res.status(200).send({ userid: req.session.userid });
    }
});

  //Gestion de session et cookie lors d'une déconnexion 
  router.post('/logout', (req, res) => {
    //Détruit la session côté serveur
    req.session.destroy((err) => {
      if (err) {
        console.error('Erreur lors de la destruction de la session :', err);
        res.status(500).send('Erreur lors de la déconnexion');
      } else {
        //Efface le cookie côté client
        res.clearCookie('sessionID');
        res.status(200).send('Déconnexion réussie');
      }
    });
  });

  return router;
}

module.exports = init;  // Exportez la fonction init