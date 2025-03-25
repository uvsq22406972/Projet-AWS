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

// Initialisation de la BDD -> MongoDB
const { MongoClient } = require("mongodb");
const uri = "mongodb://127.0.0.1:27017";
// Remplacer la connexion actuelle par :
const client = new MongoClient(uri, {
  maxPoolSize: 15,
  minPoolSize: 5,
  serverSelectionTimeoutMS: 5000,
});

// Ajouter au début de app.js
let db;
async function initMongoDB() {
  await client.connect();
  db = client.db("DB");
  console.log("🗄️ Connexion MongoDB établie !");
}
initMongoDB();

axios.defaults.baseURL = 'http://localhost:4000';
axios.defaults.withCredentials = true;
const app = express();
const port = 4001; // Port Express
const wsPort = 4002; // Port WebSocket

const allowedOrigins = [
  "http://localhost:3000", // Dev local
];

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
app.use(express.static(path.join(__dirname, "../../front")));

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
      if (!data.user) {
        ws.send(JSON.stringify({ 
          type: "error", 
          message: "Nom d'utilisateur invalide" 
        }));
        return;
      }
      
      const generatedRoomName = 'room-' + Math.random().toString(36).substring(2, 8);
      console.log("Room générée:", generatedRoomName);

      const reponse = axios.put(`api/rooms`,{
        id : generatedRoomName,
        user : data.user
      });
      //retour utilisateur
      ws.send(
        JSON.stringify({
          type: 'generatedRoom',
          message: `Room ${generatedRoomName} créée !`,
          room: generatedRoomName,
          // On met directement le créateur dans un tableau
          users: [{ id: data.user, lives: 3 }],
        })
      );
    }

    if (data.type === "join_room") {
      const roomName = data.room;
      console.log("données recu on join" ,data);
      try {
        const res = await axios.post(`api/addUserToRoom`,{
          room: roomName,
          user:data.user
        });
        if(res.data.status === 200) {
          console.log("Envoi du message WebSocket :");
          ws.send(
            JSON.stringify({
              type: "ok",
              room:roomName,
              message: `Room rejointe`,
            })
          );
        } else { 
          ws.send(
          JSON.stringify({
            type: "no_room",
            message: `La room ${roomName} n'existe pas.`,
          })
        );
      }
        
    
       } catch (error) {
        console.log("Erreur inattendue ",error)
      }
      
    }

    if (data.type === "get_users") {
     const roomName = data.room;
      try {
        const resp = await axios.get(`api/getUsersFromRoom`, { params: { room: roomName } });
        const roomUsers = resp.data || [];

        // Adapte le champ 'id' en 'username'
        const usersToSend = roomUsers.map(u => ({
          id: u.id,
          lives: u.lives,
        }));
        if (resp) {
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(
                JSON.stringify({
                  type: "users_list",
                  room: roomName,
                  users: usersToSend
                })
              );
            }
            });
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
      const lives = data.lives;
        if(lives != 3) {
         //    console.log("Attention : lives =", lives ," et la room ", roomName)
          const resp = await axios.post(`api/modifyLives`,{
          
           room : roomName,
           lives : lives
          
         });
        }
        
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
      if (data.type === "game_over") {  
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "game_over"
              })
            );
          }
          });
        }
        if (data.type === "leave_room") {
          const roomName = data.room;
          const userToRemove = data.user;
        
          try {
            // 1) Retirer l'utilisateur
            await axios.post(`api/removeUserFromRoom`, {
              room: roomName,
              user: userToRemove
            });
        
            // 2) Récupérer la room mise à jour
            const resp = await axios.get(`api/getUsersFromRoom`, { params: { room: roomName } });
            const updatedUsers = resp.data; // ex: [ { id: "abc", lives: 3 }, ... ]
        
            // 3) Vérifier si c'est vide (plus personne)
            if (!updatedUsers || updatedUsers.length === 0) {
              console.log("Dernier utilisateur parti, on supprime la room...");
              await axios.delete(`api/rooms`, { data: { room: roomName } });
              wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                  client.send(
                    JSON.stringify({
                      type: "room_deleted",
                      room: roomName
                    })
                  );
                }
              });
            } else {
              console.log("Il reste encore des joueurs, la room est conservée.");
            }
        
          } catch (error) {
            console.error("Erreur lors du leave_room :", error);
          }
        }
        
      if (data.type === 'lose_life'){
        handleLoseLife(data);
      }
      if(data.type === 'validate_word'){
        handleValidateWord(ws, data);
      }

      if(data.type === 'sequence'){
        const seq = data.seq;
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "get_sequence",
                sequence : seq
              })
            );
          }
          });

      }

      if(data.type === 'update_timer') {
        getNextPlayerAndSend(data.room,data.user);
        //On leur envoie le dernier mot écrit par le joueur
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "get_inputValue",
                value:data.iv
              })
            );
          }
          });
      }

      if(data.type === "change_lives") {
        const roomName = data.room;
        const lives = data.lives
        const resp = await axios.post(`api/modifyLives`,{
          params : {
           room : roomName,
           lives : lives
          }
         });
      }

  });
  
  async function handleLoseLife(data) {
    const roomname = data.room;
    const userid  = data.user;
    // Envoie a l'api du back pour gérer la perte de vie
    const response = await axios.post(`api/loseLife`, {
      room : roomname,
      user : userid
    })
    if(response.data.status === 200) {
      await getNextPlayerAndSend(roomname,userid);
    }
    else {
      const respWinner = await axios.get(`api/getWinner`, {
       params : { room: roomname}
      })
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type: "game_over",
              winner : respWinner.data.winner
            })
          );
        }
        });
    }
    
    // Envoyer a tous les clients la maj
  }
  
  //Renvoie a tous les clients le currentPlayer et ils reinitialiseront 
  //leurs timers en recevant ces données
  async function getNextPlayerAndSend(roomname, userid) {
    const resp = await axios.get(`api/getUsersFromRoom`, { params: { room: roomname } });
      const nextPlayer = await axios.get(`api/getNextPlayer`, { params: { room: roomname, user : userid } });
      console.log("envoie des données :", nextPlayer.data);
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type: "reset_timer",
              users : resp.data,
              newCurrentPlayer : nextPlayer.data.nextPlayer
            })
          );
        }
        });
  }

});

app.listen(port, () => {
  console.log(`Serveur Express démarré sur http://localhost:${port}`);
});

console.log(`Serveur WebSocket à l'écoute sur le port ${wsPort}`);

module.exports = app;
