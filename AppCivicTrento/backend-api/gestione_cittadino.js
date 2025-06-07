const fs = require("fs");
const path = require("path");
// const mongoose = require("mongoose"); // MongoDB disattivato


// Percorso del file JSON
const pathDatiCittadino = path.join(__dirname, 'data', "dati_cittadino.json");
const pathStoricoMovimento = path.join(__dirname, "data", "monitoraggio_movimento.json");
const pathPatenti = path.join(__dirname, 'data', 'numeri_patenti.json');
const pathAbbonamenti = path.join(__dirname, 'data', 'numeri_abbonamenti.json');
const pathCodiciPod = path.join(__dirname, 'data', 'codici_pod.json');

// Campi previsti nei dati
const header = ["email", "subscription_code", "pod_code", "driver_license"];

// ===================================================
// MongoDB disattivato (puoi riattivare se necessario)
// ===================================================

// mongoose.connect(process.env.DB_URL, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// }).then(() => console.log("Connesso a MongoDB"))
//   .catch(err => console.error("Errore connessione MongoDB:", err));

// const cittadinoSchema = new mongoose.Schema({
//   email: String,
//   subscription_code: String,
//   pod_code: String,
//   driver_license: String
// }, {
//   collection: 'datiCittadino'
// });

// const DatiCittadino = mongoose.model('DatiCittadino', cittadinoSchema);

// ===================================================
// FUNZIONI BASATE SU FILE JSON
// ===================================================

/**
 * Recupera i dati da JSON
 */
function getDatiCittadino(email) {
  if (!fs.existsSync(pathDatiCittadino)) return null;
  const contenuto = fs.readFileSync(pathDatiCittadino, "utf-8");
  const dati = contenuto ? JSON.parse(contenuto) : [];
  const utente = dati.find(d => d.email === email) || null;

  // // Salva anche su MongoDB (disattivato)
  // if (utente) {
  //   DatiCittadino.findOneAndUpdate(
  //     { email },
  //     utente,
  //     { upsert: true, new: true }
  //   ).exec();
  // }

  return utente;
}

/**
 * Aggiunge un campo se non presente
 */
function aggiungiDato(email, field, value) {
  console.log("[aggiungiDato] Richiesta ricevuta:", { email, field, value });

  if (!header.includes(field)) {
    console.warn(`[aggiungiDato] Campo '${field}' non ammesso.`);
    return false;
  }

  // Verifica validità del valore inserito
  if (field === "driver_license" && !verificaPatente(value)) {
    console.warn("[aggiungiDato] Numero patente non valido.");
    return false;
  }
  if (field === "subscription_code" && !verificaAbbonamento(value)) {
    console.warn("[aggiungiDato] Numero abbonamento non valido.");
    return false;
  }
  if (field === "pod_code" && !verificaCodicePOD(value)) {
    console.warn("[aggiungiDato] Codice POD non valido.");
    return false;
  }


  let dati = [];
  if (fs.existsSync(pathDatiCittadino)) {
    try {
      dati = JSON.parse(fs.readFileSync(pathDatiCittadino, "utf8"));
    } catch (err) {
      console.error("[aggiungiDato] Errore nella lettura del file JSON:", err);
      return false;
    }
  }

  let utente = dati.find(u => u.email === email);
  if (!utente) {
    console.log(`[aggiungiDato] Nessun utente trovato con email '${email}'. Creazione nuovo record.`);
    utente = { email };
    dati.push(utente);
  }

  if (utente[field]) {
    console.warn(`[aggiungiDato] Il campo '${field}' esiste già per '${email}'`);
    return false;
  }

  utente[field] = value.trim();
  console.log(`[aggiungiDato] Aggiunto campo '${field}' con valore '${value.trim()}'`);

  try {
    fs.writeFileSync(pathDatiCittadino, JSON.stringify(dati, null, 2));
    console.log("[aggiungiDato] File aggiornato correttamente.");
  } catch (err) {
    console.error("[aggiungiDato] Errore nella scrittura del file JSON:", err);
    return false;
  }

  // // Salva anche nel DB (disattivato)
  // DatiCittadino.findOneAndUpdate(
  //   { email },
  //   utente,
  //   { upsert: true, new: true }
  // ).exec();

  return true;
}


/**
 * Modifica un campo esistente
 */
