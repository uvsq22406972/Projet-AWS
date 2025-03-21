const app = require("./app.js");
const port = 4000;

//Activation du port
app.listen(port, () => {
    console.log(`Serveur actif sur le port ${port}`);
});