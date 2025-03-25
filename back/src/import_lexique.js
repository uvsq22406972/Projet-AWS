//const { MongoClient } = require('mongodb');
const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require("mongoose");
require("dotenv").config();
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("ERREUR: MONGO_URI n'est pas défini dans .env !");
    process.exit(1); // Arrête le serveur
  }

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
    console.log("Connexion à MongoDB réussie !");
    importLexique();
    })
.catch(err => console.error("Erreur MongoDB:", err));

async function importLexique() {
    try {
        const db = mongoose.connection.useDb("ProjetAWS");
        const collection = db.collection("mots");


        const words = [];
        const seen = new Set();


        // Lire le fichier CSV et extraire la colonne "1_ortho"
        fs.createReadStream("Lexique383.csv", { encoding: 'latin1' })
            .pipe(csv({ separator: ';' })) // Lexique utilise ";" comme séparateur
            .on('data', (row) => {
                const ortho = row["1_ortho"]?.trim();
                if (ortho && !seen.has(ortho)) {
                    seen.add(ortho);
                    words.push({ mot: ortho.trim() }); // Ajouter uniquement les mots
                }
            })
            .on('end', async () => {
                console.log(`Importation de ${words.length} mots...`);
                if (words.length > 0) {
                    await collection.insertMany(words);
                    console.log("✅ Importation terminée !");
                } else {
                    console.log("⚠ Aucun mot à importer !");
                }
            })
            .on('error', (err) => {
                console.error("Erreur de lecture du fichier CSV:", err);
            });

    } catch (err) {
        console.error("Erreur de connexion à MongoDB:", err);
    }
}

importLexique();
