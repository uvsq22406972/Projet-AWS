class Users {
  // Constructeur de la classe en appelant une bdd
  constructor(db) {
    this.db = db;
  }
  
  // Crée un compte utilisateur
  async creerCompte(username, email, mdp1, mdp2) {
    try {
      await this.db.connect();
      const col1 = this.db.db("DB").collection("Compte"); // Accès à la collection Compte
      await col1.insertOne({ username: username, _id: email, password: mdp1 });
    } catch (e) {
      console.error("Erreur lors de la création du compte :", e);
      throw e;  // Retourne l'erreur pour la traiter dans le composant React
    } finally {
      await this.db.close();
    }
  }

  // Vérifie si un email existe déjà dans la bdd
  async exist(email) {
    try {
      await this.db.connect();
      const col1 = this.db.db("DB").collection("Compte"); // Accès à la collection Compte
      const query = { _id: email };
      const res = await col1.findOne(query);
      return res ? true : false;
    } catch (e) {
      console.error("Erreur lors de la vérification de l'existence de l'email :", e);
      return false;
    } finally {
      await this.db.close();
    }
  }

  // Vérifie si le mot de passe correspond au mot de passe stocké en bdd
  async checkPassword(login, password) {
    try {
      await this.db.connect();
      const col1 = this.db.db("DB").collection("Compte"); // Accès à la collection Compte
      const user = await col1.findOne({ _id: login });
      if (user) {
        const motDePasse = user.password;
        if (password === motDePasse) {
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
    } finally {
      await this.db.close();
    }
  }

  // Récupère un utilisateur via son pseudo (username)
  async getUser(pseudo) {
    try {
      await this.db.connect();
      const col1 = this.db.db("DB").collection("Compte");
      const user = await col1.findOne({ username: pseudo });
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
      await this.db.connect();
      const col1 = this.db.db("DB").collection("Compte");
      const account = await col1.find({}).toArray();
      return account;
    } catch (err) {
      throw err;
    }
  }
  
  // Met à jour le mot de passe d'un utilisateur dans la bdd
  async updatePassword(email, newPassword) {
    try {
      await this.db.connect();
      const col1 = this.db.db("DB").collection("Compte");
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
    } finally {
      await this.db.close();
    }
  }
}

exports.default = Users;
