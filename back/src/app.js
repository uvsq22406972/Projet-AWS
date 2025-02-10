const express = require("express");
const cors = require("cors"); // Importez cors
const apiRouter = require('./api.js');  // Importez le routeur
const path = require("path");
const session = require("express-session");

const { MongoClient } = require('mongodb');
const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);

const app = express();

app.use(cors({origin: 'http://localhost:5173', credentials: true}));

app.use(session({
    secret: "technoweb rocks",
    resave: true,
    saveUninitialized: false,

    cookie: { 
        maxAge: 1000 * 60 * 10, // 10 minutes
        secure: false,
        httpOnly: true,
    },

    userid: null
}));

app.use(express.static(path.join(__dirname, "../../frontend")));
const api = apiRouter(client);  // Initialisez le routeur avec client

app.use('/api', api);  // Utilisez le routeur comme middleware

module.exports = app;
