class Rooms {
  // Constructeur de la classe en appelant une bdd
  constructor(db) {
    this.db = db;
  }

   // Crée un une room
   async createRoom(roomName, user) {
    try {
      const col1 = this.db.useDb("ProjetAWS").collection("Rooms"); //Accès au collection Compte
      await col1.insertOne({
        id: roomName,
        users: [{ id: user, lives: 3 }] // user est maintenant un objet avec un champ `lives`
      })
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
  
      // Chercher une room où l'userId est présent dans le tableau "users"
      const room = await col1.findOne({ users: userId });
      console.log(room);
      // Si une room est trouvée, retourne son nom
      return room ? room.id : null;
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
      { 
        $addToSet: { 
          users: { id: user, lives: 3 } 
        } 
      }
    );
    console.log("User ajouté");
  }

  async getAllRooms() {
    try {
        // 🔥 Utilisation directe de `this.db.useDb("ProjetAWS")`
        const db = this.db.db; 

        // Vérification explicite de la collection "Rooms"
        const collectionExists = await db.listCollections({ name: "Rooms" }).toArray();
        
        if (!collectionExists) {
            console.log("❌ Aucune collection 'Rooms' trouvée");
            return [];
        }

        const rooms = await db.collection("Rooms").find({}).toArray();

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
      console.error("Erreur critique dans getAllRooms:", error);
      throw new Error("Impossible de charger les salles");
    }
  }
  async getWinner(roomName) {
    try {
      const col1 = this.db.useDb("ProjetAWS").collection("Rooms");
      const room = await col1.findOne({ id: roomName });
      console.log("Nom de la room getwinner", roomName)
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
      throw error; // Propagez l'erreur pour la gérer dans la route
    }
  }

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
      let attempts = 0; // Pour éviter une boucle infinie

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
      throw error; // Propagez l'erreur pour la gérer dans la route
    }
  }

  async exist(roomname) {
    const col1 = this.db.useDb("ProjetAWS").collection("Rooms");
    const room = await col1.findOne({ id: roomname });
    console.log("Voici la room :",room)
    return room;
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
      // Mettre à jour les vies de l'utilisateur dans la room
      const result = await col1.updateOne(
        { id: roomName }, // Filtre : trouver la room et l'utilisateur
        { $set: { "users.$[].lives": lives } } // Mettre à jour le champ `lives` de l'utilisateur
      );

      if (result.matchedCount === 0) {
        console.log("Room  non trouvé.");
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
    try {
     
      const col1 = this.db.useDb("ProjetAWS").collection("Rooms");
  
      //la room
      const room = await col1.findOne({ id: roomName });
      if (!room) {
        throw new Error(`Room ${roomName} non trouvée.`);
      }
      //L'user da,s la room
      const user = room.users.find(user => 
        user.id === userId);
      if (!user) {
        throw new Error(`Utilisateur ${userId} non trouvé dans la room ${roomName}.`);
      }
        const result = await col1.updateOne(
          { id: roomName, "users.id": userId }, // Filtre : trouver la room et l'utilisateur
          { $set: { "users.$.lives": user.lives - 1 } } // Réduire les vies de 1 pour cet utilisateur
        );
  
        console.log(`Vies de l'utilisateur ${userId} mises à jour à ${user.lives - 1} dans la room ${roomName}`);
        return (user.lives-1) >= 1;
  
  
    } catch (error) {
      console.error("Erreur survenue lors de la perte de vie :", error);
      throw error; // Propager l'erreur pour une gestion externe
    }
  }

  async checkGameOver(roomName) {
    try {
        const col1 = this.db.useDb("ProjetAWS").collection("Rooms");
        const room = await col1.findOne({ id: roomName });
        if (!room) {
          console.log("Room non trouvée");
          return false; // Si la room n'existe pas, on considére que la partie est terminée
        }
      const users = room.users;
      if (!Array.isArray(users) || users.length === 0) {
        console.log("Aucun utilisateur dans la room");
        return false; // pareil si la room est vide, on considére que la partie est terminée
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
      throw error; // Propagez l'erreur pour la gérer dans la route
    }
  }
  
} 
exports.default = Rooms;