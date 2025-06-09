require("dotenv").config();

//Importa direttamente l'app configurata da main.js
const app = require("./main");

console.log("App caricata con successo da main.js");

// Avvia il server solo se **non siamo in ambiente di test**
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 8000;
  console.log("Avvio server da server.js...");
  app.listen(PORT, () => {
    console.log(`Server avviato su http://localhost:${PORT}`);
  });
}

module.exports = app;
