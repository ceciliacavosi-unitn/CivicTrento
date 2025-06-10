const fs = require("fs");
const path = require("path");

// Percorso al file delle multe
const pathMulte = path.join(__dirname, "data", "multe_abitantiTN.json");
const pathUtenti = path.join(__dirname, "data", "utenti_completo.json");

// Carica le multe
let multeData = [];
try {
  const rawData = fs.readFileSync(pathMulte, "utf-8");
  multeData = JSON.parse(rawData);
  console.log("✔️ File delle multe caricato con successo. Voci totali:", multeData.length);
} catch (error) {
  console.error("❌ Errore nella lettura del file delle multe:", error);
}

// Carica gli utenti
let utentiData = [];
try {
  const rawUtenti = fs.readFileSync(pathUtenti, "utf-8");
  utentiData = JSON.parse(rawUtenti);
  console.log("✔️ File degli utenti caricato con successo. Utenti totali:", utentiData.length);
} catch (error) {
  console.error("❌ Errore nella lettura del file degli utenti:", error);
}

function getMulteUtente(nome, cognome) {
  const utente = multeData.find(
    (u) => u.nome.toLowerCase() === nome.toLowerCase() && u.cognome.toLowerCase() === cognome.toLowerCase()
  );
  return utente ? utente.multe : null;
}

function getMulteDaPatente(numeroPatente) {
  const utente = multeData.find(
    (u) => u.numeroPatente.toUpperCase() === numeroPatente.toUpperCase()
  );
  return utente ? utente.multe : null;
}

function applicaPenalitaMulte(nome, cognome, numeroPatente) {
  console.log(`➡️ Applicazione penalità per: ${nome} ${cognome}, patente: ${numeroPatente}`);

  // Trova utente nel file utenti
  const utente = utentiData.find(
    u => u.nome.toLowerCase() === nome.toLowerCase() && u.cognome.toLowerCase() === cognome.toLowerCase()
  );
  if (!utente) {
    console.warn(`⚠️ Utente ${nome} ${cognome} non trovato nel file utenti.`);
    return;
  }

  // Inizializza storico se non esiste
  if (!Array.isArray(utente.storico)) {
    utente.storico = [];
  }

  // Recupera tutte le multe
  const multeUtente = getMulteDaPatente(numeroPatente);
  if (!Array.isArray(multeUtente) || multeUtente.length === 0) {
    console.log(`ℹ️ Nessuna multa trovata per patente ${numeroPatente}.`);
    return;
  }

  // Per ogni multa crea una voce di penalità “singola”
  multeUtente.forEach(m => {
    // Chiave per controllare se già applicata
    const already = utente.storico.some(entry =>
      entry.azione === "penalità per multe" &&
      entry.numeroPatente === numeroPatente &&
      entry.data === m.data
    );
    if (already) {
      console.log(`ℹ️ Penalità già inserita per multa del ${m.data}.`);
      return;
    }

    // Calcolo penalità per questa multa
    const saldoPenalita = (m.tipo === "grave") ? -200 : -40;

    // Inserimento nel storico con la data esatta della multa
    utente.storico.push({
      azione: "penalità per multe",
      data: m.data,
      numeroPatente,
      saldo: saldoPenalita
    });

    console.log(`✅ Penalità ${saldoPenalita} inserita per multa del ${m.data}.`);
  });

  // Salva file utenti UNA SOLA VOLTA, dopo aver processato tutte le multe
  fs.writeFileSync(pathUtenti, JSON.stringify(utentiData, null, 2), "utf-8");
  console.log(`✅ File utenti aggiornato per ${nome} ${cognome}`);
}


module.exports = {
  getMulteUtente,
  getMulteDaPatente,
  applicaPenalitaMulte
};