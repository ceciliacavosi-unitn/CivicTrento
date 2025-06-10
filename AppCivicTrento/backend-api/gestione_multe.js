const fs = require("fs");
const path = require("path");

// Percorso al file delle multe
const pathMulte = path.join(__dirname, "data", "multe_abitantiTN.json");
//const pathUtenti = path.join(__dirname, "data", "utenti_completo.json");

// Carica le multe
let multeData = [];
try {
  const rawData = fs.readFileSync(pathMulte, "utf-8");
  multeData = JSON.parse(rawData);
  console.log("✔️ File delle multe caricato con successo. Voci totali:", multeData.length);
} catch (error) {
  console.error("❌ Errore nella lettura del file delle multe:", error);
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

function applicaPenalitaMulte(nome, cognome, numeroPatente, utentiData) {
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
      entry.azione === "Penalita' Multa" &&
      entry.numeroPatente === numeroPatente &&
      entry.data === m.data
    );

    if (already) {
      // Imposta daAggiungereAlSaldo a false se esiste già
      const voceEsistente = utente.storico.find(entry =>
        entry.azione === "Penalita' Multa" &&
        entry.numeroPatente === numeroPatente &&
        entry.data === m.data
      );

      if (voceEsistente && voceEsistente.daAggiungereAlSaldo !== false) {
        voceEsistente.daAggiungereAlSaldo = false;
        console.log(`ℹ️ Penalità già presente: aggiornata daAggiungereAlSaldo a false per data ${m.data}.`);
      } else {
        console.log(`ℹ️ Penalità già presente e già processata per data ${m.data}.`);
      }

      return;
    }

    // Calcolo penalità per questa multa
    const saldoPenalita = (m.tipo === "grave") ? -200 : -40;

    // Inserimento nel storico con la data esatta della multa
    utente.storico.push({
      azione: "Penalita' Multa",
      data: m.data,
      numeroPatente,
      saldo: saldoPenalita,
      daAggiungereAlSaldo: true
    });

    console.log(`✅ Penalità ${saldoPenalita} inserita per multa del ${m.data}.`);
  });

  // Salva file utenti UNA SOLA VOLTA, dopo aver processato tutte le multe
  //fs.writeFileSync(pathUtenti, JSON.stringify(utentiData, null, 2), "utf-8");
  console.log(`✅ File utenti aggiornato per ${nome} ${cognome}`);
}


module.exports = {
  getMulteUtente,
  getMulteDaPatente,
  applicaPenalitaMulte
};