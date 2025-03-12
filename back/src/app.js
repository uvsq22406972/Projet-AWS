const express = require("express");
const cors = require("cors");
const apiRouter = require("./api.js");
const path = require("path");
const session = require("express-session");
const axios = require("axios");
const helmet = require("helmet");
const crypto = require("crypto");
const WebSocket = require("ws");
const Rooms = require("./entities/rooms.js");
const mongoose = require("mongoose");

// Initialisation de la BDD -> MongoDB
const { MongoClient } = require("mongodb");
const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://naufalstrs14:1HGcla39nyRjd7DQ@projetaws.dyqsl.mongodb.net/?retryWrites=true&w=majority&appName=ProjetAWS";

axios.defaults.baseURL = 'http://51.21.180.103:4000';
axios.defaults.withCredentials = true;
const app = express();
const port = 4001; // Port Express
const wsPort = 4002; // Port WebSocket

const allowedOrigins = [
  "http://localhost:3000", // Dev local
  "https://votre-app.amplifyapp.com" // URL du frontend Amplify
];

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("🟢 Connexion à MongoDB réussie !"))
.catch(err => console.error("🔴 Erreur MongoDB:", err));

// Middleware pour parser le JSON
app.use(express.json());

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Route de test pour vérifier que le serveur répond
app.get("/", (req, res) => {
  res.send("Le backend fonctionne !");
});

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
const wss = new WebSocket.Server({ port: wsPort, host: '0.0.0.0' });

wss.on("connection", async (ws) => {
  await client.connect();
  const db = client.db("DB");
  const collection = db.collection("Rooms");
  ws.on("message",async (message) => {
    const data = JSON.parse(message);
    console.log(`Message reçu: ${data.type}`);

    if (data.type === "create_room") {
      const generatedRoomName = 'room-' + Math.random().toString(36).substring(2, 8);
      console.log("Room générée:", generatedRoomName);

      const reponse = axios.put(`api/rooms`,{
        id : generatedRoomName,
        user : data.user
      });
      //retour utilisateur
      ws.send(
        JSON.stringify({
          type:'generatedRoom',
          message: `Room ${generatedRoomName} créée !`,
          room: generatedRoomName,
          users: data.user,
        })
      );
    }

    if (data.type === "join_room") {
      const roomName = data.room;
      console.log("données recu on join" ,data);
      try {
        const resp = await axios.get(`api/getUsersFromRoom`, { params: { room: roomName } });
        if (resp.status === 200) {
          console.log("Envoi du message WebSocket :");
            ws.send(
              JSON.stringify({
                type: "cool",
                room:roomName,
                message: `Room rejointe`,
              })
            );
          await axios.post(`api/addUserToRoom`,{
            room: roomName,
            user:data.user
          });
        }
       } catch (error) {
        ws.send(
          JSON.stringify({
            type: "no_room",
            message: `La room ${roomName} n'existe pas.`,
          })
        );
      }
      
    }

    if (data.type === "get_users") {
     const roomName = data.room;
     console.log("aojzebcpaoje cpjia éé",roomName)
      try {
       
        const resp = await axios.get(`api/getUsersFromRoom`, { params: { room: roomName } });
        console.log("ceci est un test",resp);
        if (resp) {
          ws.send(
            JSON.stringify({
              type: "users_list",
              room: roomName,
              users: resp.data, 
            })
          );
          console.log("ceci est les datas envoyés :",resp.data);
        }
      } catch (error) {
        ws.send(
          JSON.stringify({
            type: "error",
            message: `La room ${roomName} n'existe pas.`,
          })
        );
      }
    }

    if (data.type === "get_room") {
       try {
        console.log(data);
        const resp = axios.get(`api/getRoomFromUsers`,{ params: {user:data.user}});
       
        if(resp.status === 200) {
          ws.send( 
            JSON.stringify({
              type:'dataRoom',
              room: resp.data
            })
          );
        }
      } 
       catch (error) {
         ws.send(
           JSON.stringify({
             type: "error",
             message: `erreur inattendu.`,
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
        console.log("data envoyé : ",roomName )
        const resp = await axios.get(`api/getUsersFromRoom`,{
         params : {
          room : roomName
         }
        }) ;
        const usersFound = resp.data;
        console.log("message recu ",usersFound);
        console.log("Type de usersFound :", typeof usersFound, usersFound);

        if(usersFound.length === 1 && usersFound[0] == user)
          {
            const reponse = await axios.delete(`api/rooms`,{
              data: { 
                room: roomName,
                user: data.user
              }
            });
          }
        else {
          const response = await axios.post(`api/removeUserFromRoom`, {
            room : roomName,
            user : data.user
          })
        }
      }
  });
  const sendToGameRoom = (data) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      setTimeout(() => {
        console.log('Envoi des données à GameRoom après 3 secondes :', data);
        ws.send(JSON.stringify(data)); // Envoie les données à GameRoom via WebSocket
      }, 3000);
    } else {
      console.warn('WebSocket n\'est pas prêt pour envoyer des données');
    }
  };

  ws.on("close", () => {
    console.log("Un utilisateur a quitté la room");
  });
});

app.listen(port, () => {
  console.log(`Serveur Express démarré sur http://localhost:${port}`);
});

console.log(`Serveur WebSocket à l'écoute sur le port ${wsPort}`);

module.exports = app;
