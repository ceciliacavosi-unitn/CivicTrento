require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require("bcrypt");

// 📂 Percorso del file utenti.json
const filePath = path.join(__dirname,'data', 'utenti.json');
const tokenPath = path.join(__dirname, "password_reset_tokens.txt");


// 🌐 Connessione MongoDB disabilitata (commentata)
// const mongoose = require('mongoose');
// mongoose.connect(process.env.DB_URL, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
// .then(() => console.log('✅ Connesso a MongoDB'))
// .catch(err => console.error('❌ Errore connessione MongoDB:', err));

// 📄 Schema e modello Mongoose disabilitati (commentati)
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
// 🟢 FUNZIONI DI AUTENTICAZIONE (solo con file JSON)
//

/**
 * ✅ REGISTRA UTENTE
 */
async function registraUtente({ nome, cognome, email, password, CF, cartaID }) {
  let utenti = [];

  // ✅ Carica utenti da file JSON
  if (fs.existsSync(filePath)) {
    const contenuto = fs.readFileSync(filePath, 'utf8');
    utenti = contenuto ? JSON.parse(contenuto) : [];

    if (utenti.some(u => u.email === email)) {
      console.warn("❌ Email già registrata:", email);
      return false;
    }
  }

  // 🔐 Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const nuovoUtente = {
    nome,
    cognome,
    email,
    password: hashedPassword,
    CF,
    cartaID
  };

  // ✅ Salva su file JSON
  utenti.push(nuovoUtente);

  console.log("📝 Salvataggio utente nel file:", {
    ...nuovoUtente,
    password: '[HASHED]'
  });

  fs.writeFileSync(filePath, JSON.stringify(utenti, null, 2));

  // 🟨 Salva su MongoDB (opzionale - attiva se vuoi)
  /*
  try {
    await mongoClient.connect();
    const db = mongoClient.db("civictrento");
    const collection = db.collection("utenti");

    const emailEsiste = await collection.findOne({ email });
    if (emailEsiste) {
      console.warn("❌ [MongoDB] Email già registrata:", email);
      return false;
    }

    await collection.insertOne(nuovoUtente);
    console.log("✅ [MongoDB] Utente registrato anche nel database.");
  } catch (err) {
    console.error("❌ [MongoDB] Errore durante la registrazione:", err);
  } finally {
    await mongoClient.close();
  }
  */

  return true;
}


/**
 * ✅ LOGIN (verifica credenziali nel file)
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
      console.error("❌ Errore parsing utenti.json:", err);
    }
  }
  return null;
}


/**
 * ✅ CANCELLA UTENTE (solo nel file JSON)
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

//reimposta password
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
      return false; // rimuove il token usato
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
  fs.writeFileSync(tokenPath, tokenLinesFiltered.join("\n") + "\n"); // salva senza il token usato

  return { success: true, email };
}


// 🧾 Esportazione
module.exports = {
  registraUtente,
  trovaCredenziali,
  cancellaUtente,
  reimpostaPasswordConToken
};
