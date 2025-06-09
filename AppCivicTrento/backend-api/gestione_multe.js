// gestione_multe.js
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

function applicaPenalitaMulteDaNominativo(nome, cognome) {
  console.log(`➡️ Applicazione penalità per: ${nome} ${cognome}`);
  const utente = utentiData.find(
    u => u.nome.toLowerCase() === nome.toLowerCase() && u.cognome.toLowerCase() === cognome.toLowerCase()
  );
  if (!utente) {
    console.warn(`⚠️ Utente ${nome} ${cognome} non trovato nel file utenti.`);
    return;
  }

  const multeUtente = getMulteUtente(nome, cognome);
  if (!multeUtente) {
    console.log(`ℹ️ Nessuna multa trovata per ${nome} ${cognome}.`);
    return;
  }

  const haGrave = multeUtente.some(m => m.tipo === "grave");

  if (haGrave) {
    utente.storico.saldo = -200;
    console.log(`🚨 Multe gravi trovate per ${nome} ${cognome}`);
  } else {
    const multeMedie = multeUtente.filter(m => m.tipo === "media").length;
    utente.storico.saldo = -40 * multeMedie;
  }

  if (!utente.storico) utente.storico = [];
  utente.storico.push({
    azione: "penalità per multe",
    data: new Date().toISOString(),
    saldo: utente.storico.saldo
  });

  fs.writeFileSync(pathUtenti, JSON.stringify(utentiData, null, 2), "utf-8");
  console.log(`✅ Penalità applicata e file utenti aggiornato per ${nome} ${cognome}`);
}

module.exports = {
  getMulteUtente,
  getMulteDaPatente,
  applicaPenalitaMulteDaNominativo
};
