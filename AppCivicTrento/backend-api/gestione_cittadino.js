// gestione_cittadino.js
const fs = require("fs");
const path = require("path");
const { decrypt } = require("./gestione_autenticazione");

const pathDatiCittadino = path.join(__dirname, 'data', "dati_cittadino.json");
const pathStoricoMovimento = path.join(__dirname, "data", "monitoraggio_movimento.json");
const pathPatenti = path.join(__dirname, 'data', 'numeri_patenti.json');
const pathAbbonamenti = path.join(__dirname, 'data', 'numeri_abbonamenti.json');
const pathCodiciPod = path.join(__dirname, 'data', 'codici_pod.json');
const pathUtenti = path.join(__dirname, 'data', 'utenti.json');
const pathAbitazioni = path.join(__dirname, 'data', 'abitazioni.json');
const pathUtentiCompleto = path.join(__dirname, 'data', 'utenti_completo.json');

const header = ["email", "subscription_code", "pod_code", "driver_license"];

// ===================================================
// MongoDB disattivato (puoi riattivare se necessario)
// ===================================================

// const mongoose = require("mongoose");
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

function trovaUtente(email) {
  if (!fs.existsSync(pathUtenti)) return null;
  const utenti = JSON.parse(fs.readFileSync(pathUtenti, "utf8"));
  return utenti.find(u => u.email === email) || null;
}

function trovaPatente(numeroPatente) {
  if (!fs.existsSync(pathPatenti)) return null;
  const patenti = JSON.parse(fs.readFileSync(pathPatenti, 'utf8'));
  return patenti.find(p => p.numeroPatente === numeroPatente) || null;
}

function trovaAbbonamento(codiceAbbonamento) {
  if (!fs.existsSync(pathAbbonamenti)) return null;
  const abbonamenti = JSON.parse(fs.readFileSync(pathAbbonamenti, 'utf8'));
  return abbonamenti.find(a => a.codiceAbbonamento === codiceAbbonamento) || null;
}

function trovaPod(codicePOD) {
  if (!fs.existsSync(pathAbitazioni)) return null;
  const abitazioni = JSON.parse(fs.readFileSync(pathAbitazioni, 'utf8'));
  return abitazioni.find(p => p.codicePOD === codicePOD) || null;
}

function getDatiCittadino(email) {
  if (!fs.existsSync(pathDatiCittadino)) return null;
  const dati = JSON.parse(fs.readFileSync(pathDatiCittadino, "utf-8"));
  return dati.find(d => d.email === email) || null;

  // Salva anche su MongoDB (disattivato)
  // if (utente) {
  //   DatiCittadino.findOneAndUpdate(
  //     { email },
  //     utente,
  //     { upsert: true, new: true }
  //   ).exec();
  // }
}

function aggiungiDato(email, field, value) {
  console.log("[aggiungiDato] Richiesta ricevuta:", { email, field, value });

  if (!header.includes(field)) {
    console.warn(`[aggiungiDato] Campo '${field}' non ammesso.`);
    return false;
  }

  const utenteRegistrato = trovaUtente(email);
  if (!utenteRegistrato) {
    console.warn("[aggiungiDato] Utente non trovato.");
    return false;
  }

  if (field === "driver_license") {
    const patente = trovaPatente(value);
    if (!patente || patente.nome !== utenteRegistrato.nome || patente.cognome !== utenteRegistrato.cognome) {
      console.warn("[aggiungiDato] Patente non trovata o nome/cognome errati.");
      return false;
    }
  }

  if (field === "subscription_code") {
    const abbonamento = trovaAbbonamento(value);
    if (!abbonamento || abbonamento.nome !== utenteRegistrato.nome || abbonamento.cognome !== utenteRegistrato.cognome) {
      console.warn("[aggiungiDato] Abbonamento non valido o nome/cognome errati.");
      return false;
    }
  }

  if (field === "pod_code") {
    const pod = trovaPod(value);
    const cartaIDutente = decrypt(utenteRegistrato.cartaID);
    if (!pod || !Array.isArray(pod.residenti) || !pod.residenti.includes(cartaIDutente)) {
      console.warn("[aggiungiDato] Codice POD non valido o cartaID errata.");
      return false;
    }
  }

  let dati = fs.existsSync(pathDatiCittadino) ? JSON.parse(fs.readFileSync(pathDatiCittadino, "utf8")) : [];
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
  fs.writeFileSync(pathDatiCittadino, JSON.stringify(dati, null, 2));
  console.log(`[aggiungiDato] Aggiunto campo '${field}' con valore '${value.trim()}'`);
  console.log("[aggiungiDato] File aggiornato correttamente.");

  // Salva anche su MongoDB (disattivato)
  // DatiCittadino.findOneAndUpdate(
  //   { email },
  //   utente,
  //   { upsert: true, new: true }
  // ).exec();

  return true;
}

