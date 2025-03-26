const encrypt = require('../encrypt'); 
class Users {
  // Constructeur de la classe en appelant une bdd
  constructor(db) {
    this.db = db;
  }
  
  // Crée un compte utilisateur
  async creerCompte(username, email, mdp1, mdp2) {
    try {
      const col1 = this.db.useDb("ProjetAWS").collection("Compte");
      await col1.insertOne({
         username: username,
         _id: email,
         password: mdp1,
         avatar: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20280%20280%22%20fill%3D%22none%22%20shape-rendering%3D%22auto%22%20width%3D%22200%22%20height%3D%22200%22%3E%3Cmetadata%20xmlns%3Ardf%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%22%20xmlns%3Axsi%3D%22http%3A%2F%2Fwww.w3.org%2F2001%2FXMLSchema-instance%22%20xmlns%3Adc%3D%22http%3A%2F%2Fpurl.org%2Fdc%2Felements%2F1.1%2F%22%20xmlns%3Adcterms%3D%22http%3A%2F%2Fpurl.org%2Fdc%2Fterms%2F%22%3E%3Crdf%3ARDF%3E%3Crdf%3ADescription%3E%3Cdc%3Atitle%3EAvataaars%3C%2Fdc%3Atitle%3E%3Cdc%3Acreator%3EPablo%20Stanley%3C%2Fdc%3Acreator%3E%3Cdc%3Asource%20xsi%3Atype%3D%22dcterms%3AURI%22%3Ehttps%3A%2F%2Favataaars.com%2F%3C%2Fdc%3Asource%3E%3Cdcterms%3Alicense%20xsi%3Atype%3D%22dcterms%3AURI%22%3Ehttps%3A%2F%2Favataaars.com%2F%3C%2Fdcterms%3Alicense%3E%3Cdc%3Arights%3ERemix%20of%20%E2%80%9EAvataaars%E2%80%9D%20(https%3A%2F%2Favataaars.com%2F)%20by%20%E2%80%9EPablo%20Stanley%E2%80%9D%2C%20licensed%20under%20%E2%80%9EFree%20for%20personal%20and%20commercial%20use%E2%80%9D%20(https%3A%2F%2Favataaars.com%2F)%3C%2Fdc%3Arights%3E%3C%2Frdf%3ADescription%3E%3C%2Frdf%3ARDF%3E%3C%2Fmetadata%3E%3Cmask%20id%3D%22viewboxMask%22%3E%3Crect%20width%3D%22280%22%20height%3D%22280%22%20rx%3D%220%22%20ry%3D%220%22%20x%3D%220%22%20y%3D%220%22%20fill%3D%22%23fff%22%20%2F%3E%3C%2Fmask%3E%3Cg%20mask%3D%22url(%23viewboxMask)%22%3E%3Cg%20transform%3D%22translate(8)%22%3E%3Cpath%20d%3D%22M132%2036a56%2056%200%200%200-56%2056v6.17A12%2012%200%200%200%2066%20110v14a12%2012%200%200%200%2010.3%2011.88%2056.04%2056.04%200%200%200%2031.7%2044.73v18.4h-4a72%2072%200%200%200-72%2072v9h200v-9a72%2072%200%200%200-72-72h-4v-18.39a56.04%2056.04%200%200%200%2031.7-44.73A12%2012%200%200%200%20198%20124v-14a12%2012%200%200%200-10-11.83V92a56%2056%200%200%200-56-56Z%22%20fill%3D%22%23edb98a%22%2F%3E%3Cpath%20d%3D%22M108%20180.61v8a55.79%2055.79%200%200%200%2024%205.39c8.59%200%2016.73-1.93%2024-5.39v-8a55.79%2055.79%200%200%201-24%205.39%2055.79%2055.79%200%200%201-24-5.39Z%22%20fill%3D%22%23000%22%20fill-opacity%3D%22.1%22%2F%3E%3Cg%20transform%3D%22translate(0%20170)%22%3E%3Cpath%20d%3D%22M132.5%2051.83c18.5%200%2033.5-9.62%2033.5-21.48%200-.36-.01-.7-.04-1.06A72%2072%200%200%201%20232%20101.04V110H32v-8.95a72%2072%200%200%201%2067.05-71.83c-.03.37-.05.75-.05%201.13%200%2011.86%2015%2021.48%2033.5%2021.48Z%22%20fill%3D%22%233c4f5c%22%2F%3E%3Cpath%20d%3D%22M132.5%2058.76c21.89%200%2039.63-12.05%2039.63-26.91%200-.6-.02-1.2-.08-1.8-2-.33-4.03-.59-6.1-.76.04.35.05.7.05%201.06%200%2011.86-15%2021.48-33.5%2021.48S99%2042.2%2099%2030.35c0-.38.02-.76.05-1.13-2.06.14-4.08.36-6.08.67-.07.65-.1%201.3-.1%201.96%200%2014.86%2017.74%2026.91%2039.63%2026.91Z%22%20fill%3D%22%23000%22%20fill-opacity%3D%22.08%22%2F%3E%3C%2Fg%3E%3Cg%20transform%3D%22translate(78%20134)%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20d%3D%22M40%2015a14%2014%200%201%200%2028%200%22%20fill%3D%22%23000%22%20fill-opacity%3D%22.7%22%2F%3E%3C%2Fg%3E%3Cg%20transform%3D%22translate(104%20122)%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20d%3D%22M16%208c0%204.42%205.37%208%2012%208s12-3.58%2012-8%22%20fill%3D%22%23000%22%20fill-opacity%3D%22.16%22%2F%3E%3C%2Fg%3E%3Cg%20transform%3D%22translate(76%2090)%22%3E%3Cpath%20d%3D%22M36%2022a6%206%200%201%201-12%200%206%206%200%200%201%2012%200ZM88%2022a6%206%200%201%201-12%200%206%206%200%200%201%2012%200Z%22%20fill%3D%22%23000%22%20fill-opacity%3D%22.6%22%2F%3E%3C%2Fg%3E%3Cg%20transform%3D%22translate(76%2082)%22%3E%3Cpath%20d%3D%22M15.63%2017.16c3.92-5.51%2014.65-8.6%2023.9-6.33a2%202%200%201%200%20.95-3.88c-10.74-2.64-23.17.94-28.11%207.9a2%202%200%200%200%203.26%202.3ZM96.37%2017.16c-3.91-5.51-14.65-8.6-23.9-6.33a2%202%200%201%201-.95-3.88c10.74-2.64%2023.17.94%2028.11%207.9a2%202%200%200%201-3.26%202.3Z%22%20fill%3D%22%23000%22%20fill-opacity%3D%22.6%22%2F%3E%3C%2Fg%3E%3Cg%20transform%3D%22translate(-1)%22%3E%3C%2Fg%3E%3Cg%20transform%3D%22translate(49%2072)%22%3E%3C%2Fg%3E%3Cg%20transform%3D%22translate(62%2042)%22%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E",
         avatarSettings: {
          hairType : "none",
          hairColor : "2c1b18",
          accessories : "none",
          facialHair : "none",
          clothes : "shirtCrewNeck",
          eyes : "default",
          eyebrows : "default",
          mouth : "default",
          skinColor : "edb98a",
          facialHairColor : "2c1b18",
          clothesColor : "3c4f5c",
          accessoriesColor : "65c9ff"
         },
         unlockedItems: {
          hairType : ["none"],
          hairColor : ["2c1b18"],
          accessories : ["none"],
          facialHair : ["none"],
          clothes : ["shirtCrewNeck"],
          eyes : ["default"],
          eyebrows : ["default"],
          mouth : ["default"],
          skinColor : ["edb98a"],
          facialHairColor : ["2c1b18"],
          clothesColor : ["3c4f5c"],
          accessoriesColor : ["65c9ff"]
         },
         coins: 0
        });
    } catch (e) {
      console.error("Erreur lors de la création du compte :", e);
      throw e;
    }
  }

