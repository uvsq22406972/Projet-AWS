//Initialisation des variables
const express = require("express");
const cors = require("cors"); 
const apiRouter = require('./api.js');
const path = require("path");
const session = require("express-session");

//Initialisation du BDD -> MongoDB
const { MongoClient } = require('mongodb');
const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);

const app = express();

//Localhost
app.use(cors({origin: 'http://localhost:3000', credentials: true}));

//Session
app.use(session({
    secret: "projetAWS cool",
    resave: true,
    saveUninitialized: false,

    cookie: { 
        maxAge: 1000 * 60 * 10, // 10 minutes
        secure: false,
        httpOnly: true,
    },

    userid: null
}));

app.use(express.static(path.join(__dirname, "../../frontend"))); //Chemin où se trouve le front
const api = apiRouter(client);  //Initialiser le routeur avec client

app.use('/api', api);  // Utiliser le routeur comme middleware

module.exports = app;
