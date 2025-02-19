const encrypt = require('../encrypt'); 
class Users {
  //Constructeur de la classe en appelant un bdd
  constructor(db) {
    this.db = db;
  }
  
  //Lance une requête pour ajouter les arguments dans la bdd en tant qu'un attribut de la table Compte
  async creerCompte(username, email, mdp1, mdp2) {
    try {
      await this.db.connect();
      const col1 = this.db.db("DB").collection("Compte"); //Accès au collection Compte
      await col1.insertOne({
         username: username,
         _id: email,
         password: mdp1
        });
    } catch (e) {
      console.error("Erreur lors de la création du compte :", e);
      throw e;  //Retourne l'erreur pour la traiter dans le composant React
    } finally {
      await this.db.close();
    }
  }

  //Vérifie si un email existe déjà dans la bdd
  async exist (email) {
    try {
      await this.db.connect();
      const col1 = this.db.db("DB").collection("Compte"); //Accès au collection Compte
      const query = { _id: { $eq: email } }; // Requête Préparées pour contrer les injections noSQL
      const res = await col1.findOne(query); //True si email existe, faux sinon

      if (res) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      console.error("L'email est deja utilisé", e);
      return false; //Retourne false en cas d'erreur
    } finally {
      await this.db.close();
    }
  }

  //Vérifie si le mot de passe correspond au mot de passe stocké dans la bdd
  async checkPassword(login, password) {
    try {
      await this.db.connect();
      const col1 = this.db.db("DB").collection("Compte"); //Accès au collection Compte
      const user = await col1.findOne({ _id: { $eq: login } }); //True si email existe, faux sinon
      // Sécurité contre les injections NoSql en empêchant l'injection de certains opérateurs NoSqL
      
      if (user) {
        const motDePasse = user.password;
             //On vérifie que le mot de passe rentrer est identique a celui encrypté dans la bdd
        if (encrypt.verifyPassword(password, motDePasse)) {
          console.log("OK");
          return true;
        } else {
          console.log("Pas correct");
          return false;
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du mot de passe :", error);
      throw error;
    }
  }

  //Récupérer tous les attributs de la collection Compte
  async getAllUsers() {
    try {
      await this.db.connect();
      const col1 = this.db.db("DB").collection("Compte"); //Accès au collection Compte
      const account = await col1.find({}).toArray(); //Mettre les attributs sous forme array
      return account;

    } catch (err) {
      throw err; //Lance une exception en cas d'erreur
    }
  }

  async supprimerCompte(email, password) {
    try {
      await this.db.connect();
      const col1 = this.db.db("DB").collection("Compte");

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
    } finally {
      await this.db.close();
    }
  }
}

exports.default = Users;