// gestione_abbonamenti.js
const fs = require("fs");
const path = require("path");

// Percorsi ai file
const pathAbbonamenti = path.join(__dirname, "data", "numeri_abbonamenti.json");
//const pathUtenti = path.join(__dirname, "data", "utenti_completo.json");

// Carica gli abbonamenti
let abbonamentiData = [];
try {
  const rawAbbonamenti = fs.readFileSync(pathAbbonamenti, "utf-8");
  abbonamentiData = JSON.parse(rawAbbonamenti);
  console.log("✔️ File degli abbonamenti caricato con successo. Voci totali:", abbonamentiData.length);
} catch (error) {
  console.error("❌ Errore nella lettura del file degli abbonamenti:", error);
}

// Trova abbonamento da codice
function getAbbonamentoDaCodice(codiceAbbonamento) {
  return abbonamentiData.find(
    (a) => a.codiceAbbonamento === codiceAbbonamento
  );
}

// Applica bonus se il codice abbonamento corrisponde all'utente, è valido e non già registrato
function applicaBonusAbbonamento(nome, cognome, codiceAbbonamento, utentiData) {
  console.log(`➡️ Applicazione bonus abbonamento per: ${nome} ${cognome}`);

  const abbonamento = getAbbonamentoDaCodice(codiceAbbonamento);
  if (!abbonamento) {
    console.warn(`⚠️ Nessun abbonamento trovato con codice: ${codiceAbbonamento}`);
    return false;
  }

  if (
    abbonamento.nome.toLowerCase() !== nome.toLowerCase() ||
    abbonamento.cognome.toLowerCase() !== cognome.toLowerCase()
  ) {
    console.warn(`⚠️ Il codice abbonamento non corrisponde all'utente ${nome} ${cognome}`);
    return false;
  }

  const oggi = new Date();
  const dataValidoFino = new Date(abbonamento.validoFino);
  if (dataValidoFino < oggi) {
    console.warn(`⛔ Abbonamento scaduto il ${abbonamento.validoFino}`);
    return false;
  }

  const utente = utentiData.find(
    u => u.nome.toLowerCase() === nome.toLowerCase() && u.cognome.toLowerCase() === cognome.toLowerCase()
  );

  if (!utente) {
    console.warn(`⚠️ Utente ${nome} ${cognome} non trovato nel file utenti.`);
    return false;
  }

  if (!Array.isArray(utente.storico)) utente.storico = [];

  const azione = `Abbonamento ${abbonamento.tipo}`;
  const data = abbonamento.dataAbb;

  const voceEsistente = utente.storico.find(
    voce => voce.azione === azione && voce.data === data
  );

  if (voceEsistente) {
    // Aggiorna flag se già presente
    voceEsistente.daAggiungereAlSaldo = false;
    console.log(`ℹ️ Bonus già presente — flag daAggiungereAlSaldo aggiornato a false per ${nome} ${cognome}`);
    return false;
  }

  const punti = 50;

  utente.storico.push({
    azione,
    data,
    saldo: punti,
    daAggiungereAlSaldo: true
  });

  console.log(`✅ Bonus abbonamento applicato per ${nome} ${cognome}`);
  return true;
}


module.exports = {
  getAbbonamentoDaCodice,
  applicaBonusAbbonamento
};