    // Vérifie si un email existe déjà dans la bdd
    async existUsername(pseudo) {
      try {
        const col1 = this.db.useDb("ProjetAWS").collection("Compte");
        const query = { username: { $eq: pseudo } }; // Requête Préparées pour contrer les injections noSQL
        const res = await col1.findOne(query);
  
        if (res) {
          return true;
        } else {
          return false;
        }
      } catch (e) {
        console.error("Erreur lors de la vérification de l'existence de l'username :", e);
        return false;
      }
    }

  // Vérifie si un email existe déjà dans la bdd
  async exist(email) {
    try {
      const col1 = this.db.useDb("ProjetAWS").collection("Compte");
      const query = { _id: { $eq: email } }; // Requête Préparées pour contrer les injections noSQL
      const res = await col1.findOne(query);

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
      const col1 = this.db.useDb("ProjetAWS").collection("Compte");
      const user = await col1.findOne({ _id: { $eq: login } });
      
      if (user) {
        const motDePasse = user.password;
        if (await encrypt.verifyPassword(password, motDePasse)) {
          console.log("OK");
          return true;
        } else {
          console.log("Pas correct");
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error("Erreur lors de la récupération du mot de passe :", error);
      throw error;
    }
  }

  //Récupère un utilisateur via son username
  async getUser(pseudo) {
    try {
      const col1 = this.db.useDb("ProjetAWS").collection("Compte");
      const user = await col1.findOne({ username: pseudo });
      return user;
    } catch (err) {
      throw err;
    }
  }

    //Récupère un utilisateur via son email
  async getEmail(email) {
    try {
      const col1 = this.db.useDb("ProjetAWS").collection("Compte");
      const query = { _id: { $eq: email } }; // Requête Préparées pour contrer les injections noSQL
      const user = await col1.findOne(query); 
      return user;
    } catch (err) {
      throw err;
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

  // Met à jour le nom d'un utilisateur dans la bdd
  async updateUsername(email, newUsername) {
    try {
      const col1 = this.db.useDb("ProjetAWS").collection("Rooms");
      const result = await col1.updateOne(
        { _id: email },
        { $set: { username: newUsername } }
      );

      if (result.modifiedCount === 0) {
        throw new Error("La mise à jour du nom d'utilisateur a échoué.");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du nom d'utilisateur :", error);
      throw error;
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
      const col1 = this.db.useDb("ProjetAWS").collection("Compte");
      const user = await col1.findOne({ _id: email });
      if (user) {
        return user.coins;
      }
      return 0;
    } catch (err) {
      throw err;
    }
  }
  
  // Met à jour le nombre de pièces d'un utilisateur
  async updateCoins(email, newCoinCount) {
    try {
      const col1 = this.db.useDb("ProjetAWS").collection("Compte");
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
    }
  }
  
  // Ajoute ou soustrait des pièces d'un utilisateur
  async modifyCoins(email, amount) {
    try {
      const col1 = this.db.useDb("ProjetAWS").collection("Compte");
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
    }
  }

  // Supprime un utilisateur
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
      const col1 = this.db.useDb("ProjetAWS").collection("Compte");
  
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
    }
  }

  async unlockItem(email, category, item, cost) {
    try {
      // Connexion à la collection
      const col1 = this.db.useDb("ProjetAWS").collection("Compte");
  
      // Récupérer l'utilisateur
      const user = await col1.findOne({ _id: email });
      if (!user) {
        throw new Error("Utilisateur introuvable");
      }
  
      // Vérifier le nombre de pièces
      if (user.coins < cost) {
        throw new Error("Pas assez de pièces pour débloquer cet item");
      }
  
      // Vérifier si l'item est déjà débloqué
      const alreadyUnlocked = user.unlockedItems?.[category]?.includes(item);
      if (alreadyUnlocked) {
        throw new Error("Cet item est déjà débloqué");
      }
  
      // Mettre à jour : on retire les pièces et on ajoute l'item dans unlockedItems[category]
      await col1.updateOne(
        { _id: email },
        {
          $inc: { coins: -cost },
          // $addToSet ajoute item seulement s'il n'y est pas déjà
          $addToSet: { [`unlockedItems.${category}`]: item },
        }
      );
  
      return true;
    } catch (error) {
      console.error("Erreur lors du déblocage d'item :", error);
      throw error;
    }
  }
}

exports.default = Users;
