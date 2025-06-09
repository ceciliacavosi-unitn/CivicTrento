require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// ================================================
// Configurazione MongoDB (disattivata)
// ================================================

// const mongoose = require('mongoose');
// mongoose.connect(process.env.DB_URL, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
// .then(() => console.log('Connesso a MongoDB'))
// .catch(err => console.error('Errore connessione MongoDB:', err));

// const utenteSchema = new mongoose.Schema({
//   nome: String,
//   cognome: String,
//   email: String,
//   password: String,
//   CF: String,
//   cartaID: String
// }, { collection: 'utenti' });
// const Utente = mongoose.models.Utente || mongoose.model("Utente", utenteSchema);

// ================================================
// Percorso file JSON e cifratura AES (CF, cartaID)
// ================================================

const utentiPath = path.join(__dirname, 'data', 'utenti.json');
const pathUtentiCompleto = path.join(__dirname, "data", "utenti_completo.json");

const ALGORITHM = 'aes-256-cbc';
const CRYPTO_SECRET = process.env.CRYPTO_SECRET;
const DECRYPTION_KEY = crypto.scryptSync(CRYPTO_SECRET, 'salt', 32);

function decrypt(text) {
  try {
    const [ivHex, encryptedHex] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, DECRYPTION_KEY, iv);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  } catch (e) {
    console.warn("Errore nella decifratura:", e.message);
    return "";
  }
}

// ================================================
// FUNZIONI SOLO FILE JSON
// ================================================

/**
 * Recupera i dati dell’utente da JSON (decifra CF e cartaID)
 */
async function getProfiloUtente(email) {
  if (!email) {
    console.warn("[GET PROFILO] Email non specificata");
    return null;
  }

  if (fs.existsSync(utentiPath)) {
    const utenti = JSON.parse(fs.readFileSync(utentiPath, 'utf8'));
    const utente = utenti.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (utente) {
      return {
        nome: utente.nome || "",
        cognome: utente.cognome || "",
        email: utente.email,
        password: utente.password, // resta hashata con bcrypt
        CF: decrypt(utente.CF),
        cartaID: decrypt(utente.cartaID),
        ultimaAttivita: utente.ultimaAttivita || null
      };
    }
  }

  // // MongoDB disattivato (solo debug)
  // const utenteDB = await Utente.findOne({ email }).lean();
  // if (utenteDB) {
  //   return {
  //     nome: utenteDB.nome,
  //     cognome: utenteDB.cognome,
  //     email: utenteDB.email,
  //     password: utenteDB.password,
  //     CF: utenteDB.CF,
  //     cartaID: utenteDB.cartaID
  //   };
  // }

  return null;
}

/**
 * Modifica un campo se la password è corretta (cripta CF/cartaID)
 */
async function modificaProfiloUtente(email, password, field, newValue) {
  console.log("Richiesta modifica:", { email, field, newValue });

  const fieldMap = {
    nome: 'nome',
    cognome: 'cognome',
    email: 'email',
    password: 'password',
    CF: 'CF',
    cartaID: 'cartaID'
  };

  const chiave = fieldMap[field];
  if (!chiave) {
    console.log("Campo non valido:", field);
    return false;
  }

  let modificatoJSON = false;

  // Modifica nel file JSON
  if (fs.existsSync(utentiPath)) {
    const utenti = JSON.parse(fs.readFileSync(utentiPath, 'utf8'));

    const utentiAggiornati = await Promise.all(
      utenti.map(async (u) => {
        if (u.email === email) {
          const passwordCorretta = await bcrypt.compare(password, u.password);
          if (passwordCorretta) {
            if (chiave === 'password') {
              u.password = await bcrypt.hash(newValue.trim(), 10);
              console.log("Password aggiornata (bcrypt)");
            } else if (chiave === 'CF' || chiave === 'cartaID') {
              u[chiave] = cifraTesto(newValue.trim());
              console.log(`Campo '${chiave}' criptato`);
            } else {
              u[chiave] = newValue.trim();
              console.log(`Campo '${chiave}' aggiornato`);
            }

            u.ultimaAttivita = new Date();
            modificatoJSON = true;
          } else {
            console.log("Password errata. Nessuna modifica eseguita.");
          }
        }
        return u;
      })
    );

    if (modificatoJSON) {
      fs.writeFileSync(utentiPath, JSON.stringify(utentiAggiornati, null, 2));
      console.log("File utenti aggiornato");
    } else {
      console.log("Nessuna modifica effettuata");
    }
  } else {
    console.log("File utenti non trovato");
  }

  return modificatoJSON;
  
}


  // // Modifica su MongoDB (disattivata)
  // const utenteDB = await Utente.findOne({ email });
  // if (utenteDB && await bcrypt.compare(password, utenteDB.password)) {
  //   const updateData = {};
  //   updateData[chiave] = chiave === 'password'
  //     ? await bcrypt.hash(newValue.trim(), 10)
  //     : (chiave === 'CF' || chiave === 'cartaID')
  //         ? cifraTesto(newValue.trim())
  //         : newValue.trim();
  //   await Utente.updateOne({ email }, { $set: updateData });
  // }

   // || modificatoMongo;


