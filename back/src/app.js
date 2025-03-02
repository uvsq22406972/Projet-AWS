// Initialisation des variables
const express = require("express");
const cors = require("cors");
const apiRouter = require("./api.js");
const path = require("path");
const session = require("express-session");
const axios = require("axios");
const helmet = require('helmet');
const crypto = require("crypto");
const WebSocket = require("ws");

// Initialisation de la BDD -> MongoDB
const { MongoClient } = require("mongodb");
const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);

const app = express();

// Middleware pour parser le JSON
app.use(express.json());

// Localhost - Autoriser le front à se connecter au serveur
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// Gestion des sessions
app.use(
  session({
    secret: "projetAWS cool",
    resave: true,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 10, // 10 minutes
      secure: false,
      httpOnly: true,
    },
    userid: null,
  })
);

// Middleware pour éviter failles XSS
app.use(helmet());

// Middleware pour servir le frontend
app.use(express.static(path.join(__dirname, "../../frontend")));

// Initialisation de l'API MongoDB
const api = apiRouter(client);
app.use("/api", api);

// Vérification du reCAPTCHA v2
app.post("/verify-recaptcha", async (req, res) => {
  const { recaptchaToken } = req.body;

  if (!recaptchaToken) {
    return res.status(400).json({ success: false, message: "reCAPTCHA requis" });
  }

  try {
    const secretKey = "6LdtjdcqAAAAAGo9WtRV006GfNpedYFJS6Hlf5ed"; 
    const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;

    const { data } = await axios.post(verificationURL);

    if (data.success) {
      res.json({ success: true, message: "reCAPTCHA validé avec succès" });
    } else {
      res.status(401).json({ success: false, message: "Échec de la vérification reCAPTCHA" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur reCAPTCHA" });
  }
});
//Middleware pour générer et stocker le token CSRF en session
app.use((req, res, next) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString("hex"); // Génère un token aléatoire
  }
  res.locals.csrfToken = req.session.csrfToken; // Rend le token accessible aux templates
  next();
});
app.post("/form-submit", (req, res) => {
  const { csrf } = req.body; // Récupère le token du formulaire

  if (!csrf || csrf !== req.session.csrfToken) {
    return res.status(403).json({ success: false, message: "Token CSRF invalide" });
  }

  res.json({ success: true, message: "Formulaire validé !" });
});

/* *************      Partie WebSocket                    ************************** */

// Pour stocker les rooms et les utilisateurs
let rooms = {};

// Créer le serveur WebSocket
const wss = new WebSocket.Server({ port: 4001 });

wss.on('connection', (ws) => {
  //console.log('Un utilisateur s est connecté');

  // Quand le serveur reçoit un message
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    console.log(`Message reçu: ${data.type}`);
    console.log(rooms);
    // Créer une room
    if (data.type === 'create_room') {
      console.log(data);
      const roomName = data.room;
      console.log(roomName);
      const user = data.user;
      if (!rooms[roomName]) {
          rooms[roomName] = { users: [] };
      }  
      rooms[roomName].users.push(user);
      console.log(`${user} a rejoint la room ${roomName}`);
      
      // Envoyer l'information aux clients dans la room
      ws.send(JSON.stringify({
        message: `Room ${roomName} créée !`,
        room:roomName,
        users: data.user,
      }));
    }

    // Rejoindre une room
    if (data.type === 'join_room') {
      const roomName = data.room;
      const user = data.user;

      if (!rooms[roomName]) {
        rooms[roomName] = { users: [] };
      }

      rooms[roomName].users.push(user);
      console.log(`${user} a rejoint la room ${roomName}`);

      // Informer tous les utilisateurs dans la room
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            room: roomName,
            users: rooms[roomName].users,
          }));
        }
      });
    }
    //récupération des users (fetch)
    if (data.type === 'get_users') {
      const roomName = data.room;

      if (rooms[roomName]) {
        // Si la room existe, renvoyer la liste des utilisateurs
        ws.send(JSON.stringify({
          type: 'users_list',
          room: roomName,
          users: rooms[roomName].users,
        }));
      } else {
        // Si la room n'existe pas
        ws.send(JSON.stringify({
          type: 'error',
          message: `La room ${roomName} n'existe pas.`,
        }));
      }
    }
    // Démarrer le jeu
    if (data.type === 'start_game') {
      const roomName = data.room;
      console.log(`Le jeu commence dans la room: ${roomName}`);

      // Informer tous les utilisateurs dans la room
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'game_started',
            room: roomName,
          }));
        }
      });
    }
  });

  // Gérer la fermeture de la connexion WebSocket
  ws.on('close', () => {
    //console.log('Un utilisateur a quitté la room');
  });
});

console.log('Serveur WebSocket à l\'écoute sur le port 4000');


module.exports = app;
