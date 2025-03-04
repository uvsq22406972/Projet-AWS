const { MongoClient } = require('mongodb');
const fs = require('fs');
const csv = require('csv-parser');

const uri = "mongodb://localhost:27017"; // Mets ton URI MongoDB si nécessaire
const client = new MongoClient(uri);

async function importLexique() {
    try {
        await client.connect();
        const db = client.db("dictionnaire");
        const collection = db.collection("mots");

        let words = [];

        // Lire le fichier CSV et extraire la colonne "1_ortho"
        fs.createReadStream("Lexique383.csv", { encoding: 'utf8' })
            .pipe(csv({ separator: ';' })) // Lexique utilise ";" comme séparateur
            .on('data', (row) => {
                if (row['1_ortho']) {
                    words.push({ mot: row['1_ortho'].trim() }); // Ajouter uniquement les mots
                } else {
                    console.log("Aucun mot trouvé dans cette ligne.");
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
                client.close();
            })
            .on('error', (err) => {
                console.error("Erreur de lecture du fichier CSV:", err);
                client.close();
            });

    } catch (err) {
        console.error("Erreur de connexion à MongoDB:", err);
        client.close();
    }
}

importLexique();
