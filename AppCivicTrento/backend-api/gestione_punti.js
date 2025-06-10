const fs = require("fs");
const path = require("path");

// Percorso al file utenti
const pathUtenti = path.join(__dirname, "data", "utenti_completo.json");

// Carica gli utenti
let utentiData = [];
try {
  const rawData = fs.readFileSync(pathUtenti, "utf-8");
  utentiData = JSON.parse(rawData);
  console.log("✔️ File utenti_completo.json caricato con successo.");
} catch (error) {
  console.error("❌ Errore nella lettura del file utenti:", error);
  process.exit(1);
}

// Funzione per aggiornare i saldi
function aggiornaSaldiDaStorico() {
  let utentiModificati = 0;

  utentiData.forEach(utente => {
    if (!Array.isArray(utente.storico)) return;

    let saldo = utente.saldo || 0;
    let modificato = false;
    console.log("Entrato")

    utente.storico.forEach(voce => {
      console.log(`👀 voce.azione=${voce.azione}, tipo daAggiungereAlSaldo=${typeof voce.daAggiungereAlSaldo}, valore=${voce.daAggiungereAlSaldo}`);
      if (voce.daAggiungereAlSaldo === true && typeof voce.saldo === "number") {
        console.log("✅ Entrato 2");
        saldo += voce.saldo;
        voce.daAggiungereAlSaldo = false;
        modificato = true;
      }
    });

    if (modificato) {
      utente.saldo = saldo;
      utentiModificati++;
      console.log(`✅ Saldo aggiornato per ${utente.nome} ${utente.cognome}: ${saldo}`);
    }
  });

  // Salva il file aggiornato
  fs.writeFileSync(pathUtenti, JSON.stringify(utentiData, null, 2), "utf-8");
  console.log(`💾 File utenti aggiornato. ${utentiModificati} saldo/i modificato/i.`);
}

module.exports = {
  aggiornaSaldiDaStorico
}