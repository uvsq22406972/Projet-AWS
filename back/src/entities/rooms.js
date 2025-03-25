class Rooms {
  //Constructeur de la classe en appelant une bdd
  constructor(db) {
    this.db = db;
  }

   //Crée un room
   async createRoom(roomName, user) {
    try {
      const col1 = this.db.useDb("ProjetAWS").collection("Rooms");
      await col1.insertOne({
        id: roomName,
        users: [{ id: user, lives: 3 }]
      })
    } catch (e) {
      console.error("Erreur lors de la création du compte :", e);
      throw e;
    } 
  }

  //Supprimer un room
  async deleteRoom(roomName) {
    try {
      const col1 = this.db.useDb("ProjetAWS").collection("Rooms");

      // Vérifie si la room existe
      const room = await col1.findOne({ id: roomName });
      if (!room) {
        console.log("room introuvable !" ,roomName );
        return false;
      }

      // Suppression de l'utilisateur
      const result = await col1.deleteOne({ id: roomName });
      if (result.deletedCount === 1) {
        console.log("Room supprimée avec succès.");
        return true;
      } else {
        console.log("Échec de la suppression de la room.");
        return false;
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de la room :", error);
      throw error;
    }
  }

  // Récupère la room d'un utilisateur
  async getRoomName(userId) {
    try {
      const col1 = this.db.useDb("ProjetAWS").collection("Rooms");
      const room = await col1.findOne({ users: userId });

      return room ? room.id : null;
    } catch (err) {
      console.error("Erreur lors de la récupération du roomname :", err);
      throw err;
    }
  }
  
  //Recupere les utilisateurs d'un room
  async getUsersInRoom(roomname) {
    try {
      const col1 = this.db.useDb("ProjetAWS").collection("Rooms");
      const room = await col1.findOne({id:roomname});

      if(room == null) {
        return null;
      }  
      return room ? room.users : [];
    } catch (err) {
      console.error("Erreur lors de la récupération des utilisateurs :", err);
      throw err;
    }
  }

  //Ajouter un utilisateur dans la room
  async addUserToRoom(roomName, user) {
    if (!user) {
      return;
    }
    const col1 = this.db.useDb("ProjetAWS").collection("Rooms");
    await col1.updateOne(
      { id: roomName },
      { 
        $addToSet: { 
          users: { id: user, lives: 3 } 
        } 
      }
    );
    console.log("User ajouté");
  }

  //Afficher toutes les rooms sur la BDD
  async getAllRooms() {
    try {
      const db = this.db.db; 
      const collectionExists = await db.listCollections({ name: "Rooms" }).toArray();
      
      if (!collectionExists) {
          console.log("Aucune collection 'Rooms' trouvée");
          return [];
      }
      const rooms = await db.collection("Rooms").find({}).toArray();
      return rooms.map(room => {
        if (!room.id || !Array.isArray(room.users)) {
            console.warn("Structure de room invalide:", room);
            return { name: "Inconnue", players: 0 };
        }
        return {
            name: room.id,
            players: room.users.length
        };
      });
    } catch (error) {
      console.error("Erreur critique dans getAllRooms:", error);
      throw new Error("Impossible de charger les salles");
    }
  }

  //Afficher le gagnant d'un jeu
  async getWinner(roomName) {
    try {
      const col1 = this.db.useDb("ProjetAWS").collection("Rooms");
      const room = await col1.findOne({ id: roomName });
      console.log("Nom de la room getwinner", roomName);

      if (!room) {
        console.log("Room non trouvée : ",room);
        return null;
      }
  
      const winner = room.users.find(user => user.lives > 0);
  
      if (winner) {
        console.log("Gagnant trouvé:", winner);
        return winner; // Retourne le gagnant
      } else {
        console.log("Aucun gagnant trouvé dans la room");
        return null; // Aucun gagnant trouvé
      }

    } catch (error) {
      console.error("Erreur lors de la recherche du gagnant:", error);
      throw error;
    }
  }

  //Le joueur suivant
  async nextPlayer(roomName, currentUserId) {
    try {
      const col1 = this.db.useDb("ProjetAWS").collection("Rooms");
      const room = await col1.findOne({ id: roomName });
  
      if (!room) {
        console.log("Room non trouvée");
        return null;
      }

      const users = room.users;
  
      if (!Array.isArray(users) || users.length === 0) {
        console.log("Aucun utilisateur dans la room");
        return null;
      }

      const currentUserIndex = users.findIndex(user => user.id === currentUserId);
  
      if (currentUserIndex === -1) {
        console.log("Utilisateur actuel non trouvé dans la room");
        return null;
      }
      let nextUserIndex = currentUserIndex;
      let nextPlayer = null;
      let attempts = 0;

    // Chercher le prochain joueur vivant
      do {
        nextUserIndex = (nextUserIndex + 1) % users.length; // Passer au joueur suivant
        nextPlayer = users[nextUserIndex];
        attempts++;

        // Si on a fait le tour complet sans trouver de joueur vivant, sortir de la boucle
        if (attempts >= users.length) {
          console.log("Aucun joueur vivant trouvé dans la room");
          return null;
        }
      } while (nextPlayer.lives <= 0);
        
      
      return nextPlayer;
    } catch (error) {
      console.error("Erreur lors de la recherche du prochain joueur:", error);
      throw error;
    }
  }

  //Verifier si une salle existe ou pas
  async exist(roomname) {
    const col1 = this.db.useDb("ProjetAWS").collection("Rooms");
    const room = await col1.findOne({ id: roomname });
    console.log("Voici la room :",room)
    return room;
  }

  //Supprimer un user de la room
  async removeUserFromRoom(roomName, user) {
    try {
      const col = this.db.useDb("ProjetAWS").collection("Rooms");
      
      const roomExists = await col.findOne({ id: roomName });
      if (!roomExists) {
        console.error("Room non trouvée :", roomName);
        return false;
      }
  
      const result = await col.updateOne(
        { id: roomName },
        { $pull: { users: { id: user } } }
      );
  
      console.log("Résultat MongoDB:", JSON.stringify(result, null, 2));
      return result.modifiedCount > 0;
  
    } catch (error) {
      console.error("Erreur critique:", error.stack);
      throw error;
    }
  }
  
  //Modifie les vies au démarrrage de la partie
  async changeLives(roomName,lives) {
    const col1 = this.db.useDb("ProjetAWS").collection("Rooms");
    
    try {
      const result = await col1.updateOne(
        { id: roomName },
        { $set: { "users.$[].lives": lives } }
      );

      if (result.matchedCount === 0) {
        console.log("Room non trouvé.");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Erreur lors de la mise à jour des vies :", error);
      throw error;
    }
  }

   //Perds une vie a l'utilisateur donnée
   async loseLife(roomName, userId) {
    const col = this.db.useDb("ProjetAWS").collection("Rooms");
    
    // Opération atomique
    const result = await col.findOneAndUpdate(
      { 
        id: roomName,
        "users.id": userId,
        "users.lives": { $gt: 0 } // Bloque si déjà à 0
      },
      { $inc: { "users.$.lives": -1 } }, // Décrémentation atomique
      { returnDocument: 'after' }
    );
  
    if (!result.value) {
      return { updated: false, gameOver: false };
    }
    
    const alivePlayers = result.value.users.filter(u => u.lives > 0);
    return {
      updated: true,
      gameOver: alivePlayers.length <= 1
    };
  }

  //Verifier si c'est game over
  async checkGameOver(roomName) {
    try {
        const col1 = this.db.useDb("ProjetAWS").collection("Rooms");
        const room = await col1.findOne({ id: roomName });
        if (!room) {
          console.log("Room non trouvée");
          return false;
        }
      const users = room.users;
      if (!Array.isArray(users) || users.length === 0) {
        console.log("Aucun utilisateur dans la room");
        return false;
      }

      // On Compte le nombre de joueurs ayant des vies restantes
      const alivePlayers = users.filter(user => user.lives > 0);
      if (alivePlayers.length === 1) {
        console.log("La partie est terminée :1 joueurs a des vies restantes");
        return false;
      }
      console.log("La partie continue : au moins 2 joueurs ont des vies restantes");
      return true;
    } catch (error) {
      console.error("Erreur lors de la vérification de l'état de la partie :", error);
      throw error;
    }
  }
  
} 
exports.default = Rooms;
