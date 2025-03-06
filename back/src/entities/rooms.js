class Rooms {
  // Constructeur de la classe en appelant une bdd
  constructor(db) {
    this.db = db;
  }

   // Crée un compte utilisateur
   async createRoom(roomName, user) {
    try {
      await this.db.connect();
      const col1 = this.db.db("DB").collection("Rooms"); //Accès au collection Compte
      await col1.insertOne({
         id : roomName,
         users : [user]
        });
    } catch (e) {
      console.error("Erreur lors de la création du compte :", e);
      throw e;  // Retourne l'erreur pour la traiter dans le composant React
    } finally {
      await this.db.close();
    }
  }

  async deleteRoom(roomName) {
    try {
      await this.db.connect();
      const col1 = this.db.db("DB").collection("Rooms");

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
    } finally {
      await this.db.close();
    }
  }

  // Récupère la room d'un utilisateur
  async getRoomName(userId) {
    try {
      await this.db.connect(); 
      const col1 = this.db.db("DB").collection("Rooms");
  
      // Chercher une room où l'userId est présent dans le tableau "users"
      const room = await col1.findOne({ users: userId });
  
      // Si une room est trouvée, retourne son nom
      return room ? room.roomname : null;
    } catch (err) {
      console.error("Erreur lors de la récupération du roomname :", err);
      throw err;
    }
  }
  
  async getUsersInRoom(roomname) {
    try {
      await this.db.connect();
      const col1 = this.db.db("DB").collection("Rooms");
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
    await this.db.connect();
    const col1 = this.db.db("DB").collection("Rooms");
    await col1.updateOne(
      { id: roomName }, // Filtre : Trouver la room par son id
      { $push: { users: user } } // Ajout du user dans le tableau
    );
    console.log("User ajouté");
  }

  async removeUserFromRoom(roomName, user) {
    await this.db.connect();
    const col1 = this.db.db("DB").collection("Rooms");
    await col1.updateOne(
      { id: roomName }, // Filtre : Trouver la room par son id
      { $pull: { users: user } } // Supprime uniquement ce user du tableau
    );
    console.log("User removed");
  }
  
  
} 
exports.default = Rooms;
