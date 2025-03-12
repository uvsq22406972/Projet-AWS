const app = require("./app.js");
const port = 4000;

//Activation du port
app.listen(port, '0.0.0.0', () => {
    console.log(`Serveur Express démarré sur http://0.0.0.0:${port}`);
  });
  