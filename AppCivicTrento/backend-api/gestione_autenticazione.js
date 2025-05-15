require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require("bcrypt");

//  Percorso del file utenti.json
const filePath = path.join(__dirname, 'utenti.json');

//  Connessione MongoDB disabilitata (commentata)
// const mongoose = require('mongoose');
// mongoose.connect(process.env.DB_URL, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
// .then(() => console.log(' Connesso a MongoDB'))
// .catch(err => console.error(' Errore connessione MongoDB:', err));

//  Schema e modello Mongoose disabilitati (commentati)
// const utenteSchema = new mongoose.Schema({
//   nome: String,
//   cognome: String,
//   email: String,
//   password: String,
//   CF: String,
//   cartaID: String
// }, {
//   collection: 'utenti'
// });
// const Utente = mongoose.model('Utente', utenteSchema);

//
//  FUNZIONI DI AUTENTICAZIONE (solo con file JSON)
//

/**
 *  REGISTRA UTENTE
 */
async function registraUtente({ nome, cognome, email, password, CF, cartaID }) {
  //  Verifica se già esiste nel file
  let utenti = [];
  if (fs.existsSync(filePath)) {
    const contenuto = fs.readFileSync(filePath, 'utf8');
    utenti = contenuto ? JSON.parse(contenuto) : [];
    if (utenti.some(u => u.email === email)) return false;
  }

  //  Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  //  Aggiungi utente al file JSON
  utenti.push({
    nome,
    cognome,
    email,
    password: hashedPassword,
    CF,
    cartaID
  });

  fs.writeFileSync(filePath, JSON.stringify(utenti, null, 2));
  return true;
}


/**
 *  LOGIN (verifica credenziali nel file)
 */
async function trovaCredenziali(email, plainPassword) {
  if (fs.existsSync(filePath)) {
    const rawData = fs.readFileSync(filePath, 'utf8');
    if (!rawData.trim()) return null;

    try {
      const utenti = JSON.parse(rawData);
      const trovato = utenti.find(u => u.email === email);
      if (trovato) {
        const match = await bcrypt.compare(plainPassword, trovato.password);
        if (match) return trovato;
      }
    } catch (err) {
      console.error(" Errore parsing utenti.json:", err);
    }
  }
  return null;
}


/**
 *  CANCELLA UTENTE (solo nel file JSON)
 */
async function cancellaUtente(email, password) {
  let eliminato = false;

  if (fs.existsSync(filePath)) {
    const utenti = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const trovato = utenti.find(u => u.email === email && bcrypt.compareSync(password, u.password));
    if (trovato) {
      const aggiornati = utenti.filter(u => u.email !== email);
      fs.writeFileSync(filePath, JSON.stringify(aggiornati, null, 2));
      eliminato = true;
    }
  }

  return eliminato;
}


/**
 *  LOGOUT / VERIFICA PRESENZA (solo nel file JSON)
 */
async function utenteEsiste(email) {
  if (fs.existsSync(filePath)) {
    const utenti = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return utenti.some(u => u.email === email);
  }
  return false;
}

//  Esportazione
module.exports = {
  registraUtente,
  trovaCredenziali,
  cancellaUtente,
  utenteEsiste
};