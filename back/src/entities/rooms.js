class Rooms {
  // Constructeur de la classe en appelant une bdd
  constructor(db) {
    this.db = db;
  }

   // Crée un compte utilisateur
   async createRoom(roomName, user) {
    try {
      const col1 = this.db.useDb("ProjetAWS").collection("Rooms"); //Accès au collection Compte
      await col1.insertOne({
         id : roomName,
         users : [user]
        });
    } catch (e) {
      console.error("Erreur lors de la création du compte :", e);
      throw e;  // Retourne l'erreur pour la traiter dans le composant React
    }
  }

  async deleteRoom(roomName) {
    try {
      const col1 = this.db.useDb("ProjetAWS").collection("Rooms");

      // Vérifie si lla room existe
      const room = await col1.findOne({ id: roomName });
      if (!room) {
        console.log("room introuvable !" ,roomName );
        return false;
      }
      console.log("testtestetstest");
      // Suppression de l'utilisateur
      const result = await col1.deleteOne({ id: roomName });
      if (result.deletedCount === 1) {
        console.log("Room supprimée avec succès.");
        return true;
      } else {
        console.log("Échec de la suppression du compte.");
        return false;
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du compte :", error);
      throw error;
    }
  }

  // Récupère la room d'un utilisateur
  async getRoomName(userId) {
    try {
      const col1 = this.db.useDb("ProjetAWS").collection("Rooms");
  
      // Chercher une room où l'userId est présent dans le tableau "users"
      return col1.findOne(
        { users: userId },
        { ...options, projection: { _id: 0, id: 1 } }
      ).then(room => room?.id);
    } catch (err) {
      console.error("Erreur lors de la récupération du roomname :", err);
      throw err;
    }
  }
  
  async getUsersInRoom(roomname) {
    try {
      const col1 = this.db.useDb("ProjetAWS").collection("Rooms");
      const room = await col1.findOne({id:roomname});   
      console.log(room);
      if(room == null) {
        return null;
      }  
      return room ? room.users : [];
    } catch (err) {
      console.error("Erreur lors de la récupération des utilisateurs :", err);
      throw err;
    }
  }

  async addUserToRoom(roomName, user) {
    if (!user) {
      console.log("User invalide, on n'ajoute pas.");
      return; // on arrête la fonction
    }
    const col1 = this.db.useDb("ProjetAWS").collection("Rooms");
    await col1.updateOne(
      { id: roomName },
      { $addToSet: { users: user } }
    );
    console.log("User ajouté");
  }

  async getAllRooms() {
    try {
        // 🔥 Utilisation directe de `this.db.useDb("ProjetAWS")`
        const db = this.db.useDb("ProjetAWS").collection("Rooms"); 

        // Vérification explicite de la collection "Rooms"
        const collectionExists = db.listCollections({ name: "Rooms" }).hasNext();
        
        if (!collectionExists) {
            console.log("❌ Aucune collection 'Rooms' trouvée");
            return [];
        }

        const roomsCollection = db.collection("Rooms");
        const rooms = await roomsCollection.find({}).toArray();

        // 🔥 Validation des données pour éviter les erreurs
        return rooms.map(room => {
            if (!room.id || !Array.isArray(room.users)) {
                console.warn("⚠️ Structure de room invalide:", room);
                return { name: "Inconnue", players: 0 };
            }
            return {
                name: room.id,
                players: room.users.length
            };
        });

    } catch (error) {
        console.error("🚨 Erreur critique dans getAllRooms:", error);
        throw new Error("Impossible de charger les salles");
    }
  }


  async removeUserFromRoom(roomName, user) {
    try {
      const col = this.db.useDb("ProjetAWS").collection("Rooms");
      
      // Vérifier que la room existe
      const roomExists = await col.findOne({ id: roomName });
      if (!roomExists) {
        console.error("Room non trouvée :", roomName);
        return false;
      }
  
      // Opération de mise à jour avec vérification
      const result = await col.updateOne(
        { id: roomName },
        { 
          $pull: { 
            users: { $eq: user } // Syntaxe explicite
          } 
        }
      );
  
      console.log("Résultat MongoDB:", JSON.stringify(result, null, 2));
      return result.modifiedCount > 0;
  
    } catch (error) {
      console.error("Erreur critique:", error.stack);
      throw error;
    }
  }
  
} 
exports.default = Rooms;