function modificaDato(email, field, value) {
  console.log("[modificaDato] Richiesta ricevuta:", { email, field, value });

  if (!header.includes(field)) {
    console.warn(`[modificaDato] Campo '${field}' non ammesso.`);
    return false;
  }

  const utenteRegistrato = trovaUtente(email);
  if (!utenteRegistrato) return false;

  if (field === "driver_license") {
    const patente = trovaPatente(value);
    if (!patente || patente.nome !== utenteRegistrato.nome || patente.cognome !== utenteRegistrato.cognome) {
      console.warn("[modificaDato] Patente non trovata o nome/cognome errati.");
      return false;
    }
  }

  if (field === "subscription_code") {
    const abbonamento = trovaAbbonamento(value);
    if (!abbonamento || abbonamento.nome !== utenteRegistrato.nome || abbonamento.cognome !== utenteRegistrato.cognome) {
      console.warn("[modificaDato] Abbonamento non valido o nome/cognome errati.");
      return false;
    }
  }

  if (field === "pod_code") {
    const pod = trovaPod(value);
    const cartaIDutente = decrypt(utenteRegistrato.cartaID);
    if (!pod || !Array.isArray(pod.residenti) || !pod.residenti.includes(cartaIDutente)) {
      console.warn("[modificaDato] Codice POD non valido o cartaID errata.");
      return false;
    }
  }

  if (!fs.existsSync(pathDatiCittadino)) return false;
  const dati = JSON.parse(fs.readFileSync(pathDatiCittadino, "utf8"));
  let utente = dati.find(u => u.email === email);
  if (!utente) return false;

  utente[field] = value.trim();
  fs.writeFileSync(pathDatiCittadino, JSON.stringify(dati, null, 2));
  console.log(`[modificaDato] Campo '${field}' aggiornato con '${value.trim()}'`);

  // Aggiorna su MongoDB (disattivato)
  // DatiCittadino.findOneAndUpdate(
  //   { email },
  //   utente,
  //   { new: true }
  // ).exec();

  return true;
}

function rimuoviDato(email, field) {
  if (!header.includes(field)) return false;
  if (!fs.existsSync(pathDatiCittadino)) return false;

  const dati = JSON.parse(fs.readFileSync(pathDatiCittadino, "utf8"));
  let utente = dati.find(u => u.email === email);
  if (!utente || !utente[field]) return false;

  delete utente[field];
  fs.writeFileSync(pathDatiCittadino, JSON.stringify(dati, null, 2));

  // Aggiorna su MongoDB (disattivato)
  // DatiCittadino.findOneAndUpdate(
  //   { email },
  //   utente,
  //   { new: true }
  // ).exec();

  return true;
}

function rimuoviTutti(email) {
  if (!fs.existsSync(pathDatiCittadino)) return false;
  const dati = JSON.parse(fs.readFileSync(pathDatiCittadino, "utf8"));
  const nuoviDati = dati.filter(u => u.email !== email);
  fs.writeFileSync(pathDatiCittadino, JSON.stringify(nuoviDati, null, 2));

  // Elimina da MongoDB (disattivato)
  // DatiCittadino.deleteOne({ email }).exec();

  return true;
}

