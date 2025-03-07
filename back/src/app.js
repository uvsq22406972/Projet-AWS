const express = require("express");
const cors = require("cors");
const apiRouter = require("./api.js");
const path = require("path");
const session = require("express-session");
const axios = require("axios");
const helmet = require("helmet");
const crypto = require("crypto");
const WebSocket = require("ws");

// Initialisation de la BDD -> MongoDB
const { MongoClient } = require("mongodb");
const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);

const app = express();
const port = 4001; // Port Express
const wsPort = 4002; // Port WebSocket

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
  })
);

// Middleware de sécurité
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
app.get("/verify-word", async (req, res) => {
  try {
      await client.connect();
      const db = client.db("dictionnaire");
      const collection = db.collection("mots");
      
      const { word } = req.query;
      if (!word) {
          return res.status(400).json({ valid: false, error: "Aucun mot fourni." });
      }

      const found = await collection.findOne({ mot: word.toLowerCase() });
      res.json({ valid: !!found });
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur serveur" });
  } finally {
      await client.close();
  }
});


// Middleware CSRF
app.use((req, res, next) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString("hex");
  }
  res.locals.csrfToken = req.session.csrfToken;
  next();
});

app.post("/form-submit", (req, res) => {
  const { csrf } = req.body;

  if (!csrf || csrf !== req.session.csrfToken) {
    return res.status(403).json({ success: false, message: "Token CSRF invalide" });
  }

  res.json({ success: true, message: "Formulaire validé !" });
});

/* ************* Endpoint pour générer une séquence ************* */
app.get("/random-sequence", async (req, res) => {
  try {
    await client.connect();
    const db = client.db("dictionnaire");
    const collection = db.collection("mots");

    // Sélectionner un mot aléatoire
    const randomWord = await collection.aggregate([{ $sample: { size: 1 } }]).toArray();
    if (randomWord.length === 0) {
      return res.status(500).json({ error: "Aucun mot trouvé." });
    }

    const mot = randomWord[0].mot;
    // Extraire une séquence de 2-3 lettres
    const start = Math.floor(Math.random() * (mot.length - 2));
    const sequence = mot.substring(start, start + 2 + Math.floor(Math.random() * 2));

    res.json({ sequence });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* ************* WebSocket Server ************* */
const wss = new WebSocket.Server({ port: wsPort });

let rooms = {
  'test': { room: 'test', users: [] } // room de test pour la rejoindre
};

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    const data = JSON.parse(message);
    console.log(`Message reçu: ${data.type}`);

    if (data.type === "create_room") {
      const roomName = data.room;
      const user = data.user;

      if (!rooms[roomName]) {
        rooms[roomName] = { users: [] };
      }
      rooms[roomName].users.push(user);

      ws.send(
        JSON.stringify({
          message: `Room ${roomName} créée !`,
          room: roomName,
          users: rooms[roomName].users,
        })
      );
    }

    if (data.type === "join_room") {
      const roomName = data.room;
      const user = data.user;

      if (!rooms[roomName]) {
        console.log("aucune room trouvé");
        ws.send(
          JSON.stringify({
            type: "no_room",
          })
        );
        return;
      }
      rooms[roomName].users.push(user);

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              room: roomName,
              users: rooms[roomName].users,
            })
          );
        }
      });
    }

    if (data.type === "get_users") {
      const roomName = data.room;

      if (rooms[roomName]) {
        ws.send(
          JSON.stringify({
            type: "users_list",
            room: roomName,
            users: rooms[roomName].users,
          })
        );
      } else {
        ws.send(
          JSON.stringify({
            type: "error",
            message: `La room ${roomName} n'existe pas.`,
          })
        );
      }
    }

    if (data.type === "start_game") {
      const roomName = data.room;
      console.log(`Le jeu commence dans la room: ${roomName}`);

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type: "game_started",
              room: roomName,
            })
          );
        }
        });
      }
      if (data.type === "leave_room") {
        const roomName = data.room;
        const user = data.user;
  
        // Vérifier si la room existe
        if (rooms[roomName]) {
          // Retirer l'utilisateur de la room
          const userIndex = rooms[roomName].users.indexOf(user);
          if (userIndex !== -1) {
            rooms[roomName].users.splice(userIndex, 1); // Supprimer l'utilisateur de la salle
            console.log(`${user} a quitté la room ${roomName}`);
          }
          // si la room est vide, on la supprime
        if (rooms[roomName] && rooms[roomName].users.length === 0) {
          delete rooms[roomName];
          console.log(`La room ${roomName} a été supprimée car elle est vide.`);
          return;
        }


  
          // Envoyer la mise à jour aux autres clients de la room
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(
                JSON.stringify({
                  room: roomName,
                  users: rooms[roomName].users,
                })
              );
            }
          });
        }
  
        // Fermer la connexion WebSocket de l'utilisateur
        ws.close();  // Fermer la connexion WebSocket
      }
  });

  ws.on("close", () => {
    console.log("Un utilisateur a quitté la room");
  });
});

app.listen(port, () => {
  console.log(`Serveur Express démarré sur http://localhost:${port}`);
});

console.log(`Serveur WebSocket à l'écoute sur le port ${wsPort}`);

module.exports = app;
