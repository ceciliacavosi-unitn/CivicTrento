require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

// Percorso del file utenti.json
const filePath = path.join(__dirname, 'data', 'utenti.json');
const tokenPath = path.join(__dirname, "password_reset_tokens.txt");
const utentiPath = filePath; // alias per coerenza nei nomi

// Connessione MongoDB disabilitata (commentata)
// const mongoose = require('mongoose');
// mongoose.connect(process.env.DB_URL, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
// .then(() => console.log('Connesso a MongoDB'))
// .catch(err => console.error('Errore connessione MongoDB:', err));

// Schema e modello Mongoose disabilitati (commentati)
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
// FUNZIONI DI AUTENTICAZIONE (solo con file JSON)
//

/**
 * REGISTRA UTENTE
 */
async function registraUtente({ nome, cognome, email, password, CF, cartaID, gdprConsent, consentTimestamp }) {
  let utenti = [];

  // Caricamento utenti da file, se esiste
  if (fs.existsSync(filePath)) {
    const contenuto = fs.readFileSync(filePath, 'utf8');
    utenti = contenuto ? JSON.parse(contenuto) : [];

    if (utenti.some(u => u.email === email)) {
      console.warn("Email già registrata:", email);
      return false;
    }
  }

  // Criptazione password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Creazione nuovo utente
  const nuovoUtente = {
    nome,
    cognome,
    email,
    password: hashedPassword,
    CF,
    cartaID,
    gdprConsent: gdprConsent === true,
    consentTimestamp: consentTimestamp || new Date().toISOString()
  };

  // Salvataggio su file
  utenti.push(nuovoUtente);

  console.log("Salvataggio utente nel file:", {
    ...nuovoUtente,
    password: '[HASHED]'
  });

  fs.writeFileSync(filePath, JSON.stringify(utenti, null, 2));

  // // Salvataggio opzionale su MongoDB (commentato)
  // try {
  //   const mongoUtente = new Utente({
  //     nome,
  //     cognome,
  //     email,
  //     password: hashedPassword,
  //     CF,
  //     cartaID,
  //     gdprConsent: gdprConsent === true,
  //     consentTimestamp: consentTimestamp || new Date().toISOString()
  //   });
  //   await mongoUtente.save();
  //   console.log("Utente salvato anche su MongoDB.");
  // } catch (err) {
  //   console.error("Errore durante il salvataggio su MongoDB:", err);
  // }

  return true;
}

/**
 * LOGIN (verifica credenziali nel file)
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
        if (match) {
          trovato.ultimaAttivita = new Date();

          const indice = utenti.findIndex(u => u.email === email);
          utenti[indice] = trovato;
          fs.writeFileSync(filePath, JSON.stringify(utenti, null, 2));

          return trovato;
        }
      }
    } catch (err) {
      console.error("Errore parsing utenti.json:", err);
    }
  }
  return null;
}


/**
 * CANCELLA UTENTE (solo nel file JSON)
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
 * REIMPOSTA PASSWORD tramite token
 */
async function reimpostaPasswordConToken(token, nuovaPassword) {
  if (!fs.existsSync(tokenPath) || !fs.existsSync(utentiPath)) {
    return { success: false, reason: "File mancante" };
  }

  const tokenLines = fs.readFileSync(tokenPath, "utf-8").split("\n").filter(Boolean);
  let email = null;

  const tokenLinesFiltered = tokenLines.filter(line => {
    const [e, savedToken, expiration] = line.split(",");
    if (savedToken === token && Date.now() < parseInt(expiration)) {
      email = e;
      return false;
    }
    return true;
  });

  if (!email) return { success: false, reason: "Token non valido o scaduto" };

  const utenti = JSON.parse(fs.readFileSync(utentiPath, "utf-8"));
  const hashedPassword = await bcrypt.hash(nuovaPassword, 10);

  let updated = false;
  const aggiornati = utenti.map(u => {
    if (u.email === email) {
      updated = true;
      return { ...u, password: hashedPassword };
    }
    return u;
  });

  if (!updated) return { success: false, reason: "Utente non trovato" };

  fs.writeFileSync(utentiPath, JSON.stringify(aggiornati, null, 2));
  fs.writeFileSync(tokenPath, tokenLinesFiltered.join("\n") + "\n");

  return { success: true, email };
}


/**
 * MIDDLEWARE: Verifica Token JWT
 */
function verificaToken(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log("🔐 Richiesta ricevuta con header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("❌ Token assente o malformato.");
    return res.status(401).json({ detail: "Token mancante o malformato" });
  }

  const token = authHeader.split(" ")[1];
  console.log("🔍 Token ricevuto:", token);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.utente = decoded;
    console.log("✅ Token valido per:", decoded.email || decoded);
    next();
  } catch (err) {
    console.error("❌ Errore nella verifica del token:", err.message);
    return res.status(403).json({ detail: "Token non valido o scaduto" });
  }
}

// Esportazione
module.exports = {
  registraUtente,
  trovaCredenziali,
  cancellaUtente,
  reimpostaPasswordConToken,
  verificaToken
};