function registraMovimento(email, kmPercorsi, data) {
  const punti = Math.floor(kmPercorsi);
  const storico = fs.existsSync(pathStoricoMovimento)
    ? JSON.parse(fs.readFileSync(pathStoricoMovimento, "utf-8"))
    : [];

  storico.push({ utente: email, data, km: kmPercorsi, punti });
  fs.writeFileSync(pathStoricoMovimento, JSON.stringify(storico, null, 2));

  // Salva su MongoDB (disattivato)
  // const nuovoMovimento = new Movimento({ utente: email, data: new Date(data), km: kmPercorsi, punti });
  // nuovoMovimento.save()
  //   .then(() => console.log(`Movimento salvato per ${email} (MongoDB)`))
  //   .catch(err => console.error("Errore salvataggio movimento MongoDB:", err));

  return punti;
}

function aggiungiStorico(email, azione, datiExtra = {}) {
  if (!fs.existsSync(pathUtentiCompleto)) {
    fs.writeFileSync(pathUtentiCompleto, JSON.stringify([], null, 2));
  }

  const utenti = JSON.parse(fs.readFileSync(pathUtentiCompleto, 'utf8'));
  const utente = utenti.find(u => u.email === email);

  if (!utente) {
    console.warn(`[aggiungiStorico] Utente non trovato: ${email}`);
    return false;
  }

  if (!Array.isArray(utente.storico)) {
    utente.storico = [];
  }

  const voce = { azione, data: new Date().toISOString(), ...datiExtra };
  utente.storico.push(voce);

  fs.writeFileSync(pathUtentiCompleto, JSON.stringify(utenti, null, 2));
  console.log(`[aggiungiStorico] Aggiunta voce storico per ${email}:`, voce);

  return true;
}

function visualizzaStorico(email) {
  if (!fs.existsSync(pathUtentiCompleto)) {
    console.warn("[visualizzaStorico] File utenti_completo.json mancante.");
    return { saldo: 0, storico: [] };
  }

  const utenti = JSON.parse(fs.readFileSync(pathUtentiCompleto, "utf8"));
  const utente = utenti.find(u => u.email === email);

  if (!utente) {
    console.warn(`[visualizzaStorico] Utente non trovato: ${email}`);
    return { saldo: 0, storico: [] };
  }

  const saldo = typeof utente.saldo === 'number' ? utente.saldo : 0;

  const storicoOrdinato = Array.isArray(utente.storico)
    ? utente.storico.sort((a, b) => new Date(b.data) - new Date(a.data))
    : [];

  console.log(`[visualizzaStorico] Storico per ${email} (saldo: ${saldo}):`, storicoOrdinato);

  return {
    saldo,
    storico: storicoOrdinato,
  };
}
function aggiornaSaldoUtente(email, deltaPunti) {
  if (!fs.existsSync(pathUtentiCompleto)) {
    console.warn("[aggiornaSaldoUtente] File utenti_completo.json mancante.");
    return false;
  }

  const utenti = JSON.parse(fs.readFileSync(pathUtentiCompleto, "utf8"));
  const utente = utenti.find(u => u.email === email);

  if (!utente) {
    console.warn(`[aggiornaSaldoUtente] Utente non trovato: ${email}`);
    return false;
  }

  utente.saldo = (utente.saldo || 0) + deltaPunti;

  fs.writeFileSync(pathUtentiCompleto, JSON.stringify(utenti, null, 2));
  console.log(`[aggiornaSaldoUtente] Saldo aggiornato per ${email}: +${deltaPunti} punti`);

  return true;
}


function eliminaUtenteCompleto(email) {
  if (!fs.existsSync(pathUtentiCompleto)) {
    console.warn("[eliminaUtenteCompleto] File utenti_completo.json mancante.");
    return false;
  }

  const utenti = JSON.parse(fs.readFileSync(pathUtentiCompleto, "utf8"));
  const nuoviUtenti = utenti.filter(u => u.email !== email);

  if (nuoviUtenti.length === utenti.length) {
    console.warn(`[eliminaUtenteCompleto] Nessun utente trovato con email: ${email}`);
    return false;
  }

  fs.writeFileSync(pathUtentiCompleto, JSON.stringify(nuoviUtenti, null, 2));
  console.log(`[eliminaUtenteCompleto] Utente con email '${email}' rimosso dal file.`);

  return true;
}


module.exports = {
  getDatiCittadino,
  aggiungiDato,
  modificaDato,
  rimuoviDato,
  rimuoviTutti,
  registraMovimento,
  aggiungiStorico,
  visualizzaStorico,
  eliminaUtenteCompleto
};