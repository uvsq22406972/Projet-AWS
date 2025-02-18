const express = require('express');
const Users = require("./entities/users.js");

function init(db){
  // Initialisation router
  const router = express.Router();
  router.use(express.json());

  // Initialisation des entités
  const users = new Users.default(db);

  // Validation du mot de passe
  const validatePassword = (password) => {
    // Vérifie si le mot de passe a au moins 8 caractères, un chiffre et un symbole
    const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*?.])[A-Za-z0-9!@#$%^&*?.]{8,}$/;
    return regex.test(password);
  };

  // Permet la création d'un compte
  router.put('/users', async (req, res) => {
    // Initialisation des variables récupérées du front
    const pseudo = req.body.pseudo;
    const email = req.body.email;
    const mdp1 = req.body.mdp1;
    const mdp2 = req.body.mdp2;
    const exist = await users.exist(pseudo); // True si pseudo existe, false sinon

    // Vérifie si tous les champs sont remplis
    if (!pseudo || !mdp1 || !mdp2 || !email) {
      return res.send({ message: "Tous les champs sont nécessaires" });
    }

    // Vérifie si les mots de passe sont identiques
    if (mdp1 !== mdp2) {
      return res.send({ message: "Les mots de passe ne correspondent pas" });
    }

    // Vérifie si le mot de passe respecte les critères
    if (!validatePassword(mdp1)) {
      return res.send({
        message: "Le mot de passe doit comporter au moins 8 caractères, un chiffre et un symbole.",
      });
    }

    // Vérifie si l'email est déjà utilisé
    if (exist) {
      return res.send({ message: "Email déjà utilisé" });
    }

    try {
      await users.creerCompte(pseudo, email, mdp1, mdp2);
      return res.status(200).send({ message: "Utilisateur créé avec succès" });
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur :", error);
      return res.status(500).send({ message: "Erreur lors de la création de l'utilisateur" });
    }
  });

  // Création d'une session
  router.post('/users', async (req, res) => {
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
      req.session.regenerate(function (err) {
        if (err) {
          res.send({ status: 500, message: "Erreur interne" });
        } else {
          req.session.userid = login;
          res.send({ status: 200, message: "Login et mot de passe accepté" });
        }
      });
      return;
    } else {
      req.session.destroy((err) => {});
      res.send({ status: 401, message: "login et/ou le mot de passe invalide(s)" });
      return;
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

    // Vérifier que tous les champs sont fournis
    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires" });
    }

    // Vérifier si le nouveau mot de passe respecte les critères de sécurité
    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        message: "Le mot de passe doit comporter au moins 8 caractères, un chiffre et un symbole.",
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
      await users.updatePassword(email, newPassword);

      return res.status(200).json({ message: "Mot de passe mis à jour avec succès" });

    } catch (error) {
      console.error("Erreur lors de la modification du mot de passe :", error);
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

  return router;
}

module.exports = init;
