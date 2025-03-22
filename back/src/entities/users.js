const encrypt = require('../encrypt'); 

class Users {
  // Constructeur de la classe en appelant une bdd
  constructor(db) {
    this.db = db;
  }
  
  // Crée un compte utilisateur
  async creerCompte(username, email, mdp1, mdp2) {
    try {
      const col1 = this.db.useDb("ProjetAWS").collection("Compte"); //Accès au collection Compte
      await col1.insertOne({
         username: username,
         _id: email,
         password: mdp1,
         coins: 0 // Ajoute un champ coins initialisé à 0
        });
    } catch (e) {
      console.error("Erreur lors de la création du compte :", e);
      throw e;  // Retourne l'erreur pour la traiter dans le composant React
    }
  }

  // Vérifie si un email existe déjà dans la bdd
  async exist(email) {
    try {
      const col1 = this.db.useDb("ProjetAWS").collection("Compte"); //Accès au collection Compte
      const query = { _id: { $eq: email } }; // Requête Préparées pour contrer les injections noSQL
      const res = await col1.findOne(query); //True si email existe, faux sinon

      if (res) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      console.error("Erreur lors de la vérification de l'existence de l'email :", e);
      return false;
    }
  }

  
  // Vérifie si le mot de passe correspond au mot de passe stocké en bdd
  async checkPassword(login, password) {
    try {
      const col1 = this.db.useDb("ProjetAWS").collection("Compte"); //Accès au collection Compte
      const user = await col1.findOne({ _id: { $eq: login } }); //True si email existe, faux sinon
      // Sécurité contre les injections NoSql en empêchant l'injection de certains opérateurs NoSqL
      
      if (user) {
        const motDePasse = user.password;
             //On vérifie que le mot de passe rentrer est identique a celui encrypté dans la bdd
        if (await encrypt.verifyPassword(password, motDePasse)) {
          console.log("OK");
          return true;
        } else {
          console.log("Pas correct");
          return false;
        }
      }
      return false; // Si l'utilisateur n'existe pas
    } catch (error) {
      console.error("Erreur lors de la récupération du mot de passe :", error);
      throw error;
    }
  }

  // Récupère un utilisateur via son pseudo (username)
  async getUser(pseudo) {
    try {
      const col1 = this.db.useDb("ProjetAWS").collection("Compte");
      const user = await col1.findOne({ username: pseudo });
      return user;
    } catch (err) {
      throw err;
    }
  }

    // Récupère un utilisateur via son pseudo (username)
    async getEmail(email) {
      try {
        await this.db.connect();
        const col1 = this.db.db("DB").collection("Compte"); //Accès au collection Compte
        const query = { _id: { $eq: email } }; // Requête Préparées pour contrer les injections noSQL
        const user = await col1.findOne(query); 
        return user;
      } catch (err) {
        throw err;
      } finally {
        await this.db.close();
      }
    }

  // Récupère tous les utilisateurs
  async getAllUsers() {
    try {
      const col1 = this.db.useDb("ProjetAWS").collection("Compte");
      const account = await col1.find({}).toArray();
      return account;
    } catch (err) {
      throw err;
    }
  }
  
  // Met à jour le mot de passe d'un utilisateur dans la bdd
  async updatePassword(email, newPassword) {
    try {
      const col1 = this.db.useDb("ProjetAWS").collection("Compte");
      const result = await col1.updateOne(
        { _id: email },
        { $set: { password: newPassword } }
      );

      if (result.modifiedCount === 0) {
        throw new Error("La mise à jour du mot de passe a échoué.");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du mot de passe :", error);
      throw error;
    }
  }
    // Récupère le nombre de pièces d'un utilisateur via son email
  async getCoins(email) {
    try {
      await this.db.connect();
      const col1 = this.db.db("DB").collection("Compte");
      const user = await col1.findOne({ _id: email });
      if (user) {
        return user.coins;
      }
      return 0; // Retourne 0 si l'utilisateur n'existe pas
    } catch (err) {
      throw err;
    } finally {
      await this.db.close();
    }
  }
    // Met à jour le nombre de pièces d'un utilisateur
  async updateCoins(email, newCoinCount) {
    try {
      await this.db.connect();
      const col1 = this.db.db("DB").collection("Compte");
      const result = await col1.updateOne(
        { _id: email },
        { $set: { coins: newCoinCount } }
      );
      if (result.modifiedCount === 0) {
        throw new Error("La mise à jour des pièces a échoué.");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour des pièces :", error);
      throw error;
    } finally {
      await this.db.close();
    }
  }
    // Ajoute ou soustrait des pièces d'un utilisateur
  async modifyCoins(email, amount) {
    try {
      await this.db.connect();
      const col1 = this.db.db("DB").collection("Compte");
      const result = await col1.updateOne(
        { _id: email },
        { $inc: { coins: amount } } // Utilisation de $inc pour incrémenter ou décrémenter
      );
      if (result.modifiedCount === 0) {
        throw new Error("La modification des pièces a échoué.");
      }
    } catch (error) {
      console.error("Erreur lors de la modification des pièces :", error);
      throw error;
    } finally {
      await this.db.close();
    }
  }

  async supprimerCompte(email, password) {
    try {
      const col1 = this.db.useDb("ProjetAWS").collection("Compte");

      // Vérifie si l'utilisateur existe
      const user = await col1.findOne({ _id: { $eq: email } });
      if (!user) {
        console.log("Utilisateur introuvable !");
        return false;
      }

      // Vérifie si le mot de passe est correct
      const isPasswordValid = await encrypt.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        console.log("Mot de passe incorrect !");
        return false;
      }

      // Suppression de l'utilisateur
      const result = await col1.deleteOne({ _id: email });
      if (result.deletedCount === 1) {
        console.log("Compte supprimé avec succès.");
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

  async saveAvatar(email, avatar, avatarSettings) {
    try {
      await this.db.connect();
      const col1 = this.db.db("DB").collection("Compte");
  
      // Met à jour l'avatar de l'utilisateur dans la base de données
      const result = await col1.updateOne(
        { _id: email },
        { $set: { avatar, avatarSettings } }
      );
  
      if (result.modifiedCount === 0) {
        throw new Error("La mise à jour de l'avatar a échoué.");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'avatar :", error);
      throw error;
    } finally {
      await this.db.close();
    }
  }
}

exports.default = Users;