/**
 * Aggiorna la data dell'ultima attività per un utente
 */
async function aggiornaUltimaAttivita(email) {
  // File JSON
  if (fs.existsSync(utentiPath)) {
    const utenti = JSON.parse(fs.readFileSync(utentiPath, "utf-8"));
    const indice = utenti.findIndex(u => u.email === email);

    if (indice !== -1) {
      utenti[indice].ultimaAttivita = new Date();
      fs.writeFileSync(utentiPath, JSON.stringify(utenti, null, 2));
      console.log(`Aggiornata ultimaAttivita per ${email}`);
    }
  }

  // MongoDB (opzionale, disattivato)
  // const utente = await Utente.findOne({ email });
  // if (utente) {
  //   utente.ultimaAttivita = new Date();
  //   await utente.save();
  //   console.log(`(MongoDB) ultimaAttivita aggiornata per ${email}`);
  // }
}

/**
 * Aggiunge punti all'utente specificato nel file utenti_completo.json
 */
function aggiornaPuntiUtente(email, punti, nuovaAzione = null) {
  if (!fs.existsSync(pathUtentiCompleto)) return false;

  const utenti = JSON.parse(fs.readFileSync(pathUtentiCompleto, "utf-8"));
  const indice = utenti.findIndex(u => u.email === email);

  if (indice === -1) return false;

  const utente = utenti[indice];
  utente.punti = (utente.punti || 0) + punti;
  utente.saldo = (utente.saldo || 0) + punti;

  // Se c'è una nuova azione da tracciare nello storico
  if (nuovaAzione) {
    utente.storico = utente.storico || [];
    utente.storico.push({
      ...nuovaAzione,
      data: new Date().toISOString(),
      punti
    });
  }



  fs.writeFileSync(pathUtentiCompleto, JSON.stringify(utenti, null, 2));
  console.log(`[aggiornaPuntiUtente] ${punti} punti aggiornati per ${email}`);
  return true;
}
function getDatiFunzionaliUtente(email) {
  if (!fs.existsSync(pathUtentiCompleto)) return null;

  const utenti = JSON.parse(fs.readFileSync(pathUtentiCompleto, "utf-8"));
  return utenti.find(u => u.email === email) || null;
}

  // ================================================
  // MongoDB (disattivato)
  // ================================================
  // Utente.updateOne({ email }, {
  //   $inc: { punti: punti, saldo: punti }
  // }).then(() => console.log(`Punti aggiornati per ${email} (MongoDB)`))
  //   .catch(err => console.error("Errore aggiornamento MongoDB:", err));

  //return true;


// ================================================
// Export
// ================================================
module.exports = {
  getProfiloUtente,
  modificaProfiloUtente,
  aggiornaUltimaAttivita,
  aggiornaPuntiUtente,
  getDatiFunzionaliUtente
};