function modificaDato(email, field, value) {
  console.log("[modificaDato] Richiesta ricevuta:", { email, field, value });

  if (!header.includes(field)) {
    console.warn(`[modificaDato] Campo '${field}' non ammesso.`);
    return false;
  }

  // Verifica validità prima di modificare
  if (field === "driver_license" && !verificaPatente(value)) {
    console.warn("[modificaDato] Numero patente non valido.");
    return false;
  }
  if (field === "subscription_code" && !verificaAbbonamento(value)) {
    console.warn("[modificaDato] Numero abbonamento non valido.");
    return false;
  }
  if (field === "pod_code" && !verificaCodicePOD(value)) {
    console.warn("[modificaDato] Codice POD non valido.");
    return false;
  }



  if (!fs.existsSync(pathDatiCittadino)) {
    console.error("[modificaDato] File JSON non trovato.");
    return false;
  }

  let dati;
  try {
    dati = JSON.parse(fs.readFileSync(pathDatiCittadino, "utf8"));
  } catch (err) {
    console.error("[modificaDato] Errore nella lettura del file JSON:", err);
    return false;
  }

  let utente = dati.find(u => u.email === email);
  if (!utente) {
    console.warn(`[modificaDato] Nessun utente trovato con email '${email}'`);
    return false;
  }

  const precedente = utente[field];
  utente[field] = value.trim();
  console.log(`[modificaDato] Campo '${field}' modificato da '${precedente}' a '${value.trim()}'`);

  try {
    fs.writeFileSync(pathDatiCittadino, JSON.stringify(dati, null, 2));
    console.log("[modificaDato] File aggiornato correttamente.");
  } catch (err) {
    console.error("[modificaDato] Errore nella scrittura del file JSON:", err);
    return false;
  }

  // // Aggiorna nel DB (disattivato)
  // DatiCittadino.findOneAndUpdate(
  //   { email },
  //   utente,
  //   { new: true }
  // ).exec();

  return true;
}


/**
 * Rimuove un campo specifico
 */
function rimuoviDato(email, field) {
  if (!header.includes(field)) return false;

  if (!fs.existsSync(pathDatiCittadino)) return false;
  let dati = JSON.parse(fs.readFileSync(pathDatiCittadino, "utf8"));

  let utente = dati.find(u => u.email === email);
  if (!utente || !utente[field]) return false;

  delete utente[field];
  fs.writeFileSync(pathDatiCittadino, JSON.stringify(dati, null, 2));

  // // Aggiorna nel DB (disattivato)
  // DatiCittadino.findOneAndUpdate(
  //   { email },
  //   utente,
  //   { new: true }
  // ).exec();

  return true;
}

/**
 * Rimuove tutti i dati dell’utente
 */
function rimuoviTutti(email) {
  if (!fs.existsSync(pathDatiCittadino)) return false;
  let dati = JSON.parse(fs.readFileSync(pathDatiCittadino, "utf8"));

  const nuoviDati = dati.filter(u => u.email !== email);
  fs.writeFileSync(pathDatiCittadino, JSON.stringify(nuoviDati, null, 2));

  // // Elimina dal DB (disattivato)
  // DatiCittadino.deleteOne({ email }).exec();

  return true;
}

/**
 * Salva un movimento (km percorsi) nello storico e restituisce i punti assegnati
 */
function registraMovimento(email, kmPercorsi, data) {
  const punti = Math.floor(kmPercorsi); // 1 punto per km intero

  const storico = fs.existsSync(pathStoricoMovimento)
    ? JSON.parse(fs.readFileSync(pathStoricoMovimento, "utf-8"))
    : [];

  storico.push({ utente: email, data, km: kmPercorsi, punti });
  fs.writeFileSync(pathStoricoMovimento, JSON.stringify(storico, null, 2));

  // ================================================
  // MongoDB (disattivato)
  // ================================================
  // const nuovoMovimento = new Movimento({
  //   utente: email,
  //   data: new Date(data),
  //   km: kmPercorsi,
  //   punti: punti
  // });
  // nuovoMovimento.save()
  //   .then(() => console.log(`Movimento salvato per ${email} (MongoDB)`))
  //   .catch(err => console.error("Errore salvataggio movimento MongoDB:", err));

  return punti;
}

function verificaPatente(numeroPatente) {
  if (!fs.existsSync(pathPatenti)) return false;
  const patenti = JSON.parse(fs.readFileSync(pathPatenti, 'utf8'));
  return patenti.some(p => p.numeroPatente === numeroPatente);
}

function verificaAbbonamento(numeroAbbonamento) {
  if (!fs.existsSync(pathAbbonamenti)) return false;
  const abbonamenti = JSON.parse(fs.readFileSync(pathAbbonamenti, 'utf8'));
  return abbonamenti.some(a => a.numeroAbbonamento === numeroAbbonamento);
}

function verificaCodicePOD(codicePOD) {
  if (!fs.existsSync(pathCodiciPod)) return false;
  const pod = JSON.parse(fs.readFileSync(pathCodiciPod, 'utf8'));
  return pod.some(p => p.codicePOD === codicePOD);
}


// ===================================================
// Export delle funzioni
// ===================================================
module.exports = {
  getDatiCittadino,
  aggiungiDato,
  modificaDato,
  rimuoviDato,
  rimuoviTutti,
  registraMovimento
};
