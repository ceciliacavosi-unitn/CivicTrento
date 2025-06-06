require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const JWT_SECRET = process.env.JWT_SECRET;
const CRYPTO_SECRET = process.env.CRYPTO_SECRET;
const ENCRYPTION_KEY = crypto.scryptSync(CRYPTO_SECRET, 'salt', 32);
const ALGORITHM = 'aes-256-cbc';

//per attivare MongoDB
// const Utente = require('./mongodb').Utente;

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
//   cartaID: String,
// }, {
//   collection: 'utenti'
// });
// const Utente = mongoose.model('Utente', utenteSchema);

// Funzioni di crittografia AES
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

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
    CF: encrypt(CF), // Criptato con AES
    cartaID: encrypt(cartaID), // Criptato con AES
    gdprConsent: gdprConsent === true,
    consentTimestamp: consentTimestamp || new Date().toISOString(),
    sessionToken: null
  };

  // Salvataggio su file
  utenti.push(nuovoUtente);

  console.log("Salvataggio utente nel file:", {
    ...nuovoUtente,
    password: '[HASHED]',
    CF: '[ENCRYPTED]',
    cartaID: '[ENCRYPTED]'
  });

  fs.writeFileSync(filePath, JSON.stringify(utenti, null, 2));

  // // Salvataggio opzionale su MongoDB (commentato)
  // try {
  //   const mongoUtente = new Utente({
  //     nome,
  //     cognome,
  //     email,
  //     password: hashedPassword,
  //     CF: encrypt(CF),
  //     cartaID: encrypt(cartaID),
  //     gdprConsent: gdprConsent === true,
  //     consentTimestamp: consentTimestamp || new Date().toISOString(),
  //     sessionToken: null
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

  // === VERSIONE MONGODB (commentata) ===
  // const utente = await Utente.findOne({ email });
  // if (!utente) return null;

  // const match = await bcrypt.compare(plainPassword, utente.password);
  // if (!match) return null;

  // const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1h" });
  // utente.sessionToken = token;
  // utente.ultimaAttivita = new Date();
  // await utente.save();

  // return {
  //   nome: utente.nome,
  //   cognome: utente.cognome,
  //   email: utente.email,
  //   ruolo: utente.ruolo, // se lo usi
  //   sessionToken: token
  // };
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
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ detail: "Token mancante" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const utenti = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "utenti.json"), "utf-8"));
    const utente = utenti.find(u => u.email === decoded.email);

    if (!utente || utente.sessionToken !== token) {
      return res.status(401).json({ detail: "Sessione non valida o già disconnessa" });
    }

    req.utente = utente; // <--- questa linea è fondamentale
    next();
  } catch (err) {
    return res.status(403).json({ detail: "Token non valido" });
  }
}

function salvaSessioneUtente(email, token) {
  if (!fs.existsSync(filePath)) return false;

  const utenti = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const indice = utenti.findIndex(u => u.email === email);
  if (indice !== -1) {
    utenti[indice].sessionToken = token;
    fs.writeFileSync(filePath, JSON.stringify(utenti, null, 2));
    console.log(`[LOGIN] Token JWT salvato per ${email}`);
    return true;
  }

  console.warn(`[LOGIN] Utente ${email} non trovato nel file utenti.json`);
  return false;

  // // MongoDB (commentato)
  // const utente = await Utente.findOne({ email });
  // if (utente) {
  //   utente.sessionToken = token;
  //   await utente.save();
  //   console.log(`[LOGIN] Token JWT salvato su MongoDB per ${email}`);
  //   return true;
  // }
  // return false;
}


// Esportazione
module.exports = {
  registraUtente,
  trovaCredenziali,
  cancellaUtente,
  reimpostaPasswordConToken,
  verificaToken,
  salvaSessioneUtente
};
