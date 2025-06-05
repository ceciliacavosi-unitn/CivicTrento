const fs = require("fs");
const path = require("path");
// const mongoose = require("mongoose"); // MongoDB disattivato

const FILE_PATH = path.join(__dirname, "data", "utenze.json");
const CATEGORIE_UTENZE = ["luce", "gas", "acqua"];

// ===================================================
// MongoDB disattivato (puoi riattivare se necessario)
// ===================================================

// mongoose.connect(process.env.DB_URL, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// }).then(() => console.log("Connesso a MongoDB"))
//   .catch(err => console.error("Errore connessione MongoDB:", err));

// const utenzaSchema = new mongoose.Schema({
//   idUtente: String,
//   utenze: {
//     luce: {
//       codicePOD: String,
//       fornitore: String,
//       consenso: Boolean
//     },
//     gas: {
//       codicePOD: String,
//       fornitore: String,
//       consenso: Boolean
//     },
//     acqua: {
//       codicePOD: String,
//       fornitore: String,
//       consenso: Boolean
//     }
//   }
// }, {
//   collection: 'utenze'
// });

// const Utenza = mongoose.model("Utenza", utenzaSchema);

//Legge il file utenze.json e restituisce i dati come array 
function leggiUtenze() {
  if (!fs.existsSync(FILE_PATH)) return [];
  try {
    const contenuto = fs.readFileSync(FILE_PATH, "utf8");
    return JSON.parse(contenuto);
  } catch (err) {
    console.error("[leggiUtenze] Errore nella lettura del file:", err);
    return [];
  }
}

//Salva nel file le utenze aggiornate
function scriviUtenze(dati) {
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(dati, null, 2));
    console.log("[scriviUtenze] File utenze.json aggiornato.");
  } catch (err) {
    console.error("[scriviUtenze] Errore nella scrittura:", err);
  }
}

//Aggiunge o modifica una specifica utenza per un utente
function aggiungiOModificaUtenza({ idUtente, utenza, codicePOD, fornitore, consenso }) {
  console.log("[aggiungiOModificaUtenza] Richiesta:", { idUtente, utenza, codicePOD, fornitore, consenso });

  if (!CATEGORIE_UTENZE.includes(utenza)) {
    console.warn(`[aggiungiOModificaUtenza] Categoria utenza '${utenza}' non valida.`);
    return false;
  }

  const tutteLeUtenze = leggiUtenze();
  let recordUtente = tutteLeUtenze.find(u => u.idUtente === idUtente);

  if (!recordUtente) {
    console.log(`[aggiungiOModificaUtenza] Nessun record per ${idUtente}. Creazione nuovo.`);
    recordUtente = {
      idUtente,
      utenze: {}
    };
    tutteLeUtenze.push(recordUtente);
  }

  recordUtente.utenze[utenza] = {
    codicePOD: codicePOD.trim(),
    fornitore: fornitore.trim(),
    consenso: Boolean(consenso)
  };

  scriviUtenze(tutteLeUtenze);

  // // Salva anche nel DB (disattivato)
  // Utenza.findOneAndUpdate(
  //   { idUtente },
  //   recordUtente,
  //   { upsert: true, new: true }
  // ).exec();

  return true;
}

// Recupera tutte le utenze associate a un utente
function getUtenze(idUtente) {
  const utenze = leggiUtenze();
  const record = utenze.find(u => u.idUtente === idUtente);

  // // Salva anche nel DB (disattivato)
  // if (record) {
  //   Utenza.findOneAndUpdate(
  //     { idUtente },
  //     record,
  //     { upsert: true, new: true }
  //   ).exec();
  // }

  return record?.utenze || {};
}

module.exports = {
  aggiungiOModificaUtenza,
  getUtenze
};

