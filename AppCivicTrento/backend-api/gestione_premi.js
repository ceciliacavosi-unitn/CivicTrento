require('dotenv').config();
const fs = require("fs");
const path = require("path");

// Percorso del file premi.json
const premiPath = path.join(__dirname, "data", "premi.json");
const utentiPath = path.join(__dirname, "data", "premi.json");

// Connessione MongoDB disabilitata (commentata)
// const mongoose = require('mongoose');
// mongoose.connect(process.env.DB_URL, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
// .then(() => console.log(' Connesso a MongoDB (premi)'))
// .catch(err => console.error(' Errore connessione MongoDB (premi):', err));

// Schema e modello Mongoose per i premi (commentati)
// const premioSchema = new mongoose.Schema({
//   id: String,
//   nome: String,
//   costoCivicCoins: Number
// }, {
//   collection: 'premi'
// });
// const Premio = mongoose.model('Premio', premioSchema);

//
// FUNZIONI DI GESTIONE PREMI (solo con file JSON)
//

/**
 * Restituisce l'elenco dei premi dal file JSON
 */
function getPremi() {
  if (!fs.existsSync(premiPath)) {
    console.warn("[getPremi] File premi.json non trovato");
    return null;
  }

  try {
    const fileContent = fs.readFileSync(premiPath, "utf-8");
    const premi = JSON.parse(fileContent);

    console.log(`[getPremi] Premi caricati (${premi.length} elementi)`);
    premi.forEach(p => console.log(`➡️  ID: ${p.id}, Nome: ${p.nome}, Costo: ${p.costoCivicCoins}`));

    return premi;
  } catch (err) {
    console.error("[getPremi] Errore nella lettura o parsing del file:", err);
    throw err;
  }
}

/**
 * Simula il riscatto di un premio per ID
 * @param {string} premioId 
 * @returns {object|null} Oggetto premio se trovato, altrimenti null
 */
function riscattaPremio(premioId, emailUtente) {
  if (!fs.existsSync(premiPath)) {
    console.warn("[riscattaPremio] File premi.json non trovato");
    return null;
  }

  try {
    const premi = JSON.parse(fs.readFileSync(premiPath, "utf-8"));
    const premio = premi.find(p => p.id === premioId);

    if (!premio) {
      console.warn(`[riscattaPremio] Premio con ID ${premioId} non trovato`);
      return null;
    }

    console.log(`[riscattaPremio] Premio riscattato: ${premio.nome}`);

    // Aggiorna ultimaAttivita dell'utente
    const utentiPath = path.join(__dirname, "data", "utenti.json");
    if (fs.existsSync(utentiPath)) {
      const utenti = JSON.parse(fs.readFileSync(utentiPath, "utf-8"));
      const indice = utenti.findIndex(u => u.email === emailUtente);
      if (indice !== -1) {
        utenti[indice].ultimaAttivita = new Date();
        fs.writeFileSync(utentiPath, JSON.stringify(utenti, null, 2));
        console.log(`[riscattaPremio] Aggiornata ultimaAttivita per ${emailUtente}`);
      }
    }

    return premio;
  } catch (err) {
    console.error("[riscattaPremio] Errore nella gestione del riscatto:", err);
    throw err;
  }
}


// Esportazione
module.exports = {
  getPremi,
  riscattaPremio
};
