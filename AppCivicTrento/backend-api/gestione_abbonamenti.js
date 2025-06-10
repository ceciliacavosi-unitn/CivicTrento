// gestione_abbonamenti.js
const fs = require("fs");
const path = require("path");

// Percorsi ai file
const pathAbbonamenti = path.join(__dirname, "data", "numeri_abbonamenti.json");
const pathUtenti = path.join(__dirname, "data", "utenti_completo.json");

// Carica gli abbonamenti
let abbonamentiData = [];
try {
  const rawAbbonamenti = fs.readFileSync(pathAbbonamenti, "utf-8");
  abbonamentiData = JSON.parse(rawAbbonamenti);
  console.log("✔️ File degli abbonamenti caricato con successo. Voci totali:", abbonamentiData.length);
} catch (error) {
  console.error("❌ Errore nella lettura del file degli abbonamenti:", error);
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

// Trova abbonamento da codice
function getAbbonamentoDaCodice(codiceAbbonamento) {
  return abbonamentiData.find(
    (a) => a.codiceAbbonamento === codiceAbbonamento
  );
}

// Applica bonus se il codice abbonamento corrisponde all'utente, è valido e non già registrato
function applicaBonusAbbonamento(nome, cognome, codiceAbbonamento) {
  console.log(`➡️ Applicazione bonus abbonamento per: ${nome} ${cognome}`);

  const abbonamento = getAbbonamentoDaCodice(codiceAbbonamento);
  if (!abbonamento) {
    console.warn(`⚠️ Nessun abbonamento trovato con codice: ${codiceAbbonamento}`);
    return;
  }

  if (
    abbonamento.nome.toLowerCase() !== nome.toLowerCase() ||
    abbonamento.cognome.toLowerCase() !== cognome.toLowerCase()
  ) {
    console.warn(`⚠️ Il codice abbonamento non corrisponde all'utente ${nome} ${cognome}`);
    return;
  }

  const oggi = new Date();
  const dataValidoFino = new Date(abbonamento.validoFino);
  if (dataValidoFino < oggi) {
    console.warn(`⛔ Abbonamento scaduto il ${abbonamento.validoFino}`);
    return;
  }

  const utente = utentiData.find(
    u => u.nome.toLowerCase() === nome.toLowerCase() && u.cognome.toLowerCase() === cognome.toLowerCase()
  );

  if (!utente) {
    console.warn(`⚠️ Utente ${nome} ${cognome} non trovato nel file utenti.`);
    return;
  }

  if (!utente.storico) utente.storico = [];

  // Controllo se il bonus è già stato applicato
  const giàPresente = utente.storico.some(
    voce =>
      voce.azione === "bonus abbonamento" &&
      voce.data === abbonamento.dataAbb
  );

  if (giàPresente) {
    console.log(`ℹ️ Bonus abbonamento già applicato per ${nome} ${cognome} in data ${abbonamento.dataAbb}`);
    return;
  }

  // Imposta saldo fisso a 50
  utente.storico.saldo = 50;

  utente.storico.push({
    azione: "bonus abbonamento",
    data: abbonamento.dataAbb,
    saldo: utente.storico.saldo
  });

  fs.writeFileSync(pathUtenti, JSON.stringify(utentiData, null, 2), "utf-8");
  console.log(`✅ Bonus applicato e file utenti aggiornato per ${nome} ${cognome}`);
}

module.exports = {
  getAbbonamentoDaCodice,
  applicaBonusAbbonamento
};
