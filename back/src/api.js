const express = require('express');

function init(db){
  const router = express.Router();
  return router;
};

module.exports = init;  // Exportez la fonction init