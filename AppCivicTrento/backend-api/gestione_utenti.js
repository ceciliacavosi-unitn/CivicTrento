require('dotenv').config();
// const mongoose = require('mongoose'); // 🔧 disattivato
const fs = require('fs');
const path = require('path');
const bcrypt = require("bcrypt");

// Connessione a MongoDB disabilitata
// mongoose.connect(process.env.DB_URL, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
// .then(() => console.log('Connesso a MongoDB'))
// .catch(err => console.error(' Errore connessione MongoDB:', err));

// Percorso del file JSON
const filePath = path.join(__dirname, 'utenti.json');

// Modello Mongoose disabilitato
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
// FUNZIONI SOLO FILE JSON
// ================================================

/**
 *  Verifica credenziali
 */
async function verificaUtente(email, password) {
  try {
    if (fs.existsSync(filePath)) {
      const utenti = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const utente = utenti.find(u => u.email === email);
      if (utente && await bcrypt.compare(password, utente.password)) {
        return true;
      }
    }

    // // Verifica anche su MongoDB (disattivato)
    // const utenteDB = await Utente.findOne({ email }).lean();
    // if (utenteDB && await bcrypt.compare(password, utenteDB.password)) {
    //   return true;
    // }

    return false;

  } catch (err) {
    console.error(" Errore nella verifica utente:", err);
    return false;
  }
}

/**
 * Recupera i dati dell’utente da JSON
 */
async function getProfiloUtente(email, password) {
  if (fs.existsSync(filePath)) {
    const utenti = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const utente = utenti.find(u => u.email === email);
    if (utente && await bcrypt.compare(password, utente.password)) {
      return {
        nome: utente.nome,
        cognome: utente.cognome,
        email: utente.email,
        password: utente.password,
        CF: utente.CF,
        cartaID: utente.cartaID
      };
    }
  }

  // // MongoDB disattivato (solo debug)
  // const utenteDB = await Utente.findOne({ email }).lean();
  // if (utenteDB && await bcrypt.compare(password, utenteDB.password)) {
  //   console.log(" Utente trovato in MongoDB:", utenteDB);
  //   // return utenteDB;
  // }

  return null;
}

/**
 *  Modifica un campo se la password è corretta
 */
async function modificaProfiloUtente(email, password, field, newValue) {
  console.log("🔧 Richiesta modifica:", { email, field, newValue });

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

  //  Modifica nel file JSON
  if (fs.existsSync(filePath)) {
    console.log("📄 File utenti trovato:", filePath);
    const utenti = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const utentiAggiornati = await Promise.all(
      utenti.map(async (u) => {
        if (u.email === email) {
          const passwordCorretta = await bcrypt.compare(password, u.password);
          console.log(`🔍 Verifica password per ${email}:`, passwordCorretta);

          if (passwordCorretta) {
            console.log(`✏️ Modifica campo '${chiave}' per ${email}`);
            if (chiave === 'password') {
              u.password = await bcrypt.hash(newValue.trim(), 10);
              console.log(" Password aggiornata");
            } else {
              u[chiave] = newValue.trim();
              console.log(` Campo '${chiave}' aggiornato a '${newValue.trim()}'`);
            }
            modificatoJSON = true;
          }
        }
        return u;
      })
    );

    if (modificatoJSON) {
      fs.writeFileSync(filePath, JSON.stringify(utentiAggiornati, null, 2));
      console.log(" File utenti aggiornato con successo");
    } else {
      console.log(" Nessuna modifica effettuata");
    }
  } else {
    console.log(" File utenti non trovato");
  }

  //  Modifica su MongoDB (disattivata)
  // const utenteDB = await Utente.findOne({ email });
  // let modificatoMongo = false;
  // if (utenteDB && await bcrypt.compare(password, utenteDB.password)) {
  //   const updateData = {};
  //   updateData[chiave] = chiave === 'password' ? await bcrypt.hash(newValue.trim(), 10) : newValue.trim();
  //   const result = await Utente.updateOne({ email }, { $set: updateData });
  //   modificatoMongo = result.modifiedCount > 0;
  // }

  return modificatoJSON; // || modificatoMongo;
}


// ================================================
//  Export
// ================================================
module.exports = {
  getProfiloUtente,
  modificaProfiloUtente,
  verificaUtente
};