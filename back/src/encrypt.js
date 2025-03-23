const bcrypt = require('bcrypt');

const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

async function verifyPassword(password, hash) {
    if (!password || !hash) {
      throw new Error("Pas de password ou de hash");
    }
    
    return await bcrypt.compare(password, hash);
}

// Exporter les fonctions pour les utiliser ailleurs
module.exports = {
  hashPassword,
  verifyPassword
};
